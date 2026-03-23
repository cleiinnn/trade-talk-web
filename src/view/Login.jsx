import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import {
  Repeat, Mail, Lock, AlertCircle,
  Eye, EyeOff, ShieldCheck, ArrowRight,
} from "lucide-react";
import { loginUser } from "../viewmodel/api";

// ─── VAULT INPUT STYLES (injected once at module level) ───────────────────────
const VaultStyles = () => (
  <style>{`
    .vault-input::placeholder {
      color: #94a3b8;
      font-weight: 500;
      letter-spacing: 0;
    }
    .vault-input {
      caret-color: #4B99D4;
    }
  `}</style>
);

// ─── MAGNETIC BUTTON ──────────────────────────────────────────────────────────
const MagneticButton = ({ children, className, type = "button", onClick, disabled, style = {} }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 28 });
  const sy = useSpring(y, { stiffness: 400, damping: 28 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.22);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.button
      ref={ref} type={type} onClick={onClick} disabled={disabled}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── INPUT FIELD ──────────────────────────────────────────────────────────────
// Typography:   font-semibold (600) · normal-case · tracking-tight (-0.01em)
// Placeholder:  slate-400 (#94a3b8) · font-medium (500) — via .vault-input CSS
// Caret:        #4B99D4 — via .vault-input CSS
// Focus state:  #fff bg · 2px #4B99D4 border · inset + outer glow ("carved vault")
// Icon:         slate-400 → #4B99D4 on focus with 0.2s transition
const InputField = ({ icon: Icon, label, type, value, onChange, placeholder, required, children }) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div variants={fadeUp} className="space-y-2">
      <label style={{
        display: "block",
        fontSize: "10px",
        fontWeight: 900,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: focused ? "#4B99D4" : "#475569",
        transition: "color 0.2s ease",
        marginLeft: "2px",
      }}>
        {label}
      </label>

      <div className="relative">
        {/* Icon — glows to brand blue on focus */}
        <Icon
          size={16}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: focused ? "#4B99D4" : "#94a3b8",
            transition: "color 0.2s ease",
            pointerEvents: "none",
          }}
        />

        <input
          className="vault-input"
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            // Layout
            width: "100%",
            padding: "14px 16px 14px 44px",
            paddingRight: children ? "48px" : "16px",
            borderRadius: "14px",
            boxSizing: "border-box",
            outline: "none",

            // Typography — semibold · normal-case · tracking-tight
            fontSize: "14px",
            fontWeight: 600,            // font-semibold: readable, not "ink-trapped"
            letterSpacing: "-0.01em",   // tracking-tight: terminal / database feel
            textTransform: "none",      // normal-case: email readability

            // Color
            color: "#0f172a",

            // "Vault" focus state
            background: focused ? "#ffffff" : "#FBFCFD",
            border: focused
              ? "2px solid #4B99D4"
              : "1.5px solid #e2e8f0",

            // Inset "carved" depth + outer ambient glow
            boxShadow: focused
              ? "inset 0 1px 4px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(75,153,212,0.08), 0 0 0 3px rgba(75,153,212,0.13)"
              : "inset 0 1px 2px rgba(15,23,42,0.03)",

            // Smooth transition on ALL properties
            transition: "all 0.2s ease",
          }}
        />
        {children}
      </div>
    </motion.div>
  );
};

// ─── LOGIN COMPONENT ──────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const data = await loginUser({ email, password });
      if (data.success) {
        const user = {
          user_id: data.user_id,
          username: data.username,
          role: data.role || "user",
          profile_picture_url: data.profile_picture_url,
        };
        sessionStorage.setItem("user", JSON.stringify(user));
        if (data.token) sessionStorage.setItem("token", data.token);
        setMessage("Login successful!");
        setTimeout(() => {
          if (user.role === "admin") navigate("/admin");
          else navigate("/home");
        }, 600);
      } else {
        setMessage(data.message || "Invalid credentials. Please try again.");
      }
    } catch {
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSuccess = message.includes("successful");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#F6FAFD",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* Inject vault input CSS once */}
      <VaultStyles />

      {/* ── Atmospheric Background ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(75,153,212,0.12) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-15%", left: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(75,153,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(75,153,212,0.05) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }} />
        <div style={{
          position: "absolute", top: "-10%", left: "45%", width: 1, height: "130%",
          background: "linear-gradient(180deg, transparent 0%, rgba(75,153,212,0.1) 30%, rgba(75,153,212,0.1) 70%, transparent 100%)",
          transform: "rotate(15deg)",
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10 }}>

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              boxShadow: "0 6px 20px rgba(15,23,42,0.25)",
              padding: "10px",
              borderRadius: "14px",
              marginBottom: 14,
            }}
          >
            <Repeat size={22} color="#ffffff" />
          </motion.div>
          <h1 style={{
            fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em",
            textTransform: "uppercase", fontStyle: "italic",
            color: "#0f172a", margin: 0, lineHeight: 1,
          }}>
            Trade<span style={{ color: "#4B99D4" }}>&</span>Talk
          </h1>
          <p style={{
            fontSize: 10, fontWeight: 900, color: "#94a3b8",
            letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 6,
          }}>
            Collector Access
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "#ffffff",
            borderRadius: 28,
            overflow: "hidden",
            border: "1px solid rgba(75,153,212,0.14)",
            boxShadow: "0 4px 6px rgba(15,23,42,0.04), 0 20px 50px rgba(75,153,212,0.09)",
          }}
        >
          <div style={{ padding: "36px 40px 40px" }}>

            {/* Card Header */}
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <h2 style={{
                fontSize: 22, fontWeight: 900, textTransform: "uppercase",
                fontStyle: "italic", letterSpacing: "-0.03em",
                color: "#0f172a", margin: "0 0 6px",
              }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600, margin: 0 }}>
                Sign in to your collector account
              </p>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleLogin}
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              <InputField
                icon={Mail} label="Email Address" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" required
              />

              <InputField
                icon={Lock} label="Password" type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" required
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#94a3b8", padding: 4, display: "flex", alignItems: "center",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#4B99D4"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </InputField>

              {/* Forgot password */}
              <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
                <Link to="/forgot-password" style={{
                  fontSize: 11, fontWeight: 800, color: "#64748b",
                  textDecoration: "none", letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  transition: "color 0.2s",
                }}>
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Message */}
              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    key="msg"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 12,
                      fontSize: 12, fontWeight: 700,
                      ...(isSuccess
                        ? { background: "rgba(16,185,129,0.07)", border: "1.5px solid rgba(16,185,129,0.2)", color: "#059669" }
                        : { background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.18)", color: "#dc2626" }
                      ),
                    }}
                  >
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.div variants={fadeUp} style={{ paddingTop: 4 }}>
                <MagneticButton
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%", padding: "15px 24px",
                    borderRadius: 16, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.16em",
                    fontSize: 13, color: "#ffffff", border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    background: isLoading
                      ? "rgba(75,153,212,0.5)"
                      : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    boxShadow: isLoading ? "none" : "0 8px 28px rgba(75,153,212,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        style={{
                          width: 16, height: 16, borderRadius: "50%",
                          border: "2.5px solid rgba(255,255,255,0.4)",
                          borderTopColor: "#ffffff",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                      />
                      Signing In…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={15} />
                    </>
                  )}
                </MagneticButton>
              </motion.div>
            </motion.form>

            {/* Footer */}
            <div style={{
              marginTop: 28, paddingTop: 24,
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
            }}>
              <Link to="/register" style={{
                fontSize: 11, fontWeight: 800, color: "#64748b",
                textDecoration: "none", letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                Don't have an account?{" "}
                <span style={{ color: "#4B99D4" }}>Create one</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            marginTop: 20, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}
        >
          <ShieldCheck size={11} color="#cbd5e1" />
          <p style={{
            fontSize: 10, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.2em", margin: 0,
          }}>
            Secure Login · Trade<span style={{ color: "#4B99D4" }}>&</span>Talk PH
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;