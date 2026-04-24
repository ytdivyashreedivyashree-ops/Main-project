import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMaterials, getMyMaterials, getMaterialsBySubject, uploadMaterial, deleteMaterial, updateMaterialTitle } from "../services/materialService";
import { getMySubjects, getSubjectsByCourseWithTeachers } from "../services/subjectService";
import { getMe } from "../services/userService";

const card = { backgroundColor: "#171f33", borderRadius: "1.5rem", border: "1px solid rgba(66,71,84,0.3)" };
const inputStyle = { backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.4)", color: "#dae2fd", borderRadius: "0.75rem", padding: "0.75rem 1rem", outline: "none", fontSize: "0.875rem", width: "100%" };
const onFocus = (e) => e.target.style.border = "1px solid #4d8eff";
const onBlur = (e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)";

export default function StudyMaterials() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mySubjects, setMySubjects] = useState([]);
  const [courseSubjects, setCourseSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
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
      getMyMaterials().then((r) => setMaterials(r.data)).catch(() => {});
    }
    if (role === "ADMIN") {
      getAllMaterials().then((r) => setMaterials(r.data)).catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    if (role === "STUDENT" && activeSubjectId) {
      getMaterialsBySubject(activeSubjectId).then((r) => setMaterials(r.data)).catch(() => setMaterials([]));
    } else if (role === "STUDENT" && !activeSubjectId) {
      setMaterials([]);
    }
  }, [activeSubjectId, role]);

  const fetchTeacherMaterials = () => {
    getMyMaterials().then((r) => setMaterials(r.data)).catch(() => {});
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) { alert("Please enter title and choose a file"); return; }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    setUploading(true);
    try {
      await uploadMaterial(formData);
      setTitle(""); setFile(null);
      fetchTeacherMaterials();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.response?.status || err.message));
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await deleteMaterial(id);
      fetchTeacherMaterials();
    } catch { alert("Delete failed"); }
  };

  const handleEditSave = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await updateMaterialTitle(id, editTitle.trim());
      setEditingId(null);
      setEditTitle("");
      fetchTeacherMaterials();
    } catch { alert("Update failed"); }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "📄";
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "pdf") return "📕";
    if (["doc", "docx"].includes(ext)) return "📘";
    if (["ppt", "pptx"].includes(ext)) return "📙";
    if (["jpg", "jpeg", "png"].includes(ext)) return "🖼️";
    return "📄";
  };

  const activeSubject = courseSubjects.find((s) => String(s.id) === String(activeSubjectId));

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-400" style={{ fontFamily: "Manrope" }}>Study Materials</h1>
          <p className="text-slate-500 text-sm mt-1">
            {role === "TEACHER" ? "Upload and manage your materials" :
             role === "STUDENT" ? "Select a subject to view materials" : "All materials"}
          </p>
        </div>
        {role === "STUDENT" && (
          <button onClick={() => navigate("/")} title="Go to Home"
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: "rgba(77,142,255,0.1)", border: "1px solid rgba(77,142,255,0.2)", color: "#adc6ff" }}>
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        )}
      </div>

      {/* STUDENT: subject selector */}
      {role === "STUDENT" && (
        <div style={card} className="p-5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
            Select Subject to View Materials
          </label>
          {courseSubjects.length === 0 ? (
            <p className="text-sm text-slate-500">No subjects available for your course yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {courseSubjects.map((s) => (
                <button key={s.id} onClick={() => setActiveSubjectId(String(s.id))}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={String(activeSubjectId) === String(s.id)
                    ? { background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 16px rgba(77,142,255,0.3)" }
                    : { backgroundColor: "#131b2e", color: "#8c909f", border: "1px solid rgba(77,142,255,0.15)" }}>
                  {s.subjectName}
                  {s.teacherName && <span className="ml-1.5 text-xs opacity-70">· {s.teacherName}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TEACHER: upload form — always shown */}
      {role === "TEACHER" && (
        <div className="p-6 space-y-4" style={card}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>
            <span className="material-symbols-outlined text-blue-400">upload_file</span>
            Upload New Material
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Material Title</label>
              <input type="text" placeholder="e.g. Introduction to Java" value={title}
                onChange={(e) => setTitle(e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
            </div>
            <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
              style={{ borderColor: dragOver ? "#4d8eff" : "rgba(66,71,84,0.4)", backgroundColor: dragOver ? "rgba(77,142,255,0.05)" : "transparent" }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById("fileInput").click()}>
              <input id="fileInput" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{getFileIcon(file.name)}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: "#dae2fd" }}>{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-2 text-red-400 hover:text-red-300">✕</button>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-slate-600 mb-3 block">cloud_upload</span>
                  <p className="text-sm text-slate-400">Drop your file here or <span className="text-blue-400">browse</span></p>
                </>
              )}
            </div>
            <button type="submit" disabled={uploading} className="w-full py-3 font-bold rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #4d8eff, #1d4ed8)", color: "#fff", opacity: uploading ? 0.7 : 1 }}>
              {uploading ? "Uploading..." : "Upload Material"}
            </button>
          </form>
        </div>
      )}

      {/* Materials list */}
      {(role !== "STUDENT" || activeSubjectId) && (
        <div style={card} className="overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(66,71,84,0.3)" }}>
            <h2 className="font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>
              {role === "STUDENT" ? `Materials — ${activeSubject?.subjectName || ""}` :
               role === "TEACHER" ? "My Uploaded Materials" : "All Materials"}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(77,142,255,0.15)", color: "#adc6ff" }}>
              {materials.length} file{materials.length !== 1 ? "s" : ""}
            </span>
          </div>

          {materials.length === 0 ? (
            <div className="p-16 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">folder_open</span>
              <p className="text-slate-500">
                {role === "TEACHER" ? "Upload your first material above" : "No materials for this subject yet"}
              </p>
            </div>
          ) : (
            <div>
              {materials.map((m) => (
                <div key={m.id} className="px-6 py-4 transition-colors"
                  style={{ borderTop: "1px solid rgba(66,71,84,0.2)" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a2540"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>

                  {/* Edit mode */}
                  {editingId === m.id ? (
                    <div className="flex items-center gap-3">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={onFocus} onBlur={onBlur}
                        autoFocus
                      />
                      <button onClick={() => handleEditSave(m.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff" }}>
                        Save
                      </button>
                      <button onClick={() => { setEditingId(null); setEditTitle(""); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: "rgba(66,71,84,0.3)", color: "#8c909f" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ backgroundColor: "rgba(77,142,255,0.1)" }}>
                          {getFileIcon(m.fileName)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#dae2fd" }}>{m.title}</p>
                          <p className="text-xs mt-0.5 text-slate-500">{m.fileName}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {m.subjectName && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: "rgba(168,85,247,0.1)", color: "#d8b4fe" }}>
                                {m.subjectName}
                              </span>
                            )}
                            {m.courseName && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff" }}>
                                {m.courseName}
                              </span>
                            )}
                            {m.uploadedByName && role === "STUDENT" && (
                              <span className="text-xs text-slate-600">by {m.uploadedByName}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* TEACHER: Edit + Delete */}
                      {role === "TEACHER" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => { setEditingId(m.id); setEditTitle(m.title); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-blue-500/15"
                            style={{ backgroundColor: "rgba(77,142,255,0.08)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(m.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/15"
                            style={{ backgroundColor: "rgba(255,180,171,0.06)", color: "#ffb4ab", border: "1px solid rgba(255,180,171,0.1)" }}>
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      )}

                      {/* STUDENT / ADMIN: View + Download */}
                      {(role === "STUDENT" || role === "ADMIN") && (
                        <div className="flex gap-2 flex-shrink-0">
                          <a href={m.fileUrl} target="_blank" rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff" }}>View</a>
                          <a href={m.fileUrl} download
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ backgroundColor: "rgba(77,142,255,0.15)", color: "#adc6ff" }}>Download</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student: prompt to select subject */}
      {role === "STUDENT" && !activeSubjectId && courseSubjects.length > 0 && (
        <div className="p-16 text-center" style={card}>
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">menu_book</span>
          <p className="text-slate-400 font-semibold">Select a subject above to view its materials</p>
        </div>
      )}
    </div>
  );
}
