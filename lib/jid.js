const { areJidsSameUser } = require('socketon')

/**
 * Normalisasi target → WID (@s.whatsapp.net)
 * Support:
 * - @s.whatsapp.net
 * - @lid (via participants / metadata)
 * - nomor bebas (08 / +62 / 62)
 */
async function resolveWid(m, conn, rawTarget, participants = []) {
  if (!rawTarget) return null

  // sudah wid normal
  if (typeof rawTarget === 'string' && rawTarget.endsWith('@s.whatsapp.net')) {
    return rawTarget
  }

  // handle @lid
  if (typeof rawTarget === 'string' && rawTarget.endsWith('@lid')) {
    let parts = participants

    // fallback ambil metadata sendiri
    if (!Array.isArray(parts) || !parts.length) {
      try {
        const meta = await conn.groupMetadata(m.chat)
        parts = meta?.participants || []
      } catch {}
    }

    const found = parts.find(p =>
      areJidsSameUser(p.id, rawTarget)
    )

    if (found?.id?.endsWith('@s.whatsapp.net')) {
      return found.id
    }

    // beda dengan punyamu: jangan throw, biar aman
    return null
  }

  // nomor bebas
  if (typeof rawTarget === 'string') {
    const num = rawTarget.replace(/\D/g, '')
    if (num.length >= 9 && num.length <= 16) {
      let fixed =
        num.startsWith('0') ? '62' + num.slice(1)
        : num.startsWith('62') ? num
        : '62' + num

      return fixed + '@s.whatsapp.net'
    }
  }

  return null
}

module.exports = { resolveWid }
