import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const TESTS = {
  phq9: {
    id: "phq9",
    name: "PHQ-9",
    fullName: "Patient Health Questionnaire-9",
    area: "Depresión",
    color: "#4A90D9",
    duration: "3-5 min",
    instructions: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
    options: [
      { label: "Para nada", value: 0 },
      { label: "Varios días", value: 1 },
      { label: "Más de la mitad de los días", value: 2 },
      { label: "Casi todos los días", value: 3 },
    ],
    questions: [
      "Poco interés o placer en hacer cosas",
      "Sentirse decaído/a, deprimido/a o sin esperanza",
      "Dificultad para dormir o dormir demasiado",
      "Sentirse cansado/a o con poca energía",
      "Poco apetito o comer en exceso",
      "Sentirse mal consigo mismo/a, o sentir que es un fracaso o que ha fallado a sí mismo/a o a su familia",
      "Dificultad para concentrarse en cosas como leer el periódico o ver la televisión",
      "Moverse o hablar tan despacio que otras personas podrían haberlo notado, o al contrario, estar tan agitado/a que ha estado moviéndose mucho más de lo normal",
      "Pensamientos de que estaría mejor muerto/a, o de hacerse daño de alguna manera",
    ],
    score: (total) => {
      if (total <= 4) return { level: "Mínimo", color: "#22c55e", description: "Síntomas mínimos o ausentes" };
      if (total <= 9) return { level: "Leve", color: "#86efac", description: "Síntomas leves de depresión" };
      if (total <= 14) return { level: "Moderado", color: "#fbbf24", description: "Depresión moderada — se recomienda seguimiento" };
      if (total <= 19) return { level: "Moderadamente severo", color: "#f97316", description: "Depresión moderadamente severa — tratamiento indicado" };
      return { level: "Severo", color: "#ef4444", description: "Depresión severa — intervención urgente recomendada" };
    },
  },
  gad7: {
    id: "gad7",
    name: "GAD-7",
    fullName: "Generalized Anxiety Disorder-7",
    area: "Ansiedad",
    color: "#8B5CF6",
    duration: "2-4 min",
    instructions: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
    options: [
      { label: "Para nada", value: 0 },
      { label: "Varios días", value: 1 },
      { label: "Más de la mitad de los días", value: 2 },
      { label: "Casi todos los días", value: 3 },
    ],
    questions: [
      "Sentirse nervioso/a, ansioso/a o con los nervios de punta",
      "No poder dejar de preocuparse o no poder controlar la preocupación",
      "Preocuparse demasiado por diferentes cosas",
      "Dificultad para relajarse",
      "Estar tan inquieto/a que es difícil permanecer sentado/a",
      "Molestarse o ponerse irritable fácilmente",
      "Sentir miedo, como si fuera a ocurrir algo terrible",
    ],
    score: (total) => {
      if (total <= 4) return { level: "Mínimo", color: "#22c55e", description: "Ansiedad mínima o ausente" };
      if (total <= 9) return { level: "Leve", color: "#86efac", description: "Ansiedad leve" };
      if (total <= 14) return { level: "Moderado", color: "#fbbf24", description: "Ansiedad moderada — evaluación adicional recomendada" };
      return { level: "Severo", color: "#ef4444", description: "Ansiedad severa — tratamiento activo indicado" };
    },
  },
  audit: {
    id: "audit",
    name: "AUDIT",
    fullName: "Alcohol Use Disorders Identification Test",
    area: "Consumo de alcohol",
    color: "#F59E0B",
    duration: "4-6 min",
    instructions: "Responda las siguientes preguntas sobre su consumo de alcohol en el último año.",
    options: [
      { label: "Nunca", value: 0 },
      { label: "Una o menos veces al mes", value: 1 },
      { label: "De 2 a 4 veces al mes", value: 2 },
      { label: "De 2 a 3 veces a la semana", value: 3 },
      { label: "4 o más veces a la semana", value: 4 },
    ],
    questions: [
      "¿Con qué frecuencia consume alguna bebida alcohólica?",
      "¿Cuántas consumiciones de bebidas alcohólicas suele realizar en un día de consumo normal?",
      "¿Con qué frecuencia toma 6 o más bebidas alcohólicas en una sola ocasión?",
      "¿Con qué frecuencia en el curso del último año ha sido incapaz de parar de beber una vez que había empezado?",
      "¿Con qué frecuencia en el curso del último año no pudo hacer lo que se esperaba de usted porque había bebido?",
      "¿Con qué frecuencia en el curso del último año ha necesitado beber en ayunas para recuperarse después de haber bebido mucho el día anterior?",
      "¿Con qué frecuencia en el curso del último año ha tenido remordimientos o sentimientos de culpa después de haber bebido?",
      "¿Con qué frecuencia en el curso del último año no ha podido recordar lo que sucedió la noche anterior porque había estado bebiendo?",
      "¿Usted o alguna otra persona ha resultado herido porque usted había bebido?",
      "¿Algún familiar, amigo, médico o profesional sanitario ha mostrado preocupación por su consumo de bebidas alcohólicas o le ha sugerido que deje de beber?",
    ],
    score: (total) => {
      if (total <= 7) return { level: "Bajo riesgo", color: "#22c55e", description: "Consumo de bajo riesgo" };
      if (total <= 15) return { level: "Riesgo moderado", color: "#fbbf24", description: "Consumo de riesgo — psicoeducación recomendada" };
      if (total <= 19) return { level: "Alto riesgo", color: "#f97316", description: "Consumo perjudicial — intervención breve indicada" };
      return { level: "Dependencia probable", color: "#ef4444", description: "Posible dependencia — evaluación especializada urgente" };
    },
  },
};

const MOCK_PATIENTS = [
  {
    id: "p1", name: "María González", age: 34, email: "maria@email.com",
    evaluations: [
      { id: "e1", testId: "phq9", date: "2024-10-15", answers: [1,2,1,2,1,1,1,0,0], total: 9 },
      { id: "e2", testId: "phq9", date: "2025-01-20", answers: [0,1,1,1,0,1,1,0,0], total: 5 },
      { id: "e3", testId: "phq9", date: "2025-04-10", answers: [0,0,1,1,0,0,0,0,0], total: 2 },
    ]
  },
  {
    id: "p2", name: "Carlos Rodríguez", age: 45, email: "carlos@email.com",
    evaluations: [
      { id: "e4", testId: "gad7", date: "2025-02-05", answers: [2,2,2,3,1,2,1], total: 13 },
      { id: "e5", testId: "gad7", date: "2025-04-01", answers: [1,1,2,2,1,1,1], total: 9 },
    ]
  },
];

// ─── CLAUDE API ───────────────────────────────────────────────────────────────

async function generateReport(patient, evaluation, testDef) {
  const scoreResult = testDef.score(evaluation.total);
  const prevEvals = patient.evaluations.filter(e => e.testId === evaluation.testId && e.id !== evaluation.id);
  const trend = prevEvals.length > 0
    ? `Evaluaciones previas con puntajes: ${prevEvals.map(e => e.total).join(", ")}. Tendencia: ${evaluation.total < prevEvals[prevEvals.length-1].total ? "mejoría" : "aumento de síntomas"}.`
    : "Primera evaluación registrada del paciente.";

  const prompt = `Eres un asistente clínico especializado en salud mental. Genera un informe clínico breve y profesional en español para el siguiente caso:

Paciente: ${patient.name}, ${patient.age} años
Test: ${testDef.fullName} (${testDef.name})
Área evaluada: ${testDef.area}
Puntaje obtenido: ${evaluation.total}/${testDef.questions.length * (testDef.options[testDef.options.length-1].value)}
Nivel de severidad: ${scoreResult.level}
Descripción clínica: ${scoreResult.description}
Fecha: ${evaluation.date}
${trend}

El informe debe incluir:
1. Resumen ejecutivo (2-3 oraciones)
2. Interpretación clínica del puntaje
3. Áreas de atención prioritaria basadas en las respuestas
4. 3-4 líneas terapéuticas sugeridas (basadas en evidencia)
5. Recomendaciones de seguimiento

Usa un tono clínico, empático y basado en evidencia. Máximo 350 palabras.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "No se pudo generar el informe.";
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const TestBadge = ({ test }) => (
  <span style={{
    background: test.color + "22", color: test.color,
    border: `1px solid ${test.color}44`,
    borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600,
    fontFamily: "monospace", letterSpacing: 1
  }}>{test.name}</span>
);

const ScoreMeter = ({ total, max, scoreResult }) => {
  const pct = Math.round((total / max) * 100);
  return (
    <div style={{ margin: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>Puntaje: <strong style={{ color: "#e2e8f0" }}>{total}/{max}</strong></span>
        <span style={{ fontSize: 13, fontWeight: 700, color: scoreResult.color }}>{scoreResult.level}</span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 99, height: 8, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 99,
          background: scoreResult.color,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{scoreResult.description}</p>
    </div>
  );
};

function EvolutionChart({ patient, testId }) {
  const evals = patient.evaluations.filter(e => e.testId === testId).sort((a,b) => a.date.localeCompare(b.date));
  if (evals.length < 2) return <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 20 }}>Se necesitan al menos 2 evaluaciones para ver evolución.</p>;

  const testDef = TESTS[testId];
  const max = testDef.questions.length * testDef.options[testDef.options.length-1].value;
  const W = 340, H = 140, pad = 36;
  const xs = evals.map((_, i) => pad + (i / (evals.length - 1)) * (W - pad * 2));
  const ys = evals.map(e => H - pad - ((e.total / max) * (H - pad * 2)));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");

  return (
    <div style={{ background: "#0f172a", borderRadius: 12, padding: 16, marginTop: 12 }}>
      <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8, textAlign: "center" }}>Evolución temporal — {testDef.name}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxHeight: 140 }}>
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <line key={v} x1={pad} y1={H - pad - v * (H - pad * 2)} x2={W - pad} y2={H - pad - v * (H - pad * 2)}
            stroke="#1e293b" strokeWidth={1} />
        ))}
        <path d={path} fill="none" stroke={testDef.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {evals.map((e, i) => {
          const sr = testDef.score(e.total);
          return (
            <g key={e.id}>
              <circle cx={xs[i]} cy={ys[i]} r={6} fill={sr.color} />
              <text x={xs[i]} y={H - 4} textAnchor="middle" fontSize={9} fill="#64748b">
                {e.date.slice(5)}
              </text>
              <text x={xs[i]} y={ys[i] - 12} textAnchor="middle" fontSize={11} fill="#e2e8f0" fontWeight="600">
                {e.total}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── PATIENT TEST VIEW ────────────────────────────────────────────────────────

function PatientTestView({ testId, patientName, onComplete }) {
  const test = TESTS[testId];
  const [answers, setAnswers] = useState(Array(test.questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.every(a => a !== null);
  const total = answers.reduce((s, a) => s + (a ?? 0), 0);
  const scoreResult = test.score(total);

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 16px", fontFamily: "'DM Sans', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <TestBadge test={test} />
          <h1 style={{ color: "#f1f5f9", fontFamily: "'DM Serif Display'", fontSize: 28, margin: "12px 0 4px" }}>
            {test.fullName}
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Hola, <strong style={{ color: "#94a3b8" }}>{patientName}</strong> · {test.duration}</p>
        </div>

        {!submitted ? (
          <>
            <div style={{
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: 16, padding: 20, marginBottom: 24
            }}>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{test.instructions}</p>
            </div>

            {test.questions.map((q, qi) => (
              <div key={qi} style={{
                background: "#0f172a", border: `1px solid ${answers[qi] !== null ? test.color + "55" : "#1e293b"}`,
                borderRadius: 16, padding: 20, marginBottom: 12,
                transition: "border-color 0.3s"
              }}>
                <p style={{ color: "#e2e8f0", fontSize: 15, margin: "0 0 16px", lineHeight: 1.5 }}>
                  <span style={{ color: test.color, fontWeight: 700, marginRight: 8 }}>{qi + 1}.</span>{q}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {test.options.map(opt => (
                    <button key={opt.value} onClick={() => {
                      const newA = [...answers]; newA[qi] = opt.value; setAnswers(newA);
                    }} style={{
                      background: answers[qi] === opt.value ? test.color + "33" : "transparent",
                      border: `1px solid ${answers[qi] === opt.value ? test.color : "#334155"}`,
                      borderRadius: 10, padding: "10px 16px",
                      color: answers[qi] === opt.value ? "#f1f5f9" : "#94a3b8",
                      cursor: "pointer", textAlign: "left", fontSize: 14,
                      transition: "all 0.2s", fontFamily: "inherit"
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
                {answers.filter(a => a !== null).length}/{test.questions.length} preguntas respondidas
              </p>
              <button onClick={() => setSubmitted(true)} disabled={!allAnswered} style={{
                background: allAnswered ? test.color : "#1e293b",
                color: allAnswered ? "#fff" : "#475569",
                border: "none", borderRadius: 12, padding: "14px 40px",
                fontSize: 16, fontWeight: 600, cursor: allAnswered ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "all 0.3s"
              }}>
                Enviar respuestas →
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: "#0f172a", border: `1px solid ${scoreResult.color}44`,
              borderRadius: 20, padding: 32
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: scoreResult.color + "22",
                border: `3px solid ${scoreResult.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 32
              }}>✓</div>
              <h2 style={{ color: "#f1f5f9", fontFamily: "'DM Serif Display'", fontSize: 24, margin: "0 0 8px" }}>
                Evaluación completada
              </h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                Tu profesional de salud recibirá los resultados y te contactará.
              </p>
              <div style={{
                background: scoreResult.color + "11",
                borderRadius: 12, padding: 16,
                border: `1px solid ${scoreResult.color}33`
              }}>
                <p style={{ color: scoreResult.color, fontWeight: 700, fontSize: 18, margin: "0 0 4px" }}>
                  Puntaje: {total}
                </p>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>{scoreResult.level}</p>
              </div>
            </div>
            <button onClick={() => onComplete(answers, total)} style={{
              marginTop: 20, background: "transparent", border: "1px solid #334155",
              borderRadius: 10, padding: "10px 24px", color: "#64748b",
              cursor: "pointer", fontSize: 13, fontFamily: "inherit"
            }}>
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
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [view, setView] = useState("dashboard"); // dashboard | patient | patientTest | newPatient
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedEval, setSelectedEval] = useState(null);
  const [simulatingTest, setSimulatingTest] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: "", age: "", email: "" });
  const [assignTest, setAssignTest] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("evaluaciones");

  const handleGenerateReport = async (patient, evaluation) => {
    const testDef = TESTS[evaluation.testId];
    setReport({ loading: true, text: null });
    setReportLoading(true);
    try {
      const text = await generateReport(patient, evaluation, testDef);
      setReport({ loading: false, text });
    } catch {
      setReport({ loading: false, text: "Error al generar el informe. Verificá la conexión." });
    }
    setReportLoading(false);
  };

  const handleCompleteTest = (patientId, testId, answers, total) => {
    const today = new Date().toISOString().slice(0, 10);
    const newEval = { id: "e" + Date.now(), testId, date: today, answers, total };
    setPatients(prev => prev.map(p => p.id === patientId
      ? { ...p, evaluations: [...p.evaluations, newEval] }
      : p
    ));
    setSimulatingTest(null);
    setView("patient");
    setSelectedPatient(p => patients.find(x => x.id === p.id) || p);
  };

  const handleAddPatient = () => {
    if (!newPatientForm.name) return;
    const newP = { id: "p" + Date.now(), ...newPatientForm, age: parseInt(newPatientForm.age) || 0, evaluations: [] };
    setPatients(prev => [...prev, newP]);
    setNewPatientForm({ name: "", age: "", email: "" });
    setShowNewPatient(false);
  };

  // Simulate test view
  if (simulatingTest) {
    return <PatientTestView
      testId={simulatingTest.testId}
      patientName={simulatingTest.patient.name}
      onComplete={(answers, total) => handleCompleteTest(simulatingTest.patient.id, simulatingTest.testId, answers, total)}
    />;
  }

  const S = {
    app: {
      minHeight: "100vh", background: "#070c18", color: "#e2e8f0",
      fontFamily: "'DM Sans', sans-serif",
    },
    sidebar: {
      width: 220, background: "#0a0f1e",
      borderRight: "1px solid #1e293b",
      display: "flex", flexDirection: "column",
      padding: "24px 16px", position: "fixed",
      top: 0, left: 0, height: "100vh", zIndex: 10
    },
    main: { marginLeft: 220, padding: "32px 40px", minHeight: "100vh" },
    card: {
      background: "#0f172a", border: "1px solid #1e293b",
      borderRadius: 16, padding: 24
    },
    btn: (color = "#3b82f6") => ({
      background: color, color: "#fff", border: "none",
      borderRadius: 10, padding: "10px 20px",
      fontSize: 14, fontWeight: 600, cursor: "pointer",
      fontFamily: "inherit", transition: "opacity 0.2s"
    }),
    btnGhost: {
      background: "transparent", color: "#94a3b8",
      border: "1px solid #334155", borderRadius: 10,
      padding: "8px 16px", fontSize: 13, cursor: "pointer",
      fontFamily: "inherit"
    },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#475569", textTransform: "uppercase" },
  };

  const currentPatient = selectedPatient && patients.find(p => p.id === selectedPatient.id);

  // ── PATIENT TEST LINK MODAL ──
  const LinkModal = () => assignTest && (
    <div style={{
      position: "fixed", inset: 0, background: "#000a",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }}>
      <div style={{ ...S.card, maxWidth: 420, width: "90%" }}>
        <h3 style={{ color: "#f1f5f9", margin: "0 0 4px", fontFamily: "'DM Serif Display'" }}>Enviar test al paciente</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
          Compartí este link por WhatsApp o mail con {assignTest.patient.name}
        </p>
        <TestBadge test={TESTS[assignTest.testId]} />
        <div style={{
          background: "#070c18", borderRadius: 10, padding: 14,
          marginTop: 16, marginBottom: 16,
          border: "1px solid #334155", wordBreak: "break-all"
        }}>
          <span style={{ color: "#64748b", fontSize: 12, fontFamily: "monospace" }}>
            https://evaluaciones.app/test/{assignTest.testId}?pid={assignTest.patient.id}&token=demo
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btn("#25D366"), flex: 1, fontSize: 13 }}
            onClick={() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}>
            📱 WhatsApp
          </button>
          <button style={{ ...S.btn("#3b82f6"), flex: 1, fontSize: 13 }}
            onClick={() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}>
            ✉️ Email
          </button>
        </div>
        {linkCopied && <p style={{ color: "#22c55e", fontSize: 12, textAlign: "center", marginTop: 10 }}>✓ Link copiado</p>}
        <div style={{ borderTop: "1px solid #1e293b", marginTop: 20, paddingTop: 16, display: "flex", gap: 10 }}>
          <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setAssignTest(null)}>Cancelar</button>
          <button style={{ ...S.btn("#7c3aed"), flex: 1, fontSize: 13 }}
            onClick={() => { setAssignTest(null); setSimulatingTest(assignTest); }}>
            🧪 Simular como paciente
          </button>
        </div>
      </div>
    </div>
  );

  // ── REPORT MODAL ──
  const ReportModal = () => report && (
    <div style={{
      position: "fixed", inset: 0, background: "#000c",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      padding: 20
    }}>
      <div style={{ ...S.card, maxWidth: 560, width: "100%", maxHeight: "85vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
          <h3 style={{ color: "#f1f5f9", margin: 0, fontFamily: "'DM Serif Display'", fontSize: 22 }}>
            Informe clínico con IA
          </h3>
          <button style={{ ...S.btnGhost, padding: "4px 12px" }} onClick={() => setReport(null)}>✕</button>
        </div>
        {report.loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "3px solid #1e293b", borderTopColor: "#3b82f6",
              margin: "0 auto 16px", animation: "spin 1s linear infinite"
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: "#64748b", fontSize: 14 }}>Generando informe con IA…</p>
          </div>
        ) : (
          <div style={{
            background: "#070c18", borderRadius: 12, padding: 20,
            border: "1px solid #1e293b",
            fontSize: 14, lineHeight: 1.8, color: "#cbd5e1",
            whiteSpace: "pre-wrap"
          }}>
            {report.text}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <LinkModal />
      <ReportModal />

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            marginBottom: 12
          }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#475569", textTransform: "uppercase", margin: 0 }}>
            Salud Mental
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", margin: "2px 0 0" }}>
            Evaluaciones
          </p>
        </div>

        {[
          { id: "dashboard", label: "Panel general", icon: "◈" },
          { id: "tests", label: "Tests disponibles", icon: "◎" },
        ].map(item => (
          <button key={item.id} onClick={() => setView(item.id)} style={{
            background: view === item.id ? "#1e293b" : "transparent",
            border: "none", borderRadius: 10, padding: "10px 14px",
            color: view === item.id ? "#e2e8f0" : "#64748b",
            cursor: "pointer", textAlign: "left", fontSize: 14,
            fontFamily: "inherit", display: "flex", gap: 10,
            alignItems: "center", marginBottom: 4, width: "100%"
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
          </button>
        ))}

        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <p style={{ ...S.label, paddingLeft: 14, marginBottom: 8 }}>Pacientes</p>
        </div>

        {patients.map(p => (
          <button key={p.id} onClick={() => { setSelectedPatient(p); setView("patient"); setReport(null); }} style={{
            background: (view === "patient" && currentPatient?.id === p.id) ? "#1e293b" : "transparent",
            border: "none", borderRadius: 10, padding: "8px 14px",
            color: (view === "patient" && currentPatient?.id === p.id) ? "#e2e8f0" : "#64748b",
            cursor: "pointer", textAlign: "left", fontSize: 13,
            fontFamily: "inherit", marginBottom: 2, width: "100%",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "#1e293b", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#3b82f6", flexShrink: 0
            }}>
              {p.name.split(" ").map(x => x[0]).join("").slice(0,2)}
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
          </button>
        ))}

        <button onClick={() => setShowNewPatient(true)} style={{
          background: "transparent", border: "1px dashed #334155",
          borderRadius: 10, padding: "8px 14px", color: "#475569",
          cursor: "pointer", textAlign: "left", fontSize: 13,
          fontFamily: "inherit", marginTop: 8, width: "100%"
        }}>
          + Nuevo paciente
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={S.main}>

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && (
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display'", fontSize: 36, margin: "0 0 4px", color: "#f1f5f9" }}>
              Panel general
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>Resumen de actividad clínica</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Pacientes activos", value: patients.length, icon: "◈", color: "#3b82f6" },
                { label: "Evaluaciones totales", value: patients.reduce((s,p) => s + p.evaluations.length, 0), icon: "◎", color: "#8b5cf6" },
                { label: "Tests disponibles", value: Object.keys(TESTS).length, icon: "◉", color: "#22c55e" },
              ].map(stat => (
                <div key={stat.label} style={{ ...S.card }}>
                  <p style={{ ...S.label, marginBottom: 12 }}>{stat.label}</p>
                  <p style={{ fontSize: 40, fontFamily: "'DM Serif Display'", color: stat.color, margin: 0 }}>{stat.value}</p>
                </div>
              ))}
            </div>

            <h2 style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Últimas evaluaciones</h2>
            <div style={S.card}>
              {patients.flatMap(p => p.evaluations.map(e => ({ ...e, patient: p })))
                .sort((a,b) => b.date.localeCompare(a.date)).slice(0,5)
                .map(e => {
                  const testDef = TESTS[e.testId];
                  const sr = testDef.score(e.total);
                  return (
                    <div key={e.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 0", borderBottom: "1px solid #1e293b"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <TestBadge test={testDef} />
                        <div>
                          <p style={{ margin: 0, fontSize: 14, color: "#e2e8f0" }}>{e.patient.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>{e.date}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: sr.color }}>{sr.level}</span>
                        <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>Puntaje: {e.total}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* New patient modal inline */}
            {showNewPatient && (
              <div style={{
                position: "fixed", inset: 0, background: "#000a",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
              }}>
                <div style={{ ...S.card, maxWidth: 400, width: "90%" }}>
                  <h3 style={{ color: "#f1f5f9", margin: "0 0 20px", fontFamily: "'DM Serif Display'" }}>Nuevo paciente</h3>
                  {["name", "age", "email"].map(field => (
                    <div key={field} style={{ marginBottom: 14 }}>
                      <p style={{ ...S.label, marginBottom: 6 }}>{field === "name" ? "Nombre" : field === "age" ? "Edad" : "Email"}</p>
                      <input
                        type={field === "age" ? "number" : "text"}
                        value={newPatientForm[field]}
                        onChange={e => setNewPatientForm(prev => ({ ...prev, [field]: e.target.value }))}
                        style={{
                          width: "100%", background: "#070c18",
                          border: "1px solid #334155", borderRadius: 10,
                          padding: "10px 14px", color: "#e2e8f0",
                          fontSize: 14, fontFamily: "inherit", boxSizing: "border-box"
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setShowNewPatient(false)}>Cancelar</button>
                    <button style={{ ...S.btn(), flex: 1 }} onClick={handleAddPatient}>Agregar paciente</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TESTS ── */}
        {view === "tests" && (
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display'", fontSize: 36, margin: "0 0 4px", color: "#f1f5f9" }}>
              Tests disponibles
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>Instrumentos de evaluación validados</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
              {Object.values(TESTS).map(test => (
                <div key={test.id} style={{
                  ...S.card,
                  borderColor: test.color + "33",
                  borderTopWidth: 3, borderTopColor: test.color
                }}>
                  <TestBadge test={test} />
                  <h3 style={{ color: "#f1f5f9", margin: "12px 0 4px", fontSize: 16 }}>{test.fullName}</h3>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 4px" }}>Área: {test.area}</p>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 16px" }}>Preguntas: {test.questions.length} · {test.duration}</p>
                  <p style={{ color: "#475569", fontSize: 12, lineHeight: 1.5 }}>{test.instructions.slice(0,80)}…</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PATIENT DETAIL ── */}
        {view === "patient" && currentPatient && (
          <div>
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <p style={{ ...S.label, marginBottom: 4 }}>Paciente</p>
                <h1 style={{ fontFamily: "'DM Serif Display'", fontSize: 36, margin: "0 0 4px", color: "#f1f5f9" }}>
                  {currentPatient.name}
                </h1>
                <p style={{ color: "#64748b", fontSize: 14 }}>{currentPatient.age} años · {currentPatient.email}</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {Object.values(TESTS).map(test => (
                  <button key={test.id} style={{ ...S.btn(test.color), fontSize: 13 }}
                    onClick={() => setAssignTest({ patient: currentPatient, testId: test.id })}>
                    + {test.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #1e293b" }}>
              {["evaluaciones", "evolución"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  background: "transparent", border: "none",
                  borderBottom: `2px solid ${activeTab === tab ? "#3b82f6" : "transparent"}`,
                  color: activeTab === tab ? "#3b82f6" : "#64748b",
                  padding: "10px 20px", cursor: "pointer",
                  fontSize: 14, fontFamily: "inherit", fontWeight: 600,
                  textTransform: "capitalize"
                }}>{tab}</button>
              ))}
            </div>

            {activeTab === "evaluaciones" && (
              <div>
                {currentPatient.evaluations.length === 0 ? (
                  <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
                    <p style={{ color: "#475569", fontSize: 14 }}>Sin evaluaciones todavía. Asigná un test arriba.</p>
                  </div>
                ) : (
                  [...currentPatient.evaluations].sort((a,b) => b.date.localeCompare(a.date)).map(ev => {
                    const testDef = TESTS[ev.testId];
                    const sr = testDef.score(ev.total);
                    const max = testDef.questions.length * testDef.options[testDef.options.length-1].value;
                    return (
                      <div key={ev.id} style={{ ...S.card, marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div>
                            <TestBadge test={testDef} />
                            <p style={{ color: "#475569", fontSize: 13, margin: "8px 0 0" }}>{ev.date}</p>
                          </div>
                          <button style={{ ...S.btn("#7c3aed"), fontSize: 13 }}
                            onClick={() => handleGenerateReport(currentPatient, ev)}>
                            ✦ Informe IA
                          </button>
                        </div>
                        <ScoreMeter total={ev.total} max={max} scoreResult={sr} />
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "evolución" && (
              <div>
                {[...new Set(currentPatient.evaluations.map(e => e.testId))].map(testId => (
                  <div key={testId} style={{ ...S.card, marginBottom: 16 }}>
                    <TestBadge test={TESTS[testId]} />
                    <EvolutionChart patient={currentPatient} testId={testId} />
                  </div>
                ))}
                {currentPatient.evaluations.length === 0 && (
                  <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
                    <p style={{ color: "#475569", fontSize: 14 }}>Sin datos de evolución todavía.</p>
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
