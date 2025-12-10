import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Enum, Text
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    member = "member"


class UserStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    inactive = "inactive"


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 회사 상세 정보
    business_number = Column(String, nullable=True)  # 사업자등록번호
    representative = Column(String, nullable=True)  # 대표자명
    phone = Column(String, nullable=True)  # 전화번호
    address = Column(String, nullable=True)  # 주소

    users = relationship("User", back_populates="company")
    invitations = relationship("Invitation", back_populates="company")
    documents = relationship("Document", back_populates="company")
    files = relationship("CompanyFile", back_populates="company")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.member)
    status = Column(Enum(UserStatus), default=UserStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="users")
    invitations_sent = relationship("Invitation", back_populates="invited_by_user")
    documents = relationship("Document", back_populates="creator")
    uploaded_files = relationship("CompanyFile", back_populates="uploader")


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="invitations")
    invited_by_user = relationship("User", back_populates="invitations_sent")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False, default="새 문서")
    form_data = Column(JSON, default={})
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="documents")
    creator = relationship("User", back_populates="documents")


class CompanyFile(Base):
    """회사별 공유 서류 보관함"""
    __tablename__ = "company_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    file_type = Column(String, nullable=False)  # 법인등기부등본, 통장사본, 사업자등록증, 인감증명서
    file_name = Column(String, nullable=False)
    file_data = Column(Text, nullable=False)  # base64 인코딩된 파일 데이터
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="files")
    uploader = relationship("User", back_populates="uploaded_files")
