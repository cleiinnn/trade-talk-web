/* src/styles/Global.styles.js */

// ─────────────────────────────────────────────────────────────────────────────
// "Collector's Vault" — Technical & Premium design tokens
//
// USAGE — Tailwind className strings (existing pattern):
//   <input className={theme.input.search} />
//   <button className={theme.button.primary} />
//
// USAGE — Vault inputs (new pattern, inline-style + CSS injection):
//   import { theme, vaultInputCSS } from "../styles/Global.styles";
//   // 1. Render once at root: <style>{vaultInputCSS}</style>
//   // 2. Add className="vault-input" to every <input>
//   // 3. Spread styles:
//   //    <input style={{ ...theme.input.vault.base, ...(focused ? theme.input.vault.focused : {}) }} />
//   //    <Icon  style={{ ...theme.input.icon.base,  ...(focused ? theme.input.icon.focused  : {}) }} />
//   //    <label style={{ ...theme.label.base,        ...(focused ? theme.label.focused       : {}) }} />
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {

  // ── Brand color tokens ──────────────────────────────────────────────────────
  colors: {
    brand:       "#4B99D4",
    brandLight:  "#D9E9EE",
    bg:          "#FBFCFD",
    slate400:    "#94a3b8",
    slate500:    "#64748b",
    slate600:    "#475569",
    slate800:    "#1e293b",
  },

  // ── Buttons ─────────────────────────────────────────────────────────────────
  button: {
    primary:  "flex items-center gap-2 rounded-full bg-[#1e293b] px-5 py-2 text-xs font-bold text-white active:scale-95 shadow-sm",
    darkIcon: "rounded-xl bg-slate-900 p-3 text-white transition-all hover:bg-[#4B99D4] hover:shadow-lg hover:shadow-[#4B99D4]/20 active:scale-90",
    fav: (isLiked) => `absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm backdrop-blur transition-all active:scale-75 ${
      isLiked ? "bg-white text-red-500" : "bg-white/90 text-slate-500 hover:text-red-500"
    }`,
  },

  // ── Inputs ───────────────────────────────────────────────────────────────────
  input: {
    // ── Existing search bar (Tailwind className string — unchanged) ─────────
    search: "w-full rounded-2xl border-2 border-slate-100 bg-slate-100/50 py-3 pl-12 pr-5 text-sm transition-all focus:bg-white focus:border-[#4B99D4] focus:ring-0 outline-none placeholder:text-slate-400",

    // ── Vault auth inputs (inline-style objects — Login / Register) ─────────
    //
    // Design rationale:
    //   fontWeight 600 (semibold)  — prevents ink-trapping vs 900 (black) in small fields
    //   letterSpacing "-0.01em"    — tracking-tight: database / terminal feel
    //   textTransform "none"       — normal-case: critical for email readability
    //   caretColor "#4B99D4"       — injected via vaultInputCSS (::placeholder can't be inline)
    //   Focus border is 2px        — 0.5px wider than rest for optical activation weight
    //   Inset boxShadow on focus   — simulates field "carved into" the surface (depth cue)
    //
    vault: {
      base: {
        width:         "100%",
        boxSizing:     "border-box",
        borderRadius:  12,
        outline:       "none",

        // Typography — "Technical & Premium"
        fontSize:      13,
        fontWeight:    600,          // semibold — avoids ink-trapping
        letterSpacing: "-0.01em",    // tracking-tight — terminal feel
        textTransform: "none",       // normal-case — email readability

        color:         "#0f172a",
        background:    "#FBFCFD",                      // cool off-white at rest
        border:        "1.5px solid #e2e8f0",
        boxShadow:     "inset 0 1px 2px rgba(15,23,42,0.03)",
        transition:    "all 0.2s ease",
      },

      focused: {
        background:  "#ffffff",                        // pure white — activation pop
        border:      "2px solid #4B99D4",              // brand blue — optical weight
        boxShadow: [
          "inset 0 1px 4px rgba(15,23,42,0.07)",       // depth: carved into surface
          "inset 0 0 0 1px rgba(75,153,212,0.08)",     // subtle inner brand tint
          "0 0 0 3px rgba(75,153,212,0.13)",           // outer ambient glow
        ].join(", "),
      },

      // Padding presets — pick one and spread alongside base
      padding: {
        withIcon:    "13px 16px 13px 42px",
        withoutIcon: "13px 16px",
        withToggle:  "13px 46px 13px 42px",            // icon left + toggle right (password)
      },
    },

    // ── Lucide icon inside vault input ──────────────────────────────────────
    icon: {
      base: {
        position:      "absolute",
        left:          14,
        top:           "50%",
        transform:     "translateY(-50%)",
        color:         "#94a3b8",                      // slate-400 at rest
        pointerEvents: "none",
        transition:    "color 0.2s ease",
      },
      focused: {
        color: "#4B99D4",                              // glows to brand blue on focus
      },
    },
  },

  // ── Field label (vault inputs) ───────────────────────────────────────────────
  label: {
    base: {
      display:       "block",
      fontSize:      10,
      fontWeight:    900,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color:         "#475569",                        // slate-600 at rest
      marginBottom:  8,
      marginLeft:    2,
      transition:    "color 0.2s ease",
    },
    focused: {
      color: "#4B99D4",
    },
  },

  // ── Password strength bar ────────────────────────────────────────────────────
  //
  // Score map (4 boolean criteria: length>8, uppercase, number, special char):
  //   1 → Weak         25%  Rose-500    #f43f5e
  //   2 → Fair         50%  Amber-500   #f59e0b
  //   3 → Strong       75%  Blue brand  #4B99D4
  //   4 → Vault-Secure 100% Emerald-500 #10b981  + outer glow
  //
  strengthBar: {
    scores: {
      0: { label: "",             pct: "0%",   color: "transparent", glow: false },
      1: { label: "Weak",         pct: "25%",  color: "#f43f5e",     glow: false },
      2: { label: "Fair",         pct: "50%",  color: "#f59e0b",     glow: false },
      3: { label: "Strong",       pct: "75%",  color: "#4B99D4",     glow: false },
      4: { label: "Vault-Secure", pct: "100%", color: "#10b981",     glow: true  },
    },
    track: {
      width:        "100%",
      height:       4,
      background:   "#e2e8f0",
      borderRadius: 9999,
      overflow:     "hidden",
    },
    fill: {
      height:       "100%",
      borderRadius: 9999,
      // width + backgroundColor animated via Framer Motion in PasswordStrengthBar
    },
    // Call with the active color when score === 4
    vaultGlow: (color) => ({
      boxShadow: `0 0 10px ${color}80, 0 0 4px ${color}60`,
    }),
    label: {
      fontSize:      9,
      fontWeight:    800,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      // color animated via Framer Motion — matches active bar color
    },
  },

  // ── Cards ────────────────────────────────────────────────────────────────────
  card: {
    container:    "group flex flex-col",
    imageWrapper: "relative mb-3 aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-slate-100 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_20px_50px_rgba(75,153,212,0.15)]",
    image:        "h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110",
  },
};

// ─── CSS INJECTION STRING ──────────────────────────────────────────────────────
// Render once at your app root (e.g. App.jsx): <style>{vaultInputCSS}</style>
//
// Covers properties that cannot be set as React inline styles:
//   ::placeholder  — softens placeholder to slate-400 / font-medium
//   caret-color    — sets the text cursor to brand blue #4B99D4
//
export const vaultInputCSS = `
  .vault-input::placeholder {
    color:          ${theme.colors.slate400};
    font-weight:    500;
    letter-spacing: 0;
  }
  .vault-input {
    caret-color: ${theme.colors.brand};
  }
`;

// ─── FRAMER MOTION PRESETS ────────────────────────────────────────────────────
// Shared animation variants used by Login, Register, and any future auth screen.
export const motionPresets = {
  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
  },
  fadeUp: {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  },
  scaleIn: {
    hidden:  { opacity: 0, y: 28, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  },
};