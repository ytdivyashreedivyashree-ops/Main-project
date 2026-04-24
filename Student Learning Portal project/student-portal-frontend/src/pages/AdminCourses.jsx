import { useEffect, useState } from "react";
import { getAllCourses } from "../services/courseService";
import { getAllStudents, getAllTeachers } from "../services/userService";

const card = { backgroundColor: "#0f1829", borderRadius: "1.25rem", border: "1px solid rgba(77,142,255,0.1)" };

const COURSE_COLORS = {
  BCA: "#4d8eff", BCOM: "#22c55e", BA: "#a855f7", BSC: "#f59e0b",
  MCA: "#06b6d4", MSC: "#f43f5e", MCOM: "#10b981", MA: "#8b5cf6",
  MBA: "#ec4899", MTECH: "#f97316",
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    Promise.allSettled([getAllCourses(), getAllStudents(), getAllTeachers()]).then(
      ([c, s, t]) => {
        if (c.status === "fulfilled") setCourses(c.value.data);
        if (s.status === "fulfilled") setStudents(s.value.data);
        if (t.status === "fulfilled") setTeachers(t.value.data);
      }
    );
  }, []);

  const studentCount = (courseId) => students.filter((s) => s.courseId === courseId).length;
  const teacherCount = (courseId) => teachers.filter((t) => t.courseId === courseId).length;

  return (
    <div className="space-y-6 py-6" style={{ color: "#dae2fd" }}>
      <div>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Manrope", background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          All Courses
        </h1>
        <p className="text-slate-500 text-sm mt-1">Overview of all courses in the portal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => {
          const color = COURSE_COLORS[c.name] || "#4d8eff";
          const sc = studentCount(c.id);
          const tc = teacherCount(c.id);
          return (
            <div key={c.id} className="p-6 transition-all hover:-translate-y-0.5"
              style={{ ...card, borderColor: `${color}22` }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = `${color}44`}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = `${color}22`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                  style={{ background: `${color}22`, color, fontFamily: "Manrope" }}>
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color, fontFamily: "Manrope" }}>{c.name}</p>
                  <p className="text-xs text-slate-600">Course ID: {c.id}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.12)" }}>
                  <p className="text-xl font-black" style={{ color: "#4ade80", fontFamily: "Manrope" }}>{sc}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Students</p>
                </div>
                <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.12)" }}>
                  <p className="text-xl font-black" style={{ color: "#d8b4fe", fontFamily: "Manrope" }}>{tc}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Teachers</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
