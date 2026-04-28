import { useState, useEffect } from "react";

const CATEGORIES = {
  depresion:    { label:"Depresión",             color:"#4A90D9" },
  ansiedad:     { label:"Ansiedad",              color:"#8B5CF6" },
  trauma:       { label:"Trauma / PTSD",         color:"#EF4444" },
  sustancias:   { label:"Consumo de sustancias", color:"#F59E0B" },
  alimentaria:  { label:"Conducta alimentaria",  color:"#EC4899" },
  sueno:        { label:"Sueño",                 color:"#6366F1" },
  cognicion:    { label:"Cognición",             color:"#14B8A6" },
  tdah:         { label:"TDAH",                  color:"#F97316" },
  psicosis:     { label:"Psicosis",              color:"#A855F7" },
  bipolar:      { label:"Bipolar",               color:"#06B6D4" },
  toc:          { label:"TOC",                   color:"#84CC16" },
  personalidad: { label:"Personalidad",          color:"#F43F5E" },
};

const TESTS = {
  phq9:{ id:"phq9",name:"PHQ-9",fullName:"Patient Health Questionnaire-9",category:"depresion",duration:"3-5 min",
    instructions:"Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
    options:[{label:"Para nada",value:0},{label:"Varios días",value:1},{label:"Más de la mitad de los días",value:2},{label:"Casi todos los días",value:3}],
    questions:["Poco interés o placer en hacer cosas","Sentirse decaído/a, deprimido/a o sin esperanza","Dificultad para dormir o dormir demasiado","Sentirse cansado/a o con poca energía","Poco apetito o comer en exceso","Sentirse mal consigo mismo/a","Dificultad para concentrarse","Moverse o hablar muy despacio o muy agitado/a","Pensamientos de que estaría mejor muerto/a o de hacerse daño"],
    maxScore:27, score:(t)=>t<=4?{level:"Mínimo",color:"#22c55e",desc:"Sin alerta"}:t<=9?{level:"Leve",color:"#86efac",desc:"Síntomas leves"}:t<=14?{level:"Moderado",color:"#fbbf24",desc:"Seguimiento recomendado"}:t<=19?{level:"Mod. severo",color:"#f97316",desc:"Tratamiento indicado"}:{level:"Severo",color:"#ef4444",desc:"Intervención urgente"} },
  bdi2:{ id:"bdi2",name:"BDI-II",fullName:"Inventario de Depresión de Beck-II",category:"depresion",duration:"5-10 min",
    instructions:"Elija la afirmación que mejor describe cómo se ha sentido durante las últimas dos semanas.",
    options:[{label:"No presente",value:0},{label:"Leve",value:1},{label:"Moderado",value:2},{label:"Severo",value:3}],
    questions:["Tristeza","Pesimismo","Fracaso en el pasado","Pérdida de placer","Sentimientos de culpa","Sentimientos de castigo","Insatisfacción con uno mismo","Autocrítica","Pensamientos suicidas","Llanto","Agitación","Pérdida de interés","Indecisión","Inutilidad","Pérdida de energía","Cambios en el sueño","Irritabilidad","Cambios en el apetito","Dificultad de concentración","Cansancio","Pérdida de interés en el sexo"],
    maxScore:63, score:(t)=>t<=13?{level:"Mínimo",color:"#22c55e",desc:"Depresión mínima"}:t<=19?{level:"Leve",color:"#86efac",desc:"Depresión leve"}:t<=28?{level:"Moderado",color:"#fbbf24",desc:"Depresión moderada"}:{level:"Severo",color:"#ef4444",desc:"Depresión severa"} },
  gad7:{ id:"gad7",name:"GAD-7",fullName:"Generalized Anxiety Disorder-7",category:"ansiedad",duration:"2-4 min",
    instructions:"Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
    options:[{label:"Para nada",value:0},{label:"Varios días",value:1},{label:"Más de la mitad de los días",value:2},{label:"Casi todos los días",value:3}],
    questions:["Sentirse nervioso/a o ansioso/a","No poder dejar de preocuparse","Preocuparse demasiado por diferentes cosas","Dificultad para relajarse","Estar tan inquieto/a que es difícil permanecer sentado/a","Molestarse o ponerse irritable fácilmente","Sentir miedo como si fuera a ocurrir algo terrible"],
    maxScore:21, score:(t)=>t<=4?{level:"Mínimo",color:"#22c55e",desc:"Ansiedad mínima"}:t<=9?{level:"Leve",color:"#86efac",desc:"Ansiedad leve"}:t<=14?{level:"Moderado",color:"#fbbf24",desc:"Evaluación adicional recomendada"}:{level:"Severo",color:"#ef4444",desc:"Tratamiento activo indicado"} },
  bai:{ id:"bai",name:"BAI",fullName:"Inventario de Ansiedad de Beck",category:"ansiedad",duration:"5-7 min",
    instructions:"Indique cuánto le ha molestado cada síntoma durante la última semana.",
    options:[{label:"En absoluto",value:0},{label:"Levemente",value:1},{label:"Moderadamente",value:2},{label:"Gravemente",value:3}],
    questions:["Entumecimiento u hormigueo","Sensación de calor","Temblor en las piernas","Incapacidad para relajarse","Miedo a que suceda lo peor","Mareo","Palpitaciones","Inestabilidad","Terrores","Nerviosismo","Sensación de ahogo","Temblores de manos","Temblor general","Miedo a perder el control","Dificultad para respirar","Miedo a morir","Sensación de alarma","Indigestión","Desmayos","Rubor facial","Sudoración"],
    maxScore:63, score:(t)=>t<=7?{level:"Mínimo",color:"#22c55e",desc:"Ansiedad mínima"}:t<=15?{level:"Leve",color:"#86efac",desc:"Ansiedad leve"}:t<=25?{level:"Moderado",color:"#fbbf24",desc:"Ansiedad moderada"}:{level:"Severo",color:"#ef4444",desc:"Ansiedad severa"} },
  pcl5:{ id:"pcl5",name:"PCL-5",fullName:"PTSD Checklist for DSM-5",category:"trauma",duration:"5-8 min",
    instructions:"¿Cuánto le ha molestado cada problema en el último mes en respuesta a una experiencia estresante?",
    options:[{label:"Nada",value:0},{label:"Un poco",value:1},{label:"Moderadamente",value:2},{label:"Bastante",value:3},{label:"Extremadamente",value:4}],
    questions:["Recuerdos perturbadores repetitivos","Sueños perturbadores","Sentir que el evento vuelve a ocurrir","Perturbación al recordar el evento","Reacciones físicas ante recordatorios","Evitar recuerdos o pensamientos relacionados","Evitar recordatorios externos","Dificultad para recordar partes del evento","Creencias negativas sobre uno mismo o el mundo","Culparse a sí mismo o a otros","Sentimientos negativos intensos","Pérdida de interés en actividades","Sentirse distante de otras personas","Dificultad para experimentar sentimientos positivos","Comportamiento irritable o agresivo","Asumir riesgos excesivos","Estar en alerta máxima","Sobresaltarse fácilmente","Dificultad para concentrarse","Problemas para dormir"],
    maxScore:80, score:(t)=>t<=20?{level:"Sub-umbral",color:"#22c55e",desc:"Por debajo del umbral clínico"}:t<=32?{level:"PTSD leve",color:"#fbbf24",desc:"Evaluación clínica recomendada"}:t<=50?{level:"PTSD moderado",color:"#f97316",desc:"Tratamiento especializado"}:{level:"PTSD severo",color:"#ef4444",desc:"Intervención urgente"} },
  hama:{ id:"hama",name:"HAM-A",fullName:"Hamilton Anxiety Rating Scale",category:"ansiedad",duration:"5-7 min",
    instructions:"Evalúe la intensidad de cada síntoma de ansiedad durante la última semana.",
    options:[{label:"No presente",value:0},{label:"Leve",value:1},{label:"Moderado",value:2},{label:"Severo",value:3},{label:"Muy severo",value:4}],
    questions:["Humor ansioso (preocupación, anticipación de lo peor, aprensión)","Tensión (sensación de tensión, fatiga, imposibilidad de relajarse)","Miedos (a la oscuridad, extraños, animales, tráfico, multitudes)","Insomnio (dificultad para dormirse, sueño interrumpido, sueño insatisfactorio)","Intelectual / cognitivo (dificultad de concentración, mala memoria)","Humor depresivo (pérdida de interés, no disfruta del tiempo libre)","Síntomas somáticos musculares (dolores, espasmos, rigidez)","Síntomas somáticos sensoriales (visión borrosa, sofocos, debilidad)","Síntomas cardiovasculares (taquicardia, palpitaciones, dolor precordial)","Síntomas respiratorios (opresión en el pecho, sensación de ahogo)","Síntomas gastrointestinales (dificultad para tragar, náuseas, vómitos)","Síntomas genitourinarios (frecuencia urinaria, amenorrea, impotencia)","Síntomas del sistema nervioso autónomo (boca seca, rubor, palidez)","Comportamiento durante la entrevista (agitación, inquietud, temblor)"],
    maxScore:56,
    score:(t)=>t<=7?{level:"Sin ansiedad",color:"#22c55e",desc:"Sin ansiedad clínica"}:t<=17?{level:"Ansiedad leve",color:"#86efac",desc:"Ansiedad leve"}:t<=24?{level:"Moderada",color:"#fbbf24",desc:"Ansiedad moderada"}:t<=30?{level:"Severa",color:"#f97316",desc:"Ansiedad severa"}:{level:"Muy severa",color:"#ef4444",desc:"Ansiedad muy severa — intervención urgente"} },
  iesr:{ id:"iesr",name:"IES-R",fullName:"Impact of Event Scale-Revised",category:"trauma",duration:"4-6 min",
    instructions:"Indique cuánta dificultad le ha causado cada ítem EN LOS ÚLTIMOS 7 DÍAS con respecto a un evento específico.",
    options:[{label:"Nada",value:0},{label:"Un poco",value:1},{label:"Moderadamente",value:2},{label:"Bastante",value:3},{label:"Extremadamente",value:4}],
    questions:["Cualquier recordatorio me devolvía sentimientos al respecto","Tenía dificultad para mantenerme dormido/a","Otras cosas seguían haciéndome pensar en ello","Me sentía irritable y enojado/a","Traté de no alterarme cuando pensaba en ello","Pensé en ello aunque no quería","Sentí que no había ocurrido o que no era real","Me mantuve alejado/a de las cosas que me lo recordaban","Imágenes del evento aparecían en mi mente","Estaba nervioso/a y fácilmente me asustaba","Traté de no pensar en ello","Mis sentimientos al respecto estaban como adormecidos","Me encontré actuando como si estuviera de vuelta en ese momento","Tenía dificultad para dormirme","Sentía oleadas de sentimientos fuertes al respecto","Traté de borrarlo de mi memoria","Tenía dificultad para concentrarme","Los recordatorios me causaban reacciones físicas","Tenía sueños al respecto","Me sentía en alerta y en guardia","Traté de no hablar de ello"],
    maxScore:88,
    score:(t)=>t<=23?{level:"Sub-clínico",color:"#22c55e",desc:"Impacto sub-clínico"}:t<=32?{level:"Leve",color:"#86efac",desc:"Impacto leve"}:t<=42?{level:"Moderado",color:"#fbbf24",desc:"Probable PTSD — evaluación recomendada"}:{level:"Severo",color:"#ef4444",desc:"PTSD probable — intervención recomendada"} },
  audit:{ id:"audit",name:"AUDIT",fullName:"Alcohol Use Disorders Identification Test",category:"sustancias",duration:"4-6 min",
    instructions:"Responda sobre su consumo de alcohol en el último año.",
    options:[{label:"Nunca",value:0},{label:"1 vez o menos al mes",value:1},{label:"2-4 veces al mes",value:2},{label:"2-3 veces a la semana",value:3},{label:"4+ veces a la semana",value:4}],
    questions:["¿Con qué frecuencia consume alcohol?","¿Cuántas bebidas en un día normal?","¿Con qué frecuencia toma 6 o más bebidas?","¿No pudo parar de beber una vez que empezó?","¿No pudo hacer lo esperado por haber bebido?","¿Necesitó beber en ayunas para recuperarse?","¿Tuvo remordimientos después de beber?","¿No recordó lo que sucedió por haber bebido?","¿Alguien resultó herido por su consumo?","¿Algún profesional mostró preocupación por su consumo?"],
    maxScore:40, score:(t)=>t<=7?{level:"Bajo riesgo",color:"#22c55e",desc:"Consumo de bajo riesgo"}:t<=15?{level:"Riesgo moderado",color:"#fbbf24",desc:"Psicoeducación recomendada"}:t<=19?{level:"Alto riesgo",color:"#f97316",desc:"Intervención breve indicada"}:{level:"Dependencia probable",color:"#ef4444",desc:"Evaluación urgente"} },
  dast10:{ id:"dast10",name:"DAST-10",fullName:"Drug Abuse Screening Test-10",category:"sustancias",duration:"3-5 min",
    instructions:"Responda sobre el uso de drogas (no alcohol ni tabaco) en los últimos 12 meses.",
    options:[{label:"No",value:0},{label:"Sí",value:1}],
    questions:["¿Ha usado drogas para fines no médicos?","¿Abusa de más de una droga?","¿Puede siempre dejar de usar drogas cuando quiere?","¿Ha tenido blackouts por drogas?","¿Se siente culpable por el uso de drogas?","¿Su familia se queja de su uso de drogas?","¿Ha descuidado a su familia por las drogas?","¿Ha realizado actividades ilegales para obtener drogas?","¿Ha experimentado abstinencia?","¿Ha tenido problemas médicos por drogas?"],
    maxScore:10, score:(t)=>t===0?{level:"Sin problema",color:"#22c55e",desc:"Sin evidencia"}:t<=2?{level:"Bajo",color:"#86efac",desc:"Nivel bajo"}:t<=5?{level:"Moderado",color:"#fbbf24",desc:"Intervención recomendada"}:t<=8?{level:"Sustancial",color:"#f97316",desc:"Evaluación especializada"}:{level:"Severo",color:"#ef4444",desc:"Tratamiento intensivo"} },
  isi:{ id:"isi",name:"ISI",fullName:"Insomnia Severity Index",category:"sueno",duration:"3-5 min",
    instructions:"Indique la gravedad de su problema de sueño en las últimas 2 semanas.",
    options:[{label:"Ninguno",value:0},{label:"Leve",value:1},{label:"Moderado",value:2},{label:"Severo",value:3},{label:"Muy severo",value:4}],
    questions:["Dificultad para conciliar el sueño","Dificultad para mantener el sueño","Despertarse demasiado temprano","Satisfacción con el sueño actual","Notoriedad del problema para los demás","Preocupación por el problema de sueño","Interferencia con el funcionamiento diario"],
    maxScore:28, score:(t)=>t<=7?{level:"Sin insomnio",color:"#22c55e",desc:"Sin insomnio clínico"}:t<=14?{level:"Subumbral",color:"#86efac",desc:"Insomnio subumbral"}:t<=21?{level:"Moderado",color:"#fbbf24",desc:"Insomnio clínico moderado"}:{level:"Severo",color:"#ef4444",desc:"Insomnio severo"} },
  ess:{ id:"ess",name:"ESS",fullName:"Escala de Somnolencia de Epworth",category:"sueno",duration:"3-4 min",
    instructions:"¿Qué posibilidad tiene de quedarse dormido/a en las siguientes situaciones?",
    options:[{label:"Nunca",value:0},{label:"Baja",value:1},{label:"Moderada",value:2},{label:"Alta",value:3}],
    questions:["Sentado/a leyendo","Viendo televisión","Inactivo/a en un lugar público","Como pasajero/a en un coche","Tumbado/a por la tarde","Hablando con alguien","Sentado/a después de comer","En coche detenido en tráfico"],
    maxScore:24, score:(t)=>t<=10?{level:"Normal",color:"#22c55e",desc:"Somnolencia normal"}:t<=15?{level:"Leve",color:"#fbbf24",desc:"Somnolencia excesiva leve"}:t<=20?{level:"Moderada",color:"#f97316",desc:"Evaluación recomendada"}:{level:"Severa",color:"#ef4444",desc:"Estudio de sueño indicado"} },
  moca:{ id:"moca",name:"MoCA-B",fullName:"Montreal Cognitive Assessment (cribado)",category:"cognicion",duration:"5-8 min",
    instructions:"Responda lo mejor que pueda las siguientes preguntas.",
    options:[{label:"Incorrecto",value:0},{label:"Correcto",value:1}],
    questions:["¿Sabe en qué año estamos?","¿Sabe en qué mes estamos?","¿Qué día de la semana es hoy?","¿En qué ciudad nos encontramos?","¿Puede nombrar este lugar?","Recuerda las 3 palabras (cara, seda, iglesia)","Resta de 7 en 7 desde 100 (93)","Resta de 7 en 7 (86)","Resta de 7 en 7 (79)","¿Puede nombrar un rinoceronte?","¿En qué se parecen un tren y una bicicleta?"],
    maxScore:11, score:(t)=>t>=9?{level:"Normal",color:"#22c55e",desc:"Funcionamiento normal"}:t>=6?{level:"Deterioro leve",color:"#fbbf24",desc:"Evaluación completa recomendada"}:{level:"Deterioro significativo",color:"#ef4444",desc:"Derivación a neuropsicología"} },
  asrs:{ id:"asrs",name:"ASRS-v1.1",fullName:"Adult ADHD Self-Report Scale",category:"tdah",duration:"4-6 min",
    instructions:"¿Con qué frecuencia ha experimentado los siguientes síntomas en los últimos 6 meses?",
    options:[{label:"Nunca",value:0},{label:"Raramente",value:1},{label:"A veces",value:2},{label:"A menudo",value:3},{label:"Muy a menudo",value:4}],
    questions:["Dificultad para terminar detalles finales de proyectos","Dificultad para ordenar tareas complejas","Problemas para recordar citas","Evitar o retrasar tareas que requieren mucho pensamiento","Mover excesivamente manos o pies","Sentirse impulsado/a como por un motor","Cometer errores descuidados en proyectos","Dificultad para mantener atención en trabajos repetitivos","Dificultad para concentrarse en lo que le dicen","Perder u olvidar cosas","Distraerse por actividad o ruido","Abandonar el asiento cuando debe permanecer sentado/a","Sentirse inquieto/a","Dificultad para relajarse en tiempo libre","Hablar demasiado en situaciones sociales","Terminar frases de otros antes que ellos","Dificultad para esperar su turno","Interrumpir a los demás"],
    maxScore:72, score:(t)=>t<=16?{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores de TDAH"}:t<=30?{level:"Posible TDAH",color:"#fbbf24",desc:"Evaluación clínica recomendada"}:{level:"Alta probabilidad",color:"#ef4444",desc:"Evaluación diagnóstica indicada"} },
  bprs:{ id:"bprs",name:"BPRS",fullName:"Brief Psychiatric Rating Scale",category:"psicosis",duration:"8-12 min",
    instructions:"Evalúe la intensidad de cada síntoma durante la última semana.",
    options:[{label:"No presente",value:1},{label:"Muy leve",value:2},{label:"Leve",value:3},{label:"Moderado",value:4},{label:"Mod. severo",value:5},{label:"Severo",value:6},{label:"Extremo",value:7}],
    questions:["Preocupación somática","Ansiedad","Retraimiento emocional","Desorganización conceptual","Sentimientos de culpa","Tensión","Manierismos y posturas","Grandiosidad","Humor depresivo","Hostilidad","Desconfianza","Alucinaciones","Enlentecimiento motor","Falta de cooperación","Contenido inusual del pensamiento","Afecto embotado","Excitación","Desorientación"],
    maxScore:126, score:(t)=>t<=31?{level:"Sin psicopatología",color:"#22c55e",desc:"Sin psicopatología"}:t<=41?{level:"Leve",color:"#86efac",desc:"Psicopatología leve"}:t<=52?{level:"Moderado",color:"#fbbf24",desc:"Psicopatología moderada"}:t<=63?{level:"Mod. severo",color:"#f97316",desc:"Psicopatología moderada-severa"}:{level:"Severo",color:"#ef4444",desc:"Intervención urgente"} },
  mdq:{ id:"mdq",name:"MDQ",fullName:"Mood Disorder Questionnaire",category:"bipolar",duration:"4-6 min",
    instructions:"Responda SÍ o NO sobre períodos en que se sentía diferente a lo habitual.",
    options:[{label:"No",value:0},{label:"Sí",value:1}],
    questions:["¿Se sintió tan bien o emocionado que otros pensaron que no era usted?","¿Estuvo tan irritable que gritó o comenzó peleas?","¿Se sintió más seguro/a de sí mismo/a de lo habitual?","¿Durmió mucho menos y lo encontró innecesario?","¿Habló mucho más de lo usual o muy rápido?","¿Los pensamientos le pasaban tan rápido que no podía seguirlos?","¿Se distrajo con facilidad inusual?","¿Tuvo mucha más energía de la habitual?","¿Fue mucho más activo/a de lo habitual?","¿Fue mucho más sociable de lo habitual?","¿Fue mucho más interesado/a en el sexo?","¿Hizo cosas inusuales o arriesgadas?","¿El gasto le creó problemas a usted o su familia?"],
    maxScore:13, score:(t)=>t<=4?{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores bipolares"}:t<=6?{level:"Posible",color:"#fbbf24",desc:"Evaluación recomendada"}:{level:"Screening positivo",color:"#ef4444",desc:"Evaluación psiquiátrica indicada"} },
  ocir:{ id:"ocir",name:"OCI-R",fullName:"Obsessive-Compulsive Inventory Revised",category:"toc",duration:"4-6 min",
    instructions:"Indique cuánto le ha molestado o perturbado cada experiencia durante el último mes.",
    options:[{label:"Nada",value:0},{label:"Un poco",value:1},{label:"Moderadamente",value:2},{label:"Mucho",value:3},{label:"Muchísimo",value:4}],
    questions:["Acumulo cosas hasta que interfieren con mis actividades","Compruebo las cosas más de lo necesario","Me molesta no poder hacer las cosas en cierto orden","Me siento compelido/a a contar mientras hago ciertas cosas","Me resulta difícil tocar objetos tocados por extraños","Me resulta difícil controlar mis pensamientos","Guardo cosas que no necesito","Compruebo repetidamente puertas y ventanas","Me molesta cuando las cosas no están en cierto orden","Ciertos números tienen especial importancia","Tengo que lavarme por sentirme contaminado/a","Soy consciente de que algunos pensamientos son irracionales","No puedo tirar cosas por miedo a necesitarlas","Compruebo aparatos de gas y agua repetidamente","Necesito que las cosas estén arregladas de cierta manera","Hay números buenos y malos","Me lavo más de lo necesario","Tengo pensamientos horribles que no puedo deshacerme"],
    maxScore:72, score:(t)=>t<=20?{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores de TOC"}:t<=30?{level:"Leve",color:"#86efac",desc:"Síntomas leves"}:t<=40?{level:"Moderado",color:"#fbbf24",desc:"Evaluación recomendada"}:{level:"Severo",color:"#ef4444",desc:"Tratamiento especializado"} },
  scoff:{ id:"scoff",name:"SCOFF",fullName:"SCOFF Questionnaire",category:"alimentaria",duration:"2-3 min",
    instructions:"Responda SÍ o NO a las siguientes preguntas.",
    options:[{label:"No",value:0},{label:"Sí",value:1}],
    questions:["¿Se provoca el vómito porque se siente incómodamente lleno/a?","¿Le preocupa haber perdido el control sobre cuánto come?","¿Ha perdido más de 6 kg en 3 meses?","¿Cree que está gordo/a cuando otros dicen que está delgado/a?","¿La comida domina su vida?"],
    maxScore:5, score:(t)=>t<=1?{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores"}:{level:"Posible TCA",color:"#ef4444",desc:"Evaluación especializada recomendada"} },
  edeq:{ id:"edeq",name:"EDE-Q",fullName:"Eating Disorder Examination Questionnaire (breve)",category:"alimentaria",duration:"5-7 min",
    instructions:"Las siguientes preguntas se refieren a los últimos 28 días. Seleccione la respuesta que mejor describe su experiencia.",
    options:[{label:"Ningún día",value:0},{label:"1-5 días",value:1},{label:"6-12 días",value:2},{label:"13-15 días",value:3},{label:"16-22 días",value:4},{label:"23-27 días",value:5},{label:"Todos los días",value:6}],
    questions:["¿Intentó limitar la cantidad de alimentos para influir en su figura o peso?","¿Pasó largos períodos sin comer para influir en su figura o peso?","¿Intentó excluir alimentos de su dieta para influir en su figura o peso?","¿Intentó seguir reglas sobre su alimentación para influir en su figura o peso?","¿Deseó tener el estómago vacío?","¿Pensó que sería mejor no comer?","¿Comió en secreto?","¿Se sintió culpable después de comer?"],
    maxScore:48,
    score:(t)=>t<=12?{level:"Sin alteración",color:"#22c55e",desc:"Sin alteración significativa"}:t<=24?{level:"Leve",color:"#86efac",desc:"Monitoreo recomendado"}:t<=36?{level:"Moderado",color:"#fbbf24",desc:"Evaluación especializada recomendada"}:{level:"Severo",color:"#ef4444",desc:"TCA probable — derivación urgente"} },
  ybocs:{ id:"ybocs",name:"Y-BOCS",fullName:"Yale-Brown Obsessive Compulsive Scale (breve)",category:"toc",duration:"5-8 min",
    instructions:"Las siguientes preguntas evalúan la gravedad de los pensamientos obsesivos y comportamientos compulsivos en la última semana.",
    options:[{label:"Ninguno",value:0},{label:"Leve",value:1},{label:"Moderado",value:2},{label:"Severo",value:3},{label:"Extremo",value:4}],
    questions:["¿Cuánto tiempo ocupa con pensamientos obsesivos?","¿Cuánto interfieren los pensamientos obsesivos en su vida?","¿Cuánta angustia le producen los pensamientos obsesivos?","¿Cuánto se resiste a los pensamientos obsesivos?","¿Cuánto control tiene sobre los pensamientos obsesivos?","¿Cuánto tiempo dedica a las compulsiones?","¿Cuánto interfieren las compulsiones en su vida?","¿Cuánta angustia si no pudiera realizar las compulsiones?","¿Cuánto se resiste a las compulsiones?","¿Cuánto control tiene sobre las compulsiones?"],
    maxScore:40,
    score:(t)=>t<=7?{level:"Sub-clínico",color:"#22c55e",desc:"Sin TOC clínicamente significativo"}:t<=15?{level:"Leve",color:"#86efac",desc:"TOC leve"}:t<=23?{level:"Moderado",color:"#fbbf24",desc:"TOC moderado"}:t<=31?{level:"Severo",color:"#f97316",desc:"TOC severo"}:{level:"Extremo",color:"#ef4444",desc:"TOC extremo — intervención intensiva"} },
  bpq:{ id:"bpq",name:"BPQ",fullName:"Borderline Personality Questionnaire",category:"personalidad",duration:"5-8 min",
    instructions:"Responda sobre cómo se siente y se comporta habitualmente.",
    options:[{label:"Falso",value:0},{label:"Verdadero",value:1}],
    questions:["Mis relaciones tienen muchos altibajos","Cuando estoy enojado/a pienso que la persona es completamente mala","Mi imagen de mí mismo/a cambia con mucha frecuencia","Me comprometo en actividades impulsivas que pueden hacerme daño","He amenazado con suicidarme o me he herido","Mi estado de ánimo cambia muy rápidamente","Generalmente me siento vacío/a por dentro","Bajo estrés me vuelvo paranoico/a o me desconecto","Tengo miedo intenso a que me abandonen","A menudo actúo de manera impulsiva"],
    maxScore:10, score:(t)=>t<=3?{level:"Sin indicadores",color:"#22c55e",desc:"Sin indicadores"}:t<=5?{level:"Rasgos presentes",color:"#fbbf24",desc:"Evaluación recomendada"}:{level:"Alta probabilidad",color:"#ef4444",desc:"Diagnóstico formal indicado"} },
};

const MOCK_PROFESSIONALS = [
  { id:"prof1", name:"Dr. Rami Díaz López", specialty:"Psiquiatría", matricula:"MP 12345", email:"rami@itmed.com" },
];

const MOCK_PATIENTS = [
  { id:"p1", name:"María González", age:34, dob:"1990-03-15", email:"maria@email.com", whatsapp:"+5493413001234",
    evaluations:[
      {id:"e1",testId:"phq9",date:"2024-10-15",answers:[1,2,1,2,1,1,1,0,0],total:9},
      {id:"e2",testId:"phq9",date:"2025-01-20",answers:[0,1,1,1,0,1,1,0,0],total:5},
      {id:"e3",testId:"phq9",date:"2025-04-10",answers:[0,0,1,1,0,0,0,0,0],total:2},
      {id:"e4",testId:"gad7",date:"2025-01-20",answers:[2,2,1,2,1,1,1],total:10},
      {id:"e5",testId:"gad7",date:"2025-04-10",answers:[1,1,1,1,0,1,0],total:5},
    ]},
  { id:"p2", name:"Carlos Rodríguez", age:45, dob:"1979-07-22", email:"carlos@email.com", whatsapp:"+5493415559876",
    evaluations:[
      {id:"e6",testId:"gad7",date:"2025-02-05",answers:[2,2,2,3,1,2,1],total:13},
      {id:"e7",testId:"gad7",date:"2025-04-01",answers:[1,1,2,2,1,1,1],total:9},
      {id:"e8",testId:"audit",date:"2025-03-10",answers:[2,2,1,1,0,0,1,0,0,1],total:8},
    ]},
];

// ─── SEMÁFORO ────────────────────────────────────────────────────────────────
function getSemaforo(testId, total, prevTotal, answers) {
  const td = TESTS[testId];
  const pct = total / td.maxScore;
  const suicideRisk = (testId==="phq9"&&answers?.[8]>=2)||(testId==="bdi2"&&answers?.[8]>=2);
  if(suicideRisk) return {color:"#ef4444",label:"Rojo",desc:"Riesgo suicida — evaluación urgente",emoji:"🔴"};
  if(prevTotal!=null){
    const d=(total-prevTotal)/td.maxScore;
    if(d>=0.15) return {color:"#f97316",label:"Naranja",desc:"Cambio clínicamente relevante respecto de medición previa",emoji:"🟠",delta:total-prevTotal,worsening:true};
  }
  if(pct>=0.75) return {color:"#ef4444",label:"Rojo",desc:"Severidad alta — intervención urgente",emoji:"🔴"};
  if(pct>=0.50) return {color:"#f97316",label:"Naranja",desc:"Severidad moderada-alta — seguimiento activo",emoji:"🟠"};
  if(pct>=0.25) return {color:"#fbbf24",label:"Amarillo",desc:"Síntomas leves a moderados — monitoreo",emoji:"🟡"};
  return {color:"#22c55e",label:"Verde",desc:"Sin alerta clínica relevante",emoji:"🟢"};
}

function getNextActions(testId, total, semaforo, answers) {
  const td=TESTS[testId]; const pct=total/td.maxScore;
  const suicideRisk=(testId==="phq9"&&answers?.[8]>=2)||(testId==="bdi2"&&answers?.[8]>=2);
  const a=[];
  if(suicideRisk) a.push("Evaluar riesgo suicida de forma inmediata");
  if(semaforo.worsening) a.push("Intensificar seguimiento — cambio clínicamente relevante");
  if(pct>=0.75) a.push("Considerar interconsulta o derivación especializada");
  if(pct>=0.5) a.push("Indicar entrevista clínica en los próximos 7 días");
  if(td.category==="depresion"){if(pct>=0.5)a.push("Explorar bipolaridad y descartar causas orgánicas");a.push("Repetir escala en 14 días");}
  if(td.category==="ansiedad"){a.push("Evaluar calidad del sueño asociada");a.push("Repetir escala en 14 días");}
  if(td.category==="trauma"){a.push("Explorar red de apoyo");if(pct>=0.4)a.push("Evaluar psicoterapia orientada al trauma");}
  if(td.category==="sustancias"){a.push("Aplicar entrevista motivacional breve");}
  if(td.category==="sueno"){a.push("Revisar higiene del sueño");if(pct>=0.5)a.push("Derivar a estudio de sueño");}
  if(td.category==="cognicion"){a.push("Evaluar factores reversibles");if(pct<0.7)a.push("Evaluación neuropsicológica completa");}
  if(td.category==="bipolar"){a.push("Evaluar ciclicidad y adherencia farmacológica");}
  if(td.category==="toc"&&pct>=0.4)a.push("Considerar TCC con EPR");
  if(a.length===0) a.push("Repetir escala según protocolo habitual");
  return [...new Set(a)].slice(0,4);
}

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

async function exportPDF(patient,ev,td,text,semaforo,nextActions,status,profName){
  const JsPDF=await loadJsPDF();
  const doc=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,margin=20,col=W-margin*2;
  let y=20;
  // Header
  doc.setFillColor(15,23,42);doc.rect(0,0,W,28,"F");
  doc.setFontSize(20);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
  doc.text("COGN",margin,18);
  const cw=doc.getTextWidth("COGN");
  doc.setTextColor(175,169,236);doc.text("IA",margin+cw,18);
  doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(148,163,184);
  doc.text("EVALUACIÓN EN SALUD MENTAL",margin+cw+doc.getTextWidth("IA")+4,18);
  doc.text(new Date().toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"}),W-margin,18,{align:"right"});
  y=36;
  // Semáforo
  const sc={"Verde":[34,197,94],"Amarillo":[251,191,36],"Naranja":[249,115,22],"Rojo":[239,68,68]}[semaforo.label]||[148,163,184];
  doc.setFillColor(...sc);doc.roundedRect(margin,y,col,14,2,2,"F");
  doc.setFontSize(10);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
  doc.text(`${semaforo.label} — ${semaforo.desc}`,margin+4,y+9);
  y+=20;
  // Info
  doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(100,116,139);
  doc.text("INFORME CLÍNICO DE EVALUACIÓN PSICOLÓGICA",margin,y);y+=5;
  doc.setDrawColor(71,85,105);doc.setLineWidth(0.3);doc.line(margin,y,W-margin,y);y+=5;
  const sr=td.score(ev.total);
  const rows=[["Paciente",patient.name+(patient.age?`, ${patient.age} años`:"")],["Instrumento",`${td.fullName} (${td.name})`],["Área",CATEGORIES[td.category]?.label||td.category],["Puntaje",`${ev.total}/${td.maxScore} — ${sr.level}`],["Fecha evaluación",ev.date],["Estado",status||"Generado"],profName?["Profesional",profName]:null].filter(Boolean);
  rows.forEach(([l,v])=>{
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(71,85,105);doc.text(l+":",margin,y);
    doc.setFont("helvetica","normal");doc.setTextColor(30,30,30);doc.text(v,margin+44,y);y+=6;
  });
  y+=2;doc.setDrawColor(220,220,220);doc.line(margin,y,W-margin,y);y+=5;
  // Report text
  doc.setFontSize(10);doc.setFont("helvetica","bold");doc.setTextColor(30,30,30);doc.text("INFORME CLÍNICO",margin,y);y+=6;
  const cleanText=(text||"").replace(/\*\*/g,"").replace(/###/g,"").replace(/##/g,"");
  cleanText.split("\n").filter(l=>l.trim()).forEach(line=>{
    if(y>265){doc.addPage();y=20;}
    const isH=/^\d+\./.test(line.trim())||line.trim().endsWith(":");
    doc.setFontSize(isH?10:9.5);doc.setFont("helvetica",isH?"bold":"normal");doc.setTextColor(isH?30:60,isH?30:60,isH?30:60);
    const w=doc.splitTextToSize(line,col);doc.text(w,margin,y);y+=w.length*(isH?5:4.5)+(isH?2:1);
  });
  y+=4;doc.setDrawColor(220,220,220);doc.line(margin,y,W-margin,y);y+=4;
  // Next actions
  if(nextActions?.length>0){
    if(y>240){doc.addPage();y=20;}
    doc.setFontSize(10);doc.setFont("helvetica","bold");doc.setTextColor(30,30,30);doc.text("PRÓXIMAS ACCIONES SUGERIDAS",margin,y);y+=4;
    doc.setFontSize(8);doc.setFont("helvetica","italic");doc.setTextColor(100,116,139);doc.text("Requieren validación profesional",margin,y);y+=7;
    nextActions.forEach((a,i)=>{
      if(y>270){doc.addPage();y=20;}
      doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(30,30,30);
      const w=doc.splitTextToSize(`${i+1}. ${a}`,col-4);doc.text(w,margin+2,y);y+=w.length*5+3;
    });
    y+=2;doc.setDrawColor(220,220,220);doc.line(margin,y,W-margin,y);y+=4;
  }
  // Firma
  if(status==="firmado"&&profName){
    if(y>250){doc.addPage();y=20;}
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(34,197,94);
    doc.text("INFORME FIRMADO DIGITALMENTE",margin,y);y+=5;
    doc.setFont("helvetica","normal");doc.setTextColor(71,85,105);
    doc.text(`Profesional: ${profName}`,margin,y);y+=5;
    doc.text(`Fecha de firma: ${new Date().toLocaleDateString("es-AR")}`,margin,y);y+=5;
    doc.text("Sistema COGNIA — Evaluaciones en Salud Mental — ITMED",margin,y);y+=5;
  }
  // Footer
  const tp=doc.internal.getNumberOfPages();
  for(let i=1;i<=tp;i++){
    doc.setPage(i);doc.setFillColor(15,23,42);doc.rect(0,287,W,10,"F");
    doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(148,163,184);
    doc.text("COGNIA · Evaluaciones en Salud Mental · Uso exclusivo del profesional tratante",margin,293);
    doc.text(`Pág. ${i}/${tp}`,W-margin,293,{align:"right"});
  }
  doc.save(`COGNIA_${td.name}_${patient.name.replace(/\s+/g,"_")}_${ev.date}.pdf`);
}

// ─── CLAUDE API ──────────────────────────────────────────────────────────────
async function generateReport(patient,ev,td){
  const sr=td.score(ev.total);
  const prevEvals=patient.evaluations.filter(e=>e.testId===ev.testId&&e.id!==ev.id).sort((a,b)=>a.date.localeCompare(b.date));
  const prev=prevEvals.length>0?prevEvals[prevEvals.length-1]:null;
  const sem=getSemaforo(ev.testId,ev.total,prev?.total??null,ev.answers);
  const next=getNextActions(ev.testId,ev.total,sem,ev.answers);
  const trend=prev?`Evaluación previa: ${prev.total} pts (${prev.date}). Cambio: ${ev.total-prev.total>0?"+":""}${ev.total-prev.total} pts — ${sem.worsening?"EMPEORAMIENTO CLÍNICAMENTE RELEVANTE":ev.total<prev.total?"mejoría clínica":"sin cambio"}.`:"Primera evaluación registrada.";
  const suicideAlert=(ev.testId==="phq9"&&ev.answers?.[8]>=2)||(ev.testId==="bdi2"&&ev.answers?.[8]>=2);
  const prompt=`Eres asistente clínico en salud mental. Genera informe clínico profesional en español.

Paciente: ${patient.name}, ${patient.age} años
Instrumento: ${td.fullName} (${td.name})
Área: ${CATEGORIES[td.category]?.label}
Puntaje: ${ev.total}/${td.maxScore} — ${sr.level}
Alerta: ${sem.label} — ${sem.desc}
Fecha: ${ev.date}
${trend}
${suicideAlert?"ALERTA URGENTE: Presencia de ideación suicida.":""}

Incluir: 1. Resumen ejecutivo (2-3 oraciones) 2. Interpretación clínica 3. ${sem.worsening?"Análisis del empeoramiento":"Áreas de atención prioritaria"} 4. 3-4 líneas terapéuticas basadas en evidencia 5. Próximas acciones sugeridas: ${next.join("; ")} (aclarar que requieren validación profesional)

Tono clínico, empático, basado en evidencia. Máximo 420 palabras.`;
  const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5-20251001",max_tokens:1200,messages:[{role:"user",content:prompt}]})});
  const data=await r.json();
  return {text:data.content?.[0]?.text||"No se pudo generar el informe.",semaforo:sem,nextActions:next};
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const CatTag=({cat})=><span style={{background:CATEGORIES[cat].color+"22",color:CATEGORIES[cat].color,border:`1px solid ${CATEGORIES[cat].color}44`,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{CATEGORIES[cat].label}</span>;
const TestTag=({test})=><span style={{background:CATEGORIES[test.category].color+"22",color:CATEGORIES[test.category].color,border:`1px solid ${CATEGORIES[test.category].color}44`,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700,letterSpacing:1,fontFamily:"monospace"}}>{test.name}</span>;

const ScoreMeter=({total,max,sr})=>{
  const pct=Math.round((total/max)*100);
  return(
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

function EvolutionChart({patient,testId}){
  const evals=patient.evaluations.filter(e=>e.testId===testId).sort((a,b)=>a.date.localeCompare(b.date));
  if(evals.length<2) return <p style={{color:"#475569",fontSize:13,textAlign:"center",padding:20}}>Se necesitan al menos 2 evaluaciones para ver evolución.</p>;
  const td=TESTS[testId];const W=340,H=140,pad=36;
  const xs=evals.map((_,i)=>pad+(i/(evals.length-1))*(W-pad*2));
  const ys=evals.map(e=>H-pad-((e.total/td.maxScore)*(H-pad*2)));
  const path=xs.map((x,i)=>`${i===0?"M":"L"} ${x} ${ys[i]}`).join(" ");
  return(
    <div style={{background:"#0f172a",borderRadius:12,padding:16,marginTop:12}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxHeight:140}}>
        {[0,.25,.5,.75,1].map(v=><line key={v} x1={pad} y1={H-pad-v*(H-pad*2)} x2={W-pad} y2={H-pad-v*(H-pad*2)} stroke="#1e293b" strokeWidth={1}/>)}
        <path d={path} fill="none" stroke={CATEGORIES[td.category].color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        {evals.map((e,i)=>{
          const sr=td.score(e.total);
          return(<g key={e.id}><circle cx={xs[i]} cy={ys[i]} r={6} fill={sr.color}/><text x={xs[i]} y={H-4} textAnchor="middle" fontSize={9} fill="#64748b">{e.date.slice(5)}</text><text x={xs[i]} y={ys[i]-12} textAnchor="middle" fontSize={11} fill="#e2e8f0" fontWeight="600">{e.total}</text></g>);
        })}
      </svg>
    </div>
  );
}

// ─── STATISTICS VIEW ─────────────────────────────────────────────────────────
function Statistics({patients}){
  const allEvals=patients.flatMap(p=>p.evaluations.map(e=>({...e,patient:p})));
  const byTest={};
  allEvals.forEach(e=>{
    if(!byTest[e.testId]) byTest[e.testId]={name:TESTS[e.testId].name,counts:{Verde:0,Amarillo:0,Naranja:0,Rojo:0},total:0};
    const prev=patients.find(p=>p.id===e.patient.id)?.evaluations.filter(x=>x.testId===e.testId&&x.id!==e.id).sort((a,b)=>a.date.localeCompare(b.date));
    const prevLast=prev?.length>0?prev[prev.length-1]:null;
    const sem=getSemaforo(e.testId,e.total,prevLast?.total??null,e.answers);
    byTest[e.testId].counts[sem.label]=(byTest[e.testId].counts[sem.label]||0)+1;
    byTest[e.testId].total++;
  });
  const semColors={Verde:"#22c55e",Amarillo:"#fbbf24",Naranja:"#f97316",Rojo:"#ef4444"};
  return(
    <div>
      <h2 style={{fontFamily:"'DM Serif Display'",fontSize:28,color:"#f1f5f9",margin:"0 0 4px"}}>Estadísticas</h2>
      <p style={{color:"#64748b",fontSize:13,marginBottom:24}}>Distribución clínica por instrumento</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        {[{label:"Pacientes",value:patients.length},{label:"Evaluaciones",value:allEvals.length},{label:"Tests activos",value:Object.keys(byTest).length}].map(s=>(
          <div key={s.label} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:20}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#475569",textTransform:"uppercase",margin:"0 0 8px"}}>{s.label}</p>
            <p style={{fontSize:36,fontFamily:"'DM Serif Display'",color:"#AFA9EC",margin:0}}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
        {Object.values(byTest).map(({name,counts,total})=>(
          <div key={name} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{margin:0,fontSize:14,fontWeight:700,color:"#e2e8f0"}}>{name}</p>
              <p style={{margin:0,fontSize:11,color:"#475569"}}>{total} eval.</p>
            </div>
            {["Verde","Amarillo","Naranja","Rojo"].map(level=>{
              const count=counts[level]||0;
              const pct=total>0?Math.round((count/total)*100):0;
              return(
                <div key={level} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:semColors[level],fontWeight:600}}>{level}</span>
                    <span style={{fontSize:11,color:"#64748b"}}>{count} ({pct}%)</span>
                  </div>
                  <div style={{background:"#1e293b",borderRadius:99,height:6}}>
                    <div style={{width:`${pct}%`,height:"100%",background:semColors[level],borderRadius:99,transition:"width 0.8s ease"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {allEvals.length===0&&<div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:48,textAlign:"center"}}><p style={{color:"#475569",fontSize:14}}>Sin evaluaciones todavía.</p></div>}
    </div>
  );
}

// ─── PATIENT TEST VIEW ────────────────────────────────────────────────────────
function PatientTestView({testId,patientName,onComplete}){
  const test=TESTS[testId];const cat=CATEGORIES[test.category];
  const [answers,setAnswers]=useState(Array(test.questions.length).fill(null));
  const [submitted,setSubmitted]=useState(false);
  const allAnswered=answers.every(a=>a!==null);
  const total=answers.reduce((s,a)=>s+(a??0),0);
  const sr=test.score(total);
  return(
    <div style={{minHeight:"100vh",background:"#070c18",display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <div style={{width:"100%",maxWidth:560}}>
        <div style={{marginBottom:28,textAlign:"center"}}>
          <CatTag cat={test.category}/>
          <h1 style={{color:"#f1f5f9",fontFamily:"'DM Serif Display'",fontSize:26,margin:"12px 0 4px"}}>{test.fullName}</h1>
          <p style={{color:"#64748b",fontSize:13}}>Hola, <strong style={{color:"#94a3b8"}}>{patientName}</strong> · {test.duration}</p>
        </div>
        {!submitted?(
          <>
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:18,marginBottom:20}}>
              <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.6,margin:0}}>{test.instructions}</p>
            </div>
            {test.questions.map((q,qi)=>(
              <div key={qi} style={{background:"#0f172a",border:`1px solid ${answers[qi]!==null?cat.color+"55":"#1e293b"}`,borderRadius:14,padding:18,marginBottom:10,transition:"border-color 0.3s"}}>
                <p style={{color:"#e2e8f0",fontSize:14,margin:"0 0 14px",lineHeight:1.5}}><span style={{color:cat.color,fontWeight:700,marginRight:8}}>{qi+1}.</span>{q}</p>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {test.options.map(opt=>(
                    <button key={opt.value} onClick={()=>{const n=[...answers];n[qi]=opt.value;setAnswers(n);}} style={{background:answers[qi]===opt.value?cat.color+"33":"transparent",border:`1px solid ${answers[qi]===opt.value?cat.color:"#334155"}`,borderRadius:9,padding:"9px 14px",color:answers[qi]===opt.value?"#f1f5f9":"#94a3b8",cursor:"pointer",textAlign:"left",fontSize:13,transition:"all 0.2s",fontFamily:"inherit"}}>{opt.label}</button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{textAlign:"center",marginTop:20}}>
              <p style={{color:"#64748b",fontSize:12,marginBottom:14}}>{answers.filter(a=>a!==null).length}/{test.questions.length} respondidas</p>
              <button onClick={()=>setSubmitted(true)} disabled={!allAnswered} style={{background:allAnswered?cat.color:"#1e293b",color:allAnswered?"#fff":"#475569",border:"none",borderRadius:11,padding:"13px 36px",fontSize:15,fontWeight:600,cursor:allAnswered?"pointer":"not-allowed",fontFamily:"inherit",transition:"all 0.3s"}}>Enviar respuestas →</button>
            </div>
          </>
        ):(
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
            <button onClick={()=>onComplete(answers,total)} style={{marginTop:18,background:"transparent",border:"1px solid #334155",borderRadius:9,padding:"9px 22px",color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>← Volver al panel (demo)</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN MODULE ──────────────────────────────────────────────────────────────
export default function SaludMental({onBack, professional, supabase}){
  const [patients,setPatients]=useState([]);
  const [dbLoading,setDbLoading]=useState(true);

  // Load patients from Supabase
  useEffect(()=>{
    if(!supabase||!professional){setDbLoading(false);return;}
    let mounted=true;
    const loadPatients=async()=>{
      setDbLoading(true);
      try{
        const {data:pats}=await supabase.from("patients").select("*").eq("professional_id",professional.id).order("created_at",{ascending:false});
        if(!mounted) return;
        if(pats&&pats.length>0){
          const patsWithEvals=await Promise.all(pats.map(async p=>{
            const {data:evals}=await supabase.from("evaluations").select("*").eq("patient_id",p.id).order("date",{ascending:true});
            return {...p,age:p.dob?Math.floor((new Date()-new Date(p.dob))/31557600000):0,evaluations:(evals||[]).map(e=>({...e,testId:e.test_id,answers:e.answers||[]}))};
          }));
          if(mounted) setPatients(patsWithEvals);
        }
      } catch(err){console.error("Load error:",err);}
      if(mounted) setDbLoading(false);
    };
    loadPatients();
    return ()=>{mounted=false;};
  },[professional]);
  const [professionals]=useState(MOCK_PROFESSIONALS);
  const [view,setView]=useState("dashboard");
  const [selectedPatientId,setSelectedPatientId]=useState(null);
  const [report,setReport]=useState(null);
  const [simulatingTest,setSimulatingTest]=useState(null);
  const [assignTest,setAssignTest]=useState(null);
  const [linkCopied,setLinkCopied]=useState(false);
  const [activeTab,setActiveTab]=useState("evaluaciones");
  const [showNewPatient,setShowNewPatient]=useState(false);
  const [newForm,setNewForm]=useState({name:"",age:"",dob:"",email:"",whatsapp:""});
  const [catFilter,setCatFilter]=useState("all");
  const [searchTest,setSearchTest]=useState("");
  const [assignDropdownOpen,setAssignDropdownOpen]=useState(false);
  const [reportStatus,setReportStatus]=useState({});
  const [profProfile,setProfProfile]=useState({tipo:professional?.especialidad||"Psiquiatra",nombre:professional?(professional.nombre+" "+professional.apellido):"",matricula:professional?.matricula||""});
  const profName = profProfile.nombre ? `${profProfile.tipo} ${profProfile.nombre}${profProfile.matricula?" — Mat. "+profProfile.matricula:""}` : "";
  const [showProfModal,setShowProfModal]=useState(false);
  const [pdfLoading,setPdfLoading]=useState(false);
  const [scheduledTests,setScheduledTests]=useState({});

  const currentPatient=selectedPatientId?patients.find(p=>p.id===selectedPatientId):null;

  const handleCompleteTest=async(patientId,testId,answers,total)=>{
    const today=new Date().toISOString().slice(0,10);
    const prevEvals=patients.find(p=>p.id===patientId)?.evaluations.filter(e=>e.testId===testId).sort((a,b)=>a.date.localeCompare(b.date))||[];
    const prev=prevEvals.length>0?prevEvals[prevEvals.length-1]:null;
    const sem=getSemaforo(testId,total,prev?.total??null,answers);
    let newEval={id:"e"+Date.now(),testId,date:today,answers,total};
    if(supabase&&professional){
      const {data}=await supabase.from("evaluations").insert({
        patient_id:patientId,professional_id:professional.id,
        test_id:testId,date:today,answers:answers,total,aptitud:sem.label
      }).select().single();
      if(data) newEval={...data,testId:data.test_id,answers:data.answers||answers};
    }
    setPatients(prev=>prev.map(p=>p.id===patientId?{...p,evaluations:[...p.evaluations,newEval]}:p));
    setSimulatingTest(null);setView("patient");
  };

  const handleGenerateReport=async(patient,ev)=>{
    const td=TESTS[ev.testId];
    const prevEvals=patient.evaluations.filter(e=>e.testId===ev.testId&&e.id!==ev.id).sort((a,b)=>a.date.localeCompare(b.date));
    const prev=prevEvals.length>0?prevEvals[prevEvals.length-1]:null;
    const sem=getSemaforo(ev.testId,ev.total,prev?.total??null,ev.answers);
    const next=getNextActions(ev.testId,ev.total,sem,ev.answers);
    setReport({loading:true,text:null,ev,patient,semaforo:sem,nextActions:next});
    setReportStatus(s=>({...s,[ev.id]:s[ev.id]||"generado"}));
    try{
      const res=await generateReport(patient,ev,td);
      setReport(r=>({...r,loading:false,...res}));
    }catch{setReport(r=>({...r,loading:false,text:"Error al generar el informe."}));}
  };

  const handleAddPatient=async()=>{
    if(!newForm.name) return;
    const age=newForm.dob?Math.floor((new Date()-new Date(newForm.dob))/31557600000):parseInt(newForm.age)||0;
    if(supabase&&professional){
      const {data,error}=await supabase.from("patients").insert({
        professional_id:professional.id,name:newForm.name,
        dob:newForm.dob||null,email:newForm.email,whatsapp:newForm.whatsapp
      }).select().single();
      if(data) setPatients(prev=>[{...data,age,evaluations:[]},...prev]);
    } else {
      const p={id:"p"+Date.now(),...newForm,age,evaluations:[]};
      setPatients(prev=>[...prev,p]);
    }
    setNewForm({name:"",age:"",dob:"",email:"",whatsapp:""});setShowNewPatient(false);
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
    input:{width:"100%",background:"#070c18",border:"1px solid #334155",borderRadius:9,padding:"9px 12px",color:"#e2e8f0",fontSize:13,fontFamily:"inherit",boxSizing:"border-box"},
  };

  const filteredTests=Object.values(TESTS).filter(t=>{
    const mc=catFilter==="all"||t.category===catFilter;
    const ms=t.name.toLowerCase().includes(searchTest.toLowerCase())||t.fullName.toLowerCase().includes(searchTest.toLowerCase());
    return mc&&ms;
  });

  return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}`}</style>

      {/* MODALS */}
      {assignTest&&(
        <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...S.card,maxWidth:440,width:"90%",animation:"fadeIn 0.2s ease"}}>
            <h3 style={{color:"#f1f5f9",margin:"0 0 4px",fontFamily:"'DM Serif Display'"}}>Enviar test al paciente</h3>
            <p style={{color:"#64748b",fontSize:13,marginBottom:14}}>Compartí este link con <strong style={{color:"#94a3b8"}}>{assignTest.patientName}</strong></p>
            <TestTag test={TESTS[assignTest.testId]}/>
            <div style={{background:"#070c18",borderRadius:9,padding:12,margin:"12px 0",border:"1px solid #334155",wordBreak:"break-all"}}>
              <span style={{color:"#64748b",fontSize:11,fontFamily:"monospace"}}>https://cognia.itmed.com/test/{assignTest.testId}?pid={assignTest.patientId}&token=demo</span>
            </div>
            {/* Schedule next test */}
            <div style={{marginBottom:14}}>
              <p style={{...S.label,marginBottom:6}}>Programar próxima evaluación</p>
              <input type="date" value={scheduledTests[assignTest.patientId+assignTest.testId]||""} onChange={e=>setScheduledTests(s=>({...s,[assignTest.patientId+assignTest.testId]:e.target.value}))} style={{...S.input,marginBottom:6}}/>
              {scheduledTests[assignTest.patientId+assignTest.testId]&&<p style={{fontSize:11,color:"#22c55e",margin:0}}>✓ Próximo envío programado: {scheduledTests[assignTest.patientId+assignTest.testId]}</p>}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {assignTest.patientWhatsapp&&(
                <a href={`https://wa.me/${assignTest.patientWhatsapp.replace(/\D/g,"")}?text=Hola%2C%20te%20enviamos%20tu%20evaluación%20COGNIA%3A%20https%3A%2F%2Fcognia.itmed.com%2Ftest%2F${assignTest.testId}%3Fpid%3D${assignTest.patientId}%26token%3Ddemo`} target="_blank" rel="noopener noreferrer" style={{...S.btn("#25D366"),flex:1,fontSize:12,textDecoration:"none",textAlign:"center",display:"block",padding:"9px"}}>📱 WhatsApp</a>
              )}
              <button style={{...S.btn("#3b82f6"),flex:1,fontSize:12}} onClick={()=>{setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2000);}}>✉️ Email</button>
            </div>
            {linkCopied&&<p style={{color:"#22c55e",fontSize:12,textAlign:"center",margin:"0 0 10px"}}>✓ Link copiado</p>}
            <div style={{borderTop:"1px solid #1e293b",paddingTop:12,display:"flex",gap:8}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>setAssignTest(null)}>Cancelar</button>
              <button style={{...S.btn("#7c3aed"),flex:1,fontSize:12}} onClick={()=>{setAssignTest(null);setSimulatingTest({testId:assignTest.testId,patientId:assignTest.patientId,patientName:assignTest.patientName});}}>🧪 Simular</button>
            </div>
          </div>
        </div>
      )}

      {report&&(
        <div style={{position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{...S.card,maxWidth:600,width:"100%",maxHeight:"90vh",overflow:"auto",animation:"fadeIn 0.2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:14}}>
              <div><h3 style={{color:"#f1f5f9",margin:"0 0 2px",fontFamily:"'DM Serif Display'",fontSize:20}}>Informe clínico</h3><p style={{color:"#64748b",fontSize:11,margin:0}}>Generado con IA · Claude Sonnet</p></div>
              <button style={{...S.ghost,padding:"4px 10px"}} onClick={()=>setReport(null)}>✕</button>
            </div>
            {report.semaforo&&(
              <div style={{background:report.semaforo.color+"18",border:`1px solid ${report.semaforo.color}44`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>{report.semaforo.emoji}</span>
                <div><p style={{margin:0,fontSize:13,fontWeight:700,color:report.semaforo.color}}>{report.semaforo.label}</p><p style={{margin:0,fontSize:12,color:"#94a3b8"}}>{report.semaforo.desc}</p></div>
              </div>
            )}
            {report.loading?(
              <div style={{textAlign:"center",padding:40}}>
                <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #1e293b",borderTopColor:"#7c3aed",margin:"0 auto 14px",animation:"spin 1s linear infinite"}}/>
                <p style={{color:"#64748b",fontSize:13}}>Generando informe con IA…</p>
              </div>
            ):(
              <>
                <div style={{background:"#070c18",borderRadius:11,padding:18,border:"1px solid #1e293b",fontSize:13,lineHeight:1.9,color:"#cbd5e1",whiteSpace:"pre-wrap",marginBottom:14}}>{report.text}</div>
                {report.nextActions?.length>0&&(
                  <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:11,padding:16,marginBottom:14}}>
                    <p style={{...S.label,margin:"0 0 6px"}}>Próxima acción sugerida</p>
                    <p style={{fontSize:11,color:"#475569",margin:"0 0 10px",fontStyle:"italic"}}>Requieren validación y aprobación profesional</p>
                    {report.nextActions.map((a,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7}}><span style={{color:"#7c3aed",fontSize:14}}>→</span><p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{a}</p></div>)}
                  </div>
                )}
                {report.ev&&(
                  <div style={{borderTop:"1px solid #1e293b",paddingTop:14}}>
                    <p style={{...S.label,margin:"0 0 10px"}}>Estado del informe</p>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                      {[{id:"generado",label:"Generado",color:"#64748b"},{id:"revisado",label:"Revisado",color:"#3b82f6"},{id:"corregido",label:"Corregido",color:"#f59e0b"},{id:"firmado",label:"Firmado",color:"#22c55e"},{id:"archivado",label:"Archivado",color:"#475569"}].map(s=>{
                        const active=(reportStatus[report.ev.id]||"generado")===s.id;
                        return(<button key={s.id} onClick={()=>setReportStatus(prev=>({...prev,[report.ev.id]:s.id}))} style={{background:active?s.color+"33":"transparent",border:`1px solid ${active?s.color:"#334155"}`,borderRadius:8,padding:"6px 14px",color:active?s.color:"#64748b",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:active?700:400}}>{s.label}</button>);
                      })}
                    </div>
                    <div style={{marginBottom:12,background:"#070c18",borderRadius:9,padding:"10px 14px",border:"1px solid #334155",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                      <div>
                        <p style={{...S.label,margin:"0 0 3px"}}>Profesional firmante</p>
                        {profName?<p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{profName}</p>:<p style={{margin:0,fontSize:13,color:"#475569",fontStyle:"italic"}}>Sin profesional cargado</p>}
                      </div>
                      <button onClick={()=>setShowProfModal(true)} style={{...S.ghost,flexShrink:0,fontSize:11}}>Editar</button>
                    </div>
                    {reportStatus[report.ev.id]==="firmado"&&<p style={{fontSize:11,color:"#22c55e",marginBottom:10}}>✓ Firmado — {profName||"profesional"} · {new Date().toLocaleDateString("es-AR")}</p>}
                    <button disabled={pdfLoading||!report.text} onClick={async()=>{setPdfLoading(true);try{await exportPDF(report.patient,report.ev,TESTS[report.ev.testId],report.text,report.semaforo,report.nextActions,reportStatus[report.ev.id]||"generado",profName);}finally{setPdfLoading(false);}}} style={{width:"100%",background:pdfLoading?"#1e293b":"#7c3aed",color:pdfLoading?"#475569":"#fff",border:"none",borderRadius:10,padding:"12px",fontSize:14,fontWeight:700,cursor:pdfLoading?"not-allowed":"pointer",fontFamily:"inherit"}}>
                      {pdfLoading?"Generando PDF…":"⬇ Descargar informe PDF"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showNewPatient&&(
        <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...S.card,maxWidth:400,width:"90%",animation:"fadeIn 0.2s ease"}}>
            <h3 style={{color:"#f1f5f9",margin:"0 0 18px",fontFamily:"'DM Serif Display'"}}>Nuevo paciente</h3>
            {[["name","Nombre completo","text"],["dob","Fecha de nacimiento","date"],["email","Email","email"],["whatsapp","WhatsApp (con código de área)","tel"]].map(([f,l,t])=>(
              <div key={f} style={{marginBottom:12}}>
                <p style={{...S.label,marginBottom:5}}>{l}</p>
                <input type={t} placeholder={f==="whatsapp"?"+54 9 341 000 0000":""} value={newForm[f]} onChange={e=>setNewForm(p=>({...p,[f]:e.target.value}))} style={S.input}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:18}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>setShowNewPatient(false)}>Cancelar</button>
              <button style={{...S.btn(),flex:1}} onClick={handleAddPatient}>Agregar</button>
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
                {["Psiquiatra","Psicólogo/a","Médico/a","Neuropsicólogo/a","Otro"].map(t=>(
                  <button key={t} onClick={()=>setProfProfile(p=>({...p,tipo:t}))} style={{background:profProfile.tipo===t?"#7c3aed33":"transparent",border:`1px solid ${profProfile.tipo===t?"#7c3aed":"#334155"}`,borderRadius:8,padding:"6px 14px",color:profProfile.tipo===t?"#AFA9EC":"#64748b",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <p style={{...S.label,marginBottom:6}}>Nombre y apellido</p>
              <input placeholder="Ej: María García" value={profProfile.nombre} onChange={e=>setProfProfile(p=>({...p,nombre:e.target.value}))} style={S.input}/>
            </div>
            <div style={{marginBottom:20}}>
              <p style={{...S.label,marginBottom:6}}>Matrícula</p>
              <input placeholder="Ej: MP 12345 o MN 67890" value={profProfile.matricula} onChange={e=>setProfProfile(p=>({...p,matricula:e.target.value}))} style={S.input}/>
            </div>
            {profProfile.nombre&&(
              <div style={{background:"#070c18",borderRadius:9,padding:"10px 14px",border:"1px solid #334155",marginBottom:16}}>
                <p style={{...S.label,margin:"0 0 4px"}}>Vista previa en informe</p>
                <p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{profProfile.tipo} {profProfile.nombre}{profProfile.matricula?" — Mat. "+profProfile.matricula:""}</p>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.ghost,flex:1}} onClick={()=>setShowProfModal(false)}>Cancelar</button>
              <button style={{...S.btn("#7c3aed"),flex:1}} onClick={()=>setShowProfModal(false)}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={{marginBottom:24}}>
          <button onClick={onBack} style={{background:"transparent",border:"none",color:"#475569",cursor:"pointer",fontSize:11,fontFamily:"inherit",padding:"0 0 10px",display:"flex",alignItems:"center",gap:4}}>← Inicio</button>
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
          <p style={{fontSize:10,fontWeight:600,letterSpacing:3,color:"#475569",textTransform:"uppercase",margin:0}}>salud mental</p>
        </div>
        {[{id:"dashboard",label:"Panel",icon:"◈"},{id:"tests",label:"Tests",icon:"◎"},{id:"stats",label:"Estadísticas",icon:"◉"}].map(item=>(
          <button key={item.id} onClick={()=>setView(item.id)} style={{background:view===item.id?"#1e293b":"transparent",border:"none",borderRadius:9,padding:"9px 12px",color:view===item.id?"#e2e8f0":"#64748b",cursor:"pointer",textAlign:"left",fontSize:13,fontFamily:"inherit",display:"flex",gap:9,alignItems:"center",marginBottom:3,width:"100%"}}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
        <div style={{margin:"18px 0 8px"}}><p style={{...S.label,paddingLeft:12,marginBottom:7}}>Pacientes</p></div>
        {patients.map(p=>(
          <button key={p.id} onClick={()=>{setSelectedPatientId(p.id);setView("patient");setReport(null);setActiveTab("evaluaciones");}} style={{background:(view==="patient"&&selectedPatientId===p.id)?"#1e293b":"transparent",border:"none",borderRadius:9,padding:"7px 12px",color:(view==="patient"&&selectedPatientId===p.id)?"#e2e8f0":"#64748b",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"inherit",marginBottom:2,width:"100%",display:"flex",alignItems:"center",gap:9}}>
            <span style={{width:22,height:22,borderRadius:"50%",background:"#1e293b",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#AFA9EC",flexShrink:0}}>{p.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</span>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
          </button>
        ))}
        <button onClick={()=>setShowNewPatient(true)} style={{background:"transparent",border:"1px dashed #334155",borderRadius:9,padding:"7px 12px",color:"#475569",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"inherit",marginTop:6,width:"100%"}}>+ Nuevo paciente</button>
        <div style={{marginTop:"auto",paddingTop:20,borderTop:"1px solid #1e293b"}}>
          <button onClick={()=>setShowProfModal(true)} style={{width:"100%",background:"transparent",border:"1px solid #334155",borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"#7c3aed22",border:"1px solid #7c3aed44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>👤</div>
            <div style={{overflow:"hidden"}}>
              {profProfile.nombre?<><p style={{margin:0,fontSize:11,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profProfile.nombre}</p><p style={{margin:0,fontSize:10,color:"#7c3aed"}}>{profProfile.tipo}</p></>:<p style={{margin:0,fontSize:11,color:"#475569"}}>Cargar perfil profesional</p>}
            </div>
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {/* LOADING */}
        {dbLoading&&<div style={{position:"fixed",inset:0,background:"#070c18cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500}}><div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #1e293b",borderTopColor:"#7c3aed",animation:"spin 1s linear infinite"}}/></div>}

        {/* DASHBOARD */}
        {view==="dashboard"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>Panel general</h1>
            <p style={{color:"#64748b",fontSize:13,marginBottom:28}}>Resumen de actividad clínica</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
              {[{label:"Pacientes",value:patients.length,color:"#AFA9EC"},{label:"Evaluaciones",value:patients.reduce((s,p)=>s+p.evaluations.length,0),color:"#8b5cf6"},{label:"Tests disponibles",value:Object.keys(TESTS).length,color:"#22c55e"}].map(st=>(
                <div key={st.label} style={S.card}><p style={{...S.label,marginBottom:10}}>{st.label}</p><p style={{fontSize:38,fontFamily:"'DM Serif Display'",color:st.color,margin:0}}>{st.value}</p></div>
              ))}
            </div>
            <h2 style={{color:"#64748b",fontSize:14,fontWeight:600,marginBottom:14}}>Últimas evaluaciones</h2>
            <div style={S.card}>
              {patients.flatMap(p=>p.evaluations.map(e=>({...e,patient:p}))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(e=>{
                const td=TESTS[e.testId];const sr=td.score(e.total);
                const prev=e.patient.evaluations.filter(x=>x.testId===e.testId&&x.id!==e.id).sort((a,b)=>a.date.localeCompare(b.date));
                const sem=getSemaforo(e.testId,e.total,prev.length>0?prev[prev.length-1].total:null,e.answers);
                return(
                  <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #1e293b"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:16}}>{sem.emoji}</span>
                      <TestTag test={td}/>
                      <div><p style={{margin:0,fontSize:13,color:"#e2e8f0"}}>{e.patient.name}</p><p style={{margin:0,fontSize:11,color:"#475569"}}>{e.date}</p></div>
                    </div>
                    <div style={{textAlign:"right"}}><p style={{margin:0,fontSize:13,fontWeight:700,color:sr.color}}>{sr.level}</p><p style={{margin:0,fontSize:11,color:"#475569"}}>{e.total} pts</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TESTS */}
        {view==="tests"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>Tests disponibles</h1>
            <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>{Object.keys(TESTS).length} instrumentos en {Object.keys(CATEGORIES).length} categorías</p>
            <input placeholder="Buscar test…" value={searchTest} onChange={e=>setSearchTest(e.target.value)} style={{...S.input,maxWidth:320,marginBottom:16}}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
              <button onClick={()=>setCatFilter("all")} style={{...S.ghost,background:catFilter==="all"?"#1e293b":"transparent",color:catFilter==="all"?"#e2e8f0":"#64748b",borderRadius:20,padding:"5px 14px",fontSize:12}}>Todas</button>
              {Object.entries(CATEGORIES).map(([k,c])=>(
                <button key={k} onClick={()=>setCatFilter(k)} style={{background:catFilter===k?c.color+"33":"transparent",border:`1px solid ${catFilter===k?c.color:"#334155"}`,borderRadius:20,padding:"5px 14px",color:catFilter===k?c.color:"#64748b",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{c.label}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
              {filteredTests.map(test=>{
                const cat=CATEGORIES[test.category];
                return(
                  <div key={test.id} style={{...S.card,borderTopWidth:3,borderTopColor:cat.color}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}><TestTag test={test}/><span style={{fontSize:11,color:"#475569"}}>{test.duration}</span></div>
                    <p style={{color:"#f1f5f9",fontSize:14,fontWeight:600,margin:"8px 0 4px"}}>{test.fullName}</p>
                    <CatTag cat={test.category}/>
                    <p style={{color:"#475569",fontSize:12,margin:"10px 0 0"}}>{test.questions.length} preguntas · máx. {test.maxScore} pts</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STATS */}
        {view==="stats"&&<Statistics patients={patients}/>}

        {/* PATIENT */}
        {view==="patient"&&currentPatient&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"start",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:14}}>
              <div>
                <p style={{...S.label,marginBottom:3}}>Paciente</p>
                <h1 style={{fontFamily:"'DM Serif Display'",fontSize:34,margin:"0 0 4px",color:"#f1f5f9"}}>{currentPatient.name}</h1>
                <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                  {currentPatient.age>0&&<span style={{color:"#64748b",fontSize:13}}>{currentPatient.age} años</span>}
                  {currentPatient.email&&<span style={{color:"#64748b",fontSize:13}}>✉ {currentPatient.email}</span>}
                  {currentPatient.whatsapp&&<span style={{color:"#25D366",fontSize:13}}>📱 {currentPatient.whatsapp}</span>}
                </div>
              </div>
              <div style={{position:"relative"}}>
                <button style={{...S.btn("#3b82f6"),fontSize:13}} onClick={()=>setAssignDropdownOpen(v=>!v)}>+ Asignar test ▾</button>
                {assignDropdownOpen&&(
                  <div style={{position:"absolute",right:0,top:"110%",background:"#0f172a",border:"1px solid #334155",borderRadius:12,padding:8,zIndex:50,minWidth:240,maxHeight:360,overflowY:"auto",boxShadow:"0 20px 40px #0008"}}>
                    {Object.entries(CATEGORIES).map(([catKey,cat])=>{
                      const catTests=Object.values(TESTS).filter(t=>t.category===catKey);
                      return(
                        <div key={catKey}>
                          <p style={{...S.label,padding:"8px 10px 4px",margin:0}}>{cat.label}</p>
                          {catTests.map(t=>(
                            <button key={t.id} onClick={()=>{setAssignDropdownOpen(false);setAssignTest({testId:t.id,patientId:currentPatient.id,patientName:currentPatient.name,patientWhatsapp:currentPatient.whatsapp});}} style={{display:"block",width:"100%",background:"transparent",border:"none",borderRadius:7,padding:"7px 10px",color:"#94a3b8",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"inherit"}}
                            onMouseEnter={e=>e.target.style.background="#1e293b"} onMouseLeave={e=>e.target.style.background="transparent"}>
                              <span style={{color:cat.color,fontWeight:700,marginRight:6}}>{t.name}</span>{t.fullName}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div style={{display:"flex",gap:2,marginBottom:22,borderBottom:"1px solid #1e293b"}}>
              {["evaluaciones","evolución"].map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} style={{background:"transparent",border:"none",borderBottom:`2px solid ${activeTab===tab?"#AFA9EC":"transparent"}`,color:activeTab===tab?"#AFA9EC":"#64748b",padding:"9px 18px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:600}}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
              ))}
            </div>
            {activeTab==="evaluaciones"&&(
              <div>
                {currentPatient.evaluations.length===0?(
                  <div style={{...S.card,textAlign:"center",padding:48}}><p style={{color:"#475569",fontSize:14}}>Sin evaluaciones todavía. Asigná un test arriba.</p></div>
                ):(
                  [...currentPatient.evaluations].sort((a,b)=>b.date.localeCompare(a.date)).map((ev,_idx,arr)=>{
                    const td=TESTS[ev.testId];const sr=td.score(ev.total);
                    const prevSorted=arr.filter(e=>e.testId===ev.testId&&e.id!==ev.id).sort((a,b)=>a.date.localeCompare(b.date));
                    const prev=prevSorted.length>0?prevSorted[prevSorted.length-1]:null;
                    const sem=getSemaforo(ev.testId,ev.total,prev?.total??null,ev.answers);
                    const status=reportStatus[ev.id];
                    const sched=scheduledTests[currentPatient.id+ev.testId];
                    return(
                      <div key={ev.id} style={{...S.card,marginBottom:14,borderLeftWidth:3,borderLeftColor:sem.color}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:10}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                            <TestTag test={td}/>
                            <span style={{color:"#475569",fontSize:12}}>{ev.date}</span>
                            <span style={{fontSize:16}}>{sem.emoji}</span>
                            {sem.worsening&&<span style={{background:"#f9731622",color:"#f97316",border:"1px solid #f9731644",borderRadius:6,padding:"1px 8px",fontSize:11,fontWeight:700}}>↑ Empeoramiento</span>}
                            {status&&status!=="generado"&&<span style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:6,padding:"1px 8px",fontSize:11,fontWeight:700}}>{status.charAt(0).toUpperCase()+status.slice(1)}</span>}
                            {sched&&<span style={{background:"#3b82f622",color:"#3b82f6",border:"1px solid #3b82f644",borderRadius:6,padding:"1px 8px",fontSize:11}}>📅 {sched}</span>}
                          </div>
                          <button style={{...S.btn("#7c3aed"),fontSize:12}} onClick={()=>handleGenerateReport(currentPatient,ev)}>✦ Informe IA</button>
                        </div>
                        <ScoreMeter total={ev.total} max={td.maxScore} sr={sr}/>
                        {sem.color==="#ef4444"&&<div style={{background:"#ef444418",border:"1px solid #ef444444",borderRadius:8,padding:"8px 12px",marginTop:8}}><p style={{margin:0,fontSize:12,color:"#ef4444",fontWeight:600}}>{sem.desc}</p></div>}
                      </div>
                    );
                  })
                )}
              </div>
            )}
            {activeTab==="evolución"&&(
              <div>
                {[...new Set(currentPatient.evaluations.map(e=>e.testId))].map(testId=>(
                  <div key={testId} style={{...S.card,marginBottom:14}}><TestTag test={TESTS[testId]}/><EvolutionChart patient={currentPatient} testId={testId}/></div>
                ))}
                {currentPatient.evaluations.length===0&&<div style={{...S.card,textAlign:"center",padding:48}}><p style={{color:"#475569",fontSize:14}}>Sin datos todavía.</p></div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
