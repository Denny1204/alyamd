// lib/ektp.js
const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    uploadToCatbox: async (buffer) => {
        try {
            let form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("fileToUpload", buffer, "pasphoto.jpg");

            let upload = await axios.post(
                "https://catbox.moe/user/api.php",
                form,
                { headers: form.getHeaders() }
            );

            if (!upload.data || !upload.data.includes("https://")) {
                return { success: false, url: null, error: upload.data };
            }

            return { success: true, url: upload.data.trim() };
        } catch (e) {
            return { success: false, url: null, error: e.message };
        }
    },

    generateEKTP: async (params) => {
        try {
            const api = "https://zelapioffciall.koyeb.app/canvas/ektp";

            const url =
                api +
                "?" +
                Object.entries(params)
                    .map(([a, b]) => `${encodeURIComponent(a)}=${encodeURIComponent(b)}`)
                    .join("&");

            let result = await axios.get(url, { responseType: "arraybuffer" });

            if (!/image/.test(result.headers["content-type"])) {
                return { success: false, buffer: null, error: result.data.toString() };
            }

            return { success: true, buffer: Buffer.from(result.data) };
        } catch (e) {
            return { success: false, buffer: null, error: e.message };
        }
    }
};
