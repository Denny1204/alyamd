// lib/tempmailInbox.js
module.exports = async function tempmailInbox(
    m,
    args,
    hydro,
    replyhydro
) {
    try {
        if (!args[0]) {
            return replyhydro(
`📬 *TEMPMAIL INBOX*

*Cara Pakai:*
> .tempmailinbox <sessionId>

Contoh:
> .tempmailinbox U2Vzc2lvbjpJdRYFYGRIs5ytn3_PJyah`
            );
        }

        const sessionId = args[0];
        await hydro.sendMessage(m.chat, { react: { text: "📨", key: m.key } });

        let res = await fetch(`https://rynekoo-api.hf.space/tools/tempmail/v3/inbox?id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) return replyhydro(`❌ Gagal menghubungi server API.`);

        let json = await res.json();
        if (!json.success) return replyhydro(`❌ API Error.`);

        let emails = json.result.emails;
        let total = json.result.totalEmails;

        if (!emails || emails.length === 0) {
            return replyhydro(`📭 *Inbox kosong!*\nTotal email: ${total}`);
        }

        let teks =
`📨 *Inbox TEMPMAIL*
🆔 Session: ${sessionId}
📩 Total: ${total}

`;

        emails.forEach((mail, i) => {
            teks += `——————————————
✉️ *Email #${i + 1}*
🔹 Dari: ${mail.from}
🔹 Subjek: ${mail.subject}
🔹 Untuk: ${mail.to}
📄 Isi:
${mail.text ? mail.text : "(Tidak ada isi)"}\n\n`;

            if (mail.downloadUrl) {
                teks += `📥 Download email:\n${mail.downloadUrl}\n\n`;
            }
        });

        replyhydro(teks);

    } catch (err) {
        console.log(err);
        replyhydro(`❌ Error: ${err.message}`);
    }
};
