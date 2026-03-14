const axios = require("axios");
const FormData = require("form-data");

module.exports = async (m, hydro, prefix, command, isPrem) => {
    try {
        const config = {
            // ========== CHIBI ==========
            tochibi: {
                api: "https://api-faa.my.id/faa/tochibi",
                loading: "⏳ Alya sedang membuat versi Chibi...",
                caption: "✨ *Done bujank!*",
                premium: true
            },
            chibi: { same: "tochibi" },
            jadichibi: { same: "tochibi" },
            chibifigure: { same: "tochibi" },

            // ========== MAID ==========
            tomaid: {
                api: "https://api-faa.my.id/faa/tomaid",
                loading: "⏳ Alya sedang membuat versi Maid...",
                caption: "✨ *Done bujank!*",
                premium: false
            },
            tomatdrip: { same: "tomaid" },
            jadimaid: { same: "tomaid" },
            babu: { same: "tomaid" },

            // ========== BOTAK ==========
            tobotak: {
                api: "https://api-faa.my.id/faa/tobotak",
                loading: "⏳ Alya sedang membotakkan fotomu...",
                caption: "😂 *Alya berhasil ngebotakin!*",
                premium: false
            },
            botak: { same: "tobotak" },

            // ========== HITAM ==========
            tohitam: {
                api: "https://api-faa.my.id/faa/tohitam",
                loading: "⏳ Alya Sedang Menghitamkan fotomu...",
                caption: "✨ *Done Bujank*",
                premium: false
            },
            jadihitam: { same: "tohitam" },
            hitamkan: { same: "tohitam" },

            // ========== HIJAB ==========
            tohijab: {
                api: "https://api-faa.my.id/faa/tohijab",
                loading: "⏳ Alya sedang membuat versi berhijab...",
                caption: "✨ *Done :3*",
                premium: false
            },
            jadihijab: { same: "tohijab" },
            hijab: { same: "tohijab" }
        };

        // Ambil set utama (handle alias)
        let cfg = config[command];
        if (cfg.same) cfg = config[cfg.same];

        if (!cfg)
            return m.reply(`Command *${command}* belum diatur di handler photoedit.`);

        if (cfg.premium && !isPrem)
            return m.reply("❌ Fitur ini khusus *Premium User*.");

        // HARUS ada reply gambar
        if (!m.quoted)
            return m.reply(`Kirim/reply gambar dengan caption *${prefix + command}*`);

        let mime = m.quoted.mimetype || "";
        if (!/image\/(jpe?g|png)/.test(mime))
            return m.reply(`Format *${mime}* tidak didukung! Harus jpg/png.`);

        // React loading
        await hydro.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        // Download gambar
        let imgBuffer = await m.quoted.download();

        const form = new FormData();
        form.append("file", imgBuffer, {
            filename: "foto.jpg",
            contentType: mime
        });

        // Upload ke tmpfiles
        let upload = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
            headers: form.getHeaders()
        });

        let fileUrl = upload.data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

        // Proses API
        let apiUrl = `${cfg.api}?url=${encodeURIComponent(fileUrl)}`;
        let hasil = await axios.get(apiUrl, { responseType: "arraybuffer" });

        // Kirim hasil
        await hydro.sendMessage(
            m.chat,
            { image: hasil.data, caption: cfg.caption },
            { quoted: m }
        );

    } catch (err) {
        console.log(err);
        m.reply("❌ Terjadi kesalahan saat memproses gambar.");
    }
};
