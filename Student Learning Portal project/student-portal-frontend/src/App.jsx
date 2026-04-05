import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import StudentList from "./pages/StudentList";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudyMaterials from "./pages/StudyMaterials";
import Assignments from "./pages/Assignments";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const navLinks = [
  { to: "/", icon: "dashboard", label: "Home", exact: true },
  { to: "/materials", icon: "folder_open", label: "Materials" },
  { to: "/assignments", icon: "assignment", label: "Assignments" },
  { to: "/quiz", icon: "quiz", label: "Quiz" },
];

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

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
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
        <div className="px-6 py-7 mb-2">
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

        {/* Divider */}
        <div
          className="mx-6 mb-4 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(77,142,255,0.15), transparent)",
          }}
        />

        <nav className="flex-1 space-y-0.5 px-2">
          {navLinks.map((l) => (
            <SidebarLink key={l.to} {...l} end={l.exact} />
          ))}
          {role === "TEACHER" && (
            <SidebarLink to="/add" icon="person_add" label="Add Student" />
          )}
        </nav>

        {/* Bottom */}
        <div className="px-4 pb-6">
          <div
            className="mx-2 mb-4 h-px"
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background:
                  role === "TEACHER"
                    ? "linear-gradient(135deg,#a855f7,#7c3aed)"
                    : "linear-gradient(135deg,#22c55e,#16a34a)",
              }}
            >
              {role?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300">{role}</p>
              <p className="text-[10px] text-slate-600">Logged in</p>
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

      {/* Main */}
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
            Learning Hub
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${role === "TEACHER" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "bg-green-500/10 text-green-300 border border-green-500/20"}`}
            >
              {role}
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
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <StudentList />
                </ProtectedRoute>
              }
            />
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
          </Routes>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3"
        style={{
          backgroundColor: "rgba(15,24,41,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(77,142,255,0.08)",
        }}
      >
        {navLinks.map((l) => (
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
