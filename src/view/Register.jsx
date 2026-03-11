import React, { useState } from "react";
import { registerUser } from "../viewmodel/api";
import { Link } from "react-router-dom";
import { Repeat, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2,  Sparkles } from "lucide-react";



const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
//Password Validation

const validatePassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  if (password.length < minLength) {
    return "Password must be at least 8 characters long";
  }
  if (!hasUppercase) {
    return "Password must contain at least one uppercase letter";
  }
  if (!hasLowercase) {
    return "Password must contain at least one lowercase letter";
  }
  if (!hasNumber) {
    return "Password must contain at least one number";
  }
  if (!hasSpecial) {
    return "Password must contain at least one special character";
  }

  return null; 
};

//Email Validation

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com"
  ];

  const domain = email.split("@")[1].toLowerCase();

  if (!allowedDomains.includes(domain)) {
    return "Only Gmail, Yahoo, Outlook, or Hotmail emails are allowed.";
  }

  return null;
};

// First & Last Name Validation
const validateName = (name, fieldName) => {
  const nameRegex = /^[A-Za-z]+$/; // letters only

  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }

  if (!nameRegex.test(name)) {
    return `${fieldName} must contain letters only (no numbers or special characters)`;
  }

  return null;
};

  // Username Validation
const validateUsername = (username) => {
  const usernameRegex = /^[A-Za-z0-9_]+$/; // letters, numbers, underscore

  if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }

   if (username.length > 20) {
    return "Username must be at most 20 characters long";
  }

  if (!usernameRegex.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }

  return null;
};


 const handleRegister = async (e) => {
  e.preventDefault();
  setIsSuccess(false);

  // First Name Validation
  const firstNameError = validateName(firstName, "First name");
  if (firstNameError) {
    setMessage(firstNameError);
    return;
  }

  // Last Name Validation
  const lastNameError = validateName(lastName, "Last name");
  if (lastNameError) {
    setMessage(lastNameError);
    return;
  }

  // Username Validation
  const usernameError = validateUsername(username);
  if (usernameError) {
    setMessage(usernameError);
    return;
  }

  // Email Validation
  const emailError = validateEmail(email);
  if (emailError) {
    setMessage(emailError);
    return;
  }

  // Password Validation
  const passwordError = validatePassword(password);
  if (passwordError) {
    setMessage(passwordError);
    return;
  }

  const data = await registerUser({
    first_name: firstName,
    last_name: lastName,
    username,
    email,
    password,
    role: "user",
  });

  if (data.success) {
      setIsSuccess(true);
      setMessage(data.message || "Account created successfully! You can now log in.");
    } else {
      setIsSuccess(false);
      setMessage(data.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFCFD] flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="w-full max-w-lg">
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl mb-4">
            <Repeat size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            Trade<span className="text-[#4B99D4]">&</span>Talk
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Join the Elite Club</p>
        </div>

        {/* REGISTER CARD */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-8 text-center">Create Account</h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
            {/* NAME ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 py-3 px-4 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#4B99D4] transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 py-3 px-4 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#4B99D4] transition-all"
                  required
                />
              </div>
            </div>

            {/* USERNAME */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4B99D4] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="TheCollector77"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-4 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#4B99D4] transition-all"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4B99D4] transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-4 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#4B99D4] transition-all"
                  required
                />
              </div>
            </div>

            {/* PASSWORD WITH TOGGLE */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4B99D4] transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-12 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#4B99D4] transition-all"
                  required
                />
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
              <div className={`flex items-start gap-2 p-3.5 rounded-xl text-xs font-bold ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-rose-50 text-rose-600 border border-rose-100"
              }`}>
                {isSuccess
                  ? <CheckCircle2 className="shrink-0" size={16} />
                  : <AlertCircle className="shrink-0" size={16} />
                }
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="group w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#4B99D4] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95 mt-4"
            >
              Sign Up <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col items-center gap-4 text-center">
            <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-slate-900">
              Already Have an Account? <span className="text-[#4B99D4]  tracking-tighter ml-1">Login Now</span>
            </Link>
            <Link to="/" className="text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest">
              Back To Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
