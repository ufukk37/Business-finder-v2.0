import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Building2,
  Phone,
  Globe,
  Star,
  TrendingUp,
  Search,
  MapPin,
  ArrowRight,
  Loader2
} from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/businesses/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam İşletme',
      value: stats?.total_businesses || 0,
      icon: Building2,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50'
    },
    {
      title: 'Telefonu Olan',
      value: stats?.with_phone || 0,
      icon: Phone,
      color: 'bg-green-500',
      lightColor: 'bg-green-50'
    },
    {
      title: 'Websitesi Olan',
      value: stats?.with_website || 0,
      icon: Globe,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50'
    },
    {
      title: 'Ortalama Puan',
      value: stats?.avg_rating ? stats.avg_rating.toFixed(1) : '-',
      icon: Star,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-1">İşletme keşif platformuna hoş geldiniz</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.lightColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CTA Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">Yeni Bir Pazar Keşfet</h3>
              <p className="text-blue-100 mt-2 text-sm">
                Harita üzerinden bölge seçerek potansiyel müşterilerinizi keşfedin.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                Aramaya Başla
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-white/80" />
            </div>
          </div>
        </div>

        {/* City Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Bölgesel Dağılım
          </h3>
          {stats?.by_city && Object.keys(stats.by_city).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.by_city).slice(0, 5).map(([city, count]) => (
                <div key={city} className="flex items-center justify-between">
                  <span className="text-slate-600">{city || 'Belirtilmemiş'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / stats.total_businesses) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-800 w-10 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Henüz veri yok</p>
          )}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">Popüler Kategoriler</h3>
        {stats?.by_category && Object.keys(stats.by_category).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(stats.by_category).slice(0, 10).map(([category, count]) => (
              <div
                key={category}
                className="p-3 bg-slate-50 rounded-lg text-center hover:bg-slate-100 transition-colors"
              >
                <p className="font-medium text-slate-800">{count}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{category}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Henüz veri yok. Arama yaparak işletme ekleyin.</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/search"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow transition-all"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-slate-800">Yeni Arama</p>
            <p className="text-xs text-slate-500">İşletme keşfet</p>
          </div>
        </Link>

        <Link
          to="/businesses"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow transition-all"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-slate-800">İşletmeler</p>
            <p className="text-xs text-slate-500">{stats?.total_businesses || 0} kayıt</p>
          </div>
        </Link>

        <Link
          to="/settings"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow transition-all"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-slate-800">Ayarlar</p>
            <p className="text-xs text-slate-500">Profil yönetimi</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
