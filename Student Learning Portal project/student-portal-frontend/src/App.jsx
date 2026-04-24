import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "./services/userService";

import StudentList from "./pages/StudentList";
import StudentHome from "./pages/StudentHome";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudyMaterials from "./pages/StudyMaterials";
import Assignments from "./pages/Assignments";
import Quiz from "./pages/Quiz";
import TeacherStudents from "./pages/TeacherStudents";
import AddMarks from "./pages/AddMarks";
import TeacherSubmissions from "./pages/TeacherSubmissions";
import MyMarks from "./pages/MyMarks";
import ManageSubjects from "./pages/ManageSubjects";
import MySubjects from "./pages/MySubjects";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import AdminTeachers from "./pages/AdminTeachers";
import AdminCourses from "./pages/AdminCourses";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function SidebarLink({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center px-6 py-3.5 transition-all duration-200 group ${
          isActive
            ? "bg-blue-500/10 text-blue-400 border-r-4 border-blue-400"
            : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className="material-symbols-outlined mr-3 text-xl transition-transform duration-200 group-hover:scale-110"
            style={{
              fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {icon}
          </span>
          <span
            className="font-semibold text-sm"
            style={{ fontFamily: "Manrope" }}
          >
            {label}
          </span>
          {isActive && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
          )}
        </>
      )}
    </NavLink>
  );
}

// Sidebar section label
function SidebarSection({ label }) {
  return (
    <p className="px-6 pt-4 pb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
      {label}
    </p>
  );
}

function getNavLinks(role) {
  if (role === "ADMIN")
    return {
      sections: [
        {
          label: "Overview",
          links: [
            { to: "/", icon: "dashboard", label: "Dashboard", exact: true },
          ],
        },
        {
          label: "Manage Users",
          links: [
            { to: "/admin/students", icon: "group", label: "All Students" },
            { to: "/admin/teachers", icon: "school", label: "All Teachers" },
          ],
        },
        {
          label: "Academic",
          links: [
            {
              to: "/admin/courses",
              icon: "library_books",
              label: "All Courses",
            },
            { to: "/subjects", icon: "menu_book", label: "Subjects" },
            { to: "/materials", icon: "folder_open", label: "Study Materials" },
            { to: "/assignments", icon: "assignment", label: "Assignments" },
            { to: "/quiz", icon: "quiz", label: "Quiz" },
          ],
        },
      ],
    };

  if (role === "TEACHER")
    return {
      sections: [
        {
          label: "General",
          links: [
            { to: "/", icon: "dashboard", label: "Home", exact: true },
            { to: "/materials", icon: "folder_open", label: "Materials" },
            { to: "/assignments", icon: "assignment", label: "Assignments" },
            { to: "/quiz", icon: "quiz", label: "Quiz" },
            { to: "/profile", icon: "account_circle", label: "My Profile" },
          ],
        },
        {
          label: "My Students",
          links: [
            { to: "/add", icon: "person_add", label: "Add Student" },
            { to: "/teacher/students", icon: "group", label: "View Students" },
          ],
        },
        {
          label: "Academic",
          links: [
            {
              to: "/teacher/submissions",
              icon: "assignment_turned_in",
              label: "Submissions",
            },
            { to: "/teacher/marks", icon: "grade", label: "Marks" },
          ],
        },
      ],
    };

  if (role === "STUDENT")
    return {
      sections: [
        {
          label: "",
          links: [
            { to: "/", icon: "dashboard", label: "Home", exact: true },
            { to: "/profile", icon: "account_circle", label: "My Profile" },
          ],
        },
      ],
    };

  return {
    sections: [
      {
        label: "",
        links: [{ to: "/", icon: "dashboard", label: "Home", exact: true }],
      },
    ],
  };
}

function getRoleColor(role) {
  if (role === "TEACHER") return "linear-gradient(135deg,#a855f7,#7c3aed)";
  if (role === "ADMIN") return "linear-gradient(135deg,#f59e0b,#d97706)";
  return "linear-gradient(135deg,#22c55e,#16a34a)";
}

function getRoleBadgeStyle(role) {
  if (role === "TEACHER")
    return {
      backgroundColor: "rgba(168,85,247,0.1)",
      color: "#d8b4fe",
      border: "1px solid rgba(168,85,247,0.2)",
    };
  if (role === "ADMIN")
    return {
      backgroundColor: "rgba(245,158,11,0.1)",
      color: "#fcd34d",
      border: "1px solid rgba(245,158,11,0.2)",
    };
  return {
    backgroundColor: "rgba(34,197,94,0.1)",
    color: "#86efac",
    border: "1px solid rgba(34,197,94,0.2)",
  };
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (token) {
      getMe().then((r) => setUserName(r.data.name || "")).catch(() => {});
    }
  }, [token]);
  const hideLayout =
    location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (hideLayout || !token) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="*"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
      </Routes>
    );
  }

  const { sections } = getNavLinks(role);
  const allLinks = sections.flatMap((s) => s.links);

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: "#080e1f",
        color: "#dae2fd",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-50"
        style={{
          backgroundColor: "#0f1829",
          borderRight: "1px solid rgba(77,142,255,0.08)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <div className="px-6 py-6 mb-1">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4d8eff, #1d4ed8)",
                boxShadow: "0 4px 16px rgba(77,142,255,0.4)",
              }}
            >
              <span
                className="material-symbols-outlined text-white text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <div>
              <h1
                className="text-lg font-extrabold text-white leading-tight"
                style={{ fontFamily: "Manrope" }}
              >
                EduPortal
              </h1>
              <p className="text-[11px] text-slate-600 font-medium tracking-wide">
                Academic Portal
              </p>
            </div>
          </div>
        </div>

        <div
          className="mx-6 mb-2 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(77,142,255,0.15), transparent)",
          }}
        />

        {/* Nav with sections */}
        <nav className="flex-1 overflow-y-auto pb-2">
          {sections.map((section) => (
            <div key={section.label}>
              {section.label && <SidebarSection label={section.label} />}
              {section.links.map((l) => (
                <SidebarLink key={l.to} {...l} end={l.exact} />
              ))}
            </div>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 pb-6">
          <div
            className="mx-2 mb-3 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(77,142,255,0.1), transparent)",
            }}
          />
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
            style={{
              backgroundColor: "rgba(77,142,255,0.05)",
              border: "1px solid rgba(77,142,255,0.08)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: getRoleColor(role) }}
            >
              {userName ? userName.charAt(0).toUpperCase() : role?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-300 truncate">{userName || role}</p>
              <p className="text-[10px] text-slate-600 truncate">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10 text-slate-500 hover:text-red-400"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-40 flex justify-between items-center px-8 py-4"
          style={{
            backgroundColor: "rgba(8,14,31,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(77,142,255,0.06)",
          }}
        >
          <h2
            className="text-xl font-black tracking-tight"
            style={{
              fontFamily: "Manrope",
              background: "linear-gradient(135deg, #adc6ff, #4d8eff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Learning Portal
          </h2>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={getRoleBadgeStyle(role)}
            >
              {userName || role}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <span className="material-symbols-outlined text-base">
                logout
              </span>
              Logout
            </button>
          </div>
        </header>

        <div className="px-8 pb-24 md:pb-8">
          <Routes>
            {/* Home route — role-based */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {role === "ADMIN" ? <AdminDashboard /> : role === "STUDENT" ? <StudentHome /> : <StudentList />}
                </ProtectedRoute>
              }
            />

            {/* Existing routes */}
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/materials"
              element={
                <ProtectedRoute>
                  <StudyMaterials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <Assignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute>
                  <TeacherStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/submissions"
              element={
                <ProtectedRoute>
                  <TeacherSubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/marks"
              element={
                <ProtectedRoute>
                  <AddMarks />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/my-marks"
              element={
                <ProtectedRoute>
                  <MyMarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Shared routes */}
            <Route
              path="/subjects"
              element={
                <ProtectedRoute>
                  <ManageSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-subjects"
              element={
                <ProtectedRoute>
                  <MySubjects />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute>
                  <AdminTeachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>

      {/* Mobile bottom nav — shows first 5 links of current role */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3"
        style={{
          backgroundColor: "rgba(15,24,41,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(77,142,255,0.08)",
        }}
      >
        {allLinks.slice(0, 5).map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.exact}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${isActive ? "text-blue-400" : "text-slate-600"}`
            }
          >
            <span className="material-symbols-outlined text-xl">{l.icon}</span>
            <span className="text-[10px] font-medium">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
