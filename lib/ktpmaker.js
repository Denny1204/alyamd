const axios = require('axios');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

/**
 * Setup fonts untuk KTP generator
 */
async function setupFonts() {
    const [a, b, c] = await Promise.all([
        axios.get('https://api.nekolabs.web.id/f/arrial.ttf', { responseType: 'arraybuffer' }),
        axios.get('https://api.nekolabs.web.id/f/ocr.ttf', { responseType: 'arraybuffer' }),
        axios.get('https://api.nekolabs.web.id/f/sign.otf', { responseType: 'arraybuffer' })
    ]);

    GlobalFonts.register(Buffer.from(a.data), 'ArrialKTP');
    GlobalFonts.register(Buffer.from(b.data), 'OcrKTP');
    GlobalFonts.register(Buffer.from(c.data), 'SignKTP');
}

/**
 * Generate KTP image
 * @param {Object} v - data KTP
 * @param {Buffer|String} img - URL atau buffer foto
 * @returns {Buffer} - Buffer image PNG
 */
async function ktpgen(v, img) {
    await setupFonts();

    const canvas = createCanvas(720, 463);
    const ctx = canvas.getContext('2d');

    const [template, photo] = await Promise.all([
        loadImage('https://api.nekolabs.web.id/f/template.png'),
        typeof img === 'string' ? loadImage(img) : loadImage(img)
    ]);

    ctx.drawImage(template, 0, 0, 720, 463);

    const PHOTO_X = 520, PHOTO_Y = 80, PHOTO_W = 200, PHOTO_H = 280;
    const frame = PHOTO_W / PHOTO_H;
    const imgf = photo.width / photo.height;
    let sx, sy, sw, sh;

    if (imgf > frame) {
        sh = photo.height;
        sw = sh * frame;
        sx = (photo.width - sw) / 2;
        sy = 0;
    } else {
        sw = photo.width;
        sh = sw / frame;
        sx = 0;
        sy = (photo.height - sh) / 2;
    }

    const scale = Math.min(PHOTO_W / sw, PHOTO_H / sh) * 0.78;
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = PHOTO_X + (PHOTO_W - dw) / 2 - 15;
    const dy = PHOTO_Y + (PHOTO_H - dh) / 2;

    ctx.drawImage(photo, sx, sy, sw, sh, dx, dy, dw, dh);

    const L = (x, y, t, f, s) => {
        ctx.font = s + 'px ' + f;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000';
        ctx.fillText(t, x, y);
    };

    const C = (x, y, t, f, s) => {
        ctx.font = s + 'px ' + f;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(t, x, y);
    };

    const up = s => s.toUpperCase();

    C(380, 45, 'PROVINSI ' + up(v.prov), 'ArrialKTP', 25);
    C(380, 70, 'KOTA ' + up(v.kota), 'ArrialKTP', 25);
    ctx.font = '32px OcrKTP'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(v.nik, 170, 105);

    L(190, 145, up(v.nama), 'ArrialKTP', 16);
    L(190, 168, up(v.ttl), 'ArrialKTP', 16);
    L(190, 191, up(v.jk), 'ArrialKTP', 16);
    L(463, 190, up(v.goldar), 'ArrialKTP', 16);
    L(190, 212, up(v.alamat), 'ArrialKTP', 16);
    L(190, 234, up(v.rtrw), 'ArrialKTP', 16);
    L(190, 257, up(v.keldesa), 'ArrialKTP', 16);
    L(190, 279, up(v.kec), 'ArrialKTP', 16);
    L(190, 300, up(v.agama), 'ArrialKTP', 16);
    L(190, 323, up(v.status), 'ArrialKTP', 16);
    L(190, 346, up(v.kerja), 'ArrialKTP', 16);
    L(190, 369, up(v.wn), 'ArrialKTP', 16);
    L(190, 390, up(v.masa), 'ArrialKTP', 16);
    L(553, 345, 'KOTA ' + up(v.kota), 'ArrialKTP', 12);
    L(570, 365, v.terbuat, 'ArrialKTP', 12);

    ctx.font = '40px SignKTP';
    ctx.fillText((v.nama.split(' ')[0] || v.nama), 540, 395);

    return canvas.toBuffer('image/png');
}

module.exports = { ktpgen };
