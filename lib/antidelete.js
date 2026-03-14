// ===================================
// Anti Delete System (Full Rebuild)
// ===================================

const fs = require('fs')
const path = require('path')
const { downloadMediaMessage } = require('socketon')

// Ambil bot number dari settings.js
const settings = require('../settings.js')
const BOT_NUMBER = (settings.global?.botnumber || settings.botnumber || "").replace(/[^0-9]/g, '') + '@s.whatsapp.net'

// ===================================
// File Database
// ===================================
const dbPath = './database/messagesBackup.json'
const statusPath = './database/antidelete.json'

// ===================================
// Load Messages Backup
// ===================================
let messagesBackup = new Map()
if (fs.existsSync(dbPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(dbPath))
    messagesBackup = new Map(Object.entries(data))
  } catch (e) {
    console.error('Error parsing messagesBackup.json:', e)
  }
}

// ===================================
// Load Anti Delete Status
// ===================================
let antideleteStatus = {}
if (fs.existsSync(statusPath)) {
  try {
    antideleteStatus = JSON.parse(fs.readFileSync(statusPath))
  } catch (e) {
    console.error('Error parsing antidelete.json:', e)
  }
}

// ===================================
// Save Functions
// ===================================
const saveMessages = () =>
  fs.writeFileSync(dbPath, JSON.stringify([...messagesBackup], null, 2))

const saveStatus = () =>
  fs.writeFileSync(statusPath, JSON.stringify(antideleteStatus, null, 2))

// ===================================
// Enable / Disable Anti Delete
// ===================================
const toggle = (chatId, status) => {
  antideleteStatus[chatId] = status
  saveStatus()
}

// ===================================
// Register Listener
// ===================================
const registerListener = (hydro) => {
  hydro.ev.on('messages.upsert', async ({ messages }) => {

    for (let m of messages) {
      if (!m.message) continue

      const chatId = m.key.remoteJid

      // ===================================
      // HANDLE DELETED MESSAGE
      // ===================================
      if (m.message.protocolMessage?.type === 0) {

        const deletedKey = m.message.protocolMessage.key
        const msgId = deletedKey.id
        const deleter = deletedKey.participant || chatId

        // IGNORE: bot sendiri
        if (deleter === hydro.user.id) continue

        // IGNORE: nomor bot dari settings.js
        if (deleter === BOT_NUMBER) continue

        // Check anti delete ON / OFF
        if (!antideleteStatus[chatId]) continue

        // Pesan tidak ditemukan di backup
        if (!messagesBackup.has(msgId)) continue

        const originalMsg = messagesBackup.get(msgId)

        const pushname =
          originalMsg.pushName ||
          originalMsg.key.participant ||
          'Unknown'

        let msgContent = ''
        let isMedia = false
        let mediaType = null
        let mediaBuffer = null

        // ===== Text =====
        if (originalMsg.message.conversation) {
          msgContent = originalMsg.message.conversation
        } else if (originalMsg.message.extendedTextMessage?.text) {
          msgContent = originalMsg.message.extendedTextMessage.text
        }

        // ===== Sticker =====
        else if (originalMsg.message.stickerMessage) {
          isMedia = true
          msgContent = '[Stiker]'
          mediaType = 'sticker'
        }

        // ===== Image =====
        else if (originalMsg.message.imageMessage) {
          isMedia = true
          msgContent = '[Gambar]'
          mediaType = 'image'
          mediaBuffer = await downloadMediaMessage(originalMsg, 'buffer')
        }

        // ===== Video =====
        else if (originalMsg.message.videoMessage) {
          isMedia = true
          msgContent = '[Video]'
          mediaType = 'video'
          mediaBuffer = await downloadMediaMessage(originalMsg, 'buffer')
        }

        // ===== Audio =====
        else if (originalMsg.message.audioMessage) {
          isMedia = true
          msgContent = '[Audio]'
          mediaType = 'audio'
          mediaBuffer = await downloadMediaMessage(originalMsg, 'buffer')
        }

        // ===== Document =====
        else if (originalMsg.message.documentMessage) {
          isMedia = true
          msgContent = '[Dokumen]'
          mediaType = 'document'
          mediaBuffer = await downloadMediaMessage(originalMsg, 'buffer')
        }

        // ===================================
        // SEND DETECTION MESSAGE
        // ===================================
        if (isMedia && mediaBuffer) {
          await hydro.sendMessage(chatId, {
            text:
              `⚠️ *Pesan Terhapus!*\n` +
              `👤 User: *${pushname}*\n` +
              `📌 Jenis: *${msgContent}*`
          })

          await hydro.sendMessage(chatId, {
            [mediaType]: mediaBuffer
          })
        } else {
          await hydro.sendMessage(chatId, {
            text:
              `⚠️ *Pesan Terhapus!*\n` +
              `👤 User: *${pushname}*\n` +
              `📝 Isi: *${msgContent || '[Unknown]'}*`,
            quoted: originalMsg
          })
        }

        continue
      }

      // ===================================
      // SAVE NEW MESSAGE
      // ===================================
      if (!messagesBackup.has(m.key.id)) {
        messagesBackup.set(m.key.id, m)
        saveMessages()
      }

    }
  })
}

// ===================================
module.exports = {
  toggle,
  registerListener,
  messagesBackup
}
