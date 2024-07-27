import * as lo from 'lodash'
import { ActeurJson } from './anopendata/readFromAnOpenData'
import { forceArray } from './utils'

export function tmpTool() {
  console.log('--- tmpTool')
  // TODO use this to merge
  mergeTwoVersionsOfActeurs(null as any, null as any)
}

function mergeTwoVersionsOfActeurs(
  amo30Version: ActeurJson,
  amo10Version: ActeurJson,
) {
  let res: ActeurJson = {
    ...amo10Version,
    // AMO10 seems to have uri HATVP, not amo30
    uri_hatvp: amo10Version.uri_hatvp ?? amo30Version.uri_hatvp,
    etatCivil: {
      ...amo10Version.etatCivil,
      // there's slight differences sometimes
      // let's just keep AMO10
      ident: amo10Version.etatCivil.ident ?? amo30Version.etatCivil.ident,
      // idem
      infoNaissance:
        amo10Version.etatCivil.infoNaissance ??
        amo30Version.etatCivil.infoNaissance,
    },
    profession: {
      ...amo10Version.profession,
      libelleCourant:
        amo10Version.profession.libelleCourant ??
        amo30Version.profession.libelleCourant,
      socProcINSEE: {
        catSocPro:
          amo10Version.profession.socProcINSEE.catSocPro ??
          amo30Version.profession.socProcINSEE.catSocPro,
        famSocPro:
          amo10Version.profession.socProcINSEE.famSocPro ??
          amo30Version.profession.socProcINSEE.famSocPro,
      },
    },
    // For adresses, there's numerous modifications/additions/deletions
    // Let's just keep the latest from AMO10, it should be fine
    adresses: amo10Version.adresses,
    // For mandats, we have to use both versions
    // because some mandats are only in AMO10 or AMO30
    // There's some duplicates, but they have same uid and same everything,
    // so we can just deduplicate based on the uid
    mandats: {
      mandat: lo.uniqBy(
        [
          ...forceArray(amo10Version.mandats.mandat),
          ...forceArray(amo30Version.mandats.mandat),
        ],
        _ => _.uid,
      ),
    },
  }

  return res
}
