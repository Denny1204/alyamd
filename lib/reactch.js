const fetch = require('node-fetch');

async function reactChannel(link, emojiList = [], apiKey = " ") {
    try {
        const emoji = emojiList.join(",");

        const url = `https://react.whyux-xec.my.id/api/rch?link=${encodeURIComponent(link)}&emoji=${encodeURIComponent(emoji)}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": apiKey
            }
        });

        if (!res.ok) throw new Error("Gagal menghubungi API!");

        const json = await res.json();
        return json;

    } catch (err) {
        return {
            status: false,
            message: err.message
        };
    }
}

module.exports = { reactChannel };
