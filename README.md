# EKW Governance Tool

Lokales Analyse-Tool fuer die Confluence-Spaces EK-Wikipedia (EKW) und EK-Wikipedia 2.0 (EKW2).

## Neue Seite eintragen

Direkt im Tool ueber den **+** Button im Strukturbaum, oder manuell in `js/data.js`:

```javascript
{
  id: "ekw-011",           // Pflicht: eindeutige ID
  title: "Seitenname",     // Pflicht: Titel der Confluence-Seite
  parentId: "ekw-001",     // Pflicht: ID der Elternseite (null fuer Root)
  depth: 1,                // Pflicht: 0=Space, 1=Bereich, 2=Seite, 3+=Unterseite
  pageType: "Arbeit",      // Navigation | Uebersicht | Arbeit | Erklaerung
  status: "aktiv",         // aktiv | informativ | veraltet | redundant | archivwuerdig
  owner: "Name",           // Verantwortliche Person
  lastUpdated: "2024-01-15",
  versionCount: 5,
  notes: "",
  migration: "behalten",   // behalten | zusammenfuehren | archivieren | loeschen
  viewers: ["Vertrieb"],   // Wer darf lesen
  editors: ["Name"]        // Wer darf aendern
}
```

## Hierarchie

| Tiefe | Bezeichnung | Beschreibung |
|-------|-------------|--------------|
| 0     | Space       | Root-Seite (EK-Wikipedia) |
| 1     | Bereich     | Hauptkategorien (z.B. Produktkatalog) |
| 2     | Seite       | Inhaltsseiten eines Bereichs |
| 3+    | Unterseite  | Weitere Verschachtelung (max. 8 Ebenen) |

## Kernprozesse

Jeder Bereich (Tiefe 1) kann Kernprozesse haben. Diese werden im Side-Panel des Bereichs gepflegt.

## Export

- **CSV**: Semikolon-getrennt, UTF-8 mit BOM
- **PDF**: Oeffnet Druckvorschau im neuen Fenster (Popups erlauben)
- Verfuegbar fuer: Tabelle, Governance-Check, Vergleich, Kernprozesse
