import React, { useState, useRef } from "react";
import { forgotPassword } from "../viewmodel/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Repeat, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, KeyRound,
} from "lucide-react";

// ─── MAGNETIC BUTTON ──────────────────────────────────────────────────────────
const MagneticButton = ({ children, type = "button", onClick, disabled, style = {} }) => {
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
    >
      {children}
    </motion.button>
  );
};

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── INPUT FIELD ──────────────────────────────────────────────────────────────
const InputField = ({ icon: Icon, label, type, value, onChange, placeholder, required, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div variants={fadeUp}>
      <label style={{
        display: "block", fontSize: 10, fontWeight: 900,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: focused ? "#4B99D4" : "#475569",
        transition: "color 0.2s", marginBottom: 8, marginLeft: 2,
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon size={16} style={{
          position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
          color: focused ? "#4B99D4" : "#94a3b8",
          transition: "color 0.2s", pointerEvents: "none",
        }} />
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "14px 16px 14px 44px",
            paddingRight: children ? "48px" : "16px",
            borderRadius: 14, fontSize: 14, fontWeight: 600,
            color: "#0f172a", background: focused ? "#ffffff" : "#f1f5f9",
            border: `1.5px solid ${focused ? "#4B99D4" : "#e2e8f0"}`,
            boxShadow: focused ? "0 0 0 4px rgba(75,153,212,0.12)" : "none",
            outline: "none", transition: "all 0.2s ease",
          }}
        />
        {children}
      </div>
    </motion.div>
  );
};

// ─── FORGOT PASSWORD COMPONENT ────────────────────────────────────────────────
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail]             = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage]         = useState("");
  const [isSuccess, setIsSuccess]     = useState(false);
  const [isLoading, setIsLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const res = await forgotPassword({ email, newPassword });
      if (res.success) {
        setIsSuccess(true);
        setMessage("Password updated successfully. Redirecting to login…");
        setEmail("");
        setNewPassword("");
        setTimeout(() => navigate("/login"), 2800);
      } else {
        setIsSuccess(false);
        setMessage(res.message || "Something went wrong. Please try again.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "24px",
        background: "#F6FAFD", position: "relative",
        overflow: "hidden", fontFamily: "sans-serif",
      }}
    >
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
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}
        >
          <div style={{
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            boxShadow: "0 6px 20px rgba(15,23,42,0.25)",
            padding: 10, borderRadius: 14, marginBottom: 14,
          }}>
            <Repeat size={22} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em",
            textTransform: "uppercase", fontStyle: "italic",
            color: "#0f172a", margin: 0, lineHeight: 1,
          }}>
            Trade<span style={{ color: "#4B99D4" }}>&</span>Talk
          </h1>
          <p style={{
            fontSize: 10, fontWeight: 900, color: "#94a3b8",
            letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 6,
          }}>
            Account Recovery
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "#ffffff",
            borderRadius: 28, overflow: "hidden",
            border: "1px solid rgba(75,153,212,0.14)",
            boxShadow: "0 4px 6px rgba(15,23,42,0.04), 0 20px 50px rgba(75,153,212,0.09)",
          }}
        >
         

          <div style={{ padding: "36px 40px 40px" }}>

            {/* Card Header */}
            <div style={{ marginBottom: 28 }}>
              {/* Icon badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 52, height: 52, borderRadius: 16, marginBottom: 18,
                background: "rgba(75,153,212,0.08)", border: "1.5px solid rgba(75,153,212,0.14)",
              }}>
                <KeyRound size={22} color="#4B99D4" />
              </div>
              <h2 style={{
                fontSize: 22, fontWeight: 900, textTransform: "uppercase",
                fontStyle: "italic", letterSpacing: "-0.03em",
                color: "#0f172a", margin: "0 0 8px",
              }}>
                Reset Password
              </h2>
              <p style={{
                fontSize: 13, color: "#64748b", fontWeight: 600,
                margin: 0, lineHeight: 1.6, maxWidth: 320,
              }}>
                Enter your registered email and choose a new password below.
              </p>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              <InputField
                icon={Mail} label="Email Address" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required
              />

              <InputField
                icon={Lock} label="New Password" type={showPassword ? "text" : "password"}
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Choose a strong password" required
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#94a3b8", padding: 4, display: "flex", alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </InputField>

              {/* Message */}
              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    key="msg"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "12px 14px", borderRadius: 12,
                      fontSize: 12, fontWeight: 700,
                      ...(isSuccess
                        ? { background: "rgba(16,185,129,0.07)", border: "1.5px solid rgba(16,185,129,0.2)", color: "#059669" }
                        : { background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.18)", color: "#dc2626" }
                      ),
                    }}
                  >
                    {isSuccess
                      ? <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                      : <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    }
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.div variants={fadeUp} style={{ paddingTop: 4 }}>
                <MagneticButton
                  type="submit" disabled={isLoading || isSuccess}
                  style={{
                    width: "100%", padding: "15px 24px",
                    borderRadius: 16, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.16em",
                    fontSize: 13, color: "#ffffff", border: "none",
                    cursor: (isLoading || isSuccess) ? "not-allowed" : "pointer",
                    background: (isLoading || isSuccess)
                      ? "rgba(75,153,212,0.5)"
                      : "linear-gradient(135deg, #4B99D4 0%, #2563eb 100%)",
                    boxShadow: (isLoading || isSuccess) ? "none" : "0 8px 28px rgba(75,153,212,0.35)",
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
                      Updating Password…
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={15} />
                    </>
                  )}
                </MagneticButton>
              </motion.div>
            </motion.form>

            {/* Footer */}
            <div style={{
              marginTop: 26, paddingTop: 22,
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
            }}>
              <Link to="/login" style={{
                fontSize: 11, fontWeight: 800, color: "#64748b",
                textDecoration: "none", letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                ← Back to{" "}
                <span style={{ color: "#4B99D4" }}>Login</span>
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
            Secure Recovery · Trade<span style={{ color: "#4B99D4" }}>&</span>Talk PH
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;