import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents, getAllTeachers } from "../services/userService";
import { getAllCourses } from "../services/courseService";
import { getAllSubjects } from "../services/subjectService";

const card = {
  backgroundColor: "#0f1829",
  borderRadius: "1.25rem",
  border: "1px solid rgba(77,142,255,0.1)",
};

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className="p-6 cursor-pointer transition-all hover:-translate-y-1"
      style={{ ...card, borderColor: `${color}22`, boxShadow: `0 4px 24px rgba(0,0,0,0.3)` }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = `${color}55`}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = `${color}22`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}>
          <span className="material-symbols-outlined text-2xl" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <span className="text-3xl font-black" style={{ color, fontFamily: "Manrope" }}>{value}</span>
      </div>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="text-xs text-slate-600 mt-1">Click to manage →</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, subjects: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      getAllStudents(),
      getAllTeachers(),
      getAllCourses(),
      getAllSubjects(),
    ]).then(([s, t, c, sub]) => {
      setStats({
        students: s.status === "fulfilled" ? s.value.data.length : 0,
        teachers: t.status === "fulfilled" ? t.value.data.length : 0,
        courses: c.status === "fulfilled" ? c.value.data.length : 0,
        subjects: sub.status === "fulfilled" ? sub.value.data.length : 0,
      });
    });
  }, []);

  const statCards = [
    { icon: "group", label: "Total Students", value: stats.students, color: "#22c55e", path: "/admin/students" },
    { icon: "school", label: "Total Teachers", value: stats.teachers, color: "#a855f7", path: "/admin/teachers" },
    { icon: "library_books", label: "Total Courses", value: stats.courses, color: "#4d8eff", path: "/admin/courses" },
    { icon: "menu_book", label: "Total Subjects", value: stats.subjects, color: "#f59e0b", path: "/subjects" },
  ];

  const quickActions = [
    { icon: "person_add", label: "Manage Students", desc: "View and manage all students", path: "/admin/students", color: "#22c55e" },
    { icon: "manage_accounts", label: "Manage Teachers", desc: "View and manage all teachers", path: "/admin/teachers", color: "#a855f7" },
    { icon: "library_books", label: "Manage Courses", desc: "View all available courses", path: "/admin/courses", color: "#4d8eff" },
    { icon: "menu_book", label: "Manage Subjects", desc: "Add and manage subjects per course", path: "/subjects", color: "#f59e0b" },
    { icon: "folder_open", label: "Study Materials", desc: "View all uploaded materials", path: "/materials", color: "#06b6d4" },
    { icon: "assignment", label: "Assignments", desc: "View all assignments", path: "/assignments", color: "#f43f5e" },
  ];

  return (
    <div className="space-y-8 py-6" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Manrope", background: "linear-gradient(135deg,#fcd34d,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Admin Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your entire academic portal from here</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} onClick={() => navigate(s.path)} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="p-5 text-left transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ ...card, borderColor: `${a.color}22` }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = `${a.color}44`}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = `${a.color}22`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${a.color}18` }}>
                  <span className="material-symbols-outlined text-lg" style={{ color: a.color, fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                </div>
                <p className="font-bold text-sm" style={{ color: "#dae2fd", fontFamily: "Manrope" }}>{a.label}</p>
              </div>
              <p className="text-xs text-slate-500">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
