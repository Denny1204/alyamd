// upch3.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = {
    name: ["upch3", "uploadch", "sendch"],
    category: "channel",
    owner: false,

    run: async (conn, m, text) => {
        const idCh = "120363422352987107@newsletter"; // ganti ID channel kamu
        const TMP_DIR = "./Tmp";

        if (!m.quoted) 
            return m.reply("❗ Reply video/audio dengan command *upch3*");

        let mime = m.quoted.mimetype || "";
        if (!mime) return m.reply("❌ Tidak ada mimetype, pastikan reply media!");

        await m.reply("⏳ Sedang memproses media...");

        if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

        try {
            let mediaBuffer = await m.quoted.download();
            let input = path.join(TMP_DIR, "input");
            let output = "";

            fs.writeFileSync(input, mediaBuffer);

            // =============================
            // 1️⃣ JIKA AUDIO → Kirim sebagai PTT (OPUS)
            // =============================
            if (/audio/.test(mime)) {
                output = path.join(TMP_DIR, "audio.ogg");

                await new Promise((resolve, reject) => {
                    ffmpeg(input)
                        .audioCodec("libopus")
                        .toFormat("ogg")
                        .on("end", resolve)
                        .on("error", reject)
                        .save(output);
                });

                const audio = fs.readFileSync(output);

                await conn.sendMessage(
                    idCh,
                    {
                        audio: audio,
                        ptt: true,
                        mimetype: "audio/ogg; codecs=opus",
                        contextInfo: {
                            externalAdReply: {
                                title: "Audio from User",
                                body: "Uploaded to Channel",
                                mediaType: 1
                            }
                        }
                    },
                    { quoted: m }
                );

                fs.unlinkSync(input);
                fs.unlinkSync(output);

                return m.reply("✅ Audio berhasil dikirim ke Channel!");
            }

            // =============================
            // 2️⃣ JIKA VIDEO → Kirim video ke Channel
            // =============================
            if (/video/.test(mime)) {
                output = path.join(TMP_DIR, "video.mp4");

                // Convert agar semua format jadi MP4 aman
                await new Promise((resolve, reject) => {
                    ffmpeg(input)
                        .videoCodec("libx264")
                        .audioCodec("aac")
                        .format("mp4")
                        .on("end", resolve)
                        .on("error", reject)
                        .save(output);
                });

                const video = fs.readFileSync(output);

                await conn.sendMessage(
                    idCh,
                    {
                        video: video,
                        mimetype: "video/mp4",
                        caption: "🎬 Video dari user",
                        contextInfo: {
                            externalAdReply: {
                                title: "Video Uploaded",
                                body: "Video dikirim ke Channel",
                                mediaType: 1
                            }
                        }
                    },
                    { quoted: m }
                );

                fs.unlinkSync(input);
                fs.unlinkSync(output);

                return m.reply("✅ Video berhasil dikirim ke Channel!");
            }

            // =============================
            // 3️⃣ FORMAT TIDAK DIDUKUNG
            // =============================
            return m.reply("❌ Format tidak didukung. Hanya audio/video.");

        } catch (err) {
            console.error("upch3 ERROR:", err);
            m.reply("❌ Gagal memproses media. Coba ulangi.");
        }
    }
};
