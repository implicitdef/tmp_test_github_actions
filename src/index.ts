import { fetchAnOpenData } from './anopendata/fetchAnOpenData'
import { fetchElectionsPartiellesFromMinistere } from './electionsPartiellesFromMinistereInterieur'
import { fetchElectionsPartiellesFromWikipedia } from './electionsPartiellesFromWikipedia'
import { fetchPhotos } from './fetchPhotos'
import {
  LegislatureArg,
  nosdeputesFetchBasicData,
  nosdeputesFetchWeeklyStats,
} from './nosdeputesFetch'
import { fetchWikipediaParagraphs } from './wikipedia/fetchWikipediaParagraphs'
import { fetchWikipediaUrls } from './wikipedia/fetchWikipediaUrls'

type Command =
  | 'update_an_open_data'
  | 'update_nosdeputes_basic_data'
  | 'update_nosdeputes_weekly_stats'
  | 'fetch_photos'
  | 'update_wikipedia_urls'
  | 'update_wikipedia_paragraphs'
  | 'update_wikipedia_affaires'
  | 'update_elections_partielles'

const MINISTERE_INTERIEUR_ENABLED = false

async function start() {
  console.log('Running script with arguments', process.argv.slice(2))
  switch (readCommandArgument()) {
    case 'update_an_open_data':
      await fetchAnOpenData()
      break
    case 'update_nosdeputes_basic_data':
      await nosdeputesFetchBasicData(readLegislatureArgument())
      break
    case 'update_nosdeputes_weekly_stats':
      await nosdeputesFetchWeeklyStats(readLegislatureArgument())
      break
    case 'fetch_photos':
      await fetchPhotos(readLegislatureArgument())
      break
    case 'update_wikipedia_urls':
      await fetchWikipediaUrls()
      break
    case 'update_wikipedia_paragraphs':
      await fetchWikipediaParagraphs()
      break
    case 'update_wikipedia_affaires':
      // unused for now, needs lot of rework
      // await updateWikipediaAffaires()
      throw new Error('not implemented')
      break
    case 'update_elections_partielles':
      // on scanne deux sources différentes
      // il y a des différences qu'il faudra analyser
      // voir peut-être aussi si on peut trouver les infos dans le journal officiel ?
      await fetchElectionsPartiellesFromWikipedia()
      if (MINISTERE_INTERIEUR_ENABLED) {
        // le site du ministere de l'intérieur répond avec un redirect infini quand on tape de Github actions
        // Pas de contournement trouvé
        // Mais de toute façon on utilisera probablement uniquement wikipedia
        await fetchElectionsPartiellesFromMinistere()
      }
      break
  }
}

function readLegislatureArgument(): LegislatureArg {
  const args = process.argv.slice(2)
  if (args.includes('--latestLegislatureOnly')) {
    return 'only_latest'
  }
  return 'all'
}

function readCommandArgument(): Command {
  const args = process.argv.slice(2)
  if (args.includes('update_an_open_data')) {
    return 'update_an_open_data'
  }
  if (args.includes('update_nosdeputes_basic_data')) {
    return 'update_nosdeputes_basic_data'
  }
  if (args.includes('update_nosdeputes_weekly_stats')) {
    return 'update_nosdeputes_weekly_stats'
  }
  if (args.includes('fetch_photos')) {
    return 'fetch_photos'
  }
  if (args.includes('update_wikipedia_urls')) {
    return 'update_wikipedia_urls'
  }
  if (args.includes('update_wikipedia_paragraphs')) {
    return 'update_wikipedia_paragraphs'
  }
  if (args.includes('update_elections_partielles')) {
    return 'update_elections_partielles'
  }
  if (args.includes('update_wikipedia_affaires')) {
    return 'update_wikipedia_affaires'
  }
  throw new Error('Missing or unknown command')
}

void start()
