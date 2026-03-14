const axios = require('axios');

// Base URL API
const baseURL = 'https://www.sankavollerei.com/anime';

// Helper function untuk fetch data
async function fetchJson(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return { status: 'error', message: error.message };
    }
}

/**
 * Mendapatkan data Home (Ongoing & Completed terbaru)
 */
async function animeHome() {
    return await fetchJson(`${baseURL}/home`);
}

async function animeSchedule() {
    return await fetchJson(`${baseURL}/schedule`);
}

async function animeDetail(slug) {
    if (!slug) return { status: 'error', message: 'Slug tidak boleh kosong' };
    return await fetchJson(`${baseURL}/anime/${slug}`);
}

async function animeCompleted(page = 1) {
    return await fetchJson(`${baseURL}/complete-anime?page=${page}`);
}

async function animeOngoing(page = 1) {
    return await fetchJson(`${baseURL}/ongoing-anime?page=${page}`);
}

async function animeGenreList() {
    return await fetchJson(`${baseURL}/genre`);
}

async function animeByGenre(slug, page = 1) {
    if (!slug) return { status: 'error', message: 'Slug genre tidak boleh kosong' };
    return await fetchJson(`${baseURL}/genre/${slug}?page=${page}`);
}

async function animeSearch(keyword) {
    if (!keyword) return { status: 'error', message: 'Keyword tidak boleh kosong' };
    return await fetchJson(`${baseURL}/search/${keyword}`);
}

async function animeEpisode(slug) {
    if (!slug) return { status: 'error', message: 'Slug episode tidak boleh kosong' };
    return await fetchJson(`${baseURL}/episode/${slug}`);
}

async function animeBatch(slug) {
    if (!slug) return { status: 'error', message: 'Slug batch tidak boleh kosong' };
    return await fetchJson(`${baseURL}/batch/${slug}`);
}

module.exports = {
    animeHome,
    animeSchedule,
    animeDetail,
    animeCompleted,
    animeOngoing,
    animeGenreList,
    animeByGenre,
    animeSearch,
    animeEpisode,
    animeBatch
};