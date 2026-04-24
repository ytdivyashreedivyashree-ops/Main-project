import { useEffect, useState } from "react";
import { getAllStudents } from "../services/userService";

const card = { backgroundColor: "#0f1829", borderRadius: "1.25rem", border: "1px solid rgba(77,142,255,0.1)" };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllStudents().then((r) => setStudents(r.data)).catch(() => alert("Failed to load students"));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.course?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Manrope", background: "linear-gradient(135deg,#22c55e,#16a34a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            All Students
          </h1>
          <p className="text-slate-500 text-sm mt-1">All registered students across all courses</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
          {students.length} total
        </span>
      </div>

      <input
        type="text"
        placeholder="Search by name, email or course..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ backgroundColor: "#0f1829", border: "1px solid rgba(77,142,255,0.15)", color: "#dae2fd", borderRadius: "0.875rem", padding: "0.75rem 1rem", outline: "none", fontSize: "0.875rem", width: "100%", maxWidth: "400px" }}
        onFocus={(e) => e.target.style.borderColor = "#4d8eff"}
        onBlur={(e) => e.target.style.borderColor = "rgba(77,142,255,0.15)"}
      />

      <div style={card} className="overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(77,142,255,0.08)" }}>
          <h2 className="font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>Student List</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">group</span>
            <p className="text-slate-500">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(77,142,255,0.08)" }}>
                  {["#", "Name", "Email", "Course"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid rgba(77,142,255,0.05)" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#131f35"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td className="px-6 py-3 text-slate-600 text-xs">{i + 1}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                          {s.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold" style={{ color: "#dae2fd" }}>{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-400">{s.email}</td>
                    <td className="px-6 py-3">
                      {s.courseName ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff", border: "1px solid rgba(77,142,255,0.15)" }}>
                          {s.courseName}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
