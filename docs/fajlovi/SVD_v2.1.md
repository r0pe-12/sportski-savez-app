**SISTEM ŠKOLSKOG SPORTA**

**CRNE GORE**

*System Vision Document*

Predmet: Analiza i dizajn informacionih sistema (ADIS)

Univerzitet Donja Gorica

*Verzija 2.1 \| 2026*

**1. Problem i rješenje**

**Problem**

Sportski savez Crne Gore organizuje školska sportska takmičenja, ali se
cijeli proces prijave i evidencije odvija na papiru. Ključni problemi:

- Spor i nepouzdan ručni proces --- gubici dokumenata, sporo
  provjeravanje potvrda

- Nepostojanje centralne evidencije učesnika, rezultata i istorije
  takmičenja

- Nedostatak tragova obrade osjetljivih podataka maloljetnika (AZLP
  rizik)

**Rješenje**

Centralizovan web informacioni sistem sa tri uloge:

- Profesor --- prijavljuje ekipu uz upload ljekarskih potvrda

- Učenik --- pristupa svom profilu i istoriji takmičenja

- Administrator (Savez) --- upravlja sistemom, rasporedom i unosi
  rezultate

Sistem automatski OCR-uje ljekarske potvrde, vodi centralnu evidenciju i
raspored takmičenja, šalje notifikacije i bilježi sve akcije u
nepromjenljiv audit log radi AZLP usklađenosti.

**2. Sistemske sposobnosti**

  -----------------------------------------------------------------------
  **Sposobnost**         **Opis**
  ---------------------- ------------------------------------------------
  **Digitalna prijava    Profesor formira ekipu, dodaje učenike i
  ekipa**                uploaduje ljekarske potvrde.

  **OCR validacija       Sistem ekstrahuje datume i ime sa potvrde,
  potvrda**              signalizira istekle ili nevalidne.

  **Profili učenika**    Lični podaci, fotografija, istorija takmičenja,
                         rezultata i osvojenih medalja.

  **Katalog sportova i   Centralna evidencija sportova (timski /
  raspored**             individualni) i kalendar takmičenja.

  **Unos rezultata**     Administrator unosi plasmane i medalje; sistem
                         ažurira profile učenika.

  **Notifikacije i audit Email + in-app obavještenja; nepromjenljiv zapis
  log**                  svih akcija (AZLP).

  **eDnevnik             Verifikacija statusa učenika kroz državni
  integracija**          sistem.
  -----------------------------------------------------------------------

**3. Obim sistema**

  -----------------------------------------------------------------------
  **U obimu**                         **Van obima**
  ----------------------------------- -----------------------------------
  • Web aplikacija sa tri uloge       • Mobilna aplikacija

  • Digitalna prijava ekipa + OCR     • Plaćanja kotizacija
  potvrda                             

  • Profili učenika sa istorijom      • Live streaming takmičenja

  • Raspored takmičenja i katalog     • Pravna validacija medicinskog
  sportova                            sadržaja potvrda

  • Notifikacije i audit log          • Sportski rezultati van škole
                                      (klubovi, selekcije)

  • Integracija sa eDnevnikom         • Bulk import učenika

  • Usklađenost sa Zakonom o zaštiti  • Vanjski API za treća lica
  podataka                            
  -----------------------------------------------------------------------

**4. Stakeholderi**

  -----------------------------------------------------------------------
  **Stakeholder**        **Interes**
  ---------------------- ------------------------------------------------
  **Sportski savez CG**  Centralno upravljanje takmičenjima i evidencija
                         školskog sporta.

  **Profesor**           Brza i pouzdana prijava ekipa bez papirne
                         administracije.

  **Učenik (i            Tačan profil i transparentan uvid u obradu
  roditelj)**            ličnih podataka.

  **AZLP (regulator)**   Usklađenost sa Zakonom o zaštiti podataka
                         maloljetnika.
  -----------------------------------------------------------------------

**5. Ograničenja**

- Zakon o zaštiti podataka CG --- poseban režim za maloljetnike.

- Pravna validnost digitalnih ljekarskih potvrda zahtijeva usaglašavanje
  sa Ministarstvom zdravlja.

- Integracija sa eDnevnikom uslovljena sporazumom sa Ministarstvom
  prosvjete.
