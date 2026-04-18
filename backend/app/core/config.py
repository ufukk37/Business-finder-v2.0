"""
Uygulama yapılandırması
"""

import os
from typing import Optional

# JWT ayarları
SECRET_KEY = os.getenv("SECRET_KEY", "bizfinder-super-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 gün

# API ayarları
API_PREFIX = "/api"
