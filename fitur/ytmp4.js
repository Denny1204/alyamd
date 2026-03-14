const axios = require("axios")

async function ytmp4(url, resolusi = "480") {
  if (!url) throw new Error("URL YouTube tidak boleh kosong")

  // API utama
  const apiPrimary = `https://api.nexray.web.id/downloader/ytmp4?url=${encodeURIComponent(url)}&resolusi=${resolusi}`

  // API cadangan
  const apiBackup = `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(url)}`

  try {
    // ===== COBA API UTAMA =====
    const { data } = await axios.get(apiPrimary, { timeout: 15000 })

    if (!data.status) throw new Error("API utama gagal")

    return {
      source: "nexray",
      title: data.result.title,
      author: data.result.author,
      thumbnail: data.result.thumbnail,
      duration: data.result.duration,
      quality: data.result.quality,
      format: data.result.format,
      url: data.result.url
    }

  } catch (err) {
    // ===== FALLBACK API =====
    try {
      const { data } = await axios.get(apiBackup, { timeout: 15000 })

      if (!data.status) throw new Error("API cadangan gagal")

      return {
        source: "faa",
        title: "Unknown",
        author: "Unknown",
        thumbnail: null,
        duration: null,
        quality: "default",
        format: data.result.format,
        url: data.result.download_url
      }

    } catch (e) {
      throw new Error("Semua API ytmp4 gagal")
    }
  }
}

module.exports = ytmp4
