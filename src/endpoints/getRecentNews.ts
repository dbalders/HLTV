import { News } from '../models/News'
// import { NewsCategory } from '../enums/NewsCategory'
import { HLTVConfig } from '../config'
import { fetchPage, toArray } from '../utils/mappers'

export const getRecentNews = (config: HLTVConfig) => async (): Promise<
  News[]
> => {

  const $ = await fetchPage(`${config.hltvUrl}`, config.loadPage)

  const news = toArray($('.article')).map((threadEl) => {
    const title = threadEl.find('.newstext').text()
    const link = threadEl.attr('href')!
    const date = threadEl.find('.newsrecent').text()!

    return { title, link, date}
  })

  return news
}
