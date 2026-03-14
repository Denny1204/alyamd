// lib/ytmp4.js
const axios = require('axios')
const crypto = require('crypto')

function generateCookie() {
  const snowflake = crypto.randomBytes(16).toString('base64')
  const deviceToken = crypto.randomBytes(16).toString('base64url')
  const accessToken = crypto.randomBytes(16).toString('base64url')
  const sessionSecret = crypto.randomBytes(16).toString('hex')
  const fingerprint = crypto.randomBytes(64).toString('base64').slice(0, 64)

  return `webp=1788689759825; avif=1788689759825; snowflake=${encodeURIComponent(snowflake)}; lev=1; time-zone=Asia%2FJakarta; js=1; device-token=${deviceToken}; FPID=FPID2.2.${crypto.randomBytes(16).toString('base64url')}.${Date.now()}; i18n-activated-languages=id%2Cen; FPAU=1.1.${Math.floor(Math.random()*1000000)}.${Date.now()}; access-token=${accessToken}; session-secret=${sessionSecret}; fingerprint=${fingerprint}`
}

function defaultHeaders() {
  return {
    'accept': '*/*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json',
    'origin': 'https://turboscribe.ai',
    'referer': 'https://turboscribe.ai/id/downloader/youtube/mp4',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
    'x-lev-xhr': '1',
    'x-turbolinks-loaded': 'true'
  }
}

async function ytmp4(url) {
  const cookie = generateCookie()

  const { data: html } = await axios.post(
    'https://turboscribe.ai/_htmx/NCN20gAEkZMBzQPXkQc',
    { url },
    {
      headers: {
        ...defaultHeaders(),
        cookie
      }
    }
  )

  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  const thumbMatch = html.match(/<img src="([^"]+)"[^>]*object-cover/)

  const videoRegex = /<a href="(https:\/\/rr[^"]+?)"[^>]*>[\s\S]*?<div>([^<]+)\.mp4<\/div>[\s\S]*?<span>([0-9]+x[0-9]+)<\/span>[\s\S]*?<span>([0-9,]+(?:\.\d+)?)\s*MB<\/span>/g

  let formats = []
  let match

  while ((match = videoRegex.exec(html)) !== null) {
    formats.push({
      url: match[1].replace(/&amp;/g, '&'),
      title: match[2].trim(),
      resolution: match[3],
      size: match[4].replace(',', '.'),
      fullname: `${match[2].trim()}.mp4`
    })
  }

  if (!formats.length) throw new Error('Format MP4 tidak ditemukan')

  return {
    title: titleMatch ? titleMatch[1].trim() : 'Unknown',
    thumbnail: thumbMatch ? thumbMatch[1] : null,
    formats
  }
}

module.exports = { ytmp4 }
