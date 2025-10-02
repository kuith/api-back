// services/bggService.js
import axios from "axios";
import { BGG_API_URL } from "../config.js";
import { parseStringPromise } from "xml2js";

/**
 * Buscar juegos por nombre (puede devolver varios resultados básicos)
 * @param {string} nombre - Nombre del juego a buscar
 * @returns {Promise<Array<{id: string, nombre: string, anio: string|null}>>}
 */
export async function buscarJuegosPorNombre(nombre) {
  try {
    const url = `${BGG_API_URL}/search?query=${encodeURIComponent(nombre)}&type=boardgame,boardgameexpansion`;
    const res = await axios.get(url);
    const data = await parseStringPromise(res.data);

    if (!data.items.item) return [];

    return data.items.item.map((j) => ({
      id: j.$.id,
      nombre: j.name[0].$.value,
      anio: j.yearpublished?.[0]?.$.value || null,
    }));
  } catch (error) {
    console.error("❌ Error en buscarJuegosPorNombre:", error.message);
    return [];
  }
}

/**
 * Obtener detalles completos de un juego por ID
 * @param {string} id - ID del juego en BGG
 * @returns {Promise<object|null>}
 */
export async function obtenerDetallesPorId(id) {
  try {
    const url = `${BGG_API_URL}/thing?id=${id}&stats=1`;
    const res = await axios.get(url);
    const data = await parseStringPromise(res.data);

    if (!data.items.item) return null;
    return limpiarJuego(data.items.item[0]);
  } catch (error) {
    console.error("❌ Error en obtenerDetallesPorId:", error.message);
    return null;
  }
}

/**
 * Transformar un juego crudo de BGG en objeto limpio
 * @param {object} juego - Objeto tal como lo devuelve la API de BGG
 * @returns {object} Objeto transformado con campos limpios
 */
function limpiarJuego(juego) {
  return {
    id: juego.$.id,
    nombre: juego.name[0].$.value,
    anio: juego.yearpublished?.[0]?.$.value || null,
    minJug: juego.minplayers?.[0]?.$.value || null,
    maxJug: juego.maxplayers?.[0]?.$.value || null,
    tiempo: juego.playingtime?.[0]?.$.value || null,
    edadMin: juego.minage?.[0]?.$.value || null,
    categorias:
      juego.link
        ?.filter((l) => l.$.type === "boardgamecategory")
        .map((c) => c.$.value) || [],
    mecanicas:
      juego.link
        ?.filter((l) => l.$.type === "boardgamemechanic")
        .map((m) => m.$.value) || [],
    puntuacion:
      juego.statistics?.[0]?.ratings?.[0]?.average?.[0]?.$.value || null,
    ranking:
      juego.statistics?.[0]?.ratings?.[0]?.ranks?.[0]?.rank?.[0]?.$.value ||
      null,
    descripcionBGG: juego.description?.[0] || null,
  };
}
