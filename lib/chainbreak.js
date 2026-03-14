const axios = require('axios');
const FormData = require('form-data');

module.exports = async (m, hydro, prefix, command, isPrem) => {
    try {
        // Map semua versi figure ke konfigurasi
        const config = {
            tofigure: {
                api: "https://api-faa.my.id/faa/tofigura",
                loading: "⏳ Alya sedang membuat versi figure...",
                caption: "✨ *Done bujank!*",
                premium: false
            },
            tofigur: { same: "tofigure" },
            jadifigure: { same: "tofigure" },
            jadifigur: { same: "tofigure" },

            tofigure2: {
                api: "https://api-faa.my.id/faa/tofigurav2",
                loading: "⏳ Alya sedang membuat versi figure ke 2...",
                caption: "✨ *Done yaa!*",
                premium: true
            },
            tofigur2: { same: "tofigure2" },
            jadifigure2: { same: "tofigure2" },
            jadifigur2: { same: "tofigure2" },

            tofigure3: {
                api: "https://api-faa.my.id/faa/tofigurav3",
                loading: "⏳ Alya sedang membuat versi figure ke 3...",
                caption: "✨ *Done versi 3 yaa!*",
                premium: true
            },
            tofigur3: { same: "tofigure3" },
            jadifigure3: { same: "tofigure3" },
            jadifigur3: { same: "tofigure3" },

            tofigure4: {
                api: "https://api.elrayyxml.web.id/api/ephoto/figurev2",
                loading: "⏳ Alya sedang membuat versi figure ke 4...",
                caption: "✨ *Done bujank!*",
                premium: true
            },
            tofigur4: { same: "tofigure4" },
            jadifigure4: { same: "tofigure4" },
            jadifigur4: { same: "tofigure4" },
        };

        // Ambil config utama (tangani alias)
        let cfg = config[command];
        if (cfg.same) cfg = config[cfg.same];

        if (cfg.premium && !isPrem) 
            return m.reply("❌ Fitur ini khusus *Premium User*.");

        if (!m.quoted) 
            return m.reply(`Kirim/reply gambar dengan caption *${prefix + command}*`);

        let mime = m.quoted.mimetype || "";
        if (!/image\/(jpe?g|png)/.test(mime))
            return m.reply(`Format *${mime}* tidak didukung. Kirim gambar jpg/png.`);

        // Loading message
        m.reply(cfg.loading);

        let imgBuffer = await m.quoted.download();

        const form = new FormData();
        form.append("file", imgBuffer, {
            filename: "foto.jpg",
            contentType: mime
        });

        let upload = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
            headers: form.getHeaders()
        });

        let fileUrl = upload.data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

        // Generate final API request
        let apiUrl = `${cfg.api}?url=${encodeURIComponent(fileUrl)}`;

        let hasil = await axios.get(apiUrl, { responseType: "arraybuffer" });

        await hydro.sendMessage(m.chat, {
            image: hasil.data,
            caption: cfg.caption
        }, { quoted: m });

    } catch (err) {
        console.log(err);
        m.reply("❌ Terjadi kesalahan saat memproses gambar.");
    }
};
