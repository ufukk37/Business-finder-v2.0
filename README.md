# BizFinder - İşletme Keşif Platformu

B2B satış destek aracı - Potansiyel müşterileri otomatik keşfedin.

## 🚀 Özellikler

- ✅ **Kullanıcı Sistemi**: Kayıt/Giriş
- ✅ **Modern Dashboard**: İstatistikler ve hızlı erişim
- ✅ **Harita Tabanlı Arama**: Leaflet harita, yarıçap seçimi
- ✅ **Polygon Çizimi**: Harita üzerinden alan seçimi
- ✅ **Ön Tanımlı Lokasyonlar**: Türkiye şehirleri ve ilçeleri
- ✅ **Kategori Bazlı Arama**: 20+ işletme kategorisi
- ✅ **Mükerrer Kayıt Engelleme**: Aynı işletme tekrar eklenmez
- ✅ **Filtrelenmiş Excel İndirme**: Sadece seçili veriler
- ✅ **Dinamik Arama Limiti**: 100 - 5000 arası
- ✅ **Ücretsiz API**: OpenStreetMap/Nominatim (Google gerektirmez)
- 🆕 **Tek Dosya Çalıştırılabilir (.exe)**: Program artık kurulum gerektirmeden tek tıkla çalıştırılabilir.

  <img width="1892" height="857" alt="BizFinder" src="https://github.com/user-attachments/assets/aa1e6c63-5a53-431e-8a78-3a7206d18f32" />


  <img width="1892" height="862" alt="BizFinder1" src="https://github.com/user-attachments/assets/74edcc70-31f0-4ced-9445-96d2f33f92eb" />

  


## 📦 Kurulum ve Çalıştırma

### Yöntem 1: Tek Tıkla Çalıştırma (Önerilen)

Projenin son halinde backend ve frontend birleştirilmiş olup, tek bir `.exe` uygulaması olarak paketlenmiştir. Bu sayede hiçbir ek kurulum gerektirmeden çalıştırılabilir.
Veritabanı dosyası (`business_finder.db`) uygulamanın bulunduğu dizine kaydedilir, böylece verileriniz kalıcı olur.

1. `dist/BizFinder.exe` dosyasına çift tıklayın.
2. Uygulama başlayacak ve tarayıcınızda otomatik olarak `http://127.0.0.1:8000` adresinde açılacaktır.

### Yöntem 2: Geliştirici Ortamı (Kaynak Koddan)

**1. Backend Kurulumu**
```cmd
cd business-finder\backend

# Virtual environment oluştur
python -m venv venv

# Aktive et (Windows)
venv\Scripts\activate

# Paketleri yükle
pip install -r requirements.txt
```

**2. Frontend Kurulumu**
```cmd
cd business-finder\frontend

# Paketleri yükle
npm install
```

**Çalıştırma:**

Terminal 1 - Backend:
```cmd
cd business-finder\backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload
```
Backend API: `http://localhost:8000`

Terminal 2 - Frontend:
```cmd
cd business-finder\frontend
npm run dev
```
Frontend URL: `http://localhost:5173`

## 🛠️ Uygulamayı `.exe` Olarak Paketleme (Build)

Projeyi kendiniz derleyip `.exe` haline getirmek isterseniz:

1. Önce Frontend kodunu derleyin:
```cmd
cd business-finder\frontend
npm run build
```

2. Ana dizine dönün ve PyInstaller'ı kullanın:
```cmd
cd ..
pip install pyinstaller
pyinstaller BizFinder.spec
```

İşlem tamamlandığında `dist` klasörü içerisinde `BizFinder.exe` dosyanız oluşacaktır.

## 📖 Kullanım

1. Uygulamayı çalıştırdıktan sonra (veya geliştirici modunda ilgili adrese girdikten sonra), **Kayıt Ol** ile yeni hesap oluşturun.
2. Dashboard'dan **Arama** sayfasına gidin.
3. Şehir ve kategori seçin, veya haritadan konum ve alan (polygon/yarıçap) belirleyin.
4. **Ara** butonuna tıklayın.
5. **İşletmeler** sayfasından filtreleme yaparak sonuçları inceleyin ve Excel formatında aktarın.

## 📁 Proje Yapısı

```
business-finder/
├── backend/            # FastAPI arka uç uygulaması
├── frontend/           # React ön uç uygulaması
├── build/              # PyInstaller geçici build dosyaları
├── dist/               # Paketlenmiş nihai .exe klasörü
├── BizFinder.spec      # PyInstaller paketleme konfigürasyonu
├── main_app.py         # .exe sürümü için FastAPI & Static file sunucu başlangıç noktası
└── README.md           # Proje belgelendirmesi
```

