// scrape/threads.js
const axios = require('axios')
const cheerio = require('cheerio')
const FormData = require('form-data')

async function threadsdl(url) {
    try {
        const form = new FormData()
        form.append('search', url)

        const { data } = await axios.post(
            'https://threadsdownload.net/ms?fresh-partial=true',
            form,
            {
                headers: {
                    accept: '*/*',
                    ...form.getHeaders(),
                    origin: 'https://threadsdownload.net',
                    referer: 'https://threadsdownload.net/ms',
                    'user-agent':
                        'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137 Mobile Safari/537.36'
                }
            }
        )

        const $ = cheerio.load(data)
        const jsonString = $(`script[type='application/json']`).text().trim()

        let braceCount = 0
        let endIndex = -1
        for (let i = 0; i < jsonString.length; i++) {
            if (jsonString[i] === '{') braceCount++
            if (jsonString[i] === '}') braceCount--
            if (braceCount === 0 && jsonString[i] === '}') {
                endIndex = i + 1
                break
            }
        }

        if (endIndex === -1) return null

        const validJsonString = jsonString.slice(0, endIndex)
        const jsonData = JSON.parse(validJsonString)

        return jsonData.v[0][1]
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = { threadsdl }
