const fs = require('fs')
const { getBuffer } = require('./myfunc')
const { isSetWelcome, getTextSetWelcome } = require('./setwelcome')
const { isSetLeft, getTextSetLeft } = require('./setleft')

let set_welcome_db = JSON.parse(fs.readFileSync('./database/set_welcome.json'))
let set_left_db = JSON.parse(fs.readFileSync('./database/set_left.json'))
let setting = JSON.parse(fs.readFileSync('./config.json'))

global.welcomeBg = setting.welcomeBg || 'https://i.ibb.co/4YBNyvP/mountain-sunset.jpg'
global.goodbyeBg = setting.goodbyeBg || 'https://i.ibb.co/4YBNyvP/images-76.jpg'

const CANVAS_API = 'https://api.nexray.web.id/canvas/v1/welcomeleave'

module.exports.welcome = async (iswel, isleft, hydro, anu) => {
  try {
    const metadata = await hydro.groupMetadata(anu.id)
    const groupName = metadata.subject
    const members = metadata.participants.length

    for (let num of anu.participants) {
      let pp_user
      try {
        pp_user = await hydro.profilePictureUrl(num, 'image')
      } catch {
        pp_user = 'https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg'
      }

      /* ================== WELCOME ================== */
      if (anu.action === 'add' && (iswel || setting.auto_welcomeMsg)) {
        let caption = ''
        if (isSetWelcome(anu.id, set_welcome_db)) {
          const teks = await getTextSetWelcome(anu.id, set_welcome_db)
          caption = teks
            .replace(/@user/gi, `@${num.split('@')[0]}`)
            .replace(/@group/gi, groupName)
            .replace(/@desc/gi, metadata.desc || '')
        } else {
          caption = `ʜᴀɪ 👋 @${num.split('@')[0]}\nꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ *${groupName}*`
        }

        const imgUrl =
          `${CANVAS_API}?title=Welcome` +
          `&description=${encodeURIComponent(groupName + ' | Members: ' + members)}` +
          `&avatar=${encodeURIComponent(pp_user)}` +
          `&background=${encodeURIComponent(global.welcomeBg)}` +
          `&border=%232a2e35&avatarborder=%23FFFFFF`

        await hydro.sendMessage(anu.id, {
          image: { url: imgUrl },
          caption,
          mentions: [num]
        })
      }

      /* ================== LEAVE ================== */
      else if (anu.action === 'remove' && (isleft || setting.auto_leaveMsg)) {
        let caption = ''
        if (isSetLeft(anu.id, set_left_db)) {
          const teks = await getTextSetLeft(anu.id, set_left_db)
          caption = teks
            .replace(/@user/gi, `@${num.split('@')[0]}`)
            .replace(/@group/gi, groupName)
            .replace(/@desc/gi, metadata.desc || '')
        } else {
          caption = `ʙᴀɪʙᴀɪ 👋 @${num.split('@')[0]}\nᴅᴀʀɪ *${groupName}*`
        }

        const imgUrl =
          `${CANVAS_API}?title=Goodbye` +
          `&description=${encodeURIComponent(groupName + ' | Members: ' + members)}` +
          `&avatar=${encodeURIComponent(pp_user)}` +
          `&background=${encodeURIComponent(global.goodbyeBg)}` +
          `&border=%232a2e35&avatarborder=%23FFFFFF`

        await hydro.sendMessage(anu.id, {
          image: { url: imgUrl },
          caption,
          mentions: [num]
        })
      }

      /* ================== PROMOTE ================== */
      else if (anu.action === 'promote') {
        hydro.sendMessage(anu.id, {
          text: `🎉 @${num.split('@')[0]} Statusmu sekarang naik jadi *ADMIN* di *${groupName}*`,
          mentions: [num]
        })
      }

      /* ================== DEMOTE ================== */
      else if (anu.action === 'demote') {
        hydro.sendMessage(anu.id, {
          text: `😶 @${num.split('@')[0]} statusmu sekarang Turun ke *MEMBER* lagi di *${groupName}*`,
          mentions: [num]
        })
      }
    }
  } catch (e) {
    console.error('WELCOME ERROR:', e)
  }
}
