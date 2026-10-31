import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "projects");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// -----------------------------------------------------------------
// 1. SAR Generator Cover (1280x720)
// -----------------------------------------------------------------
function generateSarGeneratorSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <rect width="1280" height="720" fill="#0f0f12" />

  <!-- Outer application window frame -->
  <rect x="40" y="40" width="1200" height="640" rx="10" fill="#141418" stroke="#26262b" stroke-width="1" />

  <!-- Window titlebar -->
  <line x1="40" y1="100" x2="1240" y2="100" stroke="#26262b" stroke-width="1" />
  <circle cx="70" cy="70" r="5" fill="#26262b" />
  <circle cx="86" cy="70" r="5" fill="#26262b" />
  <circle cx="102" cy="70" r="5" fill="#26262b" />
  <text x="130" y="74" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13" font-weight="500">sar-audit-trail // pipeline_v2.8</text>

  <!-- Left rail: 150px wide with 5 small rounded rectangles -->
  <rect x="40" y="100" width="170" height="580" fill="#111115" stroke="#26262b" stroke-width="1" />
  <rect x="60" y="130" width="130" height="32" rx="6" fill="#1c1c22" stroke="#26262b" stroke-width="1" />
  <rect x="60" y="174" width="130" height="32" rx="6" fill="#1c1c22" stroke="#26262b" stroke-width="1" />
  <rect x="60" y="218" width="130" height="32" rx="6" fill="#1c1c22" stroke="#26262b" stroke-width="1" />
  <rect x="60" y="262" width="130" height="32" rx="6" fill="#1c1c22" stroke="#26262b" stroke-width="1" />
  <rect x="60" y="306" width="130" height="32" rx="6" fill="#1c1c22" stroke="#26262b" stroke-width="1" />

  <!-- Top bar with 3 role chips: Analyst, Admin, Auditor (Analyst filled with accent outline) -->
  <g transform="translate(240, 130)">
    <!-- Analyst chip with #ff5a2c outline -->
    <rect x="0" y="0" width="105" height="32" rx="16" fill="#1f1816" stroke="#ff5a2c" stroke-width="1.5" />
    <circle cx="16" cy="16" r="3.5" fill="#ff5a2c" />
    <text x="28" y="20" fill="#ff5a2c" font-family="Geist Mono, ui-monospace, monospace" font-size="12" font-weight="600">Analyst</text>

    <!-- Admin chip -->
    <rect x="120" y="0" width="95" height="32" rx="16" fill="#18181d" stroke="#26262b" stroke-width="1" />
    <circle cx="136" cy="16" r="3" fill="#52525b" />
    <text x="148" y="20" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="12">Admin</text>

    <!-- Auditor chip -->
    <rect x="230" y="0" width="100" height="32" rx="16" fill="#18181d" stroke="#26262b" stroke-width="1" />
    <circle cx="246" cy="16" r="3" fill="#52525b" />
    <text x="258" y="20" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="12">Auditor</text>
  </g>

  <!-- 6-row table in middle -->
  <g transform="translate(240, 195)">
    <!-- Table header -->
    <rect x="0" y="0" width="560" height="36" rx="4" fill="#18181d" stroke="#26262b" stroke-width="1" />
    <rect x="20" y="14" width="70" height="8" rx="2" fill="#52525b" />
    <rect x="130" y="14" width="110" height="8" rx="2" fill="#52525b" />
    <rect x="280" y="14" width="90" height="8" rx="2" fill="#52525b" />
    <rect x="420" y="14" width="80" height="8" rx="2" fill="#52525b" />

    <!-- 6 Rows -->
    <!-- Row 1 -->
    <line x1="0" y1="84" x2="560" y2="84" stroke="#26262b" stroke-width="1" />
    <rect x="20" y="54" width="60" height="8" rx="2" fill="#3f3f46" />
    <rect x="130" y="54" width="120" height="8" rx="2" fill="#71717a" />
    <rect x="280" y="54" width="80" height="8" rx="2" fill="#52525b" />
    <rect x="420" y="54" width="70" height="8" rx="2" fill="#3f3f46" />

    <!-- Row 2 -->
    <line x1="0" y1="132" x2="560" y2="132" stroke="#26262b" stroke-width="1" />
    <rect x="20" y="102" width="65" height="8" rx="2" fill="#3f3f46" />
    <rect x="130" y="102" width="95" height="8" rx="2" fill="#71717a" />
    <rect x="280" y="102" width="100" height="8" rx="2" fill="#52525b" />
    <rect x="420" y="102" width="60" height="8" rx="2" fill="#3f3f46" />

    <!-- Row 3 -->
    <line x1="0" y1="180" x2="560" y2="180" stroke="#26262b" stroke-width="1" />
    <rect x="20" y="150" width="55" height="8" rx="2" fill="#3f3f46" />
    <rect x="130" y="150" width="135" height="8" rx="2" fill="#71717a" />
    <rect x="280" y="150" width="75" height="8" rx="2" fill="#52525b" />
    <rect x="420" y="150" width="85" height="8" rx="2" fill="#3f3f46" />

    <!-- Row 4 -->
    <line x1="0" y1="228" x2="560" y2="228" stroke="#26262b" stroke-width="1" />
    <rect x="20" y="198" width="70" height="8" rx="2" fill="#3f3f46" />
    <rect x="130" y="198" width="110" height="8" rx="2" fill="#71717a" />
    <rect x="280" y="198" width="90" height="8" rx="2" fill="#52525b" />
    <rect x="420" y="198" width="75" height="8" rx="2" fill="#3f3f46" />

    <!-- Row 5 -->
    <line x1="0" y1="276" x2="560" y2="276" stroke="#26262b" stroke-width="1" />
    <rect x="20" y="246" width="60" height="8" rx="2" fill="#3f3f46" />
    <rect x="130" y="246" width="125" height="8" rx="2" fill="#71717a" />
    <rect x="280" y="246" width="85" height="8" rx="2" fill="#52525b" />
    <rect x="420" y="246" width="65" height="8" rx="2" fill="#3f3f46" />

    <!-- Row 6 -->
    <line x1="0" y1="324" x2="560" y2="324" stroke="#26262b" stroke-width="1" />
    <rect x="20" y="294" width="65" height="8" rx="2" fill="#3f3f46" />
    <rect x="130" y="294" width="105" height="8" rx="2" fill="#71717a" />
    <rect x="280" y="294" width="95" height="8" rx="2" fill="#52525b" />
    <rect x="420" y="294" width="80" height="8" rx="2" fill="#3f3f46" />

    <!-- Outer table outline -->
    <rect x="0" y="0" width="560" height="340" rx="4" fill="none" stroke="#26262b" stroke-width="1" />
  </g>

  <!-- Right: Narrative panel with six text-line bars and Draft status pill in accent -->
  <g transform="translate(835, 130)">
    <rect x="0" y="0" width="370" height="510" rx="8" fill="#111115" stroke="#26262b" stroke-width="1" />
    <text x="24" y="38" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="13" font-weight="600">Narrative Generator</text>
    
    <!-- Draft status pill in accent -->
    <rect x="280" y="22" width="64" height="24" rx="12" fill="#251613" stroke="#ff5a2c" stroke-width="1" />
    <text x="312" y="38" fill="#ff5a2c" font-family="Geist Mono, ui-monospace, monospace" font-size="11" font-weight="600" text-anchor="middle">Draft</text>

    <line x1="0" y1="64" x2="370" y2="64" stroke="#26262b" stroke-width="1" />

    <!-- 6 Text line bars of different widths -->
    <rect x="24" y="96" width="300" height="10" rx="3" fill="#71717a" />
    <rect x="24" y="128" width="322" height="10" rx="3" fill="#52525b" />
    <rect x="24" y="160" width="240" height="10" rx="3" fill="#52525b" />
    <rect x="24" y="192" width="285" height="10" rx="3" fill="#52525b" />
    <rect x="24" y="224" width="315" height="10" rx="3" fill="#52525b" />
    <rect x="24" y="256" width="180" height="10" rx="3" fill="#3f3f46" />

    <line x1="24" y1="300" x2="346" y2="300" stroke="#26262b" stroke-width="1" stroke-dasharray="4 4" />

    <rect x="24" y="328" width="190" height="8" rx="2" fill="#3f3f46" />
    <rect x="24" y="352" width="240" height="8" rx="2" fill="#3f3f46" />
    <rect x="24" y="376" width="160" height="8" rx="2" fill="#3f3f46" />

    <!-- Action button wireframe -->
    <rect x="24" y="440" width="322" height="38" rx="6" fill="#1c1c22" stroke="#26262b" stroke-width="1" />
    <rect x="135" y="455" width="100" height="8" rx="2" fill="#71717a" />
  </g>
</svg>`;
}

// -----------------------------------------------------------------
// 2. ValidEDI Cover (1280x720)
// -----------------------------------------------------------------
function generateValidEdiSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <rect width="1280" height="720" fill="#0f0f12" />

  <!-- Outer frame -->
  <rect x="40" y="40" width="1200" height="640" rx="10" fill="#141418" stroke="#26262b" stroke-width="1" />

  <!-- Header -->
  <line x1="40" y1="100" x2="1240" y2="100" stroke="#26262b" stroke-width="1" />
  <circle cx="70" cy="70" r="5" fill="#26262b" />
  <circle cx="86" cy="70" r="5" fill="#26262b" />
  <circle cx="102" cy="70" r="5" fill="#26262b" />
  <text x="130" y="74" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13" font-weight="500">validedi // HIPAA-X12-PARSER</text>

  <!-- Left: Document column with 11 EDI-like lines -->
  <g transform="translate(80, 130)">
    <rect x="0" y="0" width="620" height="490" rx="8" fill="#111115" stroke="#26262b" stroke-width="1" />
    <text x="24" y="36" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="12" font-weight="600">INPUT DOCUMENT: CLAIM_BATCH_837P.EDI</text>
    <line x1="0" y1="52" x2="620" y2="52" stroke="#26262b" stroke-width="1" />

    <!-- 11 EDI lines -->
    <!-- Line 1 -->
    <text x="24" y="85" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="13">ISA*00*          *00*          *ZZ*SUBMITTER01    *ZZ*RECEIVER01     *...</text>
    <!-- Line 2 -->
    <text x="24" y="118" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13">GS*HC*SENDER*RECEIVER*20250315*1130*1*X*005010X222A1~</text>
    <!-- Line 3 (highlighted with accent zigzag underline) -->
    <text x="24" y="151" fill="#e4e4e7" font-family="Geist Mono, ui-monospace, monospace" font-size="13">ST*837*0001*005010X222A1~</text>
    <path d="M24 161 L32 157 L40 161 L48 157 L56 161 L64 157 L72 161 L80 157 L88 161 L96 157 L104 161 L112 157 L120 161" stroke="#ff5a2c" stroke-width="1.5" fill="none" />
    
    <!-- Line 4 -->
    <text x="24" y="184" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13">BHT*0019*00*BATCH00912*20250315*1130*CH~</text>
    <!-- Line 5 -->
    <text x="24" y="217" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13">NM1*41*2*PRIMARY CARE CLINIC*****XX*1982736450~</text>
    <!-- Line 6 -->
    <text x="24" y="250" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13">HL*1**20*1~</text>
    <!-- Line 7 -->
    <text x="24" y="283" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13">NM1*85*2*METRO BILLING SERVICES*****XX*9876543210~</text>
    <!-- Line 8 (highlighted with accent zigzag underline) -->
    <text x="24" y="316" fill="#e4e4e7" font-family="Geist Mono, ui-monospace, monospace" font-size="13">CLM*A98210*1250.00***11:B:1*Y*A*Y*Y~</text>
    <path d="M24 326 L32 322 L40 326 L48 322 L56 326 L64 322 L72 326 L80 322 L88 326 L96 322 L104 326 L112 322 L120 326" stroke="#ff5a2c" stroke-width="1.5" fill="none" />

    <!-- Line 9 -->
    <text x="24" y="349" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13">HI*ABK:J45909*ABF:R051~</text>
    <!-- Line 10 -->
    <text x="24" y="382" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="13">NM1*IL*1*DOE*JOHN****MI*999887766~</text>
    <!-- Line 11 -->
    <text x="24" y="415" fill="#52525b" font-family="Geist Mono, ui-monospace, monospace" font-size="13">SE*28*0001~ GE*1*1~ IEA*1*000000001~</text>

    <!-- Truncation ellipsis -->
    <rect x="24" y="445" width="6" height="6" rx="1" fill="#3f3f46" />
    <rect x="36" y="445" width="6" height="6" rx="1" fill="#3f3f46" />
    <rect x="48" y="445" width="6" height="6" rx="1" fill="#3f3f46" />
  </g>

  <!-- Right: Validation list (6 rows with check/cross and bar) -->
  <g transform="translate(740, 130)">
    <rect x="0" y="0" width="460" height="490" rx="8" fill="#111115" stroke="#26262b" stroke-width="1" />
    <text x="24" y="36" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="13" font-weight="600">Validation Matrix (50+ rules)</text>
    
    <!-- Footer chip: 837 / 835 / 834 -->
    <rect x="300" y="20" width="136" height="26" rx="13" fill="#1c1c22" stroke="#26262b" stroke-width="1" />
    <text x="368" y="37" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="11" font-weight="500" text-anchor="middle">837 / 835 / 834</text>

    <line x1="0" y1="58" x2="460" y2="58" stroke="#26262b" stroke-width="1" />

    <!-- 6 Validation Rows -->
    <!-- Row 1: Valid -->
    <g transform="translate(24, 85)">
      <rect x="0" y="0" width="22" height="22" rx="4" fill="#18181d" stroke="#26262b" stroke-width="1" />
      <path d="M5 11 L9 15 L17 7" stroke="#a1a1aa" stroke-width="1.5" fill="none" />
      <rect x="36" y="7" width="180" height="8" rx="2" fill="#71717a" />
      <text x="360" y="15" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="11">LOOP 1000A</text>
    </g>

    <!-- Row 2: Valid -->
    <g transform="translate(24, 135)">
      <rect x="0" y="0" width="22" height="22" rx="4" fill="#18181d" stroke="#26262b" stroke-width="1" />
      <path d="M5 11 L9 15 L17 7" stroke="#a1a1aa" stroke-width="1.5" fill="none" />
      <rect x="36" y="7" width="210" height="8" rx="2" fill="#71717a" />
      <text x="360" y="15" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="11">LOOP 2000A</text>
    </g>

    <!-- Row 3: Flagged in accent -->
    <g transform="translate(24, 185)">
      <rect x="0" y="0" width="22" height="22" rx="4" fill="#251613" stroke="#ff5a2c" stroke-width="1" />
      <path d="M6 6 L16 16 M16 6 L6 16" stroke="#ff5a2c" stroke-width="1.5" />
      <rect x="36" y="7" width="160" height="8" rx="2" fill="#ff5a2c" />
      <text x="360" y="15" fill="#ff5a2c" font-family="Geist Mono, ui-monospace, monospace" font-size="11">RULE 2300-3</text>
    </g>

    <!-- Row 4: Valid -->
    <g transform="translate(24, 235)">
      <rect x="0" y="0" width="22" height="22" rx="4" fill="#18181d" stroke="#26262b" stroke-width="1" />
      <path d="M5 11 L9 15 L17 7" stroke="#a1a1aa" stroke-width="1.5" fill="none" />
      <rect x="36" y="7" width="195" height="8" rx="2" fill="#71717a" />
      <text x="360" y="15" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="11">LOOP 2310A</text>
    </g>

    <!-- Row 5: Valid -->
    <g transform="translate(24, 285)">
      <rect x="0" y="0" width="22" height="22" rx="4" fill="#18181d" stroke="#26262b" stroke-width="1" />
      <path d="M5 11 L9 15 L17 7" stroke="#a1a1aa" stroke-width="1.5" fill="none" />
      <rect x="36" y="7" width="140" height="8" rx="2" fill="#71717a" />
      <text x="360" y="15" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="11">LOOP 2400</text>
    </g>

    <!-- Row 6: Valid -->
    <g transform="translate(24, 335)">
      <rect x="0" y="0" width="22" height="22" rx="4" fill="#18181d" stroke="#26262b" stroke-width="1" />
      <path d="M5 11 L9 15 L17 7" stroke="#a1a1aa" stroke-width="1.5" fill="none" />
      <rect x="36" y="7" width="230" height="8" rx="2" fill="#71717a" />
      <text x="360" y="15" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="11">HI SEGMENT</text>
    </g>

    <line x1="24" y1="390" x2="436" y2="390" stroke="#26262b" stroke-width="1" />

    <!-- AI inference indicator -->
    <rect x="24" y="420" width="412" height="42" rx="6" fill="#18181d" stroke="#26262b" stroke-width="1" />
    <text x="44" y="445" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="12">Groq Llama 3.3 // Hierarchical Audit: PASSED</text>
  </g>
</svg>`;
}

// -----------------------------------------------------------------
// 3. ARTHIX Cover (1280x720)
// -----------------------------------------------------------------
function generateArthixSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <rect width="1280" height="720" fill="#0f0f12" />

  <!-- Background blueprint alignment grid hairlines -->
  <line x1="0" y1="360" x2="1280" y2="360" stroke="#1c1c22" stroke-width="1" stroke-dasharray="4 6" />
  <line x1="640" y1="0" x2="640" y2="720" stroke="#1c1c22" stroke-width="1" stroke-dasharray="4 6" />

  <!-- Left motion shake arc -->
  <path d="M430 310 C390 330 390 390 430 410" stroke="#71717a" stroke-width="2" fill="none" stroke-linecap="round" />
  <path d="M410 330 C380 345 380 375 410 390" stroke="#52525b" stroke-width="1.5" fill="none" stroke-linecap="round" />

  <!-- Right motion shake arc -->
  <path d="M850 310 C890 330 890 390 850 410" stroke="#71717a" stroke-width="2" fill="none" stroke-linecap="round" />
  <path d="M870 330 C900 345 900 375 870 390" stroke="#52525b" stroke-width="1.5" fill="none" stroke-linecap="round" />

  <!-- Centred Phone Outline: 280 x 520, rounded rect rx="36" -->
  <g transform="translate(500, 100)">
    <!-- Outer phone chassis -->
    <rect x="0" y="0" width="280" height="520" rx="36" fill="#141418" stroke="#3f3f46" stroke-width="2" />
    
    <!-- Phone screen bezel -->
    <rect x="12" y="16" width="256" height="488" rx="28" fill="#0c0c0e" stroke="#26262b" stroke-width="1" />

    <!-- Speaker notch -->
    <rect x="105" y="26" width="70" height="5" rx="2.5" fill="#26262b" />
    <circle cx="185" cy="28.5" r="3" fill="#26262b" />

    <!-- Top status bar -->
    <text x="32" y="58" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="11">09:41</text>
    <rect x="220" y="50" width="18" height="9" rx="2" fill="none" stroke="#71717a" stroke-width="1" />
    <rect x="222" y="52" width="10" height="5" rx="1" fill="#71717a" />

    <!-- In-app Notification Card -->
    <g transform="translate(24, 90)">
      <rect x="0" y="0" width="232" height="110" rx="14" fill="#18181e" stroke="#26262b" stroke-width="1" />
      
      <!-- Bank icon badge -->
      <rect x="14" y="14" width="28" height="28" rx="6" fill="#26262b" />
      <text x="28" y="32" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="12" text-anchor="middle" font-weight="600">UPI</text>

      <rect x="52" y="18" width="90" height="8" rx="2" fill="#71717a" />
      <rect x="52" y="32" width="60" height="6" rx="2" fill="#52525b" />

      <!-- Rupee amount: glyph ₹ next to bar -->
      <g transform="translate(14, 62)">
        <text x="4" y="24" fill="#ffffff" font-family="Geist Mono, ui-monospace, monospace" font-size="20" font-weight="600">₹</text>
        <rect x="26" y="8" width="85" height="16" rx="3" fill="#e4e4e7" />
        <text x="140" y="22" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="11">Debited</text>
      </g>
    </g>

    <!-- Shake Detection Prompt -->
    <g transform="translate(24, 230)">
      <text x="116" y="0" fill="#a1a1aa" font-family="Geist Mono, ui-monospace, monospace" font-size="12" text-anchor="middle">SHAKE TO CATEGORIZE</text>
      <rect x="36" y="12" width="160" height="6" rx="2" fill="#26262b" />
    </g>

    <!-- Row of 5 Category Dots (3rd dot in accent #ff5a2c) -->
    <g transform="translate(24, 280)">
      <!-- Dot 1 -->
      <circle cx="36" cy="0" r="14" fill="#18181e" stroke="#26262b" stroke-width="1.5" />
      <!-- Dot 2 -->
      <circle cx="76" cy="0" r="14" fill="#18181e" stroke="#26262b" stroke-width="1.5" />
      <!-- Dot 3: Accent highlighted -->
      <circle cx="116" cy="0" r="16" fill="#ff5a2c" stroke="#ff5a2c" stroke-width="2" />
      <circle cx="116" cy="0" r="6" fill="#ffffff" />
      <!-- Dot 4 -->
      <circle cx="156" cy="0" r="14" fill="#18181e" stroke="#26262b" stroke-width="1.5" />
      <!-- Dot 5 -->
      <circle cx="196" cy="0" r="14" fill="#18181e" stroke="#26262b" stroke-width="1.5" />
    </g>

    <!-- On-Device AI / Privacy Badge -->
    <g transform="translate(24, 340)">
      <rect x="16" y="0" width="200" height="30" rx="15" fill="#141418" stroke="#26262b" stroke-width="1" />
      <text x="116" y="19" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="11" text-anchor="middle">ON-DEVICE · SQLCIPHER</text>
    </g>

    <!-- Recent Expenses List Wireframe -->
    <g transform="translate(24, 400)">
      <line x1="0" y1="0" x2="232" y2="0" stroke="#26262b" stroke-width="1" />
      <rect x="14" y="16" width="30" height="6" rx="2" fill="#52525b" />
      <rect x="180" y="16" width="40" height="6" rx="2" fill="#71717a" />
      
      <line x1="0" y1="36" x2="232" y2="36" stroke="#1c1c22" stroke-width="1" />
      <rect x="14" y="50" width="45" height="6" rx="2" fill="#52525b" />
      <rect x="180" y="50" width="40" height="6" rx="2" fill="#71717a" />
    </g>
  </g>

  <!-- Technical Annotation Labels -->
  <text x="120" y="650" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="12">NO BACKEND // AES-256 ENCRYPTED ROOM DB</text>
  <text x="1160" y="650" fill="#71717a" font-family="Geist Mono, ui-monospace, monospace" font-size="12" text-anchor="end">120s SYMMETRIC WINDOW RECONCILIATION</text>
</svg>`;
}

fs.writeFileSync(path.join(OUT_DIR, "sar-generator.svg"), generateSarGeneratorSvg());
console.log("Created public/projects/sar-generator.svg");

fs.writeFileSync(path.join(OUT_DIR, "validedi.svg"), generateValidEdiSvg());
console.log("Created public/projects/validedi.svg");

fs.writeFileSync(path.join(OUT_DIR, "arthix.svg"), generateArthixSvg());
console.log("Created public/projects/arthix.svg");
