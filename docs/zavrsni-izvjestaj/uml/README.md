# UML dijagrami — Sistem školskog sporta CG (v1.0)

Šest UML dijagrama generisanih iz **stvarno implementiranog koda** (Phase 0–3, v1.0 tag), spremljenih kao PlantUML izvor. Render slike (`.png`) treba generisati lokalno — `.puml` izvor je glavni deliverable jer je versionable i diffable.

| # | Dijagram | Izvor | Render | Pokriva |
|---|---|---|---|---|
| 1 | Klasni dijagram | [01-klasni-dijagram.puml](01-klasni-dijagram.puml) | [render/01-klasni-dijagram.png](render/01-klasni-dijagram.png) | Domain model: 11 entiteta + 7 enum-a + STI hijerarhija User/Professor |
| 2 | Sequence UC5 | [02-sequence-uc5.puml](02-sequence-uc5.puml) | [render/02-sequence-uc5.png](render/02-sequence-uc5.png) | Prijava ekipe: upload potvrde (async OCR) + submit (sync sa potpisom) |
| 3 | Sequence UC8 | [03-sequence-uc8.puml](03-sequence-uc8.puml) | [render/03-sequence-uc8.png](render/03-sequence-uc8.png) | eDnevnik verifikacija (3 grane: verified/mismatched/unavailable) |
| 4 | Component dijagram | [04-component-dijagram.puml](04-component-dijagram.puml) | [render/04-component-dijagram.png](render/04-component-dijagram.png) | Slojevita arhitektura: Presentation → HTTP → Application → Domain + Infrastructure |
| 5 | Package dijagram | [05-package-dijagram.puml](05-package-dijagram.puml) | [render/05-package-dijagram.png](render/05-package-dijagram.png) | Laravel app struktura: 21 controller, 12 modela, 12 split route fajlova |
| 6 | Deployment dijagram | [06-deployment-dijagram.puml](06-deployment-dijagram.puml) | [render/06-deployment-dijagram.png](render/06-deployment-dijagram.png) | Dev (lokalno SQLite+log mail) vs prod (Laravel Cloud + PostgreSQL + Redis + S3 + SES + Vision + eDnevnik) |

## Render-ovanje izvora

> **Napomena (T4.1 izvršavanje, sesija 19+):** Na razvojnoj radnoj stanici PlantUML CLI, lokalni Java runtime i Docker daemon nisu bili dostupni u trenutku komitovanja izvora. PNG render se mora generisati lokalno — preporučeni način je VS Code "PlantUML" extension.

### Opcija 1 — VS Code "PlantUML" extension (preporučeno na Windows-u bez Java/Docker-a)

1. Instaliraj extension `jebbs.plantuml` u VS Code.
2. Otvori bilo koji `.puml` fajl iz ovog direktorija.
3. `Alt+D` za live preview.
4. Desni klik na preview → **Export Current Diagram** → PNG → snimi u `docs/zavrsni-izvjestaj/uml/render/<naziv>.png`.
5. Alternativa za batch: command palette → `PlantUML: Export Workspace Diagrams` → izaberi PNG.

Extension koristi public PlantUML server kao default render backend, što ne zahtjeva lokalnu Java instalaciju.

### Opcija 2 — PlantUML CLI (ako je instaliran lokalno)

```bash
plantuml docs/zavrsni-izvjestaj/uml/*.puml -o render/
```

### Opcija 3 — Docker (ako je Docker daemon pokrenut)

```bash
docker run --rm -v ${PWD}:/data plantuml/plantuml docs/zavrsni-izvjestaj/uml/*.puml -o render/
```

## Referenca

- Spec §7 (Domain model), §9 (Arhitektura), §10 (Stack), §11 (Deployment)
- T4.1 plan: [`specs/140-t4.1-uml-dijagrami.md`](../../../specs/140-t4.1-uml-dijagrami.md)
