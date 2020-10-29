import { UpcomingMatch } from '../models/UpcomingMatch'
import { LiveMatch } from '../models/LiveMatch'
import { Event } from '../models/Event'
import { Team } from '../models/Team'
import { popSlashSource } from '../utils/parsing'
import { HLTVConfig } from '../config'
import { fetchPage, toArray } from '../utils/mappers'

export const getMatches = (config: HLTVConfig) => async (): Promise<
  (UpcomingMatch | LiveMatch)[]
> => {
  const $ = await fetchPage(`${config.hltvUrl}/matches`, config.loadPage)

  const liveMatches: LiveMatch[] = toArray($('.liveMatch-container')).map(
    (matchEl) => {
      const id = Number(matchEl.find('.a-reset').attr('href')!.split('/')[2])
      const teamNameEls = matchEl.find('.matchTeamName')
      const stars = 5 - matchEl.find('.matchRating i.faded').length

      const team1: Team = {
        name: teamNameEls.first().text(),
        id: Number(matchEl.attr('team1')) || undefined,
        logo: teamNameEls.first().parent().find('img').attr('src')
      }

      const team2: Team = {
        name: teamNameEls.last().text(),
        id: Number(matchEl.attr('team2')) || undefined,
        logo: matchEl.find('.team2 .matchTeamLogoContainer img').attr('src')
      }

      const format = matchEl.find('.matchMeta').text()

      const event: Event = {
        name: matchEl.find('.matchEventLogo').attr('title')!,
        id:
          Number(
            popSlashSource(matchEl.find('.matchEventLogo'))!.split('.')[0]
          ) || undefined
      }

      return { id, team1, team2, event, format, stars, live: true }
    }
  )

  const upcomingMatches: UpcomingMatch[] = toArray($('.upcomingMatch')).map(
    (matchEl) => {
      const link = matchEl.find('.a-reset')
      const id = Number(link.attr('href')!.split('/')[2])
      const date =
        Number(matchEl.find('.matchTime').attr('data-unix')) || undefined
      const title = matchEl.find('.matchInfoEmpty').text() || undefined
      const stars = matchEl.find('.matchRating i:not(.faded)').length

      const format = matchEl.find('.matchMeta').text()

      let event: Event | undefined
      let team1: Team | undefined
      let team2: Team | undefined

      if (!title) {
        team1 = {
          name: matchEl.find('.team1 .matchTeamName').text(),
          id: Number(matchEl.attr('team1')) || undefined,
          logo: matchEl.find('.team1 .matchTeamLogoContainer img').attr('src')
        }

        team2 = {
          name:
            matchEl.find('.team2 .matchTeamName').text() ||
            matchEl.find('.team2 .team').text(),
          id: Number(matchEl.attr('team2')) || undefined,
          logo: matchEl.find('.team2 .matchTeamLogoContainer img').attr('src')
        }
        event = {
          name: matchEl.find('.matchEventLogo').attr('alt')!,
          id:
            Number(
              popSlashSource(matchEl.find('.matchEventLogo'))!.split('.')[0]
            ) || undefined
        }
      }

      return {
        id,
        date,
        team1,
        team2,
        format,
        title,
        event,
        stars,
        live: false
      }
    }
  )

  return [...liveMatches, ...upcomingMatches]
}
