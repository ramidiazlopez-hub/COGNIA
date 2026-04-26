import { useState, useEffect } from "react";

// jsPDF se carga dinámicamente desde CDN
let jsPDFLib = null;
async function loadJsPDF() {
  if(jsPDFLib) return jsPDFLib;
  return new Promise((resolve) => {
    if(window.jspdf) { jsPDFLib = window.jspdf.jsPDF; resolve(jsPDFLib); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => { jsPDFLib = window.jspdf.jsPDF; resolve(jsPDFLib); };
    document.head.appendChild(s);
  });
}

async function exportReportPDF(patient, ev, testDef, reportText, semaforo, nextActions, status, professionalName) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W = 210; const margin = 20; const col = W - margin*2;
  let y = 20;

  // Helper functions
  const addText = (text, x, size=10, style="normal", color=[30,30,30]) => {
    doc.setFontSize(size); doc.setFont("helvetica", style); doc.setTextColor(...color);
    doc.text(text, x, y);
  };
  const addWrapped = (text, x, size=10, style="normal", color=[60,60,60], maxW=col) => {
    doc.setFontSize(size); doc.setFont("helvetica", style); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, x, y);
    y += lines.length * (size * 0.4) + 2;
  };
  const addLine = (color=[220,220,220]) => {
    doc.setDrawColor(...color); doc.setLineWidth(0.3);
    doc.line(margin, y, W-margin, y); y += 4;
  };
  const addSpace = (n=4) => { y += n; };

  // ── HEADER ──
  // Logo bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 28, "F");

  // COGNIA wordmark
  doc.setFontSize(20); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text("COGN", margin, 18);
  doc.setTextColor(175, 169, 236);
  const cognW = doc.getTextWidth("COGN");
  doc.text("IA", margin + cognW, 18);

  // Subtitle
  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(148,163,184);
  doc.text("EVALUACIÓN EN SALUD MENTAL", margin + cognW + doc.getTextWidth("IA") + 4, 18);

  // Date top right
  doc.setFontSize(8); doc.setTextColor(148,163,184);
  doc.text(new Date().toLocaleDateString("es-AR", {day:"2-digit",month:"long",year:"numeric"}), W-margin, 18, {align:"right"});

  y = 36;

  // ── SEMÁFORO ──
  const semColors = {
    "Verde":   [34,197,94],
    "Amarillo":[251,191,36],
    "Naranja": [249,115,22],
    "Rojo":    [239,68,68],
  };
  const sc = semColors[semaforo.label] || [148,163,184];
  doc.setFillColor(...sc.map(c=>Math.min(c,255)));
  doc.roundedRect(margin, y, col, 14, 2, 2, "F");
  doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text(`${semaforo.emoji || "●"}  ${semaforo.label} — ${semaforo.desc}`, margin+4, y+9);
  y += 20;

  // ── DATOS DEL INFORME ──
  const td = testDef;
  const sr = td.score(ev.total);
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(100,116,139);
  doc.text("INFORME CLÍNICO DE EVALUACIÓN PSICOLÓGICA", margin, y);
  y += 6; addLine([71,85,105]);

  // Patient + test info grid
  const infoRows = [
    ["Paciente", patient.name + (patient.age ? `, ${patient.age} años` : "")],
    ["Instrumento", `${td.fullName} (${td.name})`],
    ["Área clínica", CATEGORIES[td.category]?.label || td.category],
    ["Puntaje obtenido", `${ev.total} / ${td.maxScore} — ${sr.level}`],
    ["Fecha de evaluación", ev.date],
    ["Estado del informe", (status || "Generado").charAt(0).toUpperCase() + (status||"generado").slice(1)],
  ];
  if(professionalName) infoRows.push(["Profesional", professionalName]);

  infoRows.forEach(([label, val]) => {
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(71,85,105);
    doc.text(label+":", margin, y);
    doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30);
    doc.text(val, margin+42, y);
    y += 6;
  });

  addSpace(2); addLine(); addSpace(2);

  // ── INFORME IA ──
  doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(30,30,30);
  doc.text("INFORME CLÍNICO", margin, y); y += 6;

  // Worsening alert if present
  if(semaforo.worsening) {
    doc.setFillColor(249,115,22,30);
    doc.setDrawColor(249,115,22);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, col, 10, 1, 1, "FD");
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(249,115,22);
    doc.text(`⚠  Cambio clínicamente relevante — variación de +${semaforo.delta} pts respecto de la medición previa`, margin+3, y+6.5);
    y += 14;
  }

  // Report text
  const cleanText = (reportText || "").replace(/\*\*/g,"").replace(/###/g,"").replace(/##/g,"");
  const sections = cleanText.split("
").filter(l=>l.trim());
  sections.forEach(line => {
    if(y > 265) { doc.addPage(); y = 20; }
    const isHeading = /^\d+\./.test(line.trim()) || line.trim().endsWith(":");
    doc.setFontSize(isHeading ? 10 : 9.5);
    doc.setFont("helvetica", isHeading ? "bold" : "normal");
    doc.setTextColor(isHeading ? 30 : 60, isHeading ? 30 : 60, isHeading ? 30 : 60);
    const wrapped = doc.splitTextToSize(line, col);
    doc.text(wrapped, margin, y);
    y += wrapped.length * (isHeading ? 5 : 4.5) + (isHeading ? 2 : 1);
  });

  addSpace(4); addLine(); addSpace(2);

  // ── PRÓXIMAS ACCIONES ──
  if(nextActions && nextActions.length > 0) {
    if(y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(30,30,30);
    doc.text("PRÓXIMAS ACCIONES SUGERIDAS", margin, y); y += 4;
    doc.setFontSize(8); doc.setFont("helvetica","italic"); doc.setTextColor(100,116,139);
    doc.text("Sugerencias automáticas — requieren validación y aprobación del profesional tratante", margin, y); y += 7;

    nextActions.forEach((action, i) => {
      if(y > 270) { doc.addPage(); y = 20; }
      doc.setFillColor(124,58,237,20);
      doc.setDrawColor(124,58,237,60);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, col, 9, 1, 1, "FD");
      doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30);
      const actionLines = doc.splitTextToSize(`${i+1}. ${action}`, col-6);
      doc.text(actionLines, margin+3, y+5.5);
      y += 12;
    });

    addSpace(4); addLine(); addSpace(2);
  }

  // ── FIRMA ──
  if(y > 240) { doc.addPage(); y = 20; }
  if(status === "firmado" && professionalName) {
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(34,197,94);
    doc.text("✓ INFORME FIRMADO DIGITALMENTE", margin, y); y += 5;
    doc.setFont("helvetica","normal"); doc.setTextColor(71,85,105);
    doc.text(`Profesional: ${professionalName}`, margin, y); y += 5;
    doc.text(`Fecha de firma: ${new Date().toLocaleDateString("es-AR")}`, margin, y); y += 5;
    doc.text("Sistema COGNIA — Evaluaciones en Salud Mental", margin, y); y += 10;
    addLine([34,197,94]);
  }

  // ── FOOTER ──
  const totalPages = doc.internal.getNumberOfPages();
  for(let i=1; i<=totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(15,23,42);
    doc.rect(0, 287, W, 10, "F");
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(148,163,184);
    doc.text("COGNIA · Evaluaciones en Salud Mental · Uso exclusivo del profesional tratante", margin, 293);
    doc.text(`Página ${i} de ${totalPages}`, W-margin, 293, {align:"right"});
  }

  // Download
  const patName = patient.name.replace(/\s+/g,"_");
  doc.save(`COGNIA_${td.name}_${patName}_${ev.date}.pdf`);
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = {
  depresion:    { label: "Depresión",                    color: "#4A90D9", icon: "◌" },
  ansiedad:     { label: "Ansiedad",                     color: "#8B5CF6", icon: "◎" },
  trauma:       { label: "Trauma / PTSD",                color: "#EF4444", icon: "◈" },
  sustancias:   { label: "Consumo de sustancias",        color: "#F59E0B", icon: "◉" },
  alimentaria:  { label: "Conducta alimentaria",         color: "#EC4899", icon: "◐" },
  sueno:        { label: "Sueño",                        color: "#6366F1", icon: "◑" },
  cognicion:    { label: "Cognición",                    color: "#14B8A6", icon: "◒" },
  tdah:         { label: "TDAH",                         color: "#F97316", icon: "◓" },
  psicosis:     { label: "Psicosis",                     color: "#A855F7", icon: "◔" },
  bipolar:      { label: "Bipolar",                      color: "#06B6D4", icon: "◕" },
  toc:          { label: "TOC",                          color: "#84CC16", icon: "◖" },
  personalidad: { label: "Personalidad",                 color: "#F43F5E", icon: "◗" },
};

// ─── TESTS ────────────────────────────────────────────────────────────────────
const TESTS = {
  // ── DEPRESIÓN ──
  phq9: {
    id:"phq9", name:"PHQ-9", fullName:"Patient Health Questionnaire-9",
    category:"depresion", duration:"3-5 min",
    instructions:"Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
    options:[{label:"Para nada",value:0},{label:"Varios días",value:1},{label:"Más de la mitad de los días",value:2},{label:"Casi todos los días",value:3}],
    questions:[
      "Poco interés o placer en hacer cosas",
      "Sentirse decaído/a, deprimido/a o sin esperanza",
      "Dificultad para dormir o dormir demasiado",
      "Sentirse cansado/a o con poca energía",
      "Poco apetito o comer en exceso",
      "Sentirse mal consigo mismo/a, o sentir que es un fracaso",
      "Dificultad para concentrarse en cosas como leer o ver televisión",
      "Moverse o hablar tan despacio que otros podrían haberlo notado, o estar tan agitado/a que se mueve más de lo normal",
      "Pensamientos de que estaría mejor muerto/a o de hacerse daño",
    ],
    maxScore: 27,
    score:(t)=>{ if(t<=4) return{level:"Mínimo",color:"#22c55e",desc:"Síntomas mínimos o ausentes"}; if(t<=9) return{level:"Leve",color:"#86efac",desc:"Síntomas leves"}; if(t<=14) return{level:"Moderado",color:"#fbbf24",desc:"Depresión moderada — seguimiento recomendado"}; if(t<=19) return{level:"Mod. severo",color:"#f97316",desc:"Tratamiento indicado"}; return{level:"Severo",color:"#ef4444",desc:"Intervención urgente recomendada"}; },
  },
  bdi2: {
    id:"bdi2", name:"BDI-II", fullName:"Inventario de Depresión de Beck-II",
    category:"depresion", duration:"5-10 min",
    instructions:"Por favor, lea cada grupo de afirmaciones y elija la que mejor describe cómo se ha sentido durante las últimas dos semanas, incluido el día de hoy.",
    options:[{label:"No me siento triste",value:0},{label:"Me siento triste gran parte del tiempo",value:1},{label:"Me siento triste continuamente",value:2},{label:"Me siento tan triste o tan desgraciado/a que no puedo soportarlo",value:3}],
    questions:[
      "Tristeza",
      "Pesimismo",
      "Fracaso en el pasado",
      "Pérdida de placer",
      "Sentimientos de culpa",
      "Sentimientos de castigo",
      "Insatisfacción con uno mismo",
      "Autocrítica",
      "Pensamientos o deseos suicidas",
      "Llanto",
      "Agitación",
      "Pérdida de interés",
      "Indecisión",
      "Inutilidad",
      "Pérdida de energía",
      "Cambios en el sueño",
      "Irritabilidad",
      "Cambios en el apetito",
      "Dificultad de concentración",
      "Cansancio o fatiga",
      "Pérdida de interés en el sexo",
    ],
    maxScore: 63,
    score:(t)=>{ if(t<=13) return{level:"Mínimo",color:"#22c55e",desc:"Depresión mínima"}; if(t<=19) return{level:"Leve",color:"#86efac",desc:"Depresión leve"}; if(t<=28) return{level:"Moderado",color:"#fbbf24",desc:"Depresión moderada"}; return{level:"Severo",color:"#ef4444",desc:"Depresión severa"}; },
  },
  // ── ANSIEDAD ──
  gad7: {
    id:"gad7", name:"GAD-7", fullName:"Generalized Anxiety Disorder-7",
    category:"ansiedad", duration:"2-4 min",
    instructions:"Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
    options:[{label:"Para nada",value:0},{label:"Varios días",value:1},{label:"Más de la mitad de los días",value:2},{label:"Casi todos los días",value:3}],
    questions:[
      "Sentirse nervioso/a, ansioso/a o con los nervios de punta",
      "No poder dejar de preocuparse o no poder controlar la preocupación",
      "Preocuparse demasiado por diferentes cosas",
      "Dificultad para relajarse",
      "Estar tan inquieto/a que es difícil permanecer sentado/a",
      "Molestarse o ponerse irritable fácilmente",
      "Sentir miedo, como si fuera a ocurrir algo terrible",
    ],
    maxScore: 21,
    score:(t)=>{ if(t<=4) return{level:"Mínimo",color:"#22c55e",desc:"Ansiedad mínima"}; if(t<=9) return{level:"Leve",color:"#86efac",desc:"Ansiedad leve"}; if(t<=14) return{level:"Moderado",color:"#fbbf24",desc:"Evaluación adicional recomendada"}; return{level:"Severo",color:"#ef4444",desc:"Tratamiento activo indicado"}; },
  },
  bai: {
    id:"bai", name:"BAI", fullName:"Inventario de Ansiedad de Beck",
    category:"ansiedad", duration:"5-7 min",
    instructions:"A continuación se presenta una lista de síntomas comunes de ansiedad. Por favor, indique cuánto le ha molestado cada síntoma durante la última semana.",
    options:[{label:"En absoluto",value:0},{label:"Levemente",value:1},{label:"Moderadamente",value:2},{label:"Gravemente",value:3}],
    questions:[
      "Entumecimiento u hormigueo","Sensación de calor","Temblor en las piernas","Incapacidad para relajarse",
      "Miedo a que suceda lo peor","Mareo o aturdimiento","Palpitaciones","Inestabilidad",
      "Terrores","Nerviosismo","Sensación de ahogo","Temblores de manos","Temblor general",
      "Miedo a perder el control","Dificultad para respirar","Miedo a morir","Sensación de alarma",
      "Indigestión","Desmayos","Rubor facial","Sudoración (no debida al calor)",
    ],
    maxScore: 63,
    score:(t)=>{ if(t<=7) return{level:"Mínimo",color:"#22c55e",desc:"Ansiedad mínima"}; if(t<=15) return{level:"Leve",color:"#86efac",desc:"Ansiedad leve"}; if(t<=25) return{level:"Moderado",color:"#fbbf24",desc:"Ansiedad moderada"}; return{level:"Severo",color:"#ef4444",desc:"Ansiedad severa"}; },
  },
  // ── TRAUMA / PTSD ──
  pcl5: {
    id:"pcl5", name:"PCL-5", fullName:"PTSD Checklist for DSM-5",
    category:"trauma", duration:"5-8 min",
    instructions:"A continuación hay una lista de problemas que las personas a veces tienen en respuesta a una experiencia muy estresante. Por favor, lea cada problema cuidadosamente y luego elija una respuesta para indicar cuánto le ha molestado ese problema en el último mes.",
    options:[{label:"Nada en absoluto",value:0},{label:"Un poco",value:1},{label:"Moderadamente",value:2},{label:"Bastante",value:3},{label:"Extremadamente",value:4}],
    questions:[
      "Recuerdos perturbadores repetitivos, involuntarios del evento estresante",
      "Sueños perturbadores repetitivos del evento estresante",
      "De repente sentirse o actuar como si el evento estresante estuviera ocurriendo de nuevo",
      "Sentirse muy perturbado/a cuando algo le recuerda el evento estresante",
      "Tener fuertes reacciones físicas cuando algo le recuerda el evento estresante",
      "Evitar recuerdos, pensamientos o sentimientos relacionados con el evento",
      "Evitar recordatorios externos del evento (personas, lugares, conversaciones, objetos, actividades, situaciones)",
      "Dificultad para recordar partes importantes del evento",
      "Tener creencias negativas fuertes sobre usted mismo/a, otras personas o el mundo",
      "Culparse a sí mismo/a o a otros por el evento o lo que sucedió después",
      "Tener sentimientos negativos fuertes (p.ej., miedo, horror, ira, culpa o vergüenza)",
      "Pérdida de interés en actividades que antes disfrutaba",
      "Sentirse distante o separado/a de otras personas",
      "Dificultad para experimentar sentimientos positivos",
      "Comportamiento irritable, arrebatos de enojo o actuar de manera agresiva",
      "Asumir demasiados riesgos o hacer cosas que podrían causarle daño",
      "Estar en alerta máxima o en guardia",
      "Sobresaltarse fácilmente",
      "Tener dificultad para concentrarse",
      "Problemas para dormir",
    ],
    maxScore: 80,
    score:(t)=>{ if(t<=20) return{level:"Sub-umbral",color:"#22c55e",desc:"Por debajo del umbral clínico"}; if(t<=32) return{level:"Probable PTSD leve",color:"#fbbf24",desc:"Evaluación clínica recomendada"}; if(t<=50) return{level:"PTSD moderado",color:"#f97316",desc:"Tratamiento especializado indicado"}; return{level:"PTSD severo",color:"#ef4444",desc:"Intervención urgente recomendada"}; },
  },
  iesr: {
    id:"iesr", name:"IES-R", fullName:"Impact of Event Scale-Revised",
    category:"trauma", duration:"4-6 min",
    instructions:"A continuación se presenta una lista de dificultades que la gente a veces tiene después de eventos de vida estresantes. Por favor, lea cada ítem y luego indique cuánta dificultad le ha causado EN LOS ÚLTIMOS 7 DÍAS con respecto a un evento específico.",
    options:[{label:"Nada",value:0},{label:"Un poco",value:1},{label:"Moderadamente",value:2},{label:"Bastante",value:3},{label:"Extremadamente",value:4}],
    questions:[
      "Cualquier recordatorio me devolvía sentimientos al respecto",
      "Tenía dificultad para mantenerme dormido/a",
      "Otras cosas seguían haciéndome pensar al respecto",
      "Me sentía irritable y enojado/a",
      "Traté de no alterarme cuando pensaba en ello",
      "Pensé en ello aunque no quería",
      "Sentí que no había ocurrido o que no era real",
      "Me mantuve alejado/a de las cosas que me lo recordaban",
      "Imágenes del evento aparecían en mi mente",
      "Estaba nervioso/a y fácilmente me asustaba",
      "Traté de no pensar en ello",
      "Supe que todavía tenía muchos sentimientos al respecto pero no los manejé",
      "Mis sentimientos al respecto estaban como adormecidos",
      "Me encontré actuando o sintiéndome como si estuviera de vuelta en ese momento",
      "Tenía dificultad para dormirme",
      "Sentía oleadas de sentimientos fuertes al respecto",
      "Traté de borrarlo de mi memoria",
      "Tenía dificultad para concentrarme",
      "Los recordatorios me causaban reacciones físicas (sudoración, dificultad para respirar, náuseas)",
      "Tenía sueños al respecto",
      "Me sentía en alerta y en guardia",
      "Traté de no hablar de ello",
    ],
    maxScore: 88,
    score:(t)=>{ if(t<=23) return{level:"Sub-clínico",color:"#22c55e",desc:"Impacto sub-clínico"}; if(t<=32) return{level:"Leve",color:"#86efac",desc:"Impacto leve del evento"}; if(t<=42) return{level:"Moderado",color:"#fbbf24",desc:"Probable PTSD — evaluación recomendada"}; return{level:"Severo",color:"#ef4444",desc:"PTSD probable — intervención recomendada"}; },
  },
  // ── SUSTANCIAS ──
  audit: {
    id:"audit", name:"AUDIT", fullName:"Alcohol Use Disorders Identification Test",
    category:"sustancias", duration:"4-6 min",
    instructions:"Por favor, responda las siguientes preguntas sobre su consumo de alcohol en el último año.",
    options:[{label:"Nunca",value:0},{label:"Una o menos veces al mes",value:1},{label:"De 2 a 4 veces al mes",value:2},{label:"De 2 a 3 veces a la semana",value:3},{label:"4 o más veces a la semana",value:4}],
    questions:[
      "¿Con qué frecuencia consume alguna bebida alcohólica?",
      "¿Cuántas consumiciones suele realizar en un día normal?",
      "¿Con qué frecuencia toma 6 o más bebidas en una sola ocasión?",
      "¿Con qué frecuencia no pudo parar de beber una vez que había empezado?",
      "¿Con qué frecuencia no pudo hacer lo esperado porque había bebido?",
      "¿Con qué frecuencia necesitó beber en ayunas para recuperarse?",
      "¿Con qué frecuencia tuvo remordimientos después de haber bebido?",
      "¿Con qué frecuencia no recordó lo que sucedió la noche anterior por haber bebido?",
      "¿Alguna persona resultó herida porque usted había bebido?",
      "¿Algún familiar o profesional sanitario mostró preocupación por su consumo?",
    ],
    maxScore: 40,
    score:(t)=>{ if(t<=7) return{level:"Bajo riesgo",color:"#22c55e",desc:"Consumo de bajo riesgo"}; if(t<=15) return{level:"Riesgo moderado",color:"#fbbf24",desc:"Psicoeducación recomendada"}; if(t<=19) return{level:"Alto riesgo",color:"#f97316",desc:"Intervención breve indicada"}; return{level:"Dependencia probable",color:"#ef4444",desc:"Evaluación especializada urgente"}; },
  },
  dast10: {
    id:"dast10", name:"DAST-10", fullName:"Drug Abuse Screening Test-10",
    category:"sustancias", duration:"3-5 min",
    instructions:"Las siguientes preguntas se refieren al uso de drogas (no alcohol ni tabaco) en los últimos 12 meses. Responda SÍ o NO.",
    options:[{label:"No",value:0},{label:"Sí",value:1}],
    questions:[
      "¿Ha usado drogas que no sean para fines médicos?",
      "¿Abusa de más de una droga a la vez?",
      "¿Es siempre capaz de dejar de usar drogas cuando quiere?",
      "¿Ha tenido episodios de blackout o flashbacks como resultado del uso de drogas?",
      "¿Se siente culpable a veces por su uso de drogas?",
      "¿Su cónyuge (o sus padres) se queja a veces de su uso de drogas?",
      "¿Ha descuidado a su familia a causa de su uso de drogas?",
      "¿Ha participado en actividades ilegales para obtener drogas?",
      "¿Ha experimentado síntomas de abstinencia cuando dejó de usar algunas drogas?",
      "¿Ha tenido problemas médicos como resultado de su uso de drogas?",
    ],
    maxScore: 10,
    score:(t)=>{ if(t===0) return{level:"Sin problema",color:"#22c55e",desc:"Sin evidencia de abuso"}; if(t<=2) return{level:"Bajo",color:"#86efac",desc:"Nivel bajo de problemas"}; if(t<=5) return{level:"Moderado",color:"#fbbf24",desc:"Nivel moderado — intervención recomendada"}; if(t<=8) return{level:"Sustancial",color:"#f97316",desc:"Nivel sustancial — evaluación especializada"}; return{level:"Severo",color:"#ef4444",desc:"Nivel severo — tratamiento intensivo indicado"}; },
  },
  // ── CONDUCTA ALIMENTARIA ──
  scoff: {
    id:"scoff", name:"SCOFF", fullName:"SCOFF Questionnaire",
    category:"alimentaria", duration:"2-3 min",
    instructions:"Por favor, responda las siguientes preguntas con SÍ o NO.",
    options:[{label:"No",value:0},{label:"Sí",value:1}],
    questions:[
      "¿Se provoca el vómito porque se siente incómodamente lleno/a?",
      "¿Le preocupa haber perdido el control sobre cuánto come?",
      "¿Ha perdido recientemente más de 6 kg en un período de 3 meses?",
      "¿Cree que está gordo/a cuando otros dicen que está demasiado delgado/a?",
      "¿Diría que la comida domina su vida?",
    ],
    maxScore: 5,
    score:(t)=>{ if(t<=1) return{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores significativos"}; return{level:"Posible TCA",color:"#ef4444",desc:"≥2 puntos: evaluación especializada recomendada"}; },
  },
  edeq: {
    id:"edeq", name:"EDE-Q (breve)", fullName:"Eating Disorder Examination Questionnaire (versión breve)",
    category:"alimentaria", duration:"5-7 min",
    instructions:"Las siguientes preguntas se refieren a los últimos 28 días. Por favor, seleccione la respuesta que mejor describe su experiencia.",
    options:[{label:"Ningún día",value:0},{label:"1-5 días",value:1},{label:"6-12 días",value:2},{label:"13-15 días",value:3},{label:"16-22 días",value:4},{label:"23-27 días",value:5},{label:"Todos los días",value:6}],
    questions:[
      "¿Ha intentado deliberadamente limitar la cantidad de alimentos que come para influir en su figura o peso?",
      "¿Ha pasado largos períodos de tiempo sin comer nada para influir en su figura o peso?",
      "¿Ha intentado excluir de su dieta alimentos que le gustan para influir en su figura o peso?",
      "¿Ha intentado seguir reglas definitivas sobre su alimentación para influir en su figura o peso?",
      "¿Ha deseado tener el estómago vacío?",
      "¿Ha pensado que sería mejor no comer?",
      "¿Ha comido en secreto?",
      "¿Se ha sentido culpable después de comer?",
    ],
    maxScore: 48,
    score:(t)=>{ if(t<=12) return{level:"Sin alteración",color:"#22c55e",desc:"Sin alteración significativa"}; if(t<=24) return{level:"Leve",color:"#86efac",desc:"Alteración leve — monitoreo recomendado"}; if(t<=36) return{level:"Moderado",color:"#fbbf24",desc:"Evaluación especializada recomendada"}; return{level:"Severo",color:"#ef4444",desc:"TCA probable — derivación urgente"}; },
  },
  // ── SUEÑO ──
  isi: {
    id:"isi", name:"ISI", fullName:"Insomnia Severity Index",
    category:"sueno", duration:"3-5 min",
    instructions:"Para cada pregunta, indique la gravedad de su problema de sueño en las últimas 2 semanas.",
    options:[{label:"Ninguno",value:0},{label:"Leve",value:1},{label:"Moderado",value:2},{label:"Severo",value:3},{label:"Muy severo",value:4}],
    questions:[
      "Dificultad para conciliar el sueño",
      "Dificultad para mantener el sueño",
      "Problemas para despertarse demasiado temprano",
      "¿Qué tan satisfecho/a está con su sueño actual?",
      "¿En qué medida considera que su problema de sueño es notable para los demás?",
      "¿Qué tan preocupado/a está por su problema de sueño actual?",
      "¿En qué medida su problema de sueño interfiere con su funcionamiento diario?",
    ],
    maxScore: 28,
    score:(t)=>{ if(t<=7) return{level:"Sin insomnio",color:"#22c55e",desc:"Sin insomnio clínicamente significativo"}; if(t<=14) return{level:"Subumbral",color:"#86efac",desc:"Insomnio subumbral"}; if(t<=21) return{level:"Moderado",color:"#fbbf24",desc:"Insomnio clínico moderado"}; return{level:"Severo",color:"#ef4444",desc:"Insomnio clínico severo"}; },
  },
  ess: {
    id:"ess", name:"ESS", fullName:"Escala de Somnolencia de Epworth",
    category:"sueno", duration:"3-4 min",
    instructions:"¿Qué posibilidad tiene de quedarse dormido/a en las siguientes situaciones? Incluso si no ha estado en esas situaciones recientemente, trate de imaginar cómo le habrían afectado.",
    options:[{label:"Nunca me quedaría dormido/a",value:0},{label:"Pequeña probabilidad",value:1},{label:"Probabilidad moderada",value:2},{label:"Alta probabilidad",value:3}],
    questions:[
      "Sentado/a y leyendo",
      "Viendo la televisión",
      "Sentado/a inactivo/a en un lugar público",
      "Como pasajero/a en un coche durante una hora sin paradas",
      "Tumbado/a para descansar por la tarde",
      "Sentado/a y hablando con alguien",
      "Sentado/a tranquilamente después de una comida sin alcohol",
      "En un coche, al pararse unos minutos en el tráfico",
    ],
    maxScore: 24,
    score:(t)=>{ if(t<=10) return{level:"Normal",color:"#22c55e",desc:"Somnolencia diurna normal"}; if(t<=15) return{level:"Somnolencia leve",color:"#fbbf24",desc:"Somnolencia diurna excesiva leve"}; if(t<=20) return{level:"Moderada",color:"#f97316",desc:"Somnolencia moderada — evaluación recomendada"}; return{level:"Severa",color:"#ef4444",desc:"Somnolencia severa — estudio de sueño indicado"}; },
  },
  // ── COGNICIÓN ──
  moca_brief: {
    id:"moca_brief", name:"MoCA-B", fullName:"Montreal Cognitive Assessment (Cribado breve)",
    category:"cognicion", duration:"5-8 min",
    instructions:"A continuación hay preguntas sobre diferentes aspectos de la memoria y el pensamiento. Por favor, responda lo mejor que pueda.",
    options:[{label:"Incorrecto",value:0},{label:"Correcto",value:1}],
    questions:[
      "¿Sabe en qué año estamos?",
      "¿Sabe en qué mes estamos?",
      "¿Sabe qué día de la semana es hoy?",
      "¿Puede decirme en qué ciudad nos encontramos?",
      "¿Puede decirme el nombre de este lugar (institución/consulta)?",
      "Recuerda las 3 palabras que le dije (cara, seda, iglesia)",
      "¿Puede restar de 7 en 7 comenzando desde 100? (93)",
      "¿Puede restar de 7 en 7? (86)",
      "¿Puede restar de 7 en 7? (79)",
      "¿Puede nombrar este animal? (imagen de un rinoceronte)",
      "¿En qué se parecen un tren y una bicicleta? (medio de transporte)",
    ],
    maxScore: 11,
    score:(t)=>{ if(t>=9) return{level:"Normal",color:"#22c55e",desc:"Funcionamiento cognitivo dentro de rangos normales"}; if(t>=6) return{level:"Deterioro leve",color:"#fbbf24",desc:"Posible deterioro cognitivo leve — evaluación completa recomendada"}; return{level:"Deterioro significativo",color:"#ef4444",desc:"Deterioro cognitivo significativo — derivación a neuropsicología"}; },
  },
  // ── TDAH ──
  asrs: {
    id:"asrs", name:"ASRS-v1.1", fullName:"Adult ADHD Self-Report Scale v1.1",
    category:"tdah", duration:"4-6 min",
    instructions:"Por favor, califique con qué frecuencia ha experimentado los siguientes síntomas durante los últimos 6 meses.",
    options:[{label:"Nunca",value:0},{label:"Raramente",value:1},{label:"A veces",value:2},{label:"A menudo",value:3},{label:"Muy a menudo",value:4}],
    questions:[
      "¿Con qué frecuencia tiene dificultades para terminar los detalles finales de un proyecto?",
      "¿Con qué frecuencia tiene dificultad para poner las cosas en orden cuando tiene que hacer una tarea que requiere organización?",
      "¿Con qué frecuencia tiene problemas para recordar citas u obligaciones?",
      "Cuando tiene que hacer una tarea que requiere mucho pensamiento, ¿con qué frecuencia evita o retrasa comenzar?",
      "¿Con qué frecuencia mueve excesivamente las manos o los pies o se retuerce en el asiento?",
      "¿Con qué frecuencia se siente excesivamente activo/a y compelido/a a hacer cosas, como si estuviese impulsado/a por un motor?",
      "¿Con qué frecuencia comete errores descuidados cuando tiene que trabajar en un proyecto aburrido o difícil?",
      "¿Con qué frecuencia tiene dificultad para mantener su atención cuando hace un trabajo aburrido o repetitivo?",
      "¿Con qué frecuencia tiene dificultad para concentrarse en lo que la gente le dice, incluso cuando le están hablando directamente?",
      "¿Con qué frecuencia pierde u olvida las cosas en casa o en el trabajo?",
      "¿Con qué frecuencia se distrae por la actividad o el ruido a su alrededor?",
      "¿Con qué frecuencia abandona su asiento en reuniones u otras situaciones en las que se espera que permanezca sentado?",
      "¿Con qué frecuencia se siente inquieto/a o agitado/a?",
      "¿Con qué frecuencia tiene dificultad para relajarse cuando tiene tiempo libre?",
      "¿Con qué frecuencia se encuentra hablando demasiado en situaciones sociales?",
      "¿Con qué frecuencia se encuentra terminando las frases de las personas con las que habla antes de que puedan terminarlas ellas mismas?",
      "¿Con qué frecuencia tiene dificultad para esperar su turno en situaciones en las que se requiere turno?",
      "¿Con qué frecuencia interrumpe a los demás cuando están ocupados?",
    ],
    maxScore: 72,
    score:(t)=>{ if(t<=16) return{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores significativos de TDAH"}; if(t<=30) return{level:"Posible TDAH",color:"#fbbf24",desc:"Posibles síntomas — evaluación clínica recomendada"}; return{level:"Alta probabilidad",color:"#ef4444",desc:"Alta probabilidad de TDAH — evaluación diagnóstica formal indicada"}; },
  },
  // ── PSICOSIS ──
  bprs: {
    id:"bprs", name:"BPRS", fullName:"Brief Psychiatric Rating Scale (versión breve)",
    category:"psicosis", duration:"8-12 min",
    instructions:"Esta escala es completada por el profesional o por el paciente en base a la última semana. Evalúe la intensidad de cada síntoma.",
    options:[{label:"No presente",value:1},{label:"Muy leve",value:2},{label:"Leve",value:3},{label:"Moderado",value:4},{label:"Moderadamente severo",value:5},{label:"Severo",value:6},{label:"Extremadamente severo",value:7}],
    questions:[
      "Preocupación somática",
      "Ansiedad",
      "Retraimiento emocional",
      "Desorganización conceptual",
      "Sentimientos de culpa",
      "Tensión",
      "Manierismos y posturas",
      "Grandiosidad",
      "Humor depresivo",
      "Hostilidad",
      "Desconfianza",
      "Alucinaciones",
      "Enlentecimiento motor",
      "Falta de cooperación",
      "Contenido inusual del pensamiento",
      "Afecto embotado",
      "Excitación",
      "Desorientación",
    ],
    maxScore: 126,
    score:(t)=>{ if(t<=31) return{level:"Sin psicopatología",color:"#22c55e",desc:"Sin psicopatología significativa"}; if(t<=41) return{level:"Leve",color:"#86efac",desc:"Psicopatología leve"}; if(t<=52) return{level:"Moderado",color:"#fbbf24",desc:"Psicopatología moderada"}; if(t<=63) return{level:"Moderadamente severo",color:"#f97316",desc:"Psicopatología moderadamente severa"}; return{level:"Severo",color:"#ef4444",desc:"Psicopatología severa — intervención urgente"}; },
  },
  // ── BIPOLAR ──
  mdq: {
    id:"mdq", name:"MDQ", fullName:"Mood Disorder Questionnaire",
    category:"bipolar", duration:"4-6 min",
    instructions:"Por favor, lea cada pregunta y marque SÍ si la respuesta es afirmativa, NO si es negativa. Recuerde responder sobre períodos en que se sentía diferente a lo habitual.",
    options:[{label:"No",value:0},{label:"Sí",value:1}],
    questions:[
      "¿Ha habido algún período en que no estaba en su estado de ánimo habitual y se sintió tan bien o emocionado que los demás pensaron que no estaba siendo su mismo/a?",
      "¿Estuvo tan irritable que le gritó a personas o comenzó peleas?",
      "¿Se sintió mucho más seguro/a de sí mismo/a de lo habitual?",
      "¿Durmió mucho menos de lo habitual y lo encontró innecesario?",
      "¿Habló mucho más de lo usual o estuvo hablando tan rápido que la gente tenía dificultades para seguirle?",
      "¿Los pensamientos le pasaban tan rápido por la cabeza que no podía seguirlos?",
      "¿Se distrajo tan fácilmente que tenía dificultad para concentrarse o mantenerse en tema?",
      "¿Tuvo mucha más energía de la habitual?",
      "¿Fue mucho más activo/a o hizo muchas más cosas de lo habitual?",
      "¿Estuvo socialmente mucho más activo/a de lo usual?",
      "¿Fue mucho más interesado/a en el sexo de lo habitual?",
      "¿Hizo cosas inusuales o que otros pensaron eran tontas, riesgosas o probables de causarle problemas?",
      "¿Gastar dinero le creó problemas a usted o a su familia?",
    ],
    maxScore: 13,
    score:(t)=>{ if(t<=4) return{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores significativos de trastorno del estado de ánimo bipolar"}; if(t<=6) return{level:"Posible",color:"#fbbf24",desc:"Posibles síntomas bipolares — evaluación recomendada"}; return{level:"Screening positivo",color:"#ef4444",desc:"Screening positivo — evaluación psiquiátrica formal indicada"}; },
  },
  // ── TOC ──
  ocir: {
    id:"ocir", name:"OCI-R", fullName:"Obsessive-Compulsive Inventory Revised",
    category:"toc", duration:"4-6 min",
    instructions:"Las siguientes afirmaciones se refieren a experiencias que muchas personas tienen en su vida cotidiana. Por favor, indique cuánto le ha molestado o perturbado cada experiencia durante el último mes.",
    options:[{label:"Nada",value:0},{label:"Un poco",value:1},{label:"Moderadamente",value:2},{label:"Mucho",value:3},{label:"Muchísimo",value:4}],
    questions:[
      "Acumulo cosas hasta el punto que interfieren con mis actividades",
      "Compruebo las cosas más a menudo de lo necesario",
      "Me molesto si no puedo hacer las cosas en cierto orden",
      "Me siento compelido/a a contar mientras hago ciertas cosas",
      "Me resulta difícil tocar un objeto cuando sé que ha sido tocado por extraños o por ciertas personas",
      "Me resulta difícil controlar mis propios pensamientos",
      "Guardo cosas que no necesito",
      "Compruebo repetidamente las puertas, ventanas, cajones, etc., después de cerrarlos",
      "Me molesto cuando las cosas no se colocan en cierto orden",
      "Siento que ciertos números tienen especial importancia",
      "A veces tengo que lavarme o limpiarme sólo por sentirme contaminado/a",
      "Soy consciente de que algunos pensamientos que tengo son extraños o irracionales",
      "No puedo tirar las cosas porque tengo miedo de necesitarlas más adelante",
      "Compruebo repetidamente los aparatos del gas y del agua después de apagarlos",
      "Necesito que las cosas estén arregladas de cierta manera",
      "Siento que hay números buenos y malos",
      "Me lavo las manos con más frecuencia o durante más tiempo de lo necesario",
      "Con frecuencia tengo pensamientos horribles y me resulta difícil deshacerme de ellos",
    ],
    maxScore: 72,
    score:(t)=>{ if(t<=20) return{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores significativos de TOC"}; if(t<=30) return{level:"Leve",color:"#86efac",desc:"Síntomas leves"}; if(t<=40) return{level:"Moderado",color:"#fbbf24",desc:"Síntomas moderados — evaluación clínica recomendada"}; return{level:"Severo",color:"#ef4444",desc:"Síntomas severos — tratamiento especializado indicado"}; },
  },
  ybocs_brief: {
    id:"ybocs_brief", name:"Y-BOCS (breve)", fullName:"Yale-Brown Obsessive Compulsive Scale (versión breve de cribado)",
    category:"toc", duration:"5-8 min",
    instructions:"Las siguientes preguntas evalúan la gravedad de los pensamientos obsesivos y comportamientos compulsivos en la última semana.",
    options:[{label:"Ninguno",value:0},{label:"Leve",value:1},{label:"Moderado",value:2},{label:"Severo",value:3},{label:"Extremo",value:4}],
    questions:[
      "¿Cuánto tiempo ocupa con pensamientos obsesivos?",
      "¿Cuánto interfieren los pensamientos obsesivos en su vida social o laboral?",
      "¿Cuánta angustia le producen los pensamientos obsesivos?",
      "¿Cuánto se resiste a los pensamientos obsesivos?",
      "¿Cuánto control tiene sobre los pensamientos obsesivos?",
      "¿Cuánto tiempo dedica a las compulsiones?",
      "¿Cuánto interfieren las compulsiones en su vida social o laboral?",
      "¿Cuánta angustia experimentaría si no pudiera realizar las compulsiones?",
      "¿Cuánto se resiste a las compulsiones?",
      "¿Cuánto control tiene sobre las compulsiones?",
    ],
    maxScore: 40,
    score:(t)=>{ if(t<=7) return{level:"Sub-clínico",color:"#22c55e",desc:"Sin TOC clínicamente significativo"}; if(t<=15) return{level:"Leve",color:"#86efac",desc:"TOC leve"}; if(t<=23) return{level:"Moderado",color:"#fbbf24",desc:"TOC moderado"}; if(t<=31) return{level:"Severo",color:"#f97316",desc:"TOC severo"}; return{level:"Extremo",color:"#ef4444",desc:"TOC extremo — intervención intensiva indicada"}; },
  },
  // ── PERSONALIDAD ──
  bpq: {
    id:"bpq", name:"BPQ", fullName:"Borderline Personality Questionnaire (versión breve)",
    category:"personalidad", duration:"5-8 min",
    instructions:"Por favor, responda las siguientes preguntas sobre cómo se siente y se comporta habitualmente. No hay respuestas correctas o incorrectas.",
    options:[{label:"Falso",value:0},{label:"Verdadero",value:1}],
    questions:[
      "Mis relaciones con las personas importantes para mí tienen muchos altibajos",
      "Cuando estoy enojado/a con alguien, a veces empiezo a pensar que esa persona es completamente mala",
      "Mi imagen de mí mismo/a cambia con mucha frecuencia",
      "Me comprometo en actividades impulsivas que pueden hacerme daño",
      "He amenazado con suicidarme o me he herido a mí mismo/a",
      "Mi estado de ánimo cambia muy rápidamente",
      "Generalmente me siento vacío/a por dentro",
      "Cuando estoy bajo estrés, me vuelvo paranoico/a o me desconecto de la realidad",
      "Tengo miedo intenso a que me abandonen las personas cercanas",
      "A menudo actúo de manera impulsiva",
    ],
    maxScore: 10,
    score:(t)=>{ if(t<=3) return{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores significativos"}; if(t<=5) return{level:"Rasgos presentes",color:"#fbbf24",desc:"Rasgos borderline presentes — evaluación clínica recomendada"}; return{level:"Alta probabilidad",color:"#ef4444",desc:"Alta probabilidad de TPL — evaluación diagnóstica formal indicada"}; },
  },
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_PATIENTS = [
  { id:"p1", name:"María González", age:34, email:"maria@email.com", evaluations:[
    { id:"e1", testId:"phq9", date:"2024-10-15", answers:[1,2,1,2,1,1,1,0,0], total:9 },
    { id:"e2", testId:"phq9", date:"2025-01-20", answers:[0,1,1,1,0,1,1,0,0], total:5 },
    { id:"e3", testId:"phq9", date:"2025-04-10", answers:[0,0,1,1,0,0,0,0,0], total:2 },
    { id:"e4", testId:"gad7", date:"2025-01-20", answers:[2,2,1,2,1,1,1], total:10 },
    { id:"e5", testId:"gad7", date:"2025-04-10", answers:[1,1,1,1,0,1,0], total:5 },
  ]},
  { id:"p2", name:"Carlos Rodríguez", age:45, email:"carlos@email.com", evaluations:[
    { id:"e6", testId:"gad7", date:"2025-02-05", answers:[2,2,2,3,1,2,1], total:13 },
    { id:"e7", testId:"gad7", date:"2025-04-01", answers:[1,1,2,2,1,1,1], total:9 },
    { id:"e8", testId:"audit", date:"2025-03-10", answers:[2,2,1,1,0,0,1,0,0,1], total:8 },
  ]},
];

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
async function generateReport(patient, evaluation, testDef) {
  const sr = testDef.score(evaluation.total);
  const max = testDef.maxScore;
  const prevEvals = patient.evaluations.filter(e => e.testId === evaluation.testId && e.id !== evaluation.id).sort((a,b)=>a.date.localeCompare(b.date));
  const prevEval = prevEvals.length > 0 ? prevEvals[prevEvals.length-1] : null;
  const semaforo = getSemaforo(evaluation.testId, evaluation.total, prevEval?.total ?? null, evaluation.answers);
  const nextActions = getNextActions(evaluation.testId, evaluation.total, semaforo, evaluation.answers);
  const trend = prevEval
    ? `Evaluación previa: ${prevEval.total} pts (${prevEval.date}). Cambio: ${evaluation.total - prevEval.total > 0 ? "+" : ""}${evaluation.total - prevEval.total} pts — ${semaforo.worsening ? "EMPEORAMIENTO CLÍNICAMENTE RELEVANTE" : evaluation.total < prevEval.total ? "mejoría clínica" : "sin cambio significativo"}.`
    : "Primera evaluación registrada.";
  const catLabel = CATEGORIES[testDef.category].label;
  const suicideAlert = (evaluation.testId==="phq9" && evaluation.answers?.[8]>=2) || (evaluation.testId==="bdi2" && evaluation.answers?.[8]>=2);

  const prompt = `Eres un asistente clínico especializado en salud mental. Genera un informe clínico profesional en español.

Paciente: ${patient.name}, ${patient.age} años
Instrumento: ${testDef.fullName} (${testDef.name})
Área: ${catLabel}
Puntaje: ${evaluation.total}/${max} — ${sr.level}
Alerta: ${semaforo.label} — ${semaforo.desc}
Fecha: ${evaluation.date}
${trend}
${suicideAlert ? "ALERTA URGENTE: Presencia de ideación suicida reportada." : ""}

El informe debe incluir:
1. Resumen ejecutivo (2-3 oraciones)
2. Interpretación clínica del puntaje
3. ${semaforo.worsening ? "Análisis del empeoramiento respecto de la medición previa" : "Áreas de atención prioritaria"}
4. 3-4 líneas terapéuticas basadas en evidencia
5. Próximas acciones sugeridas (aclarar que requieren validación profesional): ${nextActions.join("; ")}

Tono clínico, empático, basado en evidencia. Máximo 420 palabras.`;

  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1200, messages:[{role:"user",content:prompt}] })
  });
  const data = await r.json();
  return data.content?.[0]?.text || "No se pudo generar el informe.";
}

// ─── SEMÁFORO CLÍNICO ────────────────────────────────────────────────────────
function getSemaforo(testId, total, prevTotal, answers) {
  const td = TESTS[testId];
  const pct = total / td.maxScore;
  const suicideRisk = (testId==="phq9" && answers?.[8]>=2) || (testId==="bdi2" && answers?.[8]>=2);
  if(suicideRisk) return { color:"#ef4444", label:"Rojo", desc:"Riesgo suicida detectado — evaluación urgente", emoji:"🔴" };
  if(prevTotal !== null && prevTotal !== undefined) {
    const pctDelta = (total - prevTotal) / td.maxScore;
    if(pctDelta >= 0.15) return { color:"#f97316", label:"Naranja", desc:"Cambio clínicamente relevante respecto de medición previa", emoji:"🟠", delta: total - prevTotal, worsening:true };
  }
  if(pct >= 0.75) return { color:"#ef4444", label:"Rojo", desc:"Severidad alta — intervención urgente recomendada", emoji:"🔴" };
  if(pct >= 0.50) return { color:"#f97316", label:"Naranja", desc:"Severidad moderada-alta — seguimiento activo", emoji:"🟠" };
  if(pct >= 0.25) return { color:"#fbbf24", label:"Amarillo", desc:"Síntomas leves a moderados — monitoreo recomendado", emoji:"🟡" };
  return { color:"#22c55e", label:"Verde", desc:"Sin alerta clínica relevante", emoji:"🟢" };
}

function getNextActions(testId, total, semaforo, answers) {
  const td = TESTS[testId];
  const pct = total / td.maxScore;
  const suicideRisk = (testId==="phq9" && answers?.[8]>=2) || (testId==="bdi2" && answers?.[8]>=2);
  const actions = [];
  if(suicideRisk) actions.push("Evaluar riesgo suicida de forma inmediata");
  if(semaforo.worsening) actions.push("Intensificar seguimiento — cambio clínicamente relevante detectado");
  if(pct >= 0.75) actions.push("Considerar interconsulta o derivación especializada");
  if(pct >= 0.5) actions.push("Indicar entrevista clínica en los próximos 7 días");
  if(td.category==="depresion") { if(pct>=0.5) actions.push("Explorar bipolaridad y descartar causas orgánicas"); actions.push("Repetir escala en 14 días"); if(pct>=0.35) actions.push("Iniciar módulo psicoeducativo sobre depresión"); }
  if(td.category==="ansiedad") { actions.push("Evaluar calidad del sueño asociada"); actions.push("Repetir escala en 14 días"); }
  if(td.category==="trauma") { actions.push("Explorar red de apoyo y recursos de afrontamiento"); if(pct>=0.4) actions.push("Evaluar indicación de psicoterapia orientada al trauma"); }
  if(td.category==="sustancias") { if(pct>=0.5) actions.push("Evaluar adherencia y motivación al cambio"); actions.push("Aplicar entrevista motivacional breve"); }
  if(td.category==="sueno") { actions.push("Revisar higiene del sueño y factores mantenedores"); if(pct>=0.5) actions.push("Considerar derivación a estudio de sueño"); }
  if(td.category==="cognicion") { if(pct<0.7) actions.push("Aplicar evaluación neuropsicológica completa"); actions.push("Evaluar factores reversibles (medicación, sueño, depresión)"); }
  if(td.category==="bipolar") { if(pct>=0.4) actions.push("Evaluar estado de ánimo actual y ciclicidad"); actions.push("Revisar adherencia farmacológica"); }
  if(td.category==="toc") { if(pct>=0.4) actions.push("Considerar TCC con exposición y prevención de respuesta"); }
  if(td.category==="personalidad") { actions.push("Explorar historia vincular y patrones relacionales"); }
  if(actions.length===0) actions.push("Repetir escala según protocolo habitual");
  return [...new Set(actions)].slice(0,4);
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
const CatTag = ({cat}) => <span style={{
  background: CATEGORIES[cat].color+"22", color: CATEGORIES[cat].color,
  border:`1px solid ${CATEGORIES[cat].color}44`,
  borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700,
  letterSpacing:1, textTransform:"uppercase"
}}>{CATEGORIES[cat].label}</span>;

const TestTag = ({test}) => <span style={{
  background: CATEGORIES[test.category].color+"22", color: CATEGORIES[test.category].color,
  border:`1px solid ${CATEGORIES[test.category].color}44`,
  borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700,
  letterSpacing:1, fontFamily:"monospace"
}}>{test.name}</span>;

const ScoreMeter = ({total,max,sr}) => {
  const pct = Math.round((total/max)*100);
  return (
    <div style={{margin:"14px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:13,color:"#94a3b8"}}>Puntaje: <strong style={{color:"#e2e8f0"}}>{total}/{max}</strong></span>
        <span style={{fontSize:13,fontWeight:700,color:sr.color}}>{sr.level}</span>
      </div>
      <div style={{background:"#1e293b",borderRadius:99,height:7,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:sr.color,borderRadius:99,transition:"width 1s ease"}}/>
      </div>
      <p style={{fontSize:12,color:"#64748b",marginTop:5}}>{sr.desc}</p>
    </div>
  );
};

function EvolutionChart({patient,testId}) {
  const evals = patient.evaluations.filter(e=>e.testId===testId).sort((a,b)=>a.date.localeCompare(b.date));
  if(evals.length<2) return <p style={{color:"#475569",fontSize:13,textAlign:"center",padding:20}}>Se necesitan al menos 2 evaluaciones para ver evolución.</p>;
  const td = TESTS[testId];
  const W=340,H=140,pad=36;
  const max=td.maxScore;
  const xs=evals.map((_,i)=>pad+(i/(evals.length-1))*(W-pad*2));
  const ys=evals.map(e=>H-pad-((e.total/max)*(H-pad*2)));
  const path=xs.map((x,i)=>`${i===0?"M":"L"} ${x} ${ys[i]}`).join(" ");
  const catColor=CATEGORIES[td.category].color;
  return (
    <div style={{background:"#0f172a",borderRadius:12,padding:16,marginTop:12}}>
      <p style={{fontSize:12,color:"#64748b",marginBottom:8,textAlign:"center"}}>Evolución — {td.name}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxHeight:140}}>
        {[0,.25,.5,.75,1].map(v=>(
          <line key={v} x1={pad} y1={H-pad-v*(H-pad*2)} x2={W-pad} y2={H-pad-v*(H-pad*2)} stroke="#1e293b" strokeWidth={1}/>
        ))}
        <path d={path} fill="none" stroke={catColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        {evals.map((e,i)=>{
          const sr=td.score(e.total);
          return (
            <g key={e.id}>
              <circle cx={xs[i]} cy={ys[i]} r={6} fill={sr.color}/>
              <text x={xs[i]} y={H-4} textAnchor="middle" fontSize={9} fill="#64748b">{e.date.slice(5)}</text>
              <text x={xs[i]} y={ys[i]-12} textAnchor="middle" fontSize={11} fill="#e2e8f0" fontWeight="600">{e.total}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── PATIENT TEST VIEW ────────────────────────────────────────────────────────
function PatientTestView({testId,patientName,onComplete}) {
  const test=TESTS[testId];
  const cat=CATEGORIES[test.category];
  const [answers,setAnswers]=useState(Array(test.questions.length).fill(null));
  const [submitted,setSubmitted]=useState(false);
  const allAnswered=answers.every(a=>a!==null);
  const total=answers.reduce((s,a)=>s+(a??0),0);
  const sr=test.score(total);
  return (
    <div style={{minHeight:"100vh",background:"#070c18",display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <div style={{width:"100%",maxWidth:560}}>
        <div style={{marginBottom:28,textAlign:"center"}}>
          <CatTag cat={test.category}/>
          <h1 style={{color:"#f1f5f9",fontFamily:"'DM Serif Display'",fontSize:26,margin:"12px 0 4px"}}>{test.fullName}</h1>
          <p style={{color:"#64748b",fontSize:13}}>Hola, <strong style={{color:"#94a3b8"}}>{patientName}</strong> · {test.duration}</p>
        </div>
        {!submitted ? (
          <>
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:18,marginBottom:20}}>
              <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.6,margin:0}}>{test.instructions}</p>
            </div>
            {test.questions.map((q,qi)=>(
              <div key={qi} style={{background:"#0f172a",border:`1px solid ${answers[qi]!==null?cat.color+"55":"#1e293b"}`,borderRadius:14,padding:18,marginBottom:10,transition:"border-color 0.3s"}}>
                <p style={{color:"#e2e8f0",fontSize:14,margin:"0 0 14px",lineHeight:1.5}}>
                  <span style={{color:cat.color,fontWeight:700,marginRight:8}}>{qi+1}.</span>{q}
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {test.options.map(opt=>(
                    <button key={opt.value} onClick={()=>{const n=[...answers];n[qi]=opt.value;setAnswers(n);}} style={{
                      background:answers[qi]===opt.value?cat.color+"33":"transparent",
                      border:`1px solid ${answers[qi]===opt.value?cat.color:"#334155"}`,
                      borderRadius:9,padding:"9px 14px",color:answers[qi]===opt.value?"#f1f5f9":"#94a3b8",
                      cursor:"pointer",textAlign:"left",fontSize:13,transition:"all 0.2s",fontFamily:"inherit"
                    }}>{opt.label}</button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{textAlign:"center",marginTop:20}}>
              <p style={{color:"#64748b",fontSize:12,marginBottom:14}}>{answers.filter(a=>a!==null).length}/{test.questions.length} respondidas</p>
              <button onClick={()=>setSubmitted(true)} disabled={!allAnswered} style={{
                background:allAnswered?cat.color:"#1e293b",color:allAnswered?"#fff":"#475569",
                border:"none",borderRadius:11,padding:"13px 36px",fontSize:15,fontWeight:600,
                cursor:allAnswered?"pointer":"not-allowed",fontFamily:"inherit",transition:"all 0.3s"
              }}>Enviar respuestas →</button>
            </div>
          </>
        ) : (
          <div style={{textAlign:"center"}}>
            <div style={{background:"#0f172a",border:`1px solid ${sr.color}44`,borderRadius:20,padding:32}}>
              <div style={{width:70,height:70,borderRadius:"50%",background:sr.color+"22",border:`3px solid ${sr.color}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:28}}>✓</div>
              <h2 style={{color:"#f1f5f9",fontFamily:"'DM Serif Display'",fontSize:22,margin:"0 0 8px"}}>Evaluación completada</h2>
              <p style={{color:"#64748b",fontSize:13,marginBottom:22}}>Tu profesional recibirá los resultados y se contactará contigo.</p>
              <div style={{background:sr.color+"11",borderRadius:11,padding:14,border:`1px solid ${sr.color}33`}}>
                <p style={{color:sr.color,fontWeight:700,fontSize:17,margin:"0 0 4px"}}>Puntaje: {total}</p>
                <p style={{color:"#94a3b8",fontSize:13,margin:0}}>{sr.level}</p>
              </div>
            </div>
            <button onClick={()=>onComplete(answers,total)} style={{marginTop:18,background:"transparent",border:"1px solid #334155",borderRadius:9,padding:"9px 22px",color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
              ← Volver al panel (demo)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [patients,setPatients]=useState(MOCK_PATIENTS);
  const [view,setView]=useState("dashboard");
  const [selectedPatientId,setSelectedPatientId]=useState(null);
  const [report,setReport]=useState(null);
  const [simulatingTest,setSimulatingTest]=useState(null);
  const [assignTest,setAssignTest]=useState(null);
  const [linkCopied,setLinkCopied]=useState(false);
  const [activeTab,setActiveTab]=useState("evaluaciones");
  const [showNewPatient,setShowNewPatient]=useState(false);
  const [newForm,setNewForm]=useState({name:"",age:"",email:""});
  const [catFilter,setCatFilter]=useState("all");
  const [searchTest,setSearchTest]=useState("");
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [assignDropdownOpen,setAssignDropdownOpen]=useState(false);
  const [reportStatus,setReportStatus]=useState({});
  const [professionalName,setProfessionalName]=useState("");
  const [pdfLoading,setPdfLoading]=useState(false);

  const currentPatient = selectedPatientId ? patients.find(p=>p.id===selectedPatientId) : null;

  const handleCompleteTest=(patientId,testId,answers,total)=>{
    const today=new Date().toISOString().slice(0,10);
    const newEval={id:"e"+Date.now(),testId,date:today,answers,total};
    setPatients(prev=>prev.map(p=>p.id===patientId?{...p,evaluations:[...p.evaluations,newEval]}:p));
    setSimulatingTest(null);
    setView("patient");
  };

  const handleGenerateReport=async(patient,ev)=>{
    const td=TESTS[ev.testId];
    const prevEvals=patient.evaluations.filter(e=>e.testId===ev.testId&&e.id!==ev.id).sort((a,b)=>a.date.localeCompare(b.date));
    const prevEval=prevEvals.length>0?prevEvals[prevEvals.length-1]:null;
    const semaforo=getSemaforo(ev.testId,ev.total,prevEval?.total??null,ev.answers);
    const nextActions=getNextActions(ev.testId,ev.total,semaforo,ev.answers);
    setReport({loading:true,text:null,ev,patient,semaforo,nextActions});
    try {
      const text=await generateReport(patient,ev,td);
      setReport(r=>({...r,loading:false,text}));
      setReportStatus(s=>({...s,[ev.id]: s[ev.id] || "generado"}));
    } catch { setReport(r=>({...r,loading:false,text:"Error al generar el informe."})); }
  };

  const handleAddPatient=()=>{
    if(!newForm.name) return;
    const p={id:"p"+Date.now(),...newForm,age:parseInt(newForm.age)||0,evaluations:[]};
    setPatients(prev=>[...prev,p]);
    setNewForm({name:"",age:"",email:""});
    setShowNewPatient(false);
  };

  if(simulatingTest) return <PatientTestView testId={simulatingTest.testId} patientName={simulatingTest.patientName} onComplete={(a,t)=>handleCompleteTest(simulatingTest.patientId,simulatingTest.testId,a,t)}/>;

  const S={
    app:{minHeight:"100vh",background:"#070c18",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",display:"flex"},
    sidebar:{width:230,background:"#0a0f1e",borderRight:"1px solid #1e293b",display:"flex",flexDirection:"column",padding:"20px 14px",position:"fixed",top:0,left:0,height:"100vh",zIndex:10,overflowY:"auto"},
    main:{marginLeft:230,padding:"28px 36px",minHeight:"100vh",flex:1,maxWidth:"calc(100vw - 230px)"},
    card:{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:22},
    btn:(c="#3b82f6")=>({background:c,color:"#fff",border:"none",borderRadius:9,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}),
    ghost:{background:"transparent",color:"#94a3b8",border:"1px solid #334155",borderRadius:9,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"},
    label:{fontSize:10,fontWeight:700,letterSpacing:2,color:"#475569",textTransform:"uppercase"},
  };

  const filteredTests=Object.values(TESTS).filter(t=>{
    const matchCat=catFilter==="all"||t.category===catFilter;
    const matchSearch=t.name.toLowerCase().includes(searchTest.toLowerCase())||t.fullName.toLowerCase().includes(searchTest.toLowerCase());
    return matchCat&&matchSearch;
  });

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} * { box-sizing: border-box; }`}</style>

      {/* ── MODALS ── */}
      {assignTest && (
        <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...S.card,maxWidth:420,width:"90%",animation:"fadeIn 0.2s ease"}}>
            <h3 style={{color:"#f1f5f9",margin:"0 0 4px",fontFamily:"'DM Serif Display'"}}>Enviar test al paciente</h3>
            <p style={{color:"#64748b",fontSize:13,marginBottom:18}}>Compartí este link con <strong style={{color:"#94a3b8"}}>{assignTest.patientName}</strong></p>
            <TestTag test={TESTS[assignTest.testId]}/>
            <div style={{background:"#070c18",borderRadius:9,padding:12,margin:"14px 0",border:"1px solid #334155",wordBreak:"break-all"}}>
              <span style={{color:"#64748b",fontSize:11,fontFamily:"monospace"}}>
                https://app.ecomarku.com/test/{assignTest.testId}?pid={assignTest.patientId}&token=demo
              </span>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <button style={{...S.btn("#25D366"),flex:1,fontSize:13}} onClick={()=>{setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2000);}}>📱 WhatsApp</button>
              <button style={{...S.btn("#3b82f6"),flex:1,fontSize:13}} onClick={()=>{setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2000);}}>✉️ Email</button>
            </div>
            {linkCopied&&<p style={{color:"#22c55e",fontSize:12,textAlign:"center",margin:"0 0 12px"}}>✓ Link copiado</p>}
            <div style={{borderTop:"1px solid #1e293b",paddingTop:14,display:"flex",gap:8}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>setAssignTest(null)}>Cancelar</button>
              <button style={{...S.btn("#7c3aed"),flex:1,fontSize:12}} onClick={()=>{setAssignTest(null);setSimulatingTest({testId:assignTest.testId,patientId:assignTest.patientId,patientName:assignTest.patientName});}}>
                🧪 Simular como paciente
              </button>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div style={{position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{...S.card,maxWidth:600,width:"100%",maxHeight:"90vh",overflow:"auto",animation:"fadeIn 0.2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:16}}>
              <div>
                <h3 style={{color:"#f1f5f9",margin:"0 0 4px",fontFamily:"'DM Serif Display'",fontSize:20}}>Informe clínico</h3>
                <p style={{color:"#64748b",fontSize:12,margin:0}}>Generado con IA · Claude Sonnet</p>
              </div>
              <button style={{...S.ghost,padding:"4px 10px"}} onClick={()=>setReport(null)}>✕</button>
            </div>

            {/* Semáforo */}
            {report.semaforo && (
              <div style={{background:report.semaforo.color+"18",border:`1px solid ${report.semaforo.color}44`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>{report.semaforo.emoji}</span>
                <div>
                  <p style={{margin:0,fontSize:13,fontWeight:700,color:report.semaforo.color}}>{report.semaforo.label}</p>
                  <p style={{margin:0,fontSize:12,color:"#94a3b8"}}>{report.semaforo.desc}</p>
                </div>
              </div>
            )}

            {report.loading ? (
              <div style={{textAlign:"center",padding:40}}>
                <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #1e293b",borderTopColor:"#7c3aed",margin:"0 auto 14px",animation:"spin 1s linear infinite"}}/>
                <p style={{color:"#64748b",fontSize:13}}>Generando informe con IA…</p>
              </div>
            ) : (
              <>
                <div style={{background:"#070c18",borderRadius:11,padding:18,border:"1px solid #1e293b",fontSize:13,lineHeight:1.9,color:"#cbd5e1",whiteSpace:"pre-wrap",marginBottom:14}}>
                  {report.text}
                </div>

                {/* Próximas acciones */}
                {report.nextActions && report.nextActions.length > 0 && (
                  <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:11,padding:16,marginBottom:14}}>
                    <p style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#475569",textTransform:"uppercase",margin:"0 0 10px"}}>Próxima acción sugerida</p>
                    <p style={{fontSize:11,color:"#475569",margin:"0 0 10px",fontStyle:"italic"}}>Sugerencias automáticas — requieren validación profesional</p>
                    {report.nextActions.map((a,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"start",gap:8,marginBottom:7}}>
                        <span style={{color:"#7c3aed",fontSize:14,marginTop:1}}>→</span>
                        <p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{a}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Validación profesional */}
                {report.ev && (
                  <div style={{borderTop:"1px solid #1e293b",paddingTop:14}}>
                    <p style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#475569",textTransform:"uppercase",margin:"0 0 10px"}}>Estado del informe</p>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                      {[
                        {id:"generado",label:"Generado",color:"#64748b"},
                        {id:"revisado",label:"Revisado",color:"#3b82f6"},
                        {id:"corregido",label:"Corregido",color:"#f59e0b"},
                        {id:"firmado",label:"Firmado",color:"#22c55e"},
                        {id:"archivado",label:"Archivado",color:"#475569"},
                      ].map(s=>{
                        const active = (reportStatus[report.ev.id] || "generado") === s.id;
                        return (
                          <button key={s.id} onClick={()=>setReportStatus(prev=>({...prev,[report.ev.id]:s.id}))} style={{
                            background: active ? s.color+"33" : "transparent",
                            border: `1px solid ${active ? s.color : "#334155"}`,
                            borderRadius:8, padding:"6px 14px",
                            color: active ? s.color : "#64748b",
                            cursor:"pointer", fontSize:12, fontFamily:"inherit",
                            fontWeight: active ? 700 : 400
                          }}>{s.label}</button>
                        );
                      })}
                    </div>
                    {/* Professional name for signature */}
                    <div style={{marginBottom:12}}>
                      <p style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#475569",textTransform:"uppercase",margin:"0 0 6px"}}>Nombre del profesional (para firma)</p>
                      <input
                        placeholder="Dr./Dra. Nombre Apellido — Matrícula"
                        value={professionalName}
                        onChange={e=>setProfessionalName(e.target.value)}
                        style={{width:"100%",background:"#070c18",border:"1px solid #334155",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:13,fontFamily:"inherit",boxSizing:"border-box"}}
                      />
                    </div>
                    {reportStatus[report.ev.id]==="firmado" && (
                      <p style={{fontSize:11,color:"#22c55e",marginBottom:12}}>✓ Firmado — {professionalName || "profesional"} · {new Date().toLocaleDateString("es-AR")}</p>
                    )}
                    {/* PDF Download button */}
                    <button
                      disabled={pdfLoading || !report.text}
                      onClick={async()=>{
                        setPdfLoading(true);
                        try {
                          await exportReportPDF(
                            report.patient, report.ev, TESTS[report.ev.testId],
                            report.text, report.semaforo, report.nextActions,
                            reportStatus[report.ev.id]||"generado", professionalName
                          );
                        } finally { setPdfLoading(false); }
                      }}
                      style={{
                        width:"100%",background:pdfLoading?"#1e293b":"#7c3aed",
                        color:pdfLoading?"#475569":"#fff",border:"none",borderRadius:10,
                        padding:"12px",fontSize:14,fontWeight:700,cursor:pdfLoading?"not-allowed":"pointer",
                        fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8
                      }}>
                      {pdfLoading ? "Generando PDF…" : "⬇ Descargar informe PDF"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showNewPatient && (
        <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...S.card,maxWidth:380,width:"90%",animation:"fadeIn 0.2s ease"}}>
            <h3 style={{color:"#f1f5f9",margin:"0 0 18px",fontFamily:"'DM Serif Display'"}}>Nuevo paciente</h3>
            {[["name","Nombre completo","text"],["age","Edad","number"],["email","Email","email"]].map(([f,l,t])=>(
              <div key={f} style={{marginBottom:12}}>
                <p style={{...S.label,marginBottom:5}}>{l}</p>
                <input type={t} value={newForm[f]} onChange={e=>setNewForm(p=>({...p,[f]:e.target.value}))} style={{width:"100%",background:"#070c18",border:"1px solid #334155",borderRadius:9,padding:"9px 12px",color:"#e2e8f0",fontSize:13,fontFamily:"inherit"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:18}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>setShowNewPatient(false)}>Cancelar</button>
              <button style={{...S.btn(),flex:1}} onClick={handleAddPatient}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <div style={S.sidebar}>
        <div style={{marginBottom:28}}>
          <svg viewBox="0 0 200 54" width="170" style={{display:"block",marginBottom:4}}>
            <line x1="22" y1="8"  x2="36" y2="32" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.6"/>
            <line x1="22" y1="8"  x2="8"  y2="32" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.6"/>
            <line x1="8"  y1="32" x2="36" y2="32" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.6"/>
            <line x1="22" y1="8"  x2="22" y2="22" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.35"/>
            <line x1="8"  y1="32" x2="22" y2="22" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.35"/>
            <line x1="36" y1="32" x2="22" y2="22" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.35"/>
            <circle cx="22" cy="22" r="3.5" fill="#AFA9EC" opacity="0.25"/>
            <circle cx="22" cy="22" r="2" fill="#7F77DD"/>
            <circle cx="22" cy="8"  r="2" fill="#7F77DD"/>
            <circle cx="8"  cy="32" r="2" fill="#7F77DD"/>
            <circle cx="36" cy="32" r="2" fill="#7F77DD"/>
            <circle cx="22" cy="20" r="13" fill="none" stroke="#7F77DD" strokeWidth="1" strokeDasharray="60 20" strokeDashoffset="-5" strokeLinecap="round"/>
            <text x="50" y="34" fontFamily="system-ui,sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5" fill="#ffffff">COGN</text>
            <text x="146" y="34" fontFamily="system-ui,sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5" fill="#AFA9EC">IA</text>
          </svg>
          <p style={{fontSize:10,fontWeight:600,letterSpacing:3,color:"#475569",textTransform:"uppercase",margin:0}}>salud mental</p>
        </div>

        {[{id:"dashboard",label:"Panel",icon:"◈"},{id:"tests",label:"Tests",icon:"◎"}].map(item=>(
          <button key={item.id} onClick={()=>setView(item.id)} style={{
            background:view===item.id?"#1e293b":"transparent",border:"none",borderRadius:9,
            padding:"9px 12px",color:view===item.id?"#e2e8f0":"#64748b",cursor:"pointer",
            textAlign:"left",fontSize:13,fontFamily:"inherit",display:"flex",gap:9,
            alignItems:"center",marginBottom:3,width:"100%"
          }}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}

        <div style={{margin:"20px 0 8px"}}>
          <p style={{...S.label,paddingLeft:12,marginBottom:7}}>Pacientes</p>
        </div>
        {patients.map(p=>(
          <button key={p.id} onClick={()=>{setSelectedPatientId(p.id);setView("patient");setReport(null);setActiveTab("evaluaciones");}} style={{
            background:(view==="patient"&&selectedPatientId===p.id)?"#1e293b":"transparent",
            border:"none",borderRadius:9,padding:"7px 12px",
            color:(view==="patient"&&selectedPatientId===p.id)?"#e2e8f0":"#64748b",
            cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"inherit",
            marginBottom:2,width:"100%",display:"flex",alignItems:"center",gap:9
          }}>
            <span style={{width:22,height:22,borderRadius:"50%",background:"#1e293b",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#3b82f6",flexShrink:0}}>
              {p.name.split(" ").map(x=>x[0]).join("").slice(0,2)}
            </span>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
          </button>
        ))}
        <button onClick={()=>setShowNewPatient(true)} style={{background:"transparent",border:"1px dashed #334155",borderRadius:9,padding:"7px 12px",color:"#475569",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"inherit",marginTop:6,width:"100%"}}>
          + Nuevo paciente
        </button>
      </div>

      {/* ── MAIN ── */}
      <div style={S.main}>

        {/* DASHBOARD */}
        {view==="dashboard" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>Panel general</h1>
            <p style={{color:"#64748b",fontSize:13,marginBottom:28}}>Resumen de actividad clínica</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
              {[
                {label:"Pacientes",value:patients.length,color:"#3b82f6"},
                {label:"Evaluaciones",value:patients.reduce((s,p)=>s+p.evaluations.length,0),color:"#8b5cf6"},
                {label:"Tests disponibles",value:Object.keys(TESTS).length,color:"#22c55e"},
              ].map(st=>(
                <div key={st.label} style={S.card}>
                  <p style={{...S.label,marginBottom:10}}>{st.label}</p>
                  <p style={{fontSize:38,fontFamily:"'DM Serif Display'",color:st.color,margin:0}}>{st.value}</p>
                </div>
              ))}
            </div>
            <h2 style={{color:"#64748b",fontSize:14,fontWeight:600,marginBottom:14}}>Últimas evaluaciones</h2>
            <div style={S.card}>
              {patients.flatMap(p=>p.evaluations.map(e=>({...e,patient:p}))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(e=>{
                const td=TESTS[e.testId]; const sr=td.score(e.total);
                const prevEv=e.patient.evaluations.filter(x=>x.testId===e.testId&&x.id!==e.id).sort((a,b)=>a.date.localeCompare(b.date));
                const prev=prevEv.length>0?prevEv[prevEv.length-1]:null;
                const sem=getSemaforo(e.testId,e.total,prev?.total??null,e.answers);
                return (
                  <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #1e293b"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:16}}>{sem.emoji}</span>
                      <TestTag test={td}/>
                      <div>
                        <p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{e.patient.name}</p>
                        <p style={{margin:0,fontSize:11,color:"#475569"}}>{e.date}</p>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{margin:0,fontSize:13,fontWeight:700,color:sr.color}}>{sr.level}</p>
                      <p style={{margin:0,fontSize:11,color:"#475569"}}>Puntaje: {e.total}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TESTS */}
        {view==="tests" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>Tests disponibles</h1>
            <p style={{color:"#64748b",fontSize:13,marginBottom:24}}>
              {Object.keys(TESTS).length} instrumentos validados en {Object.keys(CATEGORIES).length} categorías
            </p>

            {/* search */}
            <input placeholder="Buscar test…" value={searchTest} onChange={e=>setSearchTest(e.target.value)} style={{
              width:"100%",maxWidth:340,background:"#0f172a",border:"1px solid #334155",
              borderRadius:10,padding:"9px 14px",color:"#e2e8f0",fontSize:13,
              fontFamily:"inherit",marginBottom:18
            }}/>

            {/* category filter */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
              <button onClick={()=>setCatFilter("all")} style={{...S.ghost,background:catFilter==="all"?"#1e293b":"transparent",color:catFilter==="all"?"#e2e8f0":"#64748b",borderRadius:20,padding:"5px 14px",fontSize:12}}>
                Todas
              </button>
              {Object.entries(CATEGORIES).map(([k,c])=>(
                <button key={k} onClick={()=>setCatFilter(k)} style={{
                  background:catFilter===k?c.color+"33":"transparent",
                  border:`1px solid ${catFilter===k?c.color:"#334155"}`,
                  borderRadius:20,padding:"5px 14px",color:catFilter===k?c.color:"#64748b",
                  cursor:"pointer",fontFamily:"inherit",fontSize:12
                }}>{c.label}</button>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
              {filteredTests.map(test=>{
                const cat=CATEGORIES[test.category];
                return (
                  <div key={test.id} style={{...S.card,borderTopWidth:3,borderTopColor:cat.color}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}>
                      <TestTag test={test}/>
                      <span style={{fontSize:11,color:"#475569"}}>{test.duration}</span>
                    </div>
                    <p style={{color:"#f1f5f9",fontSize:14,fontWeight:600,margin:"8px 0 4px"}}>{test.fullName}</p>
                    <CatTag cat={test.category}/>
                    <p style={{color:"#475569",fontSize:12,margin:"10px 0 0"}}>{test.questions.length} preguntas · máx. {test.maxScore} pts</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PATIENT */}
        {view==="patient" && currentPatient && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"start",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:14}}>
              <div>
                <p style={{...S.label,marginBottom:3}}>Paciente</p>
                <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>{currentPatient.name}</h1>
                <p style={{color:"#64748b",fontSize:13}}>{currentPatient.age} años · {currentPatient.email}</p>
              </div>

              {/* Assign test dropdown */}
              <div style={{position:"relative"}}>
                <button style={{...S.btn("#3b82f6"),fontSize:13}} onClick={()=>setAssignDropdownOpen(v=>!v)}>
                  + Asignar test ▾
                </button>
                {assignDropdownOpen && (
                  <div style={{
                    position:"absolute",right:0,top:"110%",background:"#0f172a",
                    border:"1px solid #334155",borderRadius:12,padding:8,
                    zIndex:50,minWidth:220,maxHeight:360,overflowY:"auto",
                    boxShadow:"0 20px 40px #0008"
                  }}>
                    {Object.entries(CATEGORIES).map(([catKey,cat])=>{
                      const catTests=Object.values(TESTS).filter(t=>t.category===catKey);
                      return (
                        <div key={catKey}>
                          <p style={{...S.label,padding:"8px 10px 4px",margin:0}}>{cat.label}</p>
                          {catTests.map(t=>(
                            <button key={t.id} onClick={()=>{
                              setAssignDropdownOpen(false);
                              setAssignTest({testId:t.id,patientId:currentPatient.id,patientName:currentPatient.name});
                            }} style={{
                              display:"block",width:"100%",background:"transparent",
                              border:"none",borderRadius:7,padding:"7px 10px",
                              color:"#94a3b8",cursor:"pointer",textAlign:"left",
                              fontSize:12,fontFamily:"inherit"
                            }}
                            onMouseEnter={e=>e.target.style.background="#1e293b"}
                            onMouseLeave={e=>e.target.style.background="transparent"}>
                              <span style={{color:cat.color,fontWeight:700,marginRight:6}}>{t.name}</span>
                              {t.fullName}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:2,marginBottom:22,borderBottom:"1px solid #1e293b"}}>
              {["evaluaciones","evolución"].map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} style={{
                  background:"transparent",border:"none",
                  borderBottom:`2px solid ${activeTab===tab?"#3b82f6":"transparent"}`,
                  color:activeTab===tab?"#3b82f6":"#64748b",
                  padding:"9px 18px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:600
                }}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
              ))}
            </div>

            {activeTab==="evaluaciones" && (
              <div>
                {currentPatient.evaluations.length===0 ? (
                  <div style={{...S.card,textAlign:"center",padding:48}}>
                    <p style={{color:"#475569",fontSize:14}}>Sin evaluaciones todavía. Asigná un test arriba.</p>
                  </div>
                ) : (
                  [...currentPatient.evaluations].sort((a,b)=>b.date.localeCompare(a.date)).map((ev,idx,arr)=>{
                    const td=TESTS[ev.testId]; const sr=td.score(ev.total);
                    const prevEvalsSorted=arr.filter(e=>e.testId===ev.testId&&e.id!==ev.id).sort((a,b)=>a.date.localeCompare(b.date));
                    const prevEval=prevEvalsSorted.length>0?prevEvalsSorted[prevEvalsSorted.length-1]:null;
                    const sem=getSemaforo(ev.testId,ev.total,prevEval?.total??null,ev.answers);
                    const status=reportStatus[ev.id];
                    return (
                      <div key={ev.id} style={{...S.card,marginBottom:14,borderColor:sem.color+"33",borderLeftWidth:3,borderLeftColor:sem.color}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:10}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                            <TestTag test={td}/>
                            <span style={{color:"#475569",fontSize:12}}>{ev.date}</span>
                            <span style={{fontSize:16}} title={sem.desc}>{sem.emoji}</span>
                            {sem.worsening && <span style={{background:"#f97316"+"22",color:"#f97316",border:"1px solid #f9731644",borderRadius:6,padding:"1px 8px",fontSize:11,fontWeight:700}}>↑ Empeoramiento</span>}
                            {status && status!=="generado" && <span style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:6,padding:"1px 8px",fontSize:11,fontWeight:700}}>{status.charAt(0).toUpperCase()+status.slice(1)}</span>}
                          </div>
                          <button style={{...S.btn("#7c3aed"),fontSize:12}} onClick={()=>handleGenerateReport(currentPatient,ev)}>
                            ✦ Informe IA
                          </button>
                        </div>
                        <ScoreMeter total={ev.total} max={td.maxScore} sr={sr}/>
                        {sem.color==="#ef4444" && <div style={{background:"#ef444418",border:"1px solid #ef444444",borderRadius:8,padding:"8px 12px",marginTop:8}}><p style={{margin:0,fontSize:12,color:"#ef4444",fontWeight:600}}>{sem.desc}</p></div>}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab==="evolución" && (
              <div>
                {[...new Set(currentPatient.evaluations.map(e=>e.testId))].map(testId=>(
                  <div key={testId} style={{...S.card,marginBottom:14}}>
                    <TestTag test={TESTS[testId]}/>
                    <EvolutionChart patient={currentPatient} testId={testId}/>
                  </div>
                ))}
                {currentPatient.evaluations.length===0 && (
                  <div style={{...S.card,textAlign:"center",padding:48}}>
                    <p style={{color:"#475569",fontSize:14}}>Sin datos de evolución todavía.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
