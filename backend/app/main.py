"""
BizFinder - İşletme Keşif Platformu
Ana FastAPI uygulaması
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path
import os
import sys

from app.core.database import engine, Base
from app.api import search, businesses, exports, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Uygulama başlangıç ve kapanış işlemleri"""
    # Veritabanı tablolarını oluştur
    Base.metadata.create_all(bind=engine)
    print("Veritabani tablolari olusturuldu")
    yield
    print("Uygulama kapatiliyor...")


app = FastAPI(
    title="BizFinder API",
    description="İşletme keşif ve yönetim platformu API'si",
    version="2.0.0",
    lifespan=lifespan
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ekle
app.include_router(auth.router, prefix="/api/auth", tags=["Kimlik Doğrulama"])
app.include_router(search.router, prefix="/api/search", tags=["Arama"])
app.include_router(businesses.router, prefix="/api/businesses", tags=["İşletmeler"])
app.include_router(exports.router, prefix="/api/exports", tags=["Dışa Aktarım"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Frontend SPA Yönlendirmesi
if getattr(sys, 'frozen', False):
    # PyInstaller temp dizini
    base_dir = Path(sys._MEIPASS)
else:
    # Geliştirme ortamı (backend/app -> backend -> root)
    base_dir = Path(__file__).parent.parent.parent

frontend_dist = base_dir / "frontend" / "dist"

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    # API isteklerini veya docs/openapi yönlendirmelerini engelle
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
        
    # İstenen dosya mevcut mu kontrol et
    file_path = frontend_dist / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    
    # Mevcut değilse ve API isteği değilse, React Router için index.html dön
    index_path = frontend_dist / "index.html"
    if index_path.is_file():
        return FileResponse(index_path)
        
    return {"message": "Frontend not built or found", "path": str(frontend_dist)}
