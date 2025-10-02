// services/openaiService.js
import OpenAI from "openai";
import { OPENAI_API_URL } from "../config.js";


function getClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: OPENAI_API_URL,
  });
}

/**
 * Generar una explicación en lenguaje natural a partir de los datos de un juego
 * @param {object} datosJuego - Objeto con datos del juego (id, nombre, anio, jugadores, categorías, mecánicas, etc.)
 * @returns {Promise<string>} Texto generado por la IA
 */
export async function explicarJuego(datosJuego) {
  if (!datosJuego) {
    return "No encontré información sobre este juego.";
  }

  const prompt = construirPromptJuego(datosJuego);

  try {
    const client = getClient();
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un experto en juegos de mesa modernos. Sé conciso y claro." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7, // equilibrio entre precisión y creatividad
      max_tokens: 250,  // límite máximo de longitud de respuesta
    });

    return res.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error en explicarJuego:", error.message);
    return "Hubo un error al generar la explicación.";
  }
}

/**
 * Construir el prompt para describir un juego
 * @param {object} juego - Objeto con datos del juego
 * @returns {string} Prompt listo para enviar a la IA
 */
function construirPromptJuego(juego) {
  return `
Tengo información sobre un juego de mesa:

- Nombre: ${juego.nombre}
- Año de publicación: ${juego.anio || "desconocido"}
- Jugadores: ${juego.minJug || "?"} a ${juego.maxJug || "?"}
- Duración: ${juego.tiempo || "?"} minutos
- Edad mínima: ${juego.edadMin || "?"} años
- Categorías: ${juego.categorias?.join(", ") || "?"}
- Mecánicas: ${juego.mecanicas?.join(", ") || "?"}
- Puntuación media en BGG: ${juego.puntuacion || "?"}
- Ranking en BGG: ${juego.ranking || "?"}

Con estos datos, escribe una breve explicación atractiva de este juego,
como si fueras un experto en juegos de mesa modernos.
Si lo consideras relevante, incluye por qué destaca en su categoría o mecánica.
  `;
}
