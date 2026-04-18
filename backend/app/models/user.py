"""
Kullanıcı veritabanı modeli
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class User(Base):
    """Kullanıcı modeli"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    phone = Column(String(50))
    is_active = Column(Boolean, default=True)
    membership_type = Column(String(50), default="free")  # free, pro, enterprise
    
    # Tarihler
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Dictionary'ye çevir"""
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "company_name": self.company_name,
            "phone": self.phone,
            "is_active": self.is_active,
            "membership_type": self.membership_type,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
