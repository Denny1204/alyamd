// lib/ml.js
const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
    name: ["mlhero", "hero", "mobilelegends"],
    alias: ["ml", "mlh"],
    category: "internet",

    run: async (hydro, m, args) => {
        const text = args.join(" ")

        if (!text) {
            return hydro.reply(m.chat, `Masukkan nama hero!\n\nContoh:\n.mlhero Nana`, m)
        }

        try {
            await hydro.sendMessage(m.chat, { text: "🔍 Mencari informasi hero..." }, { quoted: m })

            const result = await mlHeroes(text)

            if (result.code !== 200) {
                return hydro.reply(m.chat, result.message, m)
            }

            const hero = result.result

            let caption = `
*${hero.heroName}* (#${hero.heroNumber})

*Rilis:* ${hero.releaseDate}
*Role:* ${hero.role}
*Specialty:* ${hero.specialty}
*Lane:* ${hero.lane}

*Harga:*
• BP: ${hero.price.battlePoints}
• Diamond: ${hero.price.diamonds}

*Attrib:*
• Resource: ${hero.skillResource}
• Damage: ${hero.damageType}
• Attack: ${hero.attackType}

*Rating:*
• Durability: ${hero.ratings.durability}
• Offense: ${hero.ratings.offense}
• Control: ${hero.ratings.controlEffects}
• Difficulty: ${hero.ratings.difficulty}
`.trim()

            if (hero.image) {
                return hydro.sendMessage(m.chat, {
                    image: { url: hero.image },
                    caption
                }, { quoted: m })
            } else {
                return hydro.reply(m.chat, caption, m)
            }

        } catch (err) {
            console.error(err)
            return hydro.reply(m.chat, "❌ Terjadi error, coba lagi nanti.", m)
        }
    }
}

/* ==============================
   CORE SCRAPER — JANGAN DIUBAH
============================== */

async function mlHeroes(hero) {
    try {
        const url = `https://mobile-legends.fandom.com/wiki/${encodeURIComponent(hero)}`
        const { data } = await axios.get(url)
        const $ = cheerio.load(data)

        const releaseDate = $('[data-source="release_date"] .pi-data-value').text().trim()
        const role = $('[data-source="role"] .pi-data-value a').text().trim()
        const specialty = $('[data-source="specialty"] .pi-data-value').text().trim()
        const lane = $('[data-source="lane"] .pi-data-value a').text().trim()

        const priceBP = $('[data-source="price"] .pi-data-value span').first().text().trim()
        const priceDiamond = $('[data-source="price"] .pi-data-value span').last().text().trim()

        const skillResource = $('[data-source="resource"] .pi-data-value a').text().trim()
        const damageType = $('[data-source="dmg_type"] .pi-data-value a').text().trim()
        const attackType = $('[data-source="atk_type"] .pi-data-value a').text().trim()

        const durability = $('[data-source="durability"] .bar').text().trim()
        const offense = $('[data-source="offense"] .bar').text().trim()
        const controlEffects = $('[data-source="control effect"] .bar').text().trim()
        const difficulty = $('[data-source="difficulty"] .bar').text().trim()

        const heroNumber = $('[data-source="current_hero"]').text().trim().replace(/No\.\s*/, '')
        const heroName = $('[data-source="current_hero"] b').text().trim()
        const finalHeroName = heroName || $('.pi-title').first().text().trim()

        const image = $('.pi-item.pi-image a img').attr('src')

        if (!finalHeroName) {
            return {
                code: 404,
                message: `❌ Hero "${hero}" tidak ditemukan!`
            }
        }

        return {
            code: 200,
            result: {
                heroName: finalHeroName,
                heroNumber,
                releaseDate,
                role,
                specialty,
                lane,
                price: {
                    battlePoints: priceBP || 'N/A',
                    diamonds: priceDiamond || 'N/A'
                },
                skillResource: skillResource || 'N/A',
                damageType: damageType || 'N/A',
                attackType: attackType || 'N/A',
                ratings: {
                    durability: durability || 'N/A',
                    offense: offense || 'N/A',
                    controlEffects: controlEffects || 'N/A',
                    difficulty: difficulty || 'N/A'
                },
                image
            }
        }
    } catch (err) {
        return {
            code: 500,
            message: "⚠️ Error mengambil data hero."
        }
    }
}
