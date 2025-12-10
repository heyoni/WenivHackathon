from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, User, UserRole
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/employees", tags=["employees"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """관리자 권한 확인"""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.post("", response_model=EmployeeResponse)
def create_employee(
    request: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """직원 등록 (관리자만)"""
    employee = Employee(
        company_id=current_user.company_id,
        name=request.name,
        position=request.position,
        birth_date=request.birth_date,
        school=request.school,
        graduation_year=request.graduation_year,
        major=request.major,
        degree=request.degree
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.get("", response_model=List[EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """회사의 직원 목록 조회"""
    employees = db.query(Employee).filter(
        Employee.company_id == current_user.company_id
    ).order_by(Employee.name).all()
    return employees


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """직원 상세 조회"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if employee.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return employee


@router.patch("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: UUID,
    request: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """직원 정보 수정 (관리자만)"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if employee.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if request.name is not None:
        employee.name = request.name
    if request.position is not None:
        employee.position = request.position
    if request.birth_date is not None:
        employee.birth_date = request.birth_date
    if request.school is not None:
        employee.school = request.school
    if request.graduation_year is not None:
        employee.graduation_year = request.graduation_year
    if request.major is not None:
        employee.major = request.major
    if request.degree is not None:
        employee.degree = request.degree

    employee.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """직원 삭제 (관리자만)"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if employee.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted"}
