const { areJidsSameUser } = require('socketon')

/**
 * Resolve berbagai input → JID valid (@s.whatsapp.net)
 * Support:
 * - nomor mentah
 * - @s.whatsapp.net
 * - @lid
 */
async function getCleanedJid(rawJid, conn, participants = []) {
  if (!rawJid) return null

  // Sudah JID normal
  if (rawJid.endsWith('@s.whatsapp.net')) return rawJid

  // @lid → cocokkan ke participant grup
  if (rawJid.endsWith('@lid')) {
    const found = participants.find(p =>
      areJidsSameUser(p.id, rawJid)
    )
    if (found?.id?.endsWith('@s.whatsapp.net')) {
      return found.id
    }
  }

  // Nomor mentah
  const num = rawJid.replace(/[^0-9]/g, '')
  if (num.length >= 9 && num.length <= 15) {
    const jid = num + '@s.whatsapp.net'
    try {
      const [res] = await conn.onWhatsApp(jid)
      if (res?.exists) return res.jid
    } catch {}
  }

  return null
}

module.exports = { getCleanedJid }
