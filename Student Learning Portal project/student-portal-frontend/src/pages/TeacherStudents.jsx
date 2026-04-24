import { useEffect, useState } from "react";
import { getStudentsInMyCourse } from "../services/userService";

const card = { backgroundColor: "#171f33", borderRadius: "1.5rem", border: "1px solid rgba(66,71,84,0.3)" };

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getStudentsInMyCourse().then((r) => setStudents(r.data)).catch(() => alert("Failed to load students"));
  }, []);

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold text-blue-400" style={{ fontFamily: "Manrope" }}>My Course Students</h1>
        <p className="text-slate-500 text-sm mt-1">Students enrolled in your course</p>
      </div>

      <div style={card} className="overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(66,71,84,0.3)" }}>
          <h2 className="font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>Student List</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(77,142,255,0.15)", color: "#adc6ff" }}>
            {students.length} student{students.length !== 1 ? "s" : ""}
          </span>
        </div>

        {students.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">group</span>
            <p className="text-slate-500">No students found in your course</p>
          </div>
        ) : (
          <div>
            {students.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 px-6 py-4 transition-colors"
                style={{ borderTop: i > 0 ? "1px solid rgba(66,71,84,0.2)" : "none" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a2540"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                  {s.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#dae2fd" }}>{s.name}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.15)" }}>
                  {s.courseName || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
