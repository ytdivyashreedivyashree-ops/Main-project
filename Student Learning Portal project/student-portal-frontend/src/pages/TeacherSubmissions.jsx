import { useEffect, useState } from "react";
import { getTeacherSubmissions } from "../services/assignmentService";

const card = { backgroundColor: "#171f33", borderRadius: "1.5rem", border: "1px solid rgba(66,71,84,0.3)" };

export default function TeacherSubmissions() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    getTeacherSubmissions().then((r) => setSubmissions(r.data)).catch(() => alert("Failed to load submissions"));
  }, []);

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold text-blue-400" style={{ fontFamily: "Manrope" }}>Assignment Submissions</h1>
        <p className="text-slate-500 text-sm mt-1">Submissions for assignments created by you</p>
      </div>

      <div style={card} className="overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(66,71,84,0.3)" }}>
          <h2 className="font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>All Submissions</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(77,142,255,0.15)", color: "#adc6ff" }}>
            {submissions.length} total
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">assignment_turned_in</span>
            <p className="text-slate-500">No submissions yet for your assignments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(66,71,84,0.3)" }}>
                  {["Student", "Assignment", "Submitted At", "Status", "File"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid rgba(66,71,84,0.15)" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a2540"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td className="px-6 py-3">
                      <p className="font-semibold" style={{ color: "#dae2fd" }}>{s.studentName}</p>
                      <p className="text-xs text-slate-500">{s.studentEmail}</p>
                    </td>
                    <td className="px-6 py-3 text-slate-400">{s.assignmentTopic}</td>
                    <td className="px-6 py-3 text-xs text-slate-400">
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={s.late
                          ? { backgroundColor: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.15)" }
                          : { backgroundColor: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.15)" }}>
                        {s.late ? "Late" : "On Time"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {s.submissionFileUrl ? (
                        <a href={s.submissionFileUrl} target="_blank" rel="noreferrer"
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                          style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#adc6ff" }}>
                          View File
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">Text only</span>
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
