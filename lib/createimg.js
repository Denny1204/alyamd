const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const crypto = require('crypto')
const { zencf } = require('zencf')

const API = 'https://www.createimg.com/?api=v1'

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'x-requested-with': 'XMLHttpRequest',
  origin: 'https://www.createimg.com',
  referer: 'https://www.createimg.com/'
}

class CreateImg {
  async upload(buffer, filename = 'hydro.png') {
    const form = new FormData()
    form.append('files[]', buffer, filename)

    const { data } = await axios.post('https://uguu.se/upload', form, {
      headers: form.getHeaders()
    })

    return data.files[0].url
  }

  async post(body, extraHeaders = {}) {
    const { data } = await axios.post(API, body, {
      headers: { ...headers, ...extraHeaders }
    })
    return data
  }

  async run(module, prompt, imagePath) {
    if (!prompt) throw 'Prompt tidak boleh kosong'
    if (module === 'edit' && (!imagePath || !fs.existsSync(imagePath))) {
      throw 'Gambar tidak ditemukan'
    }

    // 🔐 Cloudflare Turnstile
    const { token } = await zencf.turnstileMin(
      'https://www.createimg.com',
      '0x4AAAAAABggkaHPwa2n_WBx'
    )

    const security = crypto.randomUUID()

    const turnstile = await this.post(
      new URLSearchParams({
        token,
        security,
        action: 'turnstile',
        module
      }).toString()
    )

    if (!turnstile?.status) throw 'Turnstile gagal'

    const { server, size } = turnstile
    let ref

    // 🖼 upload image (edit mode)
    if (module === 'edit') {
      const form = new FormData()
      form.append('token', token)
      form.append('security', security)
      form.append('action', 'upload')
      form.append('server', server)
      form.append('ref', fs.createReadStream(imagePath))

      const upload = await this.post(form, form.getHeaders())
      ref = upload.filename.ref
    }

    // 🎨 create task
    const create = await this.post(
      new URLSearchParams({
        token,
        security,
        action: module,
        server,
        prompt,
        negative: '',
        seed: Math.floor(Math.random() * 2147483647),
        size,
        ...(ref ? { 'files[ref]': ref } : {})
      }).toString()
    )

    if (!create?.id) throw 'Gagal membuat task'

    const taskId = create.id
    let queueId = create.queue

    // ⏳ queue checker
    while (true) {
      await new Promise(r => setTimeout(r, 3000))
      const q = await this.post(
        new URLSearchParams({
          id: taskId,
          queue: queueId,
          action: 'queue',
          module,
          server,
          token,
          security
        }).toString()
      )
      if (q?.pending === 0) break
    }

    // 📜 history
    const history = await this.post(
      new URLSearchParams({
        id: taskId,
        action: 'history',
        module,
        server,
        token,
        security
      }).toString()
    )

    // 📤 output
    const output = await this.post(
      new URLSearchParams({
        id: history.file,
        action: 'output',
        module,
        server,
        token,
        security,
        page: 'home',
        lang: 'en'
      }).toString()
    )

    const buffer = Buffer.from(
      output.data.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    )

    return this.upload(buffer)
  }

  create(prompt) {
    return this.run('create', prompt)
  }

  edit(prompt, imagePath) {
    return this.run('edit', prompt, imagePath)
  }
}

module.exports = CreateImg
