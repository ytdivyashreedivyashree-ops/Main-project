import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getAllCourses } from "../services/courseService";
import { getSubjectsByCourse } from "../services/subjectService";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "STUDENT", courseId: "",
    subjectId: "", customSubjectName: "",
  });
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isOther, setIsOther] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllCourses().then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  // load subjects when course changes (only for teacher)
  useEffect(() => {
    if (formData.role === "TEACHER" && formData.courseId) {
      getSubjectsByCourse(formData.courseId)
        .then((r) => setSubjects(r.data))
        .catch(() => setSubjects([]));
    } else {
      setSubjects([]);
    }
    setFormData((prev) => ({ ...prev, subjectId: "", customSubjectName: "" }));
    setIsOther(false);
  }, [formData.courseId, formData.role]);

  const handleRoleChange = (e) => {
    setFormData({ ...formData, role: e.target.value, courseId: "", subjectId: "", customSubjectName: "" });
    setSubjects([]);
    setIsOther(false);
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    if (val === "OTHER") {
      setIsOther(true);
      setFormData({ ...formData, subjectId: "", customSubjectName: "" });
    } else {
      setIsOther(false);
      setFormData({ ...formData, subjectId: val, customSubjectName: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === "TEACHER") {
      if (!formData.courseId) { alert("Please select a course"); return; }
      if (!isOther && !formData.subjectId) { alert("Please select a subject"); return; }
      if (isOther && !formData.customSubjectName.trim()) { alert("Please enter your subject name"); return; }
    }
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      courseId: formData.courseId ? Number(formData.courseId) : null,
      subjectId: (!isOther && formData.subjectId) ? Number(formData.subjectId) : null,
      customSubjectName: isOther ? formData.customSubjectName.trim() : null,
    };
    try {
      await axios.post("http://localhost:8080/auth/register", payload);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error in registration");
    }
  };

  const inputBase = {
    backgroundColor: "#0d1424", border: "1px solid rgba(77,142,255,0.15)",
    color: "#dae2fd", borderRadius: "0.875rem", width: "100%",
    padding: "0.75rem 1rem", outline: "none", fontSize: "0.875rem", transition: "all 0.2s",
  };
  const onFocus = (e) => { e.target.style.borderColor = "#4d8eff"; e.target.style.backgroundColor = "#131f35"; e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.1)"; };
  const onBlur = (e) => { e.target.style.borderColor = "rgba(77,142,255,0.15)"; e.target.style.backgroundColor = "#0d1424"; e.target.style.boxShadow = "none"; };

  const needsCourse = formData.role === "STUDENT" || formData.role === "TEACHER";
  const needsSubject = formData.role === "TEACHER";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#080e1f", color: "#dae2fd", fontFamily: "Inter, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ backgroundColor: "#4d8eff" }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ backgroundColor: "#7c3aed" }} />
      </div>

      <header className="fixed top-0 w-full z-50 flex items-center justify-center px-6 py-4"
        style={{ backgroundColor: "rgba(8,14,31,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(77,142,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", boxShadow: "0 4px 16px rgba(77,142,255,0.4)" }}>
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span className="text-lg font-extrabold" style={{ fontFamily: "Manrope", background: "linear-gradient(135deg,#adc6ff,#4d8eff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            EduPortal
          </span>
        </div>
      </header>

      <main className="grow flex items-center justify-center px-4 pt-24 pb-12 relative z-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: "Manrope" }}>Create Your Account</h1>
            <p className="text-slate-500 text-sm mt-2">Join the academic portal today</p>
          </div>

          <div className="rounded-2xl p-7"
            style={{ backgroundColor: "#0f1829", border: "1px solid rgba(77,142,255,0.12)", boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}>
            <form onSubmit={handleSubmit} className="space-y-4">

              {[
                { label: "Full Name", name: "name", type: "text", placeholder: "Your full name" },
                { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com" },
                { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
              ].map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{f.label}</label>
                  <input type={f.type} name={f.name} value={formData[f.name]} placeholder={f.placeholder} required
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                </div>
              ))}

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Role</label>
                <select name="role" value={formData.role} onChange={handleRoleChange}
                  style={{ ...inputBase, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Course */}
              {needsCourse && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Course</label>
                  <select name="courseId" value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    required style={{ ...inputBase, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select Course</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {/* Subject — teacher only, appears after course selected */}
              {needsSubject && formData.courseId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject You Teach</label>
                  <select value={isOther ? "OTHER" : formData.subjectId}
                    onChange={handleSubjectChange}
                    style={{ ...inputBase, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select Subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                    <option value="OTHER">Other (type your own)</option>
                  </select>
                </div>
              )}

              {/* Custom subject input */}
              {needsSubject && isOther && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enter Subject Name</label>
                  <input type="text" placeholder="e.g. Advanced Robotics"
                    value={formData.customSubjectName}
                    onChange={(e) => setFormData({ ...formData, customSubjectName: e.target.value })}
                    style={inputBase} onFocus={onFocus} onBlur={onBlur} required={isOther} />
                </div>
              )}

              <button type="submit" className="w-full py-3 font-bold rounded-xl transition-all active:scale-[0.98] mt-2"
                style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 24px rgba(77,142,255,0.4)" }}>
                Create Account
              </button>
            </form>

            <p className="text-center text-slate-600 text-sm mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
