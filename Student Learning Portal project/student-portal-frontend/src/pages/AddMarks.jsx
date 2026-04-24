import { useEffect, useState } from "react";
import { addMarks, getTeacherMarks, updateMarks } from "../services/marksService";
import { getStudentsInMyCourse } from "../services/userService";

const card = { backgroundColor: "#171f33", borderRadius: "1.5rem", border: "1px solid rgba(66,71,84,0.3)" };
const inputStyle = { backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.4)", color: "#dae2fd", borderRadius: "0.75rem", padding: "0.75rem 1rem", outline: "none", fontSize: "0.875rem", width: "100%" };
const onFocus = (e) => e.target.style.border = "1px solid #4d8eff";
const onBlur = (e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)";
const inlineInput = { backgroundColor: "#0d1424", border: "1px solid rgba(77,142,255,0.2)", color: "#dae2fd", borderRadius: "0.5rem", padding: "0.35rem 0.6rem", outline: "none", fontSize: "0.8rem", width: "80px" };

const EXAM_TYPES = ["Internal", "Final", "Assignment", "Practical", "Seminar"];

export default function AddMarks() {
  const [students, setStudents] = useState([]);
  const [marksList, setMarksList] = useState([]);
  const [form, setForm] = useState({ studentId: "", examType: "Internal", marksObtained: "", maxMarks: "" });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("add");

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ examType: "", marksObtained: "", maxMarks: "" });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    getStudentsInMyCourse().then((r) => setStudents(r.data)).catch(() => {});
    fetchMarks();
  }, []);

  const fetchMarks = () => {
    getTeacherMarks().then((r) => setMarksList(r.data)).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.marksObtained || !form.maxMarks) {
      alert("Please fill all fields"); return;
    }
    setSaving(true);
    try {
      await addMarks({
        studentId: Number(form.studentId),
        examType: form.examType,
        marksObtained: Number(form.marksObtained),
        maxMarks: Number(form.maxMarks),
      });
      setForm({ studentId: "", examType: "Internal", marksObtained: "", maxMarks: "" });
      fetchMarks();
      setActiveTab("view");
    } catch { alert("Failed to save marks"); }
    finally { setSaving(false); }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({ examType: m.examType, marksObtained: m.marksObtained, maxMarks: m.maxMarks });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ examType: "", marksObtained: "", maxMarks: "" });
  };

  const handleEditSave = async (id) => {
    if (!editForm.marksObtained || !editForm.maxMarks) { alert("Please fill marks fields"); return; }
    setEditSaving(true);
    try {
      await updateMarks(id, {
        examType: editForm.examType,
        marksObtained: Number(editForm.marksObtained),
        maxMarks: Number(editForm.maxMarks),
      });
      cancelEdit();
      fetchMarks();
    } catch { alert("Failed to update marks"); }
    finally { setEditSaving(false); }
  };

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold text-blue-400" style={{ fontFamily: "Manrope" }}>Marks Management</h1>
        <p className="text-slate-500 text-sm mt-1">Add and manage student marks</p>
      </div>

      <div className="flex gap-2">
        {["add", "view"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
            style={activeTab === tab
              ? { background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 16px rgba(77,142,255,0.3)" }
              : { backgroundColor: "#171f33", color: "#8c909f", border: "1px solid rgba(77,142,255,0.1)" }}>
            {tab === "add" ? "Add Marks" : "View & Edit Marks"}
          </button>
        ))}
      </div>

      {/* Add Marks Form */}
      {activeTab === "add" && (
        <div className="p-6" style={card}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student</label>
                <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur} required>
                  <option value="">Select Student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Type</label>
                <select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Marks Obtained</label>
                <input type="number" min="0" step="0.5" placeholder="e.g. 45" value={form.marksObtained}
                  onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Marks</label>
                <input type="number" min="1" step="0.5" placeholder="e.g. 100" value={form.maxMarks}
                  onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 font-bold rounded-xl transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "Save Marks"}
            </button>
          </form>
        </div>
      )}

      {/* View & Edit Marks Table */}
      {activeTab === "view" && (
        <div style={card} className="overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(66,71,84,0.3)" }}>
            <h2 className="font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>Marks Entered by You</h2>
          </div>
          {marksList.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-600 mb-3 block">grade</span>
              <p className="text-slate-500">No marks entered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(66,71,84,0.3)" }}>
                    {["Student", "Subject", "Exam Type", "Marks", "Date", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marksList.map((m) => (
                    <tr key={m.id} style={{ borderBottom: "1px solid rgba(66,71,84,0.15)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a2540"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>

                      <td className="px-6 py-3 font-semibold" style={{ color: "#dae2fd" }}>{m.studentName}</td>
                      <td className="px-6 py-3 text-slate-400">{m.subjectName}</td>

                      {/* Exam Type — editable */}
                      <td className="px-6 py-3">
                        {editingId === m.id ? (
                          <select value={editForm.examType}
                            onChange={(e) => setEditForm({ ...editForm, examType: e.target.value })}
                            style={{ ...inlineInput, width: "110px", cursor: "pointer" }}>
                            {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff" }}>
                            {m.examType}
                          </span>
                        )}
                      </td>

                      {/* Marks — editable */}
                      <td className="px-6 py-3">
                        {editingId === m.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" min="0" step="0.5" value={editForm.marksObtained}
                              onChange={(e) => setEditForm({ ...editForm, marksObtained: e.target.value })}
                              style={inlineInput} />
                            <span className="text-slate-600">/</span>
                            <input type="number" min="1" step="0.5" value={editForm.maxMarks}
                              onChange={(e) => setEditForm({ ...editForm, maxMarks: e.target.value })}
                              style={inlineInput} />
                          </div>
                        ) : (
                          <span className="font-bold" style={{ color: "#4ade80" }}>
                            {m.marksObtained} / {m.maxMarks}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3 text-xs text-slate-500">
                        {m.recordedAt ? new Date(m.recordedAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-3">
                        {editingId === m.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditSave(m.id)} disabled={editSaving}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", opacity: editSaving ? 0.7 : 1 }}>
                              {editSaving ? "..." : "Save"}
                            </button>
                            <button onClick={cancelEdit}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              style={{ backgroundColor: "rgba(66,71,84,0.3)", color: "#8c909f" }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(m)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-blue-500/15"
                            style={{ backgroundColor: "rgba(77,142,255,0.08)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
