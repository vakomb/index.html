# VAIDORE – Premium kvepalų el. parduotuvė

React + Tailwind CSS + Lucide React parduotuvė prekės ženklui **VAIDORE** (Vaidore.com). Dizainas paremtas Shopify Dawn principais: mobile-first, aiški tipografija, žalia `#2E6F40` akcentų spalva.

## Greitas paleidimas

```bash
npm install
npm start        # http://localhost:3000
npm run build    # produkcinė versija į /build
```

Reikalinga Node.js 18+.

## Funkcionalumas

| Modulis | Aprašymas |
| --- | --- |
| `AnnouncementBar` | Automatiškai besisukanti pranešimų juosta (pauzė užvedus pelę) |
| `Header` | Lipni navigacija, centruotas `VAIDORE` ženklas, paieška, mobilus meniu, krepšelio skaitiklis |
| `Hero` | Distributorių programos baneris su el. pašto registracija |
| `Categories` | Kategorijų kortelės – akimirksniu filtruoja parduotuvę |
| `ProductGrid` | Kolekcijų sekcijos su žaliomis antraštėmis, paieškos ir kategorijų rezultatai |
| `ProductDetailModal` | Prekės langas: tūrio pasirinkimas, trūkumo indikatorius, akordeonai (Kam skirti / Natos / Ingridientai), kiekis |
| `CartDrawer` | Krepšelis su nemokamo pristatymo juosta, aliejaus upsell jungikliu, PVM skaičiavimu ir 3 žingsnių atsiskaitymu |
| `AdminPanel` | Pardavimų metrikos, 7 d. grafikas, užsakymai, pilnas produktų CRUD su likučių valdymu |

Valdymo panelė pasiekiama per profilio ikoną arba adresu `/#/admin`.

## Duomenys

- Pradiniai produktai ir pagalbinės funkcijos: `src/data/catalog.js`.
- Produktai, užsakymai ir krepšelis saugomi naršyklės `localStorage` (mygtukas „Atkurti“ valdymo panelėje grąžina pradinius duomenis).
- Nuotraukos – Unsplash nuorodos. Jei nuotrauka neįsikelia, automatiškai rodomas stilizuotas VAIDORE buteliukas.

## Prieš paleidžiant į gamybą

Ši versija yra pilnai veikianti **front-end** parduotuvė. Prieš priimant tikrus užsakymus:

1. **Mokėjimai.** Atsiskaitymo forma yra demonstracinė (validuoja kortelę pagal Luhn algoritmą, bet nieko neapmokestina). Prijunkite [Stripe Checkout](https://stripe.com/docs/payments/checkout) arba Stripe Elements per savo serverį – niekada nesiųskite kortelės duomenų tiesiai į savo backend.
2. **Valdymo panelė.** Šiuo metu neapsaugota slaptažodžiu ir duomenys saugomi tik naršyklėje. Reikia autentifikacijos ir duomenų bazės (pvz. Supabase, Firebase ar Shopify Storefront API).
3. **Nuotraukos.** Pakeiskite Unsplash nuotraukas savo produktų fotografijomis (`IMAGES` objektas `catalog.js`).
4. **Teisinė informacija.** Pridėkite pirkimo taisykles, privatumo politiką ir slapukų sutikimą (BDAR).

## Diegimas

Projektas sukurtas su Create React App, todėl veikia Vercel, Netlify ar GitHub Pages be papildomos konfigūracijos:

- **Build komanda:** `npm run build`
- **Output katalogas:** `build`

## Technologijos

- React 18
- Tailwind CSS 3 (`tailwind.config.js` – prekės ženklo spalvos, šriftai, animacijos)
- Lucide React ikonos
- Inter + Montserrat šriftai (Google Fonts)
