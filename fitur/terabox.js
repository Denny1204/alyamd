const axios = require("axios")
const cheerio = require("cheerio")
const FormData = require("form-data")

class TeraBox {
  constructor() {
    this.BASE_URL = "https://terabxdownloader.org"
    this.AJAX_PATH = "/wp-admin/admin-ajax.php"
    this.CREATED_BY = "Ryuusuke_ID"
    this.NOTE =
      "Thank you for using this scrape, I hope you appreciate me for making this scrape by not deleting wm"
  }

  wrapResponse(data) {
    return {
      created_by: this.CREATED_BY,
      note: this.NOTE,
      results: data
    }
  }

  transformFolder(v) {
    return {
      name: v["📂 Name"],
      type: v["📋 Type"],
      size: v["📏 Size"]
    }
  }

  transformFile(v) {
    return {
      name: v["📂 Name"],
      type: v["📋 Type"],
      fullPath: v["📍 Full Path"],
      size: v["📏 Size"],
      download: v["🔽 Direct Download Link"]
    }
  }

  transformSummary(v) {
    return {
      totalFolders: v["📁 Total Folders"],
      totalFiles: v["📄 Total Files"],
      totalItems: v["🔢 Total Items"]
    }
  }

  extractData(res) {
    const data = res?.data || {}
    return {
      folders: (data["📁 Folders"] || []).map(x => this.transformFolder(x)),
      files: (data["📄 Files"] || []).map(x => this.transformFile(x)),
      summary: data["📊 Summary"]
        ? this.transformSummary(data["📊 Summary"])
        : { totalFolders: 0, totalFiles: 0, totalItems: 0 },
      shortlink: data["🔗 ShortLink"] || ""
    }
  }

  async getNonce() {
    const { data } = await axios.get(this.BASE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
      }
    })

    const $ = cheerio.load(data)
    const js = $("#jquery-core-js-extra").html()
    if (!js) throw new Error("Nonce script not found")

    const nonce = js.match(/"nonce"\s*:\s*"([^"]+)"/i)
    if (!nonce) throw new Error("Nonce value not found")

    return nonce[1]
  }

  async download(url) {
    try {
      const nonce = await this.getNonce()

      const form = new FormData()
      form.append("action", "terabox_fetch")
      form.append("url", url)
      form.append("nonce", nonce)

      const { data } = await axios.post(
        this.BASE_URL + this.AJAX_PATH,
        form,
        {
          headers: {
            ...form.getHeaders(), // 🔥 PENTING
            Accept: "*/*",
            "Accept-Language": "id-ID,id;q=0.9",
            Referer: this.BASE_URL + "/",
            Origin: this.BASE_URL,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
          }
        }
      )

      if (!data || data === 0)
        throw new Error("Server returned empty response")

      return this.wrapResponse(this.extractData(data))
    } catch (e) {
      throw new Error(
        `TeraBox failed: ${e.response?.status || ""} ${e.message}`
      )
    }
  }
}

module.exports = TeraBox
