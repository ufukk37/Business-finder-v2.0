import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap, Polygon } from 'react-leaflet';
import api from '../utils/api';
import {
  Search as SearchIcon,
  MapPin,
  Loader2,
  Navigation,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Trash2,
  PenTool
} from 'lucide-react';
import L from 'leaflet';

// Marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Türkiye şehirleri
const CITIES = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { name: 'İzmir', lat: 38.4237, lng: 27.1428 },
  { name: 'Bursa', lat: 40.1885, lng: 29.0610 },
  { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
  { name: 'Adana', lat: 37.0000, lng: 35.3213 },
  { name: 'Konya', lat: 37.8746, lng: 32.4932 },
  { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
  { name: 'Mersin', lat: 36.8121, lng: 34.6415 },
  { name: 'Kayseri', lat: 38.7312, lng: 35.4787 },
  { name: 'Eskişehir', lat: 39.7767, lng: 30.5206 },
  { name: 'Samsun', lat: 41.2867, lng: 36.3300 },
  { name: 'Denizli', lat: 37.7765, lng: 29.0864 },
  { name: 'Trabzon', lat: 41.0027, lng: 39.7168 },
  { name: 'Muğla', lat: 37.2153, lng: 28.3636 },
];

// İlçeler (popüler)
const DISTRICTS = {
  'İstanbul': ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Bakırköy', 'Fatih', 'Beyoğlu', 'Maltepe', 'Ataşehir', 'Kartal', 'Pendik', 'Sarıyer', 'Beykoz', 'Zeytinburnu', 'Eyüpsultan'],
  'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar'],
  'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Karabağlar', 'Narlıdere'],
  'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Gemlik', 'Mudanya', 'İnegöl'],
  'Antalya': ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Alanya', 'Manavgat', 'Serik'],
};

function LocationPicker({ position, setPosition, radius, drawMode, polygon, setPolygon }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      if (drawMode) {
        setPolygon([...polygon, [e.latlng.lat, e.latlng.lng]]);
      } else {
        setPosition([e.latlng.lat, e.latlng.lng]);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  return null;
}

function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);

  return null;
}

function Search() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [position, setPosition] = useState([41.0082, 28.9784]); // İstanbul default
  const [radius, setRadius] = useState(3000);
  const [maxResults, setMaxResults] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  
  // Polygon mode
  const [drawMode, setDrawMode] = useState(false);
  const [polygon, setPolygon] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/search/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Categories error:', error);
    }
  };

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setSelectedDistrict('');
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setPosition([city.lat, city.lng]);
      setMapCenter([city.lat, city.lng]);
    }
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    // Geocode district
    if (district && selectedCity) {
      geocodeLocation(`${district}, ${selectedCity}, Türkiye`);
    }
  };

  const geocodeLocation = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=tr`
      );
      const data = await response.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        setMapCenter([lat, lon]);
      }
    } catch (error) {
      console.error('Geocode error:', error);
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          setMapCenter(coords);
        },
        (error) => {
          alert('Konum alınamadı: ' + error.message);
        }
      );
    }
  };

  const handleSearch = async () => {
    if (!selectedCategory) {
      alert('Lütfen bir kategori seçin');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const searchData = {
        business_type: selectedCategory,
        radius: radius,
        max_results: maxResults
      };

      if (polygon.length >= 3) {
        searchData.polygon = polygon;
        searchData.latitude = polygon[0][0];
        searchData.longitude = polygon[0][1];
      } else {
        searchData.latitude = position[0];
        searchData.longitude = position[1];
      }

      const response = await api.post('/search/', searchData);
      setResult(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Arama sırasında bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearPolygon = () => {
    setPolygon([]);
    setDrawMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">İşletme Ara</h1>
        <p className="text-slate-600 mt-1">Harita üzerinden bölge seçin ve işletmeleri keşfedin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Map Toolbar */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMyLocation}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Konumum
                </button>
                <button
                  onClick={() => {
                    setDrawMode(!drawMode);
                    if (!drawMode) setPolygon([]);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    drawMode ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  Alan Çiz
                </button>
                {polygon.length > 0 && (
                  <button
                    onClick={clearPolygon}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Temizle
                  </button>
                )}
              </div>
              {drawMode && (
                <span className="text-sm text-blue-600">
                  Haritaya tıklayarak alan çizin ({polygon.length} nokta)
                </span>
              )}
            </div>

            {/* Map */}
            <div className="h-[400px] lg:h-[500px]">
              <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker
                  position={position}
                  setPosition={setPosition}
                  radius={radius}
                  drawMode={drawMode}
                  polygon={polygon}
                  setPolygon={setPolygon}
                />
                <MapController center={mapCenter} />
                
                {!drawMode && polygon.length === 0 && (
                  <>
                    <Marker position={position} />
                    <Circle
                      center={position}
                      radius={radius}
                      pathOptions={{
                        color: '#3b82f6',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.1
                      }}
                    />
                  </>
                )}
                
                {polygon.length > 0 && (
                  <Polygon
                    positions={polygon}
                    pathOptions={{
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.2
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Arama Kriterleri</h3>

            {/* City */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Şehir
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Şehir seçin</option>
                {CITIES.map(city => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>

            {/* District */}
            {selectedCity && DISTRICTS[selectedCity] && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  İlçe
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">İlçe seçin</option>
                  {DISTRICTS[selectedCity].map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Kategori *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Kategori seçin</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            {/* Radius */}
            {polygon.length === 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Yarıçap: {(radius / 1000).toFixed(1)} km
                </label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>500m</span>
                  <span>50km</span>
                </div>
              </div>
            )}

            {/* Max Results */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Maksimum Sonuç: {maxResults}
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>100</span>
                <span>5000</span>
              </div>
            </div>

            {/* Coordinates Info */}
            <div className="p-3 bg-slate-50 rounded-lg text-sm mb-4">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {polygon.length >= 3
                    ? `${polygon.length} noktalı alan seçildi`
                    : `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`
                  }
                </span>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !selectedCategory}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Aranıyor...
                </>
              ) : (
                <>
                  <SearchIcon className="w-5 h-5" />
                  Ara
                </>
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-xl ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'Arama Tamamlandı' : 'Hata'}
                  </p>
                  <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.success && (
                    <div className="mt-2 text-sm text-green-700">
                      <p>Toplam: {result.total_found} işletme bulundu</p>
                      <p>Yeni eklenen: {result.new_count}</p>
                      <p>Mükerrer: {result.duplicate_count}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
