"""
İşletme Yönetimi API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.business import Business
from app.models.user import User
from app.schemas.business import (
    BusinessResponse, 
    BusinessUpdate, 
    BusinessListResponse,
    StatsResponse
)

router = APIRouter()


@router.get("/", response_model=BusinessListResponse)
def get_businesses(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    city: Optional[str] = None,
    business_type: Optional[str] = None,
    has_phone: Optional[bool] = None,
    has_website: Optional[bool] = None,
    min_rating: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """İşletme listesini getir (filtreli)"""
    query = db.query(Business)
    
    # Kullanıcı izolasyonu
    if current_user:
        query = query.filter(Business.user_id == current_user.id)
    else:
        query = query.filter(Business.user_id.is_(None))
        
    # Filtreler
    if city:
        query = query.filter(Business.city.ilike(f"%{city}%"))
    if business_type:
        query = query.filter(Business.business_type.ilike(f"%{business_type}%"))
    if has_phone:
        query = query.filter(Business.phone.isnot(None), Business.phone != "")
    if has_website:
        query = query.filter(Business.website.isnot(None), Business.website != "")
    if min_rating:
        query = query.filter(Business.rating >= min_rating)
    if search:
        query = query.filter(
            (Business.name.ilike(f"%{search}%")) |
            (Business.address.ilike(f"%{search}%"))
        )
    
    # Toplam sayı
    total = query.count()
    
    # Sayfalama
    total_pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page
    
    businesses = query.order_by(Business.created_at.desc()).offset(offset).limit(per_page).all()
    
    return BusinessListResponse(
        businesses=[BusinessResponse.model_validate(b) for b in businesses],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """İstatistikleri getir"""
    query = db.query(Business)
    if current_user:
        query = query.filter(Business.user_id == current_user.id)
    else:
        query = query.filter(Business.user_id.is_(None))
        
    total = query.count()
    
    with_phone = query.filter(
        Business.phone.isnot(None),
        Business.phone != ""
    ).count()
    
    with_website = query.filter(
        Business.website.isnot(None),
        Business.website != ""
    ).count()
    
    avg_rating = db.query(func.avg(Business.rating)).filter(
        Business.rating.isnot(None)
    )
    if current_user:
        avg_rating = avg_rating.filter(Business.user_id == current_user.id)
    else:
        avg_rating = avg_rating.filter(Business.user_id.is_(None))
    avg_rating = avg_rating.scalar()
    
    # Şehre göre dağılım
    city_stats_query = db.query(
        Business.city,
        func.count(Business.id)
    ).filter(
        Business.city.isnot(None),
        Business.city != ""
    )
    if current_user:
        city_stats_query = city_stats_query.filter(Business.user_id == current_user.id)
    else:
        city_stats_query = city_stats_query.filter(Business.user_id.is_(None))
        
    city_stats = city_stats_query.group_by(Business.city).order_by(func.count(Business.id).desc()).limit(10).all()
    
    by_city = {city: count for city, count in city_stats if city}
    
    # Kategoriye göre dağılım
    cat_stats_query = db.query(
        Business.business_type,
        func.count(Business.id)
    ).filter(
        Business.business_type.isnot(None)
    )
    if current_user:
        cat_stats_query = cat_stats_query.filter(Business.user_id == current_user.id)
    else:
        cat_stats_query = cat_stats_query.filter(Business.user_id.is_(None))
        
    category_stats = cat_stats_query.group_by(Business.business_type).order_by(func.count(Business.id).desc()).limit(10).all()
    
    by_category = {cat: count for cat, count in category_stats if cat}
    
    return StatsResponse(
        total_businesses=total,
        with_phone=with_phone,
        with_website=with_website,
        avg_rating=round(avg_rating, 2) if avg_rating else None,
        by_city=by_city,
        by_category=by_category,
        recent_searches=0
    )


@router.get("/all-ids")
def get_all_filtered_ids(
    city: Optional[str] = None,
    business_type: Optional[str] = None,
    has_phone: Optional[bool] = None,
    has_website: Optional[bool] = None,
    min_rating: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Filtrelenmiş tüm işletme ID'lerini getir (export için)"""
    query = db.query(Business.id)
    
    if current_user:
        query = query.filter(Business.user_id == current_user.id)
    else:
        query = query.filter(Business.user_id.is_(None))
    
    if city:
        query = query.filter(Business.city.ilike(f"%{city}%"))
    if business_type:
        query = query.filter(Business.business_type.ilike(f"%{business_type}%"))
    if has_phone:
        query = query.filter(Business.phone.isnot(None), Business.phone != "")
    if has_website:
        query = query.filter(Business.website.isnot(None), Business.website != "")
    if min_rating:
        query = query.filter(Business.rating >= min_rating)
    if search:
        query = query.filter(
            (Business.name.ilike(f"%{search}%")) |
            (Business.address.ilike(f"%{search}%"))
        )
    
    ids = [row[0] for row in query.all()]
    return {"ids": ids, "total": len(ids)}


@router.get("/{business_id}", response_model=BusinessResponse)
def get_business(business_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """Tek bir işletme detayı"""
    query = db.query(Business).filter(Business.id == business_id)
    if current_user:
        query = query.filter(Business.user_id == current_user.id)
    else:
        query = query.filter(Business.user_id.is_(None))
        
    business = query.first()
    if not business:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı")
    return business


@router.put("/{business_id}", response_model=BusinessResponse)
def update_business(
    business_id: int,
    update_data: BusinessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """İşletme güncelle"""
    query = db.query(Business).filter(Business.id == business_id)
    if current_user:
        query = query.filter(Business.user_id == current_user.id)
    else:
        query = query.filter(Business.user_id.is_(None))
        
    business = query.first()
    if not business:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı")
    
    if update_data.notes is not None:
        business.notes = update_data.notes
    if update_data.tags is not None:
        business.tags = update_data.tags
    
    db.commit()
    db.refresh(business)
    return business


@router.delete("/{business_id}")
def delete_business(business_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """İşletme sil"""
    query = db.query(Business).filter(Business.id == business_id)
    if current_user:
        query = query.filter(Business.user_id == current_user.id)
    else:
        query = query.filter(Business.user_id.is_(None))
        
    business = query.first()
    if not business:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı")
    
    db.delete(business)
    db.commit()
    return {"message": "İşletme silindi"}


@router.delete("/")
def delete_all_businesses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """Tüm işletmeleri sil"""
    query = db.query(Business)
    if current_user:
        query = query.filter(Business.user_id == current_user.id)
    else:
        query = query.filter(Business.user_id.is_(None))
        
    count = query.delete()
    db.commit()
    return {"message": f"{count} işletme silindi"}
