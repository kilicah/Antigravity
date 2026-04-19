"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    if (password && password.length < 4) {
      setError("Şifre en az 4 karakter olmalıdır.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { password };

      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Şifreniz başarıyla güncellendi.");
        setPassword("");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Yükleniyor...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
          Güvenlik Ayarlarım
        </h1>
        <p className="text-sm text-slate-500 mt-1">Sisteme giriş şifrenizi buradan değiştirebilirsiniz. Diğer kişisel profil ayarları Yönetici tarafından yapılır.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white text-3xl font-black uppercase shadow-lg border-4 border-white">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.fullName ? user.fullName.substring(0,2).toUpperCase() : user?.username?.charAt(0) || "U"
              )}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-800">{user?.fullName || user?.username}</h2>
            <p className="text-slate-500 font-medium text-sm">@{user?.username}</p>
            <div className="mt-2">
              {user?.role === 'ADMIN' 
                ? <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded shadow-sm border border-amber-200">Sistem Yöneticisi</span>
                : <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded border border-slate-200">Normal Kullanıcı</span>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {message && <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-lg border border-emerald-100">{message}</div>}
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-100">{error}</div>}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Yeni Şifreniz</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
          </button>
        </form>
      </div>
    </div>
  );
}
