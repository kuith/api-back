import axios from "axios";
import { parseStringPromise } from "xml2js";

export async function buscarJuegoBGG(nombre) {
  try {
    const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(
      nombre
    )}&type=boardgame`;
    const searchRes = await axios.get(searchUrl);
    const searchData = await parseStringPromise(searchRes.data);

    if (!searchData.items.item) return null;

    const id = searchData.items.item[0].$.id;

    const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${id}`;
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
    };
  } catch (error) {
    console.error("❌ Error en buscarJuegoBGG:", error.message);
    return null;
  }
}
