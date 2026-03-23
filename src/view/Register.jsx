import React, { useState, useRef } from "react";
import { registerUser } from "../viewmodel/api";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import {
  Repeat, User, Mail, Lock, Eye, EyeOff,
  ArrowRight, AlertCircle, CheckCircle2,
} from "lucide-react";

// ─── VAULT INPUT STYLES (injected once) ───────────────────────────────────────
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
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── SMART INPUT ──────────────────────────────────────────────────────────────
// Typography:   font-semibold (600) · normal-case · tracking-tight (-0.01em)
// Placeholder:  slate-400 (#94a3b8) · font-medium (500) — via .vault-input CSS
// Caret:        #4B99D4 — via .vault-input CSS
// Focus state:  #fff bg · 2px #4B99D4 border · inset + outer glow ("carved vault")
// Icon:         slate-400 → #4B99D4 on focus with 0.2s transition
const SmartInput = ({ icon: Icon, label, type, value, onChange, placeholder, required, children, half }) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div variants={fadeUp} style={{ flex: half ? "0 0 calc(50% - 8px)" : "1 1 100%" }}>
      <label style={{
        display: "block",
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: focused ? "#4B99D4" : "#475569",
        transition: "color 0.2s ease",
        marginBottom: 8,
        marginLeft: 2,
      }}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: focused ? "#4B99D4" : "#94a3b8",
              transition: "color 0.2s ease",
              pointerEvents: "none",
            }}
          />
        )}

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
            boxSizing: "border-box",
            padding: `13px 16px 13px ${Icon ? "42px" : "16px"}`,
            paddingRight: children ? "46px" : "16px",
            borderRadius: 12,
            outline: "none",

            // Typography — semibold · normal-case · tracking-tight
            fontSize: 13,
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

// ─── PASSWORD STRENGTH ENGINE ─────────────────────────────────────────────────
// 4 criteria: length > 8 · uppercase · number · special character
const getPasswordStrength = (p) => {
  if (!p) return 0;
  let score = 0;
  if (p.length > 8)           score++;   // Length criterion
  if (/[A-Z]/.test(p))        score++;   // Uppercase criterion
  if (/[0-9]/.test(p))        score++;   // Number criterion
  if (/[!@#$%^&*]/.test(p))   score++;   // Special character criterion
  return score;
};

// Score → visual config
const STRENGTH_CFG = {
  0: { label: "",             pct: "0%",    color: "transparent", glow: false },
  1: { label: "Weak",         pct: "25%",   color: "#f43f5e",     glow: false }, // Rose-500
  2: { label: "Fair",         pct: "50%",   color: "#f59e0b",     glow: false }, // Amber-500
  3: { label: "Strong",       pct: "75%",   color: "#4B99D4",     glow: false }, // Blue brand
  4: { label: "Vault-Secure", pct: "100%",  color: "#10b981",     glow: true  }, // Emerald-500
};

// ─── PASSWORD STRENGTH BAR ────────────────────────────────────────────────────
const PasswordStrengthBar = ({ password }) => {
  const score = getPasswordStrength(password);
  const cfg   = STRENGTH_CFG[score];

  return (
    <AnimatePresence>
      {password.length > 0 && (
        <motion.div
          key="strength-bar"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ marginTop: 8 }}
        >
          {/* Track */}
          <div style={{
            width: "100%",
            height: 4,
            background: "#e2e8f0",
            borderRadius: 9999,
            overflow: "hidden",
          }}>
            {/* Animated fill bar */}
            <motion.div
              animate={{
                width: cfg.pct,
                backgroundColor: cfg.color,
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "100%",
                borderRadius: 9999,
                // Vault-Secure glow — emerald outer bloom
                boxShadow: cfg.glow
                  ? `0 0 10px ${cfg.color}80, 0 0 4px ${cfg.color}60`
                  : "none",
                transition: "box-shadow 0.4s ease",
              }}
            />
          </div>

          {/* Strength label */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
            paddingLeft: 2,
          }}>
            <motion.span
              animate={{ color: cfg.color === "transparent" ? "#94a3b8" : cfg.color }}
              transition={{ duration: 0.3 }}
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {cfg.label || "—"}
            </motion.span>

            {/* Criterion dots */}
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4].map((tier) => (
                <motion.div
                  key={tier}
                  animate={{
                    backgroundColor: score >= tier ? cfg.color : "#e2e8f0",
                    scale: score >= tier ? 1 : 0.85,
                  }}
                  transition={{ duration: 0.25, delay: (tier - 1) * 0.05 }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── VALIDATION HELPERS ───────────────────────────────────────────────────────
const validatePassword = (p) => {
  if (p.length < 8)           return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(p))       return "Must include at least one uppercase letter.";
  if (!/[a-z]/.test(p))       return "Must include at least one lowercase letter.";
  if (!/[0-9]/.test(p))       return "Must include at least one number.";
  if (!/[!@#$%^&*]/.test(p))  return "Must include a special character (!@#$%^&*).";
  return null;
};

const validateEmail = (e) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Invalid email format.";
  const domain = e.split("@")[1]?.toLowerCase();
  const allowed = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];
  if (!allowed.includes(domain)) return "Only Gmail, Yahoo, Outlook, Hotmail, or iCloud allowed.";
  return null;
};

const validateName = (n, field) => {
  if (n.length < 2) return `${field} must be at least 2 characters.`;
  if (!/^[A-Za-z]+$/.test(n)) return `${field} must contain letters only.`;
  return null;
};

const validateUsername = (u) => {
  if (u.length < 3)  return "Username must be at least 3 characters.";
  if (u.length > 20) return "Username must be at most 20 characters.";
  if (!/^[A-Za-z0-9_]+$/.test(u)) return "Letters, numbers, and underscores only.";
  return null;
};

// ─── REGISTER COMPONENT ───────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [username, setUsername]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage]       = useState("");
  const [isSuccess, setIsSuccess]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    const firstNameError = validateName(firstName, "First name");
    if (firstNameError) { setIsSuccess(false); setMessage(firstNameError); return; }

    const lastNameError = validateName(lastName, "Last name");
    if (lastNameError)  { setIsSuccess(false); setMessage(lastNameError);  return; }

    const usernameError = validateUsername(username);
    if (usernameError)  { setIsSuccess(false); setMessage(usernameError);  return; }

    const emailError = validateEmail(email);
    if (emailError)     { setIsSuccess(false); setMessage(emailError);     return; }

    const passwordError = validatePassword(password);
    if (passwordError)  { setIsSuccess(false); setMessage(passwordError);  return; }

    setIsLoading(true);
    try {
      const data = await registerUser({
        first_name: firstName, last_name: lastName,
        username, email, password, role: "user",
      });

      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message || "Account created! Redirecting to login…");
        setTimeout(() => navigate("/login"), 2800);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Registration failed. Please try again.");
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
        justifyContent: "center", padding: "24px 16px",
        background: "#F6FAFD", position: "relative",
        overflow: "hidden", fontFamily: "sans-serif",
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

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 10 }}>

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              boxShadow: "0 6px 20px rgba(15,23,42,0.25)",
              padding: "10px", borderRadius: "14px", marginBottom: 14,
            }}
          >
            <Repeat size={22} color="#ffffff" />
          </motion.div>
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
            Join the Elite Club
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
          <div style={{ padding: "32px 36px 36px" }}>

            {/* Card Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h2 style={{
                fontSize: 22, fontWeight: 900, textTransform: "uppercase",
                fontStyle: "italic", letterSpacing: "-0.03em",
                color: "#0f172a", margin: "0 0 6px",
              }}>
                Create Account
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600, margin: 0 }}>
                Start your collector journey today
              </p>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleRegister}
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Name row */}
              <motion.div variants={fadeUp} style={{ display: "flex", gap: 16 }}>
                <SmartInput
                  label="First Name" type="text" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John" required half
                />
                <SmartInput
                  label="Last Name" type="text" value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe" required half
                />
              </motion.div>

              <SmartInput
                icon={User} label="Username" type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="TheCollector77" required
              />

              <SmartInput
                icon={Mail} label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" required
              />

              {/* Password field + strength bar (inline, no wrapper gap) */}
              <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column" }}>
                {/* Re-use SmartInput without its own motion.div variants wrapper */}
                <div>
                  <label style={{
                    display: "block", fontSize: 10, fontWeight: 900,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "#475569", transition: "color 0.2s ease",
                    marginBottom: 8, marginLeft: 2,
                  }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{
                      position: "absolute", left: 14, top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                      transition: "color 0.2s ease",
                    }} id="lock-icon" />
                    <input
                      className="vault-input"
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      // Placeholder: no "min 8 chars" hint — the strength bar IS the hint
                      placeholder="Create a password"
                      required
                      onFocus={(e) => {
                        e.currentTarget.style.background   = "#ffffff";
                        e.currentTarget.style.border       = "2px solid #4B99D4";
                        e.currentTarget.style.boxShadow    = "inset 0 1px 4px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(75,153,212,0.08), 0 0 0 3px rgba(75,153,212,0.13)";
                        document.getElementById("lock-icon").style.color = "#4B99D4";
                        document.querySelector("label[for='password-label']")?.style;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background   = "#FBFCFD";
                        e.currentTarget.style.border       = "1.5px solid #e2e8f0";
                        e.currentTarget.style.boxShadow    = "inset 0 1px 2px rgba(15,23,42,0.03)";
                        document.getElementById("lock-icon").style.color = "#94a3b8";
                      }}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "13px 46px 13px 42px",
                        borderRadius: 12, outline: "none",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                        textTransform: "none",
                        color: "#0f172a",
                        background: "#FBFCFD",
                        border: "1.5px solid #e2e8f0",
                        boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
                        transition: "all 0.2s ease",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: 14, top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#94a3b8", padding: 4,
                        display: "flex", alignItems: "center",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#4B99D4"}
                      onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* ── Strength Bar ── animated, updates in real-time */}
                <PasswordStrengthBar password={password} />
              </motion.div>

              {/* Message */}
              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    key="msg"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
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
                      : <AlertCircle  size={14} style={{ flexShrink: 0, marginTop: 1 }} />
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
                      : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    boxShadow: (isLoading || isSuccess) ? "none" : "0 8px 28px rgba(15,23,42,0.25)",
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
                      Creating Account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={15} />
                    </>
                  )}
                </MagneticButton>
              </motion.div>
            </motion.form>

            {/* Footer links */}
            <div style={{
              marginTop: 24, paddingTop: 22,
              borderTop: "1px solid #f1f5f9",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 12,
            }}>
              <Link to="/login" style={{
                fontSize: 11, fontWeight: 800, color: "#64748b",
                textDecoration: "none", letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                Already have an account?{" "}
                <span style={{ color: "#4B99D4" }}>Login</span>
              </Link>
              <Link to="/" style={{
                fontSize: 10, fontWeight: 900, color: "#94a3b8",
                textDecoration: "none", letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;