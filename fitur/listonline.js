let handler = async (m, { hydro }) => {
    try {
        // Pastikan grup
        if (!m.chat.endsWith('@g.us'))
            return hydro.sendMessage(m.chat, { text: "❌ Fitur ini hanya untuk grup." })

        // Ambil metadata grup
        const meta = await hydro.groupMetadata(m.chat)
        const parts = meta.participants || []

        let online = []

        // Cek presence per member
        for (let p of parts) {
            let jid = p.id

            try {
                await hydro.presenceSubscribe(jid)
                await new Promise(res => setTimeout(res, 400))

                let pres = hydro.presence?.[jid]
                if (!pres) continue

                let state = Object.values(pres)

                if (state.some(v => v.presence === "online" || v.presence === "available"))
                    online.push(jid)

            } catch { }
        }

        if (online.length === 0)
            return hydro.sendMessage(m.chat, { text: "Tidak ada member online." })

        let list = online.map(v => `- @${v.split("@")[0]}`).join("\n")

        await hydro.sendMessage(m.chat, {
            text: `📶 *Online Checker:*\n\n${list}`,
            mentions: online
        })

    } catch (e) {
        console.error(e)
        hydro.sendMessage(m.chat, { text: "⚠️ Error mengambil online list." })
    }
}
handler.tags = ['tools']
handler.command = ['listonline']
handler.group = true

module.exports = handler
