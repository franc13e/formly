import { useEffect, useRef, useState } from "react";
import { RotateCcw, SendHorizontal, Trash2 } from "lucide-react";
import { C } from "../theme";
import { callFoodChat } from "../lib/api";
import { load, save } from "../lib/storage";
import { buildFoodContext, MAX_USER_CHARS, recentForSend, STARTER_PROMPTS, stripEmphasis, trimHistory } from "../data/foodChat";
import { Glyph } from "./Glyph";
import type { ChatMessage, CycleInfo } from "../types";

interface FoodChatProps {
  cycleInfo: CycleInfo | null;
}

const PURPLE = "#7050B0";

/** Three bouncing dots shown while the coach is replying. */
function TypingDots() {
  return (
    <div aria-label="Coach is typing" style={{alignSelf:"flex-start",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:"18px 18px 18px 4px",padding:"12px 16px",display:"flex",gap:5,boxShadow:`0 2px 8px ${C.shadow}`}}>
      {[0,1,2].map(i => (
        <span key={i} style={{width:7,height:7,borderRadius:"50%",background:C.lavenderDeep,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>
      ))}
    </div>
  );
}

/** The "Ask" sub-tab: a cycle-aware food coach chat, persisted under "food-chat". */
export function FoodChat({ cycleInfo }: FoodChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => trimHistory(load<ChatMessage[]>("food-chat", [])));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The goal picked under the old "My Goal" list; there is no picker anymore but the coach still uses it.
  const [goal] = useState(() => load("food-goal", ""));
  const requestId = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => { save("food-chat", messages); }, [messages]);

  useEffect(() => {
    // Don't jump the page on first render; follow new messages afterwards.
    if (!mounted.current) { mounted.current = true; return; }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  const request = async (history: ChatMessage[]) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const reply = stripEmphasis(await callFoodChat(recentForSend(history), buildFoodContext(cycleInfo, goal) || undefined));
      if (id !== requestId.current) return;
      setMessages(m => trimHistory([...m, { role: "assistant", content: reply || "Sorry, I didn't catch that. Could you ask again?" }]));
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setLoading(false);
  };

  const send = (text: string) => {
    const content = text.trim().slice(0, MAX_USER_CHARS);
    if (!content || loading) return;
    const next = trimHistory([...messages, { role: "user", content }]);
    setMessages(next);
    setInput("");
    void request(next);
  };

  const clear = () => {
    requestId.current++;
    setMessages([]);
    setLoading(false);
    setError(null);
  };

  const canRetry = !!error && !loading && messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <div>
      <div className="row-between" style={{marginBottom:12}}>
        <div>
          <div style={{fontWeight:800,fontSize:14,color:C.textMid}}>Ask your food coach</div>
          <div style={{fontSize:12,color:C.textSoft,fontWeight:500,marginTop:2}}>
            {cycleInfo ? <>Answers tuned to your {cycleInfo.phase.label.toLowerCase()} phase (day {cycleInfo.dayOfCycle})</> : "Log your cycle in Body for phase-aware answers"}
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} style={{display:"inline-flex",alignItems:"center",gap:4,background:"none",border:"none",fontSize:11,color:"#9070C0",fontWeight:700,cursor:"pointer",fontFamily:"Nunito",flexShrink:0}}>
            <Trash2 size={13} aria-hidden="true"/> Clear chat
          </button>
        )}
      </div>

      {messages.length === 0 && !loading ? (
        <div className="card" style={{marginBottom:14,textAlign:"center",padding:"22px 18px"}}>
          <div style={{marginBottom:10}}><Glyph emoji="🥗" size={20}/></div>
          <div style={{fontWeight:800,fontSize:15,marginBottom:6}}>What's on your plate?</div>
          <div style={{fontSize:12,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:14}}>
            Ask anything about food, cravings, hydration or eating for your goals.
            {goal && <> I'll keep your goal in mind: <span style={{color:C.textMid,fontWeight:700}}>{goal}</span>.</>}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
            {STARTER_PROMPTS.map(p => (
              <button key={p} className="chip" onClick={() => send(p)} style={{textAlign:"left",lineHeight:1.4}}>{p}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
          {messages.map((m, i) => m.role === "user" ? (
            <div key={i} style={{alignSelf:"flex-end",maxWidth:"85%",background:C.lavender,color:"#4030A0",borderRadius:"18px 18px 4px 18px",padding:"10px 14px",fontSize:13,fontWeight:600,lineHeight:1.55,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.content}</div>
          ) : (
            <div key={i} style={{alignSelf:"flex-start",maxWidth:"90%",background:C.card,border:`1.5px solid ${C.border}`,boxShadow:`0 2px 8px ${C.shadow}`,color:C.text,borderRadius:"18px 18px 18px 4px",padding:"12px 14px",fontSize:13,fontWeight:500,lineHeight:1.65,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.content}</div>
          ))}
          {loading && <TypingDots/>}
          {error && (
            <div style={{alignSelf:"flex-start",display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#C05070",fontWeight:600}}>
              <span>Couldn't get a reply: {error}</span>
              {canRetry && (
                <button onClick={() => void request(messages)} style={{display:"inline-flex",alignItems:"center",gap:4,background:"none",border:"none",color:PURPLE,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"Nunito"}}>
                  <RotateCcw size={12} aria-hidden="true"/> Retry
                </button>
              )}
            </div>
          )}
          <div ref={endRef}/>
        </div>
      )}

      <form className="row" style={{gap:8}} onSubmit={e => { e.preventDefault(); send(input); }}>
        <input className="input" aria-label="Ask a food question" placeholder="Ask about food, cravings, snacks..." value={input} maxLength={MAX_USER_CHARS} onChange={e => setInput(e.target.value)} style={{fontSize:13}}/>
        <button type="submit" className="btn btn-primary" aria-label="Send" disabled={loading || !input.trim()} style={{flexShrink:0,width:44,height:44,padding:0,opacity:loading||!input.trim()?0.6:1}}>
          {loading ? <div className="spin"/> : <SendHorizontal size={18} aria-hidden="true"/>}
        </button>
      </form>
      <div style={{fontSize:10,color:C.textSoft,fontWeight:500,marginTop:8,textAlign:"center",lineHeight:1.5}}>General food guidance, not medical advice. For symptoms that worry you, see a doctor or dietitian.</div>
    </div>
  );
}
