import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Fallback en caso de que la API de Google no esté configurada o falle
const MOCK_SCORE_MIN = 40;
const MOCK_SCORE_MAX = 60;

export async function POST(req: Request) {
    console.log(`[API EVALUATE] Recibida nueva petición a las ${new Date().toLocaleTimeString()}`);
    try {
        const { imageBase64, category } = await req.json();

        if (!imageBase64) {
            return NextResponse.json({ error: "No se proporcionó imagen" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.warn("GOOGLE_GENERATIVE_AI_API_KEY no encontrada, usando fallback");
            return fallbackResponse();
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Actúa como un profesor amigable en un juego educativo llamado Regenmon.
Tu tarea es evaluar una captura de pantalla subida por un estudiante en la categoría: "${category}".

CRITERIOS POR CATEGORÍA:
- "Código": Evalúa organización, legibilidad, buenas prácticas y complejidad técnica.
- "Diseño": Evalúa estética, uso de colores, tipografía, UI/UX y creatividad.
- "Proyecto": Evalúa funcionalidad aparente, calidad del trabajo y completitud.
- "Aprendizaje": Evalúa esfuerzo, claridad de notas o ejercicios y aplicación práctica.

INSTRUCCIONES:
1. SIEMPRE evalúa la imagen sin importar qué contenga (da un puntaje bajo si no está relacionada).
2. Proporciona un puntaje de 0 a 100.
3. Proporciona 1-2 oraciones de feedback constructivo en español.
4. El formato de respuesta DEBE ser EXACTAMENTE:
Score: [puntaje]/100. [feedback]

Ejemplo:
Score: 85/100. ¡Excelente organización de tu código! Se nota que sigues buenas prácticas de modularización.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: "image/png",
                },
            },
        ]);

        const responseText = result.response.text();
        console.log("Gemini Response:", responseText);

        // Parsear el score (Score: XX/100)
        const scoreMatch = responseText.match(/Score:\s*(\d+)\/100/);
        const feedbackParts = responseText.split("/100.");

        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : Math.floor(Math.random() * (MOCK_SCORE_MAX - MOCK_SCORE_MIN + 1)) + MOCK_SCORE_MIN;
        const feedback = feedbackParts.length > 1 ? feedbackParts[1].trim() : "¡Buen esfuerzo! Sigue practicando para mejorar.";

        return NextResponse.json({
            score,
            feedback,
            category
        });

    } catch (error) {
        console.error("Error evaluating image:", error);

        // Ensure a valid JSON response is ALWAYS returned on error
        const score = Math.floor(Math.random() * (MOCK_SCORE_MAX - MOCK_SCORE_MIN + 1)) + MOCK_SCORE_MIN;
        return NextResponse.json({
            score,
            feedback: "⚠️ Sistema de evaluación temporalmente no disponible (Límite de API). Se ha asignado un puntaje base.",
            category: "Evaluación Fallback",
            isFallback: true
        });
    }
}

function fallbackResponse() {
    const score = Math.floor(Math.random() * (MOCK_SCORE_MAX - MOCK_SCORE_MIN + 1)) + MOCK_SCORE_MIN;
    return NextResponse.json({
        score,
        category: "Evaluación Fallback",
        feedback: "⚠️ Sistema de API no configurado (usando fallback). Score por defecto.",
        isFallback: true
    });
}
