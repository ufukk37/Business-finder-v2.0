"""
Arama API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.business import Business
from app.models.user import User
from app.schemas.business import SearchRequest, SearchResponse, BusinessResponse
from app.services.osm_service import osm_service

router = APIRouter()

# Kategori listesi
CATEGORIES = [
    {"id": "restoran", "name": "Restoran", "icon": "🍽️"},
    {"id": "kafe", "name": "Kafe", "icon": "☕"},
    {"id": "bar", "name": "Bar/Pub", "icon": "🍺"},
    {"id": "pastane", "name": "Pastane/Fırın", "icon": "🥐"},
    {"id": "eczane", "name": "Eczane", "icon": "💊"},
    {"id": "hastane", "name": "Hastane/Klinik", "icon": "🏥"},
    {"id": "diş", "name": "Diş Kliniği", "icon": "🦷"},
    {"id": "veteriner", "name": "Veteriner", "icon": "🐾"},
    {"id": "kuaför", "name": "Kuaför/Berber", "icon": "💇"},
    {"id": "güzellik", "name": "Güzellik Salonu", "icon": "💅"},
    {"id": "spa", "name": "Spa/Masaj", "icon": "🧖"},
    {"id": "oto servis", "name": "Oto Servis", "icon": "🔧"},
    {"id": "benzin", "name": "Benzin İstasyonu", "icon": "⛽"},
    {"id": "lastik", "name": "Lastikçi", "icon": "🛞"},
    {"id": "market", "name": "Market/Süpermarket", "icon": "🛒"},
    {"id": "elektronik", "name": "Elektronik", "icon": "📱"},
    {"id": "giyim", "name": "Giyim Mağazası", "icon": "👕"},
    {"id": "mobilya", "name": "Mobilya", "icon": "🛋️"},
    {"id": "kırtasiye", "name": "Kırtasiye", "icon": "📚"},
    {"id": "spor", "name": "Spor Salonu", "icon": "🏋️"},
    {"id": "otel", "name": "Otel/Pansiyon", "icon": "🏨"},
    {"id": "banka", "name": "Banka", "icon": "🏦"},
    {"id": "avukat", "name": "Avukat/Hukuk", "icon": "⚖️"},
    {"id": "emlak", "name": "Emlak", "icon": "🏠"},
]


@router.get("/categories")
def get_categories():
    """Kategori listesini getir"""
    return CATEGORIES


@router.post("/", response_model=SearchResponse)
async def search_businesses(
    request: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """İşletme ara ve kaydet"""
    
    # Koordinatları al
    lat, lon = None, None
    
    if request.latitude and request.longitude:
        lat, lon = request.latitude, request.longitude
    elif request.location:
        coords = await osm_service.geocode(request.location)
        if coords:
            lat, lon = coords
        else:
            raise HTTPException(status_code=400, detail="Konum bulunamadı")
    elif request.polygon and len(request.polygon) >= 3:
        # Polygon'un merkezini hesapla
        lats = [p[0] for p in request.polygon]
        lons = [p[1] for p in request.polygon]
        lat = sum(lats) / len(lats)
        lon = sum(lons) / len(lons)
    else:
        raise HTTPException(status_code=400, detail="Konum belirtilmeli")
    
    # İşletmeleri ara
    found_businesses = await osm_service.search_businesses(
        latitude=lat,
        longitude=lon,
        business_type=request.business_type,
        radius=request.radius,
        max_results=request.max_results,
        polygon=request.polygon
    )
    
    # Veritabanına kaydet (mükerrer kontrolü ile)
    new_count = 0
    duplicate_count = 0
    saved_businesses = []
    
    for business_data in found_businesses:
        # Mükerrer kontrolü
        existing = db.query(Business).filter(
            Business.place_id == business_data["place_id"]
        ).first()
        
        if existing:
            duplicate_count += 1
            saved_businesses.append(existing)
        else:
            # Yeni kayıt
            new_business = Business(
                place_id=business_data["place_id"],
                name=business_data["name"],
                address=business_data.get("address"),
                city=business_data.get("city"),
                district=business_data.get("district"),
                phone=business_data.get("phone"),
                website=business_data.get("website"),
                rating=business_data.get("rating"),
                total_ratings=business_data.get("total_ratings", 0),
                business_type=business_data["business_type"],
                latitude=business_data.get("latitude"),
                longitude=business_data.get("longitude"),
                user_id=current_user.id if current_user else None
            )
            db.add(new_business)
            new_count += 1
            saved_businesses.append(new_business)
    
    db.commit()
    
    # Refresh all
    for b in saved_businesses:
        db.refresh(b)
    
    return SearchResponse(
        success=True,
        message=f"{new_count} yeni işletme eklendi, {duplicate_count} mükerrer atlandı",
        new_count=new_count,
        duplicate_count=duplicate_count,
        total_found=len(found_businesses),
        businesses=[BusinessResponse.model_validate(b) for b in saved_businesses[:100]]
    )
