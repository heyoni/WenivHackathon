from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
import json

from app.database import get_db
from app.models import Document, User
from app.schemas import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse
from app.auth import get_current_user, decode_token

router = APIRouter(prefix="/api/documents", tags=["documents"])


# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        # document_id -> list of (websocket, user_info)
        self.active_connections: dict[str, list[tuple[WebSocket, dict]]] = {}

    async def connect(self, websocket: WebSocket, document_id: str, user: User):
        await websocket.accept()
        if document_id not in self.active_connections:
            self.active_connections[document_id] = []

        user_info = {"id": str(user.id), "name": user.name}

        # 같은 사용자의 기존 연결 제거 (새로고침, 재연결 시 중복 방지)
        self.active_connections[document_id] = [
            (ws, info) for ws, info in self.active_connections[document_id]
            if info["id"] != user_info["id"]
        ]

        self.active_connections[document_id].append((websocket, user_info))

        # 다른 사용자들에게 입장 알림
        await self.broadcast(document_id, {
            "type": "join",
            "user_id": str(user.id),
            "user_name": user.name,
            "online_users": self.get_online_users(document_id)
        }, exclude=websocket)

        # 본인에게 현재 접속자 목록 전송
        await websocket.send_json({
            "type": "init",
            "online_users": self.get_online_users(document_id)
        })

    def disconnect(self, websocket: WebSocket, document_id: str):
        if document_id in self.active_connections:
            user_info = None
            for conn, info in self.active_connections[document_id]:
                if conn == websocket:
                    user_info = info
                    break

            self.active_connections[document_id] = [
                (ws, info) for ws, info in self.active_connections[document_id]
                if ws != websocket
            ]

            if not self.active_connections[document_id]:
                del self.active_connections[document_id]

            return user_info
        return None

    def get_online_users(self, document_id: str) -> list:
        if document_id not in self.active_connections:
            return []
        # user_id 기준으로 중복 제거
        seen_ids = set()
        unique_users = []
        for _, info in self.active_connections[document_id]:
            if info["id"] not in seen_ids:
                seen_ids.add(info["id"])
                unique_users.append(info)
        return unique_users

    async def broadcast(self, document_id: str, message: dict, exclude: WebSocket = None):
        if document_id not in self.active_connections:
            return

        for websocket, _ in self.active_connections[document_id]:
            if websocket != exclude:
                try:
                    await websocket.send_json(message)
                except:
                    pass


manager = ConnectionManager()


# CRUD Endpoints
@router.post("", response_model=DocumentResponse)
def create_document(
    request: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """새 문서 생성"""
    document = Document(
        title=request.title,
        company_id=current_user.company_id,
        created_by=current_user.id,
        form_data={}
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("", response_model=List[DocumentListResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """내 회사의 문서 목록"""
    documents = db.query(Document).filter(
        Document.company_id == current_user.company_id
    ).order_by(Document.updated_at.desc()).all()
    return documents


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """문서 상세 조회"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return document


@router.patch("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: UUID,
    request: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """문서 업데이트"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if request.title is not None:
        document.title = request.title
    if request.form_data is not None:
        document.form_data = request.form_data

    document.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(document)
    return document


@router.delete("/{document_id}")
def delete_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """문서 삭제"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(document)
    db.commit()
    return {"message": "Document deleted"}


# WebSocket Endpoint
@router.websocket("/ws/{document_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    document_id: str,
    token: str = Query(...),
):
    """실시간 문서 편집 WebSocket"""
    db = next(get_db())

    try:
        # 토큰 검증
        payload = decode_token(token)
        if not payload:
            await websocket.close(code=4001)
            return

        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            await websocket.close(code=4001)
            return

        # 문서 접근 권한 확인
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document or document.company_id != user.company_id:
            await websocket.close(code=4003)
            return

        # 연결
        await manager.connect(websocket, document_id, user)

        try:
            while True:
                data = await websocket.receive_json()

                if data.get("type") == "update":
                    # 변경사항 DB에 저장
                    changes = data.get("changes", {})
                    if changes:
                        document = db.query(Document).filter(Document.id == document_id).first()
                        if document:
                            # 중요: 새 딕셔너리를 생성해야 SQLAlchemy가 변경을 감지함
                            current_form_data = dict(document.form_data or {})
                            current_form_data.update(changes)
                            document.form_data = current_form_data
                            flag_modified(document, "form_data")  # 명시적으로 변경 알림
                            document.updated_at = datetime.utcnow()
                            db.commit()

                    # 다른 클라이언트에게 브로드캐스트
                    await manager.broadcast(document_id, {
                        "type": "update",
                        "user_id": str(user.id),
                        "user_name": user.name,
                        "changes": changes
                    }, exclude=websocket)

                elif data.get("type") == "cursor":
                    # 커서 위치 브로드캐스트 (선택사항)
                    await manager.broadcast(document_id, {
                        "type": "cursor",
                        "user_id": str(user.id),
                        "user_name": user.name,
                        "field": data.get("field")
                    }, exclude=websocket)

        except WebSocketDisconnect:
            user_info = manager.disconnect(websocket, document_id)
            if user_info:
                await manager.broadcast(document_id, {
                    "type": "leave",
                    "user_id": user_info["id"],
                    "user_name": user_info["name"],
                    "online_users": manager.get_online_users(document_id)
                })

    finally:
        db.close()
