# Deployment dokumentacija

| # | Dokument | Pokriva |
|---|---|---|
| 01 | [Lokalna instalacija](01-lokalna-instalacija.md) | Profesorov zahtjev 3a — priprema za puštanje u rad, korak-po-korak za ocjenjivača (Windows / macOS / Linux) |
| 02 | [Staging rollout](02-staging-rollout.md) | Profesorov zahtjev 3b — pilot deployment (1 škola, 1 takmičenje) na Laravel Cloud Hobby tier |
| 03 | [Production readiness](03-production-readiness.md) | Profesorov zahtjev 3b — checklist za prelaz na punu produkciju (pravno, tehničko, operativno, compliance) |

## Brzi start za ocjenjivača

```bash
git clone <repo-url> sportski-savez-app
cd sportski-savez-app
composer install && npm install
cp .env.example .env && php artisan key:generate

# Linux/macOS:
touch database/database.sqlite

# Windows PowerShell:
New-Item -ItemType File database/database.sqlite

php artisan migrate && php artisan db:seed
php artisan storage:link
composer run dev

# Otvori: http://localhost:8000
# Login: admin@savez.test / Adm1n!Test (provjeri u database/seeders/DatabaseSeeder.php)
```

Detalje vidi u [01-lokalna-instalacija.md](01-lokalna-instalacija.md). Demo scenariji za UC5, UC8, UC10 u istom dokumentu.

## Vezana dokumentacija

- [V&V i AI u SDLC refleksija](../04-vv-i-ai-u-sdlc.md) — sekcija 5 pokriva AI rizike u deployment-u
- Spec `specs/001-sportski-savez.md` §11 — opis target deployment platforme
- Meta-plan `specs/000-paralelni-plan.md` §9 — NE-radi liste (šta se ne deployuje u v1.0)
- CLAUDE.md sekcija 2.1 — Database safety pravila (zabranjen `migrate:fresh`)
