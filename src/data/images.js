// Patikrinti Unsplash nuotraukų ID (nemokama Unsplash licencija).
// Jei nuotrauka kada nors nepasikrautų, <SmartImage /> automatiškai parodys
// prekės ženklo monogramą, todėl sulūžusių vaizdų vartotojas nepamatys.

export const PHOTO = {
  perfumeClearBlackCap: 'photo-1760920250029-36af9369a0bb',
  perfumeReflections: 'photo-1615634260167-c8cdede054de',
  perfumeGrey: 'photo-1634944119598-837431c4900a',
  perfumeTable: 'photo-1709662369900-130507781728',
  perfumePlant: 'photo-1720967361123-9c17ec9025dc',
  perfumeBlackGold: 'photo-1584841247175-4d766cefa018',
  candleVase: 'photo-1712148272589-b1e99437a7a0',
  candlesWhiteOnBlack: 'photo-1624479163091-3c000402218d',
  candleDark: 'photo-1643482013409-a371987f9fbd',
  diffuserReedsBlack: 'photo-1746947029656-39f8d8d54607',
  diffuserSpa: 'photo-1620733723572-11c53f73a416',
  diffuserTray: 'photo-1750429431308-96eb0e8b6f6f',
  diffuserInterior: 'photo-1617351167197-1a8715231753',
  oilDropperWood: 'photo-1581514439794-f9777f7c22eb',
  oilDropperGold: 'photo-1608571424634-58ae03e6edcf',
}

export function unsplash(photoId, width = 1000) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`
}

// Galerija administratoriaus formai (greitas nuotraukos parinkimas)
export const IMAGE_GALLERY = [
  { id: PHOTO.perfumeClearBlackCap, label: 'Skaidrus flakonas' },
  { id: PHOTO.perfumeReflections, label: 'Šviesos atspindžiai' },
  { id: PHOTO.perfumeGrey, label: 'Pilka studija' },
  { id: PHOTO.perfumeTable, label: 'Flakonas ant stalo' },
  { id: PHOTO.perfumePlant, label: 'Flakonas ir augalas' },
  { id: PHOTO.perfumeBlackGold, label: 'Juoda ir auksas' },
  { id: PHOTO.diffuserSpa, label: 'Difuzorius SPA' },
  { id: PHOTO.diffuserReedsBlack, label: 'Lazdelės juodame fone' },
  { id: PHOTO.diffuserTray, label: 'Difuzorius ant padėklo' },
  { id: PHOTO.diffuserInterior, label: 'Interjeras' },
  { id: PHOTO.candleVase, label: 'Žvakė ir vaza' },
  { id: PHOTO.candlesWhiteOnBlack, label: 'Baltos žvakės' },
  { id: PHOTO.candleDark, label: 'Žvakė tamsoje' },
  { id: PHOTO.oilDropperWood, label: 'Aliejus ir lašintuvas' },
  { id: PHOTO.oilDropperGold, label: 'Auksinis lašintuvas' },
].map((item) => ({ ...item, url: unsplash(item.id, 1000) }))
