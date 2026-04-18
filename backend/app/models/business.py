"""
İşletme veritabanı modeli
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Business(Base):
    """İşletme modeli"""
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(500), nullable=False)
    address = Column(Text)
    city = Column(String(100), index=True)
    district = Column(String(100))
    phone = Column(String(50))
    website = Column(String(500))
    rating = Column(Float)
    total_ratings = Column(Integer, default=0)
    business_type = Column(String(100), index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Kullanıcı eklentileri
    notes = Column(Text)
    tags = Column(String(500))
    
    # İlişkilendirme
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Tarihler
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Dictionary'ye çevir"""
        return {
            "id": self.id,
            "place_id": self.place_id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "district": self.district,
            "phone": self.phone,
            "website": self.website,
            "rating": self.rating,
            "total_ratings": self.total_ratings,
            "business_type": self.business_type,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "notes": self.notes,
            "tags": self.tags,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
