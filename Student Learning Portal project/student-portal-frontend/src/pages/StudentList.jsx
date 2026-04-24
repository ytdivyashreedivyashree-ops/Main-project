import { useState, useEffect } from "react";
import { getAllStudents, deleteStudent } from "../services/studentService";
import { getAllMaterials } from "../services/materialService";
import { useNavigate } from "react-router-dom";

const card = { backgroundColor: "#111827", borderRadius: "1.25rem", border: "1px solid rgba(77,142,255,0.1)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" };
const inputStyle = { backgroundColor: "#0d1424", border: "1px solid rgba(77,142,255,0.15)", color: "#dae2fd", borderRadius: "0.75rem", padding: "0.65rem 1rem 0.65rem 2.5rem", outline: "none", fontSize: "0.875rem", width: "100%", transition: "all 0.2s" };

export default function StudentList() {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialSearch, setMaterialSearch] = useState("");
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    getAllMaterials().then((r) => setMaterials(r.data)).catch(console.log).finally(() => setLoadingMaterials(false));
  }, []);

  const handleStudentSearch = async () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) { setStudents([]); setSearched(false); return; }
    setLoadingStudents(true);
    try {
      const res = await getAllStudents();
      setStudents(res.data.filter((s) => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || s.course?.toLowerCase().includes(term)));
      setSearched(true);
    } catch { alert("Failed to fetch students"); }
    finally { setLoadingStudents(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try { await deleteStudent(id); setStudents(students.filter((s) => s.id !== id)); }
    catch { alert("Failed to delete"); }
  };

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(materialSearch.toLowerCase()) || m.fileName.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const getFileIcon = (fileName) => {
    if (!fileName) return "📄";
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "pdf") return "📕"; if (["doc", "docx"].includes(ext)) return "📘";
    if (["ppt", "pptx"].includes(ext)) return "📙"; if (["jpg", "jpeg", "png"].includes(ext)) return "🖼️";
    return "📄";
  };

  const tabs = [
    { id: "students", icon: "group", label: "Students" },
    { id: "materials", icon: "folder_open", label: "Study Materials" },
  ];

  return (
    <div className="space-y-7 py-6" style={{ color: "#dae2fd" }}>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: "linear-gradient(135deg, #0f1829 0%, #111f3a 100%)", border: "1px solid rgba(77,142,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ backgroundColor: "#4d8eff" }} />
        <div className="relative z-10">
          <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3 block">Welcome back</span>
          <h3 className="text-3xl font-extrabold mb-2 text-white" style={{ fontFamily: "Manrope" }}>
            Your <span style={{ background: "linear-gradient(135deg,#adc6ff,#4d8eff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Learning Dashboard</span>
          </h3>
          <p className="text-slate-500 text-sm mb-6">Manage students, materials, assignments and quizzes from one place.</p>
          {role === "TEACHER" && (
            <button onClick={() => navigate("/add")}
              className="flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl text-sm transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 20px rgba(77,142,255,0.35)" }}>
              <span className="material-symbols-outlined text-base">person_add</span> Add Student
            </button>
          )}
        </div>
        <span className="material-symbols-outlined absolute right-8 bottom-2 opacity-5 text-blue-400" style={{ fontSize: "8rem", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "#0d1424", border: "1px solid rgba(77,142,255,0.08)" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === t.id
              ? { background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 16px rgba(77,142,255,0.3)" }
              : { color: "#6b7280" }}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
            {t.id === "materials" && materials.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgba(77,142,255,0.2)", color: "#adc6ff" }}>{materials.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl" style={card}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-lg">search</span>
                <input type="text" placeholder="Search by name, email or course..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleStudentSearch()}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#4d8eff"; e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(77,142,255,0.15)"; e.target.style.boxShadow = "none"; }} />
              </div>
              <button onClick={handleStudentSearch} disabled={loadingStudents}
                className="px-6 py-2.5 font-bold rounded-xl text-sm transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 16px rgba(77,142,255,0.3)", opacity: loadingStudents ? 0.6 : 1 }}>
                {loadingStudents ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {!searched && (
            <div className="p-16 text-center" style={card}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(77,142,255,0.06)", border: "1px solid rgba(77,142,255,0.1)" }}>
                <span className="material-symbols-outlined text-3xl text-slate-600">manage_search</span>
              </div>
              <h3 className="font-semibold text-slate-400 mb-1">Search for a Student</h3>
              <p className="text-slate-600 text-sm">Enter a name, email or course above</p>
            </div>
          )}

          {searched && students.length === 0 && (
            <div className="p-16 text-center" style={card}>
              <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">sentiment_dissatisfied</span>
              <h3 className="font-semibold text-slate-400">No Students Found</h3>
            </div>
          )}

          {searched && students.length > 0 && (
            <div className="overflow-hidden" style={card}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(77,142,255,0.08)" }}>
                <span className="text-sm font-semibold text-slate-400">{students.length} student{students.length > 1 ? "s" : ""} found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#0d1424" }}>
                      {["ID", "Student", "Email", "Course", "Phone", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#4b5563" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="transition-colors" style={{ borderTop: "1px solid rgba(77,142,255,0.06)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0f1829"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td className="px-6 py-4 text-sm font-mono" style={{ color: "#4b5563" }}>#{s.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", boxShadow: "0 2px 8px rgba(77,142,255,0.3)" }}>
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-200">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{s.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>{s.course}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{s.phone}</td>
                        <td className="px-6 py-4">
                          {role === "TEACHER" ? (
                            <div className="flex gap-2">
                              <button onClick={() => navigate(`/edit/${s.id}`)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-amber-500/15"
                                style={{ backgroundColor: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.15)" }}>Edit</button>
                              <button onClick={() => handleDelete(s.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/15"
                                style={{ backgroundColor: "rgba(255,180,171,0.08)", color: "#ffb4ab", border: "1px solid rgba(255,180,171,0.15)" }}>Delete</button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600">View Only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl" style={card}>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-lg">search</span>
              <input type="text" placeholder="Search materials..." value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)} style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#4d8eff"; e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(77,142,255,0.15)"; e.target.style.boxShadow = "none"; }} />
            </div>
          </div>

          <div className="overflow-hidden" style={card}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(77,142,255,0.08)" }}>
              <span className="font-bold text-slate-200" style={{ fontFamily: "Manrope" }}>Available Materials</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>
                  {filteredMaterials.length} file{filteredMaterials.length !== 1 ? "s" : ""}
                </span>
                {role === "TEACHER" && (
                  <button onClick={() => navigate("/materials")} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">+ Upload New</button>
                )}
              </div>
            </div>

            {loadingMaterials ? (
              <div className="p-16 text-center text-slate-600">Loading...</div>
            ) : filteredMaterials.length === 0 ? (
              <div className="p-16 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-700 mb-4 block">folder_open</span>
                <p className="text-slate-500">No materials found</p>
              </div>
            ) : (
              <div>
                {filteredMaterials.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-6 py-4 group transition-colors"
                    style={{ borderTop: "1px solid rgba(77,142,255,0.06)" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0f1829"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: "rgba(77,142,255,0.08)", border: "1px solid rgba(77,142,255,0.1)" }}>
                        {getFileIcon(m.fileName)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{m.title}</p>
                        <p className="text-xs mt-0.5 text-slate-600">{m.fileName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={m.fileUrl} target="_blank" rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ backgroundColor: "rgba(77,142,255,0.08)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>View</a>
                      <a href={m.fileUrl} download
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ backgroundColor: "rgba(77,142,255,0.12)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.2)" }}>Download</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
