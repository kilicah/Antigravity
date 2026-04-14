"use client";

import { useState, useEffect, useRef } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [assignedSellerId, setAssignedSellerId] = useState("");
  const [allowedCompanyIds, setAllowedCompanyIds] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async () => {
    try {
      const [resUsers, resCompanies] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/companies")
      ]);
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resCompanies.ok) setCompanies(await resCompanies.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openNewUserModal = () => {
    setEditingUser(null);
    setUsername("");
    setPassword("");
    setRole("USER");
    setFullName("");
    setAvatar("");
    setEmail("");
    setPhone("");
    setAssignedSellerId("");
    setAllowedCompanyIds([]);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(""); // Şifreyi boş getir
    setRole(user.role);
    setFullName(user.fullName || "");
    setAvatar(user.avatar || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAssignedSellerId(user.assignedSellerId?.toString() || "");
    setAllowedCompanyIds(user.allowedCompanies?.map((c: any) => c.id.toString()) || []);
    setError("");
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Lütfen sadece resim dosyası yükleyin.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        let width = img.width;
        let height = img.height;
        const max_size = 250;
        
        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }
        
        canvas.width = max_size;
        canvas.height = max_size;
        
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, max_size, max_size);
          const offsetX = (max_size - width) / 2;
          const offsetY = (max_size - height) / 2;
          ctx.drawImage(img, offsetX, offsetY, width, height);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setAvatar(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!editingUser && !password) {
      setError("Yeni kullanıcı oluştururken şifre zorunludur.");
      return;
    }

    try {
      if (editingUser) {
        // UPDATE
        const payload: any = { role, fullName, avatar, email, phone, assignedSellerId, allowedCompanyIds };
        if (password.trim() !== "") payload.password = password;

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      } else {
        // CREATE
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role, fullName, avatar, email, phone, assignedSellerId, allowedCompanyIds }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    }
  };

  const toggleStatus = async (user: any) => {
    if (user.role === 'ADMIN' && user.isActive) {
      const isSure = window.confirm("Dikkat: Bir yöneticinin hesabını pasife çekiyorsunuz. Emin misiniz?");
      if(!isSure) return;
    }
    
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Yükleniyor...</div>;

  return (
    <div className="w-full h-full flex flex-col pt-2">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md shadow-sm border-b border-slate-200 flex justify-between items-center pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
            Kullanıcı Profilleri
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tüm kullanıcı profillerini, isimlerini ve resimlerini buradan yönetin.</p>
        </div>
        <button 
          onClick={openNewUserModal}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:-translate-y-0.5"
        >
          <span className="mr-2 text-lg leading-none">+</span> Yeni Kullanıcı
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200/60">
              <th className="py-4 px-6 font-semibold w-16">Profil</th>
              <th className="py-4 px-6 font-semibold">Kullanıcı (Kısa Ad)</th>
              <th className="py-4 px-6 font-semibold">İsim Soyisim</th>
              <th className="py-4 px-6 font-semibold">Yetki Tipi</th>
              <th className="py-4 px-6 font-semibold">Durum</th>
              <th className="py-4 px-6 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600 font-black shadow-sm">
                    {u.avatar ? (
                      <img src={u.avatar} className="w-full h-full object-cover" alt="Avatar"/>
                    ) : (
                      u.fullName ? u.fullName.substring(0,2).toUpperCase() : u.username.charAt(0).toUpperCase()
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-800 text-sm">@{u.username}</div>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-slate-700">
                  {u.fullName || <span className="text-slate-400 italic">Belirtilmemiş</span>}
                </td>
                <td className="py-4 px-6">
                  {u.role === 'ADMIN' 
                      ? <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded shadow-sm border border-amber-200">Yönetici</span>
                      : u.role === 'SUPERVISOR'
                      ? <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold rounded shadow-sm border border-blue-200">Yetkili</span>
                      : <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded border border-slate-200">Kullanıcı</span>}
                </td>
                <td className="py-4 px-6">
                  <button 
                    onClick={() => toggleStatus(u)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                      u.isActive 
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                    {u.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => openEditModal(u)}
                    className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm transition-colors"
                  >
                    Profili Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Oluştur'}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{error}</div>}
              
              <div className="flex flex-col items-center justify-center gap-2 mb-4">
                 <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm flex justify-center items-center font-bold text-slate-400 group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Preview"/> : 'Foto'}
                   <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-center px-1">
                      Resim Değiştir
                   </div>
                 </div>
                 <button type="button" onClick={() => setAvatar("")} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Fotoğrafı Kaldır</button>
                 <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kullanıcı (Kısa Ad)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!!editingUser}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-300 text-slate-900'}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {editingUser ? 'Yeni Şifre' : 'Şifre *'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Bırakırsanız değişmez' : 'Sisteme giriş şifresi'}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-Posta Adresi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Örn: isim@sirket.com"
                    className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900 border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telefon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Örn: +90 5xx xxx xx xx"
                    className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900 border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gerçek İsim Soyisim</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Mehmet Aydın"
                  className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900 border-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sistem Yetkisi</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USER">Sadece İzleyici (Filtrelenmiş Veri)</option>
                    <option value="SUPERVISOR">Yetkili Kullanıcı (Silme Hariç)</option>
                    <option value="ADMIN">Sistem Yöneticisi (Limitsiz)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Satıcı Bağlantısı</label>
                  <select
                    value={assignedSellerId}
                    onChange={(e) => setAssignedSellerId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Herhangi Biri --</option>
                    {companies.filter(c => c.isSeller).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {role === 'USER' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Erişebildiği Firmalar ve Markalar (Veri İzolasyonu)</label>
                  <p className="text-[11px] text-slate-500 mb-3">Bu kullanıcı sadece buradaki seçili firmaların (Müşteri, Sevk, Marka) verilerini ve siparişlerini görebilir.</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded-lg p-2">
                    {companies.filter(c => !c.isSeller).map(c => (
                      <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowedCompanyIds.includes(c.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) setAllowedCompanyIds([...allowedCompanyIds, c.id.toString()]);
                            else setAllowedCompanyIds(allowedCompanyIds.filter(id => id !== c.id.toString()));
                          }}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-slate-700">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  {editingUser ? 'Değişiklikleri Kaydet' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
