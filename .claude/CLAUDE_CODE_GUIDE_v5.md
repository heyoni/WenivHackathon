# 실시간 공동 편집 기능 구현 가이드

## 목표
여러 사용자가 동시에 같은 계약 문서를 편집하고, 변경사항이 실시간으로 모든 사용자에게 반영되도록 구현

## 기술 스택 선택

### WebSocket (FastAPI + React)
- **백엔드**: FastAPI WebSocket
- **프론트엔드**: React + native WebSocket 또는 socket.io-client
- **상태 동기화**: 간단한 JSON patch 방식 또는 CRDT/OT 알고리즘

## 구현 단계

### 1단계: 문서 모델 추가 (DB)
```python
# models.py에 추가
class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID, ForeignKey("companies.id"))
    title = Column(String)  # 예: "2025년 용역 계약"
    form_data = Column(JSON)  # 현재 프론트엔드의 formData 저장
    created_by = Column(UUID, ForeignKey("users.id"))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
```

### 2단계: WebSocket 엔드포인트 (백엔드)
```python
# routers/documents.py
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        # document_id -> list of websockets
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, document_id: str):
        await websocket.accept()
        if document_id not in self.active_connections:
            self.active_connections[document_id] = []
        self.active_connections[document_id].append(websocket)

    async def broadcast(self, document_id: str, message: dict, exclude: WebSocket = None):
        for connection in self.active_connections.get(document_id, []):
            if connection != exclude:
                await connection.send_json(message)

@router.websocket("/ws/document/{document_id}")
async def websocket_endpoint(websocket: WebSocket, document_id: str):
    await manager.connect(websocket, document_id)
    try:
        while True:
            data = await websocket.receive_json()
            # 변경사항을 DB에 저장
            # 다른 클라이언트에게 브로드캐스트
            await manager.broadcast(document_id, data, exclude=websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, document_id)
```

### 3단계: 프론트엔드 WebSocket 훅
```javascript
// hooks/useDocumentSync.js
function useDocumentSync(documentId) {
    const [formData, setFormData] = useState({});
    const wsRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/document/${documentId}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setFormData(prev => ({ ...prev, ...data.changes }));
        };

        wsRef.current = ws;
        return () => ws.close();
    }, [documentId]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        wsRef.current?.send(JSON.stringify({
            type: 'update',
            changes: { [field]: value }
        }));
    };

    return { formData, updateField };
}
```

### 4단계: 문서 CRUD API
- `POST /api/documents` - 새 문서 생성
- `GET /api/documents` - 내 회사 문서 목록
- `GET /api/documents/{id}` - 문서 상세 조회
- `DELETE /api/documents/{id}` - 문서 삭제

### 5단계: UI 변경
- 문서 목록 페이지 추가
- 문서 선택 후 편집 화면으로 이동
- 접속 중인 사용자 표시 (선택사항)

## 파일 변경 목록

### 백엔드
1. `app/models.py` - Document 모델 추가
2. `app/schemas.py` - Document 스키마 추가
3. `app/routers/documents.py` - 새 파일 (CRUD + WebSocket)
4. `app/main.py` - router 등록
5. DB 마이그레이션 (테이블 생성)

### 프론트엔드
1. `src/hooks/useDocumentSync.js` - 새 파일
2. `src/pages/DocumentListPage.jsx` - 새 파일
3. `src/App.jsx` - useDocumentSync 훅 연동
4. `src/main.jsx` - 라우팅 추가
5. `src/api/client.js` - documents API 추가

## 예상 소요 작업
- 백엔드 구현
- 프론트엔드 구현
- 테스트

## 주의사항
- 동시 편집 충돌 처리 (Last Write Wins 방식으로 간단히 처리)
- WebSocket 재연결 로직
- 인증된 사용자만 문서 접근 가능하도록

---

## 승인 요청
위 계획대로 진행해도 될까요?
