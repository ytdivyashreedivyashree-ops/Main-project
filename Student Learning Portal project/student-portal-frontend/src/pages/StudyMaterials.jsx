import { useEffect, useState } from "react";
import { getAllMaterials, uploadMaterial } from "../services/materialService";

const card = { backgroundColor: "#171f33", borderRadius: "1.5rem", border: "1px solid rgba(66,71,84,0.3)" };
const inputStyle = { backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.4)", color: "#dae2fd", borderRadius: "0.75rem", padding: "0.75rem 1rem", outline: "none", fontSize: "0.875rem", width: "100%" };

export default function StudyMaterials() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    try { const r = await getAllMaterials(); setMaterials(r.data); }
    catch { alert("Failed to fetch materials"); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) { alert("Please enter title and choose a file"); return; }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    setUploading(true);
    try { await uploadMaterial(formData); setTitle(""); setFile(null); fetchMaterials(); }
    catch { alert("Upload failed"); }
    finally { setUploading(false); }
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

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold text-blue-400" style={{ fontFamily: "Manrope" }}>Study Materials</h1>
        <p className="text-slate-500 text-sm mt-1">Access and manage learning resources</p>
      </div>

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
                onChange={(e) => setTitle(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.border = "1px solid #4d8eff"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)"} />
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
                  <p className="text-xs text-slate-600 mt-1">PDF, DOC, PPT, XLS and more</p>
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

      <div style={card} className="overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(66,71,84,0.3)" }}>
          <h2 className="font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>Available Materials</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(77,142,255,0.15)", color: "#adc6ff" }}>
            {materials.length} file{materials.length !== 1 ? "s" : ""}
          </span>
        </div>

        {materials.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">folder_open</span>
            <p className="text-slate-500">{role === "TEACHER" ? "Upload your first material above" : "No materials uploaded yet"}</p>
          </div>
        ) : (
          <div>
            {materials.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-6 py-4 group transition-colors"
                style={{ borderTop: "1px solid rgba(66,71,84,0.2)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a2540"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: "rgba(77,142,255,0.1)" }}>
                    {getFileIcon(m.fileName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#dae2fd" }}>{m.title}</p>
                    <p className="text-xs mt-0.5 text-slate-500">{m.fileName}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={m.fileUrl} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff" }}>View</a>
                  <a href={m.fileUrl} download
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ backgroundColor: "rgba(77,142,255,0.15)", color: "#adc6ff" }}>Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
