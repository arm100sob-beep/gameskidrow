import React, { useState, useEffect } from "react";

const ADMIN_USER = "admin";
const ADMIN_PASS = "028771131";

const API_URL = "https://script.google.com/macros/s/AKfycbziy4rzKP5Qmva511fDQC8O32IFA3aYxPSSultPVjCEMrhWQvfwyvBavy3NLkDJq5rD/exec";

// 🟢 เพิ่มหมวด Indie ไว้แล้ว
const CATEGORIES = ["ทั้งหมด", "Action", "RPG", "Strategy", "Racing", "Horror", "Simulation", "Indie"];
const ITEMS_PER_PAGE = 20;
const COLS = 4;

const fetchGames = () => {
  return new Promise((resolve, reject) => {
    const cbName = "cb_" + Date.now();
    const script = document.createElement("script");
    window[cbName] = (data) => {
      delete window[cbName];
      document.body.removeChild(script);
      // 🟢 แก้ไข: ใส่ .reverse() เพื่อให้ข้อมูลล่าสุด (ท้าย Sheet) ขึ้นมาอยู่บนสุดเสมอ
      resolve(Array.isArray(data) ? data.filter(g => g.id).reverse() : []);
    };
    script.onerror = () => { delete window[cbName]; reject(new Error("fetch failed")); };
    script.src = API_URL + "?callback=" + cbName;
    document.body.appendChild(script);
  });
};

const postAPI = (body) => {
  return new Promise((resolve) => {
    fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    })
    .then(() => resolve())
    .catch((err) => { console.error("Error:", err); resolve(); });
  });
};

const Icon = ({ name }) => {
  const icons = {
    download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    admin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    back: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    fire: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 0 1-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.17-.77-.35z"/></svg>,
    image: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  };
  return icons[name] || null;
};

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)" }} />
      <div style={{ position:"relative",zIndex:1,width:"min(95vw,640px)",maxHeight:"90vh",overflowY:"auto",background:"#0f1117",border:"1px solid #2a2d3a",borderRadius:16,padding:32,boxShadow:"0 25px 80px rgba(0,0,0,0.8)" }}>
        {children}
      </div>
    </div>
  );
}

function GameForm({ initial, onSave, onCancel }) {
  const empty = { title:"", category:"Action", image:"", description:"", links:[{ label:"", url:"" }] };
  const [form, setForm] = useState(initial || empty);
  const setField = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const setLink = (i, k, v) => setForm(f => { const links=[...f.links]; links[i]={...links[i],[k]:v}; return {...f,links}; });
  const addLink = () => setForm(f => ({ ...f, links:[...f.links,{label:"",url:""}] }));
  const removeLink = (i) => setForm(f => ({ ...f, links:f.links.filter((_,j)=>j!==i) }));
  const handle = () => { if (!form.title.trim()) return alert("กรุณาระบุชื่อรายการ"); onSave(form); };
  const inp = { background:"#1a1d27",border:"1px solid #2a2d3a",borderRadius:8,padding:"10px 14px",color:"#e8eaf2",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#7c8099",marginBottom:6,letterSpacing:"0.08em",textTransform:"uppercase" };
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <h2 style={{ margin:0,fontSize:20,fontWeight:700,color:"#e8eaf2" }}>{initial?"แก้ไขรายการ":"เพิ่มรายการใหม่"}</h2>
        <button onClick={onCancel} style={{ background:"none",border:"none",cursor:"pointer",color:"#7c8099",padding:4 }}><Icon name="close" /></button>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        <div><label style={lbl}>ชื่อรายการ *</label><input style={inp} value={form.title} onChange={e=>setField("title",e.target.value)} placeholder="ชื่อเกม..." /></div>
        <div>
          <label style={lbl}>หมวดหมู่</label>
          <select style={{...inp,cursor:"pointer"}} value={form.category} onChange={e=>setField("category",e.target.value)}>
            {/* 🟢 แก้ไข: ใช้ตัวแปร CATEGORIES หลัก โดยตัดคำว่า "ทั้งหมด" ออก จะได้ดึงหมวดใหม่ๆ มาโชว์อัตโนมัติ */}
            {CATEGORIES.filter(c => c !== "ทั้งหมด").map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>URL รูปภาพ</label>
          <input style={inp} value={form.image} onChange={e=>setField("image",e.target.value)} placeholder="https://..." />
          {form.image && <img src={form.image} alt="" style={{ marginTop:8,width:"100%",height:140,objectFit:"cover",borderRadius:8,border:"1px solid #2a2d3a" }} onError={e=>{e.target.style.display="none";}} />}
        </div>
        <div><label style={lbl}>รายละเอียด</label><textarea style={{...inp,minHeight:90,resize:"vertical",fontFamily:"inherit"}} value={form.description} onChange={e=>setField("description",e.target.value)} placeholder="คำอธิบายเกม..." /></div>
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
            <label style={{...lbl,margin:0}}>ลิงค์ดาวน์โหลด</label>
            <button onClick={addLink} style={{ background:"#7c3aed22",border:"1px solid #7c3aed55",borderRadius:6,padding:"5px 10px",color:"#a78bfa",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:4 }}><Icon name="plus" /> เพิ่มลิงค์</button>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {form.links.map((lk,i)=>(
              <div key={i} style={{ display:"flex",gap:8,alignItems:"center" }}>
                <input style={{...inp,width:130,flex:"none"}} value={lk.label} onChange={e=>setLink(i,"label",e.target.value)} placeholder="ชื่อ (เช่น Mega)" />
                <input style={{...inp,flex:1}} value={lk.url} onChange={e=>setLink(i,"url",e.target.value)} placeholder="https://..." />
                <button onClick={()=>removeLink(i)} style={{ background:"none",border:"none",cursor:"pointer",color:"#ef4444",padding:4,flexShrink:0 }}><Icon name="trash" /></button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:8 }}>
          <button onClick={onCancel} style={{ flex:1,padding:"11px 0",background:"#1a1d27",border:"1px solid #2a2d3a",borderRadius:10,color:"#7c8099",cursor:"pointer",fontWeight:600,fontSize:14 }}>ยกเลิก</button>
          <button onClick={handle} style={{ flex:2,padding:"11px 0",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14 }}>💾 บันทึก</button>
        </div>
      </div>
    </div>
  );
}

function GameCard({ game, onView }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onClick={()=>onView(game)}
      style={{ background:"#12141f",border:`1px solid ${hovered?"#7c3aed66":"#1e2130"}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"all 0.2s",transform:hovered?"translateY(-4px)":"none",boxShadow:hovered?"0 12px 40px rgba(124,58,237,0.25)":"none" }}>
      <div style={{ position:"relative",aspectRatio:"250/340",overflow:"hidden" }}>
        {game.image
          ? <img src={game.image} alt={game.title} style={{ width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s",transform:hovered?"scale(1.06)":"scale(1)" }} />
          : <div style={{ width:"100%",height:"100%",background:"#1a1d2e",display:"flex",alignItems:"center",justifyContent:"center",color:"#3a3d55" }}><Icon name="image" /></div>}
        <div style={{ position:"absolute",top:8,left:8,background:"#7c3aedcc",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20 }}>{game.category}</div>
      </div>
      <div style={{ padding:"12px 14px" }}>
        <div style={{ fontWeight:700,fontSize:13,color:"#e8eaf2",marginBottom:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{game.title}</div>
        <div style={{ fontSize:11,color:"#5a5f7a",display:"flex",alignItems:"center",gap:5 }}><Icon name="eye" />{(game.views||0).toLocaleString()} views</div>
      </div>
    </div>
  );
}

function DetailModal({ game, open, onClose, onIncView }) {
  useEffect(() => {
    if (open && game) { onIncView(game.id); }
  }, [open]); // eslint-disable-line
  if (!open || !game) return null;
  return (
    <Modal open={true} onClose={onClose}>
      <button onClick={onClose} style={{ position:"absolute",top:16,right:16,background:"#1a1d27",border:"1px solid #2a2d3a",borderRadius:8,padding:"6px 10px",color:"#7c8099",cursor:"pointer" }}><Icon name="close" /></button>
      {game.image && <img src={game.image} alt={game.title} style={{ width:"100%",maxHeight:400,objectFit:"contain",borderRadius:10,marginBottom:20,background:"#0a0b11" }} />}
      <div style={{ display:"inline-block",background:"#7c3aed22",color:"#a78bfa",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,marginBottom:10 }}>{game.category}</div>
      <h2 style={{ margin:"0 0 10px",fontSize:22,color:"#e8eaf2",fontWeight:800 }}>{game.title}</h2>
      <p style={{ color:"#9ca3c0",fontSize:14,lineHeight:1.7,margin:"0 0 20px",whiteSpace:"pre-wrap" }}>{game.description}</p>
      <div style={{ display:"flex",alignItems:"center",gap:6,color:"#5a5f7a",fontSize:12,marginBottom:20 }}><Icon name="eye" />{(game.views||0).toLocaleString()} ครั้ง</div>
      {game.links && game.links.filter(l=>l.url).length > 0 && (
        <div>
          <div style={{ fontSize:12,fontWeight:700,color:"#7c8099",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.08em" }}>ลิงค์ดาวน์โหลด</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {game.links.filter(l=>l.url).map((lk,i)=>(
              <a key={i} href={lk.url} target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",padding:"9px 16px",borderRadius:8,fontSize:13,fontWeight:600,textDecoration:"none" }}>
                <Icon name="download" /> {lk.label||`ลิงค์ ${i+1}`}
              </a>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const handle = () => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) { onLogin(); }
    else { setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"); setShake(true); setTimeout(()=>setShake(false),500); }
  };
  const inp = { background:"#1a1d27",border:"1px solid #2a2d3a",borderRadius:10,padding:"12px 16px",color:"#e8eaf2",fontSize:15,width:"100%",outline:"none",boxSizing:"border-box",fontFamily:"inherit" };
  return (
    <div style={{ minHeight:"100vh",background:"#0a0b11",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans Thai',sans-serif" }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
      <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 50% at 50% 0%,#7c3aed18 0%,transparent 70%)",pointerEvents:"none" }} />
      <div style={{ position:"relative",width:"min(95vw,400px)",background:"#0f1117",border:"1px solid #2a2d3a",borderRadius:20,padding:36,boxShadow:"0 30px 80px rgba(0,0,0,0.7)",animation:shake?"shake 0.4s ease":"none" }}>
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <div style={{ fontSize:36,marginBottom:8 }}>🔐</div>
          <div style={{ fontWeight:900,fontSize:20,color:"#e8eaf2" }}>เข้าสู่ระบบหลังบ้าน</div>
          <div style={{ fontSize:13,color:"#5a5f7a",marginTop:4 }}>กรุณาใส่ข้อมูลเพื่อเข้าใช้งาน</div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#7c8099",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em" }}>ชื่อผู้ใช้</label>
            <input style={inp} value={user} onChange={e=>{setUser(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="username" />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#7c8099",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em" }}>รหัสผ่าน</label>
            <div style={{ position:"relative" }}>
              <input style={{...inp,paddingRight:44}} type={showPass?"text":"password"} value={pass} onChange={e=>{setPass(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="password" />
              <button onClick={()=>setShowPass(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#5a5f7a",fontSize:16,padding:0 }}>{showPass?"🙈":"👁️"}</button>
            </div>
          </div>
          {error && <div style={{ background:"#ef444418",border:"1px solid #ef444440",borderRadius:8,padding:"10px 14px",color:"#ef4444",fontSize:13,textAlign:"center" }}>⚠️ {error}</div>}
          <button onClick={handle} style={{ marginTop:4,padding:"13px 0",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontWeight:800,fontSize:15,fontFamily:"inherit" }}>เข้าสู่ระบบ</button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ games, onSave, onBack }) {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <LoginScreen onLogin={()=>setAuthed(true)} />;
  return <AdminContent games={games} onSave={onSave} onBack={onBack} />;
}

function AdminContent({ games, onSave, onBack }) {
  const [modal, setModal] = useState(null);
  const [del, setDel] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = games.filter(g=>g.title.toLowerCase().includes(search.toLowerCase()));
  
  const handleSave = (form) => {
    const currentModal = modal;
    setModal(null);
    if (currentModal === "add") {
      const newGame = {...form, id: Date.now(), views: 0, date: new Date().toISOString().split("T")[0]};
      // เนื่องจากเราใช้ .reverse() ตอนโหลดข้อมูลแล้ว ตอนเพิ่มเกมใหม่เราเลยดันไปไว้ตำแหน่งแรก [newGame, ...games]
      onSave([newGame, ...games]);
      postAPI({ action: "add", game: newGame });
    } else {
      const updated = {...currentModal, ...form};
      onSave(games.map(g=>g.id===currentModal.id ? updated : g));
      postAPI({ action: "update", game: updated });
    }
  };
  
  const handleDelete = async () => {
    const deletedId = del.id;
    setDel(null);
    onSave(games.filter(g=>g.id!==deletedId));
    postAPI({ action: "delete", id: deletedId });
  };
  
  const th = { padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#5a5f7a",textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:"1px solid #1e2130" };
  const td = { padding:"12px 14px",color:"#c8cad8",fontSize:13,borderBottom:"1px solid #12141f",verticalAlign:"middle" };
  return (
    <div style={{ minHeight:"100vh",background:"#0a0b11",color:"#e8eaf2",fontFamily:"'Noto Sans Thai',sans-serif" }}>
      <div style={{ background:"#0f1117",borderBottom:"1px solid #1e2130",padding:"16px 24px",display:"flex",alignItems:"center",gap:16 }}>
        <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:6,background:"#1a1d27",border:"1px solid #2a2d3a",borderRadius:8,padding:"8px 14px",color:"#a78bfa",cursor:"pointer",fontWeight:600,fontSize:13 }}><Icon name="back" /> กลับหน้าหลัก</button>
        <div style={{ flex:1 }}><h1 style={{ margin:0,fontSize:18,fontWeight:800,color:"#e8eaf2" }}>⚙️ ระบบหลังบ้าน</h1></div>
        <button onClick={()=>setModal("add")} style={{ display:"flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:8,padding:"9px 16px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13 }}><Icon name="plus" /> เพิ่มรายการ</button>
      </div>
      <div style={{ padding:24 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหารายการ..." style={{ background:"#12141f",border:"1px solid #2a2d3a",borderRadius:8,padding:"10px 16px",color:"#e8eaf2",fontSize:14,width:280,outline:"none",marginBottom:16 }} />
        <div style={{ background:"#0f1117",border:"1px solid #1e2130",borderRadius:12,overflow:"hidden" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr><th style={th}>รูป</th><th style={th}>ชื่อรายการ</th><th style={th}>หมวดหมู่</th><th style={th}>ยอดชม</th><th style={th}>ลิงค์</th><th style={th}>จัดการ</th></tr>
            </thead>
            <tbody>
              {filtered.map(g=>(
                <tr key={g.id} onMouseEnter={e=>{e.currentTarget.style.background="#12141f";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                  <td style={td}>{g.image?<img src={g.image} alt="" style={{ width:60,height:38,objectFit:"cover",borderRadius:6,border:"1px solid #2a2d3a" }} />:<div style={{ width:60,height:38,background:"#1a1d27",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#3a3d55" }}><Icon name="image" /></div>}</td>
                  <td style={{...td,fontWeight:600,color:"#e8eaf2"}}>{g.title}</td>
                  <td style={td}><span style={{ background:"#7c3aed22",color:"#a78bfa",fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20 }}>{g.category}</span></td>
                  <td style={{...td,color:"#7c8099"}}>{(g.views||0).toLocaleString()}</td>
                  <td style={{...td,color:"#7c8099"}}>{(g.links||[]).filter(l=>l.url).length} ลิงค์</td>
                  <td style={td}>
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={()=>setModal(g)} style={{ display:"flex",alignItems:"center",gap:4,background:"#1a1d27",border:"1px solid #2a2d3a",borderRadius:6,padding:"6px 10px",color:"#a78bfa",cursor:"pointer",fontSize:12 }}><Icon name="edit" /> แก้ไข</button>
                      <button onClick={()=>setDel(g)} style={{ display:"flex",alignItems:"center",gap:4,background:"#ef444411",border:"1px solid #ef444433",borderRadius:6,padding:"6px 10px",color:"#ef4444",cursor:"pointer",fontSize:12 }}><Icon name="trash" /> ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={6} style={{...td,textAlign:"center",color:"#3a3d55",padding:40}}>ไม่พบรายการ</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop:12,fontSize:12,color:"#3a3d55" }}>ทั้งหมด {filtered.length} รายการ</div>
      </div>
      <Modal open={modal!==null} onClose={()=>setModal(null)}>
        {modal!==null && <GameForm initial={modal==="add"?null:modal} onSave={handleSave} onCancel={()=>setModal(null)} />}
      </Modal>
      <Modal open={del!==null} onClose={()=>setDel(null)}>
        {del!==null && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40,marginBottom:16 }}>🗑️</div>
            <h3 style={{ color:"#e8eaf2",margin:"0 0 8px" }}>ยืนยันการลบ</h3>
            <p style={{ color:"#7c8099",margin:"0 0 24px" }}>ต้องการลบ "<strong style={{ color:"#ef4444" }}>{del.title}</strong>" ใช่หรือไม่?</p>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setDel(null)} style={{ flex:1,padding:"10px 0",background:"#1a1d27",border:"1px solid #2a2d3a",borderRadius:10,color:"#7c8099",cursor:"pointer",fontWeight:600 }}>ยกเลิก</button>
              <button onClick={handleDelete} style={{ flex:1,padding:"10px 0",background:"#ef4444",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontWeight:700 }}>ลบเลย</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [category, setCategory] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  useEffect(() => { setPage(1); }, [category]);

  useEffect(() => {
    fetchGames().then(data => { setGames(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSaveGames = (updated) => { setGames(updated); };
  const incView = (id) => {
    const game = games.find(g => g.id === id);
    if (!game) return;
    const updated = { ...game, views: (game.views || 0) + 1 };
    setGames(games.map(g => g.id === id ? updated : g));
    postAPI({ action: "update", game: updated });
  };
  const filtered = category==="ทั้งหมด" ? games : games.filter(g=>g.category===category);
  const totalPages = Math.ceil(filtered.length/ITEMS_PER_PAGE);
  const paged = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);
  const top5 = [...games].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5);

  if (view==="admin") return <AdminPanel games={games} onSave={handleSaveGames} onBack={()=>setView("home")} />;
  if (loading) return (
    <div style={{ minHeight:"100vh",background:"#0a0b11",display:"flex",alignItems:"center",justifyContent:"center",color:"#a78bfa",fontSize:18,fontFamily:"'Noto Sans Thai',sans-serif" }}>
      ⏳ กำลังโหลด...
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#0a0b11",color:"#e8eaf2",fontFamily:"'Noto Sans Thai','Sarabun',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ background:"linear-gradient(180deg,#0f1117 0%,#0a0b11 100%)",borderBottom:"1px solid #1e2130",padding:"0 24px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(10px)" }}>
        <div style={{ maxWidth:1440,margin:"0 auto",display:"flex",alignItems:"center",gap:16,height:60 }}>
          <div style={{ fontWeight:900,fontSize:22,letterSpacing:"-0.02em" }}>
            <span style={{ color:"#7c3aed" }}>GAME</span><span style={{ color:"#e8eaf2" }}>LOAD</span>
            <span style={{ fontSize:10,background:"#7c3aed22",color:"#a78bfa",padding:"2px 6px",borderRadius:20,marginLeft:6,fontWeight:700,verticalAlign:"middle" }}>TH</span>
          </div>
          <div style={{ flex:1 }} />
          <button onClick={()=>setView("admin")} style={{ display:"flex",alignItems:"center",gap:6,background:"#1a1d27",border:"1px solid #2a2d3a",borderRadius:8,padding:"7px 14px",color:"#a78bfa",cursor:"pointer",fontWeight:600,fontSize:13 }}><Icon name="admin" /> หลังบ้าน</button>
        </div>
      </div>
      
      <div style={{ background:"linear-gradient(135deg,#0f1117 0%,#120d1f 50%,#0a0b11 100%)",padding:"40px 24px 32px",textAlign:"center",borderBottom:"1px solid #1a1d27",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 60% at 50% 0%,#7c3aed18 0%,transparent 70%)",pointerEvents:"none" }} />
        <h1 style={{ margin:"0 0 8px",fontSize:36,fontWeight:900,letterSpacing:"-0.03em",background:"linear-gradient(135deg,#c4b5fd,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>ดาวน์โหลดเกม</h1>
        <p style={{ margin:0,color:"#5a5f7a",fontSize:15 }}>รวมเกมคุณภาพ พร้อมลิงค์ดาวน์โหลดตรง</p>
      </div>

      {/* 🟢 โฆษณาจุดที่ 1: ใต้ Header เหนือแถบหมวดหมู่ 🟢 */}
      <div style={{ maxWidth: 1440, margin: "24px auto 0", padding: "0 24px", textAlign: "center" }}>
        <a href="mailto:gameskidrow@proton.me" style={{ textDecoration: "none", display: "block", width: "100%", maxWidth: "728px", margin: "0 auto" }}>
          <div 
            onMouseEnter={e => { e.currentTarget.style.border = "1px solid #7c3aed"; e.currentTarget.style.background = "#12141f"; }}
            onMouseLeave={e => { e.currentTarget.style.border = "1px dashed #2a2d3a"; e.currentTarget.style.background = "#1a1d27"; }}
            style={{ width: "100%", height: "90px", background: "#1a1d27", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#5a5f7a", border: "1px dashed #2a2d3a", cursor: "pointer", transition: "all 0.2s" }}
          >
            <span style={{ fontSize: "10px", background: "#7c3aed22", color: "#a78bfa", padding: "2px 6px", borderRadius: "4px", marginBottom: "4px", fontWeight: "700" }}>AD</span>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#e8eaf2" }}>พื้นที่โฆษณา สนใจติดต่อ คลิ๊ก!!!</span>
          </div>
        </a>
      </div>

      <div style={{ background:"#0f1117",borderBottom:"1px solid #1e2130",padding:"0 24px", marginTop: "24px" }}>
        <div style={{ maxWidth:1440,margin:"0 auto",display:"flex",gap:2,overflowX:"auto" }}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCategory(c)} style={{ padding:"14px 20px",background:"none",border:"none",borderBottom:`2px solid ${category===c?"#7c3aed":"transparent"}`,color:category===c?"#a78bfa":"#5a5f7a",cursor:"pointer",fontWeight:category===c?700:500,fontSize:14,whiteSpace:"nowrap",transition:"all 0.15s",fontFamily:"inherit" }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1440,margin:"0 auto",padding:"28px 24px",display:"grid",gridTemplateColumns:"1fr 240px",gap:28 }}>
        <div>
          <div style={{ display:"grid",gridTemplateColumns:`repeat(${COLS},1fr)`,gap:14,marginBottom:28 }}>
            
            {paged.map((g) => (
              <GameCard key={g.id} game={g} onView={setDetail} />
            ))}

            {paged.length===0 && <div style={{ gridColumn:`1 / ${COLS+1}`,textAlign:"center",padding:60,color:"#3a3d55",fontSize:15 }}>ไม่พบเกมในหมวดนี้</div>}
          </div>
          
          {totalPages>1 && (
            <div style={{ display:"flex",justifyContent:"center",gap:6,alignItems:"center" }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:"8px 14px",background:"#12141f",border:"1px solid #2a2d3a",borderRadius:8,color:page===1?"#3a3d55":"#a78bfa",cursor:page===1?"default":"pointer",fontSize:13,fontFamily:"inherit" }}>‹ ก่อนหน้า</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                <button key={n} onClick={()=>setPage(n)} style={{ padding:"8px 12px",background:page===n?"#7c3aed":"#12141f",border:`1px solid ${page===n?"#7c3aed":"#2a2d3a"}`,borderRadius:8,color:page===n?"#fff":"#7c8099",cursor:"pointer",fontSize:13,fontWeight:page===n?700:400,minWidth:38,fontFamily:"inherit" }}>{n}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:"8px 14px",background:"#12141f",border:"1px solid #2a2d3a",borderRadius:8,color:page===totalPages?"#3a3d55":"#a78bfa",cursor:page===totalPages?"default":"pointer",fontSize:13,fontFamily:"inherit" }}>ถัดไป ›</button>
            </div>
          )}
          <div style={{ textAlign:"center",marginTop:10,fontSize:12,color:"#3a3d55" }}>แสดง {paged.length} จาก {filtered.length} รายการ</div>
        </div>
        
        <div>
          <div style={{ background:"#0f1117",border:"1px solid #1e2130",borderRadius:14,overflow:"hidden",position:"sticky",top:76 }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid #1e2130",display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ color:"#f59e0b" }}><Icon name="fire" /></span>
              <span style={{ fontWeight:800,fontSize:13,color:"#e8eaf2",letterSpacing:"0.04em",textTransform:"uppercase" }}>ยอดนิยม</span>
            </div>
            <div>
              {top5.map((g,i)=>(
                <div key={g.id} onClick={()=>setDetail(g)}
                  onMouseEnter={e=>{e.currentTarget.style.background="#12141f";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}
                  style={{ display:"flex",gap:10,padding:"12px 16px",borderBottom:i<4?"1px solid #12141f":"none",cursor:"pointer",transition:"background 0.15s",alignItems:"center" }}>
                  <div style={{ width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,flexShrink:0,background:i===0?"#f59e0b22":i===1?"#9ca3af22":i===2?"#cd7c3222":"#1a1d27",color:i===0?"#f59e0b":i===1?"#9ca3af":i===2?"#cd7c32":"#5a5f7a" }}>{i+1}</div>
                  {g.image && <img src={g.image} alt="" style={{ width:44,height:30,objectFit:"cover",borderRadius:5,flexShrink:0,border:"1px solid #2a2d3a" }} />}
                  <div style={{ flex:1,overflow:"hidden" }}>
                    <div style={{ fontSize:12,fontWeight:700,color:"#c8cad8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{g.title}</div>
                    <div style={{ fontSize:10,color:"#5a5f7a",display:"flex",alignItems:"center",gap:4,marginTop:2 }}><Icon name="eye" />{(g.views||0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 โฆษณาจุดที่ 3: ท้ายสุดของหน้าเว็บ (Bottom) 🟢 */}
      <div style={{ maxWidth: 1440, margin: "0 auto 40px", padding: "0 24px", textAlign: "center", clear: "both" }}>
        <a href="mailto:gameskidrow@proton.me" style={{ textDecoration: "none", display: "block", width: "100%", maxWidth: "728px", margin: "0 auto" }}>
          <div 
            onMouseEnter={e => { e.currentTarget.style.border = "1px solid #7c3aed"; e.currentTarget.style.background = "#12141f"; }}
            onMouseLeave={e => { e.currentTarget.style.border = "1px dashed #2a2d3a"; e.currentTarget.style.background = "#1a1d27"; }}
            style={{ width: "100%", height: "90px", background: "#1a1d27", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#5a5f7a", border: "1px dashed #2a2d3a", cursor: "pointer", transition: "all 0.2s" }}
          >
            <span style={{ fontSize: "10px", background: "#7c3aed22", color: "#a78bfa", padding: "2px 6px", borderRadius: "4px", marginBottom: "4px", fontWeight: "700" }}>AD</span>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#e8eaf2" }}>พื้นที่โฆษณา สนใจติดต่อ คลิ๊ก!!!</span>
          </div>
        </a>
      </div>

      <DetailModal game={detail} open={detail!==null} onClose={()=>setDetail(null)} onIncView={incView} />
    </div>
  );
}
