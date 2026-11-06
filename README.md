# V A I D O R E — Vaidore.com

Prabangių alternatyvių kvepalų, namų kvapų, žvakių ir aliejinių koncentratų e-parduotuvės prototipas.
React 19 + Vite + Tailwind CSS v4 + Lucide ikonos. Visa sąsaja — lietuvių kalba, pirmiausia pritaikyta mobiliesiems.

## Paleidimas kompiuteryje

Reikia Node.js 20.19 arba naujesnės versijos.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # paruošia dist/ aplanką
npm run preview   # peržiūrėti build rezultatą
```

## Įkėlimas į GitHub ir paskelbimas

```bash
git init
git add .
git commit -m "Vaidore e-parduotuvė"
git branch -M main
git remote add origin https://github.com/<vartotojas>/vaidore.git
git push -u origin main
```

Tada GitHub repozitorijoje: **Settings → Pages → Source: GitHub Actions**.
Kiekvienas `push` į `main` šaką automatiškai sukompiliuoja ir paskelbia svetainę
(`.github/workflows/deploy.yml`) adresu `https://<vartotojas>.github.io/vaidore/`.

Po pirmo `npm install` rekomenduojama į repozitoriją įkelti ir `package-lock.json`.

Projektas veikia ir Vercel ar Netlify (build komanda `npm run build`, aplankas `dist`).
Nuosavą domeną Vaidore.com galite prijungti per Settings → Pages → Custom domain.

## Struktūra

```
src/
  App.jsx                 maršrutizavimas, globali būsena (katalogas, krepšelis, užsakymai)
  data/                   produktai, kategorijos, atsiliepimai, analitika, nuotraukos
  lib/                    kainų, PVM, pristatymo skaičiavimai ir formatavimas
  hooks/                  localStorage būsena, hash maršrutai, atgalinis laikmatis, animacijos
  components/
    layout/               bėganti eilutė, antraštė, iOS apatinė navigacija, poraštė
    product/              prekės kortelė, prekės langas, kvapo piramidė, atsiliepimai
    cart/                 krepšelio stalčius, nemokamo pristatymo juosta, upsell blokas
    checkout/             Stripe stiliaus akordeono žingsniai, užsakymo santrauka
    admin/                KPI, apyvartos diagrama, prekės forma, atsargų registras
    ui/                   bendri elementai (laukai, mygtukai, žvaigždutės ir kt.)
  views/                  Atrasti, Parduotuvė, Apie mus, Atsiskaitymas, Ačiū, Admin panelė
```

Maršrutai naudoja `#` (pvz., `/#/parduotuve`), todėl GitHub Pages nereikia jokių serverio nustatymų.
Admin panelėje pridėtos prekės, krepšelis ir užsakymai išsaugomi naršyklės `localStorage`.
Mygtukas „Atkurti demo duomenis“ grąžina pradinę būseną.

## Prieš paleidžiant gyvai

- **Mokėjimai** yra simuliuoti. Prijunkite tikrą Stripe Checkout arba Payment Element per serverį
  (pvz., Vercel funkciją) — kortelių duomenų niekada nerinkite patys.
- **Admin panelė** neturi prisijungimo ir duomenų bazės — tai demonstracija. Gyvai parduotuvei reikia
  backend'o (pvz., Supabase) ir autentifikacijos.
- **Atsiliepimai ir analitika** — demonstraciniai. ES Omnibus direktyva draudžia netikrus atsiliepimus,
  o perbraukta „sena kaina“ turi būti mažiausia kaina per paskutines 30 dienų.
- **Prekių ženklai** (Tom Ford, YSL ir kt.) naudojami tik kvapų profiliams apibūdinti; tai nurodyta
  prekės lange ir poraštėje. Prieš paleidimą pasitarkite su teisininku.
- Nuotraukos — iš Unsplash (nemokama licencija). Jei kuri neužsikrautų, rodomas prekės ženklo monogramos vaizdas.
