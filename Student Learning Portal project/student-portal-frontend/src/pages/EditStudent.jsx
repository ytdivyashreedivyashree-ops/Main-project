import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentById, updateStudent } from "../services/studentService";

const card = { backgroundColor: "#171f33", borderRadius: "1.5rem", border: "1px solid rgba(66,71,84,0.3)" };
const inputStyle = { backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.4)", color: "#dae2fd", borderRadius: "0.75rem", padding: "0.75rem 1rem", outline: "none", fontSize: "0.875rem", width: "100%" };

export default function EditStudent() {
  const [student, setStudent] = useState({ name: "", email: "", course: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getStudentById(id).then((r) => setStudent(r.data)).catch(() => alert("Failed to load student")).finally(() => setFetching(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await updateStudent(id, student); navigate("/"); }
    catch { alert("Failed to update student"); }
    finally { setLoading(false); }
  };

  const fields = [
    { label: "Full Name", name: "name", type: "text", icon: "person" },
    { label: "Email Address", name: "email", type: "email", icon: "mail" },
    { label: "Course", name: "course", type: "text", icon: "menu_book" },
    { label: "Phone Number", name: "phone", type: "text", icon: "phone" },
  ];

  if (fetching) return (
    <div className="flex items-center justify-center h-64" style={{ color: "#8c909f" }}>
      <span className="material-symbols-outlined animate-spin text-blue-400 text-4xl">progress_activity</span>
    </div>
  );

  return (
    <div className="py-6 max-w-lg space-y-6" style={{ color: "#dae2fd" }}>
      <div>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 hover:text-blue-400 text-sm mb-4 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
            style={{ background: "linear-gradient(135deg, #4d8eff, #1d4ed8)" }}>
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-blue-400" style={{ fontFamily: "Manrope" }}>Edit Student</h1>
            <p className="text-slate-500 text-sm">Updating <span className="text-blue-400 font-semibold">{student.name}</span></p>
          </div>
        </div>
      </div>

      <div className="p-8" style={card}>
        <form onSubmit={handleUpdate} className="space-y-5">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{f.label}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">{f.icon}</span>
                <input type={f.type} name={f.name} value={student[f.name]} required
                  onChange={(e) => setStudent({ ...student, [f.name]: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                  onFocus={(e) => e.target.style.border = "1px solid #4d8eff"}
                  onBlur={(e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)"} />
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate("/")}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ border: "1px solid rgba(66,71,84,0.4)", color: "#8c909f" }}>Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #4d8eff, #1d4ed8)", color: "#fff", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
