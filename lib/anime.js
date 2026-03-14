const axios = require("axios")

const BASE = "https://api.jikan.moe/v4"
const headers = {
  "User-Agent": "Mozilla/5.0 (Node.js MAL Scraper)"
}

async function get(url) {
  const res = await axios.get(url, { headers })
  return res.data
}

/* ================= SEARCH ANIME ================= */
async function searchAnime(q) {
  const json = await get(`${BASE}/anime?q=${encodeURIComponent(q)}&limit=10`)
  return json.data.map(a => ({
    mal_id: a.mal_id,
    title: a.title,
    image: a.images.jpg.image_url,
    score: a.score,
    episodes: a.episodes,
    type: a.type,
    year: a.year
  }))
}

/* ================= ANIME DETAIL ================= */
async function animeDetail(id) {
  const json = await get(`${BASE}/anime/${id}/full`)
  const a = json.data

  return {
    mal_id: a.mal_id,
    title: a.title,
    title_english: a.title_english,
    title_japanese: a.title_japanese,
    synonyms: a.title_synonyms,
    image: a.images.jpg.large_image_url,
    trailer: a.trailer?.url,
    score: a.score,
    rank: a.rank,
    popularity: a.popularity,
    members: a.members,
    type: a.type,
    episodes: a.episodes,
    status: a.status,
    aired: a.aired.string,
    duration: a.duration,
    rating: a.rating,
    genres: a.genres.map(g => g.name),
    studios: a.studios.map(s => s.name),
    producers: a.producers.map(p => p.name),
    synopsis: a.synopsis
  }
}

/* ================= TOP ANIME ================= */
async function topAnime() {
  const json = await get(`${BASE}/top/anime`)
  return json.data.map(a => ({
    rank: a.rank,
    title: a.title,
    score: a.score,
    image: a.images.jpg.image_url
  }))
}

/* ================= SEASONAL ================= */
async function seasonalAnime() {
  const json = await get(`${BASE}/seasons/now`)
  return json.data.map(a => ({
    title: a.title,
    score: a.score,
    image: a.images.jpg.image_url,
    episodes: a.episodes,
    studios: a.studios.map(s => s.name)
  }))
}

/* ================= CHARACTERS ================= */
async function animeCharacters(id) {
  const json = await get(`${BASE}/anime/${id}/characters`)
  return json.data.map(c => ({
    name: c.character.name,
    role: c.role,
    image: c.character.images.jpg.image_url,
    favorites: c.favorites
  }))
}

/* ================= STAFF ================= */
async function animeStaff(id) {
  const json = await get(`${BASE}/anime/${id}/staff`)
  return json.data.map(s => ({
    name: s.person.name,
    position: s.positions.join(", "),
    image: s.person.images.jpg.image_url
  }))
}

/* ================= RECOMMENDATIONS ================= */
async function animeRecommendations(id) {
  const json = await get(`${BASE}/anime/${id}/recommendations`)
  return json.data.map(r => ({
    title: r.entry.title,
    image: r.entry.images.jpg.image_url,
    votes: r.votes
  }))
}

/* ================= CASE HANDLER ================= */
async function malCase(type, query) {
  switch (type) {

    case "search":
      return await searchAnime(query)

    case "detail":
      return await animeDetail(query)

    case "top":
      return await topAnime()

    case "season":
      return await seasonalAnime()

    case "character":
      return await animeCharacters(query)

    case "staff":
      return await animeStaff(query)

    case "recommend":
      return await animeRecommendations(query)

    default:
      throw new Error("❌ Case tidak tersedia")
  }
}

module.exports = {
  malCase,
  searchAnime,
  animeDetail,
  topAnime,
  seasonalAnime,
  animeCharacters,
  animeStaff,
  animeRecommendations
}
