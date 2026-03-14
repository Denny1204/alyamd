const fetch = require('node-fetch');

module.exports = async function reactChannelHandler(
    m,
    hydro,
    prefix,
    command,
    args,
    pushname,
    botname,
    replyhydro,
    getRandomApiKey
) {
    // validasi argumen
    if (args.length < 2) {
        return replyhydro(
            `❌ *Format Salah!*

📌 *Format:*
${prefix + command} <link> <emoji1> <emoji2> ...

📖 *Contoh:*
${prefix + command} https://whatsapp.com/channel/xxx 👍 ❤️ 🔥`
        );
    }

    // ambil link
    const link = args.shift();

    // parsing emoji
    const emojiList = args
        .join(" ")
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter(e => e.trim());

    const emoji = emojiList.join(",");

    // ambil api key random
    const apiKey = getRandomApiKey?.() || "";

    try {
        // react loading
        await hydro.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        const url = `https://react.whyux-xec.my.id/api/rch?link=${encodeURIComponent(link)}&emoji=${encodeURIComponent(emoji)}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": apiKey
            }
        });

        const json = await res.json();

        // sukses
        if (json.success) {
            const teks = `✅ *React Berhasil Dikirim!*

🔗 *Target Channel:*
${json.link}

😄 *Emoji:*
${json.emojis.replace(/,/g, ' ')}

👤 *Request By:* ${pushname}

🚀 *Powered by ${botname}*`;

            await hydro.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

            return replyhydro(teks);
        }

        // gagal dari API
        const errMsg = json.details?.message || json.error || 'Unknown error';

        await hydro.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });

        replyhydro(`❌ *Gagal Mengirim React!*\n\n📝 *Pesan:* ${errMsg}`);

    } catch (err) {
        console.error('[REACT CHANNEL ERROR]', err);

        await hydro.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });

        replyhydro("❌ *Terjadi Kesalahan Pada Sistem*");
    }
};
