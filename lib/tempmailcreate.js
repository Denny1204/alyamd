// lib/tempmailCreate.js
module.exports = async function tempmailCreate(
    m,
    hydro,
    args,
    pushname,
    replyhydro,
    generateWAMessageFromContent
) {
    try {
        await hydro.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

        let res = await fetch(`https://rynekoo-api.hf.space/tools/tempmail/v3/create`);
        if (!res.ok) return replyhydro(`❌ Gagal menghubungi server.`);

        let json = await res.json();
        if (!json.success) return replyhydro(`❌ Server Error.`);

        let email = json.result.email;
        let sessionId = json.result.sessionId;
        let expiredISO = json.result.expiresAt;

        let date = new Date(expiredISO);
        let expiredFormatted = new Intl.DateTimeFormat("id-ID", {
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta"
        }).format(date);

        const rows = [
            { header: "", title: "📥 Cek Inbox", description: "Lihat email masuk", id: `.tempmailinbox ${sessionId}` },
            { header: "", title: "➕ Generate Email Baru", description: "Buat email sementara baru", id: `.tempmailcreate` }
        ];

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: 
`✅ *TEMPMAIL MILIK ${pushname} BERHASIL DIBUAT!*

📩 Email : ${email}
🆔 Session ID : ${sessionId}
⏳ Expired : ${expiredFormatted}

Pilih aksi di bawah:` 
                        },
                        footer: { text: "Alya Chan Official" },
                        header: { title: "🕹️ Fitur Temp Mail by Alya" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Pilih Aksi",
                                    sections: [{ title: "Fitur Temp Mail", rows }]
                                })
                            }]
                        }
                    }
                }
            }
        }, { quoted: m }, {});

        await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.log(err);
        replyhydro(`❌ Error: ${err.message}`);
    }
};
