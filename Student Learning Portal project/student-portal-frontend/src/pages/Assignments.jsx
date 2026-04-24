import { useEffect, useState } from "react";
import {
  createAssignment, deleteAssignment, updateAssignment,
  submitAssignment, checkSubmitted,
  getAssignmentsBySubject, getAllAssignments,
  getUpcomingAssignments, getOverdueAssignments,
  getMyAssignments, getMyUpcomingAssignments, getMyOverdueAssignments,
} from "../services/assignmentService";
import { useNavigate } from "react-router-dom";
import { getMySubjects, getSubjectsByCourseWithTeachers } from "../services/subjectService";
import { getMe } from "../services/userService";

const card = {
  backgroundColor: "#111827", borderRadius: "1.25rem",
  border: "1px solid rgba(77,142,255,0.1)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};
const inputStyle = {
  backgroundColor: "#0d1424", border: "1px solid rgba(77,142,255,0.15)",
  color: "#dae2fd", borderRadius: "0.75rem", padding: "0.75rem 1rem",
  outline: "none", fontSize: "0.875rem", width: "100%", transition: "border-color 0.2s",
};
const iFocus = (e) => { e.target.style.borderColor = "#4d8eff"; e.target.style.backgroundColor = "#131f35"; e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.1)"; };
const iBlur = (e) => { e.target.style.borderColor = "rgba(77,142,255,0.15)"; e.target.style.backgroundColor = "#0d1424"; e.target.style.boxShadow = "none"; };

export default function Assignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [submittedMap, setSubmittedMap] = useState({});
  const [mySubjects, setMySubjects] = useState([]);
  const [courseSubjects, setCourseSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ topic: "", description: "", dueDate: "" });
  const [editSaving, setEditSaving] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    getMe().then((r) => {
      if (role === "STUDENT" && r.data.courseId) {
        getSubjectsByCourseWithTeachers(r.data.courseId)
          .then((res) => {
            const unique = res.data.filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
            setCourseSubjects(unique);
          }).catch(() => {});
      }
    }).catch(() => {});

    if (role === "TEACHER") {
      getMySubjects().then((r) => setMySubjects(r.data)).catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    if (role === "TEACHER" || role === "ADMIN") fetchByType(filterType);
  }, [filterType, role]);

  useEffect(() => {
    if (role === "STUDENT") {
      if (activeSubjectId) fetchBySubject(activeSubjectId);
      else { setAssignments([]); setSubmittedMap({}); }
    }
  }, [activeSubjectId, role]);

  const fetchByType = async (type) => {
    try {
      let res;
      if (role === "TEACHER") {
        // teacher sees only their own assignments
        if (type === "UPCOMING") res = await getMyUpcomingAssignments();
        else if (type === "OVERDUE") res = await getMyOverdueAssignments();
        else res = await getMyAssignments();
      } else {
        if (type === "UPCOMING") res = await getUpcomingAssignments();
        else if (type === "OVERDUE") res = await getOverdueAssignments();
        else res = await getAllAssignments();
      }
      setAssignments(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBySubject = async (subjectId) => {
    try {
      const res = await getAssignmentsBySubject(subjectId);
      setAssignments(res.data);
      const map = {};
      for (const a of res.data) {
        try { const r = await checkSubmitted(a.id); map[a.id] = r.data; } catch { map[a.id] = false; }
      }
      setSubmittedMap(map);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("title", topic);
      formData.append("description", description);
      formData.append("dueDate", dueDate);
      await createAssignment(formData);
      setTopic(""); setDescription(""); setDueDate("");
      fetchByType(filterType);
    } catch (err) { alert("Error: " + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try { await deleteAssignment(id); fetchByType(filterType); }
    catch { alert("Delete failed"); }
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    const due = a.dueDate ? new Date(a.dueDate).toISOString().split("T")[0] : "";
    setEditForm({ topic: a.topic, description: a.description || "", dueDate: due });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({ topic: "", description: "", dueDate: "" }); };

  const handleEditSave = async (id) => {
    if (!editForm.topic || !editForm.dueDate) { alert("Please fill topic and due date"); return; }
    setEditSaving(true);
    try {
      const formData = new FormData();
      formData.append("topic", editForm.topic);
      formData.append("description", editForm.description);
      formData.append("dueDate", editForm.dueDate);
      const res = await updateAssignment(id, formData);
      setAssignments((prev) => prev.map((a) => a.id === id ? res.data : a));
      cancelEdit();
    } catch { alert("Update failed"); }
    finally { setEditSaving(false); }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const selectedFile = submissionFiles[assignmentId];
    if (!selectedFile) { alert("Please choose a file first"); return; }
    try {
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("file", selectedFile);
      await submitAssignment(formData);
      setSubmittedMap((p) => ({ ...p, [assignmentId]: true }));
      setSubmissionFiles((p) => ({ ...p, [assignmentId]: null }));
    } catch (err) { alert(err.response?.data?.message || "Submit failed"); }
  };

  const filters = ["ALL", "UPCOMING", "OVERDUE"];
  const filterIcons = { ALL: "list", UPCOMING: "upcoming", OVERDUE: "warning" };
  const activeSubject = courseSubjects.find((s) => String(s.id) === String(activeSubjectId));

  // deadline colour logic
  const getDeadlineStyle = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffMs < 0) {
      return { bg: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)", label: "Overdue" };
    }
    if (diffDays <= 3) {
      return { bg: "rgba(249,115,22,0.1)", color: "#fdba74", border: "1px solid rgba(249,115,22,0.2)", label: `Due Soon — ${due.toLocaleDateString()}` };
    }
    return { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)", label: `Due ${due.toLocaleDateString()}` };
  };

  return (
    <div className="space-y-7 py-6" style={{ color: "#dae2fd" }}>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "Manrope", background: "linear-gradient(135deg,#adc6ff,#4d8eff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Assignments
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {role === "STUDENT" ? "Select a subject to view assignments" : "Manage assignments"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role === "STUDENT" && (
            <button onClick={() => navigate("/")} title="Go to Home"
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: "rgba(77,142,255,0.1)", border: "1px solid rgba(77,142,255,0.2)", color: "#adc6ff" }}>
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#4d8eff22,#1d4ed822)", border: "1px solid rgba(77,142,255,0.2)" }}>
            <span className="material-symbols-outlined text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
          </div>
        </div>
      </div>

      {/* STUDENT: mandatory subject selector */}
      {role === "STUDENT" && (
        <div style={card} className="p-5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Select Subject</label>
          {courseSubjects.length === 0 ? (
            <p className="text-sm text-slate-500">No subjects available for your course yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {courseSubjects.map((s) => (
                <button key={s.id} onClick={() => setActiveSubjectId(String(s.id))}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={String(activeSubjectId) === String(s.id)
                    ? { background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 16px rgba(77,142,255,0.3)" }
                    : { backgroundColor: "#0d1424", color: "#8c909f", border: "1px solid rgba(77,142,255,0.15)" }}>
                  {s.subjectName}
                  {s.teacherName && <span className="ml-1.5 text-xs opacity-70">· {s.teacherName}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TEACHER: create form — no subject dropdown */}
      {role === "TEACHER" && (
        <div className="p-7 space-y-4" style={{ ...card, background: "linear-gradient(135deg, #111827 0%, #0f1e35 100%)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)" }}>
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_task</span>
            </div>
            <h2 className="text-base font-bold text-white" style={{ fontFamily: "Manrope" }}>Create Assignment</h2>
          </div>
          {mySubjects.length === 0 ? (
            <div className="p-5 rounded-xl text-center" style={{ backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <span className="material-symbols-outlined text-2xl mb-1 block" style={{ color: "#f59e0b" }}>warning</span>
              <p className="text-sm font-semibold" style={{ color: "#fcd34d" }}>No subject registered</p>
              <p className="text-xs text-slate-500 mt-1">Go to <strong>My Subjects</strong> to register your subject first</p>
            </div>
          ) : (
            <>
              {/* Show which subject this assignment will be for */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
                <span className="material-symbols-outlined text-sm" style={{ color: "#a855f7" }}>menu_book</span>
                <span className="text-xs font-semibold" style={{ color: "#d8b4fe" }}>
                  Subject: {mySubjects[0]?.subjectName} — {mySubjects[0]?.courseName}
                </span>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} required style={inputStyle} onFocus={iFocus} onBlur={iBlur} />
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
                  style={{ ...inputStyle, resize: "vertical" }} onFocus={iFocus} onBlur={iBlur} />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required
                  style={{ ...inputStyle, colorScheme: "dark" }} onFocus={iFocus} onBlur={iBlur} />
                <button type="submit" className="w-full py-3 font-bold rounded-xl transition-all active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #4d8eff, #1d4ed8)", color: "#fff", boxShadow: "0 4px 20px rgba(77,142,255,0.35)" }}>
                  Create Assignment
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* TEACHER/ADMIN: status filters */}
      {(role === "TEACHER" || role === "ADMIN") && (
        <div className="flex gap-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilterType(f)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={filterType === f
                ? { background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 16px rgba(77,142,255,0.3)" }
                : { backgroundColor: "#111827", color: "#8c909f", border: "1px solid rgba(77,142,255,0.1)" }}>
              <span className="material-symbols-outlined text-sm">{filterIcons[f]}</span>
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {/* Assignment cards */}
      {(role !== "STUDENT" || activeSubjectId) && (
        <>
          {activeSubjectId && role === "STUDENT" && (
            <p className="text-sm font-semibold" style={{ color: "#adc6ff" }}>
              Showing: <span style={{ color: "#d8b4fe" }}>{activeSubject?.subjectName}</span>
              {activeSubject?.teacherName && <span className="text-slate-500"> · by {activeSubject.teacherName}</span>}
            </p>
          )}
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="p-16 text-center" style={card}>
                <span className="material-symbols-outlined text-3xl text-slate-600 mb-3 block">assignment</span>
                <p className="text-slate-500 font-medium">No assignments found</p>
              </div>
            ) : assignments.map((a) => (
              <div key={a.id} className="p-6 transition-all duration-300 hover:-translate-y-0.5" style={{ ...card }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(77,142,255,0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(77,142,255,0.1)"}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {a.subjectName && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "rgba(168,85,247,0.1)", color: "#d8b4fe" }}>
                          {a.subjectName}
                        </span>
                      )}
                      {a.givenByName && <span className="text-xs text-slate-600">by {a.givenByName}</span>}
                    </div>
                    <h3 className="text-lg font-bold leading-tight" style={{ color: "#e8eeff", fontFamily: "Manrope" }}>{a.topic}</h3>
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: "#6b7280" }}>{a.description}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {(() => {
                        const ds = getDeadlineStyle(a.dueDate);
                        return (
                          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: ds.bg, color: ds.color, border: ds.border }}>
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {ds.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  {role === "TEACHER" && (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(a)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-blue-500/15"
                        style={{ backgroundColor: "rgba(77,142,255,0.08)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>
                        <span className="material-symbols-outlined text-sm">edit</span> Edit
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-red-500/15"
                        style={{ backgroundColor: "rgba(255,180,171,0.06)", color: "#ffb4ab", border: "1px solid rgba(255,180,171,0.1)" }}>
                        <span className="material-symbols-outlined text-sm">delete</span> Delete
                      </button>
                    </div>
                  )}
                </div>
                {role === "TEACHER" && editingId === a.id && (
                  <div className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid rgba(77,142,255,0.1)" }}>
                    <input value={editForm.topic} onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                      placeholder="Topic" style={inputStyle} onFocus={iFocus} onBlur={iBlur} />
                    <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description" rows={3} style={{ ...inputStyle, resize: "vertical" }} onFocus={iFocus} onBlur={iBlur} />
                    <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      style={{ ...inputStyle, colorScheme: "dark" }} onFocus={iFocus} onBlur={iBlur} />
                    <div className="flex gap-2">
                      <button onClick={() => handleEditSave(a.id)} disabled={editSaving}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                        style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", opacity: editSaving ? 0.7 : 1 }}>
                        {editSaving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={cancelEdit}
                        className="px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ backgroundColor: "rgba(66,71,84,0.3)", color: "#8c909f" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {role === "STUDENT" && (
                  <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(77,142,255,0.08)" }}>
                    {submittedMap[a.id] ? (
                      <div className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl w-fit"
                        style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.15)" }}>
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Already Submitted
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all hover:bg-blue-500/10"
                          style={{ backgroundColor: "rgba(77,142,255,0.06)", color: "#adc6ff", border: "1px dashed rgba(77,142,255,0.2)" }}>
                          <span className="material-symbols-outlined text-base">upload_file</span>
                          {submissionFiles[a.id] ? submissionFiles[a.id].name : "Choose File"}
                          <input type="file" className="hidden" onChange={(e) => setSubmissionFiles((p) => ({ ...p, [a.id]: e.target.files[0] }))} />
                        </label>
                        <button onClick={() => handleSubmitAssignment(a.id)}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                          style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", boxShadow: "0 4px 16px rgba(34,197,94,0.25)" }}>
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {role === "STUDENT" && !activeSubjectId && courseSubjects.length > 0 && (
        <div className="p-16 text-center" style={card}>
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">assignment</span>
          <p className="text-slate-400 font-semibold">Select a subject above to view its assignments</p>
        </div>
      )}
    </div>
  );
}
