# Copy & konverzný audit — pozicionovanie

**Dátum:** 2026-07-28
**Rozsah:** (1) `/concierge-day`, (2) všetky stránky jednotlivých zážitkov
**Stav:** len report — v kóde nebolo nič zmenené.

## Ktoré stránky spadajú do auditu

| Typ | Súbor | Poznámka |
|---|---|---|
| Concierge day | `app/(site)/concierge-day/page.tsx` + `content/concierge-day-page/index.yaml` | Sekcie sa skladajú z Keystatic poľa `sections` |
| Zážitky (26 ks) | `app/(site)/experiences/[slug]/page.tsx` → `components/ExperienceTemplate.tsx` | Jedna šablóna pre všetky produkty |
| Zážitok (dedikovaný) | `app/(site)/medinet-habu/page.tsx` → tá istá šablóna | Vlajkový produkt |
| Zdieľaný text pre všetky zážitky | `content/product-page-settings/index.yaml` | How it works, garancia, recenzie, disclosure |
| Obsah produktov | `content/experiences/*/index.mdoc` | 26 aktívnych súborov |
| Konfigurátor dňa | `components/DayConfigurator.tsx` | Názvy ciest, bonusy, add-ony |

---

## Verdikt v jednej vete

Stránky sú **remeselne dobre napísané a vizuálne prémiové, ale ekonomicky aj dôkazovo sú postavené ako kvalitný výletový produkt za €140–450, nie ako concierge deň za €650–750 na osobu** — chýba menovaný človek, mechanizmus a garancia, a naopak je tam všetko, čo pozýva na porovnanie s Viatorom.

Najzávažnejší systémový nález: **na `/concierge-day` ani na jednej produktovej stránke nie je meno Ahmeda, žiadny track record a žiadny menovaný egyptológ.** Pri tejto cene je dôveryhodnosť najslabší článok — a je prakticky prázdna.

---

## A. Bolesť a sľub

| Nález | Súbor:riadok | Závažnosť | Navrhované znenie |
|---|---|---|---|
| **1.** Bolesť je pomenovaná konkrétne — a je to najsilnejšia časť stránky. Contrast blok má čísla („40 strangers", „twenty rushed minutes"). Toto NEMEŇ. | `content/concierge-day-page/index.yaml:39–51` | OK | Ponechať. |
| **1b.** Chýba však tretia časť bolesti: **jedinečnosť príležitosti**. Nikde nie je povedané „prídeš raz za život, 4 000 km". Bez toho je porovnanie s lacným výletom racionálne. | `content/concierge-day-page/index.yaml:41–45` (contrastLead) | HIGH | Pridať na koniec contrastLead: *„You flew four thousand kilometres to a place that has stood for three and a half thousand years. You will probably stand here once. That is the whole argument for doing it properly."* |
| **1c.** H1 je generický „unforgettable" typ sľubu — nehovorí bolesť ani mechanizmus. | `content/concierge-day-page/index.yaml:2` | MEDIUM | *„You get one day at a place that waited three thousand years. This is how not to waste it."* |
| **2.** Vysnívaný výsledok je povedaný **len raz a plytko** (hero + dreamText sú ten istý register: „arranged, effortless"). Druhá, hlbšia hladina na stránke chýba úplne. | `:3–6` (hero), `:58–64` (dream) | HIGH | Doplniť NOVÚ sekciu pod value stack / nad final CTA (t. j. hlboko dole): eyebrow *„If you're standing at a threshold"*, nadpis *„Some people come for Egypt. Some come for the pause before what's next."*, text: *„We arrange a lot of days for people between two chapters — a company sold, a decision unmade, a birthday that landed harder than expected. We don't promise anything about it. We just build a day with enough silence in it that you can hear yourself think, and someone beside you who knows when not to talk."* |
| **3.** Na `/concierge-day` hlboký jazyk **nie je príliš hore** — poradie je správne. | `:2–9` vs `:58–64` | OK | Ponechať. |
| **3b.** Na zážitkoch je hĺbka naopak **príliš hore**: Medinet Habu má v H1 aj v hooku metafyziku („Begin where the world began", „initiation into…"), skôr než čokoľvek overiteľné. | `content/experiences/medinet-habu/index.mdoc:1`, `:4–9` | MEDIUM | H1: *„The best-preserved temple in Thebes — and almost nobody is in it."* Hook: *„While the buses queue at Karnak, Medinet Habu stands nearly empty: painted ceilings still in colour, the only eyewitness record of the Sea Peoples, and a royal palace most visitors never realise is there. Privately, with a certified Egyptologist, in the first cool hour."* — hĺbku ponechať v tele (`:137–143`), kde je dnes a kde je správne. |
| **3c.** Telo Medinet Habu má hĺbku správne dole (`:125–143`) — to je presne požadovaná postupná hĺbka. | `content/experiences/medinet-habu/index.mdoc:119–143` | OK | Ponechať ako vzor pre ostatné produkty. |

---

## B. Dôveryhodnosť — najslabší článok

| Nález | Súbor:riadok | Závažnosť | Navrhované znenie |
|---|---|---|---|
| **4.** **Egyptológ nie je nikde menovaný.** Naprieč celým webom je len generické „a certified Egyptologist". Pri €650–750/os. je to anonymný dodávateľ. | `content/product-page-settings/index.yaml:9`, `:17–18`; `content/concierge-day-page/index.yaml:56`, `:168` | HIGH | Miesto pre meno: nová karta v sekcii „How it works" alebo pod contrast blok. Znenie: *„Your Egyptologist is [Meno], licensed by the Ministry of Tourism & Antiquities (licence no. XXXX), [N] years guiding on the West Bank, [špecializácia]. You'll get their name and a short note about them within 24 hours of booking — not a guide assigned on the morning."* |
| **5.** **Ahmedov track record nie je na týchto stránkach vôbec.** Ahmed sa spomína len v `private-guide`, `insiders-guide` a jednom článku — nie na predajných stránkach. Royal Transfer ani počet hodnotení nie sú nikde na webe. | `app/(site)/concierge-day/page.tsx` (žiadny výskyt), `content/experiences/*` (žiadny výskyt) | HIGH | Pridať pod contrast blok, s **jasnou atribúciou partnerovi**: *„The ground operation is run by Ahmed, who has spent [N] years arranging private days in Luxor and holds [N] five-star reviews under Royal Transfer, his transfer company. Those reviews are his, earned before Luxor Rising existed — we're telling you because it's why we trust him with your day."* |
| **6.** **Mechanizmus nie je vysvetlený nikde.** Stránka tvrdí „before the crowds" / „timed against the crowds" ~15×, ale ani raz nepovie AKO. Bez mechanizmu je prémiová cena len tvrdenie. | `content/concierge-day-page/index.yaml:54`; `app/(site)/concierge-day/page.tsx:246`; `content/experiences/*/index.mdoc` (`bestTime` polia) | HIGH | Nová krátka sekcia hneď pod contrast blok, nadpis *„Why we can actually do this"*: *„The Valley of the Kings opens at 6:00. The first coach from the Hurghada road parks at about 8:40. We collect you at 5:40, cross at the Ferry gate rather than the main tourist gate, and have your tickets in hand before we arrive — so you are through and standing in the first tomb around 6:15. That is not a perk. That is the entire difference, and it is the only reason this day costs what it costs."* (čísla si over s Ahmedom pred publikovaním) |
| **7.** **Garancia je slabá a generická** — „we make it right" nič konkrétne nesľubuje a nepreberá riziko. | `content/product-page-settings/index.yaml:31–34`; `app/(site)/concierge-day/page.tsx:412–427` | HIGH | Nahradiť tretiu kartu („We make it right") znením: *„If the first two hours don't feel different from any tour you've been on before, say so and the day is on us. No form, no argument — tell your consigliere before lunch and we refund it in full."* Umiestnenie: ponechať v sekcii garancie, ale **preniesť sekciu vyššie** — dnes je až za recenziami (`sections:31`), patrí hneď za value stack. |
| **B-extra.** `heroTrustLine` tvrdí „4.9 · 60+ private days arranged" bez zdroja, pričom na tej istej stránke je priznané, že recenzie sú vzorové. To je vnútorný rozpor, ktorý pozorný kupujúci nájde. | `content/concierge-day-page/index.yaml:7` vs `app/(site)/concierge-day/page.tsx:396` | HIGH | Dovtedy, kým nie sú reálne recenzie: *„60+ private days arranged in Luxor · run on the ground by Ahmed (Royal Transfer)"* — bez hviezdičkového ratingu. |

---

## C. Neporovnateľnosť — kritické pre cenu

| Nález | Súbor:riadok | Závažnosť | Navrhované znenie |
|---|---|---|---|
| **8.** **Balíkový zoznam je na všetkých 26 produktoch.** Pole `glanceIncludes` má presne tvar „Includes private transfer · a certified Egyptologist · monument entry · every detail arranged". Toto je najväčšie cenové riziko na webe — je to doslova porovnávacia tabuľka pre Viator. | `content/experiences/medinet-habu/index.mdoc:17–19`; `karnak-at-dawn:17–19`; `valley-of-the-kings:17–19`; + 23 ďalších; render `components/ExperienceTemplate.tsx:152` | HIGH | Prepísať z inventára na **tvar dňa**. Vzor (Medinet Habu): *„We collect you in the dark, so you are inside while the light is still low and the courts are empty. Your Egyptologist reads the Sea Peoples wall with you — the only eyewitness record of it anywhere — and then leaves you alone in the painted hall for as long as you want to stand there. You are back before the heat, having made no decisions and stood in no queue."* Rovnaký prepis pre všetkých 26. |
| **8b.** FAQ „What's included in the price?" ten istý problém zopakuje ako zoznam. | `content/experiences/medinet-habu/index.mdoc:83–87` | MEDIUM | *„The entry ticket is a few euros — that was never the cost. You're paying for the hour (in before the crowds, not with them), a licensed Egyptologist who reads the walls instead of reciting them, a private car that waits, and a day where nothing is your problem."* |
| **9.** Kontrastný blok **existuje a je dobrý** — s číslami na strane „usual way". Ale strana „a Luxor Rising day" je bez času a mechanizmu, takže kontrast je nerovnaký. | `content/concierge-day-page/index.yaml:46–51` vs `:52–57` | HIGH (najvyššia páka) | Prepísať `goodWayItems` na časy: *„5:40 — a private car at your door, while it's still dark"*, *„6:15 — inside the first tomb, before the first coach leaves Hurghada"*, *„Three places, unhurried — not seven, ticked off"*, *„Your own licensed Egyptologist, named and briefed before you land"*, *„One consigliere who owns the whole day — and a refund if the first two hours don't feel different"*. |
| **10.** **Deň nie je opísaný ako oblúk s hodinami.** `dreamText` je pekná próza bez jediného času; sekcia „What your day can hold" je zoznam zastávok. | `content/concierge-day-page/index.yaml:58–64`; `app/(site)/concierge-day/page.tsx:272` | HIGH | Pridať sekciu „The shape of the day" (nad konfigurátor) ako časovú os: *„5:40 pickup · 6:15 through the gate at the Valley · 8:30 Hatshepsut as the light turns · 10:00 back for a long breakfast · 16:30 Medinet Habu, empty · 18:10 the felucca, because the river is best last."* Pod tým jedna veta: *„Six hours of it are yours to do nothing in. That is deliberate."* |

---

## D. Priestor a úcta

| Nález | Súbor:riadok | Závažnosť | Navrhované znenie |
|---|---|---|---|
| **11.** **Zdržanlivosť nie je nikde pomenovaná ako prednosť.** Naopak — stránka predáva množstvo: „12 experiences included", „the more days, the more we include", „15 experiences". To je priamo proti bolesti zo zhonu. | `components/DayConfigurator.tsx:57` (`EXPCOUNT`), `:65–70` (`IBMSG`); `content/concierge-day-page/index.yaml:171–176` | HIGH | Pridať do sekcie o tvare dňa: *„Three places in a day, not seven. You will be offered fewer things than anyone else will offer you, and that is the product: time to stand still in front of something that took a hundred years to carve."* A prepísať `IBMSG` pre 1 deň z „Add days to include more" na *„One day, done properly. Most guests who add a second day do it after the first, not before."* |
| **12.** **Ahmedova rola nie je definovaná** — „consigliere" sa používa ~20×, ale nikde nie je povedané, čo robí a čo nerobí. | `content/concierge-day-page/index.yaml:154–156`; `app/(site)/concierge-day/page.tsx:246–250` | MEDIUM | *„Your consigliere is not a guide with a flag. Ahmed decides the order of your day — which gate, which hour, when to wait and when to move — and he is on WhatsApp from before you land until you're back. He doesn't walk you through the temple; the Egyptologist does that. He makes sure the temple is empty when you get there."* |

---

## E. Hodnotový stack

| Nález | Súbor:riadok | Závažnosť | Navrhované znenie |
|---|---|---|---|
| **13.** **Value stack je vypnutý.** V Keystatic je `valueStack: visible: false` — jediná cenová kotva na stránke je skrytá. | `content/concierge-day-page/index.yaml:25–26` | HIGH | Zapnúť (`visible: true`) a presunúť **nad** garanciu. Bez kotvy je €450 (resp. €650–750) len číslo. |
| **13b.** Bonusy v konfigurátore **nemajú uvedenú hodnotu v zozname** — hodnoty existujú v `PRICE_TABLE`, ale hosť ich v pláne nevidí. | `components/DayConfigurator.tsx:287–297` (bonusy), `:88–101` (ceny) | HIGH | Zobraziť pri každom bonuse hodnotu: *„Deir el-Shelwit — the hidden temple of Isis (€120) — included"*, *„A private felucca at sunset (€105) — included"*, *„Photographs on your own phone, all day (€0 — we just do it)"*. |
| **14.** **Bonusy nezabíjajú námietky, len pridávajú veci.** „Desert rally across the dunes", „Sailing lesson on the Nile", „Authentic local contacts" — žiadny z nich neodpovedá na obavu kupujúceho. Chýbajú presne tie, ktoré by odpovedali: fotky, teplo, obťažovanie strážcami/predavačmi. | `components/DayConfigurator.tsx:283–297` | HIGH | Zrušiť „Desert rally" a „Sailing lesson" ako bonusy (nechať ako platené add-ony). Nahradiť: **fotky** — *„Your day photographed on your own phone — you'll have them before dinner, not in six weeks."*; **teplo** — *„Chilled water and cold towels in the car, all day. You will not be heroic about the heat."*; **strážcovia** — *„The guards know us. Nobody will follow you, sell you anything, or ask for a tip — that's handled before you arrive."* |
| **15.** **Bonusov je priveľa** — pri 3 dňoch 12 položiek + 2 signature bonusy, pri 4 dňoch 15 + 3. Nabitý deň pôsobí lacno, nie luxusne. | `components/DayConfigurator.tsx:57` (`EXPCOUNT: {3: 12, 4: 15}`), `:63` (`SIGB`) | MEDIUM | Znížiť na 2–3 pomenované bonusy naprieč všetkými dĺžkami a zvyšok presunúť do „what's handled" (kde nekonkuruje pozornosti). Sprievodný text: *„Two things we add that you didn't ask for. Not ten."* |

---

## F. Férové odmeňovanie

| Nález | Súbor:riadok | Závažnosť | Navrhované znenie |
|---|---|---|---|
| **16.** Téma férového platenia **na stránkach vôbec nie je** (žiadny výskyt naprieč `content/` a `app/`). Nie je to teda prosba o príplatok — je to nevyužitý dôkaz kvality. | — (chýba) | MEDIUM | Pridať jednu vetu do sekcie o mechanizme alebo do FAQ: *„We pay our Egyptologists about three times the going day rate in Luxor. That's not charity — it's why we get the ones who still love the material, instead of the ones reciting a script for the fourth time that day."* |
| **17.** Ak sa pridá, patrí **nižšie** — do FAQ alebo pod value stack, nie do hero. | `content/concierge-day-page/index.yaml:145+` (FAQ) | LOW | Umiestniť ako FAQ položku *„Why does this cost more than a tour?"*. |

---

## G. Bezpečnosť a etika — HIGH PRIORITY

| Nález | Súbor:riadok | Závažnosť | Navrhované znenie |
|---|---|---|---|
| **18.** **Sľub „zákona", podľa ktorého sa dá žiť** — text tvrdí, že obnova je „a law you can choose to live by". To je sľub o účinku na život, nie opis miesta. | `content/experiences/medinet-habu/index.mdoc:129` | HIGH | *„…a reminder that renewal was something they built into the calendar, on purpose, every ten days for a thousand years."* (opis praxe, nie sľub) |
| **18b.** „a quiet reset before whatever comes next" — hraničí s terapeutickým sľubom. | `content/experiences/medinet-habu/index.mdoc:141` | MEDIUM | *„…a pause at the source: an early hour, no schedule, and nobody asking anything of you."* |
| **18c.** „Come to be reminded that beginnings are still possible — and to make one your own." | `content/experiences/medinet-habu/index.mdoc:39–41` (momentQuote) | LOW | *„The place where they believed it all started. At the hour they believed it started."* |
| **19.** **Jazyk „iniciácie" — 4 výskyty**, vrátane názvu celej cesty v konfigurátore. Je to privlastnenie duchovnej tradície (a zároveň nadsľub). | `components/DayConfigurator.tsx:30` („Initiation to Power"), `:31` („Medinet Habu — your initiation"), `:36` („Karnak at dawn — your initiation"), `:544` (eyebrow „The Initiation"); `content/experiences/medinet-habu/index.mdoc:7` | HIGH | `:30` → *„Where it began"*; `:31` → *„Medinet Habu — your first temple"*; `:36` → *„Karnak at dawn — your first temple"*; `:544` → *„The quiet one"*; `medinet-habu:7` → *„A private, certified-guided first visit to the best-preserved temple in Thebes"*. Sprievodná veta k úcte: *„It's a working sacred site, not a set. We go early partly because that's when it's yours — and partly because that's when it's quiet enough to deserve."* |
| **20a.** **Cena je nejednoznačná: „€450 / day · ≤4 guests, private"** sa číta ako cena za skupinu. Pri deklarovanej pozícii €650–750 **na osobu** je to zásadný nesúlad — dnes 2 hostia zaplatia €535 spolu, t. j. ~€268/os. | `content/concierge-day-page/index.yaml:8–9`; `content/pricing-rules/index.yaml:1`, `:9–15` | HIGH | Rozhodnúť pozíciu a zjednotiť. Ak platí €650–750/os., znenie: *„€690 per person · private, minimum 2 guests"* + pod tým *„A second guest is €690. A third and fourth are less. We don't run this day for one — say so and we'll tell you what a solo day costs."* |
| **20b.** **Minimum 2 hostí nie je nikde uvedené**, konfigurátor umožňuje 1 hosťa. Ekonomika solo dňa nefunguje. | `components/ExperienceConfigurator.tsx:145–163`; `components/DayConfigurator.tsx` (group state = 2, ale 1 je voliteľná) | HIGH | Do kroku „Who's coming?": *„Minimum two guests. Travelling alone? Tell your consigliere — we do run solo days, but they're priced separately."* |
| **20c.** **Vzorové recenzie sú zobrazené ako skutočné 5★ hodnotenia.** Na `/concierge-day` je aspoň priznanie („Sample testimonials"), na **všetkých 26 produktových stránkach nie je žiadne** — tie isté tri mená (Lena & Tomáš / Marcus / Sophie) tam vystupujú ako reálni hostia. | `content/product-page-settings/index.yaml:37–49` (bez disclaimeru) vs `app/(site)/concierge-day/page.tsx:396` | HIGH | Do publikovania reálnych recenzií sekciu **skryť** (nie iba označiť). Ak má zostať, nahradiť konkrétnym a pravdivým: *„We're new as Luxor Rising. Ahmed isn't — his transfer company holds [N] five-star reviews, and we'll publish our own the moment we have them, with names."* |

---

## H. Cesta ďalej

| Nález | Súbor:riadok | Závažnosť | Navrhované znenie |
|---|---|---|---|
| **21.** Cesta zo zážitku na celý deň **existuje a funguje** — tlačidlo „Or build a whole day" + FAQ odkaz. | `components/ExperienceTemplate.tsx:356–358`; `content/experiences/medinet-habu/index.mdoc:93–96` | OK | Ponechať. Prípadne posilniť znenie na hodnotové: *„This is one hour of a day. See what the whole one looks like →"* |
| **22.** **Z concierge dňa nevedie cesta na viacdňové cesty.** „The Multi-Day Journey" a „The Return" existujú len na `/experiences`; concierge deň ponúka max „add days" v konfigurátore. Práve tam pritom patrí hlbší jazyk naplno. | `app/(site)/experiences/ExperiencesClient.tsx:52–85` (existujú) vs `app/(site)/concierge-day/page.tsx` (žiadny odkaz) | MEDIUM | Pridať sekciu úplne dole, pod final CTA: eyebrow *„If one day isn't the question"*, nadpis *„Some people aren't booking a day. They're booking a week to decide something."*, text: *„The Return is seven days, written for one person, and we don't publish the itinerary because there isn't one until we've spoken. If that's closer to why you're looking at this page, start a conversation instead of a booking."* + CTA *„Begin a conversation →"* |

---

# 5 najdôležitejších zmien podľa dopadu na konverziu

### 1. Doplniť mechanizmus — „prečo to vieme spraviť" (HIGH)
`content/concierge-day-page/index.yaml`, nová sekcia pod contrast blok
Dnes stránka 15× tvrdí „before the crowds" a ani raz nepovie ako. Konkrétne časy a brány (*Valley otvára 6:00, prvý autobus 8:40, vy ste vnútri 6:15*) sú jediná vec, ktorá zmení prémiovú cenu z tvrdenia na fakt. **Najvyššia páka na celom webe** — bez toho žiadna iná zmena cenu neobháji.

### 2. Zrušiť balíkový zoznam na 26 produktoch (HIGH)
`content/experiences/*/index.mdoc` → `glanceIncludes`
„Includes: transfer · guide · entry" je doslova formát, v ktorom hosť porovná €140–450 s Viatorom za €160 — a prehráte, lebo v tom formáte ste drahší za to isté. Prepis na opis tvaru dňa odstráni porovnateľnosť. Zasahuje **všetkých 26 produktov naraz**.

### 3. Dať dôkazu meno a tvár — Ahmed + egyptológ (HIGH)
`/concierge-day` pod contrast blok, `content/product-page-settings/index.yaml`
Pri €650–750/os. kupujúci kupuje človeka, nie itinerár. Dnes je na predajných stránkach **nula mien**. Ahmedov track record musí byť jasne atribuovaný ako história Royal Transfer (nie ako recenzie Luxor Rising) a egyptológ musí mať meno a licenciu.

### 4. Vyriešiť cenový nesúlad a minimum 2 hostia (HIGH)
`content/concierge-day-page/index.yaml:8–9`, `content/pricing-rules/index.yaml`
Stránka dnes komunikuje ~€268/os. pri dvoch hosťoch, pozicionovanie hovorí €650–750/os. To nie je copy problém, to je **rozhodnutie o produkte**, ktoré blokuje všetko ostatné — a treba ho spraviť skôr, než sa prepisujú texty. Zároveň chýba minimum 2 hostia, čo rozbíja ekonomiku solo dňa.

### 5. Odstrániť vymyslené recenzie a nasadiť silnú garanciu (HIGH)
`content/product-page-settings/index.yaml:37–49`, `app/(site)/concierge-day/page.tsx:396–427`
Vymyslené 5★ recenzie s menami na 26 stránkach sú **riziko dôvery aj etiky** — a na concierge dni si stránka sama protirečí („4.9" vs „sample testimonials"). Nahradiť poctivým priznaním + garanciou *„ak prvé dve hodiny nebudú iné, deň vám vrátime"*, ktorá presúva riziko z kupujúceho na vás — to je pri jednorazovom nákupe za €700 silnejší konverzný nástroj než akákoľvek recenzia.

---

## Čo je dobré a nemeniť

- **Contrast blok** (`index.yaml:39–51`) — konkrétny, s číslami, presne trafená bolesť.
- **Postupná hĺbka v tele Medinet Habu** (`:119–143`) — vzor pre ostatné produkty: konkrétne hore, význam dole.
- **Cesta zo zážitku na celý deň** (`ExperienceTemplate.tsx:356`) — funguje.
- **Value stack v šablóne zážitkov** (`ExperienceTemplate.tsx:256–284`) — „The entry ticket is the cheap part." je presne správny rámec; na concierge dni je ten istý nástroj vypnutý.
