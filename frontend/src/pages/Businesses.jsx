import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Building2,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  Globe,
  Star,
  MapPin,
  X,
  FileSpreadsheet,
  FileText,
  FileJson,
  Loader2,
  Trash2
} from 'lucide-react';

function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    business_type: '',
    has_phone: false,
    has_website: false,
    min_rating: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, [pagination.page, filters]);

  useEffect(() => {
    extractFiltersData();
  }, []);

  const extractFiltersData = async () => {
    try {
      // Get stats which includes cities and categories
      const response = await api.get('/businesses/stats');
      if (response.data.by_city) {
        setCities(Object.keys(response.data.by_city));
      }
      if (response.data.by_category) {
        setCategories(Object.keys(response.data.by_category));
      }
    } catch (error) {
      console.error('Filter data error:', error);
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== false)
        )
      };

      const response = await api.get('/businesses/', { params });
      setBusinesses(response.data.businesses);
      setPagination({
        ...pagination,
        total: response.data.total,
        total_pages: response.data.total_pages
      });
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      business_type: '',
      has_phone: false,
      has_website: false,
      min_rating: ''
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    setExportMenuOpen(false);

    try {
      // Build query params from current filters
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.business_type) params.append('business_type', filters.business_type);
      if (filters.has_phone) params.append('has_phone', 'true');
      if (filters.has_website) params.append('has_website', 'true');
      if (filters.min_rating) params.append('min_rating', filters.min_rating);

      // Use window.open for direct download
      const baseUrl = import.meta.env.PROD ? 'http://localhost:8000' : '';
      window.open(`${baseUrl}/api/exports/download/${format}?${params.toString()}`, '_blank');
    } catch (error) {
      console.error('Export error:', error);
      alert('Dışa aktarım sırasında bir hata oluştu');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Tüm işletmeleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      await api.delete('/businesses/');
      fetchBusinesses();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi sırasında bir hata oluştu');
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">İşletmeler</h1>
          <p className="text-slate-600 mt-1">{pagination.total} kayıt bulundu</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={exportLoading || pagination.total === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Dışa Aktar
            </button>
            
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  CSV (.csv)
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FileJson className="w-4 h-4 text-amber-600" />
                  JSON (.json)
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Tümünü Sil
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="İşletme adı veya adres ara..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtreler
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tümü</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  value={filters.business_type}
                  onChange={(e) => handleFilterChange('business_type', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tümü</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min. Puan</label>
                <select
                  value={filters.min_rating}
                  onChange={(e) => handleFilterChange('min_rating', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tümü</option>
                  <option value="3">3+</option>
                  <option value="3.5">3.5+</option>
                  <option value="4">4+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.has_phone}
                    onChange={(e) => handleFilterChange('has_phone', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Telefonu Olanlar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.has_website}
                    onChange={(e) => handleFilterChange('has_website', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Websitesi Olanlar</span>
                </label>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Filtreleri Temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Business List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Building2 className="w-12 h-12 mb-3 text-slate-300" />
            <p>Henüz işletme kaydı yok</p>
            <Link to="/search" className="mt-2 text-blue-600 hover:underline">
              Arama yaparak ekleyin
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">İşletme</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 hidden md:table-cell">Şehir</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 hidden lg:table-cell">Kategori</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">İletişim</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-slate-600 hidden sm:table-cell">Puan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {businesses.map((business) => (
                    <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/businesses/${business.id}`}
                          className="font-medium text-slate-800 hover:text-blue-600"
                        >
                          {business.name}
                        </Link>
                        <p className="text-sm text-slate-500 mt-0.5 truncate max-w-xs">
                          {business.address || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-slate-600">{business.city || '-'}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-slate-600 capitalize">{business.business_type || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {business.phone && (
                            <a
                              href={`tel:${business.phone}`}
                              className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title={business.phone}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                          {business.website && (
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                              title={business.website}
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          {!business.phone && !business.website && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {business.rating ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Sayfa {pagination.page} / {pagination.total_pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.total_pages}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Businesses;
