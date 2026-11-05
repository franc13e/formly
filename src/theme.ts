import type { PhaseId } from "./types";
// ─── Design tokens ────────────────────────────────────────────────────────────
export const C = {
  // Soft Blush: a pale blush ground, white cards, one petal-pink accent; the other
  // pastels are kept equally soft and used for meaning (phases, food types).
  bg:"#FFF4F5", bgDeep:"#FBEAED", card:"#FFFFFF",
  // "lavender" is the soft highlight for selected things; kept pink-leaning so screens stay rosy.
  lavender:"#FBEAF0", lavenderDeep:"#F2C9D6",
  rose:"#FDE7EC", roseDeep:"#F6B7C4",
  sage:"#E6F4EA", sageDeep:"#BFE3C8",
  butter:"#FFF3D6", butterDeep:"#F8D57E",
  peach:"#FFEADF", peachDeep:"#F9C6AE",
  sky:"#E4F0F8", skyDeep:"#BCD9EC",
  text:"#3A2630", textMid:"#6E5662", textSoft:"#82677A",
  border:"#F3DFE4", shadow:"rgba(201,110,138,0.14)", white:"#FFFFFF",
  /** Main accent fill (buttons, today, active tab); always with dark text on it. */
  petal:"#F6B7C4",
  /** Accent for text and icons on light grounds (passes contrast on white). */
  accentInk:"#B5506E",
  /** The dark pill navigation. */
  ink:"#2E2229",
} as const;
export const ACCENT = {
  protein:{text:"#B5506E"}, carbs:{text:"#8A6A12"}, fats:{text:"#A65A33"},
  sugar:{text:"#9A4F78"}, fiber:{text:"#3F7A4E"}, water:{text:"#2F6A92", deep:C.skyDeep},
} as const;
/** Home background, tinted by the current phase. */
export const PHASE_GROUND = {
  menstrual:"#FFF5F6", follicular:"#F8FBF7", ovulation:"#FFFBF3", luteal:"#FAF8FD",
} as const;

/** Soft ring colours per phase, and the darker shade used for the "today" marker. */
export const RING: Record<PhaseId, { arc: string; mark: string }> = {
  menstrual:  { arc: "#F6B7C4", mark: "#E07F96" },
  follicular: { arc: "#BFE3C8", mark: "#7FBF90" },
  ovulation:  { arc: "#F8D57E", mark: "#D9AE3F" },
  luteal:     { arc: "#DCD3F1", mark: "#A893DA" },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html,body{-webkit-user-select:none;user-select:none;}
  *{-webkit-user-select:none;user-select:none;}
  input,textarea,select{-webkit-user-select:text !important;user-select:text !important;}
  @keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.7}}
  .slide-in{animation:slideIn .25s cubic-bezier(.34,1.2,.64,1)}
  .pulse-dot{animation:pulse 2s ease-in-out infinite}
  html,body,#root{height:100%;background:#F8E6EA;font-family:'DM Sans',system-ui,sans-serif;color:${C.text};}
  ::-webkit-scrollbar{display:none;}
  .shell{max-width:430px;min-height:100dvh;margin:0 auto;background:${C.bg};display:flex;flex-direction:column;overflow:hidden;}
  @media(min-width:768px){
    .shell{max-width:100%;flex-direction:row;}
    .desktop-sidebar{width:240px;min-width:240px;height:100dvh;background:${C.card};border-right:1.5px solid ${C.border};display:flex;flex-direction:column;padding:32px 0;position:sticky;top:0;flex-shrink:0;}
    .desktop-content{flex:1;max-width:860px;overflow-y:auto;height:100dvh;}
    .bottom-nav{display:none !important;}
    .scroll{padding-bottom:40px !important;padding-top:32px !important;}
    .modal{border-radius:18px !important;margin:auto;max-width:520px !important;}
    .modal-overlay{align-items:center !important;}
  }
  @media(max-width:767px){.desktop-sidebar{display:none;}}
  .scroll{flex:1;overflow-y:auto;padding-bottom:110px;}
  .card{background:${C.card};border-radius:22px;box-shadow:0 6px 20px ${C.shadow};padding:18px;}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;cursor:pointer;font-family:'DM Sans',system-ui,sans-serif;font-weight:700;transition:transform .1s;border-radius:50px;}
  .btn:active{transform:scale(.96);}
  .btn-primary{background:${C.petal};color:${C.text};padding:12px 22px;font-size:14px;font-weight:600;box-shadow:0 6px 16px ${C.shadow};}
  .btn-primary:disabled{opacity:.55;cursor:default;}
  .btn-ghost{background:${C.white};color:${C.textMid};padding:10px 18px;font-size:13px;border:1.5px solid ${C.border};}
  .btn-sm{padding:8px 16px;font-size:12px;}
  .input{width:100%;background:#FFF8F9;border:1.5px solid ${C.border};border-radius:14px;padding:11px 14px;color:${C.text};font-size:14px;font-family:'DM Sans',system-ui,sans-serif;font-weight:600;outline:none;transition:border-color .15s;}
  .input:focus{border-color:${C.petal};background:${C.white};}
  .input::placeholder{color:${C.textSoft};font-weight:500;}
  select.input{appearance:none;}
  .label{font-size:12px;font-weight:700;color:${C.textMid};margin-bottom:5px;display:block;}
  .chip{padding:7px 14px;border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid ${C.border};background:${C.white};color:${C.textMid};transition:all .15s;font-family:'DM Sans',system-ui,sans-serif;}
  .row{display:flex;align-items:center;gap:8px;}
  .row-between{display:flex;align-items:center;justify-content:space-between;}
  .sec-title{font-size:14px;font-weight:600;color:${C.textMid};margin-bottom:10px;}
  .pill-track{background:${C.bgDeep};border-radius:99px;height:8px;overflow:hidden;}
  .pill-fill{height:100%;border-radius:99px;transition:width .5s cubic-bezier(.34,1.2,.64,1);}
  .modal-overlay{position:fixed;inset:0;background:rgba(58,38,48,.32);display:flex;align-items:flex-end;justify-content:center;z-index:100;backdrop-filter:blur(6px);animation:fadeIn .2s ease;}
  .modal{background:${C.bg};border-radius:28px 28px 0 0;padding:24px 22px max(24px,env(safe-area-inset-bottom));width:100%;max-width:430px;max-height:88dvh;overflow-y:auto;animation:slideUp .25s cubic-bezier(.34,1.3,.64,1);}
  .modal-handle{width:36px;height:4px;background:${C.border};border-radius:99px;margin:0 auto 20px;}
  .modal-title{font-family:'DM Serif Display',Georgia,serif;font-size:24px;font-weight:400;margin-bottom:18px;}
  .h-display{font-family:'DM Serif Display',Georgia,serif;font-weight:400;letter-spacing:-.005em;}
  .toast{position:fixed;top:60px;left:50%;transform:translateX(-50%);background:${C.text};color:${C.white};padding:10px 20px;border-radius:99px;font-size:13px;font-weight:700;z-index:200;white-space:nowrap;animation:toastIn .25s cubic-bezier(.34,1.3,.64,1);}
  .spin{width:18px;height:18px;border:2.5px solid ${C.border};border-top-color:${C.accentInk};border-radius:50%;animation:spinning .7s linear infinite;}
  .bottom-nav{position:fixed;bottom:max(14px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:calc(100% - 28px);max-width:402px;display:flex;align-items:center;gap:10px;z-index:50;}
  .nav-pill{flex:1;height:62px;background:${C.ink};border-radius:999px;display:flex;align-items:center;padding:0 6px;box-shadow:0 10px 28px rgba(46,34,41,.25);}
  .nav-add{width:62px;height:62px;flex-shrink:0;border:0;border-radius:50%;background:${C.ink};color:${C.petal};display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 28px rgba(46,34,41,.25);}
  .nav-tab{flex:1;height:48px;border:0;background:none;border-radius:999px;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:all .2s;font-family:'DM Sans',system-ui,sans-serif;}
  .nav-tab.active{flex:2.2;background:${C.petal};padding:0 10px;}
  .nav-tab:focus-visible,.nav-add:focus-visible{outline:2px solid ${C.petal};outline-offset:2px;}
  .nav-tab:active{transform:scale(.9);}
  .nav-icon-wrap{display:flex;align-items:center;justify-content:center;}
  
  .nav-label{display:none;font-size:12px;font-weight:600;color:${C.text};white-space:nowrap;}
  .nav-label.active{display:inline;}
  .workout-card{background:${C.card};border-radius:20px;box-shadow:0 6px 20px ${C.shadow};padding:16px;display:flex;flex-direction:column;gap:8px;}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(60px);opacity:.5}to{transform:translateY(0);opacity:1}}
  @keyframes toastIn{from{transform:translateX(-50%) translateY(-16px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
  @keyframes spinning{to{transform:rotate(360deg)}}
`;
