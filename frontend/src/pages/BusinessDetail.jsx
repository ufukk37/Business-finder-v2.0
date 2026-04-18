import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import {
  ArrowLeft,
  Phone,
  Globe,
  MapPin,
  Star,
  Tag,
  FileText,
  Save,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';

function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/businesses/${id}`);
      setBusiness(response.data);
      setNotes(response.data.notes || '');
      setTags(response.data.tags || '');
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 404) {
        navigate('/businesses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/businesses/${id}`, { notes, tags });
      setBusiness({ ...business, notes, tags });
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu işletmeyi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await api.delete(`/businesses/${id}`);
      navigate('/businesses');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi sırasında bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">İşletme bulunamadı</p>
        <Link to="/businesses" className="text-blue-600 hover:underline mt-2 inline-block">
          Geri dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{business.name}</h1>
          <p className="text-slate-600 mt-0.5 capitalize">{business.business_type}</p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Sil"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">İletişim Bilgileri</h3>
            
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Adres</p>
                  <p className="text-slate-800">{business.address || 'Belirtilmemiş'}</p>
                  {business.city && (
                    <p className="text-sm text-slate-600">
                      {business.district && `${business.district}, `}{business.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Telefon</p>
                  {business.phone ? (
                    <a
                      href={`tel:${business.phone}`}
                      className="text-slate-800 hover:text-blue-600"
                    >
                      {business.phone}
                    </a>
                  ) : (
                    <p className="text-slate-400">Belirtilmemiş</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Website</p>
                  {business.website ? (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {business.website.replace(/^https?:\/\//, '').substring(0, 40)}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <p className="text-slate-400">Belirtilmemiş</p>
                  )}
                </div>
              </div>

              {/* Rating */}
              {business.rating && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Puan</p>
                    <p className="text-slate-800">
                      {business.rating.toFixed(1)}
                      {business.total_ratings > 0 && (
                        <span className="text-slate-500 text-sm ml-1">
                          ({business.total_ratings} değerlendirme)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Preview */}
          {business.latitude && business.longitude && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Konum</h3>
              <div className="h-64 bg-slate-100 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.longitude - 0.01},${business.latitude - 0.01},${business.longitude + 0.01},${business.latitude + 0.01}&layer=mapnik&marker=${business.latitude},${business.longitude}`}
                  className="w-full h-full border-0"
                  title="Konum"
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Google Maps'te Aç
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Notlar
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bu işletme hakkında notlarınız..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-slate-600" />
              Etiketler
            </h3>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Etiketler (virgülle ayırın)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              Örnek: potansiyel, arandı, görüşüldü
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Kaydet
              </>
            )}
          </button>

          {/* Meta Info */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>ID: {business.place_id}</p>
            {business.created_at && (
              <p>Eklenme: {new Date(business.created_at).toLocaleDateString('tr-TR')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetail;
