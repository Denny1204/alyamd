const cheerio = require('cheerio')
const CryptoJS = require('crypto-js')
const axios = require('axios')

const RV_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'hx-request': 'true',
  'hx-current-url': 'https://reelsvideo.io/',
  'hx-target': 'target',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Origin': 'https://reelsvideo.io',
  'Referer': 'https://reelsvideo.io/'
}

const generateTS = () => Math.floor(Date.now() / 1000)
const generateTT = (ts) => CryptoJS.MD5(ts + 'X-Fc-Pp-Ty-eZ').toString()

async function reelsvideoScrape(igUrl) {
  const ts = generateTS()
  const tt = generateTT(ts)

  const body = new URLSearchParams()
  body.append('id', igUrl)
  body.append('locale', 'en')
  body.append('cf-turnstile-response', '')
  body.append('tt', tt)
  body.append('ts', ts)

  const res = await axios.post(
    'https://reelsvideo.io/reel/',
    body,
    { headers: RV_HEADERS }
  )

  const $ = cheerio.load(res.data)

  const username =
    $('.bg-white span.text-400-16-18').first().text().trim() || null

  const thumb =
    $('div[data-bg]').first().attr('data-bg') || null

  const videos = []
  $('a.type_videos').each((_, el) => {
    const href = $(el).attr('href')
    if (href) videos.push(href)
  })

  const images = []
  $('a.type_images').each((_, el) => {
    const href = $(el).attr('href')
    if (href) images.push(href)
  })

  const audios = []
  $('a.type_audio').each((_, el) => {
    const href = $(el).attr('href')
    const id = $(el).attr('data-id')
    if (href && id) audios.push({ id, url: href })
  })

  let type = 'unknown'
  if (videos.length && images.length) type = 'carousel'
  else if (videos.length) type = 'video'
  else if (images.length) type = 'photo'
  else if (audios.length) type = 'audio'

  return {
    type,
    username,
    thumb,
    videos,
    images,
    audios
  }
}

module.exports = { reelsvideoScrape }
