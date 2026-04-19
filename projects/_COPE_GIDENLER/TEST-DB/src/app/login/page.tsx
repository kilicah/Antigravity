"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!username) {
      setError("Şifre hatırlatması için önce Kullanıcı Adı kutusuna adınızı yazın.");
      return;
    }
    
    if (confirm(`${username} kullanıcısı için sistem yöneticisine şifre sıfırlama talebi gönderilecek. Onaylıyor musunuz?`)) {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (res.ok) {
          alert("Şifre sıfırlama talebiniz başarıyla yöneticiye iletildi.");
        } else {
          setError(data.error || "Talep iletilemedi.");
        }
      } catch (e) {
        setError("Sunucu hatası.");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Giriş başarısız oldu.");
      }

      // Başarılıysa ana sayfaya yönlendir
      router.push("/");
      router.refresh(); // Middleware'ın tetiklenmesi için
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decors */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative z-10">
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
             <img src="/us-logo.png" className="w-full h-full object-contain drop-shadow-xl" alt="US Logo" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">YUPPI</h1>
          <p className="text-slate-400 text-sm">Devam etmek için lütfen giriş yapın.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 focus:bg-white shadow-inner"
              placeholder="kullanici_adiniz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 focus:bg-white shadow-inner"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 focus:ring-indigo-500 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Sisteme Giriş Yap"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Giriş bilgilerinizi unuttuysanız{" "}
          <button 
            type="button"
            onClick={handleForgotPassword}
            className="text-indigo-400 font-bold hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            sistem yöneticisine talep gönderin.
          </button>
        </div>
      </div>
    </div>
  );
}
