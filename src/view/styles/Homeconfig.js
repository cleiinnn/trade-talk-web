// ─────────────────────────────────────────────────────────────────────────────
// homeConfig.js
// Central data store for the Trade & Talk Home page.
// Extracted from Home.jsx for maintainability and separation of concerns.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Category pills displayed in the Browse section.
 * `slug` maps to the `?cat=` query param used by /marketplace.
 */
export const CATEGORIES = [
  {
    label: "Trading Cards",
    emoji: "🃏",
    slug: "trading-cards",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    hoverColor: "hover:bg-blue-100 hover:border-blue-200",
  },
  {
    label: "Action Figures",
    emoji: "🤖",
    slug: "action-figures",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    hoverColor: "hover:bg-amber-100 hover:border-amber-200",
  },
  {
    label: "Sneakers",
    emoji: "👟",
    slug: "sneakers",
    color: "bg-rose-50 text-rose-600 border-rose-100",
    hoverColor: "hover:bg-rose-100 hover:border-rose-200",
  },
  {
    label: "Comics",
    emoji: "📚",
    slug: "comics",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    hoverColor: "hover:bg-purple-100 hover:border-purple-200",
  },
  {
    label: "Vintage Toys",
    emoji: "🧸",
    slug: "vintage-toys",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hoverColor: "hover:bg-emerald-100 hover:border-emerald-200",
  },
  {
    label: "Anime Merch",
    emoji: "⚔️",
    slug: "anime-merch",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    hoverColor: "hover:bg-orange-100 hover:border-orange-200",
  },
];

/**
 * Items shown in the auto-scrolling marquee strip.
 * `slug` links to the individual listing page.
 * `catSlug` links to the category filter on /marketplace.
 */
export const MARQUEE_ITEMS = [
  {
    name: "Charizard Holo 1st Ed.",
    price: "₱48,000",
    badge: "🔥 Hot",
    bg: "from-orange-100 to-amber-50",
    slug: "charizard-holo-1st-ed",
    catSlug: "trading-cards",
  },
  {
    name: "RX-78-2 MG 1/100",
    price: "₱3,200",
    badge: "✨ New",
    bg: "from-blue-100 to-sky-50",
    slug: "rx-78-2-mg-1-100",
    catSlug: "action-figures",
  },
  {
    name: "Jordan 1 Retro High",
    price: "₱12,500",
    badge: "👟 Grail",
    bg: "from-rose-100 to-pink-50",
    slug: "jordan-1-retro-high",
    catSlug: "sneakers",
  },
  {
    name: "One Piece Vol. 1 JP",
    price: "₱7,800",
    badge: "📚 Rare",
    bg: "from-purple-100 to-violet-50",
    slug: "one-piece-vol-1-jp",
    catSlug: "comics",
  },
  {
    name: "Mewtwo PSA 10",
    price: "₱90,000",
    badge: "💎 Elite",
    bg: "from-slate-100 to-zinc-50",
    slug: "mewtwo-psa-10",
    catSlug: "trading-cards",
  },
  {
    name: "Vintage Optimus Prime",
    price: "₱15,000",
    badge: "🤖 Vintage",
    bg: "from-emerald-100 to-teal-50",
    slug: "vintage-optimus-prime",
    catSlug: "vintage-toys",
  },
];

/**
 * How It Works — four-step onboarding flow.
 * `icon` is a string key so JSX is not stored in a data file.
 * The Home component maps these keys to Lucide icons.
 */
export const STEPS = [
  {
    num: "01",
    iconKey: "Users",
    title: "Create Your Account",
    desc: "Sign up in seconds. Verify your email and you're in the collector's circle.",
  },
  {
    num: "02",
    iconKey: "Package",
    title: "List Your Collection",
    desc: "Upload photos, set your price or trade terms. Admin approves within 24 hrs.",
  },
  {
    num: "03",
    iconKey: "MessageCircle",
    title: "Chat & Negotiate",
    desc: "DM interested buyers or sellers directly. Agree on terms in real-time.",
  },
  {
    num: "04",
    iconKey: "Award",
    title: "Trade & Review",
    desc: "Complete the deal and earn trust points. Build your collector reputation.",
  },
];

/**
 * Social proof testimonials.
 */
export const TESTIMONIALS = [
  {
    name: "Carlo M.",
    location: "Manila",
    avatar: "CM",
    text: "Found my PSA 10 Charizard here after years of searching. The community is legit and the process was smooth.",
    rating: 5,
    category: "Trading Cards",
  },
  {
    name: "Rina S.",
    location: "Cebu",
    avatar: "RS",
    text: "Sold 3 MG Gundam kits in one week. The buyers here actually know the hobby — no low-ballers!",
    rating: 5,
    category: "Figures",
  },
  {
    name: "Jm Dela Cruz",
    location: "Davao",
    avatar: "JD",
    text: "Trade & Talk replaced my Facebook group search. Everything in one place, way more secure.",
    rating: 5,
    category: "Sneakers",
  },
];

/**
 * Default/fallback stats used before the API responds.
 * Matches the shape returned by get_stats.php.
 */
export const DEFAULT_STATS = {
  users: 0,
  listings: 0,
  trades: 0,
};

/**
 * Stats display metadata (labels, icons, targets for counter animation).
 * The `key` field maps to the API response object keys.
 */
export const STATS_META = [
  { key: "users",    label: "Verified Collectors", iconKey: "Users",     suffix: "+" },
  { key: "listings", label: "Active Listings",     iconKey: "Package",   suffix: "+" },
  { key: "trades",   label: "Trades Completed",    iconKey: "TrendingUp", suffix: "+" },
];