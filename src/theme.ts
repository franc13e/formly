// ─── Design tokens ────────────────────────────────────────────────────────────
export const C = {
  bg:"#FDF6EE", bgDeep:"#F5EDE0", card:"#FFFAF5",
  lavender:"#EDE6F8", lavenderDeep:"#D4C8F0",
  rose:"#FDE8E8", roseDeep:"#F5C8C8",
  sage:"#DFF0DA", sageDeep:"#B8DDB0",
  butter:"#FFF6D0", butterDeep:"#FFE89A",
  peach:"#FFE8D6", peachDeep:"#FFCBA4",
  sky:"#D6EDFF", skyDeep:"#A8D4F5",
  text:"#3D2C1E", textMid:"#7A6055", textSoft:"#B09A8A",
  border:"#EAD9C8", shadow:"rgba(120,80,40,0.08)", white:"#FFFDF9",
} as const;
export const ACCENT = {
  protein:{text:"#C05070"}, carbs:{text:"#9A7010"}, fats:{text:"#B05020"},
  sugar:{text:"#7050B0"}, fiber:{text:"#3A7A30"}, water:{text:"#2060A0", deep:C.skyDeep},
} as const;

// ─── CSS ──────────────────────────────────────────────────────────────────────
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html,body{-webkit-user-select:none;user-select:none;}
  *{-webkit-user-select:none;user-select:none;}
  input,textarea,select{-webkit-user-select:text !important;user-select:text !important;}
  @keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.7}}
  .slide-in{animation:slideIn .25s cubic-bezier(.34,1.2,.64,1)}
  .pulse-dot{animation:pulse 2s ease-in-out infinite}
  html,body,#root{height:100%;background:#E8DDD0;font-family:'Nunito',sans-serif;color:${C.text};}
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
  .scroll{flex:1;overflow-y:auto;padding-bottom:90px;}
  .card{background:${C.card};border-radius:22px;box-shadow:0 2px 12px ${C.shadow};padding:18px;border:1.5px solid ${C.border};}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;transition:transform .1s;border-radius:50px;}
  .btn:active{transform:scale(.96);}
  .btn-primary{background:${C.lavenderDeep};color:#5040A0;padding:12px 22px;font-size:14px;box-shadow:0 3px 10px rgba(130,100,200,.25);}
  .btn-ghost{background:${C.white};color:${C.textMid};padding:10px 18px;font-size:13px;border:1.5px solid ${C.border};}
  .btn-sm{padding:8px 16px;font-size:12px;}
  .input{width:100%;background:${C.bgDeep};border:1.5px solid ${C.border};border-radius:14px;padding:11px 14px;color:${C.text};font-size:14px;font-family:'Nunito',sans-serif;font-weight:600;outline:none;transition:border-color .15s;}
  .input:focus{border-color:${C.lavenderDeep};background:${C.white};}
  .input::placeholder{color:${C.textSoft};font-weight:500;}
  select.input{appearance:none;}
  .label{font-size:12px;font-weight:700;color:${C.textMid};margin-bottom:5px;display:block;}
  .chip{padding:7px 14px;border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid ${C.border};background:${C.white};color:${C.textMid};transition:all .15s;font-family:'Nunito',sans-serif;}
  .row{display:flex;align-items:center;gap:8px;}
  .row-between{display:flex;align-items:center;justify-content:space-between;}
  .sec-title{font-size:14px;font-weight:800;color:${C.textMid};margin-bottom:10px;}
  .pill-track{background:${C.bgDeep};border-radius:99px;height:8px;overflow:hidden;}
  .pill-fill{height:100%;border-radius:99px;transition:width .5s cubic-bezier(.34,1.2,.64,1);}
  .modal-overlay{position:fixed;inset:0;background:rgba(60,30,10,.35);display:flex;align-items:flex-end;justify-content:center;z-index:100;backdrop-filter:blur(6px);animation:fadeIn .2s ease;}
  .modal{background:${C.bg};border-radius:28px 28px 0 0;padding:24px 22px max(24px,env(safe-area-inset-bottom));width:100%;max-width:430px;max-height:88dvh;overflow-y:auto;animation:slideUp .25s cubic-bezier(.34,1.3,.64,1);}
  .modal-handle{width:36px;height:4px;background:${C.border};border-radius:99px;margin:0 auto 20px;}
  .modal-title{font-size:20px;font-weight:900;margin-bottom:18px;}
  .toast{position:fixed;top:60px;left:50%;transform:translateX(-50%);background:${C.text};color:${C.white};padding:10px 20px;border-radius:99px;font-size:13px;font-weight:700;z-index:200;white-space:nowrap;animation:toastIn .25s cubic-bezier(.34,1.3,.64,1);}
  .spin{width:18px;height:18px;border:2.5px solid ${C.border};border-top-color:#7050B0;border-radius:50%;animation:spinning .7s linear infinite;}
  .bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${C.white};border-top:1.5px solid ${C.border};display:flex;padding:8px 0 max(8px,env(safe-area-inset-bottom));z-index:50;}
  .nav-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 0;transition:transform .1s;}
  .nav-tab:active{transform:scale(.9);}
  .nav-icon-wrap{width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;transition:background .2s;}
  .nav-icon-wrap.active{background:${C.lavender};}
  .nav-label{font-size:10px;font-weight:700;color:${C.textSoft};}
  .nav-label.active{color:#7050B0;}
  .workout-card{background:${C.card};border-radius:18px;border:1.5px solid ${C.border};padding:14px;display:flex;flex-direction:column;gap:8px;}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(60px);opacity:.5}to{transform:translateY(0);opacity:1}}
  @keyframes toastIn{from{transform:translateX(-50%) translateY(-16px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
  @keyframes spinning{to{transform:rotate(360deg)}}
`;
