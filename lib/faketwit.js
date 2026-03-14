// lib/faketwit.js

const axios = require('axios');
const FormData = require('form-data');

module.exports = async function fakeTwitHandler(m, hydro, args, replyhydro) {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    let argsText = args.join(' ');

    // format check
    if (!argsText.includes('|')) {
        return replyhydro(
`✨ *Fake Tweet*\n\n` +
`📌 Cara pakai:\n` +
`1. Reply gambar / kirim gambar (opsional)\n` +
`2. Format:\n` +
`faketwit displayName|username|comment|verified|date|likes|retweets|comments|bookmarks|views|theme\n\n` +
`Contoh:\n` +
`faketwit Ryuusuke_ID|Ryuusuke|Aku admin kau kacung|true|2025-11-30|123|45|67|8|900|light`
        );
    }

    let [
        displayName, username, comment,
        verified, date,
        likes, retweets, comments, bookmarks, views, theme
    ] = argsText.split('|').map(s => s.trim());

    // default values
    displayName = displayName || 'Anonymous';
    username = username || 'anonymous';
    comment = comment || '-';
    verified = verified ? verified.toLowerCase() === 'true' : true;
    date = date || new Date().toISOString().split('T')[0];
    likes = likes || 0;
    retweets = retweets || 0;
    comments = comments || 0;
    bookmarks = bookmarks || 0;
    views = views || 0;
    theme = theme || 'light';

    replyhydro('⏳ Sedang membuat Fake Tweet...');

    try {
        let avatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/8d/President_Barack_Obama.jpg';

        // kalau user kirim foto
        if (mime.startsWith('image/')) {
            const mediaBuffer = await q.download();

            if (mediaBuffer) {
                let form = new FormData();
                form.append('reqtype', 'fileupload');
                form.append('fileToUpload', mediaBuffer, { filename: 'avatar.jpg' });

                let upload = await axios.post(
                    'https://catbox.moe/user/api.php',
                    form,
                    { headers: form.getHeaders() }
                );

                avatarUrl = upload.data;
            }
        }

        const apiKey = 'freeApikey';

        const apiUrl = `https://anabot.my.id/api/maker/twitter?displayName=${encodeURIComponent(displayName)}&username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatarUrl)}&comment=${encodeURIComponent(comment)}&verified=${verified}&date=${encodeURIComponent(date)}&likes=${likes}&retweets=${retweets}&comments=${comments}&bookmarks=${bookmarks}&views=${views}&theme=${encodeURIComponent(theme)}&apikey=${apiKey}`;

        // get result image
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const img = res.data;

        await hydro.sendMessage(
            m.chat,
            {
                image: img,
                caption:
`✅ *Fake Tweet berhasil dibuat!*

• Display Name: ${displayName}
• Username: ${username}
• Comment: ${comment}
• Verified: ${verified}
• Date: ${date}
• Likes: ${likes}
• Retweets: ${retweets}
• Comments: ${comments}
• Bookmarks: ${bookmarks}
• Views: ${views}
• Theme: ${theme}`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        replyhydro('❌ Terjadi kesalahan: ' + err.message);
    }
};
