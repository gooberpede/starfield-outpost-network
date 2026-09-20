# Glossario della localizzazione italiana

## Stato e ambito

Questo documento è l'autorità terminologica per i futuri testi del tracker in
`it-IT`. Vincola la successiva revisione del catalogo semantico, ma non è il
catalogo e non attiva la lingua durante l'esecuzione.

Le forme Bethesda provengono dalle identità qualificate in
`official-terminology-provenance.csv`. Il testo ufficiale è conservato
letteralmente nell'artefatto dei valori; una frase contestuale non diventa
automaticamente un'etichetta. Le voci **tracker** sono decisioni editoriali.

## Stile, maiuscole e grammatica

- Usare italiano standard conciso. Rispettare articoli, genere, numero,
  preposizioni articolate, elisione e apostrofi tipografici.
- Applicare le maiuscole italiane normali. La maiuscola della fonte ufficiale
  non va propagata nella prosa; `Starfield` e `X-Tech` restano invarianti.
- Le forme sotto sono lemmi o etichette: non concatenarle meccanicamente nei
  messaggi parametrizzati.
- Non abbreviare un termine corretto per adattarlo alla geometria attuale.

## Terminologia ufficiale e decisioni d'uso

| Concetto inglese | Classe | Forma preferita | Evidenza ufficiale | Senso, maiuscole, uso compatto e vincolo |
| --- | --- | --- | --- | --- |
| Outpost | Bethesda ufficiale | Avamposto | `term.outpost.standalone`, contesto Free Lanes | Maschile; `l'avamposto/gli avamposti`. Adatto come etichetta; vincolo semantico. |
| Cargo Link | Bethesda ufficiale | Collegamento merci | `term.cargo-link.standalone` | Entità logistica. Etichetta corretta, con moderato rischio di lunghezza. |
| Inter-System Cargo Link | Bethesda ufficiale | Collegamento merci intersistema | `term.inter-system-cargo-link.standalone` | Collegamento tra sistemi che richiede He-3. Rischio di lunghezza; non usare `interstellare`. |
| Inter-System | Ufficiale contestuale | Intersistema | `term.inter-system.context-label` | Modificatore quando l'oggetto è già noto; non imporlo globalmente. |
| Biome | Ufficiale contestuale | Bioma | cinque evidenze `term.biome.*` | Maschile; plurale `biomi`. Adatto. |
| Planet | Ufficiale contestuale | Pianeta | `term.planet.*` | Solo corpo di tipo pianeta, non termine inclusivo. |
| Planetary Body | Ufficiale contestuale | Corpo celeste | entrambe le evidenze `term.planetary-body.*` | Astrazione inclusiva per pianeta, luna od orbitale. Plurale `corpi celesti`. |
| Star System | Ufficiale contestuale | Sistema stellare | `term.star-system.full-phrase` | `Sistema` e `sistema Algorab` sono abbreviazioni contestuali. |
| Outpost Management | Bethesda ufficiale | Gestione avamposto | `skill.outpost-management.name` | Nome abilità; conservare la forma ufficiale. |
| Outpost Engineering | Bethesda ufficiale | Ingegneria avamposti | `skill.outpost-engineering.name` | Nome abilità. |
| Planetary Habitation | Bethesda ufficiale | Insediamento planetario | `skill.planetary-habitation.name` | Nome abilità. |
| Research Methods | Bethesda ufficiale | Metodi di ricerca | `skill.research-methods.name` | Nome abilità. |
| Special Projects | Bethesda ufficiale | Progetti speciali | `skill.special-projects.name` | Nome abilità. |
| X-Tech | Bethesda ufficiale | X-Tech | `term.x-tech.*` | Token invariabile. |
| X-Tech Power Core | Bethesda ufficiale | Nucleo energetico di X-Tech | `term.x-tech-power-core.item-name` | Forma autonoma. `Nucleo energetico X-Tech` è una variante contestuale; rischio di lunghezza. |
| Starfield | Marchio invariabile | Starfield | l'evidenza qualificata contiene `Campo stellare` | È il significato comune nel record, non una traduzione del titolo del prodotto. |
| Moon | Ufficiale contestuale | Luna | `term.moon.satellite-context` | Minuscola in prosa salvo inizio frase. |
| Orbital | Contestuale | Secondo la frase | `term.orbital.adjectival-context` | Evidenza solo aggettivale; nessun sostantivo globale sicuro. |
| Cargo Pad | Assenza ufficiale | Nessun termine visibile | quattro righe `term.cargo-pad.*-absence` | Termine di presentazione ritirato; gli ID interni `CargoPad` restano invariati. |

### Mappa delle fonti di evidenza

Le identità esatte (compresi `StringID` e, dove disponibili, FormID/campo)
restano in `official-terminology-provenance.csv`. In sintesi:

- `Starfield.esm / strings` fornisce etichette autonome, abilità e principali
  contesti UI; `Starfield.esm / ilstrings` fornisce prosa astronomica e altre
  varianti contestuali;
- `ShatteredSpace.esm / ilstrings` fornisce l'evidenza ambientale di `Biome`;
- `SFBGS00D.esm / strings` fornisce il nome qualificato di `X-Tech`;
- `SFBGS050.esm / strings|dlstrings|ilstrings` fornisce soltanto evidenza
  terminologica di Free Lanes, incluso `X-Tech Power Core`, e mai entità
  canoniche del tracker;
- le quattro righe di assenza di `Cargo Pad` non hanno tabella né `StringID`
  per scelta progettuale.

## Terminologia del tracker

| Concetto inglese | Classe | Forma preferita | Senso ed esclusioni | Uso compatto e strategia |
| --- | --- | --- | --- | --- |
| Planned Supply | Tracker | Fornitura pianificata | Intenzione virtuale di approvvigionamento futuro; non inventario, prenotazione o consegna. | Rischio di lunghezza; concetto semantico. |
| Present | Contestuale | Presenza | Esistenza o disponibilità possibile/registrata; mai temporale `attuale`. In frase ammette `presente` o `disponibile`. | Etichetta compatta; regola per chiave. |
| Producing | Contestuale | In produzione | Stato operativo configurato, senza portata. Azioni: `produrre` e `interrompere la produzione`. | Regola per chiave. |
| Inputs | Contestuale | Materiali richiesti | Risorse richieste da ricette o produzione organica; non campi di inserimento dati. | Rischio di lunghezza; varianti semantiche ammesse. |
| Logistics | Tracker | Logistica | Elementi assegnati a esportazioni instradate, non solo esportabili. | Adatto; per chiave. |
| Manufacturing | Tracker | Fabbricazione | Produzione configurata di prodotti da materiali; nessuna portata. | Concetto semantico. |
| Validation | Tracker | Convalida | Diagnostica di dominio con errori, avvisi e informazioni. | Concetto semantico. |
| Resource Matrix | Tracker | Matrice delle risorse | Vista di presenza, produzione, materiali e logistica. | Rischio di lunghezza; frase stabile. |
| Reshuffle | Contestuale | Riordina | Apre il riordino manuale; rifiutare `mescola`, che implica casualità. | Imperativo per chiave; `Termina riordino` in uscita. |
| Lock order / Lock | Contestuale | Blocca l'ordine | Termina o impedisce il riordino; non sicurezza o accesso. | Regola per chiave; apostrofo richiesto. |
| Inorganic / Organic | Contestuale | Inorganico / Organico | Categorie di risorse. Concordare genere e numero. | Forma breve solo con contesto; varianti ammesse. |
| Network | Tracker | Rete | Documento di avamposti e collegamenti; non necessariamente rete informatica. | Adatto; concetto semantico. |
| Active Production | Tracker | Produzione attiva | Estrazione, raccolta o fabbricazione configurata. | Rischio moderato; concetto semantico. |
| Source / Destination | Contestuale | Origine / Destinazione | Provenienza della risorsa e avamposto ricevente. Preposizioni e articoli dipendono dalla frase. | Non imporre substring globali. |
| Import / Export (JSON) | Contestuale | Importa / Esporta | Operazioni su file per l'intera raccolta, distinte dai flussi merci. | Verbi di pulsante per chiave. |
| Undo / Redo | Contestuale | Annulla / Ripeti | Navigazione nella cronologia di modifica della sessione. | Verbi di pulsante per chiave. |
| Error / Warning / Info | Tracker | Errore / Avviso / Informazione | Livelli di convalida; non trasformare un avviso in errore. | Plurali naturali nei messaggi. |

## Concetti ad alto rischio per la revisione semantica

Questi concetti richiedono contesto aggiuntivo sia per Codex sia per DeepL:

| Concetti | Rischio | Substring sicuro | Varianti attese |
| --- | --- | --- | --- |
| Planned Supply, Active Production, Resource Matrix | Confusione con scorte, portata o tabella generica. | Solo in intestazioni note. | Articoli e preposizioni. |
| Present, Producing, Inputs | Senso temporale, azione generica o input di modulo. | No. | Aggettivi, verbi, genere e numero. |
| Logistics, Manufacturing, Validation, Network | Senso di dominio ampliato o ristretto. | Non globalmente. | Integrazione naturale nella frase. |
| Reshuffle, Lock, Undo, Redo | Casuale, sicurezza o comando storico errato. | Solo etichette per chiave. | Imperativo/infinito ed elisione. |
| Source, Destination | Origine dati anziché logistica. | No. | `dell'origine`, `alla destinazione` e altre contrazioni. |

## Token protetti e rischi compatti

Conservare parametri (`{count}`), `He-3`, `JSON`, `FormID`, ID, estensioni,
tasti, `Starfield` e `X-Tech`. Presentano rischio di spazio `Collegamento merci
intersistema`, `Nucleo energetico di X-Tech`, `Materiali richiesti`, `Fornitura
pianificata`, `Matrice delle risorse` e `Blocca l'ordine`. La mitigazione fisica
è rinviata al QA, senza modifiche geometriche in questa fase.
