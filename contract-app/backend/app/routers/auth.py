import secrets
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Company, User, UserRole, UserStatus
from app.schemas import SignUpRequest, JoinRequest, LoginRequest, Token, UserWithCompany
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


def generate_company_code() -> str:
    return secrets.token_hex(4).upper()


@router.post("/signup", response_model=Token)
def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    """회사 생성 + 관리자 계정 생성"""
    # 이메일 중복 체크
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 회사 생성
    company_code = generate_company_code()
    while db.query(Company).filter(Company.code == company_code).first():
        company_code = generate_company_code()

    company = Company(
        name=request.company_name,
        code=company_code
    )
    db.add(company)
    db.flush()

    # 관리자 계정 생성
    user = User(
        email=request.email,
        password=get_password_hash(request.password),
        name=request.name,
        company_id=company.id,
        role=UserRole.admin,
        status=UserStatus.active
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 토큰 발급
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token)


@router.post("/join", response_model=dict)
def join_company(request: JoinRequest, db: Session = Depends(get_db)):
    """회사 코드로 가입 신청 (관리자 승인 대기)"""
    # 이메일 중복 체크
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 회사 코드 확인
    company = db.query(Company).filter(Company.code == request.company_code).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # 가입 신청 (pending 상태)
    user = User(
        email=request.email,
        password=get_password_hash(request.password),
        name=request.name,
        company_id=company.id,
        role=UserRole.member,
        status=UserStatus.pending
    )
    db.add(user)
    db.commit()

    return {"message": "Join request submitted. Waiting for admin approval."}


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """로그인"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if user.status == UserStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending approval"
        )

    if user.status == UserStatus.inactive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token)


@router.get("/me", response_model=UserWithCompany)
def get_me(current_user: User = Depends(get_current_user)):
    """현재 로그인한 사용자 정보"""
    return current_user
