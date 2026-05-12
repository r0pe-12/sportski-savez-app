# F1 — Faza 0: Setup

**Phase:** 0 (sekvencijalno) · **Track ID:** F1 · **Procijenjeno:** 2 dana
**Spec referenca:** [`specs/001-sportski-savez.md`](001-sportski-savez.md) sekcije 15, 10
**Meta-plan:** [`specs/000-paralelni-plan.md`](000-paralelni-plan.md)
**Blokira:** sve naredne track-ove · **Blokiran-od:** —

---

## Cilj
Repo, env i CI spremni za sekvencijalni F2 i naredne paralelne phase-ove. **Single agent**, ne paralelan.

## Ulazi (preduslovi)
- Repo postoji (`git status` čisto na `main`)
- Spec v1.1 finalizovan
- Meta-plan v1.0 finalizovan

## Izlazi (deliverables)
- [ ] `.env.example` ažuriran sa svim varijablama koje koriste naredni track-ovi (ADMIN_EMAIL, ADMIN_PASSWORD, FORTIFY_*, FAKE_OCR_*, FAKE_EDNEVNIK_*, MAIL_MAILER=log)
- [ ] `routes/web.php` razbijen na `require` pattern (sekcija 4.2 meta-plana) — placeholder fajlovi `routes/auth.php`, `routes/admin.php`, `routes/teams.php`, `routes/sports.php`, `routes/competitions.php`, `routes/students.php`, `routes/results.php`, `routes/audit.php`, `routes/public.php` kreirani sa minimalnim sadržajem
- [ ] `CONTRIBUTING.md` ili `AGENTS.md` sa worktree konvencijama iz meta-plana sekcije 5
- [ ] Pre-commit hook za Pint (ako ne postoji)
- [ ] GitHub Actions / GitLab CI workflow za Pest + Pint + build
- [ ] `composer run dev` skripta (Laravel Sail / artisan serve + queue:work + pail + npm run dev concurrent)

## Shared edit zones
- `routes/web.php` — split kreirati pre nego što T1.1/T1.2/T1.3 počnu

## Acceptance criteria
- Sva 9 placeholder route fajlova postoji i loaduje se bez errora
- `php artisan route:list` izlazi bez greške
- `composer run dev` pokreće sve servise
- CI workflow zelen na PR

## NE radi
- Nemoj kreirati biznis logiku (to ide u Phase 1+)
- Nemoj kreirati migracije (F2 sve odjednom)
- Nemoj instalirati nove pakete osim ako trenutni stack zahtjeva

## TODO (popunjava `/plan`)
- [ ] Detaljan korak-po-korak plan
- [ ] Komandi koje izvršiti
- [ ] Verifikacija svakog koraka