// ./scrape/ytdl.js
const crypto = require("crypto")
const axios = require("axios")

class SaveTube {
  constructor() {
    this.ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
    this.fmt = ['144', '240', '360', '480', '720', '1080', 'mp3']
    this.m = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/
    this.is = axios.create({
      headers: {
        'content-type': 'application/json',
        'origin': 'https://yt.savetube.me',
        'user-agent': 'Mozilla/5.0 (Android 15; Mobile)'
      }
    })
  }

  decrypt(enc) {
    const buf = Buffer.from(enc, 'base64')
    const key = Buffer.from(this.ky, 'hex')
    const iv = buf.slice(0, 16)
    const data = buf.slice(16)
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
    return JSON.parse(
      Buffer.concat([decipher.update(data), decipher.final()]).toString()
    )
  }

  async getCdn() {
    const res = await this.is.get('https://media.savetube.vip/api/random-cdn')
    return res.data?.cdn
  }

  async download(url, format) {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error('ID video tidak ditemukan')

    const cdn = await this.getCdn()
    if (!cdn) throw new Error('CDN tidak tersedia')

    const info = await this.is.post(`https://${cdn}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    })

    const dec = this.decrypt(info.data.data)

    const dl = await this.is.post(`https://${cdn}/download`, {
      id,
      downloadType: format === 'mp3' ? 'audio' : 'video',
      quality: format === 'mp3' ? '128' : format,
      key: dec.key
    })

    return {
      title: dec.title,
      cover: dec.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: dec.duration,
      formats: [
        {
          quality: format,
          url: dl.data.data.downloadUrl
        }
      ]
    }
  }
}

/**
 * @param {string} url
 * @param {string} quality mp3 | 144 | 240 | 360 | 480 | 720 | 1080
 */
module.exports = async function ytdl(url, quality = 'mp3') {
  const yt = new SaveTube()
  return yt.download(url, quality)
}
