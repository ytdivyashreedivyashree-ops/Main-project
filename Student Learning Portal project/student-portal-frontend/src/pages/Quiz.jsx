import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAssignments, getMyAssignments } from "../services/assignmentService";
import { createQuiz, getAllQuizzes, getMyQuizzes, getQuizzesBySubject, submitQuiz, getMyResults, getQuizResults, hasAttempted, deleteQuiz } from "../services/quizService";
import { getSubjectsByCourseWithTeachers } from "../services/subjectService";
import { getMe } from "../services/userService";

const card = { backgroundColor: "#171f33", borderRadius: "1.5rem", border: "1px solid rgba(66,71,84,0.3)" };
const inputStyle = { backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.4)", color: "#dae2fd", borderRadius: "0.75rem", padding: "0.65rem 1rem", outline: "none", fontSize: "0.875rem", width: "100%" };

export default function Quiz() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [attemptedMap, setAttemptedMap] = useState({});
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [resultPopup, setResultPopup] = useState(null);
  const [teacherResults, setTeacherResults] = useState({});
  const [form, setForm] = useState({ title: "", assignmentId: "", questions: [{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" }] });
  const [courseSubjects, setCourseSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState("");

  useEffect(() => {
    if (role === "STUDENT") {
      getMe().then((r) => {
        if (r.data.courseId) {
          getSubjectsByCourseWithTeachers(r.data.courseId).then((res) => {
            const unique = res.data.filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
            setCourseSubjects(unique);
          }).catch(() => {});
        }
      }).catch(() => {});
      getMyResults().then((r) => setMyResults(r.data)).catch(() => {});
    } else {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (role === "STUDENT" && activeSubjectId) {
      getQuizzesBySubject(activeSubjectId).then(async (qRes) => {
        setQuizzes(qRes.data);
        const map = {};
        for (const q of qRes.data) { try { const r = await hasAttempted(q.id); map[q.id] = r.data; } catch { map[q.id] = false; } }
        setAttemptedMap(map);
      }).catch(() => {});
    } else if (role === "STUDENT" && !activeSubjectId) {
      setQuizzes([]);
    }
  }, [activeSubjectId, role]);

  const fetchData = async () => {
    try {
      // teacher sees only their own assignments and quizzes
      const aRes = role === "TEACHER" ? await getMyAssignments() : await getAllAssignments();
      const qRes = role === "TEACHER" ? await getMyQuizzes() : await getAllQuizzes();
      setAssignments(aRes.data);
      setQuizzes(qRes.data);
      if (role === "STUDENT") {
        const rRes = await getMyResults();
        setMyResults(rRes.data);
        const map = {};
        for (const q of qRes.data) { try { const r = await hasAttempted(q.id); map[q.id] = r.data; } catch { map[q.id] = false; } }
        setAttemptedMap(map);
      }
    } catch (err) { console.error(err); }
  };

  const addQuestion = () => setForm((f) => ({ ...f, questions: [...f.questions, { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" }] }));
  const removeQuestion = (i) => setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  const updateQuestion = (i, field, value) => setForm((f) => { const qs = [...f.questions]; qs[i] = { ...qs[i], [field]: value }; return { ...f, questions: qs }; });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createQuiz({ ...form, assignmentId: Number(form.assignmentId) });
      setForm({ title: "", assignmentId: "", questions: [{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" }] });
      fetchData();
    } catch (err) { alert("Error: " + (err.response?.data?.message || err.message)); }
  };

  const handleSubmit = async (quizId) => {
    if (Object.keys(answers).length !== activeQuiz.questions.length) { alert("Please answer all questions"); return; }
    try {
      const numericAnswers = {};
      for (const [k, v] of Object.entries(answers)) numericAnswers[Number(k)] = v;
      const res = await submitQuiz({ quizId, answers: numericAnswers });
      setResultPopup(res.data); setActiveQuiz(null); setAnswers({}); fetchData();
    } catch (err) { alert(err.response?.data?.message || "Submission failed"); }
  };

  const handleViewResults = async (quizId) => {
    if (teacherResults[quizId]) { setTeacherResults((p) => { const n = { ...p }; delete n[quizId]; return n; }); return; }
    const res = await getQuizResults(quizId);
    setTeacherResults((p) => ({ ...p, [quizId]: res.data }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    await deleteQuiz(id); fetchData();
  };

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-400" style={{ fontFamily: "Manrope" }}>Quiz</h1>
          <p className="text-slate-500 text-sm mt-1">MCQ quizzes based on assignments</p>
        </div>
        {role === "STUDENT" && (
          <button onClick={() => navigate("/")} title="Go to Home"
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: "rgba(77,142,255,0.1)", border: "1px solid rgba(77,142,255,0.2)", color: "#adc6ff" }}>
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        )}
      </div>

      {role === "TEACHER" && (
        <form onSubmit={handleCreate} className="p-6 space-y-4" style={card}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "Manrope", color: "#dae2fd" }}>
            <span className="material-symbols-outlined text-blue-400">quiz</span> Create MCQ Quiz
          </h2>
          <input placeholder="Quiz Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={inputStyle}
            onFocus={(e) => e.target.style.border = "1px solid #4d8eff"} onBlur={(e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)"} />
          <select value={form.assignmentId} onChange={(e) => setForm({ ...form, assignmentId: e.target.value })} required style={{ ...inputStyle, cursor: "pointer" }}
            onFocus={(e) => e.target.style.border = "1px solid #4d8eff"} onBlur={(e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)"}>
            <option value="">-- Select Assignment --</option>
            {assignments.map((a) => <option key={a.id} value={a.id}>{a.topic}</option>)}
          </select>

          {form.questions.map((q, i) => (
            <div key={i} className="p-4 space-y-3 rounded-2xl" style={{ backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.3)" }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-blue-400">Question {i + 1}</span>
                {form.questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                )}
              </div>
              <input placeholder="Question" value={q.question} onChange={(e) => updateQuestion(i, "question", e.target.value)} required style={inputStyle}
                onFocus={(e) => e.target.style.border = "1px solid #4d8eff"} onBlur={(e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)"} />
              {["A", "B", "C", "D"].map((opt) => (
                <input key={opt} placeholder={`Option ${opt}`} value={q[`option${opt}`]} onChange={(e) => updateQuestion(i, `option${opt}`, e.target.value)} required style={inputStyle}
                  onFocus={(e) => e.target.style.border = "1px solid #4d8eff"} onBlur={(e) => e.target.style.border = "1px solid rgba(66,71,84,0.4)"} />
              ))}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Correct Answer:</label>
                <select value={q.correctOption} onChange={(e) => updateQuestion(i, "correctOption", e.target.value)}
                  style={{ ...inputStyle, width: "auto", padding: "0.4rem 0.75rem" }}>
                  {["A", "B", "C", "D"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors">
            + Add Question
          </button>
          <button type="submit" className="w-full py-3 font-bold rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #4d8eff, #1d4ed8)", color: "#fff" }}>
            Create Quiz
          </button>
        </form>
      )}

      {/* STUDENT: mandatory subject selector */}
      {role === "STUDENT" && (
        <div style={card} className="p-5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
            Select Subject
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

      {/* Quiz List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-300" style={{ fontFamily: "Manrope" }}>All Quizzes</h2>
        {role === "STUDENT" && !activeSubjectId && courseSubjects.length > 0 ? (
          <div className="p-16 text-center rounded-3xl" style={card}>
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">quiz</span>
            <p className="text-slate-400 font-semibold">Select a subject above to view its quizzes</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-16 text-center rounded-3xl" style={card}>
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">quiz</span>
            <p className="text-slate-500">No quizzes available</p>
          </div>
        ) : quizzes.map((quiz) => (
          <div key={quiz.id} className="p-5" style={card}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>{quiz.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Assignment: <span className="text-blue-400">{quiz.assignmentTopic}</span></p>
                <p className="text-xs text-slate-600 mt-1">{quiz.questions.length} question(s)</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {role === "STUDENT" && (
                  attemptedMap[quiz.id]
                    ? <span className="flex items-center gap-1 text-green-400 text-sm font-semibold"><span className="material-symbols-outlined text-base">check_circle</span> Attempted</span>
                    : <button onClick={() => { setActiveQuiz(quiz); setAnswers({}); }}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #4d8eff, #1d4ed8)", color: "#fff" }}>Take Quiz</button>
                )}
                {role === "TEACHER" && (
                  <>
                    <button onClick={() => handleViewResults(quiz.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ backgroundColor: "rgba(173,198,255,0.1)", color: "#adc6ff" }}>
                      {teacherResults[quiz.id] ? "Hide Results" : "View Results"}
                    </button>
                    <button onClick={() => handleDelete(quiz.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ backgroundColor: "rgba(255,180,171,0.1)", color: "#ffb4ab" }}>Delete</button>
                  </>
                )}
              </div>
            </div>

            {role === "TEACHER" && teacherResults[quiz.id] && (
              <div className="mt-4 overflow-x-auto rounded-xl" style={{ backgroundColor: "#131b2e" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(66,71,84,0.3)" }}>
                      {["Student", "Score", "Submitted At"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#8c909f" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teacherResults[quiz.id].length === 0
                      ? <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No submissions yet</td></tr>
                      : teacherResults[quiz.id].map((r) => (
                        <tr key={r.id} style={{ borderTop: "1px solid rgba(66,71,84,0.2)" }}>
                          <td className="px-4 py-3" style={{ color: "#dae2fd" }}>{r.studentEmail}</td>
                          <td className="px-4 py-3 font-bold" style={{ color: r.score / r.total >= 0.5 ? "#4ade80" : "#f87171" }}>{r.score} / {r.total}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.submittedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* My Results */}
      {role === "STUDENT" && myResults.length > 0 && (
        <div className="p-5" style={card}>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Manrope", color: "#dae2fd" }}>My Quiz Results</h2>
          <div className="space-y-3">
            {myResults.map((r) => (
              <div key={r.id} className="flex justify-between items-center py-3 border-b" style={{ borderColor: "rgba(66,71,84,0.3)" }}>
                <span className="font-medium text-sm" style={{ color: "#dae2fd" }}>{r.quizTitle}</span>
                <span className="text-lg font-extrabold" style={{ color: r.score / r.total >= 0.5 ? "#4ade80" : "#f87171" }}>
                  {r.score} / {r.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Take Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-5" style={{ backgroundColor: "#171f33", border: "1px solid rgba(66,71,84,0.4)" }}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-400" style={{ fontFamily: "Manrope" }}>{activeQuiz.title}</h2>
              <button onClick={() => setActiveQuiz(null)} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
            </div>
            {activeQuiz.questions.map((q, i) => (
              <div key={q.id} className="space-y-3">
                <p className="font-semibold text-sm" style={{ color: "#dae2fd" }}>{i + 1}. {q.question}</p>
                {["A", "B", "C", "D"].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{ border: `1px solid ${answers[q.id] === opt ? "#4d8eff" : "rgba(66,71,84,0.3)"}`, backgroundColor: answers[q.id] === opt ? "rgba(77,142,255,0.1)" : "transparent" }}>
                    <input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))} className="accent-blue-500" />
                    <span className="font-bold text-blue-400 text-sm">{opt}.</span>
                    <span className="text-sm" style={{ color: "#dae2fd" }}>{q[`option${opt}`]}</span>
                  </label>
                ))}
              </div>
            ))}
            <button onClick={() => handleSubmit(activeQuiz.id)}
              className="w-full py-3 font-bold rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff" }}>
              Submit Quiz
            </button>
          </div>
        </div>
      )}

      {/* Score Popup */}
      {resultPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl p-8 text-center space-y-4 w-80" style={{ backgroundColor: "#171f33", border: "1px solid rgba(66,71,84,0.4)" }}>
            <div className="text-5xl">{resultPopup.score / resultPopup.total >= 0.5 ? "🎉" : "📚"}</div>
            <h2 className="text-2xl font-bold" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>Quiz Submitted!</h2>
            <p className="text-slate-500 text-sm">Your Score</p>
            <p className="text-4xl font-extrabold" style={{ color: resultPopup.score / resultPopup.total >= 0.5 ? "#4ade80" : "#f87171" }}>
              {resultPopup.score} / {resultPopup.total}
            </p>
            <p className="text-slate-500 text-sm">{Math.round((resultPopup.score / resultPopup.total) * 100)}%</p>
            <button onClick={() => setResultPopup(null)}
              className="w-full py-2.5 font-bold rounded-xl transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #4d8eff, #1d4ed8)", color: "#fff" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
