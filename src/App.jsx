import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import SaludMental from "./SaludMental";
import Laboral from "./Laboral";

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ email:"", password:"", nombre:"", apellido:"", especialidad:"Psiquiatra", matricula:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogin = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (error) { setError(error.message); setLoading(false); return; }
    const { data: prof } = await supabase.from("professionals").select("*").eq("id", data.user.id).single();
    onAuth(data.user, prof);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.nombre || !form.apellido || !form.matricula) { setError("Completá todos los campos."); return; }
    setLoading(true); setError(null);
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("professionals").insert({
        id: data.user.id, nombre: form.nombre, apellido: form.apellido,
        especialidad: form.especialidad, matricula: form.matricula, email: form.email
      });
      setSuccess("¡Registro exitoso! Revisá tu email para confirmar la cuenta, luego ingresá.");
      setMode("login");
    }
    setLoading(false);
  };

  const S = {
    input: { width:"100%", background:"#0a0f1e", border:"1px solid #334155", borderRadius:9, padding:"10px 14px", color:"#e2e8f0", fontSize:14, fontFamily:"inherit", boxSizing:"border-box", marginBottom:12 },
    btn: (c="#7c3aed") => ({ width:"100%", background:loading?"#1e293b":c, color:loading?"#475569":"#fff", border:"none", borderRadius:10, padding:"12px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", marginTop:4 }),
  };

  return (
    <div style={{ minHeight:"100vh", background:"#070c18", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:24 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}`}</style>

      <div style={{ width:"100%", maxWidth:420, animation:"fadeIn 0.4s ease" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <svg viewBox="0 0 260 60" width="200" style={{ display:"inline-block", marginBottom:8 }}>
            <line x1="28" y1="10" x2="44" y2="38" stroke="#AFA9EC" strokeWidth="1" opacity="0.6"/>
            <line x1="28" y1="10" x2="12" y2="38" stroke="#AFA9EC" strokeWidth="1" opacity="0.6"/>
            <line x1="12" y1="38" x2="44" y2="38" stroke="#AFA9EC" strokeWidth="1" opacity="0.6"/>
            <line x1="28" y1="10" x2="28" y2="26" stroke="#AFA9EC" strokeWidth="1" opacity="0.35"/>
            <line x1="12" y1="38" x2="28" y2="26" stroke="#AFA9EC" strokeWidth="1" opacity="0.35"/>
            <line x1="44" y1="38" x2="28" y2="26" stroke="#AFA9EC" strokeWidth="1" opacity="0.35"/>
            <circle cx="28" cy="26" r="4" fill="#AFA9EC" opacity="0.25"/>
            <circle cx="28" cy="26" r="2.5" fill="#7F77DD"/>
            <circle cx="28" cy="10" r="2.5" fill="#7F77DD"/>
            <circle cx="12" cy="38" r="2.5" fill="#7F77DD"/>
            <circle cx="44" cy="38" r="2.5" fill="#7F77DD"/>
            <circle cx="28" cy="24" r="16" fill="none" stroke="#7F77DD" strokeWidth="1.2" strokeDasharray="72 24" strokeDashoffset="-6" strokeLinecap="round"/>
            <text x="66" y="40" fontFamily="system-ui,sans-serif" fontSize="32" fontWeight="700" letterSpacing="-1" fill="#ffffff">COGN</text>
            <text x="178" y="40" fontFamily="system-ui,sans-serif" fontSize="32" fontWeight="700" letterSpacing="-1" fill="#AFA9EC">IA</text>
          </svg>
          <p style={{ color:"#475569", fontSize:11, letterSpacing:4, textTransform:"uppercase", margin:0 }}>Plataforma de evaluaciones clínicas</p>
        </div>

        {/* Card */}
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:20, padding:32 }}>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:28, borderBottom:"1px solid #1e293b", paddingBottom:0 }}>
            {[["login","Ingresar"],["register","Registrarse"]].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);setError(null);setSuccess(null);}} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${mode===m?"#7c3aed":"transparent"}`, color:mode===m?"#AFA9EC":"#475569", padding:"8px 20px", cursor:"pointer", fontSize:14, fontFamily:"inherit", fontWeight:mode===m?700:400, marginBottom:-1 }}>{l}</button>
            ))}
          </div>

          {error && <div style={{ background:"#ef444422", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", marginBottom:16 }}><p style={{ color:"#ef4444", fontSize:13, margin:0 }}>{error}</p></div>}
          {success && <div style={{ background:"#22c55e22", border:"1px solid #22c55e44", borderRadius:8, padding:"10px 14px", marginBottom:16 }}><p style={{ color:"#22c55e", fontSize:13, margin:0 }}>{success}</p></div>}

          {mode === "register" && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:0 }}>
                <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} style={{...S.input,marginBottom:0}}/>
                <input placeholder="Apellido" value={form.apellido} onChange={e=>setForm(p=>({...p,apellido:e.target.value}))} style={{...S.input,marginBottom:0}}/>
              </div>
              <div style={{ marginBottom:0 }}>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:"#475569", textTransform:"uppercase", margin:"12px 0 8px" }}>Especialidad</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                  {["Psiquiatra","Psicólogo/a","Médico/a","Médico/a Laboral","Neuropsicólogo/a"].map(t=>(
                    <button key={t} onClick={()=>setForm(p=>({...p,especialidad:t}))} style={{ background:form.especialidad===t?"#7c3aed33":"transparent", border:`1px solid ${form.especialidad===t?"#7c3aed":"#334155"}`, borderRadius:8, padding:"5px 12px", color:form.especialidad===t?"#AFA9EC":"#64748b", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>{t}</button>
                  ))}
                </div>
              </div>
              <input placeholder="Matrícula (ej: MP 12345)" value={form.matricula} onChange={e=>setForm(p=>({...p,matricula:e.target.value}))} style={S.input}/>
            </>
          )}

          <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={S.input}/>
          <input type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleRegister())}
            style={S.input}/>

          <button onClick={mode==="login"?handleLogin:handleRegister} disabled={loading} style={S.btn()}>
            {loading ? "Procesando..." : mode==="login" ? "Ingresar →" : "Crear cuenta →"}
          </button>
        </div>

        <p style={{ textAlign:"center", color:"#334155", fontSize:11, marginTop:20 }}>COGNIA · ITMED · Córdoba 844, Rosario</p>
      </div>
    </div>
  );
}

// ─── SPACE SELECTOR ───────────────────────────────────────────────────────────
function SpaceSelector({ professional, onSelect, onLogout }) {
  return (
    <div style={{ minHeight:"100vh", background:"#070c18", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:24 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ width:"100%", maxWidth:680, animation:"fadeIn 0.4s ease" }}>

        {/* Header with professional info */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
          <div style={{ textAlign:"left" }}>
            <svg viewBox="0 0 260 60" width="160" style={{ display:"inline-block", marginBottom:4 }}>
              <line x1="28" y1="10" x2="44" y2="38" stroke="#AFA9EC" strokeWidth="1" opacity="0.6"/>
              <line x1="28" y1="10" x2="12" y2="38" stroke="#AFA9EC" strokeWidth="1" opacity="0.6"/>
              <line x1="12" y1="38" x2="44" y2="38" stroke="#AFA9EC" strokeWidth="1" opacity="0.6"/>
              <line x1="28" y1="10" x2="28" y2="26" stroke="#AFA9EC" strokeWidth="1" opacity="0.35"/>
              <line x1="12" y1="38" x2="28" y2="26" stroke="#AFA9EC" strokeWidth="1" opacity="0.35"/>
              <line x1="44" y1="38" x2="28" y2="26" stroke="#AFA9EC" strokeWidth="1" opacity="0.35"/>
              <circle cx="28" cy="26" r="4" fill="#AFA9EC" opacity="0.25"/>
              <circle cx="28" cy="26" r="2.5" fill="#7F77DD"/>
              <circle cx="28" cy="10" r="2.5" fill="#7F77DD"/>
              <circle cx="12" cy="38" r="2.5" fill="#7F77DD"/>
              <circle cx="44" cy="38" r="2.5" fill="#7F77DD"/>
              <circle cx="28" cy="24" r="16" fill="none" stroke="#7F77DD" strokeWidth="1.2" strokeDasharray="72 24" strokeDashoffset="-6" strokeLinecap="round"/>
              <text x="66" y="40" fontFamily="system-ui,sans-serif" fontSize="32" fontWeight="700" letterSpacing="-1" fill="#ffffff">COGN</text>
              <text x="178" y="40" fontFamily="system-ui,sans-serif" fontSize="32" fontWeight="700" letterSpacing="-1" fill="#AFA9EC">IA</text>
            </svg>
          </div>
          <div style={{ textAlign:"right" }}>
            {professional && (
              <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:"10px 16px", marginBottom:0 }}>
                <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{professional.nombre} {professional.apellido}</p>
                <p style={{ margin:"0 0 6px", fontSize:11, color:"#7c3aed" }}>{professional.especialidad} · Mat. {professional.matricula}</p>
                <button onClick={onLogout} style={{ background:"transparent", border:"1px solid #334155", borderRadius:7, padding:"4px 12px", color:"#64748b", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>

        {/* Module cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <button onClick={()=>onSelect("salud_mental")} style={{ background:"#0f172a", border:"1px solid #7F77DD44", borderRadius:20, padding:32, cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#7F77DD";e.currentTarget.style.background="#1a1040";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#7F77DD44";e.currentTarget.style.background="#0f172a";}}>
            <div style={{ width:48, height:48, borderRadius:14, background:"#7F77DD22", border:"1px solid #7F77DD44", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18, fontSize:22 }}>🧠</div>
            <p style={{ color:"#f1f5f9", fontSize:18, fontWeight:700, margin:"0 0 6px", fontFamily:"'DM Serif Display'" }}>Salud Mental</p>
            <p style={{ color:"#64748b", fontSize:13, margin:"0 0 20px", lineHeight:1.5 }}>Evaluaciones clínicas, seguimiento e informes con IA</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
              {["PHQ-9","GAD-7","PCL-5","BDI-II","AUDIT","ISI","+ 14 más"].map(t=>(
                <span key={t} style={{ background:"#7F77DD22", color:"#AFA9EC", border:"1px solid #7F77DD33", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{t}</span>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, color:"#7F77DD", fontSize:13, fontWeight:600 }}>Ingresar →</div>
          </button>

          <button onClick={()=>onSelect("laboral")} style={{ background:"#0f172a", border:"1px solid #14B8A644", borderRadius:20, padding:32, cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#14B8A6";e.currentTarget.style.background="#041a18";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#14B8A644";e.currentTarget.style.background="#0f172a";}}>
            <div style={{ width:48, height:48, borderRadius:14, background:"#14B8A622", border:"1px solid #14B8A644", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18, fontSize:22 }}>🏭</div>
            <p style={{ color:"#f1f5f9", fontSize:18, fontWeight:700, margin:"0 0 6px", fontFamily:"'DM Serif Display'" }}>Medicina Laboral</p>
            <p style={{ color:"#64748b", fontSize:13, margin:"0 0 20px", lineHeight:1.5 }}>Aptitud psicofísica, fatiga, cognición y riesgo pre-turno</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
              {["Stroop","Trail Making","PVT","Burnout","Estrés","Fatiga","+ más"].map(t=>(
                <span key={t} style={{ background:"#14B8A622", color:"#5DCAA5", border:"1px solid #14B8A633", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{t}</span>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, color:"#14B8A6", fontSize:13, fontWeight:600 }}>Ingresar →</div>
          </button>
        </div>

        <div style={{ marginTop:24, background:"#0f172a", border:"1px solid #1e293b", borderRadius:14, padding:"16px 24px", display:"flex", justifyContent:"space-around", alignItems:"center" }}>
          {[{label:"Tests disponibles",value:"32+"},{label:"Módulos",value:"2"},{label:"Informes con IA",value:"✦"},{label:"Datos seguros",value:"🔒"}].map(s=>(
            <div key={s.label} style={{ textAlign:"center" }}>
              <p style={{ color:"#AFA9EC", fontWeight:700, fontSize:18, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ color:"#475569", fontSize:11, margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign:"center", color:"#334155", fontSize:11, marginTop:20 }}>COGNIA · ITMED · Córdoba 844, Rosario</p>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange as primary source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session) {
        const { data: prof } = await supabase.from("professionals").select("*").eq("id", session.user.id).single();
        if (mounted) setProfessional(prof);
      } else {
        setProfessional(null);
        setSpace(null);
      }
      if (mounted) setLoading(false);
    });

    // Timeout fallback — if no auth event in 4s, stop loading
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSpace(null);
    setProfessional(null);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#070c18", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #1e293b", borderTopColor:"#7c3aed", animation:"spin 1s linear infinite" }}/>
    </div>
  );

  if (!session) return <AuthScreen onAuth={(user, prof) => { setSession(user); setProfessional(prof); }} />;

  if (space === "salud_mental") return <SaludMental onBack={()=>setSpace(null)} professional={professional} supabase={supabase}/>;
  if (space === "laboral") return <Laboral onBack={()=>setSpace(null)} professional={professional} supabase={supabase}/>;

  return <SpaceSelector professional={professional} onSelect={setSpace} onLogout={handleLogout}/>;
}
