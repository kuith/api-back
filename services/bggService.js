import { parseStringPromise } from "xml2js";

const BGG_API_URL = "https://boardgamegeek.com/xmlapi2";

/**
 * Función auxiliar: hace fetch y devuelve XML como string
 */
async function fetchXML(url) {
  try {
    const response = await fetch(url); // fetch nativo en Node 18+
    if (!response.ok) {
      throw new Error(`Error en la petición a BGG (${response.status})`);
    }
    return response.text();
  } catch (error) {
    console.error("❌ Error en fetchXML:", error.message);
    throw error; // dejamos que la ruta lo capture en su try/catch
  }
}

/**
 * Función auxiliar: convierte XML en JSON
 */
async function parseXML(xml) {
  try {
    return await parseStringPromise(xml, { explicitArray: true });
  } catch (error) {
    console.error("❌ Error al parsear XML:", error.message);
    throw error;
  }
}

/**
 * Buscar juegos por nombre (solo base y expansiones)
 */
export async function buscarJuegosPorNombre(nombre) {
  try {
    const url = `${BGG_API_URL}/search?query=${encodeURIComponent(
      nombre
    )}&type=boardgame,boardgameexpansion`;
    const xml = await fetchXML(url);
    const json = await parseXML(xml);

    const items = json.items?.item || [];
    return items.map((item) => ({
      id: item.$.id,
      nombre: item.name?.[0]?.$.value || "Sin nombre",
      anio: item.yearpublished?.[0]?.$.value || null,
      tipo: item.$.type,
    }));
  } catch (error) {
    console.error("❌ Error en buscarJuegosPorNombre:", error.message);
    return []; // devolvemos array vacío para no romper el flujo
  }
}

/**
 * Obtener detalles completos de un juego por ID
 */
export async function obtenerDetallesPorId(id) {
  try {
    const url = `${BGG_API_URL}/thing?id=${id}&stats=1`;
    const xml = await fetchXML(url);
    const json = await parseXML(xml);

    const item = json.items?.item?.[0];
    if (!item) return null;

    const minPlayers = Number(item.minplayers?.[0]?.$.value) || null;
    const maxPlayers = Number(item.maxplayers?.[0]?.$.value) || null;
    const minPlaytime = Number(item.minplaytime?.[0]?.$.value) || null;
    const maxPlaytime = Number(item.maxplaytime?.[0]?.$.value) || null;
    const playingTime = Number(item.playingtime?.[0]?.$.value) || null;
    const year = Number(item.yearpublished?.[0]?.$.value) || null;
    const puntuacion = Number(
      item.statistics?.[0]?.ratings?.[0]?.average?.[0]?.$.value
    ) || null;

    return {
      id,
      nombre: item.name?.[0]?.$.value || "Sin nombre",
      anio: year,
      minPlayers,
      maxPlayers,
      minPlaytime,
      maxPlaytime,
      playingTime,
      puntuacion
    };
  } catch (error) {
    console.error(`❌ Error en obtenerDetallesPorId (${id}):`, error.message);
    return null;
  }
}


/**
 * Buscar juegos por rango de jugadores (min/max)
 * Se basa en la lista de juegos populares (hot list) y los filtra
 */
export async function buscarPorJugadores(min, max) {
  try {
    const url = `${BGG_API_URL}/hot?type=boardgame`;
    const xml = await fetchXML(url);
    const json = await parseXML(xml);

    const items = json.items?.item || [];

    const promesas = items.slice(0, 20).map((i) =>
      obtenerDetallesPorId(i.$.id)
    );
    const resultados = await Promise.allSettled(promesas);

    const detalles = resultados
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value);

    return detalles.filter((j) => {
      if (!j.minPlayers || !j.maxPlayers) return false;
      return j.minPlayers <= min && j.maxPlayers >= max;
    });
  } catch (error) {
    console.error("❌ Error en buscarPorJugadores:", error.message);
    return [];
  }
}


/**
 * Buscar juegos por rango de duración (minplaytime / maxplaytime en minutos)
 */

export async function buscarPorDuracion(min, max) {
  try {
    const url = `${BGG_API_URL}/hot?type=boardgame`;
    const xml = await fetchXML(url);
    const json = await parseXML(xml);

    const items = json.items?.item || [];

    const promesas = items.slice(0, 20).map((i) =>
      obtenerDetallesPorId(i.$.id)
    );
    const resultados = await Promise.allSettled(promesas);

    const detalles = resultados
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value);

    return detalles.filter((j) => {
      if (!j.minPlaytime || !j.maxPlaytime) return false;
      return j.playingTime >= min && j.playingTime <= max;
    });
  } catch (error) {
    console.error("❌ Error en buscarPorDuracion:", error.message);
    return [];
  }
}