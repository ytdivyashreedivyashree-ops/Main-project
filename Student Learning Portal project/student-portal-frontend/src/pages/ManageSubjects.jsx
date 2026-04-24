import { useEffect, useState } from "react";
import { getAllSubjects, createSubject, deleteSubject } from "../services/subjectService";
import { getAllCourses } from "../services/courseService";

const card = { backgroundColor: "#171f33", borderRadius: "1.5rem", border: "1px solid rgba(66,71,84,0.3)" };
const inputStyle = { backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.4)", color: "#dae2fd", borderRadius: "0.75rem", padding: "0.75rem 1rem", outline: "none", fontSize: "0.875rem", width: "100%" };
const onFocus = (e) => e.target.style.border = "1px solid #4d8eff";
const onBlur = (e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)";

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ subjectName: "", subjectCode: "", courseId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
    getAllCourses().then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  const fetchSubjects = () => {
    getAllSubjects().then((r) => setSubjects(r.data)).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjectName || !form.subjectCode || !form.courseId) { alert("Fill all required fields"); return; }
    setSaving(true);
    try {
      await createSubject({ ...form, courseId: Number(form.courseId) });
      setForm({ subjectName: "", subjectCode: "", courseId: "" });
      fetchSubjects();
    } catch { alert("Failed to create subject"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try { await deleteSubject(id); fetchSubjects(); }
    catch { alert("Delete failed"); }
  };

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold text-blue-400" style={{ fontFamily: "Manrope" }}>Manage Subjects</h1>
        <p className="text-slate-500 text-sm mt-1">Add and manage subjects per course</p>
      </div>

      <div className="p-6" style={card}>
        <h2 className="text-base font-bold mb-4" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>Add New Subject</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject Name *</label>
              <input type="text" placeholder="e.g. Data Structures" value={form.subjectName}
                onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject Code *</label>
              <input type="text" placeholder="e.g. BCA301" value={form.subjectCode}
                onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course *</label>
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur} required>
                <option value="">Select Course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 font-bold rounded-xl transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Add Subject"}
          </button>
        </form>
      </div>

      <div style={card} className="overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(66,71,84,0.3)" }}>
          <h2 className="font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>All Subjects</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(77,142,255,0.15)", color: "#adc6ff" }}>
            {subjects.length} subjects
          </span>
        </div>
        {subjects.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-3 block">menu_book</span>
            <p className="text-slate-500">No subjects added yet</p>
          </div>
        ) : (
          <div>
            {subjects.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-4 transition-colors"
                style={{ borderTop: i > 0 ? "1px solid rgba(66,71,84,0.2)" : "none" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a2540"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#dae2fd" }}>{s.subjectName}</p>
                  <p className="text-xs text-slate-500">{s.subjectCode} · {s.courseName}</p>
                </div>
                <button onClick={() => handleDelete(s.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/15"
                  style={{ color: "#ffb4ab" }}>
                  <span className="material-symbols-outlined text-sm">delete</span> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
