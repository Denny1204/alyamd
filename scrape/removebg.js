const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')
const path = require('path')

const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"',
  'Accept-Language': 'id-ID,id;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6'
}

async function getwebtoken() {
  const r = await axios.get(
    'https://removal.ai/wp-admin/admin-ajax.php',
    {
      headers,
      params: {
        action: 'ajax_get_webtoken',
        security: '4acc8a2f93'
      }
    }
  )

  return r.data?.data?.webtoken
}

async function removebg(inputPath) {
  const webToken = await getwebtoken()

  const form = new FormData()
  form.append(
    'image_file',
    fs.createReadStream(inputPath),
    {
      filename: path.basename(inputPath),
      contentType: 'image/jpeg'
    }
  )

  const r = await axios.post(
    'https://api.removal.ai/3.0/remove',
    form,
    {
      headers: {
        ...headers,
        ...form.getHeaders(),
        'Web-Token': webToken
      }
    }
  )

  return r.data
}

module.exports = { removebg }
