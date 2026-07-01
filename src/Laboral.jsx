import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TEAL = "#14B8A6";
const TEAL_DIM = "#14B8A622";
const TEAL_BORDER = "#14B8A644";

const APTITUD = {
  apto:        { label:"Apto",                  color:"#22c55e", emoji:"✅" },
  restriccion: { label:"Apto con restricciones", color:"#fbbf24", emoji:"⚠️" },
  no_apto:     { label:"No apto",               color:"#ef4444", emoji:"🚫" },
};

// ─── CUESTIONARIOS ───────────────────────────────────────────────────────────
const QUESTIONNAIRES = {
  isi_lab: {
    id:"isi_lab", name:"ISI", fullName:"Índice de Severidad del Insomnio",
    area:"Sueño", icon:"🌙", duration:"3 min",
    instructions:"Indique la gravedad de su problema de sueño en las últimas 2 semanas.",
    options:[{label:"Ninguno",value:0},{label:"Leve",value:1},{label:"Moderado",value:2},{label:"Severo",value:3},{label:"Muy severo",value:4}],
    questions:["Dificultad para conciliar el sueño","Dificultad para mantener el sueño","Despertarse demasiado temprano","Satisfacción con el sueño actual","Notoriedad del problema de sueño para los demás","Preocupación por el problema de sueño","Interferencia del sueño con el funcionamiento diario"],
    maxScore:28,
    aptitud:(t)=>t<=7?"apto":t<=14?"restriccion":"no_apto",
    score:(t)=>t<=7?{level:"Sin insomnio",color:"#22c55e"}:t<=14?{level:"Subumbral",color:"#86efac"}:t<=21?{level:"Moderado",color:"#fbbf24"}:{level:"Severo",color:"#ef4444"},
  },
  gad7_lab: {
    id:"gad7_lab", name:"GAD-7", fullName:"Escala de Ansiedad Generalizada",
    area:"Ansiedad", icon:"💭", duration:"3 min",
    instructions:"Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
    options:[{label:"Para nada",value:0},{label:"Varios días",value:1},{label:"Más de la mitad",value:2},{label:"Casi todos los días",value:3}],
    questions:["Sentirse nervioso/a o ansioso/a","No poder controlar la preocupación","Preocuparse demasiado por diferentes cosas","Dificultad para relajarse","Estar tan inquieto/a que es difícil permanecer sentado/a","Molestarse o irritarse fácilmente","Sentir miedo como si algo terrible fuera a ocurrir"],
    maxScore:21,
    aptitud:(t)=>t<=4?"apto":t<=9?"restriccion":"no_apto",
    score:(t)=>t<=4?{level:"Mínimo",color:"#22c55e"}:t<=9?{level:"Leve",color:"#86efac"}:t<=14?{level:"Moderado",color:"#fbbf24"}:{level:"Severo",color:"#ef4444"},
  },
  audit_lab: {
    id:"audit_lab", name:"AUDIT", fullName:"Test de Identificación de Trastornos por Uso de Alcohol",
    area:"Consumo", icon:"🍺", duration:"4 min",
    instructions:"Responda sobre su consumo de alcohol en el último año.",
    options:[{label:"Nunca",value:0},{label:"1 vez o menos al mes",value:1},{label:"2-4 veces al mes",value:2},{label:"2-3 veces a la semana",value:3},{label:"4+ veces a la semana",value:4}],
    questions:["¿Con qué frecuencia consume alcohol?","¿Cuántas bebidas en un día normal?","¿Con qué frecuencia toma 6 o más bebidas?","¿No pudo parar de beber una vez que empezó?","¿No pudo hacer lo esperado por haber bebido?","¿Necesitó beber en ayunas para recuperarse?","¿Tuvo remordimientos después de beber?","¿No recordó lo sucedido por haber bebido?","¿Alguien resultó herido por su consumo?","¿Algún profesional mostró preocupación por su consumo?"],
    maxScore:40,
    aptitud:(t)=>t<=7?"apto":t<=15?"restriccion":"no_apto",
    score:(t)=>t<=7?{level:"Bajo riesgo",color:"#22c55e"}:t<=15?{level:"Riesgo moderado",color:"#fbbf24"}:t<=19?{level:"Alto riesgo",color:"#f97316"}:{level:"Dependencia probable",color:"#ef4444"},
  },
  chalder: {
    id:"chalder", name:"Fatiga", fullName:"Escala de Fatiga de Chalder",
    area:"Fatiga", icon:"⚡", duration:"3 min",
    instructions:"Comparado con cuando se sentía bien, ¿en qué medida experimenta los siguientes síntomas actualmente?",
    options:[{label:"Menos de lo habitual",value:0},{label:"No más de lo habitual",value:0},{label:"Más de lo habitual",value:1},{label:"Mucho más de lo habitual",value:1}],
    questions:["¿Tiene problemas con el cansancio?","¿Necesita descansar más?","¿Se siente somnoliento/a o adormecido/a?","¿Tiene dificultad para comenzar cosas?","¿Se siente débil en los músculos?","¿Se siente poco animado/a?","¿Tiene dificultad para concentrarse?","¿Tiene problemas para pensar claramente?","¿Siente que pronuncia mal las palabras?","¿Tiene problemas para encontrar la palabra correcta?","¿Cómo es su memoria?"],
    maxScore:11,
    aptitud:(t)=>t<=3?"apto":t<=6?"restriccion":"no_apto",
    score:(t)=>t<=3?{level:"Sin fatiga",color:"#22c55e"}:t<=6?{level:"Fatiga leve",color:"#fbbf24"}:{level:"Fatiga significativa",color:"#ef4444"},
  },
  mbi: {
    id:"mbi", name:"MBI", fullName:"Inventario de Burnout de Maslach (breve)",
    area:"Burnout", icon:"🔥", duration:"4 min",
    instructions:"¿Con qué frecuencia experimenta cada una de las siguientes situaciones en su trabajo?",
    options:[{label:"Nunca",value:0},{label:"Raramente",value:1},{label:"Alguna vez",value:2},{label:"A menudo",value:3},{label:"Muy a menudo",value:4},{label:"Siempre",value:5}],
    questions:["Me siento emocionalmente agotado/a por mi trabajo","Me siento cansado/a al final de la jornada laboral","Me siento fatigado/a cuando me levanto para ir al trabajo","Trabajar todo el día es una tensión para mí","Me siento quemado/a por mi trabajo","Me siento frustrado/a en mi trabajo","Creo que trabajo demasiado","Trabajar directamente con personas me produce estrés","Me siento al límite de mis posibilidades"],
    maxScore:45,
    aptitud:(t)=>t<=15?"apto":t<=27?"restriccion":"no_apto",
    score:(t)=>t<=15?{level:"Sin burnout",color:"#22c55e"}:t<=27?{level:"Burnout moderado",color:"#fbbf24"}:{level:"Burnout severo",color:"#ef4444"},
  },
  jss: {
    id:"jss", name:"JSS", fullName:"Escala de Estrés Laboral de Job Stress Survey",
    area:"Estrés laboral", icon:"📊", duration:"4 min",
    instructions:"Indique en qué medida cada situación le resulta estresante en su trabajo actual.",
    options:[{label:"No es estresante",value:0},{label:"Poco estresante",value:1},{label:"Moderadamente estresante",value:2},{label:"Muy estresante",value:3},{label:"Extremadamente estresante",value:4}],
    questions:["Sobrecarga de trabajo o demasiadas tareas que realizar","Conflictos con supervisores o compañeros","Falta de reconocimiento por el trabajo realizado","Incertidumbre sobre el futuro del empleo","Condiciones físicas del ambiente de trabajo","Interrupciones frecuentes durante la jornada","Responsabilidades poco claras o contradictorias","Dificultad para equilibrar trabajo y vida personal","Presión por cumplir plazos o metas","Falta de autonomía para tomar decisiones"],
    maxScore:40,
    aptitud:(t)=>t<=13?"apto":t<=26?"restriccion":"no_apto",
    score:(t)=>t<=13?{level:"Bajo estrés",color:"#22c55e"}:t<=26?{level:"Estrés moderado",color:"#fbbf24"}:{level:"Estrés alto",color:"#ef4444"},
  },
  aptitud_psico: {
    id:"aptitud_psico", name:"Aptitud", fullName:"Evaluación de Aptitud Psicofísica Orientativa",
    area:"Aptitud general", icon:"🎯", duration:"5 min",
    instructions:"Responda con honestidad las siguientes preguntas sobre su estado actual.",
    options:[{label:"No",value:0},{label:"Sí",value:1}],
    questions:["¿Durmió menos de 5 horas la noche anterior?","¿Consume algún medicamento que produzca somnolencia?","¿Consumió alcohol en las últimas 12 horas?","¿Tiene dolor intenso que dificulta la concentración?","¿Se siente muy cansado/a o fatigado/a?","¿Tiene problemas de visión no corregidos hoy?","¿Está bajo tratamiento médico que altera el rendimiento?","¿Tuvo algún episodio de mareo o vértigo hoy?"],
    maxScore:8,
    aptitud:(t)=>t===0?"apto":t<=2?"restriccion":"no_apto",
    score:(t)=>t===0?{level:"Sin restricciones",color:"#22c55e"}:t<=2?{level:"Restricciones leves",color:"#fbbf24"}:{level:"No apto para turno",color:"#ef4444"},
  },
  nods: {
    id:"nods", name:"NODS", fullName:"Escala de Juego Patológico NORC DSM-IV",
    area:"Ludopatía", icon:"🎲", duration:"4 min",
    instructions:"Las siguientes preguntas se refieren a su comportamiento relacionado con el juego en los últimos 12 meses.",
    options:[{label:"No",value:0},{label:"Sí",value:1}],
    questions:["¿Ha necesitado apostar cantidades cada vez mayores de dinero?","¿Se ha puesto nervioso/a o irritable al intentar reducir el juego?","¿Ha intentado controlar o abandonar el juego sin éxito?","¿Ha pensado en el juego con frecuencia?","¿Ha apostado para escapar de problemas o sentimientos negativos?","¿Ha vuelto a jugar para recuperar dinero perdido?","¿Ha mentido para ocultar su nivel de participación en el juego?","¿Ha cometido actos ilegales para financiar el juego?","¿Ha puesto en riesgo relaciones o trabajo por el juego?","¿Ha dependido de otros para salir de situaciones económicas por el juego?"],
    maxScore:10,
    aptitud:(t)=>t===0?"apto":t<=2?"restriccion":"no_apto",
    score:(t)=>t===0?{level:"Sin indicadores",color:"#22c55e"}:t<=2?{level:"Riesgo bajo",color:"#fbbf24"}:t<=5?{level:"Riesgo moderado",color:"#f97316"}:{level:"Juego patológico probable",color:"#ef4444"},
  },

  // ─────────────────────────────────────────────────────────────────────────
  // IISL-40 · Índice de Integración Social Laboral
  // Instrumento psicosocial: 40 ítems · 10 dominios · Likert 1–5.
  // A diferencia de los demás, NO usa aptitud(total): tiene su propio scoring
  // (computeResult) que respeta ítems inversos y normaliza cada dominio a 0–100.
  // ─────────────────────────────────────────────────────────────────────────
  iisl40_lab: {
    id:"iisl40_lab", name:"IISL-40", fullName:"Índice de Integración Social Laboral",
    area:"Psicosocial", icon:"🧩", duration:"6 min",
    instructions:"Durante los últimos tres meses, indique con qué frecuencia cada afirmación describe su situación.",
    options:[
      {label:"Nunca",value:1},
      {label:"Rara vez",value:2},
      {label:"Algunas veces",value:3},
      {label:"Frecuentemente",value:4},
      {label:"Siempre",value:5},
    ],
    // 40 ítems en orden de dominio (no se muestra al trabajador cuáles son inversos)
    questions:[
      // D1 · Red de apoyo social
      "Tengo personas a quienes acudir cuando necesito ayuda.",
      "Mi familia me brinda apoyo emocional.",
      "Me siento acompañado en momentos difíciles.",
      "Dispongo de alguien que me aconseje cuando tengo problemas.",
      // D2 · Estabilidad familiar
      "Mi hogar constituye un ambiente tranquilo.",
      "Los conflictos familiares interfieren con mi trabajo.",
      "Mi convivencia diaria favorece mi bienestar.",
      "Las responsabilidades familiares son compatibles con mi actividad laboral.",
      // D3 · Bienestar económico
      "Mi situación económica me genera preocupación constante.",
      "Logro cubrir adecuadamente mis gastos.",
      "Mis deudas afectan mi concentración.",
      "Me siento económicamente estable.",
      // D4 · Calidad del sueño y recuperación
      "Duermo entre 7 y 8 horas la mayoría de los días.",
      "Me despierto descansado.",
      "El cansancio afecta mi desempeño laboral.",
      "Tengo horarios regulares para dormir.",
      // D5 · Hábitos saludables
      "Realizo actividad física regularmente.",
      "Mantengo una alimentación saludable.",
      "Realizo controles médicos periódicos.",
      "Respeto los tratamientos indicados cuando corresponde.",
      // D6 · Adaptación laboral
      "Me adapto fácilmente a nuevos procedimientos.",
      "Afronto adecuadamente los cambios.",
      "Me siento comprometido con mi trabajo.",
      "Considero que mi trabajo tiene sentido para mí.",
      // D7 · Relaciones interpersonales
      "Mantengo relaciones respetuosas con mis compañeros.",
      "Resuelvo conflictos mediante el diálogo.",
      "Recibo apoyo de mis superiores.",
      "Me siento integrado al equipo.",
      // D8 · Conductas de seguridad
      "Cumplo siempre las normas de seguridad.",
      "Evito conductas riesgosas.",
      "Pienso antes de actuar.",
      "Informo oportunamente situaciones inseguras.",
      // D9 · Consumo y autocontrol
      "El alcohol afecta mis responsabilidades.",
      "He consumido sustancias antes de trabajar.",
      "Mantengo control sobre mis impulsos.",
      "Puedo manejar adecuadamente situaciones de estrés.",
      // D10 · Integración social
      "Participo en actividades recreativas.",
      "Mantengo vínculos sociales fuera del trabajo.",
      "Me siento parte de mi comunidad.",
      "Considero que llevo una vida social satisfactoria.",
    ],
    // Dominio de cada ítem (mismo orden que questions)
    domainOf:[0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3,3, 4,4,4,4, 5,5,5,5, 6,6,6,6, 7,7,7,7, 8,8,8,8, 9,9,9,9],
    // Ítems inversos (mismo orden que questions): true = se puntúa al revés (6 - valor)
    inverse:[
      false,false,false,false,   // D1
      false,true, false,false,   // D2 (conflictos familiares)
      true, false,true, false,   // D3 (preocupación económica · deudas)
      false,false,true, false,   // D4 (cansancio afecta desempeño)
      false,false,false,false,   // D5
      false,false,false,false,   // D6
      false,false,false,false,   // D7
      false,false,false,false,   // D8
      true, true, false,false,   // D9 (alcohol · sustancias)
      false,false,false,false,   // D10
    ],
    domains:[
      {name:"Red de apoyo social",              short:"Apoyo",       icon:"🤝"},
      {name:"Estabilidad familiar",             short:"Familia",     icon:"🏠"},
      {name:"Bienestar económico",              short:"Economía",    icon:"💰"},
      {name:"Calidad del sueño y recuperación", short:"Sueño",       icon:"🌙"},
      {name:"Hábitos saludables",               short:"Hábitos",     icon:"🥗"},
      {name:"Adaptación laboral",               short:"Adaptación",  icon:"🔄"},
      {name:"Relaciones interpersonales",       short:"Relaciones",  icon:"👥"},
      {name:"Conductas de seguridad",           short:"Seguridad",   icon:"🦺"},
      {name:"Consumo y autocontrol",            short:"Autocontrol", icon:"🧠"},
      {name:"Integración social",               short:"Social",      icon:"🌐"},
    ],
    maxScore:100, // el índice global va de 0 a 100
    describe:(r)=> (r&&r.global!=null) ? `Índice global IISL: ${r.global}/100 — ${r.band}` : "—",
    // Scoring propio del IISL-40 (lo llama WorkerTestSession si existe computeResult)
    computeResult:function(answers){
      const q=this;
      const sums=Array(10).fill(0);
      q.domainOf.forEach((di,i)=>{
        const raw=answers[i]||0;
        const val=q.inverse[i] ? (6-raw) : raw;   // ítem inverso -> se da vuelta
        sums[di]+=val;
      });
      // 4 ítems por dominio: suma 4–20 -> 0–100
      const domainScores=sums.map(s=>Math.round(((s-4)/16)*100));
      const global=Math.round(domainScores.reduce((a,b)=>a+b,0)/10);
      const band =
        global>=90 ? "Excelente integración social laboral" :
        global>=80 ? "Integración muy adecuada" :
        global>=70 ? "Integración adecuada" :
        global>=60 ? "Riesgo leve" :
        global>=50 ? "Riesgo moderado" :
        global>=40 ? "Riesgo alto" :
                     "Riesgo muy alto";
      const protective=q.domains.filter((d,i)=>domainScores[i]>=80).map(d=>d.name);
      const risk      =q.domains.filter((d,i)=>domainScores[i]<60 ).map(d=>d.name);

      // ── MAPEO A APTITUD — DECISIÓN CLÍNICA (editable) ──────────────────────
      // Un índice psicosocial de screening no declara "No apto" por sí solo:
      // como máximo sugiere "con restricciones" (seguimiento). Cambiá el criterio
      // acá si querés otro umbral o escalar a "no_apto" en roles críticos.
      let aptitud = global>=70 ? "apto" : "restriccion";
      // Ejemplo opcional de escalado en dominios sensibles (descomentar para usar):
      // const iAuto=8, iSeg=7; // índices de "Consumo y autocontrol" y "Conductas de seguridad"
      // if(domainScores[iAuto]<40 || domainScores[iSeg]<40) aptitud="restriccion";

      return { total:global, global, band, domainScores, protective, risk, aptitud, answers };
    },
  },
};

// ─── COGNITIVE TESTS ─────────────────────────────────────────────────────────
function ReactionTimeTest({onComplete}){
  const [phase,setPhase]=useState("intro");
  const [trials,setTrials]=useState([]);
  const [currentTrial,setCurrentTrial]=useState(0);
  const [startTime,setStartTime]=useState(null);
  const [bgColor,setBgColor]=useState("#0f172a");
  const timerRef=useRef(null);
  const TOTAL_TRIALS=8;

  const startTrial=useCallback(()=>{
    setBgColor("#0f172a");setPhase("waiting");
    const delay=1500+Math.random()*2500;
    timerRef.current=setTimeout(()=>{setBgColor("#22c55e");setStartTime(Date.now());setPhase("ready");},delay);
  },[]);

  const handleClick=()=>{
    if(phase==="waiting"){
      clearTimeout(timerRef.current);
      setTrials(t=>[...t,{rt:null,error:"early"}]);
      setCurrentTrial(t=>t+1);
      if(currentTrial+1>=TOTAL_TRIALS) finalize([...trials,{rt:null,error:"early"}]);
      else setTimeout(startTrial,1000);
      return;
    }
    if(phase==="ready"){
      const rt=Date.now()-startTime;
      const newTrials=[...trials,{rt,error:null}];
      setTrials(newTrials);setBgColor("#0f172a");setCurrentTrial(t=>t+1);
      if(currentTrial+1>=TOTAL_TRIALS) finalize(newTrials);
      else{setPhase("waiting");setTimeout(startTrial,800);}
    }
  };

  const finalize=(allTrials)=>{
    const valid=allTrials.filter(t=>t.rt&&t.rt>100&&t.rt<1500);
    const avg=valid.length>0?Math.round(valid.reduce((s,t)=>s+t.rt,0)/valid.length):999;
    const errors=allTrials.filter(t=>t.error).length;
    setPhase("results");
    const aptitud=avg<=250&&errors<=1?"apto":avg<=350&&errors<=2?"restriccion":"no_apto";
    onComplete({avg,errors,valid:valid.length,total:TOTAL_TRIALS,aptitud,raw:allTrials});
  };

  useEffect(()=>()=>clearTimeout(timerRef.current),[]);

  if(phase==="intro") return(
    <div style={{textAlign:"center",padding:32}}>
      <p style={{fontSize:32,marginBottom:16}}>⚡</p>
      <h3 style={{color:"#f1f5f9",marginBottom:12}}>Test de Tiempo de Reacción</h3>
      <p style={{color:"#64748b",fontSize:14,marginBottom:8,lineHeight:1.6}}>Cuando la pantalla se ponga <strong style={{color:"#22c55e"}}>VERDE</strong>, tocá lo antes posible.</p>
      <p style={{color:"#f97316",fontSize:13,marginBottom:24}}>⚠ Si tocás antes de que cambie el color, se cuenta como error.</p>
      <button onClick={()=>{setPhase("waiting");startTrial();}} style={{background:TEAL,color:"#fff",border:"none",borderRadius:10,padding:"12px 32px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Comenzar</button>
    </div>
  );
  if(phase==="results") return null;
  return(
    <div onClick={handleClick} style={{background:bgColor,borderRadius:16,padding:48,textAlign:"center",cursor:"pointer",transition:"background 0.1s",minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",userSelect:"none"}}>
      <p style={{color:"#94a3b8",fontSize:13,marginBottom:12}}>Intento {currentTrial+1} de {TOTAL_TRIALS}</p>
      {phase==="waiting"&&<p style={{color:"#475569",fontSize:18,fontWeight:600}}>Esperá...</p>}
      {phase==="ready"&&<p style={{color:"#fff",fontSize:24,fontWeight:700}}>¡AHORA!</p>}
    </div>
  );
}

function PVTTest({onComplete}){
  const [phase,setPhase]=useState("intro");
  const [counter,setCounter]=useState(null);
  const [reactions,setReactions]=useState([]);
  const [lapses,setLapses]=useState(0);
  const [timeLeft,setTimeLeft]=useState(120);
  const [startTime,setStartTime]=useState(null);
  const [showing,setShowing]=useState(false);
  const timerRef=useRef(null);
  const countRef=useRef(null);
  const trialRef=useRef(null);

  const runTrial=useCallback(()=>{
    const delay=2000+Math.random()*8000;
    trialRef.current=setTimeout(()=>{
      const t0=Date.now();setStartTime(t0);setShowing(true);setCounter(0);
      countRef.current=setInterval(()=>setCounter(c=>c!==null?c+1:0),1);
      timerRef.current=setTimeout(()=>{
        setShowing(false);setCounter(null);clearInterval(countRef.current);
        setLapses(l=>l+1);setReactions(r=>[...r,{rt:500,lapse:true}]);runTrial();
      },500);
    },delay);
  },[]);

  const handleTap=()=>{
    if(!showing) return;
    const rt=Date.now()-startTime;
    clearTimeout(timerRef.current);clearInterval(countRef.current);
    setShowing(false);setCounter(null);setReactions(r=>[...r,{rt,lapse:false}]);runTrial();
  };

  useEffect(()=>{
    if(phase!=="running") return;
    const countdown=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(countdown);clearTimeout(trialRef.current);clearTimeout(timerRef.current);clearInterval(countRef.current);setPhase("done");return 0;}
        return t-1;
      });
    },1000);
    runTrial();
    return()=>{clearInterval(countdown);clearTimeout(trialRef.current);clearTimeout(timerRef.current);clearInterval(countRef.current);};
  },[phase,runTrial]);

  useEffect(()=>{
    if(phase==="done"){
      const valid=reactions.filter(r=>!r.lapse&&r.rt>100);
      const avg=valid.length>0?Math.round(valid.reduce((s,r)=>s+r.rt,0)/valid.length):999;
      const aptitud=avg<=300&&lapses<=2?"apto":avg<=400&&lapses<=4?"restriccion":"no_apto";
      onComplete({avg,lapses,valid:valid.length,total:reactions.length,aptitud});
    }
  },[phase]);

  if(phase==="intro") return(
    <div style={{textAlign:"center",padding:32}}>
      <p style={{fontSize:32,marginBottom:16}}>👁</p>
      <h3 style={{color:"#f1f5f9",marginBottom:12}}>Test de Vigilancia Psicomotora (PVT)</h3>
      <p style={{color:"#64748b",fontSize:14,marginBottom:8,lineHeight:1.6}}>Cuando aparezca el contador, tocá la pantalla lo más rápido posible.</p>
      <p style={{color:"#64748b",fontSize:13,marginBottom:24}}>Duración: 2 minutos.</p>
      <button onClick={()=>setPhase("running")} style={{background:TEAL,color:"#fff",border:"none",borderRadius:10,padding:"12px 32px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Comenzar</button>
    </div>
  );
  if(phase==="done") return null;
  return(
    <div onClick={handleTap} style={{background:"#0f172a",borderRadius:16,padding:32,textAlign:"center",cursor:"pointer",minHeight:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",userSelect:"none"}}>
      <div style={{display:"flex",justifyContent:"space-between",width:"100%",marginBottom:24}}>
        <span style={{color:"#475569",fontSize:12}}>Tiempo: {timeLeft}s</span>
        <span style={{color:"#f97316",fontSize:12}}>Lapsos: {lapses}</span>
        <span style={{color:"#64748b",fontSize:12}}>Resp.: {reactions.filter(r=>!r.lapse).length}</span>
      </div>
      {showing?(<div style={{background:"#ef4444",borderRadius:12,padding:"20px 40px",minWidth:120}}><p style={{color:"#fff",fontSize:36,fontWeight:700,margin:0,fontFamily:"monospace"}}>{counter}</p></div>):(<p style={{color:"#334155",fontSize:16}}>Esperá el contador...</p>)}
    </div>
  );
}

function StroopTest({onComplete}){
  const COLORS={ROJO:"#ef4444",VERDE:"#22c55e",AZUL:"#3b82f6",AMARILLO:"#fbbf24"};
  const WORDS=["ROJO","VERDE","AZUL","AMARILLO"];
  const TRIALS=16;
  const [phase,setPhase]=useState("intro");
  const [trial,setTrial]=useState(0);
  const [word,setWord]=useState("");
  const [color,setColor]=useState("");
  const [results,setResults]=useState([]);
  const [startTime,setStartTime]=useState(null);
  const [feedback,setFeedback]=useState(null);

  const nextTrial=useCallback((res=[])=>{
    if(res.length>=TRIALS){
      const correct=res.filter(r=>r.correct).length;
      const avgRt=Math.round(res.filter(r=>r.correct).reduce((s,r)=>s+r.rt,0)/Math.max(res.filter(r=>r.correct).length,1));
      const errors=res.filter(r=>!r.correct).length;
      const aptitud=correct>=12&&avgRt<=1200?"apto":correct>=9&&avgRt<=1600?"restriccion":"no_apto";
      onComplete({correct,errors,avgRt,total:TRIALS,aptitud});return;
    }
    const w=WORDS[Math.floor(Math.random()*WORDS.length)];
    const inkOptions=WORDS.filter(x=>x!==w);
    const ink=inkOptions[Math.floor(Math.random()*inkOptions.length)];
    setWord(w);setColor(ink);setStartTime(Date.now());setFeedback(null);setTrial(res.length);
  },[]);

  const handleAnswer=(chosen)=>{
    const rt=Date.now()-startTime;const correct=chosen===color;
    setFeedback(correct?"correct":"wrong");
    const newRes=[...results,{correct,rt,word,color,chosen}];setResults(newRes);
    setTimeout(()=>nextTrial(newRes),400);
  };

  if(phase==="intro") return(
    <div style={{textAlign:"center",padding:32}}>
      <p style={{fontSize:32,marginBottom:16}}>🎨</p>
      <h3 style={{color:"#f1f5f9",marginBottom:12}}>Test de Stroop</h3>
      <p style={{color:"#f1f5f9",fontSize:14,marginBottom:4}}>Tocá el <strong>COLOR DE LA TINTA</strong>, no lo que dice la palabra.</p>
      <div style={{margin:"20px auto",padding:16,background:"#0f172a",borderRadius:12,display:"inline-block"}}>
        <p style={{fontSize:28,fontWeight:700,color:"#3b82f6",margin:0}}>ROJO</p>
        <p style={{color:"#64748b",fontSize:12,marginTop:4}}>Respuesta correcta: AZUL</p>
      </div>
      <div style={{marginBottom:24}}/>
      <button onClick={()=>{setPhase("running");nextTrial([]);}} style={{background:TEAL,color:"#fff",border:"none",borderRadius:10,padding:"12px 32px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Comenzar</button>
    </div>
  );
  if(phase==="running") return(
    <div style={{textAlign:"center"}}>
      <p style={{color:"#64748b",fontSize:12,marginBottom:20}}>{trial+1} / {TRIALS}</p>
      <div style={{background:feedback==="correct"?"#22c55e11":feedback==="wrong"?"#ef444411":"#0f172a",borderRadius:16,padding:"32px 24px",marginBottom:24,minHeight:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p style={{fontSize:44,fontWeight:900,color:COLORS[color],margin:0,letterSpacing:2}}>{word}</p>
      </div>
      <p style={{color:"#64748b",fontSize:13,marginBottom:16}}>¿De qué color es la tinta?</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {WORDS.map(w=>(<button key={w} onClick={()=>handleAnswer(w)} style={{background:COLORS[w]+"22",border:`2px solid ${COLORS[w]}55`,borderRadius:12,padding:"14px",color:COLORS[w],fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>{w}</button>))}
      </div>
    </div>
  );
  return null;
}

function TrailMakingTest({onComplete}){
  const N=10;
  const [phase,setPhase]=useState("intro");
  const [next,setNext]=useState(1);
  const [startTime,setStartTime]=useState(null);
  const [errors,setErrors]=useState(0);
  const [positions]=useState(()=>{
    const pos=[];
    for(let i=0;i<N;i++){
      let x,y,ok=false,attempts=0;
      while(!ok&&attempts<100){x=10+Math.random()*78;y=10+Math.random()*78;ok=pos.every(p=>Math.hypot(p.x-x,p.y-y)>14);attempts++;}
      pos.push({x,y,n:i+1});
    }
    return pos;
  });

  const handleClick=(n)=>{
    if(n===next){
      if(next===1) setStartTime(Date.now());
      if(next===N){const time=Math.round((Date.now()-startTime)/1000);const aptitud=time<=45&&errors<=2?"apto":time<=75&&errors<=4?"restriccion":"no_apto";onComplete({time,errors,aptitud});setPhase("done");}
      else setNext(n+1);
    } else setErrors(e=>e+1);
  };

  if(phase==="intro") return(
    <div style={{textAlign:"center",padding:32}}>
      <p style={{fontSize:32,marginBottom:16}}>🔢</p>
      <h3 style={{color:"#f1f5f9",marginBottom:12}}>Trail Making Test — Parte A</h3>
      <p style={{color:"#64748b",fontSize:14,marginBottom:8,lineHeight:1.6}}>Tocá los números del <strong style={{color:TEAL}}>1 al {N}</strong> en orden, lo más rápido posible.</p>
      <button onClick={()=>setPhase("running")} style={{background:TEAL,color:"#fff",border:"none",borderRadius:10,padding:"12px 32px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Comenzar</button>
    </div>
  );
  if(phase==="done") return null;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
        <p style={{color:"#64748b",fontSize:13,margin:0}}>Siguiente: <strong style={{color:TEAL}}>{next}</strong></p>
        <p style={{color:"#f97316",fontSize:13,margin:0}}>Errores: {errors}</p>
      </div>
      <div style={{position:"relative",background:"#0f172a",borderRadius:16,paddingBottom:"80%",overflow:"hidden"}}>
        {positions.map(p=>{const done=p.n<next;const isNext=p.n===next;return(
          <button key={p.n} onClick={()=>handleClick(p.n)} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:36,height:36,borderRadius:"50%",background:done?"#1e293b":isNext?TEAL+"44":"#1e293b",border:`2px solid ${done?"#334155":isNext?TEAL:"#475569"}`,color:done?"#334155":isNext?"#fff":"#94a3b8",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transform:"translate(-50%,-50%)",fontFamily:"inherit"}}>{p.n}</button>
        );})}
      </div>
    </div>
  );
}

const COG_TESTS = {
  reaction_time:{ id:"reaction_time",name:"Tiempo de Reacción",area:"Cognición",icon:"⚡",duration:"90 seg",Component:ReactionTimeTest,
    describe:(r)=>r?`Tiempo medio: ${r.avg}ms | Errores: ${r.errors}`:"—",aptitudLabel:(r)=>r?APTITUD[r.aptitud]:null },
  pvt:{ id:"pvt",name:"PVT",area:"Vigilancia",icon:"👁",duration:"2 min",Component:PVTTest,
    describe:(r)=>r?`TR medio: ${r.avg}ms | Lapsos: ${r.lapses}`:"—",aptitudLabel:(r)=>r?APTITUD[r.aptitud]:null },
  stroop:{ id:"stroop",name:"Stroop",area:"Control inhibitorio",icon:"🎨",duration:"3 min",Component:StroopTest,
    describe:(r)=>r?`Correctas: ${r.correct}/${r.total} | TR medio: ${r.avgRt}ms`:"—",aptitudLabel:(r)=>r?APTITUD[r.aptitud]:null },
  trail_making:{ id:"trail_making",name:"Trail Making A",area:"Atención",icon:"🔢",duration:"2 min",Component:TrailMakingTest,
    describe:(r)=>r?`Tiempo: ${r.time}s | Errores: ${r.errors}`:"—",aptitudLabel:(r)=>r?APTITUD[r.aptitud]:null },
};

// ─── PDF EXPORT ──────────────────────────────────────────────────────────────
let jsPDFLib=null;
async function loadJsPDF(){
  if(jsPDFLib) return jsPDFLib;
  return new Promise(resolve=>{
    if(window.jspdf){jsPDFLib=window.jspdf.jsPDF;resolve(jsPDFLib);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload=()=>{jsPDFLib=window.jspdf.jsPDF;resolve(jsPDFLib);};
    document.head.appendChild(s);
  });
}

async function exportWorkerPDF(worker,evaluation,reportText,finalAptitud,profName){
  const JsPDF=await loadJsPDF();
  const doc=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,margin=20,col=W-margin*2;let y=20;
  doc.setFillColor(4,26,24);doc.rect(0,0,W,28,"F");
  doc.setFontSize(20);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
  doc.text("COGN",margin,18);const cw=doc.getTextWidth("COGN");
  doc.setTextColor(175,169,236);doc.text("IA",margin+cw,18);
  doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(20,184,166);
  doc.text("MEDICINA LABORAL",margin+cw+doc.getTextWidth("IA")+4,18);
  doc.text(new Date().toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"}),W-margin,18,{align:"right"});
  y=36;
  const apt=APTITUD[finalAptitud];
  const aptColors={"apto":[34,197,94],"restriccion":[251,191,36],"no_apto":[239,68,68]};
  doc.setFillColor(...aptColors[finalAptitud]);doc.roundedRect(margin,y,col,14,2,2,"F");
  doc.setFontSize(12);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
  doc.text(`RESULTADO: ${apt.label.toUpperCase()}`,margin+4,y+9);y+=20;
  doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(100,116,139);
  doc.text("INFORME DE APTITUD PSICOFÍSICA LABORAL",margin,y);y+=5;
  doc.setDrawColor(71,85,105);doc.setLineWidth(0.3);doc.line(margin,y,W-margin,y);y+=5;
  [["Trabajador",worker.name],["DNI",worker.dni],["Empresa",worker.empresa],["Puesto",worker.puesto],["Turno",worker.turno],["Legajo",worker.legajo],["Fecha evaluación",evaluation.date],profName?["Profesional",profName]:null].filter(Boolean).forEach(([l,v])=>{
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(71,85,105);doc.text(l+":",margin,y);
    doc.setFont("helvetica","normal");doc.setTextColor(30,30,30);doc.text(v||"—",margin+36,y);y+=6;
  });
  y+=2;doc.setDrawColor(220,220,220);doc.line(margin,y,W-margin,y);y+=5;
  doc.setFontSize(10);doc.setFont("helvetica","bold");doc.setTextColor(30,30,30);doc.text("RESULTADOS POR TEST",margin,y);y+=6;
  const allTestDefs={...QUESTIONNAIRES,...Object.fromEntries(Object.entries(COG_TESTS).map(([k,v])=>([k,{...v,maxScore:null}])))};
  Object.entries(evaluation.tests).forEach(([testId,result])=>{
    const td=allTestDefs[testId];if(!td) return;
    const apt=APTITUD[result.aptitud];const aptC=aptColors[result.aptitud]||[148,163,184];
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(30,30,30);
    doc.text(`${td.name}: ${td.describe?td.describe(result):(result.total!==undefined?`${result.total}/${td.maxScore}`:"")}`,margin,y);
    doc.setFont("helvetica","bold");doc.setTextColor(...aptC);doc.text(apt?.label||"—",W-margin,y,{align:"right"});y+=6;
  });
  y+=2;doc.setDrawColor(220,220,220);doc.line(margin,y,W-margin,y);y+=5;
  if(reportText){
    doc.setFontSize(10);doc.setFont("helvetica","bold");doc.setTextColor(30,30,30);doc.text("INFORME CLÍNICO LABORAL",margin,y);y+=6;
    reportText.replace(/\*\*/g,"").split("\n").filter(l=>l.trim()).forEach(line=>{
      if(y>265){doc.addPage();y=20;}
      const isH=/^\d+\./.test(line.trim());
      doc.setFontSize(isH?10:9.5);doc.setFont("helvetica",isH?"bold":"normal");doc.setTextColor(isH?30:60,isH?30:60,isH?30:60);
      const w=doc.splitTextToSize(line,col);doc.text(w,margin,y);y+=w.length*(isH?5:4.5)+(isH?1:0);
    });
    y+=4;doc.setDrawColor(220,220,220);doc.line(margin,y,W-margin,y);y+=4;
  }
  if(profName){
    if(y>250){doc.addPage();y=20;}
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(34,197,94);doc.text("FIRMADO DIGITALMENTE",margin,y);y+=5;
    doc.setFont("helvetica","normal");doc.setTextColor(71,85,105);
    doc.text(`Profesional: ${profName}`,margin,y);y+=5;
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`,margin,y);y+=5;
    doc.text("Sistema COGNIA Laboral — ITMED",margin,y);
  }
  const tp=doc.internal.getNumberOfPages();
  for(let i=1;i<=tp;i++){
    doc.setPage(i);doc.setFillColor(4,26,24);doc.rect(0,287,W,10,"F");
    doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(20,184,166);
    doc.text("COGNIA Laboral · Medicina del Trabajo · Uso exclusivo del médico laboral",margin,293);
    doc.text(`Pág. ${i}/${tp}`,W-margin,293,{align:"right"});
  }
  doc.save(`COGNIA_Laboral_${worker.name.replace(/\s+/g,"_")}_${evaluation.date}.pdf`);
}

async function generateLaboralReport(worker,evaluation,finalAptitud){
  const allTestDefs={...QUESTIONNAIRES,...Object.fromEntries(Object.entries(COG_TESTS).map(([k,v])=>([k,{...v}])))};
  const testsDesc=Object.entries(evaluation.tests).map(([id,r])=>{
    const td=allTestDefs[id];if(!td) return "";
    const desc=td.describe?td.describe(r):(r.total!==undefined?`Puntaje: ${r.total}/${td.maxScore}`:JSON.stringify(r));
    return `${td.fullName||td.name}: ${desc} — ${APTITUD[r.aptitud]?.label||"—"}`;
  }).join("\n");

  // ── NUEVO: detalle psicosocial IISL-40, solo si ese test se incluyó ──
  let iislBlock="";
  const iisl=evaluation.tests["iisl40_lab"];
  if(iisl&&iisl.domainScores&&QUESTIONNAIRES.iisl40_lab){
    const doms=QUESTIONNAIRES.iisl40_lab.domains;
    const detalle=doms.map((d,i)=>`- ${d.name}: ${iisl.domainScores[i]}/100`).join("\n");
    iislBlock=`\n\nPERFIL PSICOSOCIAL (IISL-40) — Índice global ${iisl.global}/100 (${iisl.band}):\n${detalle}\nFactores protectores (≥80): ${iisl.protective.join(", ")||"ninguno destacado"}\nFactores de riesgo (<60): ${iisl.risk.join(", ")||"ninguno destacado"}\n\nIncluí además una sección titulada "Perfil psicosocial (IISL-40)" con: síntesis por dominios, factores protectores, factores de riesgo y recomendaciones preventivas personalizadas. No compares con una población de referencia (el instrumento aún no tiene baremo poblacional). No diagnostiques.`;
  }

  const prompt=`Eres médico especialista en medicina laboral. Generá un informe de aptitud psicofísica profesional en español.\n\nTrabajador: ${worker.name}\nDNI: ${worker.dni}\nEmpresa: ${worker.empresa}\nPuesto: ${worker.puesto}\nTurno: ${worker.turno}\nFecha: ${evaluation.date}\nResultado final: ${APTITUD[finalAptitud]?.label}\n\nTests realizados:\n${testsDesc}${iislBlock}\n\nEl informe debe incluir:\n1. Conclusión de aptitud (1-2 oraciones)\n2. Hallazgos relevantes por área evaluada\n3. Restricciones operativas si corresponde\n4. Recomendaciones específicas para el puesto\n5. Próxima evaluación sugerida\n\nTono médico-laboral formal. Aclará que es orientativo y requiere validación profesional. Máximo 400 palabras.`;
  const r=await fetch("https://cognia-ai.ramidiazlopez.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
  const data=await r.json();
  return data.content?.[0]?.text||"No se pudo generar el informe.";
}

// ─── WORKER TEST SESSION ─────────────────────────────────────────────────────
function WorkerTestSession({worker,selectedTests,onComplete}){
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [currentAnswers,setCurrentAnswers]=useState([]);
  const allTests=[...selectedTests];
  const current=allTests[step];
  const isQuestionnaire=current&&QUESTIONNAIRES[current];
  const isCognitive=current&&COG_TESTS[current];

  const handleQuestionnaireComplete=()=>{
    const td=QUESTIONNAIRES[current];
    let result;
    if(td.computeResult){
      // Tests con scoring propio (ej. IISL-40: dominios, ítems inversos, índice 0–100)
      result=td.computeResult(currentAnswers);
    } else {
      // Scoring estándar: suma simple -> aptitud(total)
      const total=currentAnswers.reduce((s,a)=>s+(a??0),0);
      result={total,aptitud:td.aptitud(total),answers:currentAnswers};
    }
    const newAnswers={...answers,[current]:result};
    setAnswers(newAnswers);setCurrentAnswers([]);
    if(step+1>=allTests.length) onComplete(newAnswers);
    else setStep(s=>s+1);
  };

  const handleCognitiveComplete=(result)=>{
    const newAnswers={...answers,[current]:result};
    setAnswers(newAnswers);
    if(step+1>=allTests.length) onComplete(newAnswers);
    else setStep(s=>s+1);
  };

  if(!current) return null;
  return(
    <div style={{maxWidth:560,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{color:"#64748b",fontSize:12}}>Test {step+1} de {allTests.length}</span>
          <span style={{color:TEAL,fontSize:12}}>{Math.round(((step)/allTests.length)*100)}%</span>
        </div>
        <div style={{background:"#1e293b",borderRadius:99,height:4}}>
          <div style={{width:`${(step/allTests.length)*100}%`,height:"100%",background:TEAL,borderRadius:99,transition:"width 0.4s"}}/>
        </div>
      </div>
      {isQuestionnaire&&(()=>{
        const td=QUESTIONNAIRES[current];
        const allAnswered=currentAnswers.length===td.questions.length&&currentAnswers.every(a=>a!==null&&a!==undefined);
        return(
          <div>
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <span style={{fontSize:20}}>{td.icon}</span>
                <div><p style={{color:"#f1f5f9",fontWeight:700,fontSize:15,margin:0}}>{td.fullName}</p><p style={{color:TEAL,fontSize:12,margin:0}}>{td.area} · {td.duration}</p></div>
              </div>
              <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.6,margin:0}}>{td.instructions}</p>
            </div>
            {td.questions.map((q,qi)=>(
              <div key={qi} style={{background:"#0f172a",border:`1px solid ${currentAnswers[qi]!==undefined?TEAL+"55":"#1e293b"}`,borderRadius:14,padding:16,marginBottom:10}}>
                <p style={{color:"#e2e8f0",fontSize:14,margin:"0 0 12px",lineHeight:1.5}}><span style={{color:TEAL,fontWeight:700,marginRight:8}}>{qi+1}.</span>{q}</p>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {td.options.map((opt,oi)=>(
                    <button key={oi} onClick={()=>{const n=[...currentAnswers];n[qi]=opt.value;setCurrentAnswers(n);}} style={{background:currentAnswers[qi]===opt.value?TEAL+"33":"transparent",border:`1px solid ${currentAnswers[qi]===opt.value?TEAL:"#334155"}`,borderRadius:9,padding:"9px 14px",color:currentAnswers[qi]===opt.value?"#f1f5f9":"#94a3b8",cursor:"pointer",textAlign:"left",fontSize:13,fontFamily:"inherit"}}>{opt.label}</button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{textAlign:"center",marginTop:16}}>
              <button onClick={handleQuestionnaireComplete} disabled={!allAnswered} style={{background:allAnswered?TEAL:"#1e293b",color:allAnswered?"#fff":"#475569",border:"none",borderRadius:11,padding:"13px 36px",fontSize:15,fontWeight:600,cursor:allAnswered?"pointer":"not-allowed",fontFamily:"inherit"}}>
                {step+1<allTests.length?"Siguiente test →":"Finalizar evaluación"}
              </button>
            </div>
          </div>
        );
      })()}
      {isCognitive&&(()=>{
        const td=COG_TESTS[current];
        return(
          <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <span style={{fontSize:20}}>{td.icon}</span>
              <div><p style={{color:"#f1f5f9",fontWeight:700,fontSize:15,margin:0}}>{td.name}</p><p style={{color:TEAL,fontSize:12,margin:0}}>{td.area} · {td.duration}</p></div>
            </div>
            <td.Component onComplete={handleCognitiveComplete}/>
          </div>
        );
      })()}
    </div>
  );
}

// ─── MAIN MODULE ──────────────────────────────────────────────────────────────
export default function Laboral({onBack, professional, supabase}){
  const [workers,setWorkers]=useState([]);
  const [dbLoading,setDbLoading]=useState(true);

  // ── NUEVO: estado para profesionales ──
  const [allProfessionals,setAllProfessionals]=useState([]);
  const [showProfesionalesModal,setShowProfesionalesModal]=useState(false);
  const [newProfForm,setNewProfForm]=useState({nombre:"",apellido:"",especialidad:"Médico/a Laboral",matricula:"",email:"",password:""});
  const [profFormLoading,setProfFormLoading]=useState(false);
  const [profFormMsg,setProfFormMsg]=useState(null);
  // ── NUEVO: estado para confirmar eliminación ──
  const [confirmDelete,setConfirmDelete]=useState(null);

  useEffect(()=>{
    if(!supabase||!professional){setDbLoading(false);return;}
    let mounted=true;
    const load=async()=>{
      setDbLoading(true);
      try{
        const {data:ws}=await supabase.from("workers").select("*").eq("professional_id",professional.id).order("created_at",{ascending:false});
        if(!mounted) return;
        if(ws&&ws.length>0){
          const wsWithEvals=await Promise.all(ws.map(async w=>{
            const {data:evals}=await supabase.from("labor_evaluations").select("*").eq("worker_id",w.id).order("date",{ascending:false});
            return {...w,evaluations:(evals||[]).map(e=>({...e,tests:e.tests||{}}))};
          }));
          if(mounted) setWorkers(wsWithEvals);
        }
        // Cargar todos los profesionales
        const {data:profs}=await supabase.from("professionals").select("id,nombre,apellido,especialidad,matricula,email").order("created_at",{ascending:true});
        if(mounted&&profs) setAllProfessionals(profs);
      } catch(err){console.error("Load error:",err);}
      if(mounted) setDbLoading(false);
    };
    load();
    return ()=>{mounted=false;};
  },[professional]);

  const [view,setView]=useState("dashboard");
  const [selectedWorkerId,setSelectedWorkerId]=useState(null);
  const [showNewWorker,setShowNewWorker]=useState(false);
  const [newForm,setNewForm]=useState({name:"",dni:"",empresa:"",puesto:"",turno:"",legajo:"",whatsapp:""});
  const [showAssign,setShowAssign]=useState(null);
  const [selectedTests,setSelectedTests]=useState([]);
  const [simulatingSession,setSimulatingSession]=useState(null);
  const [report,setReport]=useState(null);
  const [pdfLoading,setPdfLoading]=useState(false);
  const [profProfile,setProfProfile]=useState({tipo:professional?.especialidad||"Médico/a Laboral",nombre:professional?(professional.nombre+" "+professional.apellido):"",matricula:professional?.matricula||""});
  const profName=profProfile.nombre?`${profProfile.tipo} ${profProfile.nombre}${profProfile.matricula?" — Mat. "+profProfile.matricula:""}` : "";
  const [showProfModal,setShowProfModal]=useState(false);
  const [reportStatus,setReportStatus]=useState({});

  const currentWorker=selectedWorkerId?workers.find(w=>w.id===selectedWorkerId):null;
  const allTestDefs={...QUESTIONNAIRES,...Object.fromEntries(Object.entries(COG_TESTS).map(([k,v])=>([k,{...v,maxScore:null}])))};
  const allEvals=workers.flatMap(w=>w.evaluations.map(e=>({...e,worker:w})));
  const aptCounts={apto:0,restriccion:0,no_apto:0};
  allEvals.forEach(e=>{const a=calcFinalAptitud(e.tests);aptCounts[a]++;});

  function calcFinalAptitud(tests){
    const results=Object.values(tests);
    if(results.some(r=>r.aptitud==="no_apto")) return "no_apto";
    if(results.some(r=>r.aptitud==="restriccion")) return "restriccion";
    return "apto";
  }

  const handleSessionComplete=async(workerId,tests,results)=>{
    const today=new Date().toISOString().slice(0,10);
    const final=calcFinalAptitud(results);
    let newEval={id:"ev"+Date.now(),date:today,tests:results};
    if(supabase&&professional){
      const {data}=await supabase.from("labor_evaluations").insert({
        worker_id:workerId,professional_id:professional.id,date:today,tests:results,final_aptitud:final
      }).select().single();
      if(data) newEval={...data,tests:data.tests||results};
    }
    setWorkers(prev=>prev.map(w=>w.id===workerId?{...w,evaluations:[newEval,...w.evaluations]}:w));
    setSimulatingSession(null);setView("worker");
  };

  const handleGenerateReport=async(worker,ev)=>{
    const final=calcFinalAptitud(ev.tests);
    setReport({loading:true,text:null,ev,worker,finalAptitud:final});
    setReportStatus(s=>({...s,[ev.id]:s[ev.id]||"generado"}));
    try{const text=await generateLaboralReport(worker,ev,final);setReport(r=>({...r,loading:false,text}));}
    catch{setReport(r=>({...r,loading:false,text:"Error al generar el informe."}));}
  };

  const handleAddWorker=async()=>{
    if(!newForm.name) return;
    if(supabase&&professional){
      const {data}=await supabase.from("workers").insert({professional_id:professional.id,...newForm}).select().single();
      if(data) setWorkers(prev=>[{...data,evaluations:[]},...prev]);
    } else {
      setWorkers(prev=>[...prev,{id:"w"+Date.now(),...newForm,evaluations:[]}]);
    }
    setNewForm({name:"",dni:"",empresa:"",puesto:"",turno:"",legajo:"",whatsapp:""});
    setShowNewWorker(false);
  };

  // ── NUEVO: eliminar trabajador ──
  const handleDeleteWorker=async(workerId)=>{
    if(supabase){
      await supabase.from("labor_evaluations").delete().eq("worker_id",workerId);
      await supabase.from("workers").delete().eq("id",workerId);
    }
    setWorkers(prev=>prev.filter(w=>w.id!==workerId));
    if(selectedWorkerId===workerId){setSelectedWorkerId(null);setView("dashboard");}
    setConfirmDelete(null);
  };

  // ── NUEVO: agregar profesional ──
  const handleAddProfessional=async()=>{
    if(!newProfForm.nombre||!newProfForm.apellido||!newProfForm.email||!newProfForm.password){
      setProfFormMsg({type:"error",text:"Completá nombre, apellido, email y contraseña."});return;
    }
    setProfFormLoading(true);setProfFormMsg(null);
    try{
      const {data,error}=await supabase.auth.signUp({email:newProfForm.email,password:newProfForm.password});
      if(error){setProfFormMsg({type:"error",text:error.message});setProfFormLoading(false);return;}
      const userId=data?.user?.id;
      if(userId){
        const {data:profData}=await supabase.from("professionals").insert({
          id:userId,nombre:newProfForm.nombre,apellido:newProfForm.apellido,
          especialidad:newProfForm.especialidad,matricula:newProfForm.matricula,email:newProfForm.email
        }).select().single();
        if(profData) setAllProfessionals(prev=>[...prev,profData]);
      }
      setProfFormMsg({type:"success",text:`Profesional ${newProfForm.nombre} ${newProfForm.apellido} creado. Debe confirmar su email.`});
      setNewProfForm({nombre:"",apellido:"",especialidad:"Médico/a Laboral",matricula:"",email:"",password:""});
    }catch(e){setProfFormMsg({type:"error",text:"Error al crear profesional."});}
    setProfFormLoading(false);
  };

  if(simulatingSession) return(
    <div style={{minHeight:"100vh",background:"#070c18",padding:"32px 16px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <p style={{color:TEAL,fontSize:11,letterSpacing:3,textTransform:"uppercase",margin:"0 0 4px"}}>COGNIA Laboral</p>
          <h2 style={{color:"#f1f5f9",margin:"0 0 4px",fontSize:20}}>Evaluación Pre-Turno</h2>
          <p style={{color:"#64748b",fontSize:13,margin:0}}>{simulatingSession.worker.name} · {simulatingSession.worker.empresa}</p>
        </div>
        <WorkerTestSession worker={simulatingSession.worker} selectedTests={simulatingSession.tests} onComplete={(r)=>handleSessionComplete(simulatingSession.worker.id,simulatingSession.tests,r)}/>
      </div>
    </div>
  );

  const S={
    app:{minHeight:"100vh",background:"#070c18",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",display:"flex"},
    sidebar:{width:230,background:"#041a18",borderRight:`1px solid ${TEAL_BORDER}`,display:"flex",flexDirection:"column",padding:"20px 14px",position:"fixed",top:0,left:0,height:"100vh",zIndex:10,overflowY:"auto"},
    main:{marginLeft:230,padding:"28px 36px",minHeight:"100vh",flex:1,maxWidth:"calc(100vw - 230px)"},
    card:{background:"#0d1f1e",border:`1px solid ${TEAL_BORDER}`,borderRadius:16,padding:22},
    btn:(c=TEAL)=>({background:c,color:"#fff",border:"none",borderRadius:9,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}),
    ghost:{background:"transparent",color:"#5DCAA5",border:`1px solid ${TEAL_BORDER}`,borderRadius:9,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"},
    input:{width:"100%",background:"#041a18",border:`1px solid ${TEAL_BORDER}`,borderRadius:9,padding:"9px 12px",color:"#e2e8f0",fontSize:13,fontFamily:"inherit",boxSizing:"border-box"},
    label:{fontSize:10,fontWeight:700,letterSpacing:2,color:"#14B8A680",textTransform:"uppercase"},
    danger:{background:"transparent",color:"#ef4444",border:"1px solid #ef444455",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"},
  };

  return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}`}</style>

      {/* ── MODAL CONFIRMAR ELIMINACIÓN ── */}
      {confirmDelete&&(
        <div style={{position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div style={{...S.card,maxWidth:380,width:"90%",animation:"fadeIn 0.2s ease",border:"1px solid #ef444444"}}>
            <h3 style={{color:"#ef4444",margin:"0 0 8px",fontFamily:"'DM Serif Display'"}}>Eliminar trabajador</h3>
            <p style={{color:"#94a3b8",fontSize:14,marginBottom:6}}>¿Estás seguro que querés eliminar a <strong style={{color:"#e2e8f0"}}>{confirmDelete.name}</strong>?</p>
            <p style={{color:"#64748b",fontSize:12,marginBottom:20}}>Se eliminarán también todas sus evaluaciones. Esta acción no se puede deshacer.</p>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>setConfirmDelete(null)}>Cancelar</button>
              <button style={{...S.btn("#ef4444"),flex:1}} onClick={()=>handleDeleteWorker(confirmDelete.id)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL GESTIÓN DE PROFESIONALES ── */}
      {showProfesionalesModal&&(
        <div style={{position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}>
          <div style={{...S.card,maxWidth:560,width:"100%",maxHeight:"90vh",overflow:"auto",animation:"fadeIn 0.2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{color:"#f1f5f9",margin:0,fontFamily:"'DM Serif Display'",fontSize:22}}>Gestión de profesionales</h3>
              <button style={{...S.ghost,padding:"4px 10px"}} onClick={()=>{setShowProfesionalesModal(false);setProfFormMsg(null);}}>✕</button>
            </div>
            <div style={{marginBottom:24}}>
              <p style={{...S.label,marginBottom:10}}>Profesionales registrados ({allProfessionals.length})</p>
              {allProfessionals.length===0?(
                <p style={{color:"#475569",fontSize:13}}>Ningún profesional registrado aún.</p>
              ):(
                allProfessionals.map(p=>(
                  <div key={p.id} style={{background:"#041a18",border:`1px solid ${TEAL_BORDER}`,borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <p style={{margin:"0 0 2px",fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{p.nombre} {p.apellido}</p>
                      <p style={{margin:0,fontSize:11,color:TEAL}}>{p.especialidad}{p.matricula?" · Mat. "+p.matricula:""}</p>
                      <p style={{margin:0,fontSize:11,color:"#475569"}}>{p.email}</p>
                    </div>
                    {p.id===professional?.id&&(
                      <span style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>Vos</span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div style={{borderTop:`1px solid ${TEAL_BORDER}`,paddingTop:20}}>
              <p style={{...S.label,marginBottom:14}}>Agregar nuevo profesional</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><p style={{...S.label,marginBottom:5}}>Nombre</p><input value={newProfForm.nombre} onChange={e=>setNewProfForm(p=>({...p,nombre:e.target.value}))} placeholder="María" style={S.input}/></div>
                <div><p style={{...S.label,marginBottom:5}}>Apellido</p><input value={newProfForm.apellido} onChange={e=>setNewProfForm(p=>({...p,apellido:e.target.value}))} placeholder="García" style={S.input}/></div>
              </div>
              <div style={{marginBottom:10}}>
                <p style={{...S.label,marginBottom:5}}>Especialidad</p>
                <select value={newProfForm.especialidad} onChange={e=>setNewProfForm(p=>({...p,especialidad:e.target.value}))} style={{...S.input}}>
                  {["Médico/a Laboral","Médico/a","Psiquiatra","Psicólogo/a","Otro"].map(e=><option key={e}>{e}</option>)}
                </select>
              </div>
              <div style={{marginBottom:10}}><p style={{...S.label,marginBottom:5}}>Matrícula (opcional)</p><input value={newProfForm.matricula} onChange={e=>setNewProfForm(p=>({...p,matricula:e.target.value}))} placeholder="MP 12345" style={S.input}/></div>
              <div style={{marginBottom:10}}><p style={{...S.label,marginBottom:5}}>Email (usuario de acceso)</p><input type="email" value={newProfForm.email} onChange={e=>setNewProfForm(p=>({...p,email:e.target.value}))} placeholder="colega@hospital.com" style={S.input}/></div>
              <div style={{marginBottom:16}}>
                <p style={{...S.label,marginBottom:5}}>Contraseña inicial</p>
                <input type="password" value={newProfForm.password} onChange={e=>setNewProfForm(p=>({...p,password:e.target.value}))} placeholder="Mínimo 6 caracteres" style={S.input}/>
                <p style={{fontSize:11,color:"#475569",marginTop:4}}>El profesional recibirá un email de confirmación.</p>
              </div>
              {profFormMsg&&(
                <div style={{background:profFormMsg.type==="error"?"#1a0a0a":"#0a1a0a",border:`1px solid ${profFormMsg.type==="error"?"#7f1d1d":"#166534"}`,borderRadius:8,padding:"10px 14px",marginBottom:14}}>
                  <p style={{margin:0,fontSize:13,color:profFormMsg.type==="error"?"#fca5a5":"#86efac"}}>{profFormMsg.text}</p>
                </div>
              )}
              <button onClick={handleAddProfessional} disabled={profFormLoading} style={{...S.btn(),width:"100%",opacity:profFormLoading?0.6:1}}>
                {profFormLoading?"Creando cuenta...":"+ Agregar profesional"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {report&&(
        <div style={{position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{...S.card,maxWidth:600,width:"100%",maxHeight:"90vh",overflow:"auto",animation:"fadeIn 0.2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:14}}>
              <div><h3 style={{color:"#f1f5f9",margin:"0 0 2px",fontFamily:"'DM Serif Display'",fontSize:20}}>Informe Laboral</h3><p style={{color:"#64748b",fontSize:11,margin:0}}>Generado con IA · COGNIA Laboral</p></div>
              <button style={{...S.ghost,padding:"4px 10px"}} onClick={()=>setReport(null)}>✕</button>
            </div>
            {report.finalAptitud&&(
              <div style={{background:APTITUD[report.finalAptitud].color+"22",border:`1px solid ${APTITUD[report.finalAptitud].color}44`,borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:24}}>{APTITUD[report.finalAptitud].emoji}</span>
                <div><p style={{margin:0,fontSize:15,fontWeight:700,color:APTITUD[report.finalAptitud].color}}>{APTITUD[report.finalAptitud].label}</p><p style={{margin:0,fontSize:12,color:"#94a3b8"}}>{report.worker?.name} · {report.ev?.date}</p></div>
              </div>
            )}
            {report.loading?(
              <div style={{textAlign:"center",padding:40}}>
                <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #1e293b",borderTopColor:TEAL,margin:"0 auto 14px",animation:"spin 1s linear infinite"}}/>
                <p style={{color:"#64748b",fontSize:13}}>Generando informe con IA…</p>
              </div>
            ):(
              <>
                <div style={{background:"#041a18",borderRadius:11,padding:18,border:`1px solid ${TEAL_BORDER}`,fontSize:13,lineHeight:1.9,color:"#cbd5e1",whiteSpace:"pre-wrap",marginBottom:14}}>{report.text}</div>
                <div style={{borderTop:`1px solid ${TEAL_BORDER}`,paddingTop:14}}>
                  <p style={{...S.label,margin:"0 0 10px"}}>Estado del informe</p>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                    {[{id:"generado",label:"Generado",color:"#64748b"},{id:"revisado",label:"Revisado",color:"#3b82f6"},{id:"firmado",label:"Firmado",color:"#22c55e"},{id:"archivado",label:"Archivado",color:"#475569"}].map(s=>{
                      const active=(reportStatus[report.ev?.id]||"generado")===s.id;
                      return(<button key={s.id} onClick={()=>setReportStatus(prev=>({...prev,[report.ev.id]:s.id}))} style={{background:active?s.color+"33":"transparent",border:`1px solid ${active?s.color:"#334155"}`,borderRadius:8,padding:"6px 14px",color:active?s.color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:active?700:400}}>{s.label}</button>);
                    })}
                  </div>
                  <div style={{marginBottom:12,background:"#041a18",borderRadius:9,padding:"10px 14px",border:`1px solid ${TEAL_BORDER}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div>
                      <p style={{...S.label,margin:"0 0 3px"}}>Profesional firmante</p>
                      {profName?<p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{profName}</p>:<p style={{margin:0,fontSize:13,color:"#475569",fontStyle:"italic"}}>Sin profesional cargado</p>}
                    </div>
                    <button onClick={()=>setShowProfModal(true)} style={{...S.ghost,flexShrink:0,fontSize:11}}>Editar</button>
                  </div>
                  <button disabled={pdfLoading||!report.text} onClick={async()=>{setPdfLoading(true);try{await exportWorkerPDF(report.worker,report.ev,report.text,report.finalAptitud,profName);}finally{setPdfLoading(false);}}} style={{width:"100%",background:pdfLoading?"#1e293b":TEAL,color:pdfLoading?"#475569":"#fff",border:"none",borderRadius:10,padding:"12px",fontSize:14,fontWeight:700,cursor:pdfLoading?"not-allowed":"pointer",fontFamily:"inherit"}}>
                    {pdfLoading?"Generando PDF…":"⬇ Descargar informe PDF"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssign&&(
        <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...S.card,maxWidth:480,width:"90%",maxHeight:"80vh",overflow:"auto",animation:"fadeIn 0.2s ease"}}>
            <h3 style={{color:"#f1f5f9",margin:"0 0 4px",fontFamily:"'DM Serif Display'"}}>Asignar evaluación</h3>
            <p style={{color:"#64748b",fontSize:13,marginBottom:18}}>Seleccioná los tests para <strong style={{color:"#94a3b8"}}>{showAssign.name}</strong></p>
            {["Cuestionarios","Cognitivos"].map(group=>{
              const ids=group==="Cuestionarios"?Object.keys(QUESTIONNAIRES):Object.keys(COG_TESTS);
              return(
                <div key={group} style={{marginBottom:16}}>
                  <p style={{...S.label,marginBottom:8}}>{group}</p>
                  {ids.map(id=>{
                    const td=allTestDefs[id];const checked=selectedTests.includes(id);
                    return(
                      <button key={id} onClick={()=>setSelectedTests(t=>t.includes(id)?t.filter(x=>x!==id):[...t,id])} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:checked?TEAL+"22":"transparent",border:`1px solid ${checked?TEAL:TEAL_BORDER}`,borderRadius:9,padding:"9px 12px",marginBottom:6,cursor:"pointer",fontFamily:"inherit"}}>
                        <span style={{fontSize:16}}>{td.icon||"📋"}</span>
                        <div style={{textAlign:"left"}}>
                          <p style={{margin:0,fontSize:13,color:checked?"#f1f5f9":"#94a3b8",fontWeight:checked?600:400}}>{td.name}</p>
                          <p style={{margin:0,fontSize:11,color:"#475569"}}>{td.area} · {td.duration}</p>
                        </div>
                        <span style={{marginLeft:"auto",color:checked?TEAL:"#334155",fontSize:16}}>{checked?"✓":"○"}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            <div style={{borderTop:`1px solid ${TEAL_BORDER}`,paddingTop:14,display:"flex",gap:8}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>{setShowAssign(null);setSelectedTests([]);}}>Cancelar</button>
              <button style={{...S.btn(),flex:1,opacity:selectedTests.length===0?0.5:1}} disabled={selectedTests.length===0} onClick={()=>{setShowAssign(null);setSimulatingSession({worker:showAssign,tests:selectedTests});setSelectedTests([]);}}>
                🧪 Iniciar ({selectedTests.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW WORKER MODAL */}
      {showNewWorker&&(
        <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...S.card,maxWidth:420,width:"90%",maxHeight:"85vh",overflow:"auto",animation:"fadeIn 0.2s ease"}}>
            <h3 style={{color:"#f1f5f9",margin:"0 0 18px",fontFamily:"'DM Serif Display'"}}>Nuevo trabajador</h3>
            {[["name","Nombre completo","text"],["dni","DNI","text"],["empresa","Empresa","text"],["puesto","Puesto / Cargo","text"],["turno","Turno","text"],["legajo","Nro. de legajo","text"],["whatsapp","WhatsApp","tel"]].map(([f,l,t])=>(
              <div key={f} style={{marginBottom:11}}>
                <p style={{...S.label,marginBottom:5}}>{l}</p>
                <input type={t} value={newForm[f]} onChange={e=>setNewForm(p=>({...p,[f]:e.target.value}))} style={S.input}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>setShowNewWorker(false)}>Cancelar</button>
              <button style={{...S.btn(),flex:1}} onClick={handleAddWorker}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL PROFILE MODAL */}
      {showProfModal&&(
        <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div style={{...S.card,maxWidth:400,width:"90%",animation:"fadeIn 0.2s ease"}}>
            <h3 style={{color:"#f1f5f9",margin:"0 0 4px",fontFamily:"'DM Serif Display'"}}>Perfil del profesional</h3>
            <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>Estos datos aparecerán en todos los informes firmados.</p>
            <div style={{marginBottom:12}}>
              <p style={{...S.label,marginBottom:6}}>Especialidad</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["Médico/a Laboral","Médico/a","Psiquiatra","Psicólogo/a","Otro"].map(t=>(
                  <button key={t} onClick={()=>setProfProfile(p=>({...p,tipo:t}))} style={{background:profProfile.tipo===t?TEAL+"33":"transparent",border:`1px solid ${profProfile.tipo===t?TEAL:TEAL_BORDER}`,borderRadius:8,padding:"6px 12px",color:profProfile.tipo===t?"#5DCAA5":"#64748b",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <p style={{...S.label,marginBottom:6}}>Nombre y apellido</p>
              <input placeholder="Ej: Juan Rodríguez" value={profProfile.nombre} onChange={e=>setProfProfile(p=>({...p,nombre:e.target.value}))} style={S.input}/>
            </div>
            <div style={{marginBottom:20}}>
              <p style={{...S.label,marginBottom:6}}>Matrícula</p>
              <input placeholder="Ej: MP 12345" value={profProfile.matricula} onChange={e=>setProfProfile(p=>({...p,matricula:e.target.value}))} style={S.input}/>
            </div>
            {profProfile.nombre&&(
              <div style={{background:"#041a18",borderRadius:9,padding:"10px 14px",border:`1px solid ${TEAL_BORDER}`,marginBottom:16}}>
                <p style={{...S.label,margin:"0 0 4px"}}>Vista previa</p>
                <p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{profProfile.tipo} {profProfile.nombre}{profProfile.matricula?" — Mat. "+profProfile.matricula:""}</p>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>setShowProfModal(false)}>Cancelar</button>
              <button style={{...S.btn(),flex:1}} onClick={()=>setShowProfModal(false)}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {dbLoading&&<div style={{position:"fixed",inset:0,background:"#070c18cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500}}><div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #1e293b",borderTopColor:"#14B8A6",animation:"spin 1s linear infinite"}}/></div>}

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={{marginBottom:24}}>
          <button onClick={onBack} style={{background:"transparent",border:"none",color:"#14B8A680",cursor:"pointer",fontSize:11,fontFamily:"inherit",padding:"0 0 10px",display:"flex",alignItems:"center",gap:4}}>← Inicio</button>
          <svg viewBox="0 0 200 54" width="170" style={{display:"block",marginBottom:4}}>
            <line x1="22" y1="8" x2="36" y2="32" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.6"/>
            <line x1="22" y1="8" x2="8" y2="32" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.6"/>
            <line x1="8" y1="32" x2="36" y2="32" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.6"/>
            <line x1="22" y1="8" x2="22" y2="22" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.35"/>
            <line x1="8" y1="32" x2="22" y2="22" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.35"/>
            <line x1="36" y1="32" x2="22" y2="22" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.35"/>
            <circle cx="22" cy="22" r="3.5" fill="#AFA9EC" opacity="0.25"/>
            <circle cx="22" cy="22" r="2" fill="#7F77DD"/>
            <circle cx="22" cy="8" r="2" fill="#7F77DD"/>
            <circle cx="8" cy="32" r="2" fill="#7F77DD"/>
            <circle cx="36" cy="32" r="2" fill="#7F77DD"/>
            <circle cx="22" cy="20" r="13" fill="none" stroke="#7F77DD" strokeWidth="1" strokeDasharray="60 20" strokeDashoffset="-5" strokeLinecap="round"/>
            <text x="50" y="34" fontFamily="system-ui,sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5" fill="#ffffff">COGN</text>
            <text x="146" y="34" fontFamily="system-ui,sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5" fill="#AFA9EC">IA</text>
          </svg>
          <p style={{fontSize:10,fontWeight:600,letterSpacing:3,color:"#14B8A680",textTransform:"uppercase",margin:0}}>medicina laboral</p>
        </div>

        {[{id:"dashboard",label:"Panel",icon:"◈"},{id:"tests",label:"Tests disponibles",icon:"◎"},{id:"stats",label:"Estadísticas",icon:"◉"}].map(item=>(
          <button key={item.id} onClick={()=>setView(item.id)} style={{background:view===item.id?"#0d2e2b":"transparent",border:"none",borderRadius:9,padding:"9px 12px",color:view===item.id?"#5DCAA5":"#4B8A7A",cursor:"pointer",textAlign:"left",fontSize:13,fontFamily:"inherit",display:"flex",gap:9,alignItems:"center",marginBottom:3,width:"100%"}}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}

        {/* ── NUEVO: botón profesionales ── */}
        <button onClick={()=>setShowProfesionalesModal(true)} style={{background:"transparent",border:"none",borderRadius:9,padding:"9px 12px",color:"#4B8A7A",cursor:"pointer",textAlign:"left",fontSize:13,fontFamily:"inherit",display:"flex",gap:9,alignItems:"center",marginBottom:3,width:"100%"}}>
          <span>👥</span>Profesionales
        </button>

        <div style={{margin:"18px 0 8px"}}><p style={{...S.label,paddingLeft:12,marginBottom:7}}>Trabajadores</p></div>

        {workers.map(w=>(
          <div key={w.id} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
            <button onClick={()=>{setSelectedWorkerId(w.id);setView("worker");}} style={{background:(view==="worker"&&selectedWorkerId===w.id)?"#0d2e2b":"transparent",border:"none",borderRadius:9,padding:"7px 8px",color:(view==="worker"&&selectedWorkerId===w.id)?"#5DCAA5":"#4B8A7A",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"inherit",flex:1,display:"flex",alignItems:"center",gap:8,minWidth:0}}>
              <span style={{width:22,height:22,borderRadius:"50%",background:"#0d2e2b",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:TEAL,flexShrink:0}}>{w.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</span>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.name}</span>
            </button>
            {/* ── NUEVO: botón eliminar ── */}
            <button onClick={()=>setConfirmDelete(w)} title="Eliminar trabajador" style={{background:"transparent",border:"none",color:"#334155",cursor:"pointer",padding:"4px 6px",fontSize:13,borderRadius:6,flexShrink:0}}
              onMouseEnter={e=>e.target.style.color="#ef4444"}
              onMouseLeave={e=>e.target.style.color="#334155"}>
              ✕
            </button>
          </div>
        ))}

        <button onClick={()=>setShowNewWorker(true)} style={{background:"transparent",border:`1px dashed ${TEAL_BORDER}`,borderRadius:9,padding:"7px 12px",color:"#14B8A680",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"inherit",marginTop:6,width:"100%"}}>+ Nuevo trabajador</button>

        <div style={{marginTop:"auto",paddingTop:20,borderTop:`1px solid ${TEAL_BORDER}`}}>
          <button onClick={()=>setShowProfModal(true)} style={{width:"100%",background:"transparent",border:`1px solid ${TEAL_BORDER}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:TEAL_DIM,border:`1px solid ${TEAL_BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>👤</div>
            <div style={{overflow:"hidden"}}>
              {profProfile.nombre?<><p style={{margin:0,fontSize:11,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profProfile.nombre}</p><p style={{margin:0,fontSize:10,color:TEAL}}>{profProfile.tipo}</p></>:<p style={{margin:0,fontSize:11,color:"#475569"}}>Cargar perfil profesional</p>}
            </div>
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {view==="dashboard"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>Medicina Laboral</h1>
            <p style={{color:"#4B8A7A",fontSize:13,marginBottom:28}}>Evaluaciones de aptitud psicofísica pre-turno</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
              {[{label:"Trabajadores",value:workers.length,color:TEAL},{label:"Evaluaciones",value:allEvals.length,color:"#AFA9EC"},{label:"Aptos",value:aptCounts.apto,color:"#22c55e"},{label:"No aptos",value:aptCounts.no_apto,color:"#ef4444"}].map(st=>(
                <div key={st.label} style={S.card}><p style={{...S.label,marginBottom:8}}>{st.label}</p><p style={{fontSize:34,fontFamily:"'DM Serif Display'",color:st.color,margin:0}}>{st.value}</p></div>
              ))}
            </div>
            <h2 style={{color:"#4B8A7A",fontSize:14,fontWeight:600,marginBottom:14}}>Últimas evaluaciones</h2>
            <div style={S.card}>
              {allEvals.length===0&&<p style={{color:"#475569",fontSize:14,textAlign:"center",padding:24}}>Sin evaluaciones todavía.</p>}
              {allEvals.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(e=>{
                const final=calcFinalAptitud(e.tests);const apt=APTITUD[final];
                return(
                  <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${TEAL_BORDER}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:18}}>{apt.emoji}</span>
                      <div><p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{e.worker.name}</p><p style={{margin:0,fontSize:11,color:"#475569"}}>{e.worker.empresa} · {e.date}</p></div>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:apt.color}}>{apt.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view==="tests"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>Tests disponibles</h1>
            <p style={{color:"#4B8A7A",fontSize:13,marginBottom:24}}>{Object.keys(QUESTIONNAIRES).length} cuestionarios + {Object.keys(COG_TESTS).length} tests cognitivos interactivos</p>
            {["Cuestionarios clínicos","Tests cognitivos interactivos"].map((group,gi)=>{
              const ids=gi===0?Object.keys(QUESTIONNAIRES):Object.keys(COG_TESTS);
              return(
                <div key={group} style={{marginBottom:28}}>
                  <h2 style={{color:"#5DCAA5",fontSize:15,fontWeight:700,marginBottom:14}}>{group}</h2>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
                    {ids.map(id=>{const td=allTestDefs[id];return(
                      <div key={id} style={{...S.card,borderTopWidth:3,borderTopColor:TEAL}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}>
                          <span style={{fontSize:22}}>{td.icon||"📋"}</span>
                          <span style={{fontSize:11,color:"#475569"}}>{td.duration}</span>
                        </div>
                        <p style={{color:"#f1f5f9",fontSize:14,fontWeight:600,margin:"0 0 4px"}}>{td.fullName||td.name}</p>
                        <p style={{color:TEAL,fontSize:12,margin:"0 0 8px"}}>{td.area}</p>
                        {td.maxScore&&<p style={{color:"#475569",fontSize:12,margin:0}}>{td.questions?.length} preguntas · máx. {td.maxScore} pts</p>}
                        {!td.maxScore&&<p style={{color:"#475569",fontSize:12,margin:0}}>Test interactivo · resultado automático</p>}
                      </div>
                    );})}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view==="stats"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>Estadísticas grupales</h1>
            <p style={{color:"#4B8A7A",fontSize:13,marginBottom:24}}>Distribución de aptitud por empresa y turno</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
              {Object.entries(aptCounts).map(([k,v])=>{const apt=APTITUD[k];return(
                <div key={k} style={S.card}><p style={{...S.label,marginBottom:8}}>{apt.label}</p><p style={{fontSize:36,fontFamily:"'DM Serif Display'",color:apt.color,margin:0}}>{v}</p></div>
              );
              })}
            </div>
            {[...new Set(workers.map(w=>w.empresa))].map(empresa=>{
              const empWorkers=workers.filter(w=>w.empresa===empresa);
              const empEvals=empWorkers.flatMap(w=>w.evaluations);
              const counts={apto:0,restriccion:0,no_apto:0};
              empEvals.forEach(e=>{counts[calcFinalAptitud(e.tests)]++;});
              const total=Object.values(counts).reduce((s,v)=>s+v,0);
              return(
                <div key={empresa} style={{...S.card,marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <p style={{margin:0,fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{empresa}</p>
                    <p style={{margin:0,fontSize:12,color:"#475569"}}>{empWorkers.length} trabajadores · {total} evaluaciones</p>
                  </div>
                  {total===0&&<p style={{color:"#475569",fontSize:13}}>Sin evaluaciones</p>}
                  {Object.entries(APTITUD).map(([k,apt])=>{
                    const pct=total>0?Math.round((counts[k]/total)*100):0;
                    return(
                      <div key={k} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,color:apt.color,fontWeight:600}}>{apt.label}</span>
                          <span style={{fontSize:11,color:"#64748b"}}>{counts[k]} ({pct}%)</span>
                        </div>
                        <div style={{background:"#1e293b",borderRadius:99,height:6}}>
                          <div style={{width:`${pct}%`,height:"100%",background:apt.color,borderRadius:99,transition:"width 0.8s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {workers.length===0&&<div style={{...S.card,textAlign:"center",padding:48}}><p style={{color:"#475569",fontSize:14}}>Sin datos todavía.</p></div>}
          </div>
        )}

        {view==="worker"&&currentWorker&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"start",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:14}}>
              <div>
                <p style={{...S.label,marginBottom:3}}>Trabajador</p>
                <h1 style={{fontFamily:"'DM Serif Display'",fontSize:32,margin:"0 0 6px",color:"#f1f5f9"}}>{currentWorker.name}</h1>
                <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{color:"#4B8A7A",fontSize:13}}>🏭 {currentWorker.empresa}</span>
                  <span style={{color:"#4B8A7A",fontSize:13}}>💼 {currentWorker.puesto}</span>
                  <span style={{color:"#4B8A7A",fontSize:13}}>🌙 Turno {currentWorker.turno}</span>
                  {currentWorker.legajo&&<span style={{color:"#4B8A7A",fontSize:13}}>Legajo: {currentWorker.legajo}</span>}
                  {currentWorker.dni&&<span style={{color:"#4B8A7A",fontSize:13}}>DNI: {currentWorker.dni}</span>}
                  {/* ── NUEVO: botón eliminar en vista trabajador ── */}
                  <button onClick={()=>setConfirmDelete(currentWorker)} style={S.danger}>🗑 Eliminar trabajador</button>
                </div>
              </div>
              <button style={S.btn()} onClick={()=>setShowAssign(currentWorker)}>+ Nueva evaluación</button>
            </div>

            {currentWorker.evaluations.length===0?(
              <div style={{...S.card,textAlign:"center",padding:48}}><p style={{color:"#475569",fontSize:14}}>Sin evaluaciones. Iniciá una evaluación pre-turno arriba.</p></div>
            ):(
              [...currentWorker.evaluations].sort((a,b)=>b.date.localeCompare(a.date)).map(ev=>{
                const final=calcFinalAptitud(ev.tests);const apt=APTITUD[final];
                const status=reportStatus[ev.id];
                return(
                  <div key={ev.id} style={{...S.card,marginBottom:14,borderLeftWidth:3,borderLeftColor:apt.color}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:10,marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:24}}>{apt.emoji}</span>
                        <div>
                          <p style={{margin:0,fontSize:15,fontWeight:700,color:apt.color}}>{apt.label}</p>
                          <p style={{margin:0,fontSize:12,color:"#475569"}}>{ev.date}</p>
                        </div>
                        {status&&status!=="generado"&&<span style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:6,padding:"1px 8px",fontSize:11,fontWeight:700}}>{status.charAt(0).toUpperCase()+status.slice(1)}</span>}
                      </div>
                      <button style={{...S.btn(),fontSize:12}} onClick={()=>handleGenerateReport(currentWorker,ev)}>✦ Informe IA</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
                      {Object.entries(ev.tests).map(([testId,result])=>{
                        const td=allTestDefs[testId];if(!td) return null;
                        const testApt=APTITUD[result.aptitud];
                        return(
                          <div key={testId} style={{background:"#041a18",border:`1px solid ${TEAL_BORDER}`,borderRadius:10,padding:"10px 12px"}}>
                            <div style={{display:"flex",alignItems:"center",marginBottom:4}}>
                              <span style={{fontSize:14}}>{td.icon||"📋"}</span>
                              <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:testApt?.color}}>{testApt?.label}</span>
                            </div>
                            <p style={{margin:0,fontSize:12,fontWeight:600,color:"#94a3b8"}}>{td.name}</p>
                            <p style={{margin:0,fontSize:11,color:"#475569"}}>{td.describe?td.describe(result):(result.total!==undefined?`${result.total}/${td.maxScore} pts`:"")}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
