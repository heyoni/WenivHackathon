from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from app.models import UserRole, UserStatus


# Company
class CompanyBase(BaseModel):
    name: str


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    business_number: Optional[str] = None
    representative: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class CompanyResponse(CompanyBase):
    id: UUID
    code: str
    created_at: datetime
    business_number: Optional[str] = None
    representative: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


# User
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: UUID
    company_id: UUID
    role: UserRole
    status: UserStatus
    created_at: datetime

    class Config:
        from_attributes = True


class UserWithCompany(UserResponse):
    company: CompanyResponse


# Auth
class SignUpRequest(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    name: str


class JoinRequest(BaseModel):
    company_code: str
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[UUID] = None


# Invitation
class InvitationCreate(BaseModel):
    email: EmailStr


class InvitationResponse(BaseModel):
    id: UUID
    email: str
    token: str
    expires_at: datetime
    used: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AcceptInvitationRequest(BaseModel):
    token: str
    password: str
    name: str


# Member management
class UpdateUserStatus(BaseModel):
    status: UserStatus


class MemberListResponse(BaseModel):
    members: List[UserResponse]
    pending_count: int
    active_count: int


# Document
class DocumentCreate(BaseModel):
    title: str = "새 문서"


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    form_data: Optional[dict] = None


class DocumentResponse(BaseModel):
    id: UUID
    company_id: UUID
    title: str
    form_data: dict
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    id: UUID
    title: str
    form_data: Optional[dict] = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# WebSocket messages
class WSMessage(BaseModel):
    type: str  # "update", "cursor", "join", "leave"
    user_id: Optional[UUID] = None
    user_name: Optional[str] = None
    changes: Optional[dict] = None


# Company Files (서류 보관함)
class CompanyFileUpload(BaseModel):
    file_type: str  # 법인등기부등본, 통장사본, 사업자등록증, 인감증명서
    file_name: str
    file_data: str  # base64 인코딩된 파일


class CompanyFileResponse(BaseModel):
    id: UUID
    file_type: str
    file_name: str
    file_data: str
    uploaded_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyFilesListResponse(BaseModel):
    files: dict  # { "법인등기부등본": CompanyFileResponse, ... }


# Employee (직원 관리) - 성명, 직급, 학력만 관리
class EmployeeCreate(BaseModel):
    name: str
    position: Optional[str] = None
    birth_date: Optional[str] = None
    school: Optional[str] = None
    graduation_year: Optional[str] = None
    major: Optional[str] = None
    degree: Optional[str] = None


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    birth_date: Optional[str] = None
    school: Optional[str] = None
    graduation_year: Optional[str] = None
    major: Optional[str] = None
    degree: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: UUID
    company_id: UUID
    name: str
    position: Optional[str] = None
    birth_date: Optional[str] = None
    school: Optional[str] = None
    graduation_year: Optional[str] = None
    major: Optional[str] = None
    degree: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
