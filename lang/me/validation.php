<?php

return [
    'required' => 'Polje :attribute je obavezno.',
    'email' => 'Polje :attribute mora biti validan email.',
    'unique' => 'Vrijednost :attribute je već zauzeta.',
    'confirmed' => 'Polja se ne poklapaju.',
    'min' => [
        'string' => 'Polje :attribute mora imati najmanje :min karaktera.',
    ],
    'max' => [
        'string' => 'Polje :attribute može imati najviše :max karaktera.',
    ],
    'regex' => 'Polje :attribute nije validnog formata.',
    'date' => 'Polje :attribute mora biti validan datum.',
    'before' => 'Polje :attribute mora biti datum prije :date.',
    'accepted' => 'Polje :attribute mora biti prihvaćeno.',
    'accepted_if' => 'Polje :attribute mora biti prihvaćeno kada :other ima vrijednost :value.',
    'required_if' => 'Polje :attribute je obavezno kada :other ima vrijednost :value.',
    'required_unless' => 'Polje :attribute je obavezno osim kada :other ima jednu od vrijednosti :values.',
    'exists' => 'Izabrana vrijednost za :attribute je nevažeća.',
    'in' => 'Izabrana vrijednost za :attribute je nevažeća.',
    'attributes' => [
        'email' => 'email adresa',
        'password' => 'lozinka',
        'name' => 'ime',
        'jmb' => 'JMB',
        'school_id' => 'škola',
        'role' => 'uloga',
        'parental_consent' => 'saglasnost roditelja',
    ],
];
