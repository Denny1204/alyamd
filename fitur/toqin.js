const fetch = require("node-fetch")
const { Buffer } = require("buffer")

const DEFAULT_PROMPT = `
Buat saya memakai kostum Qin Shi Huang dari anime Record of Ragnarok, termasuk desain penutup mata dan pakaian yang dikenakan Qin Shi Huang di dalam anime Record of Ragnarok. Buatkan pose khasnya.

Characterized by stark cinematic lighting and intense contrast. Captured with a slightly low, upward-facing angle that dramatizes the subject's jawline and neck, the composition evokes quiet dominance and sculptural elegance. The background is a deep, saturated crimson red, creating a bold visual clash with the model's luminous skin and dark wardrobe.

Lighting is tightly directional, casting warm golden highlights on one side of the face while plunging the other into velvety shadow, emphasizing bone structure with almost architectural precision.

The subject's expression is unreadable, cool-toned eyes half-lidded, lips relaxed—suggesting detachment or quiet defiance. The model wears a highly detailed and realistic costume inspired by the anime, preserving anime-like colors and textures.

Minimal retouching preserves skin texture and slight imperfections, adding realism. Editorial tension is created through close cropping, tonal control, and the almost oppressive intimacy of the camera's proximity.

Make the face and hairstyle as similar as possible to the one in the photo. Pertahankan gaya rambut dan warna yang sama. Buat kostumnya sangat detail dan realistis. Gunakan warna dan tekstur yang mirip anime.
`.trim()

async function toQin(m, hydro, text, pushname, botname) {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ""

  if (!mime.startsWith("image/")) {
    return m.reply("🍂 *Reply gambar yang ingin diedit.*")
  }

  await hydro.sendMessage(m.chat, {
    react: { text: "⏳", key: m.key }
  })

  const media = await q.download().catch(() => null)
  if (!media) {
    return gagal(m, hydro, pushname, botname, "Gagal membaca gambar")
  }

  let response
  try {
    response = await fetch(
      "https://ai-studio.anisaofc.my.id/api/edit-image",
      {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: Buffer.from(media).toString("base64"),
          prompt: text || DEFAULT_PROMPT
        })
      }
    )
  } catch {
    return gagal(m, hydro, pushname, botname, "Server AI tidak merespon")
  }

  let result
  try {
    result = JSON.parse(await response.text())
  } catch {
    return gagal(m, hydro, pushname, botname, "Respon server tidak valid")
  }

  const imageResult =
    result?.imageUrl ||
    result?.data ||
    result?.image ||
    result?.url

  if (!imageResult) {
    return gagal(
      m,
      hydro,
      pushname,
      botname,
      "Server tidak mengembalikan hasil"
    )
  }

  await hydro.sendMessage(
    m.chat,
    {
      image: { url: imageResult },
      caption: `✨ * BERHASIL UBAH KE QIN SHI HUANG* (maybe) ✨

👤 *Request By* : ${pushname}

━━━━━━━━━━━━━━━━━━
🚀 *Powered By ${botname}*
━━━━━━━━━━━━━━━━━━`
    },
    { quoted: m }
  )

  await hydro.sendMessage(m.chat, {
    react: { text: "", key: m.key }
  })
}

async function gagal(m, hydro, pushname, botname, alasan) {
  await hydro.sendMessage(
    m.chat,
    {
      text: `❌ *EDIT GAMBAR GAGAL*

👤 *Request By* : ${pushname}
📌 *Alasan* :
> ${alasan}

━━━━━━━━━━━━━━━━━━
🚀 *Powered By ${botname}*
━━━━━━━━━━━━━━━━━━`
    },
    { quoted: m }
  )

  await hydro.sendMessage(m.chat, {
    react: { text: "", key: m.key }
  })
}

module.exports = toQin
