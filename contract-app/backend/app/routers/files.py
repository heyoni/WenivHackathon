from datetime import datetime
from typing import Dict, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CompanyFile, User
from app.schemas import CompanyFileUpload, CompanyFileResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("")
def get_company_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Optional[dict]]:
    """회사의 서류 보관함 조회"""
    files = db.query(CompanyFile).filter(
        CompanyFile.company_id == current_user.company_id
    ).all()

    # file_type별로 정리
    result = {
        "법인등기부등본": None,
        "통장사본": None,
        "사업자등록증": None,
        "인감증명서": None,
    }

    for f in files:
        if f.file_type in result:
            result[f.file_type] = {
                "id": str(f.id),
                "file_type": f.file_type,
                "file_name": f.file_name,
                "file_data": f.file_data,
                "uploaded_by": str(f.uploaded_by),
                "created_at": f.created_at.isoformat(),
                "updated_at": f.updated_at.isoformat(),
            }

    return result


@router.post("", response_model=CompanyFileResponse)
def upload_file(
    request: CompanyFileUpload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """서류 업로드 (기존 파일이 있으면 덮어씀)"""
    valid_types = ["법인등기부등본", "통장사본", "사업자등록증", "인감증명서"]
    if request.file_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Must be one of: {valid_types}"
        )

    # 기존 파일 확인
    existing = db.query(CompanyFile).filter(
        CompanyFile.company_id == current_user.company_id,
        CompanyFile.file_type == request.file_type
    ).first()

    if existing:
        # 기존 파일 업데이트
        existing.file_name = request.file_name
        existing.file_data = request.file_data
        existing.uploaded_by = current_user.id
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # 새 파일 생성
        new_file = CompanyFile(
            company_id=current_user.company_id,
            file_type=request.file_type,
            file_name=request.file_name,
            file_data=request.file_data,
            uploaded_by=current_user.id
        )
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        return new_file


@router.delete("/{file_type}")
def delete_file(
    file_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """서류 삭제"""
    file = db.query(CompanyFile).filter(
        CompanyFile.company_id == current_user.company_id,
        CompanyFile.file_type == file_type
    ).first()

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    db.delete(file)
    db.commit()
    return {"message": "File deleted"}
