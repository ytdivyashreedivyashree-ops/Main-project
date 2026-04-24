import { useEffect, useState, useRef } from "react";
import { getMe, updateProfile, uploadProfilePicture, removeProfilePicture } from "../services/userService";

const card = { backgroundColor: "#0f1829", borderRadius: "1.25rem", border: "1px solid rgba(77,142,255,0.1)" };
const inputStyle = {
  backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.4)",
  color: "#dae2fd", borderRadius: "0.75rem", padding: "0.75rem 1rem",
  outline: "none", fontSize: "0.875rem", width: "100%",
};
const onFocus = (e) => e.target.style.border = "1px solid #4d8eff";
const onBlur = (e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const fileRef = useRef();
  const role = localStorage.getItem("role");

  useEffect(() => {
    getMe().then((r) => {
      setUser(r.data);
      setForm({ name: r.data.name || "", phone: r.data.phone || "", bio: r.data.bio || "" });
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await updateProfile(form);
      setUser(r.data);
      setEditMode(false);
    } catch { alert("Failed to save profile"); }
    finally { setSaving(false); }
  };

  const handlePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // reset input so same file can be re-selected after removal
    e.target.value = "";
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const r = await uploadProfilePicture(fd);
      setUser(r.data);
    } catch { alert("Failed to upload picture"); }
    finally { setUploading(false); }
  };

  const handleRemovePicture = async () => {
    setRemoving(true);
    try {
      const r = await removeProfilePicture();
      setUser(r.data);
    } catch { alert("Failed to remove photo"); }
    finally { setRemoving(false); }
  };

  const roleColor = role === "TEACHER"
    ? "linear-gradient(135deg,#a855f7,#7c3aed)"
    : "linear-gradient(135deg,#22c55e,#16a34a)";

  const roleBadge = role === "TEACHER"
    ? { backgroundColor: "rgba(168,85,247,0.1)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.2)" }
    : { backgroundColor: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" };

  if (!user) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500">Loading profile...</p>
    </div>
  );

  return (
    <div className="space-y-6 py-6 max-w-2xl" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Manrope", background: "linear-gradient(135deg,#adc6ff,#4d8eff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          My Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Profile card */}
      <div style={card} className="p-6">

        {/* Avatar + photo actions */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.profilePicUrl ? (
              <img src={user.profilePicUrl} alt="profile"
                className="w-24 h-24 rounded-full object-cover"
                style={{ border: "3px solid rgba(77,142,255,0.3)" }} />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black"
                style={{ background: roleColor, border: "3px solid rgba(77,142,255,0.2)" }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + role + photo buttons */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-xl font-extrabold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>{user.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center sm:justify-start">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={roleBadge}>{user.role}</span>
              {user.courseName && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>
                  {user.courseName}
                </span>
              )}
            </div>

            {/* Photo action buttons */}
            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center sm:justify-start">
              {user.profilePicUrl ? (
                <>
                  {/* Change Photo */}
                  <button onClick={() => fileRef.current.click()} disabled={uploading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", opacity: uploading ? 0.7 : 1 }}>
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    {uploading ? "Uploading..." : "Change Photo"}
                  </button>

                  {/* Remove Photo */}
                  <button onClick={handleRemovePicture} disabled={removing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-red-500/15"
                    style={{ backgroundColor: "rgba(255,180,171,0.06)", color: "#ffb4ab", border: "1px solid rgba(255,180,171,0.15)", opacity: removing ? 0.7 : 1 }}>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    {removing ? "Removing..." : "Remove Photo"}
                  </button>
                </>
              ) : (
                /* Upload Photo — shown when no photo */
                <button onClick={() => fileRef.current.click()} disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", opacity: uploading ? 0.7 : 1 }}>
                  <span className="material-symbols-outlined text-sm">upload</span>
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              )}

              {/* hidden file input */}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicture} />
            </div>
          </div>

          {/* Edit profile button */}
          {!editMode && (
            <button onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 self-start"
              style={{ backgroundColor: "rgba(77,142,255,0.08)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>
              <span className="material-symbols-outlined text-base">edit</span>
              Edit
            </button>
          )}
        </div>

        {/* Bio + phone display */}
        {!editMode && (user.bio || user.phone) && (
          <div className="mt-5 pt-4 space-y-2" style={{ borderTop: "1px solid rgba(77,142,255,0.06)" }}>
            {user.phone && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-slate-600">phone</span>
                <span className="text-sm text-slate-400">{user.phone}</span>
              </div>
            )}
            {user.bio && (
              <p className="text-sm leading-relaxed" style={{ color: "#8c909f" }}>{user.bio}</p>
            )}
          </div>
        )}
      </div>

      {/* Edit form */}
      {editMode && (
        <div style={card} className="p-6">
          <h3 className="text-base font-bold mb-4" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>Edit Profile</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
              <input type="tel" placeholder="e.g. +91 9876543210" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {role === "TEACHER" ? "About / Expertise" : "About Me"}
              </label>
              <textarea
                placeholder={role === "TEACHER" ? "e.g. 5 years experience in AI..." : "e.g. Passionate about learning..."}
                value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3} style={{ ...inputStyle, resize: "vertical" }} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 font-bold rounded-xl transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button"
                onClick={() => { setEditMode(false); setForm({ name: user.name || "", phone: user.phone || "", bio: user.bio || "" }); }}
                className="px-6 py-2.5 font-semibold rounded-xl transition-all"
                style={{ backgroundColor: "rgba(66,71,84,0.3)", color: "#8c909f" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account info — read only */}
      <div style={card} className="p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Account Information</h3>
        <div className="space-y-0">
          {[
            { icon: "person", label: "Full Name", value: user.name },
            { icon: "email", label: "Email", value: user.email },
            { icon: "badge", label: "Role", value: user.role },
            { icon: "library_books", label: "Course", value: user.courseName || "—" },
            { icon: "phone", label: "Phone", value: user.phone || "Not set" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-3"
              style={{ borderBottom: "1px solid rgba(77,142,255,0.06)" }}>
              <span className="material-symbols-outlined text-slate-600 text-base w-5 flex-shrink-0">{item.icon}</span>
              <span className="text-xs text-slate-600 w-24 flex-shrink-0">{item.label}</span>
              <span className="text-sm font-medium" style={{ color: "#dae2fd" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
