import yaml from 'js-yaml'
import path from 'path'
import removeAccents from 'remove-accents'
import slugify from 'slugify'
import { readFileAsJson, readFileAsString, writeToFile } from '../utils'
import { buildWikipediaContentFilePath } from './fetchWikipediaContents'
import {
  FoundWikipediaUrls,
  WIKIPEDIA_DATA_DIR,
  WIKIPEDIA_URLS_JSON_FILE,
} from './fetchWikipediaUrls'

const WIKIPEDIA_AFFAIRES_DIR = path.join(WIKIPEDIA_DATA_DIR, 'affaires_search')

const keywords = [
  'polemique',
  'controverse',
  'affaire',
  'illegal',
  'scandale',
  'justice',
  'soupcons',
  'accusation',
  'enquete',
  'condamn',
  'mis en examen',
  'mise en examen',
  `prise illegale`,
  `de fonds publics`,
  'ineligibilite',
  'favoritisme',
  'clientelisme',
  'premiere instance',
  'cassation',
  'corruption',
  'proces',
  'delit',
  'crime',
  'penal',
  'abus',
]
const excluded_keywords = [
  'affaires rurales',
  'affaires sociales',
  'affaires locales',
  'affaires etrangeres',
  'affaires europeennes',
  'affaires internationale',
  'affaires culturelles',
  'reconversion dans les affaires',
  'justice, garde des sceaux',
]

export async function updateWikipediaAffaires() {
  console.log(`Reading ${WIKIPEDIA_URLS_JSON_FILE}`)
  const foundWikipediaUrls = readFileAsJson(
    WIKIPEDIA_URLS_JSON_FILE,
  ) as FoundWikipediaUrls

  const results = foundWikipediaUrls
    // .slice(0, 20)
    .map(({ id_an, name, url }) => {
      const file = buildWikipediaContentFilePath({ id_an, name })
      console.log(`Reading ${file}`)
      const rawContent = readFileAsString(file)
      const corpus = cleanup(rawContent)
      const matches = keywords
        .map(kw => {
          return findMatches(corpus, kw)
        })
        .flat()
        .filter(_ => {
          return !excluded_keywords.some(excludedKw => _.includes(excludedKw))
        })
      return { id_an, name, url: `https://fr.wikipedia.org/${url}`, matches }
    })
    .filter(_ => _.matches.length > 0)
  console.log(`Got matches on ${results.length} wikipedia pages`)

  results.forEach(result => {
    const file = buildWikipediaAffairesFilePath(result)
    console.log(`Writing into ${file}`)
    writeToFile(file, yaml.dump(result))
  })
}

function cleanup(s: string) {
  return s
    .split('\n')
    .map(line => removeAccents(line))
    .map(line => line.toLocaleLowerCase('fr-FR'))
    .join(' --- ')
}

function findMatches(text: string, keyword: string) {
  let regex = new RegExp('(?:.{50})?' + keyword + '(?:.{50})?', 'g')
  return text.match(regex) || []
}

export function buildWikipediaAffairesFilePath({
  id_an,
  name,
  matches,
}: {
  id_an: string
  name: string
  matches: string[]
}) {
  return path.join(
    WIKIPEDIA_AFFAIRES_DIR,
    `${matches.length.toString().padStart(5, '0')}_${id_an}_${makeSlug(
      name,
    )}.yaml`,
  )
}

function makeSlug(s: string) {
  return slugify(s, { lower: true, strict: true, replacement: '_' })
}
