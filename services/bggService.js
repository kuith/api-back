// services/bggService.js
import axios from "axios";
import { parseStringPromise } from "xml2js";

export async function buscarJuegoBGG(nombre) {
  try {
    // Buscar ID por nombre
    const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(
      nombre
    )}&type=boardgame`;
    const searchRes = await axios.get(searchUrl);
    const searchData = await parseStringPromise(searchRes.data);

    if (!searchData.items.item) return null;

    const id = searchData.items.item[0].$.id;

    // Detalles del juego
    const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`;
    const detailRes = await axios.get(detailUrl);
    const detailData = await parseStringPromise(detailRes.data);

    const juego = detailData.items.item[0];

    return {
      id,
      nombre: juego.name[0].$.value,
      anio: juego.yearpublished?.[0]?.$.value || null,
      minJug: juego.minplayers?.[0]?.$.value || null,
      maxJug: juego.maxplayers?.[0]?.$.value || null,
      tiempo: juego.playingtime?.[0]?.$.value || null,
      edadMin: juego.minage?.[0]?.$.value || null,

      // Categorías (puede haber varias)
      categorias: juego.link
        ?.filter((l) => l.$.type === "boardgamecategory")
        .map((c) => c.$.value) || [],

      // Mecánicas
      mecanicas: juego.link
        ?.filter((l) => l.$.type === "boardgamemechanic")
        .map((m) => m.$.value) || [],

      // Puntuación media y ranking
      puntuacion: juego.statistics?.[0]?.ratings?.[0]?.average?.[0]?.$.value || null,
      ranking: juego.statistics?.[0]?.ratings?.[0]?.ranks?.[0]?.rank?.[0]?.$.value || null,

      // Descripción (en inglés, texto largo)
      descripcionBGG: juego.description?.[0] || null,
    };
  } catch (error) {
    console.error("❌ Error en buscarJuegoBGG:", error.message);
    return null;
  }
}
