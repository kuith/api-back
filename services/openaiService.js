// services/openaiService.js
import OpenAI from "openai";

function getClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function explicarJuego(datosJuego) {
  const client = getClient(); // se crea cuando llamamos a la función
  if (!datosJuego) return "No encontré información sobre este juego.";

  const prompt = `
Tengo información sobre un juego de mesa:

- Nombre: ${datosJuego.nombre}
- Año de publicación: ${datosJuego.anio || "desconocido"}
- Jugadores: ${datosJuego.minJug || "?"} a ${datosJuego.maxJug || "?"}
- Duración: ${datosJuego.tiempo || "?"} minutos

Escribe una breve explicación atractiva de este juego, como si fueras un experto en juegos de mesa modernos.
`;

  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error en explicarJuego:", error.message);
    return "Hubo un error al generar la explicación.";
  }
}
