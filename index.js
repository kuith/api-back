// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import juegosRouter from "./routes/juegos.js";

dotenv.config();
const app = express();
// ✅ habilitar CORS para que frontend (5173) pueda hablar con backend (3000)
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas principales
app.use("/api/juegos", juegosRouter);

// Middleware para manejar rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error("❌ Error no controlado:", err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
