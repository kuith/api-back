import express from "express";
import {
  buscarJuegosPorNombre,
  obtenerDetallesPorId,
  buscarPorJugadores
} from "../services/bggService.js";
import { explicarJuego } from "../services/openaiService.js";

const router = express.Router();

/**
 * GET /api/juegos/search?nombre=Catan
 * Buscar juegos por nombre
 */
router.get("/search", async (req, res) => {
  const { nombre } = req.query;
  if (!nombre) {
    return res.status(400).json({ error: "Falta el parámetro 'nombre'" });
  }

  try {
    const juegos = await buscarJuegosPorNombre(nombre);
    res.json(juegos);
  } catch (error) {
    console.error("Error en /search:", error);
    res.status(500).json({ error: "No se pudieron obtener los juegos" });
  }
});

/**
 * GET /api/juegos/:id
 * Obtener detalles de un juego por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const juego = await obtenerDetallesPorId(req.params.id);
    if (!juego) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    res.json(juego);
  } catch (error) {
    console.error("Error en /:id:", error);
    res.status(500).json({ error: "No se pudieron obtener los detalles" });
  }
});

/**
 * GET /api/juegos/:id/explicacion
 * Obtener explicación generada por la IA
 */
router.get("/:id/explicacion", async (req, res) => {
  try {
    const juego = await obtenerDetallesPorId(req.params.id);
    if (!juego) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    const explicacion = await explicarJuego(juego);
    res.json({ juego: juego.nombre, explicacion });
  } catch (error) {
    console.error("Error en /:id/explicacion:", error);
    res.status(500).json({ error: "No se pudo generar la explicación" });
  }
});

/**
 * GET /api/juegos/jugadores?min=2&max=4
 * Buscar juegos que funcionen en ese rango de jugadores
 */
router.get("/jugadores", async (req, res) => {
  const { min, max } = req.query;
  if (!min || !max) {
    return res.status(400).json({ error: "Debes indicar min y max" });
  }

  try {
    const juegos = await buscarPorJugadores(parseInt(min), parseInt(max));
    res.json(juegos);
  } catch (error) {
    console.error("Error en /jugadores:", error);
    res.status(500).json({ error: "No se pudieron obtener los juegos" });
  }
});

export default router;
