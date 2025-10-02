import { parseStringPromise } from "xml2js";

const BGG_API_URL = "https://boardgamegeek.com/xmlapi2";

/**
 * Función auxiliar: hace fetch y devuelve XML como string
 */
async function fetchXML(url) {
  const response = await fetch(url); // fetch nativo de Node 18+
  if (!response.ok) {
    throw new Error(`Error en la petición a BGG (${response.status})`);
  }
  return response.text();
}

/**
 * Función auxiliar: convierte XML en JSON
 */
async function parseXML(xml) {
  return parseStringPromise(xml, { explicitArray: true });
}

/**
 * Buscar juegos por nombre (solo base y expansiones)
 */
export async function buscarJuegosPorNombre(nombre) {
  const url = `${BGG_API_URL}/search?query=${encodeURIComponent(nombre)}&type=boardgame,boardgameexpansion`;
  const xml = await fetchXML(url);
  const json = await parseXML(xml);

  const items = json.items.item || [];
  return items.map(item => ({
    id: item.$.id,
    nombre: item.name?.[0]?.$.value || "Sin nombre",
    anio: item.yearpublished?.[0]?.$.value || null,
    tipo: item.$.type
  }));
}

/**
 * Obtener detalles completos de un juego por ID
 */
export async function obtenerDetallesPorId(id) {
  const url = `${BGG_API_URL}/thing?id=${id}&stats=1`;
  const xml = await fetchXML(url);
  const json = await parseXML(xml);

  const item = json.items.item?.[0];
  if (!item) return null;

  return {
    id,
    nombre: item.name?.[0]?.$.value || "Sin nombre",
    anio: item.yearpublished?.[0]?.$.value || null,
    jugadores: `${item.minplayers?.[0]?.$.value || "?"} - ${item.maxplayers?.[0]?.$.value || "?"}`,
    tiempo: `${item.minplaytime?.[0]?.$.value || "?"} - ${item.maxplaytime?.[0]?.$.value || "?"} min`,
    puntuacion: item.statistics?.[0]?.ratings?.[0]?.average?.[0]?.$.value || "?"
  };
}

/**
 * Buscar juegos por rango de jugadores (min/max)
 * Se basa en la lista de juegos populares (hot list) y los filtra
 */
export async function buscarPorJugadores(min, max) {
  const url = `${BGG_API_URL}/hot?type=boardgame`;
  const xml = await fetchXML(url);
  const json = await parseXML(xml);

  const items = json.items.item || [];

  // Obtenemos detalles de los primeros 20 juegos (para no saturar a la API)
  const detalles = await Promise.all(
    items.slice(0, 20).map(i => obtenerDetallesPorId(i.$.id))
  );

  // Filtramos por rango de jugadores
  return detalles.filter(j => {
    if (!j) return false;
    const [minJ, maxJ] = j.jugadores.split(" - ").map(Number);
    return minJ <= min && maxJ >= max;
  });
}
