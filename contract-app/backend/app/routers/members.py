import secrets
from datetime import datetime, timedelta
from uuid import UUID

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Invitation, UserRole, UserStatus, Company
from app.schemas import (
    InvitationCreate, InvitationResponse, AcceptInvitationRequest,
    UpdateUserStatus, UserResponse, MemberListResponse, CompanyUpdate, CompanyResponse
)
from app.auth import get_password_hash, get_current_admin, get_current_user

router = APIRouter(prefix="/api/members", tags=["members"])


@router.get("", response_model=MemberListResponse)
def get_members(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """회원 목록 조회 (관리자만)"""
    members = db.query(User).filter(
        User.company_id == current_user.company_id
    ).order_by(User.created_at.desc()).all()

    pending_count = sum(1 for m in members if m.status == UserStatus.pending)
    active_count = sum(1 for m in members if m.status == UserStatus.active)

    return MemberListResponse(
        members=members,
        pending_count=pending_count,
        active_count=active_count
    )


@router.patch("/{user_id}/status", response_model=UserResponse)
def update_member_status(
    user_id: UUID,
    request: UpdateUserStatus,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """회원 상태 변경 (승인/비활성화) - 관리자만"""
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == current_user.company_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own status"
        )

    user.status = request.status
    db.commit()
    db.refresh(user)
    return user


@router.post("/invite", response_model=InvitationResponse)
def create_invitation(
    request: InvitationCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """회원 초대 (관리자만)"""
    # 이미 가입된 이메일인지 확인
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 이미 초대된 이메일인지 확인
    existing_invitation = db.query(Invitation).filter(
        Invitation.email == request.email,
        Invitation.company_id == current_user.company_id,
        Invitation.used == False,
        Invitation.expires_at > datetime.utcnow()
    ).first()

    if existing_invitation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already sent to this email"
        )

    # 초대 생성
    token = secrets.token_urlsafe(32)
    invitation = Invitation(
        email=request.email,
        company_id=current_user.company_id,
        invited_by=current_user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    return invitation


@router.post("/accept-invitation", response_model=dict)
def accept_invitation(
    request: AcceptInvitationRequest,
    db: Session = Depends(get_db)
):
    """초대 수락 (비밀번호 설정)"""
    invitation = db.query(Invitation).filter(
        Invitation.token == request.token,
        Invitation.used == False
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired invitation"
        )

    if invitation.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has expired"
        )

    # 사용자 생성
    user = User(
        email=invitation.email,
        password=get_password_hash(request.password),
        name=request.name,
        company_id=invitation.company_id,
        role=UserRole.member,
        status=UserStatus.active  # 초대로 가입하면 바로 활성화
    )
    db.add(user)

    # 초대 사용 처리
    invitation.used = True
    db.commit()

    return {"message": "Account created successfully"}


@router.get("/invitations", response_model=List[InvitationResponse])
def get_invitations(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """초대 목록 조회 (관리자만)"""
    invitations = db.query(Invitation).filter(
        Invitation.company_id == current_user.company_id
    ).order_by(Invitation.created_at.desc()).all()

    return invitations


@router.delete("/invitations/{invitation_id}")
def delete_invitation(
    invitation_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """초대 취소 (관리자만)"""
    invitation = db.query(Invitation).filter(
        Invitation.id == invitation_id,
        Invitation.company_id == current_user.company_id
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    db.delete(invitation)
    db.commit()

    return {"message": "Invitation cancelled"}


@router.get("/company", response_model=CompanyResponse)
def get_company_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """회사 정보 조회"""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return company


@router.patch("/company", response_model=CompanyResponse)
def update_company_info(
    request: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """회사 정보 수정"""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    return company
