const axios = require('axios')

async function dramaboxsearch(q){
  try{
    const r = await axios.get(
      `https://www.dramabox.com/search?searchValue=${encodeURIComponent(q)}`
    )

    const json = JSON.parse(
      r.data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]
    )

    const list = json.props.pageProps.bookList || []

    return {
      query: q,
      total: list.length,
      results: list.map(v => ({
        id: v.bookId,
        title: v.bookName,
        episodes: v.totalChapterNum,
        description: v.introduction,
        cover: v.coverCutWap || v.coverWap,
        play_url: `https://www.dramabox.com/video/${v.bookId}_${v.bookNameEn}/${v.chapterId}_Episode-1`
      }))
    }
  }catch(e){
    return { status:'error', msg: e.message }
  }
}

async function dramaboxdetail(url){
  try{
    const r = await axios.get(url)
    const html = r.data

    const j = JSON.parse(
      html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]
    )

    const info = j.props.pageProps.bookInfo || j.props.pageProps.book || {}

    const totalEpisodes =
      Number(
        html.match(/Episodes<\/span><span[^>]*>\([\s\S]*?(\d+)/)?.[1]
      ) || info.chapterCount || 0

    return {
      id: info.bookId,
      title: info.bookName,
      description: info.introduction,
      totalEpisodes,
      thumbnail: info.cover ? info.cover.split('@')[0] : null,
      tags: info.typeTwoNames || info.tags || [],
      labels: info.labels || [],
      language: info.language || info.simpleLanguage || null,
      viewCount: info.viewCount,
      followCount: info.followCount,
      baseUrl: url
    }
  }catch(e){
    return { status:'error', msg:e.message }
  }
}

module.exports = {
  dramaboxsearch,
  dramaboxdetail
}
