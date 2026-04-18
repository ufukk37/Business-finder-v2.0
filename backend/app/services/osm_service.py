"""
OpenStreetMap / Nominatim API servisi
Ücretsiz işletme arama
"""

import httpx
import asyncio
from typing import List, Dict, Optional, Tuple
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Kategori eşleştirme - Türkçe ve İngilizce
CATEGORY_MAPPING = {
    # Yeme-içme
    "restoran": ["amenity=restaurant", "amenity=fast_food"],
    "restaurant": ["amenity=restaurant", "amenity=fast_food"],
    "kafe": ["amenity=cafe", "amenity=coffee_shop"],
    "cafe": ["amenity=cafe", "amenity=coffee_shop"],
    "kahve": ["amenity=cafe", "amenity=coffee_shop"],
    "bar": ["amenity=bar", "amenity=pub"],
    "pub": ["amenity=bar", "amenity=pub"],
    "pastane": ["shop=bakery", "shop=pastry"],
    "fırın": ["shop=bakery"],
    "bakery": ["shop=bakery", "shop=pastry"],
    
    # Sağlık
    "eczane": ["amenity=pharmacy"],
    "pharmacy": ["amenity=pharmacy"],
    "hastane": ["amenity=hospital", "amenity=clinic"],
    "hospital": ["amenity=hospital"],
    "klinik": ["amenity=clinic", "amenity=doctors"],
    "clinic": ["amenity=clinic", "amenity=doctors"],
    "doktor": ["amenity=doctors", "amenity=clinic"],
    "diş": ["amenity=dentist"],
    "dentist": ["amenity=dentist"],
    "dişçi": ["amenity=dentist"],
    "veteriner": ["amenity=veterinary"],
    "veterinary": ["amenity=veterinary"],
    "optik": ["shop=optician"],
    "gözlükçü": ["shop=optician"],
    
    # Güzellik & Bakım
    "kuaför": ["shop=hairdresser", "shop=beauty"],
    "hairdresser": ["shop=hairdresser"],
    "berber": ["shop=hairdresser"],
    "güzellik": ["shop=beauty", "shop=cosmetics"],
    "beauty": ["shop=beauty", "shop=cosmetics"],
    "spa": ["leisure=spa", "amenity=spa"],
    "masaj": ["shop=massage"],
    "massage": ["shop=massage"],
    
    # Otomotiv
    "oto": ["shop=car", "shop=car_repair", "shop=car_parts"],
    "oto servis": ["shop=car_repair"],
    "car repair": ["shop=car_repair"],
    "tamir": ["shop=car_repair"],
    "araba": ["shop=car", "shop=car_repair"],
    "car": ["shop=car", "shop=car_repair"],
    "benzin": ["amenity=fuel"],
    "fuel": ["amenity=fuel"],
    "akaryakıt": ["amenity=fuel"],
    "lastik": ["shop=tyres"],
    "tyres": ["shop=tyres"],
    "yıkama": ["amenity=car_wash"],
    "car wash": ["amenity=car_wash"],
    
    # Alışveriş
    "market": ["shop=supermarket", "shop=convenience"],
    "supermarket": ["shop=supermarket"],
    "süpermarket": ["shop=supermarket"],
    "bakkal": ["shop=convenience"],
    "convenience": ["shop=convenience"],
    "elektronik": ["shop=electronics"],
    "electronics": ["shop=electronics"],
    "giyim": ["shop=clothes", "shop=fashion"],
    "clothes": ["shop=clothes"],
    "kırtasiye": ["shop=stationery"],
    "stationery": ["shop=stationery"],
    "kitap": ["shop=books"],
    "books": ["shop=books"],
    "oyuncak": ["shop=toys"],
    "toys": ["shop=toys"],
    "mobilya": ["shop=furniture"],
    "furniture": ["shop=furniture"],
    "ayakkabı": ["shop=shoes"],
    "shoes": ["shop=shoes"],
    "takı": ["shop=jewelry"],
    "jewelry": ["shop=jewelry"],
    "kuyumcu": ["shop=jewelry"],
    "çiçek": ["shop=florist"],
    "florist": ["shop=florist"],
    "pet": ["shop=pet"],
    "evcil hayvan": ["shop=pet"],
    
    # Eğitim
    "okul": ["amenity=school"],
    "school": ["amenity=school"],
    "üniversite": ["amenity=university"],
    "university": ["amenity=university"],
    "kurs": ["amenity=training"],
    "eğitim": ["amenity=school", "amenity=training"],
    
    # Konaklama
    "otel": ["tourism=hotel", "tourism=hostel"],
    "hotel": ["tourism=hotel"],
    "pansiyon": ["tourism=guest_house"],
    "hostel": ["tourism=hostel"],
    
    # Spor & Eğlence
    "spor": ["leisure=sports_centre", "leisure=fitness_centre"],
    "gym": ["leisure=fitness_centre"],
    "fitness": ["leisure=fitness_centre"],
    "yüzme": ["leisure=swimming_pool"],
    "swimming": ["leisure=swimming_pool"],
    "sinema": ["amenity=cinema"],
    "cinema": ["amenity=cinema"],
    "tiyatro": ["amenity=theatre"],
    "theatre": ["amenity=theatre"],
    
    # Finans
    "banka": ["amenity=bank"],
    "bank": ["amenity=bank"],
    "atm": ["amenity=atm"],
    "sigorta": ["office=insurance"],
    "insurance": ["office=insurance"],
    
    # Diğer
    "avukat": ["office=lawyer"],
    "lawyer": ["office=lawyer"],
    "hukuk": ["office=lawyer"],
    "emlak": ["office=estate_agent"],
    "estate": ["office=estate_agent"],
    "temizlik": ["shop=dry_cleaning", "shop=laundry"],
    "laundry": ["shop=laundry"],
    "kargo": ["amenity=post_office", "office=courier"],
    "courier": ["office=courier"],
}


class OpenStreetMapService:
    """OpenStreetMap/Nominatim API servisi"""
    
    def __init__(self):
        self.nominatim_url = "https://nominatim.openstreetmap.org"
        self.overpass_url = "https://overpass-api.de/api/interpreter"
        self.headers = {
            "User-Agent": "BizFinder/2.0 (Business Discovery Platform)"
        }
    
    async def geocode(self, location: str) -> Optional[Tuple[float, float]]:
        """Lokasyonu koordinata çevir"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.nominatim_url}/search",
                    params={
                        "q": location,
                        "format": "json",
                        "limit": 1,
                        "countrycodes": "tr"
                    },
                    headers=self.headers,
                    timeout=30
                )
                data = response.json()
                if data:
                    return float(data[0]["lat"]), float(data[0]["lon"])
            except Exception as e:
                logger.error(f"Geocode hatası: {e}")
        return None
    
    def _get_osm_tags(self, business_type: str) -> List[str]:
        """İşletme türüne göre OSM tag'lerini al"""
        business_type_lower = business_type.lower().strip()
        
        # Direkt eşleşme
        if business_type_lower in CATEGORY_MAPPING:
            return CATEGORY_MAPPING[business_type_lower]
        
        # Kısmi eşleşme
        for key, tags in CATEGORY_MAPPING.items():
            if key in business_type_lower or business_type_lower in key:
                return tags
        
        # Kelime bazlı eşleşme
        words = business_type_lower.split()
        for word in words:
            if word in CATEGORY_MAPPING:
                return CATEGORY_MAPPING[word]
        
        # Varsayılan - genel arama
        return ["amenity", "shop", "office"]
    
    async def search_businesses(
        self,
        latitude: float,
        longitude: float,
        business_type: str,
        radius: int = 5000,
        max_results: int = 500,
        polygon: Optional[List[List[float]]] = None
    ) -> List[Dict]:
        """İşletmeleri ara"""
        results = []
        osm_tags = self._get_osm_tags(business_type)
        
        logger.info(f"Aranıyor: {business_type} -> Tags: {osm_tags}")
        
        # Overpass sorgusu oluştur
        if polygon and len(polygon) >= 3:
            # Polygon bazlı arama
            poly_str = " ".join([f"{p[0]} {p[1]}" for p in polygon])
            area_filter = f'(poly:"{poly_str}")'
        else:
            # Yarıçap bazlı arama
            area_filter = f'(around:{radius},{latitude},{longitude})'
        
        # Her tag için arama yap
        for tag in osm_tags[:2]:  # İlk 2 tag ile sınırla
            if "=" in tag:
                key, value = tag.split("=")
                query = f"""
                [out:json][timeout:60];
                (
                    node["{key}"="{value}"]{area_filter};
                    way["{key}"="{value}"]{area_filter};
                );
                out center {max_results};
                """
            else:
                query = f"""
                [out:json][timeout:60];
                (
                    node["{tag}"]{area_filter};
                    way["{tag}"]{area_filter};
                );
                out center {max_results};
                """
            
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        self.overpass_url,
                        data={"data": query},
                        headers=self.headers,
                        timeout=60
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        elements = data.get("elements", [])
                        
                        for element in elements:
                            business = self._parse_element(element, business_type)
                            if business and business["name"]:
                                results.append(business)
                        
                        logger.info(f"Tag '{tag}' için {len(elements)} sonuç bulundu")
                    
                    # Rate limiting
                    await asyncio.sleep(1)
                    
            except Exception as e:
                logger.error(f"Overpass sorgu hatası: {e}")
                continue
        
        # İsim bazlı fallback arama
        if len(results) < 10:
            logger.info("Fallback: İsim bazlı arama yapılıyor...")
            fallback_results = await self._search_by_name(
                latitude, longitude, business_type, radius, max_results
            )
            results.extend(fallback_results)
        
        # Mükerrer temizle
        seen_ids = set()
        unique_results = []
        for r in results:
            if r["place_id"] not in seen_ids:
                seen_ids.add(r["place_id"])
                unique_results.append(r)
        
        logger.info(f"Toplam {len(unique_results)} benzersiz sonuç bulundu")
        return unique_results[:max_results]
    
    async def _search_by_name(
        self,
        latitude: float,
        longitude: float,
        business_type: str,
        radius: int,
        max_results: int
    ) -> List[Dict]:
        """İsim bazlı arama (fallback)"""
        results = []
        
        query = f"""
        [out:json][timeout:60];
        (
            node["name"~"{business_type}",i](around:{radius},{latitude},{longitude});
            way["name"~"{business_type}",i](around:{radius},{latitude},{longitude});
        );
        out center {max_results};
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.overpass_url,
                    data={"data": query},
                    headers=self.headers,
                    timeout=60
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for element in data.get("elements", []):
                        business = self._parse_element(element, business_type)
                        if business and business["name"]:
                            results.append(business)
        except Exception as e:
            logger.error(f"Fallback arama hatası: {e}")
        
        return results
    
    def _parse_element(self, element: Dict, business_type: str) -> Optional[Dict]:
        """OSM elementini işletme formatına çevir"""
        tags = element.get("tags", {})
        
        # Koordinatları al
        if element["type"] == "way":
            center = element.get("center", {})
            lat = center.get("lat")
            lon = center.get("lon")
        else:
            lat = element.get("lat")
            lon = element.get("lon")
        
        if not lat or not lon:
            return None
        
        name = tags.get("name", tags.get("name:tr", ""))
        if not name:
            return None
        
        # Adresi oluştur
        address_parts = []
        if tags.get("addr:street"):
            if tags.get("addr:housenumber"):
                address_parts.append(f"{tags['addr:street']} No:{tags['addr:housenumber']}")
            else:
                address_parts.append(tags["addr:street"])
        if tags.get("addr:district"):
            address_parts.append(tags["addr:district"])
        if tags.get("addr:city"):
            address_parts.append(tags["addr:city"])
        
        address = ", ".join(address_parts) if address_parts else tags.get("addr:full", "")
        
        return {
            "place_id": f"osm_{element['type']}_{element['id']}",
            "name": name,
            "address": address,
            "city": tags.get("addr:city", ""),
            "district": tags.get("addr:district", tags.get("addr:suburb", "")),
            "phone": tags.get("phone", tags.get("contact:phone", "")),
            "website": tags.get("website", tags.get("contact:website", "")),
            "rating": None,
            "total_ratings": 0,
            "business_type": business_type,
            "latitude": lat,
            "longitude": lon
        }


# Singleton instance
osm_service = OpenStreetMapService()
