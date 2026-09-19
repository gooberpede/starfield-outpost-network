# Glossar für die deutsche Lokalisierung

## Status und Umfang

Dieses Dokument ist die verbindliche Arbeitsgrundlage für tracker-eigene Texte
in `de-DE`. Es schränkt die spätere Übersetzung des semantischen Katalogs ein,
ist aber weder dieser Katalog noch ein Wörterbuch für zur Laufzeit
zusammengesetzte Satzteile.

Bethesda-Begriffe beruhen auf den qualifizierten Identitäten in
`official-terminology-provenance.csv`. Ein Wort in einem offiziellen Satz bleibt
kontextgebundene Evidenz und wird nicht automatisch zu einem eigenständigen
Label. Als **Tracker** markierte Begriffe sind redaktionelle Entscheidungen für
das genaue Modell der Anwendung und keine offiziellen Starfield-Begriffe.

## Stil und Grammatik

- Kurze, sachliche deutsche Softwaretexte verwenden. Substantive werden groß,
  Satz- und Schaltflächentexte ansonsten nach deutscher Rechtschreibung gesetzt.
- Hilfe, Validierung, Bestätigungen und barrierefreie Anweisungen als natürliche
  deutsche Sätze formulieren; englische Wortstellung nicht mechanisch erhalten.
- Genus, Numerus, Kasus, Artikel und Komposita im jeweiligen Satz korrekt
  bilden. Die bevorzugten Formen unten sind Lemmata oder eigenständige Labels.
- Lange, semantisch korrekte Komposita nicht allein aus Platzgründen kürzen.
- Benutzernamen und als Parameter gelieferte Referenznamen unverändert erhalten.

## Produktterminologie

| Englisches Konzept | Bevorzugtes Deutsch | Status und Evidenz | Bedeutung, Kontexte und Abgrenzung |
| --- | --- | --- | --- |
| Outpost | Außenposten | **Offiziell Bethesda**, `term.outpost`; eigenständiges Label und Free-Lanes-Kontext stimmen überein. | Vom Spieler errichteter Außenposten. Maskulin: `der/ein Außenposten`. |
| Cargo Link | Frachtlink | **Offiziell Bethesda**, `term.cargo-link`; eigenständiges Label. | Vom Tracker verwalteter logistischer Endpunkt. `Frachtverbindung` und `Frachtplattform` nicht als Ersatz verwenden. |
| Inter-System Cargo Link | Intersystem-Frachtlink | **Offiziell Bethesda**, `term.inter-system-cargo-link`; eigenständiges Label. | Frachtlink zwischen Sternsystemen, der He-3 benötigt. `Intersystem` ist durch `term.inter-system` als kompakter Modifikator belegt. Nicht zu `interstellar` umformulieren. |
| Biome | Biom | **Offiziell abgeleitet / kontextgebunden**, `term.biome`. | Die Evidenz verwendet `Biom`, `Biome` und flektierte Pluralformen. Neutrum: `das Biom`; Plural `die Biome`. |
| Planet | Planet | **Offiziell abgeleitet / kontextgebunden**, `term.planet`. | Körper vom Typ Planet. Nicht als Oberbegriff für Monde und Orbitale verwenden. |
| Planetary Body | Himmelskörper | **Offiziell abgeleitet / kontextgebunden**, `term.planetary-body`. | Inklusive Tracker-Abstraktion für Planet, Mond oder Orbital. `planetarer Körper` ist offiziell belegt, aber enger und kasusabhängig; die zweite offizielle Evidenz stützt `Himmelskörper`. |
| Star System | Sternsystem | **Offiziell abgeleitet / kontextgebunden**, `term.star-system`. | `Zielsystem` und `Algorab-System` sind verkürzte Kontextformen; der vollständige offizielle Satz belegt `Sternsystem`. |
| Outpost Management | Außenposten-Verwaltung | **Offiziell Bethesda**, `skill.outpost-management`. | Name der Fähigkeit; Bindestrich und Großschreibung exakt erhalten. |
| Outpost Engineering | Außenposten-Technik | **Offiziell Bethesda**, `skill.outpost-engineering`. | Name der Fähigkeit. Nicht zu `Außenposten-Ingenieurwesen` normalisieren. |
| Planetary Habitation | Planetenbesiedlung | **Offiziell Bethesda**, `skill.planetary-habitation`. | Name der Fähigkeit. |
| Research Methods | Forschungsmethoden | **Offiziell Bethesda**, `skill.research-methods`. | Name der Fähigkeit. |
| Special Projects | Spezialprojekte | **Offiziell Bethesda**, `skill.special-projects`. | Name der Fähigkeit. |
| X-Tech | X-Tech | **Offiziell Bethesda**, `term.x-tech`. | Offizielle Ressource. Invarianter Token mit exakter Großschreibung und Bindestrich. |
| X-Tech Power Core | X-Tech-Energiekern | **Offiziell Bethesda**, `term.x-tech-power-core`; eigenständiger Gegenstandsname und alle Kontexte stimmen lexikalisch überein. | Maskulin; Artikel und Kasus im Satz flektieren, das Kompositum selbst unverändert lassen. |
| Starfield | Starfield | **Invarianter Produktname**; `term.starfield` ist im Deutschen kontextuell mehrdeutig. | Die qualifizierte Identität liefert `Sternenmeer`, eine Übersetzung der gewöhnlichen Wortbedeutung an dieser Stelle. Der Produktname bleibt immer `Starfield`. |
| Planned Supply | Geplante Versorgung | **Tracker**. | Virtuelle Zusage, dass ein Element später versorgt wird. Kein vorhandener Bestand, keine Reservierung und keine reale eingehende Fracht. Als fester Funktionsname verwenden. |
| Present | Vorhanden | **Tracker**. | Kompakte Matrixspalte: Ressource ist möglich oder ausdrücklich am Außenposten erfasst, niemals Bestandsmenge. `Aktuell` ist als zeitliche Bedeutung abzulehnen. |
| Producing | In Produktion | **Tracker**. | Konfigurierte aktive Gewinnung, Ernte oder Fertigung ohne Durchsatzangabe. `Produziert` kann Ergebnis statt Zustand bedeuten und wird als Spaltenlabel vermieden. |
| Inputs | Einsatzstoffe | **Tracker**. | Benötigte Stoffe für Rezepte oder organische Produktion. `Eingaben` ist wegen der Dateneingabe-Bedeutung abzulehnen. |
| Logistics | Logistik | **Tracker**. | Elemente, die tatsächlich einem gerouteten Frachtexport zugewiesen sind; nicht bloß exportierbare Elemente. |
| Manufacturing | Fertigung | **Tracker**. | Konfigurierte Herstellung von Produkten aus Einsatzstoffen. Durchsatz wird nicht modelliert. |
| Validation | Validierung | **Tracker**. | Gesamtheit der Fehler, Warnungen und Informationen aus den Domänenregeln. `Prüfung` darf in Sätzen vorkommen, ersetzt aber nicht den Funktionsnamen. |
| Resource Matrix | Ressourcenmatrix | **Tracker**. | Matrixansicht Vorhanden / In Produktion / Einsatzstoffe / Logistik. Als ein Kompositum schreiben. |
| Reshuffle | Neu anordnen | **Tracker**. | Modus zum Ändern der Reihenfolge öffnen. `Mischen` ist abzulehnen, weil es Zufälligkeit ausdrückt. |
| Lock order / Lock | Reihenfolge sperren | **Tracker**. | Neuordnung beenden bzw. verhindern. In barrierefreien Texten das betroffene Objekt ausdrücklich nennen. |
| Inorganic | Anorganisch | **Tracker**. | Ressourcenkategorie. In ausführlichen Überschriften `Anorganische Ressourcen`; alleinstehend nur bei eindeutigem Ressourcenkontext. |
| Organic | Organisch | **Tracker**. | Ressourcenkategorie. In ausführlichen Überschriften `Organische Ressourcen`. Organische Ernte nicht mit mineralischer Gewinnung vermischen. |
| Network | Netzwerk | **Tracker**. | Dokument aus zusammengehörigen Außenposten und Frachtlinks; nicht zwingend ein Computernetzwerk. |
| Active Production | Aktive Produktion | **Tracker**. | Oberbegriff für konfigurierte Gewinnung, Ernte oder Fertigung. |
| Source / Destination | Quelle / Ziel | **Tracker**. | Lokaler, organischer, gefertigter, importierter oder virtueller Ursprung / empfangender Außenposten eines Frachtlinks. |
| Import / Export (JSON) | Importieren / Exportieren | **Tracker**. | Dateioperationen für die gesamte Sammlung. Für Frachtflüsse nicht die Dateiverben verwenden. |
| Undo / Redo | Rückgängig / Wiederholen | **Tracker**. | Navigation in der Bearbeitungshistorie der Sitzung. |
| Error / Warning / Info | Fehler / Warnung / Information | **Tracker**. | Validierungsstufen. Eine Warnung darf durch Übersetzung nicht zum Fehler verschärft werden. |

## Offizielle Varianten und Kontextentscheidungen

- `term.planetary-body` enthält `planetaren Körpern` und `Himmelskörper`.
  Wegen der inklusiven Tracker-Abstraktion ist `Himmelskörper` das bevorzugte
  Label; die flektierte engere Form bleibt unveränderte Evidenz.
- `term.star-system` enthält `Zielsystem`, `Sternsystem` und Komposita wie
  `Algorab-System`. Eigenständig `Sternsystem` verwenden und Komposita in
  natürlichen Sätzen korrekt bilden.
- Die deutsche Beobachtung zur englischen Identität `Starfield` lautet
  `Sternenmeer`. Sie übersetzt an dieser Stelle die gewöhnliche Wortbedeutung
  und ersetzt nicht den invarianten Produktnamen.
- `Cargo Pad` hat in den freigegebenen Quellen keine aktive offizielle Evidenz.
  Der Präsentationsbegriff ist außer Gebrauch; interne Bezeichner wie
  `CargoPad` bleiben unverändert.
- Beim `X-Tech-Energiekern` sind die unterschiedlichen beobachteten Formen nur
  Artikel- und Kasusflexion. Sie stellen keine konkurrierenden Fachbegriffe dar.

## Geschützte Tokens und Abkürzungen

Exakt erhalten bleiben:

- Parameter (`{count}`, `{outpost}`, `{resource}`) und deren ASCII-Klammern;
- `He-3`, `JSON`, `FormID`, IDs, Versionsnummern und Erweiterungen wie `.json`;
- `X-Tech` und `Starfield`;
- Ressourcenabkürzungen und Tastentokens (`Ctrl`, `Shift`, `Z`, `Esc`);
- vom Benutzer eingegebene Namen und als Parameter eingesetzte Bethesda-Namen.

Für lange deutsche Begriffe keine Abkürzungen ohne separate redaktionelle
Entscheidung erfinden. Der endgültige Satz gehört der deutschen Sprache; aus
Glossareinträgen dürfen keine Sätze mechanisch zusammengesetzt werden.
