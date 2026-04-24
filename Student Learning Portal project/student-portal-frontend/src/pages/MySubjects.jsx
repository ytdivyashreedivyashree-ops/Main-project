import { useEffect, useState } from "react";
import { getMySubjects, getSubjectsByCourse, registerSubject, unregisterSubject } from "../services/subjectService";
import { getMe } from "../services/userService";
import { getAllCourses } from "../services/courseService";

const card = { backgroundColor: "#0f1829", borderRadius: "1.25rem", border: "1px solid rgba(77,142,255,0.1)" };
const inputStyle = { backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.4)", color: "#dae2fd", borderRadius: "0.75rem", padding: "0.75rem 1rem", outline: "none", fontSize: "0.875rem", width: "100%" };

export default function MySubjects() {
  const [mySubjects, setMySubjects] = useState([]);
  const [allSubjectsForCourse, setAllSubjectsForCourse] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetchMySubjects();
    getAllCourses().then((r) => setCourses(r.data)).catch(() => {});
    getMe().then((r) => setMe(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      getSubjectsByCourse(selectedCourseId)
        .then((r) => setAllSubjectsForCourse(r.data))
        .catch(() => setAllSubjectsForCourse([]));
    } else {
      setAllSubjectsForCourse([]);
    }
  }, [selectedCourseId]);

  const fetchMySubjects = () => {
    getMySubjects().then((r) => setMySubjects(r.data)).catch(() => {});
  };

  const isRegistered = (subjectId) => mySubjects.some((s) => s.id === subjectId);

  const handleRegister = async (subjectId) => {
    setLoading(true);
    try {
      await registerSubject(subjectId);
      fetchMySubjects();
    } catch { alert("Failed to register subject"); }
    finally { setLoading(false); }
  };

  const handleUnregister = async (subjectId) => {
    if (!window.confirm("Remove this subject from your teaching list?")) return;
    setLoading(true);
    try {
      await unregisterSubject(subjectId);
      fetchMySubjects();
    } catch { alert("Failed to unregister subject"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Manrope", background: "linear-gradient(135deg,#a855f7,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          My Teaching Subjects
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Register the subjects you teach — students will see your materials and assignments under these subjects
        </p>
      </div>

      {/* Currently registered subjects */}
      <div style={card} className="overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(77,142,255,0.08)" }}>
          <h2 className="font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>
            Subjects I Teach
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(168,85,247,0.1)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.2)" }}>
            {mySubjects.length} registered
          </span>
        </div>

        {mySubjects.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-3 block">menu_book</span>
            <p className="text-slate-500 text-sm">You haven't registered any subjects yet</p>
            <p className="text-slate-600 text-xs mt-1">Use the panel below to add subjects you teach</p>
          </div>
        ) : (
          <div>
            {mySubjects.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-4 transition-colors"
                style={{ borderTop: i > 0 ? "1px solid rgba(77,142,255,0.06)" : "none" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#131f35"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.2)" }}>
                    <span className="material-symbols-outlined text-base" style={{ color: "#a855f7", fontVariationSettings: "'FILL' 1" }}>menu_book</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#dae2fd" }}>{s.subjectName}</p>
                    <p className="text-xs text-slate-500">{s.subjectCode} · {s.courseName}</p>
                  </div>
                </div>
                <button onClick={() => handleUnregister(s.id)} disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/15"
                  style={{ color: "#ffb4ab", border: "1px solid rgba(255,180,171,0.1)" }}>
                  <span className="material-symbols-outlined text-sm">remove_circle</span>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add subjects from a course */}
      <div style={card} className="overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(77,142,255,0.08)" }}>
          <h2 className="font-bold mb-3" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>
            Add Subjects to Your Teaching List
          </h2>
          <select value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{ ...inputStyle, maxWidth: "300px", cursor: "pointer" }}
            onFocus={(e) => e.target.style.border = "1px solid #4d8eff"}
            onBlur={(e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)"}>
            <option value="">Select a course to browse subjects</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {!selectedCourseId ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-700 mb-2 block">library_books</span>
            <p className="text-slate-600 text-sm">Select a course above to see available subjects</p>
          </div>
        ) : allSubjectsForCourse.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-700 mb-2 block">search_off</span>
            <p className="text-slate-600 text-sm">No subjects found for this course</p>
            <p className="text-slate-700 text-xs mt-1">Ask admin to add subjects for this course first</p>
          </div>
        ) : (
          <div>
            {allSubjectsForCourse.map((s, i) => {
              const registered = isRegistered(s.id);
              return (
                <div key={s.id} className="flex items-center justify-between px-6 py-4 transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid rgba(77,142,255,0.06)" : "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#131f35"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#dae2fd" }}>{s.subjectName}</p>
                    <p className="text-xs text-slate-500">{s.subjectCode}</p>
                    {s.description && <p className="text-xs text-slate-600 mt-0.5">{s.description}</p>}
                  </div>
                  {registered ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "rgba(168,85,247,0.1)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.2)" }}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Registered
                    </span>
                  ) : (
                    <button onClick={() => handleRegister(s.id)} disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", opacity: loading ? 0.7 : 1 }}>
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      Register
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
