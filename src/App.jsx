import { useState } from "react";
import SaludMental from "./SaludMental";

export default function App() {
  const [space, setSpace] = useState(null);

  if (space === "salud_mental") return <SaludMental onBack={() => setSpace(null)} />;
  if (space === "laboral") return (
    <div style={{minHeight:"100vh",background:"#070c18",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:"center",color:"#64748b"}}>
        <p style={{fontSize:32,marginBottom:12}}>🏗</p>
        <p style={{fontSize:18,color:"#94a3b8",marginBottom:8}}>Módulo Laboral</p>
        <p style={{fontSize:14,marginBottom:24}}>En construcción — disponible próximamente</p>
        <button onClick={()=>setSpace(null)} style={{background:"transparent",border:"1px solid #334155",borderRadius:9,padding:"9px 22px",color:"#64748b",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>← Volver</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#070c18",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:24}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{width:"100%",maxWidth:680,animation:"fadeIn 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <svg viewBox="0 0 260 60" width="220" style={{display:"inline-block",marginBottom:8}}>
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
          <p style={{color:"#475569",fontSize:12,letterSpacing:4,textTransform:"uppercase",margin:0}}>Plataforma de evaluaciones clínicas</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <button onClick={()=>setSpace("salud_mental")} style={{background:"#0f172a",border:"1px solid #7F77DD44",borderRadius:20,padding:32,cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#7F77DD";e.currentTarget.style.background="#1a1040";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#7F77DD44";e.currentTarget.style.background="#0f172a";}}>
            <div style={{width:48,height:48,borderRadius:14,background:"#7F77DD22",border:"1px solid #7F77DD44",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18,fontSize:22}}>🧠</div>
            <p style={{color:"#f1f5f9",fontSize:18,fontWeight:700,margin:"0 0 6px",fontFamily:"'DM Serif Display'"}}>Salud Mental</p>
            <p style={{color:"#64748b",fontSize:13,margin:"0 0 20px",lineHeight:1.5}}>Evaluaciones clínicas, seguimiento de pacientes e informes con IA</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["PHQ-9","GAD-7","PCL-5","BDI-II","AUDIT","ISI","+ 14 más"].map(t=>(
                <span key={t} style={{background:"#7F77DD22",color:"#AFA9EC",border:"1px solid #7F77DD33",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600}}>{t}</span>
              ))}
            </div>
            <div style={{marginTop:20,display:"flex",alignItems:"center",gap:6,color:"#7F77DD",fontSize:13,fontWeight:600}}>Ingresar →</div>
          </button>
          <button onClick={()=>setSpace("laboral")} style={{background:"#0f172a",border:"1px solid #14B8A644",borderRadius:20,padding:32,cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#14B8A6";e.currentTarget.style.background="#041a18";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#14B8A644";e.currentTarget.style.background="#0f172a";}}>
            <div style={{width:48,height:48,borderRadius:14,background:"#14B8A622",border:"1px solid #14B8A644",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18,fontSize:22}}>🏭</div>
            <p style={{color:"#f1f5f9",fontSize:18,fontWeight:700,margin:"0 0 6px",fontFamily:"'DM Serif Display'"}}>Medicina Laboral</p>
            <p style={{color:"#64748b",fontSize:13,margin:"0 0 20px",lineHeight:1.5}}>Aptitud psicofísica, fatiga, cognición y riesgo laboral</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["Stroop","Trail Making","PVT","Burnout","Estrés","Fatiga","+ más"].map(t=>(
                <span key={t} style={{background:"#14B8A622",color:"#5DCAA5",border:"1px solid #14B8A633",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600}}>{t}</span>
              ))}
            </div>
            <div style={{marginTop:20,display:"flex",alignItems:"center",gap:6,color:"#14B8A6",fontSize:13,fontWeight:600}}>Próximamente <span style={{fontSize:11,color:"#475569"}}>— En construcción</span></div>
          </button>
        </div>
        <div style={{marginTop:24,background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"16px 24px",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
          {[{label:"Tests disponibles",value:"20+"},{label:"Categorías clínicas",value:"12"},{label:"Informes con IA",value:"✦"},{label:"Firma profesional",value:"✓"}].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <p style={{color:"#AFA9EC",fontWeight:700,fontSize:18,margin:"0 0 2px"}}>{s.value}</p>
              <p style={{color:"#475569",fontSize:11,margin:0}}>{s.label}</p>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",color:"#334155",fontSize:11,marginTop:20}}>COGNIA · ITMED · Córdoba 844, Rosario</p>
      </div>
    </div>
  );
}
