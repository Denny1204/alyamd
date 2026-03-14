// lib/swgc.js
const { fromBuffer } = require("file-type");
const fs = require("fs");
const path = require("path");
const { generateWAMessageFromContent } = require("@whiskeysockets/baileys");

async function swgcHandler(m, hydro, store, text, Ahmad, mess, replytolak) {
    let content = {};
    let buffer, ext, tempFile;

    if (m.quoted) {
        try {
            buffer = await m.quoted.download();
            if (!buffer) return hydro.sendText(m.chat, "❌ Gagal mengambil media quoted.");

            ext = (await fromBuffer(buffer))?.ext || "bin";
            tempFile = path.join(__dirname, `tmp_${Date.now()}.${ext}`);
            fs.writeFileSync(tempFile, buffer);

            const quotedType = m.quoted.mtype || Object.keys(m.quoted.message || {})[0] || "";
            if (/image|video|audio/.test(quotedType)) {
                if (/image/.test(quotedType)) {
                    content.image = { url: tempFile };
                    if (text) content.caption = text;
                } else if (/video/.test(quotedType)) {
                    content.video = { url: tempFile };
                    if (text) content.caption = text;
                } else if (/audio/.test(quotedType)) {
                    if (text) {
                        fs.unlinkSync(tempFile);
                        return hydro.sendText(m.chat, "Audio tidak boleh disertai caption.");
                    }
                    content.audio = { url: tempFile };
                    content.ptt = false;
                }
            } else {
                fs.unlinkSync(tempFile);
                return hydro.sendText(m.chat, "Reply harus berupa image/video/audio.");
            }
        } catch (e) {
            return hydro.sendText(m.chat, "❌ Media tidak valid atau gagal diproses.");
        }
    } else if (text) {
        content.text = text;
    } else {
        return hydro.sendText(m.chat, "Kirim media (foto/video/audio) atau teks, bisa dengan reply atau langsung.");
    }

    if (content.text && !content.text.trim()) 
        return hydro.sendText(m.chat, "Teks tidak boleh kosong.");

    let grupList = await store.chats.all().filter(v => v.id.endsWith("@g.us")).map(v => v.id);
    let validGroups = [];

    for (let gid of grupList) {
        try {
            let metadata = await hydro.groupMetadata(gid);
            validGroups.push({
                title: metadata.subject,
                description: gid,
                id: `.sendstatus ${gid} ${encodeURIComponent(JSON.stringify(content))}`
            });
        } catch {}
    }

    if (!validGroups.length) {
        if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        return hydro.sendText(m.chat, "Tidak ada grup valid yang bisa dipilih.");
    }

    const msg = generateWAMessageFromContent(
        m.chat,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: "```Pilih Grup Tujuan ♨️```" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "PILIH GRUP",
                                        sections: [{ title: "", rows: validGroups }]
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        },
        { quoted: m },
        {}
    );

    await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}

async function sendStatusHandler(m, args, hydro, Ahmad, replytolak, groupStatus) {
    const [groupId, ...contentARR] = args;
    const contentDecoded = JSON.parse(decodeURIComponent(contentARR.join(" ")));

    await groupStatus(groupId, contentDecoded);

    if (contentDecoded?.image?.url && fs.existsSync(contentDecoded.image.url)) fs.unlinkSync(contentDecoded.image.url);
    if (contentDecoded?.video?.url && fs.existsSync(contentDecoded.video.url)) fs.unlinkSync(contentDecoded.video.url);
    if (contentDecoded?.audio?.url && fs.existsSync(contentDecoded.audio.url)) fs.unlinkSync(contentDecoded.audio.url);

    hydro.sendText(m.chat, `Berhasil dikirim ke grup id: ${groupId}`);
}

module.exports = {
    swgcHandler,
    sendStatusHandler
};
