const axios = require('axios')

const deviantartSearch = async (query, limit = 12) => {
  const res = await axios.get('https://www.deviantart.com/search', {
    params: {
      q: query,
      content_type: 'visual'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html'
    }
  })

  // Ambil INITIAL STATE
  const match = res.data.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/)
  if (!match) return []

  const json = JSON.parse(match[1])

  // Deviations object (lebih stabil)
  const deviations = json?.deviations
  if (!deviations) return []

  const results = []

  for (const key in deviations) {
    const v = deviations[key]
    if (!v?.media?.baseUri) continue

    const img =
      v.media.baseUri +
      (v.media.types?.find(t => t.c)?.c || '')

    results.push({
      image: img,
      title: v.title || 'DeviantArt',
      author: v.author?.username || '-'
    })

    if (results.length >= limit) break
  }

  return results
}

module.exports = {
  deviantartSearch
}
