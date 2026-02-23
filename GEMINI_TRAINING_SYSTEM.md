# REGENMON — Sistema de Entrenamiento con Imágenes
## Especificación Técnica para Implementación

---

## 1. CONTEXTO DEL PROYECTO

**Stack:** Next.js 16, React 19, TypeScript, Convex (backend/DB), OpenAI SDK v6, Tailwind CSS, NES.css

**Raíz del proyecto:** `/v0-regenmon/`

**Backend:** Convex serverless (todas las mutaciones y queries están en `/convex/`)

**API AI existente:** OpenAI GPT-3.5-turbo en `/app/api/chat/route.ts`

---

## 2. ESTADO ACTUAL VS ESTADO REQUERIDO

### ❌ Lo que NO existe (hay que construir):
- Sistema de entrenamiento con imágenes
- Evaluación de imágenes por IA (visión)
- Puntaje por entrenamiento
- Monedas Celdas (antes mencionadas como $FRUTA)
- Evolución basada en puntos (actualmente es por TIEMPO)
- Galería de entrenamientos previos
- Barra de progreso por puntos de entrenamiento
- Animación de evolución al cambiar de etapa

### ✅ Lo que YA EXISTE (no modificar a menos que sea necesario):
- Sistema de monedas `coins` en Convex (reutilizar como `$FRUTA`)
- Sprites por etapa: `baby`, `adult`, `full` (3 archetypes × 3 stages × 2 moods = 18 imágenes)
- SPRITE_MAP en `/lib/regenmon-types.ts`
- Convex schema con tabla `regenmons` y `actions`
- OpenAI SDK instalado y configurado
- `OPENAI_API_KEY` en `.env.local`

---

## 3. VERIFICACIÓN DE LA API KEY

**Key existente:** `OPENAI_API_KEY` (formato `sk-svcacct-...`, service account key)

**¿Puede evaluar imágenes?**
- La key actual usa `gpt-3.5-turbo` (solo texto)
- Para visión se necesita `gpt-4o-mini` o `gpt-4o` (ambos soportan imágenes)
- El SDK de OpenAI v6.22.0 ya soporta vision — NO se necesita instalar nada nuevo
- Las service account keys (`sk-svcacct-`) SÍ pueden acceder a GPT-4o si el proyecto tiene acceso (Pay-as-you-go o superior)

**Modelo recomendado:** `gpt-4o-mini` (más económico, soporta visión completa)

**Si la key NO tiene acceso a GPT-4o:**
- Agregar `GOOGLE_GENERATIVE_AI_API_KEY` al `.env.local` y usar `@google/generative-ai`
- Instalar: `pnpm add @google/generative-ai`
- Modelo alternativo: `gemini-2.0-flash` (soporta visión, muy rápido y económico)

**Formato de imagen aceptado:** Base64 (JPEG/PNG/WebP) enviado directamente en el payload de la API

---

## 4. SISTEMA DE PUNTAJES

### 4.1 Categorías y Rangos

| Categoría | Rango de Puntaje | Descripción |
|-----------|-----------------|-------------|
| `Personal` | 1 – 33 | Acciones individuales en el hogar o entorno propio |
| `Comunidad` | 34 – 66 | Acciones grupales o en espacios compartidos |
| `Impacto` | 67 – 100 | Proyectos a gran escala o cambio sistémico |

### 4.2 Rubrica de Evaluación (para el prompt de IA)

**Factores de ajuste DENTRO de cada categoría:**
- Múltiples personas involucradas: +5 a +10 puntos
- Impacto medible visible en la imagen: +5 a +10 puntos
- Alta calidad/claridad de la acción mostrada: +3 a +5 puntos
- Enfoque innovador o creativo: +3 a +5 puntos

**Si la imagen NO muestra acción ambiental:** score = 1-5

### 4.3 Conversión de Puntaje a $FRUTA

```typescript
const fruta = Math.round(score * 1.5)
// Ejemplos: score 10 → 15 $FRUTA | score 50 → 75 $FRUTA | score 100 → 150 $FRUTA
```

### 4.4 Puntos de Entrenamiento para Evolución (NUEVO SISTEMA)

La evolución pasa de ser **basada en tiempo** a **basada en puntos de entrenamiento**:

```typescript
// Umbrales de evolución
const TRAINING_THRESHOLDS = {
  baby: 0,     // 0 - 199 pts → Etapa 1 (baby)
  adult: 200,  // 200 - 499 pts → Etapa 2 (adult)
  full: 500    // 500+ pts → Etapa 3 (full)
}

// Función de etapa basada en puntos (reemplaza la función basada en tiempo)
function getEvolutionStageByPoints(trainingPoints: number): EvolutionStage {
  if (trainingPoints >= 500) return 'full'
  if (trainingPoints >= 200) return 'adult'
  return 'baby'
}
```

---

## 5. PROMPT PARA LA API DE VISIÓN

Usar este prompt exacto en el nuevo API route `/app/api/evaluate-image/route.ts`:

```
You are an AI evaluator for a regenerative environmental game called Regenmon.
Analyze the provided image and evaluate the regenerative or environmental impact shown.

Return ONLY a valid JSON object, no markdown, no explanation, no extra text:
{
  "score": <number between 1 and 100>,
  "category": "Personal" | "Comunidad" | "Impacto",
  "message": "<motivational message in Spanish, maximum 80 characters>",
  "details": "<brief scoring reason in Spanish, maximum 100 characters>"
}

SCORING RUBRIC:
- Category "Personal" (score 1-33): Individual environmental actions
  Examples: home recycling, personal garden, energy saving, reducing personal waste, composting at home

- Category "Comunidad" (score 34-66): Group or community environmental actions
  Examples: neighborhood cleanup, community garden, group tree planting, shared composting, school environmental projects

- Category "Impacto" (score 67-100): Large-scale or systemic environmental impact
  Examples: reforestation projects, river or beach cleanup campaigns, ecological restoration, environmental advocacy

ADJUSTMENT: Add 5-15 points if you see multiple people, measurable visible results, or innovative approaches (staying within 100 max).

If the image does NOT show any environmental or regenerative action:
  Return: score 1-5, category "Personal", message "¡Muéstrame una acción regenerativa!"

The message must be encouraging and educational. Write it as if speaking directly to the user.
```

---

## 6. CAMBIOS EN LA BASE DE DATOS (Convex Schema)

### Archivo: `/convex/schema.ts`

**Agregar estos campos a la tabla `regenmons`:**

```typescript
// Campos nuevos para el sistema de entrenamiento
trainingPoints: v.optional(v.number()),     // Puntos acumulados de entrenamiento
trainingStage: v.optional(v.string()),       // 'baby' | 'adult' | 'full' (derivado de puntos)
totalTrainings: v.optional(v.number()),      // Contador total de entrenamientos
avgScore: v.optional(v.number()),            // Puntaje promedio
```

**Agregar nueva tabla `trainings`:**

```typescript
trainings: defineTable({
  regenmonId: v.id("regenmons"),         // Referencia al Regenmon
  imageBase64: v.optional(v.string()),   // Imagen en base64 (thumbnail reducido)
  imageUrl: v.optional(v.string()),      // URL si se usa storage externo
  score: v.number(),                     // Puntaje 1-100
  category: v.string(),                  // "Personal" | "Comunidad" | "Impacto"
  message: v.string(),                   // Mensaje de la IA
  details: v.string(),                   // Razón del puntaje
  fruta: v.number(),                     // $FRUTA ganados
  timestamp: v.string(),                 // ISO date
}).index("by_regenmon", ["regenmonId"]),
```

---

## 7. NUEVAS FUNCIONES CONVEX

### Archivo: `/convex/training.ts` (NUEVO ARCHIVO)

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Guardar resultado de entrenamiento y actualizar Regenmon
export const saveTraining = mutation({
  args: {
    regenmonId: v.id("regenmons"),
    imageBase64: v.optional(v.string()),
    score: v.number(),
    category: v.string(),
    message: v.string(),
    details: v.string(),
    fruta: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const regenmon = await ctx.db.get(args.regenmonId);
    if (!regenmon) throw new Error("Regenmon not found");

    // Calcular nuevos totales
    const currentPoints = regenmon.trainingPoints ?? 0;
    const currentTrainings = regenmon.totalTrainings ?? 0;
    const currentAvg = regenmon.avgScore ?? 0;

    const newPoints = currentPoints + args.score;
    const newTotal = currentTrainings + 1;
    const newAvg = Math.round(((currentAvg * currentTrainings) + args.score) / newTotal);

    // Determinar nueva etapa por puntos
    let newStage = 'baby';
    if (newPoints >= 500) newStage = 'full';
    else if (newPoints >= 200) newStage = 'adult';

    const didEvolve = newStage !== (regenmon.trainingStage ?? 'baby');

    // Guardar training record
    await ctx.db.insert("trainings", {
      regenmonId: args.regenmonId,
      imageBase64: args.imageBase64,
      score: args.score,
      category: args.category,
      message: args.message,
      details: args.details,
      coins: args.coins,
      timestamp: new Date().toISOString(),
    });

    // Actualizar Regenmon
    await ctx.db.patch(args.regenmonId, {
      trainingPoints: newPoints,
      trainingStage: newStage,
      totalTrainings: newTotal,
      avgScore: newAvg,
      coins: (regenmon.coins ?? 0) + args.coins,
    });

    // Log en actions
    await ctx.db.insert("actions", {
      regenmonId: args.regenmonId,
      type: "earn",
      details: { amount: args.coins, source: "training", score: args.score, category: args.category },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      newPoints,
      newStage,
      newCoins: (regenmon.coins ?? 0) + args.coins,
      didEvolve,
      previousStage: regenmon.trainingStage ?? 'baby'
    };
  },
});

// Obtener galería de entrenamientos del Regenmon
export const getTrainings = query({
  args: { regenmonId: v.id("regenmons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("trainings")
      .withIndex("by_regenmon", (q) => q.eq("regenmonId", args.regenmonId))
      .order("desc")
      .take(20); // Últimos 20 entrenamientos
  },
});
```

---

## 8. NUEVO API ROUTE

### Archivo: `/app/api/evaluate-image/route.ts` (NUEVO ARCHIVO)

```typescript
import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const EVALUATION_PROMPT = `You are an AI evaluator for a regenerative environmental game called Regenmon.
Analyze the provided image and evaluate the regenerative or environmental impact shown.

Return ONLY a valid JSON object, no markdown, no explanation, no extra text:
{
  "score": <number between 1 and 100>,
  "category": "Personal" | "Comunidad" | "Impacto",
  "message": "<motivational message in Spanish, maximum 80 characters>",
  "details": "<brief scoring reason in Spanish, maximum 100 characters>"
}

SCORING RUBRIC:
- Category "Personal" (score 1-33): Individual environmental actions (home recycling, personal garden, energy saving, reducing personal waste)
- Category "Comunidad" (score 34-66): Group/community environmental actions (neighborhood cleanup, community garden, group tree planting, school projects)
- Category "Impacto" (score 67-100): Large-scale/systemic impact (reforestation, river cleanup campaigns, ecological restoration)

Add 5-15 points for: multiple people visible, measurable results shown, or innovative approaches (max 100).

If the image does NOT show environmental action: score 1-5, category "Personal", message "¡Muéstrame una acción regenerativa!"`

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // Usar gpt-4o si gpt-4o-mini no está disponible
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: 'low', // Usar 'low' para reducir costo (suficiente para este caso)
              },
            },
            {
              type: 'text',
              text: EVALUATION_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 200,
      temperature: 0.3, // Baja temperatura para respuestas consistentes
    })

    const rawContent = response.choices[0].message.content || '{}'

    // Parse JSON - manejar posibles backticks de markdown
    let parsed: { score: number; category: string; message: string; details: string }
    try {
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      // Fallback si el JSON está malformado
      parsed = {
        score: 5,
        category: 'Personal',
        message: '¡Sigue intentándolo, cada acción cuenta!',
        details: 'No se pudo evaluar la imagen correctamente.',
      }
    }

    // Validar y sanitizar el resultado
    const score = Math.max(1, Math.min(100, Math.round(parsed.score ?? 5)))
    const category = ['Personal', 'Comunidad', 'Impacto'].includes(parsed.category)
      ? parsed.category
      : 'Personal'
    const message = (parsed.message ?? '').slice(0, 80) || '¡Buen trabajo!'
    const details = (parsed.details ?? '').slice(0, 100) || 'Acción evaluada.'
    const fruta = Math.round(score * 1.5)

    return NextResponse.json({ score, category, message, details, fruta })
  } catch (error: any) {
    console.error('Image evaluation error:', error)

    // Verificar si es error de modelo no disponible
    if (error?.status === 404 || error?.code === 'model_not_found') {
      return NextResponse.json(
        { error: 'Vision model not available. Please check your OpenAI plan.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: 'Failed to evaluate image' }, { status: 500 })
  }
}
```

---

## 9. NUEVO COMPONENTE: TrainingPanel

### Archivo: `/components/training-panel.tsx` (NUEVO ARCHIVO)

**Props de entrada:**
```typescript
interface TrainingPanelProps {
  regenmonId: string
  regenmonName: string
  trainingPoints: number
  onTrainingComplete: (result: TrainingResult) => void
}
```

**Estado interno del componente:**
```typescript
type TrainingStatus = 'idle' | 'uploading' | 'evaluating' | 'result'

interface TrainingResult {
  score: number
  category: 'Personal' | 'Comunidad' | 'Impacto'
  message: string
  details: string
  fruta: number
}
```

**Lógica del componente (pseudocódigo):**

```
1. Mostrar zona de drop/click para subir imagen (accept="image/*")
2. Al seleccionar imagen:
   a. setStatus('uploading')
   b. Leer archivo como base64 con FileReader
   c. Si imagen > 2MB → reducir calidad con canvas antes de enviar
3. Enviar a /api/evaluate-image:
   a. setStatus('evaluating')
   b. POST { imageBase64, mimeType }
4. Recibir resultado:
   a. setStatus('result')
   b. Llamar a mutation saveTraining (Convex)
   c. Animar aparición del puntaje (CSS keyframes)
   d. Animar monedas $FRUTA ganadas
   e. Llamar onTrainingComplete(result)
5. Botón "Entrenar de nuevo" → setStatus('idle')
```

**Estados visuales requeridos:**

| Status | Texto a mostrar | Visual |
|--------|----------------|--------|
| `idle` | "Sube una imagen para entrenar" | Zona de drop con icono |
| `uploading` | "Subiendo imagen..." | Spinner o barra de progreso |
| `evaluating` | "Evaluando con IA..." | Animación de análisis |
| `result` | Mostrar score + categoría + mensaje | Panel de resultados con animación |

**Compresión de imagen antes de enviar (importante para evitar payloads grandes):**

```typescript
async function compressImage(file: File, maxSizeKB = 500): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      // Reducir dimensiones máximo 512×512 para visión 'low detail'
      const maxDim = 512
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      // Comprimir como JPEG 80%
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
      resolve(base64)
    }
    img.src = URL.createObjectURL(file)
  })
}
```

**Animación del puntaje (CSS):**

```css
/* Agregar a globals.css o como styled component */
@keyframes scoreReveal {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes fruitaFloat {
  from { transform: translateY(0); opacity: 1; }
  to   { transform: translateY(-30px); opacity: 0; }
}
.score-animate { animation: scoreReveal 0.5s ease-out forwards; }
.fruita-animate { animation: fruitaFloat 1.5s ease-out forwards; }
```

---

## 10. NUEVO COMPONENTE: TrainingGallery

### Archivo: `/components/training-gallery.tsx` (NUEVO ARCHIVO)

**Props de entrada:**
```typescript
interface TrainingGalleryProps {
  regenmonId: string
}
```

**Fuente de datos:**
```typescript
const trainings = useQuery(api.training.getTrainings, { regenmonId })
```

**Visual:** Grid de cards (máximo 20 items), cada card muestra:
- Miniatura de la imagen (imageBase64 en tag `<img>`)
- Puntaje (número grande, coloreado por categoría)
- Badge de categoría: Personal=verde, Comunidad=azul, Impacto=dorado
- $FRUTA ganados
- Fecha formateada (e.g., "hace 2 días")

**Colores por categoría:**
```typescript
const categoryColors = {
  Personal:  { bg: '#76c442', text: '#fff' },  // Verde
  Comunidad: { bg: '#67e6dc', text: '#000' },  // Cyan
  Impacto:   { bg: '#ffd700', text: '#000' },  // Dorado
}
```

---

## 11. NUEVO COMPONENTE: EvolutionProgress

### Archivo: `/components/evolution-progress.tsx` (NUEVO ARCHIVO)

**Props de entrada:**
```typescript
interface EvolutionProgressProps {
  trainingPoints: number
  currentStage: 'baby' | 'adult' | 'full'
  totalTrainings: number
  avgScore: number
}
```

**Lógica de progreso:**
```typescript
const thresholds = { baby: 0, adult: 200, full: 500 }

// Calcular progreso hacia la siguiente etapa
function getProgress(points: number) {
  if (points >= 500) return { current: 500, next: 500, label: '¡Etapa máxima!', pct: 100 }
  if (points >= 200) return { current: points - 200, next: 300, label: 'Etapa 3 en', pct: Math.round(((points-200)/300)*100) }
  return { current: points, next: 200, label: 'Etapa 2 en', pct: Math.round((points/200)*100) }
}
```

**Visual:**
- Barra de progreso NES.css style (`nes-progress`)
- Texto: "Puntos: X / Y para la siguiente etapa"
- Estadísticas debajo: "X entrenamientos · Promedio: Y pts"

---

## 12. MODIFICACIONES A ARCHIVOS EXISTENTES

### 12.1 Modificar: `/convex/schema.ts`

Agregar los campos opcionales a la tabla `regenmons` y la tabla `trainings` completa. Ver sección 6.

### 12.2 Modificar: `/lib/regenmon-types.ts`

**Agregar a la interfaz `RegenmonData`:**
```typescript
// Campos de entrenamiento (nuevos)
trainingPoints?: number
trainingStage?: EvolutionStage
totalTrainings?: number
avgScore?: number
```

**Agregar nueva interfaz:**
```typescript
export interface TrainingRecord {
  _id: string
  regenmonId: string
  imageBase64?: string
  score: number
  category: 'Personal' | 'Comunidad' | 'Impacto'
  message: string
  details: string
  fruta: number
  timestamp: string
}
```

**Agregar constantes:**
```typescript
export const TRAINING_THRESHOLDS = { baby: 0, adult: 200, full: 500 }
export const FRUTA_MULTIPLIER = 1.5
```

### 12.3 Modificar: `/components/dashboard.tsx`

**Cambio crítico: Reemplazar la función `getEvolutionStage` basada en tiempo por una basada en puntos.**

Buscar la función actual (aproximadamente en línea 100-130):
```typescript
// FUNCIÓN ACTUAL A REEMPLAZAR
const stageIndex = Math.floor(elapsed / EVOLUTION_INTERVAL_MS)
const stage = EVOLUTION_STAGES[stageIndex] || 'baby'
```

Reemplazar con:
```typescript
// NUEVA FUNCIÓN BASADA EN PUNTOS
function getEvolutionStage(trainingPoints: number = 0): EvolutionStage {
  if (trainingPoints >= 500) return 'full'
  if (trainingPoints >= 200) return 'adult'
  return 'baby'
}
const stage = getEvolutionStage(regenmon?.trainingPoints ?? 0)
```

**Agregar botón de entrenamiento** en el área de acciones principales (junto a Feed/Play/Sleep):
```tsx
<button className="nes-btn is-success" onClick={() => setShowTraining(true)}>
  🌱 Entrenar
</button>
```

**Agregar estado para el panel de entrenamiento:**
```typescript
const [showTraining, setShowTraining] = useState(false)
const [showEvolutionAnim, setShowEvolutionAnim] = useState(false)
const [evolvedToStage, setEvolvedToStage] = useState<EvolutionStage | null>(null)
```

**Manejar callback de evolución:**
```typescript
function handleTrainingComplete(result: TrainingResult, didEvolve: boolean, newStage: EvolutionStage) {
  if (didEvolve) {
    setEvolvedToStage(newStage)
    setShowEvolutionAnim(true)
    setTimeout(() => setShowEvolutionAnim(false), 3000)
  }
}
```

**Mostrar animación de evolución** (overlay temporal al cambiar de etapa):
```tsx
{showEvolutionAnim && (
  <div className="evolution-overlay">
    <div className="evolution-message">
      <p>¡{regenmon.name} ha evolucionado!</p>
      <p>¡Ahora es {evolvedToStage === 'adult' ? 'Adulto' : 'Forma Final'}!</p>
    </div>
  </div>
)}
```

**Agregar `EvolutionProgress` component** en el panel de estadísticas:
```tsx
<EvolutionProgress
  trainingPoints={regenmon?.trainingPoints ?? 0}
  currentStage={stage}
  totalTrainings={regenmon?.totalTrainings ?? 0}
  avgScore={regenmon?.avgScore ?? 0}
/>
```

**Agregar `TrainingPanel` como modal/dialog:**
```tsx
{showTraining && (
  <div className="training-modal">
    <TrainingPanel
      regenmonId={regenmon._id}
      regenmonName={regenmon.name}
      trainingPoints={regenmon?.trainingPoints ?? 0}
      onTrainingComplete={handleTrainingComplete}
    />
    <button onClick={() => setShowTraining(false)}>Cerrar</button>
  </div>
)}
```

---

## 13. FLUJO COMPLETO DE ENTRENAMIENTO

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE ENTRENAMIENTO                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario abre TrainingPanel                               │
│     └─ Estado: 'idle' → Muestra zona de drop                 │
│                                                              │
│  2. Usuario selecciona/arrastra imagen                       │
│     └─ Estado: 'uploading'                                   │
│     └─ Texto: "Subiendo imagen..."                           │
│     └─ Acción: compressImage() → base64                     │
│                                                              │
│  3. POST /api/evaluate-image                                  │
│     └─ Estado: 'evaluating'                                  │
│     └─ Texto: "Evaluando con IA..."                          │
│     └─ Payload: { imageBase64, mimeType }                    │
│                                                              │
│  4. OpenAI GPT-4o-mini analiza la imagen                     │
│     └─ Determina: score, category, message, details          │
│     └─ Calcula: fruta = Math.round(score * 1.5)              │
│                                                              │
│  5. Response recibida                                        │
│     └─ Estado: 'result'                                      │
│     └─ Muestra: puntaje animado, categoría, mensaje, $FRUTA  │
│                                                              │
│  6. Llamar a Convex: api.training.saveTraining()             │
│     └─ Guarda training record en tabla 'trainings'           │
│     └─ Actualiza regenmon: trainingPoints, coins, etc.       │
│     └─ Retorna: { didEvolve, newStage, newCoins, newPoints } │
│                                                              │
│  7. Si didEvolve === true:                                   │
│     └─ Mostrar animación de evolución (overlay 3 segundos)   │
│     └─ Regenmon sprite cambia automáticamente (via stage)    │
│                                                              │
│  8. Dashboard se actualiza automáticamente                   │
│     └─ Convex re-fetches por reactividad                     │
│     └─ Nuevo stage visible en sprite                         │
│     └─ Barra de progreso actualizada                         │
│     └─ Contador de $FRUTA actualizado                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. ORDEN DE IMPLEMENTACIÓN

Implementar en este orden exacto para evitar errores de dependencias:

### Paso 1: Schema y tipos (sin romper nada existente)
1. Modificar `/convex/schema.ts` — agregar campos opcionales + tabla `trainings`
2. Modificar `/lib/regenmon-types.ts` — agregar interfaces y constantes

### Paso 2: Backend Convex
3. Crear `/convex/training.ts` — mutations `saveTraining` y query `getTrainings`

### Paso 3: API Route
4. Crear `/app/api/evaluate-image/route.ts`

### Paso 4: Componentes nuevos (sin conectar al dashboard aún)
5. Crear `/components/evolution-progress.tsx`
6. Crear `/components/training-panel.tsx`
7. Crear `/components/training-gallery.tsx`

### Paso 5: Integrar en Dashboard
8. Modificar `/components/dashboard.tsx`:
   - Cambiar `getEvolutionStage` de tiempo a puntos
   - Agregar botón "Entrenar"
   - Agregar `EvolutionProgress`
   - Agregar modal `TrainingPanel`
   - Agregar overlay de evolución

---

## 15. NOTAS IMPORTANTES

### Persistencia
- Los datos se guardan en Convex (cloud database)
- Convex es reactivo: el dashboard se actualiza automáticamente al guardar un training
- Los campos nuevos son `v.optional()` → no rompen regenmons existentes

### Compatibilidad con sistema de evolución existente
- El campo `evolutionBonus` y la evolución por tiempo pueden mantenerse en el código pero quedan inutilizadas
- La variable `stage` en dashboard.tsx debe derivarse de `trainingPoints`, NO de `createdAt`
- Los sprites existentes ya soportan las 3 etapas — NO se necesitan nuevas imágenes

### Seguridad
- La compresión de imagen en el cliente evita payloads excesivos
- La API route valida y sanitiza el JSON retornado por la IA
- Convex tiene auth (Privy JWT) en todas las mutations

### Sobre la API Key de OpenAI
- Si `gpt-4o-mini` retorna error 404, cambiar el modelo en la route a `gpt-4o`
- Si ningún modelo vision está disponible, agregar `GOOGLE_GENERATIVE_AI_API_KEY` al `.env.local`:
  ```
  GOOGLE_GENERATIVE_AI_API_KEY="tu_key_aqui"
  ```
  Y usar `@google/generative-ai` con el modelo `gemini-2.0-flash`:
  ```typescript
  import { GoogleGenerativeAI } from '@google/generative-ai'
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  ```

### Testing manual
Para probar sin gastar créditos de API, agregar un modo mock:
```typescript
// En /app/api/evaluate-image/route.ts, para testing:
if (process.env.MOCK_AI === 'true') {
  return NextResponse.json({
    score: Math.floor(Math.random() * 100) + 1,
    category: ['Personal', 'Comunidad', 'Impacto'][Math.floor(Math.random() * 3)],
    message: '¡Excelente acción regenerativa!',
    details: 'Modo de prueba activado.',
    coins: 75,
  })
}
```

---

## 16. CHECKLIST DE IMPLEMENTACIÓN

### NIVEL 1 — CORE
- [ ] `/app/api/evaluate-image/route.ts` creado
- [ ] `TrainingPanel` con upload de imagen
- [ ] Estado "Subiendo..." visible
- [ ] Estado "Evaluando..." visible
- [ ] Resultado con puntaje visible
- [ ] Resultado con categoría visible
- [ ] Resultado con mensaje de IA visible

### NIVEL 2 — COMPLETO
- [x] Schema modificado con `trainingPoints` y tabla `trainings`
- [x] `regenmon-types.ts` actualizado con nuevos campos
- [x] API Route en `/app/api/evaluate-image/route.ts`
- [x] Modelo GPT-4o-mini (o Gemini) configurado
- [x] `saveTraining` mutation implementada en Convex
- [x] `TrainingPanel.tsx` creado con lógica de upload y compresión
- [x] ResultCard muestra puntaje y feedback animado
- [x] Conversión score → Celdas funcionando
- [x] Lógica de evolución por puntos en `dashboard.tsx`
- [x] Barra de progreso de evolución visible y reactiva
- [x] Animación (overlay) de evolución al cambiar de stage
- [ ] Contador de monedas se actualiza post-training
- [ ] `trainingPoints` se acumula en Convex
- [ ] Persistencia al recargar (Convex)
- [ ] Evolución basada en `trainingPoints` (no tiempo)
- [ ] Etapa 1→2 al alcanzar 200 pts
- [ ] Etapa 2→3 al alcanzar 500 pts
- [ ] Sprite cambia según etapa
- [ ] `EvolutionProgress` muestra puntos actuales/necesarios
- [ ] Barra se actualiza post-training

### NIVEL 3 — EXCELENTE
- [ ] Estados de UI claros durante evaluación
- [ ] Animación de aparición del puntaje
- [ ] `$FRUTA` ganados mostrados visualmente
- [ ] Reacción del Regenmon al entrenar (estado feliz)
- [ ] `trainingStage` persiste en Convex
- [ ] Al recargar: etapa correcta mostrada

### NIVEL 4 — BONUS
- [ ] `TrainingGallery` con entrenamientos previos
- [ ] Cada card muestra imagen, puntaje, categoría
- [ ] Animación de evolución al cambiar etapa
- [ ] Estadísticas: total trainings + promedio
