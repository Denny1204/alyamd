// playch.js
const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const fetch = require("node-fetch");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = {
    name: ["playch", "songch"],
    category: "music",
    owner: false,
    run: async (conn, m, text) => {
        const idCh = "120363422352987107@newsletter"; // Ganti ID channel kamu
        const TMP_DIR = "./Tmp";
        const MAX_BYTES = 16 * 1024 * 1024; // WA limit ~16MB

        async function tryWithRetries(fn, tries = 3, delayMs = 1000) {
            let lastErr;
            for (let i = 0; i < tries; i++) {
                try { return await fn(); }
                catch (err) { lastErr = err; await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i))); }
            }
            throw lastErr;
        }

        async function safeDownload(url) {
            const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000, maxContentLength: Infinity, maxBodyLength: Infinity });
            const buffer = Buffer.from(res.data);
            if (buffer.length > MAX_BYTES) throw new Error(`File terlalu besar (${Math.round(buffer.length/1024/1024)} MB)`);
            return buffer;
        }

        try {
            const fullText = text || m?.text || m?.body || m?.message?.conversation || m?.message?.extendedTextMessage?.text || (m.quoted ? m.quoted.text : "");
            const query = fullText.replace(/^(\.playch|playch|\.songch|songch)\s*/i, "").trim();
            if (!query) return m.reply("🎧 Masukkan judul lagu!\nContoh: *.playch jalan kenangan*");

            await m.reply("🔍 Mencari lagu...");

            const s = await yts(query);
            const v = s.videos[0];
            if (!v) return m.reply("❌ Lagu tidak ditemukan di YouTube.");

            // Ambil URL MP3
            const cmd = encodeURIComponent(`-x --audio-format mp3 ${v.url}`);
            const r = await axios.get(`https://ytdlp.online/stream?command=${cmd}`, { responseType: "stream" });

            let dl = null;
            await new Promise((res, rej) => {
                r.data.on("data", chunk => {
                    const match = chunk.toString().match(/href="([^"]+\.(mp3|m4a|webm))"/);
                    if (match) dl = `https://ytdlp.online${match[1]}`;
                });
                r.data.on("end", () => (dl ? res() : rej("Gagal ambil URL audio")));
                r.data.on("error", rej);
            });

            if (!dl) return m.reply("⚠️ Tidak bisa mengambil audio dari server.");

            if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
            const inPath = path.join(TMP_DIR, "in.mp3");
            const outPath = path.join(TMP_DIR, "out.ogg");

            const resp = await tryWithRetries(() => fetch(dl));
            fs.writeFileSync(inPath, Buffer.from(await resp.arrayBuffer()));

            await new Promise((res, rej) => {
                ffmpeg(inPath)
                    .toFormat("ogg")
                    .audioCodec("libopus")
                    .on("end", res)
                    .on("error", rej)
                    .save(outPath);
            });

            const opus = fs.readFileSync(outPath);

            await conn.sendMessage(
                idCh,
                {
                    audio: opus,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true,
                    contextInfo: {
                        externalAdReply: {
                            title: v.title,
                            body: `Creator - ${v.author.name}`,
                            thumbnailUrl: v.thumbnail,
                            sourceUrl: v.url,
                            mediaType: 1,
                            renderLargerThumbnail: true,
                        },
                    },
                },
                { quoted: m }
            );

            fs.unlinkSync(inPath);
            fs.unlinkSync(outPath);

            await m.reply(`✅ *${v.title}* berhasil dikirim ke channel 🎶`);

        } catch (e) {
            console.error("PLAYCH HANDLER ERROR:", e);
            await m.reply("❌ Terjadi kesalahan, coba lagi nanti.");
        }
    }
};
