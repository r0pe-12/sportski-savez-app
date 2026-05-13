# Sistem školskog sporta CG — finalni izvještaj (v1.0)

> **Predmet:** Analiza i dizajn informacionih sistema (ADIS)
> **Univerzitet Donja Gorica · 2026**
> **Verzija aplikacije:** v1.0 (Phase 0–3 završene, 9 UC implementirano, 329/329 testova)
> **Vlasnik repozitorija:** Petar Simonović

## Executive summary

Sistem školskog sporta CG je centralizovan web informacioni sistem za Sportski savez Crne Gore koji digitalizuje proces prijave ekipa za školska sportska takmičenja. Implementiran je kao Laravel 13 monolit sa Inertia React 19 frontend-om, sa fokusom na audit-spremnost (AZLP) i auditabilnu primjenu AI alata (Claude Code) kroz cijeli SDLC.

**Ključni rezultati v1.0:**

- 9 use case-ova implementiranih (UC1 Registracija, UC2 Login, UC3 Profil/Istorija, UC4 Public Raspored, UC5 Prijava ekipe, UC7 Audit Log, UC8 eDnevnik verifikacija, UC9 Notifikacije, UC10 Rezultati + Medalje)
- 329 Pest testova (957 assertion-a) zelena
- 12 domain modela, 21 controller, 9 service klasa, 2 fake adaptera (OCR, eDnevnik)
- 19 AI sesija u `ai_dnevnik_sesije` tabeli sa kompletnim traceabilnost AI doprinosa
- 6 UML dijagrama generisanih iz implementiranog koda

## Mapa profesorovih zahtjeva na poglavlja

| # | Zahtjev profesora | Pokriva |
|---|---|---|
| 1 | Vizija + analiza | [01-vizija-i-analiza.md](01-vizija-i-analiza.md) |
| 2 | Arhitektura + tehnologije + okruženje + UML | [02-projekat.md](02-projekat.md) + [uml/](uml/) |
| 3a | Priprema za puštanje u rad | [deployment/01-lokalna-instalacija.md](deployment/01-lokalna-instalacija.md) |
| 3b | Prijedlog deployment-a | [deployment/02-staging-rollout.md](deployment/02-staging-rollout.md) + [03-production-readiness.md](deployment/03-production-readiness.md) |
| 4a–4b | Integracija prethodna 2 izvještavanja + demonstracija | [03-implementacija-demonstracija.md](03-implementacija-demonstracija.md) + [demo/](demo/) |
| 5 | V&V + AI u SDLC | [04-vv-i-ai-u-sdlc.md](04-vv-i-ai-u-sdlc.md) |

## Struktura paketa

```
docs/zavrsni-izvjestaj/
├── README.md                          ← (ovaj fajl) navigacija + executive summary
├── 01-vizija-i-analiza.md             ← prvo izvještavanje (vizija + UC katalog)
├── 02-projekat.md                     ← drugo izvještavanje (arhitektura + tehnologije + UML)
├── 03-implementacija-demonstracija.md ← treće izvještavanje (implementacija + demo)
├── 04-vv-i-ai-u-sdlc.md               ← V&V i AI u SDLC refleksija
├── uml/                               ← 6 PlantUML dijagrama (T4.1)
│   ├── 01-klasni-dijagram.puml
│   ├── 02-sequence-uc5.puml
│   ├── 03-sequence-uc8.puml
│   ├── 04-component-dijagram.puml
│   ├── 05-package-dijagram.puml
│   ├── 06-deployment-dijagram.puml
│   ├── README.md
│   └── render/ (PNG-ovi, generišu se preko VS Code "PlantUML" extension-a)
├── demo/                              ← snimci ekrana
│   ├── README.md (uputstvo za snimanje)
│   ├── uc5-prijava-ekipe.mp4 (snimi ručno)
│   ├── uc8-ednevnik-verifikacija.mp4 (snimi ručno)
│   └── uc10-rezultati-medalje.mp4 (snimi ručno)
└── deployment/                        ← deployment uputstva
    ├── README.md
    ├── 01-lokalna-instalacija.md
    ├── 02-staging-rollout.md
    └── 03-production-readiness.md
```

## Izvori istine

| Dokument | Sadržaj | Status |
|---|---|---|
| [`specs/001-sportski-savez.md`](../../specs/001-sportski-savez.md) | Glavni spec (17 sekcija, v1.1) | Single source of truth za zahtjeve |
| [`specs/000-paralelni-plan.md`](../../specs/000-paralelni-plan.md) | Meta-plan 14 track-ova kroz 4 phase | Mapa zavisnosti, merge konvencije |
| [`docs/fajlovi/SVD_v2.1.md`](../fajlovi/SVD_v2.1.md) | Originalni System Vision Document | Prvo izvještavanje |
| [`docs/fajlovi/Projektna_analitika_v3.1.md`](../fajlovi/Projektna_analitika_v3.1.md) | Originalna projektna analitika | Drugo izvještavanje, dio 1 |
| [`docs/fajlovi/Projektni_dizajn_v1.2.md`](../fajlovi/Projektni_dizajn_v1.2.md) | Originalni projektni dizajn | Drugo izvještavanje, dio 2 |
| `ai_dnevnik_sesije` tabela | 19 sesija (2026-05-12 → 2026-05-13) | Live audit AI doprinosa, dostupno na `/ai-dnevnik` |

## Kako koristiti ovaj paket

**Za ocjenjivača koji prvi put gleda:**
1. Pročitati ovaj README.md za executive summary
2. Otvoriti `01-vizija-i-analiza.md` za problem i rješenje
3. Otvoriti `02-projekat.md` sa inline UML render slikama
4. Pratiti `deployment/01-lokalna-instalacija.md` da pusti aplikaciju
5. Gledati `demo/*.mp4` snimke za UC5, UC8, UC10
6. Pročitati `04-vv-i-ai-u-sdlc.md` za refleksiju o AI u SDLC

**Za potencijalne nastavljače rada:**
1. Pročitati glavni spec (`specs/001-sportski-savez.md`)
2. Pročitati meta-plan (`specs/000-paralelni-plan.md`) za faze i NE-radi liste
3. Pročitati `CLAUDE.md` u root-u repozitorija za AI workflow pravila
4. Provjeriti otvorena pitanja iz spec sekcije 16 + meta-plan sekcije 9
