import { useEffect, useState } from "react";
import {
  createAssignment,
  deleteAssignment,
  getAllAssignments,
  getUpcomingAssignments,
  getOverdueAssignments,
  submitAssignment,
  checkSubmitted,
} from "../services/assignmentService";

const card = {
  backgroundColor: "#111827",
  borderRadius: "1.25rem",
  border: "1px solid rgba(77,142,255,0.1)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};
const inputStyle = {
  backgroundColor: "#0d1424",
  border: "1px solid rgba(77,142,255,0.15)",
  color: "#dae2fd",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  outline: "none",
  fontSize: "0.875rem",
  width: "100%",
  transition: "border-color 0.2s, background-color 0.2s",
};

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [submittedMap, setSubmittedMap] = useState({});
  const role = localStorage.getItem("role");

  const fetchAssignments = async (type = "ALL") => {
    try {
      let res;
      if (type === "UPCOMING") res = await getUpcomingAssignments();
      else if (type === "OVERDUE") res = await getOverdueAssignments();
      else res = await getAllAssignments();
      setAssignments(res.data);
      if (role === "STUDENT") {
        const map = {};
        for (const a of res.data) {
          try {
            const r = await checkSubmitted(a.id);
            map[a.id] = r.data;
          } catch {
            map[a.id] = false;
          }
        }
        setSubmittedMap(map);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssignments(filterType);
  }, [filterType]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("description", description);
      formData.append("dueDate", dueDate);
      if (file) formData.append("file", file);
      await createAssignment(formData);
      setTopic("");
      setDescription("");
      setDueDate("");
      setFile(null);
      fetchAssignments(filterType);
    } catch (err) {
      alert(
        "Error creating assignment: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await deleteAssignment(id);
      fetchAssignments(filterType);
    } catch {
      alert("Delete failed");
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const selectedFile = submissionFiles[assignmentId];
    if (!selectedFile) {
      alert("Please choose a file first");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("file", selectedFile);
      await submitAssignment(formData);
      setSubmittedMap((p) => ({ ...p, [assignmentId]: true }));
      setSubmissionFiles((p) => ({ ...p, [assignmentId]: null }));
    } catch (err) {
      alert(err.response?.data?.message || "Submit failed");
    }
  };

  const filters = ["ALL", "UPCOMING", "OVERDUE"];
  const filterIcons = { ALL: "list", UPCOMING: "upcoming", OVERDUE: "warning" };

  return (
    <div className="space-y-7 py-6" style={{ color: "#dae2fd" }}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              fontFamily: "Manrope",
              background: "linear-gradient(135deg,#adc6ff,#4d8eff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Assignments
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and submit your assignments
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg,#4d8eff22,#1d4ed822)",
            border: "1px solid rgba(77,142,255,0.2)",
          }}
        >
          <span
            className="material-symbols-outlined text-blue-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            assignment
          </span>
        </div>
      </div>

      {/* Create Form */}
      {role === "TEACHER" && (
        <form
          onSubmit={handleCreate}
          className="p-7 space-y-4"
          style={{
            ...card,
            background: "linear-gradient(135deg, #111827 0%, #0f1e35 100%)",
            boxShadow:
              "0 8px 32px rgba(77,142,255,0.08), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#4d8eff,#1d4ed8)",
                boxShadow: "0 4px 12px rgba(77,142,255,0.3)",
              }}
            >
              <span
                className="material-symbols-outlined text-white text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_task
              </span>
            </div>
            <h2
              className="text-base font-bold text-white"
              style={{ fontFamily: "Manrope" }}
            >
              Create Assignment
            </h2>
          </div>

          <input
            placeholder="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "#4d8eff";
              e.target.style.backgroundColor = "#131f35";
              e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(77,142,255,0.15)";
              e.target.style.backgroundColor = "#0d1424";
              e.target.style.boxShadow = "none";
            }}
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4d8eff";
              e.target.style.backgroundColor = "#131f35";
              e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(77,142,255,0.15)";
              e.target.style.backgroundColor = "#0d1424";
              e.target.style.boxShadow = "none";
            }}
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            style={{ ...inputStyle, colorScheme: "dark" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4d8eff";
              e.target.style.backgroundColor = "#131f35";
              e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(77,142,255,0.15)";
              e.target.style.backgroundColor = "#0d1424";
              e.target.style.boxShadow = "none";
            }}
          />

          <div className="flex items-center gap-3">
            <label
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all hover:bg-blue-500/10"
              style={{
                backgroundColor: "rgba(77,142,255,0.06)",
                color: "#adc6ff",
                border: "1px dashed rgba(77,142,255,0.25)",
              }}
            >
              <span className="material-symbols-outlined text-base">
                attach_file
              </span>
              {file ? file.name : "Attach File (optional)"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-red-400 text-xs hover:text-red-300 transition-colors"
              >
                ✕ Remove
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 font-bold rounded-xl transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #4d8eff, #1d4ed8)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(77,142,255,0.35)",
            }}
          >
            Create Assignment
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={
              filterType === f
                ? {
                    background: "linear-gradient(135deg,#4d8eff,#1d4ed8)",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(77,142,255,0.3)",
                  }
                : {
                    backgroundColor: "#111827",
                    color: "#8c909f",
                    border: "1px solid rgba(77,142,255,0.1)",
                  }
            }
          >
            <span className="material-symbols-outlined text-sm">
              {filterIcons[f]}
            </span>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="p-16 text-center" style={card}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(77,142,255,0.06)",
                border: "1px solid rgba(77,142,255,0.1)",
              }}
            >
              <span className="material-symbols-outlined text-3xl text-slate-600">
                assignment
              </span>
            </div>
            <p className="text-slate-500 font-medium">No assignments found</p>
          </div>
        ) : (
          assignments.map((a) => {
            const today = new Date();
            const due = new Date(a.dueDate);
            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);
            let dueStyle;
            if (due < today) {
              dueStyle = { backgroundColor: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.15)" };
            } else if ((due - today) / (1000 * 60 * 60 * 24) <= 1) {
              dueStyle = { backgroundColor: "rgba(251,146,60,0.1)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" };
            } else {
              dueStyle = { backgroundColor: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.15)" };
            }
            return (
            <div
              key={a.id}
              className="p-6 transition-all duration-300 hover:-translate-y-0.5"
              style={{ ...card, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(77,142,255,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(77,142,255,0.1)")
              }
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3
                    className="text-lg font-bold leading-tight"
                    style={{ color: "#e8eeff", fontFamily: "Manrope" }}
                  >
                    {a.topic}
                  </h3>
                  <p
                    className="text-sm mt-2 leading-relaxed"
                    style={{ color: "#6b7280" }}
                  >
                    {a.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={dueStyle}
                    >
                      <span className="material-symbols-outlined text-xs">
                        schedule
                      </span>
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                    {a.fileUrl && (
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all hover:bg-blue-500/15"
                        style={{
                          backgroundColor: "rgba(77,142,255,0.08)",
                          color: "#adc6ff",
                          border: "1px solid rgba(77,142,255,0.15)",
                        }}
                      >
                        <span className="material-symbols-outlined text-xs">
                          attach_file
                        </span>
                        Attachment
                      </a>
                    )}
                  </div>
                </div>
                {role === "TEACHER" && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-red-500/15"
                    style={{
                      backgroundColor: "rgba(255,180,171,0.06)",
                      color: "#ffb4ab",
                      border: "1px solid rgba(255,180,171,0.1)",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>{" "}
                    Delete
                  </button>
                )}
              </div>

              {role === "STUDENT" && (
                <div
                  className="mt-5 pt-4"
                  style={{ borderTop: "1px solid rgba(77,142,255,0.08)" }}
                >
                  {submittedMap[a.id] ? (
                    <div
                      className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl w-fit"
                      style={{
                        backgroundColor: "rgba(34,197,94,0.08)",
                        color: "#4ade80",
                        border: "1px solid rgba(34,197,94,0.15)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-base"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      Already Submitted
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <label
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all hover:bg-blue-500/10"
                        style={{
                          backgroundColor: "rgba(77,142,255,0.06)",
                          color: "#adc6ff",
                          border: "1px dashed rgba(77,142,255,0.2)",
                        }}
                      >
                        <span className="material-symbols-outlined text-base">
                          upload_file
                        </span>
                        {submissionFiles[a.id]
                          ? submissionFiles[a.id].name
                          : "Choose File"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) =>
                            setSubmissionFiles((p) => ({
                              ...p,
                              [a.id]: e.target.files[0],
                            }))
                          }
                        />
                      </label>
                      <button
                        onClick={() => handleSubmitAssignment(a.id)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                        style={{
                          background: "linear-gradient(135deg,#22c55e,#16a34a)",
                          color: "#fff",
                          boxShadow: "0 4px 16px rgba(34,197,94,0.25)",
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
