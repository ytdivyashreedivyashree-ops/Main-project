import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/");
    } catch {
      alert("Invalid email or password");
    }
  };

  const inputBase = {
    backgroundColor: "#0d1424", border: "1px solid rgba(77,142,255,0.15)",
    color: "#dae2fd", borderRadius: "0.875rem", width: "100%",
    padding: "0.875rem 1rem", outline: "none", fontSize: "0.875rem", transition: "all 0.2s",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#080e1f", color: "#dae2fd", fontFamily: "Inter, sans-serif" }}>
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: "#4d8eff" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: "#1d4ed8" }} />
      </div>

      <header className="fixed top-0 w-full z-50 flex items-center justify-center px-6 py-4"
        style={{ backgroundColor: "rgba(8,14,31,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(77,142,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", boxShadow: "0 4px 16px rgba(77,142,255,0.4)" }}>
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span className="text-lg font-extrabold" style={{ fontFamily: "Manrope", background: "linear-gradient(135deg,#adc6ff,#4d8eff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Sanctuary Edu
          </span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "Manrope" }}>Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-2">Sign in to your academic portal</p>
          </div>

          <div className="rounded-2xl p-8"
            style={{ backgroundColor: "#0f1829", border: "1px solid rgba(77,142,255,0.12)", boxShadow: "0 8px 48px rgba(0,0,0,0.5), 0 0 80px rgba(77,142,255,0.05)" }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {[{ label: "Email Address", name: "email", type: "email", placeholder: "you@example.com" },
                { label: "Password", name: "password", type: "password", placeholder: "••••••••" }].map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{f.label}</label>
                  <input type={f.type} name={f.name} value={data[f.name]} placeholder={f.placeholder} required
                    onChange={(e) => setData({ ...data, [f.name]: e.target.value })} style={inputBase}
                    onFocus={(e) => { e.target.style.borderColor = "#4d8eff"; e.target.style.backgroundColor = "#131f35"; e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(77,142,255,0.15)"; e.target.style.backgroundColor = "#0d1424"; e.target.style.boxShadow = "none"; }} />
                </div>
              ))}
              <button type="submit" className="w-full py-3.5 font-bold rounded-xl transition-all active:scale-[0.98] mt-2"
                style={{ background: "linear-gradient(135deg,#4d8eff,#1d4ed8)", color: "#fff", boxShadow: "0 4px 24px rgba(77,142,255,0.4)" }}>
                Sign In
              </button>
            </form>
            <p className="text-center text-slate-600 text-sm mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Register</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
