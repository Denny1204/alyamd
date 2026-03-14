// ./scrape/ytmp4.js
const axios = require('axios')

async function fromVidssave(url) {
  const res = await axios.post(
    'https://api.vidssave.com/api/contentsite_api/media/parse',
    new URLSearchParams({
      auth: '20250901majwlqo',
      domain: 'api-ak.vidssave.com',
      origin: 'cache',
      link: url
    }).toString(),
    {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://vidssave.com',
        referer: 'https://vidssave.com/'
      },
      timeout: 20000
    }
  )

  const data = res?.data?.data
  if (!data) throw new Error('Vidssave gagal')

  const video720 = data.resources.find(r =>
    r.type === 'video' && r.quality?.includes('720')
  )

  const videoAny = data.resources.find(r => r.type === 'video')

  const chosen = video720 || videoAny
  if (!chosen) throw new Error('Format video tidak ditemukan')

  return {
    source: 'vidssave',
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    quality: chosen.quality,
    format: chosen.format,
    url: chosen.download_url
  }
}

async function fromNexray(url) {
  const api = `https://api.nexray.web.id/downloader/ytmp4?url=${encodeURIComponent(url)}&resolusi=720`
  const { data } = await axios.get(api, { timeout: 15000 })

  if (!data?.status) throw new Error('Nexray gagal')

  return {
    source: 'nexray',
    title: data.result.title,
    thumbnail: data.result.thumbnail,
    duration: data.result.duration,
    quality: data.result.quality,
    format: data.result.format,
    url: data.result.url
  }
}

async function fromFaa(url) {
  const api = `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(url)}`
  const { data } = await axios.get(api, { timeout: 15000 })

  if (!data?.status) throw new Error('FAA gagal')

  return {
    source: 'faa',
    title: 'Unknown',
    thumbnail: null,
    duration: null,
    quality: 'default',
    format: data.result.format,
    url: data.result.download_url
  }
}

module.exports = async function ytmp4(url) {
  if (!url) throw new Error('URL tidak boleh kosong')
  try {
    return await fromVidssave(url)
  } catch (e) {
    console.log('Vidssave gagal:', e.message)
  }
  try {
    return await fromNexray(url)
  } catch (e) {
    console.log('Nexray gagal:', e.message)
  }
  try {
    return await fromFaa(url)
  } catch (e) {
    console.log('FAA gagal:', e.message)
  }

  throw new Error('Semua API ytmp4 gagal')
}
