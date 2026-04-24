import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignmentsBySubject, checkSubmitted } from "../services/assignmentService";
import { getMaterialsBySubject } from "../services/materialService";
import { getMyMarks } from "../services/marksService";
import { getMe } from "../services/userService";
import { getSubjectsByCourseWithTeachers } from "../services/subjectService";

const card = {
  backgroundColor: "#111827", borderRadius: "1.25rem",
  border: "1px solid rgba(77,142,255,0.1)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

// deadline colour logic — same as Assignments.jsx
function getDeadlineStyle(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = (due - now) / (1000 * 60 * 60 * 24);
  if (due < now) return { bg: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)", label: "Overdue", dot: "#ef4444" };
  if (diffDays <= 3) return { bg: "rgba(249,115,22,0.12)", color: "#fdba74", border: "1px solid rgba(249,115,22,0.2)", label: "Due Soon", dot: "#f97316" };
  return { bg: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)", label: "Upcoming", dot: "#22c55e" };
}

function getFileIcon(fileName) {
  if (!fileName) return "📄";
  const ext = fileName.split(".").pop().toLowerCase();
  if (ext === "pdf") return "📕";
  if (["doc", "docx"].includes(ext)) return "📘";
  if (["ppt", "pptx"].includes(ext)) return "📙";
  if (["jpg", "jpeg", "png"].includes(ext)) return "🖼️";
  return "📄";
}

export default function StudentHome() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [marks, setMarks] = useState([]);
  const [submittedMap, setSubmittedMap] = useState({});
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // get current user + their course
        const meRes = await getMe();
        const me = meRes.data;
        setUserName(me.name || "Student");

        if (!me.courseId) { setLoading(false); return; }

        // get subjects for their course that have teachers
        const subjectsRes = await getSubjectsByCourseWithTeachers(me.courseId);
        const subjects = subjectsRes.data.filter(
          (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
        );

        if (subjects.length === 0) { setLoading(false); return; }

        // fetch assignments from all subjects, flatten, sort by due date
        const assignmentArrays = await Promise.all(
          subjects.map((s) => getAssignmentsBySubject(s.id).then((r) => r.data).catch(() => []))
        );
        const allAssignments = assignmentArrays.flat()
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);
        setAssignments(allAssignments);

        // check submitted status
        const map = {};
        await Promise.all(
          allAssignments.map(async (a) => {
            try { const r = await checkSubmitted(a.id); map[a.id] = r.data; } catch { map[a.id] = false; }
          })
        );
        setSubmittedMap(map);

        // fetch materials from first subject (most recent 4)
        const matRes = await getMaterialsBySubject(subjects[0].id);
        setMaterials(matRes.data.slice(0, 4));

        // fetch marks
        const marksRes = await getMyMarks();
        setMarks(marksRes.data.slice(0, 5));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickActions = [
    { label: "View Materials", icon: "folder_open", path: "/materials", color: "#4d8eff", bg: "rgba(77,142,255,0.1)" },
    { label: "View Assignments", icon: "assignment", path: "/assignments", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
    { label: "Take Quiz", icon: "quiz", path: "/quiz", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "My Marks", icon: "grade", path: "/my-marks", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined text-5xl text-slate-700 block" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        <p className="text-slate-500 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-7 py-6" style={{ color: "#dae2fd" }}>

      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: "linear-gradient(135deg, #0f1829 0%, #111f3a 100%)", border: "1px solid rgba(77,142,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ backgroundColor: "#4d8eff" }} />
        <div className="relative z-10">
          <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3 block">Welcome back</span>
          <h3 className="text-3xl font-extrabold mb-2 text-white" style={{ fontFamily: "Manrope" }}>
            Hello, <span style={{ background: "linear-gradient(135deg,#adc6ff,#4d8eff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName} 👋</span>
          </h3>
          <p className="text-slate-500 text-sm">Here's what's happening with your studies today.</p>
        </div>
        <span className="material-symbols-outlined absolute right-8 bottom-2 opacity-5 text-blue-400" style={{ fontSize: "8rem", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ ...card, borderColor: `${a.color}22` }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = `${a.color}44`}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = `${a.color}22`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: a.bg }}>
                <span className="material-symbols-outlined text-xl" style={{ color: a.color, fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
              </div>
              <p className="text-sm font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>{a.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Upcoming Assignments */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Upcoming Assignments</h2>
          <button onClick={() => navigate("/assignments")} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </button>
        </div>
        <div style={card} className="overflow-hidden">
          {assignments.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-700 mb-3 block">assignment</span>
              <p className="text-slate-500 text-sm">No assignments yet. Select a subject to view them.</p>
            </div>
          ) : (
            <div>
              {assignments.map((a, i) => {
                const ds = getDeadlineStyle(a.dueDate);
                return (
                  <div key={a.id} className="flex items-center justify-between px-5 py-4 transition-colors"
                    style={{ borderTop: i > 0 ? "1px solid rgba(77,142,255,0.06)" : "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0f1829"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* status dot */}
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ds.dot }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#dae2fd" }}>{a.topic}</p>
                        {a.subjectName && (
                          <p className="text-xs text-slate-600 mt-0.5">{a.subjectName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      {/* submitted badge */}
                      {submittedMap[a.id] && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.15)" }}>
                          Submitted
                        </span>
                      )}
                      {/* deadline badge */}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: ds.bg, color: ds.color, border: ds.border }}>
                        {ds.label} · {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Recent Study Materials */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Study Materials</h2>
          <button onClick={() => navigate("/materials")} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </button>
        </div>
        <div style={card} className="overflow-hidden">
          {materials.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-700 mb-3 block">folder_open</span>
              <p className="text-slate-500 text-sm">No materials available yet.</p>
            </div>
          ) : (
            <div>
              {materials.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between px-5 py-4 group transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid rgba(77,142,255,0.06)" : "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0f1829"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: "rgba(77,142,255,0.08)", border: "1px solid rgba(77,142,255,0.1)" }}>
                      {getFileIcon(m.fileName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#dae2fd" }}>{m.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {m.subjectName && (
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "rgba(168,85,247,0.1)", color: "#d8b4fe" }}>
                            {m.subjectName}
                          </span>
                        )}
                        <span className="text-xs text-slate-600 truncate">{m.fileName}</span>
                      </div>
                    </div>
                  </div>
                  <a href={m.fileUrl} download
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-3"
                    style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Marks Preview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">My Recent Marks</h2>
          <button onClick={() => navigate("/my-marks")} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </button>
        </div>
        <div style={card} className="overflow-hidden">
          {marks.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-700 mb-3 block">grade</span>
              <p className="text-slate-500 text-sm">No marks recorded yet.</p>
            </div>
          ) : (
            <div>
              {marks.map((m, i) => {
                const pct = m.maxMarks > 0 ? ((m.marksObtained / m.maxMarks) * 100).toFixed(0) : 0;
                const scoreColor = pct >= 75 ? "#4ade80" : pct >= 50 ? "#facc15" : "#f87171";
                return (
                  <div key={m.id} className="flex items-center justify-between px-5 py-4 transition-colors"
                    style={{ borderTop: i > 0 ? "1px solid rgba(77,142,255,0.06)" : "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0f1829"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#dae2fd" }}>{m.subjectName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-600">{m.examType}</span>
                        {m.courseName && <span className="text-xs text-slate-700">· {m.courseName}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      {/* progress bar */}
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: scoreColor }} />
                      </div>
                      <span className="text-sm font-black w-16 text-right" style={{ color: scoreColor, fontFamily: "Manrope" }}>
                        {m.marksObtained}/{m.maxMarks}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
