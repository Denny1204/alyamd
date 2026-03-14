/*
* Nama fitur : Pinterest Downloader [ Sup video ]
* Type : Plugin CJS
* Sumber : https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
* Author : ZenzzXD
*/

const qs = require('querystring')

// aktifkan ini kalau Node < 18
// const fetch = require('node-fetch')

const BASE_URL = 'https://steptodown.com'

async function getToken() {
  const res = await fetch(`${BASE_URL}/pinterest-video-downloader/`, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137 Safari/537.36'
    }
  })

  const html = await res.text()
  const match = html.match(/name="token" value="([^"]+)"/)

  if (!match) throw new Error('token tidak ditemukan')
  return match[1]
}

async function getVideoData(targetUrl, token) {
  const res = await fetch(`${BASE_URL}/wp-json/aio-dl/video-data/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137 Safari/537.36',
      origin: BASE_URL,
      referer: `${BASE_URL}/pinterest-video-downloader/`
    },
    body: qs.stringify({
      url: targetUrl,
      token
    })
  })

  return res.json()
}

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) {
    return m.reply(`contoh : ${command} https://pin.it/xxxxx`)
  }

  try {
    m.reply('wett')

    const token = await getToken()
    const data = await getVideoData(args[0], token)

    if (!data.medias || !data.medias.length) {
      return m.reply('gagal ambil media')
    }

    const video = data.medias.find(v => v.extension === 'mp4')

    if (video) {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: video.url },
          mimetype: 'video/mp4'
        },
        { quoted: m }
      )
    } else {
      const image = data.medias.find(
        i => i.extension === 'jpg' || i.extension === 'png'
      )

      if (image) {
        await conn.sendMessage(
          m.chat,
          {
            image: { url: image.url }
          },
          { quoted: m }
        )
      }
    }
  } catch (e) {
    m.reply(`Eror kak : ${e.message}`)
  }
}

handler.help = ['pinterestdl <url>']
handler.tags = ['downloader']
handler.command = ['pindl', 'pinterestdl']

module.exports = handler
