// routes/juegos.js
import express from "express";
import { buscarJuegosPorNombre, obtenerDetallesPorId } from "../services/bggService.js";
import { explicarJuego } from "../services/openaiService.js";

const router = express.Router();

/**
 * GET /api/juegos/search?nombre=...
 * Buscar juegos por nombre en la BGG
 */
router.get("/search", async (req, res) => {
  try {
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({ error: "Debes indicar un nombre en el query string (?nombre=...)" });
    }

    const juegos = await buscarJuegosPorNombre(nombre);

    if (!juegos || juegos.length === 0) {
      return res.status(404).json({ error: "No se encontraron juegos con ese nombre" });
    }

    res.json(juegos);
  } catch (error) {
    console.error("❌ Error en /search:", error.message);
    res.status(500).json({ error: "Error interno del servidor al buscar juegos" });
  }
});

/**
 * GET /api/juegos/:id
 * Obtener detalles completos de un juego por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const juego = await obtenerDetallesPorId(id);

    if (!juego) {
      return res.status(404).json({ error: "Juego no encontrado en BGG" });
    }

    res.json(juego);
  } catch (error) {
    console.error("❌ Error en /:id:", error.message);
    res.status(500).json({ error: "Error interno del servidor al obtener detalles del juego" });
  }
});

/**
 * GET /api/juegos/:id/explicacion
 * Obtener explicación generada por la IA para un juego
 */
router.get("/:id/explicacion", async (req, res) => {
  try {
    const { id } = req.params;

    const juego = await obtenerDetallesPorId(id);

    if (!juego) {
      return res.status(404).json({ error: "Juego no encontrado en BGG" });
    }

    const explicacion = await explicarJuego(juego);

    if (!explicacion) {
      return res.status(502).json({ error: "No se pudo generar explicación con la IA" });
    }

    res.json({ juego: juego.nombre, explicacion });
  } catch (error) {
    console.error("❌ Error en /:id/explicacion:", error.message);
    res.status(500).json({ error: "Error interno del servidor al generar explicación" });
  }
});

export default router;
