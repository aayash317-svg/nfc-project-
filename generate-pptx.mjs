import pptxgen from "pptxgenjs";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";

// --- THEME & COLORS (Midnight Executive Palette) ---
const COLORS = {
    bg: "1E2761",      // Navy
    primary: "CADCFC", // Ice Blue
    secondary: "FFFFFF", // White
    accent: "06B6D4",   // Cyan
    danger: "F43F5E",   // Rose
    text: "FFFFFF",    // White
    muted: "CADCFC",   // Ice Blue
    glass: "FFFFFF",   // For transparency
};

// Standard Windows Safe Fonts
const FONTS = {
    header: "Impact",
    body: "Segoe UI"
};

// --- REUSABLE UTILITIES ---
const addBaseBackground = (slide) => {
    slide.background = { color: COLORS.bg };
};

const addSectionDivider = (slide, title) => {
    slide.background = { color: COLORS.accent };
    slide.addText(title.toUpperCase(), {
        x: 0, y: "40%", w: "100%", align: "center",
        fontFace: FONTS.header, fontSize: 60, color: COLORS.bg, bold: true
    });
};

const addHeader = (slide, title, subtitle) => {
    slide.addText(title.toUpperCase(), {
        x: 0.5, y: 0.4, fontFace: FONTS.header, fontSize: 32, color: COLORS.primary
    });
    if (subtitle) {
        slide.addText(subtitle, {
            x: 0.5, y: 1.0, fontFace: FONTS.body, fontSize: 13, color: COLORS.muted, italic: true
        });
    }
};

const addGlassCard = (slide, x, y, w, h, border = COLORS.primary) => {
    slide.addShape(pptx.ShapeType.rect, {
        x, y, w, h,
        fill: { color: COLORS.glass, transparency: 95 },
        line: { color: border, width: 1, transparency: 80 }
    });
};

// --- SLIDE 1: TITLE SLIDE ---
let s1 = pptx.addSlide();
s1.background = { color: COLORS.bg };
s1.addText("NFC HEALTH IDENTITY SYSTEM", {
    x: 0, y: "35%", w: "100%", fontFace: FONTS.header, fontSize: 54, color: COLORS.primary, align: "center"
});
s1.addText("REDEFINING MEDICAL RECORD CONNECTIVITY for 2026", {
    x: 0, y: "52%", w: "100%", fontFace: FONTS.body, fontSize: 18, color: COLORS.text, align: "center", bold: true
});
s1.addText("PROJECT EXPO MASTER EDITION", {
    x: 0, y: "85%", w: "100%", fontFace: FONTS.body, fontSize: 12, color: COLORS.muted, align: "center"
});

// --- SLIDE 2: EXECUTIVE SUMMARY (Two Column) ---
let s2 = pptx.addSlide();
addBaseBackground(s2);
addHeader(s2, "Executive Overview", "A new paradigm in digital health infrastructure");
s2.addText("The Problem: Fragmented, insecure medical history that delays care and increases risk.\nThe Solution: A unified, cryptographic identity ecosystem connecting every stakeholder in the medical journey.", {
    x: 0.5, y: 2, w: 6.5, fontFace: FONTS.body, fontSize: 24, color: COLORS.text, lineSpacing: 40
});
addGlassCard(s2, 7.8, 2, 5, 5, COLORS.accent);
s2.addText("100%", { x: 7.8, y: 3, w: 5, align: "center", fontFace: FONTS.header, fontSize: 100, color: COLORS.accent });
s2.addText("DATA INTEGRITY", { x: 7.8, y: 5, w: 5, align: "center", fontFace: FONTS.body, fontSize: 20, color: COLORS.white, bold: true });

// --- SLIDE 3: SECTION DIVIDER 1 ---
let s3 = pptx.addSlide();
addSectionDivider(s3, "THE HEALTHCARE CRISIS");

// --- SLIDE 4: THE DATA SILO PROBLEM ---
let s4 = pptx.addSlide();
addBaseBackground(s4);
addHeader(s4, "Data Silos", "Why legacy systems are failing patients");
const crisis = ["Disconnected Databases", "Paper-Heavy Workflows", "Manual Retrieval Lag", "Unauthorized Record Access"];
crisis.forEach((txt, i) => {
    addGlassCard(s4, 0.5 + (i * 3.1), 3, 2.9, 3, COLORS.danger);
    s4.addText(txt, { x: 0.5 + (i * 3.1), y: 4.2, w: 2.9, align: "center", fontFace: FONTS.header, fontSize: 18, color: "FFBBBB" });
});

// --- SLIDE 5: IDENTITY RISK (Image Placeholder Layout) ---
let s5 = pptx.addSlide();
addBaseBackground(s5);
addHeader(s5, "Identity Vulnerability", "Unverified access leads to medical error");
addGlassCard(s5, 0.5, 2, 6, 5, COLORS.danger);
s5.addText("Current identification methods rely on unreliable oral history or unencrypted physical cards. This leads to misdiagnosis and critical delays in emergency situations.", {
    x: 1, y: 3, w: 5, fontFace: FONTS.body, fontSize: 22, color: COLORS.text
});
s5.addText("[CRITICAL RISK IMAGE]", { x: 7, y: 2, w: 5.5, h: 5, fill: { color: COLORS.glass, transparency: 90 }, align: "center", color: COLORS.bg, fontFace: FONTS.header });

// --- SLIDE 6: IMPACT CALLOUT (Big Stat) ---
let s6 = pptx.addSlide();
addBaseBackground(s6);
addHeader(s6, "Intake Lag", "The cost of inefficient data retrieval");
s6.addText("90%", { x: 1, y: 2.5, fontFace: FONTS.header, fontSize: 180, color: COLORS.danger });
s6.addText("OF TRIAGE TIME", { x: 6, y: 3.5, fontFace: FONTS.header, fontSize: 48, color: COLORS.white });
s6.addText("is currently wasted searching for baseline medical information.", { x: 6, y: 4.5, w: 6, fontFace: FONTS.body, fontSize: 22, color: COLORS.muted });

// --- SLIDE 7: SECTION DIVIDER 2 ---
let s7 = pptx.addSlide();
addSectionDivider(s7, "THE NFC INNOVATION");

// --- SLIDE 8: THE VISION (Quote Slide) ---
let s8 = pptx.addSlide();
addBaseBackground(s8);
s8.addText("“Our system ensures that every patient carries their clinical history not in a folder, but in their identity—encrypted, accessible, and life-saving.”", {
    x: 1, y: "30%", w: 11, align: "center", fontFace: FONTS.body, fontSize: 42, color: COLORS.accent, italic: true
});
s8.addText("- NFC Health Systems Engineering Team", {
    x: 1, y: "65%", w: 11, align: "center", fontFace: FONTS.header, fontSize: 18, color: COLORS.primary
});

// --- SLIDE 9: NFC CRYPTOGRAPHY (Three Column) ---
let s9 = pptx.addSlide();
addBaseBackground(s9);
addHeader(s9, "Hardware Security", "Cryptographic NTAG215 Integrity");
const nfc = [
    { t: "Physical Key", d: "Requires physical proximity for secure check-in." },
    { t: "Tamper Proof", d: "Write-locked identity segments for absolute trust." },
    { t: "72KB Storage", d: "Optimized for high-speed cloud pointer retrieval." }
];
nfc.forEach((n, i) => {
    addGlassCard(s9, 0.5 + (i * 4.3), 2.5, 4, 4);
    s9.addText(n.t, { x: 0.5 + (i * 4.3), y: 3.5, w: 4, align: "center", fontFace: FONTS.header, fontSize: 24, color: COLORS.primary });
    s9.addText(n.d, { x: 0.5 + (i * 4.3), y: 4.5, w: 4, align: "center", fontFace: FONTS.body, fontSize: 16, color: COLORS.text });
});

// --- SLIDE 10: SMART QR (Technical Grid) ---
let s10 = pptx.addSlide();
addBaseBackground(s10);
addHeader(s10, "Failsafe Recovery", "Smart QR Metadata Architecture");
addGlassCard(s10, 0.5, 2, 12, 5);
s10.addText("JSON METADATA PAYLOAD", { x: 1, y: 2.5, fontFace: FONTS.header, fontSize: 20, color: COLORS.accent });
s10.addText("{\n  'pid': 'UUID-8892',\n  'blood': 'O-',\n  'all': ['Penicillin', 'Peanuts'],\n  'contact': '+91-XXXXX'\n}", {
    x: 1, y: 3.2, fontFace: "Consolas", fontSize: 22, color: COLORS.primary
});
s10.addText("Offline-first triaging enabled by proprietary metadata embedding.", { x: 7, y: 4, w: 5, fontFace: FONTS.body, fontSize: 20, color: COLORS.text });

// --- SLIDE 11: SECTION DIVIDER 3 ---
let s11 = pptx.addSlide();
addSectionDivider(s11, "THE PORTAL ECOSYSTEM");

// --- SLIDE 12: PORTAL 1: PATIENTS (Icon + Text Rows) ---
let s12 = pptx.addSlide();
addBaseBackground(s12);
addHeader(s12, "Patient Empowerment", "Mobile-first Next.js Dashboard");
const pFeatures = [
    "Digital Identity Management: Generate and manage your Master QR and NFC pairing.",
    "Global Record Visibility: Access every clinical note and history entry from your palm.",
    "Insurance Oversight: Monitor policy coverage and claim status in real-time."
];
pFeatures.forEach((f, i) => {
    s12.addText("📱", { x: 1, y: 2.5 + (i * 1.5), fontSize: 32 });
    s12.addText(f, { x: 2, y: 2.5 + (i * 1.5), w: 10, fontFace: FONTS.body, fontSize: 20, color: COLORS.text });
});

// --- SLIDE 13: PORTAL 2: HOSPITALS (Deep Space UI) ---
let s13 = pptx.addSlide();
addBaseBackground(s13);
addHeader(s13, "Hospital Command", "Fast-track clinical intake for ERs");
s13.addText("optimized for zero-fatigue high-speed clinical intake.", { x: 0.5, y: 1.3, fontFace: FONTS.body, fontSize: 14, color: COLORS.muted });
addGlassCard(s13, 0.5, 2.5, 12, 4);
s13.addText("• Instant NFC Scanning • Crystal-Clear Triage View • Permanent Record Signing", {
    x: 1, y: 4, fontFace: FONTS.header, fontSize: 32, color: COLORS.accent, align: "center", w: 11
});

// --- SLIDE 14: PORTAL 3: INSURANCE ---
let s14 = pptx.addSlide();
addBaseBackground(s14);
addHeader(s14, "Insurance Operations", "Data-driven underwriting & trust");
s14.addText("Ensure that claims are backed by immutable hospital records, reducing fraud and processing overhead.", {
    x: 1, y: 2.5, w: 11, fontFace: FONTS.body, fontSize: 24, color: COLORS.text, lineSpacing: 40
});
s14.addText("TRUSTED • VERIFIED • FAST", { x: 1, y: 5, w: 11, align: "center", fontFace: FONTS.header, fontSize: 48, color: COLORS.primary });

// --- SLIDE 15: TECHNICAL PILLAR: DUAL-SYNC ---
let s15 = pptx.addSlide();
addBaseBackground(s15);
addHeader(s15, "Hybrid Persistence", "The Dual-Sync Local & Cloud Engine");
const sync = ["LOCAL SQLITE: Instant offline writes", "SUPABASE: Global identity persistence", "SYNC ENGINE: Automatic background bridge"];
sync.forEach((s, i) => {
    addGlassCard(s15, 0.5 + (i * 4.3), 3, 4, 3, COLORS.accent);
    s15.addText(s.split(":")[0], { x: 0.5 + (i * 4.3), y: 4, w: 4, align: "center", fontFace: FONTS.header, fontSize: 20, color: COLORS.white });
    s15.addText(s.split(":")[1], { x: 0.5 + (i * 4.3), y: 4.8, w: 4, align: "center", fontFace: FONTS.body, fontSize: 13, color: COLORS.primary });
});

// --- SLIDE 16: SECURITY LAYERS ---
let s16 = pptx.addSlide();
addBaseBackground(s16);
addHeader(s16, "Infinite Security", "Multi-layer protection for clinical data");
addGlassCard(s16, 0.5, 2, 12, 5);
s16.addText("AES-256 Payload Encryption", { x: 1, y: 2.8, fontFace: FONTS.header, fontSize: 24, color: COLORS.accent });
s16.addText("PostgreSQL Row-Level Security", { x: 1, y: 4.3, fontFace: FONTS.header, fontSize: 24, color: COLORS.accent });
s16.addText("Server-to-Server Service Role Gates", { x: 1, y: 5.8, fontFace: FONTS.header, fontSize: 24, color: COLORS.accent });

// --- SLIDE 17: CASE STUDY (Timeline) ---
let s17 = pptx.addSlide();
addBaseBackground(s17);
addHeader(s17, "Life Cycle", "From emergency scan to clinical entry");
const steps = ["1. NFC Scan", "2. Identity Verification", "3. Data Retrieval", "4. Record Entry"];
steps.forEach((s, i) => {
    s17.addText(s, { x: 0.5 + (i * 3.1), y: 3, w: 3, h: 2, fill: COLORS.accent, color: COLORS.white, align: "center", fontFace: FONTS.header, fontSize: 20 });
});

// --- SLIDE 18: SECTION DIVIDER 4 ---
let s18 = pptx.addSlide();
addSectionDivider(s18, "IMPACT & FUTURE");

// --- SLIDE 19: OPERATIONAL GAIN (Comparison) ---
let s19 = pptx.addSlide();
addBaseBackground(s19);
addHeader(s19, "Digital Transformation", "Old Workflows vs. NFC Health System");
addGlassCard(s19, 0.5, 2.5, 6, 4, COLORS.danger);
s19.addText("OLD: Manual lookup, paper charts, oral history errors.", { x: 0.8, y: 4, w: 5.4, fontFace: FONTS.body, fontSize: 20, color: COLORS.text });
addGlassCard(s19, 6.8, 2.5, 6, 4, COLORS.primary);
s19.addText("NEW: <1s scan, verified digital history, automated sync.", { x: 7.1, y: 4, w: 5.4, fontFace: FONTS.body, fontSize: 20, color: COLORS.bg, bold: true });

// --- SLIDE 20: COST SAVINGS ---
let s20 = pptx.addSlide();
addBaseBackground(s20);
addHeader(s20, "Fiscal Impact", "Reducing overhead through automation");
s20.addText("$", { x: 1, y: 2.5, fontSize: 120, color: COLORS.accent, fontFace: FONTS.header });
s20.addText("Significant cost reductions across clinical onboarding and insurance administration.", { x: 3, y: 3.5, w: 8, fontFace: FONTS.body, fontSize: 24, color: COLORS.text });

// --- SLIDE 21: SCALABILITY GRID ---
let s21 = pptx.addSlide();
addBaseBackground(s21);
addHeader(s21, "National Scaling", "Architecture designed for millions");
const scaling = ["Stateless APIs", "Cloud Partitioning", "Local/Edge Caching", "Horizontally Scalable DB"];
scaling.forEach((s, i) => {
    addGlassCard(s21, 0.5 + (i * 3.1), 3, 2.9, 3);
    s21.addText(s, { x: 0.5 + (i * 3.1), y: 4.2, w: 2.9, align: "center", fontFace: FONTS.header, fontSize: 16, color: COLORS.primary });
});

// --- SLIDE 22: ROADMAP (Timeline) ---
let s22 = pptx.addSlide();
addBaseBackground(s22);
addHeader(s22, "Development Roadmap", "Phase 1 & 2: Launch & Expansion");
s22.addText("2025: Local Pilot Launch in Urban Centers\n2026: Regional Insurance Hub Integration", { x: 1, y: 3, w: 11, fontFace: FONTS.header, fontSize: 32, color: COLORS.white, lineSpacing: 50 });

// --- SLIDE 23: ROADMAP (V2) ---
let s23 = pptx.addSlide();
addBaseBackground(s23);
addHeader(s23, "Intelligence Roadmap", "Phase 3 & 4: AI & Global Scale");
s23.addText("2027: AI-Driven Clinical Predictive Diagnostics\n2028: Global Cross-Border Health Passporting", { x: 1, y: 3, w: 11, fontFace: FONTS.header, fontSize: 32, color: COLORS.accent, lineSpacing: 50 });

// --- SLIDE 24: Q&A ---
let s24 = pptx.addSlide();
addBaseBackground(s24);
s24.addText("QUESTIONS?", { x: 0, y: "40%", w: "100%", align: "center", fontFace: FONTS.header, fontSize: 80, color: COLORS.primary });

// --- SLIDE 25: CLOSING ---
let s25 = pptx.addSlide();
s25.background = { color: COLORS.bg };
s25.addText("NFC HEALTH IDENTITY", { x: 0, y: "40%", w: "100%", align: "center", fontFace: FONTS.header, fontSize: 60, color: COLORS.primary });
s25.addText("THE FUTURE OF MEDICAL CARE IS HERE.", { x: 0, y: "55%", w: "100%", align: "center", fontFace: FONTS.body, fontSize: 20, color: COLORS.white, italic: true });
s25.addText("Presented by NFC Health Systems | Project Expo 2026", { x: 0, y: "85%", w: "100%", align: "center", fontSize: 12, color: COLORS.muted });

// --- SAVE ---
pptx.writeFile({ fileName: "NFC_Health_Master_Expo_Final_25.pptx" })
    .then(fileName => {
        console.log(`Master Presentation generated successfully: ${fileName}`);
    })
    .catch(err => {
        console.error(`Error: ${err}`);
    });
