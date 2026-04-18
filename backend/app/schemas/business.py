"""
İşletme Pydantic şemaları
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


class SearchRequest(BaseModel):
    """Arama isteği"""
    location: Optional[str] = Field(None, min_length=2, max_length=500, description="Şehir, ilçe veya adres")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    business_type: str = Field(..., min_length=2, max_length=100, description="İşletme türü")
    radius: int = Field(5000, ge=100, le=50000, description="Arama yarıçapı (metre)")
    keyword: Optional[str] = Field(None, max_length=100, description="Ek anahtar kelime")
    max_results: int = Field(500, ge=1, le=5000, description="Maksimum sonuç sayısı")
    polygon: Optional[List[List[float]]] = Field(None, description="Polygon koordinatları [[lat, lng], ...]")
    
    @field_validator('location')
    @classmethod
    def validate_location(cls, v):
        if v:
            return v.strip()
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "location": "Kadıköy, İstanbul",
                "business_type": "restoran",
                "radius": 3000,
                "keyword": "deniz ürünleri",
                "max_results": 500
            }
        }


class BusinessResponse(BaseModel):
    """İşletme yanıtı"""
    id: int
    place_id: str
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    total_ratings: Optional[int] = None
    business_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BusinessUpdate(BaseModel):
    """İşletme güncelleme"""
    notes: Optional[str] = None
    tags: Optional[str] = None


class BusinessListResponse(BaseModel):
    """İşletme listesi yanıtı"""
    businesses: List[BusinessResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class SearchResponse(BaseModel):
    """Arama yanıtı"""
    success: bool
    message: str
    new_count: int
    duplicate_count: int
    total_found: int
    businesses: List[BusinessResponse]


class ExportRequest(BaseModel):
    """Dışa aktarım isteği"""
    format: str = Field("xlsx", pattern="^(xlsx|csv|json)$")
    business_ids: Optional[List[int]] = None
    filters: Optional[dict] = None


class StatsResponse(BaseModel):
    """İstatistik yanıtı"""
    total_businesses: int
    with_phone: int
    with_website: int
    avg_rating: Optional[float]
    by_city: dict
    by_category: dict
    recent_searches: int
