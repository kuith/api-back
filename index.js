import express from "express";
import dotenv from "dotenv";
import { buscarJuegoBGG } from "./services/bggService.js";
import { explicarJuego } from "./services/openaiService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ mensaje: "✅ Backend de Juegos con BGG + OpenAI listo" });
});

app.get("/api/juego/:nombre", async (req, res) => {
  const nombre = req.params.nombre;
  const juego = await buscarJuegoBGG(nombre);

  if (!juego) {
    return res.status(404).json({ error: "Juego no encontrado" });
  }

  const explicacion = await explicarJuego(juego);

  res.json({
    datos: juego,
    descripcion: explicacion,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
