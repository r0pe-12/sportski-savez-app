# Graph Report - app+database+routes  (2026-05-12)

## Corpus Check
- 26 files · ~3,803 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 85 nodes · 79 edges · 20 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_User profil i sigurnost|User profil i sigurnost]]
- [[_COMMUNITY_AI Dnevnik sistem|AI Dnevnik sistem]]
- [[_COMMUNITY_Validacija profila|Validacija profila]]
- [[_COMMUNITY_Fortify konfiguracija|Fortify konfiguracija]]
- [[_COMMUNITY_Registracija i seeding|Registracija i seeding]]
- [[_COMMUNITY_App Service Provider|App Service Provider]]
- [[_COMMUNITY_User Factory|User Factory]]
- [[_COMMUNITY_Inertia middleware|Inertia middleware]]
- [[_COMMUNITY_Appearance middleware|Appearance middleware]]
- [[_COMMUNITY_Profile delete request|Profile delete request]]
- [[_COMMUNITY_Two-Factor request|Two-Factor request]]
- [[_COMMUNITY_Users migracija|Users migracija]]
- [[_COMMUNITY_Cache migracija|Cache migracija]]
- [[_COMMUNITY_Jobs migracija|Jobs migracija]]
- [[_COMMUNITY_Two-Factor kolone migracija|Two-Factor kolone migracija]]
- [[_COMMUNITY_AI Dnevnik migracija|AI Dnevnik migracija]]
- [[_COMMUNITY_Base Controller|Base Controller]]
- [[_COMMUNITY_Console rute|Console rute]]
- [[_COMMUNITY_Settings rute|Settings rute]]
- [[_COMMUNITY_Web rute|Web rute]]

## God Nodes (most connected - your core abstractions)
1. `User` - 11 edges
2. `FortifyServiceProvider` - 6 edges
3. `profileRules()` - 5 edges
4. `ProfileController` - 4 edges
5. `SecurityController` - 4 edges
6. `AiDnevnikSesija` - 4 edges
7. `AppServiceProvider` - 4 edges
8. `UserFactory` - 4 edges
9. `HandleInertiaRequests` - 3 edges
10. `CreateNewUser` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "User profil i sigurnost"
Cohesion: 0.19
Nodes (3): ProfileController, SecurityController, User

### Community 1 - "AI Dnevnik sistem"
Cohesion: 0.22
Nodes (3): AiDnevnikController, AiDnevnikSeeder, AiDnevnikSesija

### Community 2 - "Validacija profila"
Cohesion: 0.38
Nodes (4): ProfileUpdateRequest, emailRules(), nameRules(), profileRules()

### Community 3 - "Fortify konfiguracija"
Cohesion: 0.43
Nodes (1): FortifyServiceProvider

### Community 4 - "Registracija i seeding"
Cohesion: 0.33
Nodes (2): CreateNewUser, DatabaseSeeder

### Community 5 - "App Service Provider"
Cohesion: 0.5
Nodes (1): AppServiceProvider

### Community 6 - "User Factory"
Cohesion: 0.4
Nodes (1): UserFactory

### Community 7 - "Inertia middleware"
Cohesion: 0.5
Nodes (1): HandleInertiaRequests

### Community 8 - "Appearance middleware"
Cohesion: 0.67
Nodes (1): HandleAppearance

### Community 9 - "Profile delete request"
Cohesion: 0.67
Nodes (1): ProfileDeleteRequest

### Community 10 - "Two-Factor request"
Cohesion: 0.67
Nodes (1): TwoFactorAuthenticationRequest

### Community 11 - "Users migracija"
Cohesion: 0.67
Nodes (0): 

### Community 12 - "Cache migracija"
Cohesion: 0.67
Nodes (0): 

### Community 13 - "Jobs migracija"
Cohesion: 0.67
Nodes (0): 

### Community 14 - "Two-Factor kolone migracija"
Cohesion: 0.67
Nodes (0): 

### Community 15 - "AI Dnevnik migracija"
Cohesion: 0.67
Nodes (0): 

### Community 16 - "Base Controller"
Cohesion: 1.0
Nodes (1): Controller

### Community 17 - "Console rute"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Settings rute"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Web rute"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **1 isolated node(s):** `Controller`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Base Controller`** (2 nodes): `Controller.php`, `Controller`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Console rute`** (1 nodes): `console.php`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings rute`** (1 nodes): `settings.php`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Web rute`** (1 nodes): `web.php`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User profil i sigurnost` to `Validacija profila`, `Registracija i seeding`, `Inertia middleware`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `profileRules()` connect `Validacija profila` to `Registracija i seeding`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `User` (e.g. with `.create()` and `.edit()`) actually correct?**
  _`User` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `profileRules()` (e.g. with `.create()` and `.rules()`) actually correct?**
  _`profileRules()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Controller` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._