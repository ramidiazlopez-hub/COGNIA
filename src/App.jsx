import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import SaludMental from "./SaludMental";
import Laboral from "./Laboral";

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "", password: "", nombre: "", apellido: "",
    especialidad: "Psiquiatra", matricula: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogin = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password
    });
    if (error) { setError(error.message); setLoading(false); return; }
    let prof = null;
    try {
      const { data: profData, error: profError } = await supabase
        .from("professionals").select("*").eq("id", data.user.id).maybeSingle();
      if (!profError && profData) prof = profData;
    } catch (e) { console.warn("Perfil no cargado:", e); }
    if (!prof) {
      const defaultProf = {
        id: data.user.id, nombre: data.user.email.split("@")[0],
        apellido: "", especialidad: "Médico", matricula: "", email: data.user.email
      };
      const { data: newProf } = await supabase.from("professionals")
        .insert(defaultProf).select().single();
      prof = newProf || defaultProf;
    }
    onAuth(data.user, prof);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.nombre || !form.apellido || !form.matricula) {
      setError("Completá todos los campos."); return;
    }
    setLoading(true); setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: form.email, password: form.password
    });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("professionals").upsert({
        id: data.user.id, nombre: form.nombre, apellido: form.apellido,
        especialidad: form.especialidad, matricula: form.matricula, email: form.email
      });
      setSuccess("¡Registro exitoso! Revisá tu email para confirmar la cuenta, luego ingresá.");
      setMode("login");
    }
    setLoading(false);
  };

  const S = {
    input: {
      width: "100%", background: "#0a0f1e", border: "1px solid #334155",
      borderRadius: 9, padding: "10px 14px", color: "#e2e8f0", fontSize: 14,
      fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12
    },
    btn: (c = "#7c3aed") => ({
      width: "100%", background: loading ? "#1e293b" : c,
      color: loading ? "#475569" : "#fff", border: "none", borderRadius: 10,
      padding: "12px", fontSize: 15, fontWeight: 700,
      cursor: loading ? "not-allowed" : "pointer", marginBottom: 10
    }),
    label: { color: "#94a3b8", fontSize: 12, marginBottom: 4, display: "block" }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#060b18",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "#0d1526", border: "1px solid #1e293b",
        borderRadius: 18, padding: 40, width: 380, boxShadow: "0 20px 60px #000a"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0", letterSpacing: -1 }}>
            🧠 COGN<span style={{ color: "#7c3aed" }}>IA</span>
          </div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
            Plataforma de evaluaciones clínicas
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }} style={{
              flex: 1, padding: "8px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600,
              background: mode === m ? "#7c3aed" : "#1e293b",
              color: mode === m ? "#fff" : "#64748b", cursor: "pointer"
            }}>{m === "login" ? "Ingresar" : "Registrarse"}</button>
          ))}
        </div>
        {error && <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: "#0a1a0a", border: "1px solid #166534", borderRadius: 8, padding: "10px 14px", color: "#86efac", fontSize: 13, marginBottom: 16 }}>{success}</div>}
        {mode === "register" && (
          <>
            <label style={S.label}>Nombre</label>
            <input style={S.input} value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ramiro" />
            <label style={S.label}>Apellido</label>
            <input style={S.input} value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} placeholder="Díaz López" />
            <label style={S.label}>Especialidad</label>
            <select style={{ ...S.input, marginBottom: 12 }} value={form.especialidad} onChange={e => setForm(p => ({ ...p, especialidad: e.target.value }))}>
              {["Psiquiatra", "Psicólogo/a", "Médico/a", "Médico/a Laboral", "Otro"].map(e => <option key={e}>{e}</option>)}
            </select>
            <label style={S.label}>Matrícula</label>
            <input style={S.input} value={form.matricula} onChange={e => setForm(p => ({ ...p, matricula: e.target.value }))} placeholder="MP 12345" />
          </>
        )}
        <label style={S.label}>Email</label>
        <input style={S.input} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@ejemplo.com" />
        <label style={S.label}>Contraseña</label>
        <input style={S.input} type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••"
          onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())} />
        <button style={S.btn()} onClick={mode === "login" ? handleLogin : handleRegister} disabled={loading}>
          {loading ? "Procesando..." : mode === "login" ? "Ingresar →" : "Crear cuenta →"}
        </button>
      </div>
    </div>
  );
}

// ─── MODULE SELECTOR ──────────────────────────────────────────────────────────
function ModuleSelector({ professional, onSelect, onLogout }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#060b18", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", gap: 32
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#e2e8f0", letterSpacing: -1 }}>
          🧠 COGN<span style={{ color: "#7c3aed" }}>IA</span>
        </div>
        <div style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>
          {professional ? `Dr/a. ${professional.nombre} ${professional.apellido} · ${professional.especialidad}` : "Bienvenido/a"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {[
          { id: "salud", label: "Salud Mental", icon: "🧠", desc: "PHQ-9, GAD-7, AUDIT, BDI-II y más" },
          { id: "laboral", label: "Salud Laboral", icon: "🏭", desc: "Burnout, estrés laboral, ergonomía" }
        ].map(m => (
          <div key={m.id} onClick={() => onSelect(m.id)} style={{
            background: "#0d1526", border: "1px solid #1e293b", borderRadius: 18,
            padding: "32px 40px", cursor: "pointer", textAlign: "center", minWidth: 200, transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>{m.icon}</div>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>{m.label}</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>{m.desc}</div>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{
        background: "none", border: "1px solid #1e293b", borderRadius: 8,
        color: "#64748b", padding: "8px 20px", cursor: "pointer", fontSize: 13
      }}>Cerrar sesión</button>
    </div>
  );
}

// ─── PANTALLA PÚBLICA PARA PACIENTES (link de WhatsApp / email) ───────────────
function PublicTestScreen({ testId, pid }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("patients").select("id, name").eq("id", pid).maybeSingle();
        if (error || !data) {
          setError("No se encontró la evaluación. El link puede haber expirado.");
        } else {
          setPatient(data);
        }
      } catch (e) {
        setError("Error al cargar la evaluación.");
      }
      setLoading(false);
    };
    load();
  }, [pid]);

const handleComplete = async (answers, total) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      // Buscar el professional_id del paciente
      const { data: patientData } = await supabase
        .from("patients")
        .select("professional_id")
        .eq("id", pid)
        .maybeSingle();

      await supabase.from("evaluations").insert({
        patient_id: pid,
        professional_id: patientData?.professional_id || null,
        test_id: testId,
        date: today,
        answers: answers,
        total: total
      });
    } catch (e) {
      console.warn("No se pudo guardar la evaluación:", e);
    }
    setCompleted(true);
  };
  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#060b18", display: "flex",
      alignItems: "center", justifyContent: "center",
      color: "#7c3aed", fontSize: 18, fontFamily: "'Segoe UI', sans-serif"
    }}>Cargando evaluación...</div>
  );

  if (error) return (
    <div style={{
      minHeight: "100vh", background: "#060b18", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", gap: 16
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <p style={{ color: "#fca5a5", fontSize: 16, textAlign: "center", maxWidth: 320 }}>{error}</p>
      <a href="/" style={{ color: "#7c3aed", fontSize: 13 }}>← Volver al inicio</a>
    </div>
  );

  if (completed) return (
    <div style={{
      minHeight: "100vh", background: "#060b18", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", gap: 20,
      padding: 24
    }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <h2 style={{ color: "#f1f5f9", fontFamily: "'Georgia', serif", margin: 0 }}>
        ¡Evaluación completada!
      </h2>
      <p style={{ color: "#64748b", fontSize: 15, textAlign: "center", maxWidth: 360, lineHeight: 1.6 }}>
        Tus respuestas fueron enviadas correctamente. Tu profesional recibirá los resultados y se pondrá en contacto contigo.
      </p>
      <div style={{
        background: "#0d1526", border: "1px solid #1e293b", borderRadius: 14,
        padding: "16px 24px", marginTop: 8
      }}>
        <p style={{ color: "#475569", fontSize: 13, margin: 0, textAlign: "center" }}>
          🧠 COGN<span style={{ color: "#7c3aed" }}>IA</span> · Plataforma de evaluaciones clínicas
        </p>
      </div>
    </div>
  );

  // Renderizar el test directamente para el paciente
  return (
    <SaludMental
      user={null}
      professional={null}
      publicMode={true}
      publicTestId={testId}
      publicPatientId={pid}
      publicPatientName={patient?.name || "Paciente"}
      publicOnComplete={handleComplete}
      supabase={supabase}
      onBack={() => window.location.href = "/"}
      onLogout={() => window.location.href = "/"}
    />
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [module, setModule] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  // ── Detectar ruta pública /test/:testId?pid=... ──
  const pathname = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const publicTestMatch = pathname.match(/^\/test\/([^/?]+)/);
  const publicTestId = publicTestMatch ? publicTestMatch[1] : null;
  const publicPid = urlParams.get("pid");

  // Si es link público de paciente → mostrar sin login
  if (publicTestId && publicPid) {
    return <PublicTestScreen testId={publicTestId} pid={publicPid} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          let prof = null;
          try {
            const { data } = await supabase.from("professionals")
              .select("*").eq("id", session.user.id).maybeSingle();
            prof = data;
          } catch (e) { console.warn("Perfil no cargado:", e); }
          if (!prof) {
            const defaultProf = {
              id: session.user.id, nombre: session.user.email.split("@")[0],
              apellido: "", especialidad: "Médico", matricula: "", email: session.user.email
            };
            const { data: newProf } = await supabase.from("professionals")
              .insert(defaultProf).select().single();
            prof = newProf || defaultProf;
          }
          setUser(session.user);
          setProfessional(prof);
        }
      } catch (e) { console.error("Error restaurando sesión:", e); }
      setAppLoading(false);
    };
    restoreSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") { setUser(null); setProfessional(null); setModule(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = (u, prof) => { setUser(u); setProfessional(prof); };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfessional(null); setModule(null);
  };

  if (appLoading) return (
    <div style={{
      minHeight: "100vh", background: "#060b18", display: "flex",
      alignItems: "center", justifyContent: "center", color: "#7c3aed", fontSize: 18
    }}>Cargando...</div>
  );

  if (!user) return <AuthScreen onAuth={handleAuth} />;
  if (!module) return (
    <ModuleSelector professional={professional} onSelect={setModule} onLogout={handleLogout} />
  );
  if (module === "salud") return (
    <SaludMental user={user} professional={professional}
      onBack={() => setModule(null)} onLogout={handleLogout} supabase={supabase} />
  );
  if (module === "laboral") return (
    <Laboral user={user} professional={professional}
      onBack={() => setModule(null)} onLogout={handleLogout} supabase={supabase} />
  );
}
