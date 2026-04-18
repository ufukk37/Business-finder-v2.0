"""
Veritabanı bağlantı yapılandırması - SQLite
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

import sys
from pathlib import Path

# Veritabanı dosyası yolu
if getattr(sys, 'frozen', False):
    # PyInstaller ile paketlendiğinde, kalıcı olması için AppData klasörünü kullan
    appdata_dir = os.environ.get('APPDATA') or os.path.expanduser('~')
    BASE_DIR = os.path.join(appdata_dir, 'BizFinder')
    os.makedirs(BASE_DIR, exist_ok=True)
else:
    # Geliştirme ortamında
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'business_finder.db')}"

# Engine oluştur
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class
Base = declarative_base()


def get_db():
    """Veritabanı oturumu sağlayıcı"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
