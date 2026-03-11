import React, { useState } from "react";
import { loginUser } from "../viewmodel/api";
import { useNavigate, Link } from "react-router-dom";
import { Repeat, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser({ email, password });

      if (data.success) {
        const user = {
          user_id: data.user_id,
          username: data.username,
          role: data.role || "user",
          profile_picture_url: data.profile_picture_url,
        };

        // ✅ Use sessionStorage instead
        sessionStorage.setItem("user", JSON.stringify(user));

        if (data.token) {
          sessionStorage.setItem("token", data.token);
        }

        setMessage("Login successful!");

        // 🔑 ROLE-BASED REDIRECT
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }

      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFCFD] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl mb-4">
            <Repeat size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
            Trade<span className="text-[#4B99D4]">&</span>Talk
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Collector Access</p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-8">Welcome Back</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4B99D4] transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@gmail.com"
                  className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#4B99D4] focus:ring-4 focus:ring-[#4B99D4]/5 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field with Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4B99D4] transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"} // Dynamic Type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-12 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#4B99D4] focus:ring-4 focus:ring-[#4B99D4]/5 transition-all"
                  required
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {message && (
              <div className={`flex items-center gap-2 p-4 rounded-xl text-xs font-bold ${
                message.includes("successful") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              }`}>
                <AlertCircle size={16} /> {message}
              </div>
            )}

            <button 
              type="submit" 
              className="group w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#4B99D4] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95"
            >
              login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
            <p className="text-xs font-bold text-slate-400">
              Don't have an account? 
              <Link to="/register" className="ml-2 text-[#4B99D4] hover:underline  tracking-tighter">Register Now</Link>
            </p>
            <Link to="/forgot-password" size={14} className="text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
