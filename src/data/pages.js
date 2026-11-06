// Informacinių puslapių turinys. Laužtiniuose skliaustuose — duomenys,
// kuriuos būtina įrašyti prieš paleidžiant parduotuvę. Taisyklių tekstus
// prieš publikavimą rekomenduojama peržiūrėti su teisininku.

export const INFO_PAGES = {
  shipping: {
    eyebrow: 'Informacija',
    title: 'Pristatymas',
    intro: 'Užsakymus, pateiktus darbo dieną iki 14:00, išsiunčiame tą pačią dieną. Visi siuntiniai apdrausti.',
    sections: [
      {
        title: 'Pristatymo būdai ir kainos Lietuvoje',
        table: [
          ['Omniva paštomatas', '1–2 d. d.', '2,99 € · nemokamai nuo 40 €'],
          ['DPD kurjeris į namus', '1–2 d. d.', '4,49 € · nemokamai nuo 40 €'],
          ['Skubus pristatymas (Vilnius, Kaunas, Klaipėda)', 'per 24 val.', '6,99 €'],
        ],
      },
      {
        title: 'Pristatymas į kitas ES šalis',
        text: 'Siunčiame į Latviją, Estiją, Lenkiją, Suomiją ir Vokietiją. Pristatymo trukmė — 2–5 darbo dienos, kaina apskaičiuojama atsiskaitant pagal šalį.',
      },
      {
        title: 'Siuntos sekimas',
        text: 'Kai siunta bus perduota kurjeriui, el. paštu ir SMS žinute gausite sekimo nuorodą. Paštomate siuntą galėsite atsiimti per 7 dienas.',
      },
    ],
  },
  returns: {
    eyebrow: 'Informacija',
    title: 'Grąžinimas ir keitimas',
    intro: 'Norime, kad kvapas jus džiugintų. Jei taip nėra — pakeisime jį arba grąžinsime pinigus.',
    sections: [
      {
        title: 'Nemokamas kvapo keitimas per 14 dienų',
        text: 'Jei išbandytas kvapas netiko, per 14 dienų nuo prekės gavimo parašykite mums ir nemokamai atsiųsime kitą tos pačios kainos kvapą. Flakone turi būti likę ne mažiau kaip 90 % turinio.',
      },
      {
        title: 'Teisė atsisakyti sutarties',
        text: 'Per 14 dienų nuo prekės gavimo galite atsisakyti pirkimo be priežasties. Neatidarytos, nepažeistos pakuotės prekes priimame atgal ir pinigus grąžiname per 14 dienų nuo prekės gavimo mūsų sandėlyje.',
      },
      {
        title: 'Kaip grąžinti prekę',
        list: [
          'Parašykite adresu labas@vaidore.com, nurodykite užsakymo numerį.',
          'Gausite nemokamą grąžinimo Omniva kodą.',
          'Supakuokite prekę ir palikite ją bet kuriame Omniva paštomate.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Informacija',
    title: 'Pirkimo taisyklės',
    intro: 'Šios taisyklės reglamentuoja pirkimą el. parduotuvėje Vaidore.com.',
    sections: [
      {
        title: '1. Pardavėjas',
        text: 'Pardavėjas — [įmonės pavadinimas], įmonės kodas [kodas], PVM mokėtojo kodas [kodas], buveinės adresas [adresas], el. paštas labas@vaidore.com.',
      },
      {
        title: '2. Sutarties sudarymas',
        text: 'Pirkimo–pardavimo sutartis laikoma sudaryta, kai pirkėjas pateikia užsakymą, apmoka jį ir gauna užsakymo patvirtinimą el. paštu.',
      },
      {
        title: '3. Kainos ir apmokėjimas',
        text: 'Visos kainos nurodytos eurais su PVM. Akcijos metu perbraukta kaina yra mažiausia kaina, taikyta per 30 dienų iki akcijos pradžios. Atsiskaityti galima mokėjimo kortelėmis, Apple Pay, Google Pay ir el. bankininkyste.',
      },
      {
        title: '4. Prekių pristatymas',
        text: 'Prekės pristatomos pirkėjo nurodytu būdu ir adresu. Išsamiau — puslapyje „Pristatymas“.',
      },
      {
        title: '5. Prekių grąžinimas',
        text: 'Pirkėjas turi teisę atsisakyti sutarties per 14 dienų. Išsamiau — puslapyje „Grąžinimas ir keitimas“.',
      },
      {
        title: '6. Prekių ženklai',
        text: 'Svetainėje minimi kitų gamintojų prekių ženklai naudojami tik kvapų profiliams apibūdinti. Vaidore nėra susijusi su šių ženklų savininkais.',
      },
    ],
  },
  privacy: {
    eyebrow: 'Informacija',
    title: 'Privatumo politika',
    intro: 'Jūsų duomenis tvarkome tik tiek, kiek reikia užsakymui įvykdyti, ir niekada jų neparduodame.',
    sections: [
      {
        title: 'Kokius duomenis renkame',
        list: [
          'Kontaktinius duomenis: vardą, el. paštą, telefono numerį.',
          'Pristatymo adresą arba pasirinktą paštomatą.',
          'Užsakymų istoriją, jei susikuriate paskyrą.',
        ],
      },
      {
        title: 'Mokėjimų duomenys',
        text: 'Mokėjimo kortelių duomenis tvarko sertifikuotas mokėjimų partneris Stripe. Mes kortelių duomenų nematome ir nesaugome.',
      },
      {
        title: 'Jūsų teisės',
        text: 'Turite teisę susipažinti su savo duomenimis, juos ištaisyti, ištrinti ar apriboti jų tvarkymą. Rašykite adresu labas@vaidore.com.',
      },
      {
        title: 'Duomenų valdytojas',
        text: '[Įmonės pavadinimas], įmonės kodas [kodas], [adresas].',
      },
    ],
  },
  contact: {
    eyebrow: 'Pagalba',
    title: 'Kontaktai',
    intro: 'Atsakome per kelias valandas darbo dienomis. Padėsime išsirinkti kvapą, sutvarkyti užsakymą ar pateikti didmeninę užklausą.',
    contacts: [
      { label: 'El. paštas', value: 'labas@vaidore.com' },
      { label: 'Telefonas', value: '+370 600 00000' },
      { label: 'Darbo laikas', value: 'I–V 9:00–18:00' },
      { label: 'Rekvizitai', value: '[Įmonės pavadinimas], įm. k. [kodas], [adresas]' },
    ],
    form: true,
  },
  partners: {
    eyebrow: 'Bendradarbiavimas',
    title: 'Partneriams',
    intro: 'Kuriate turinį, valdote saloną ar parduotuvę? Prisijunkite prie Vaidore partnerių programos.',
    sections: [
      {
        title: 'Turinio kūrėjams',
        text: 'Gaukite asmeninį nuolaidos kodą sekėjams ir 15 % komisinį atlygį nuo kiekvieno pardavimo. Mokame kas mėnesį.',
      },
      {
        title: 'Verslui ir didmenai',
        text: 'Salonams, viešbučiams ir parduotuvėms siūlome didmenines kainas, nuosavo prekės ženklo galimybę ir kvapų marketingą erdvėms.',
      },
    ],
    form: true,
  },
}

export const BLOG_POSTS = [
  {
    id: 'kaip-islaikyti-kvapa',
    title: 'Kaip išlaikyti kvapą visą dieną: 7 parfumerių patarimai',
    date: '2026-10-28',
    readTime: '4 min.',
    excerpt: 'Pulsas, drėgna oda ir sluoksniavimas — paprasti įpročiai, kurie kvapo ilgaamžiškumą padvigubina.',
    body: [
      'Kvapas ilgiausiai laikosi ant drėgnos odos, todėl kvepalus purkškite iškart po dušo, ant kūno losjonu suvilgytos odos.',
      'Rinkitės pulso taškus: riešus, kaklą, alkūnių linkius. Šiltesnė oda kvapą skleidžia tolygiau.',
      'Netrinkite riešų vienas į kitą — trintis suardo viršutines natas ir kvapas „subręsta“ per greitai.',
      'Sluoksniuokite: aliejinis koncentratas po kvepalais suteikia bazei tvirtumo ir prailgina šleifą keliomis valandomis.',
    ],
  },
  {
    id: 'kvapu-piramide',
    title: 'Kas yra kvapo piramidė ir kodėl kvepalai keičiasi ant odos',
    date: '2026-10-12',
    readTime: '5 min.',
    excerpt: 'Viršutinės, širdies ir bazinės natos — kaip skaityti kvapo aprašymą ir išsirinkti tinkamą.',
    body: [
      'Viršutinės natos jaučiamos pirmąsias 15 minučių — dažniausiai tai citrusai, prieskoniai ar žalios natos.',
      'Širdies natos atsiskleidžia po pusvalandžio ir sudaro kvapo charakterį: gėlės, vaisiai, medienos.',
      'Bazinės natos — vanilė, ambra, muskusas, medienos — lieka ant odos ilgiausiai ir kuria šleifą.',
      'Todėl kvapą visada vertinkite ne iš karto, o po kelių valandų — būtent tam ir skirti mėginukai.',
    ],
  },
  {
    id: 'kvapas-namams',
    title: 'Namų kvapas: kaip išsirinkti difuzorių kiekvienam kambariui',
    date: '2026-09-30',
    readTime: '3 min.',
    excerpt: 'Gaivūs kvapai vonios kambariui, šilti — svetainei. Paprastas gidas, kaip namus paversti ritualu.',
    body: [
      'Mažoms erdvėms (iki 10 m²) pakanka 100 ml difuzoriaus su 5–6 lazdelėmis.',
      'Svetainei rinkitės 200–500 ml difuzorių ir apverskite lazdeles kartą per savaitę.',
      'Miegamajam tinka švelnūs, kremiški kvapai — figos, sandalmedis, muskusas.',
    ],
  },
]
