"""
Kullanıcı Pydantic şemaları
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Kullanıcı oluşturma"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    company_name: Optional[str] = None
    phone: Optional[str] = None


class UserLogin(BaseModel):
    """Kullanıcı girişi"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Kullanıcı yanıtı"""
    id: int
    email: str
    full_name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    membership_type: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Kullanıcı güncelleme"""
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    """Şifre değiştirme"""
    current_password: str
    new_password: str = Field(..., min_length=6)


class Token(BaseModel):
    """Token yanıtı"""
    access_token: str
    token_type: str
    user: UserResponse
