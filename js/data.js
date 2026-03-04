/* ==========================================================================
   EKW Governance Tool – Data Layer
   Manuelle Datenhaltung: EKW und EKW2 Strukturdaten
   ========================================================================== */

// Seitentypen (Zwecklabels)
const PAGE_TYPES = ["Navigation", "Übersicht", "Arbeit", "Erklärung"];

// Status-Optionen
const PAGE_STATUS = ["aktiv", "vorbereitet", "veraltet", "archivwürdig"];

// Migrations-Empfehlungen
const MIGRATION_OPTIONS = ["behalten", "zusammenführen", "archivieren", "löschen"];

// Prozess-Status
const PROCESS_STATUS = ["Entwurf", "In Prüfung", "Freigegeben"];

// Rollout-Status
const ROLLOUT_STATUS = ["geplant", "in Arbeit", "abgeschlossen", "verschoben"];

// ---------- Nutzer ----------
const USERS = [
  { id: "user-001", name: "Tim", team: "Einkauf" },
  { id: "user-002", name: "Felix", team: "Einkauf" },
  { id: "user-003", name: "Sebastian", team: "Einkauf" }
];

// ---------- Teams ----------
var TEAMS = ["Einkauf", "Sonstiges"];

// ---------- NRW Feiertage 2026-2030 ----------
const NRW_HOLIDAYS = [
  // 2026
  { date: "2026-01-01", name: "Neujahr" },
  { date: "2026-04-03", name: "Karfreitag" },
  { date: "2026-04-06", name: "Ostermontag" },
  { date: "2026-05-01", name: "Tag der Arbeit" },
  { date: "2026-05-14", name: "Christi Himmelfahrt" },
  { date: "2026-05-25", name: "Pfingstmontag" },
  { date: "2026-06-04", name: "Fronleichnam" },
  { date: "2026-10-03", name: "Tag der Dt. Einheit" },
  { date: "2026-11-01", name: "Allerheiligen" },
  { date: "2026-12-25", name: "1. Weihnachtstag" },
  { date: "2026-12-26", name: "2. Weihnachtstag" },
  // 2027
  { date: "2027-01-01", name: "Neujahr" },
  { date: "2027-03-26", name: "Karfreitag" },
  { date: "2027-03-29", name: "Ostermontag" },
  { date: "2027-05-01", name: "Tag der Arbeit" },
  { date: "2027-05-06", name: "Christi Himmelfahrt" },
  { date: "2027-05-17", name: "Pfingstmontag" },
  { date: "2027-05-27", name: "Fronleichnam" },
  { date: "2027-10-03", name: "Tag der Dt. Einheit" },
  { date: "2027-11-01", name: "Allerheiligen" },
  { date: "2027-12-25", name: "1. Weihnachtstag" },
  { date: "2027-12-26", name: "2. Weihnachtstag" },
  // 2028
  { date: "2028-01-01", name: "Neujahr" },
  { date: "2028-04-14", name: "Karfreitag" },
  { date: "2028-04-17", name: "Ostermontag" },
  { date: "2028-05-01", name: "Tag der Arbeit" },
  { date: "2028-05-25", name: "Christi Himmelfahrt" },
  { date: "2028-06-05", name: "Pfingstmontag" },
  { date: "2028-06-15", name: "Fronleichnam" },
  { date: "2028-10-03", name: "Tag der Dt. Einheit" },
  { date: "2028-11-01", name: "Allerheiligen" },
  { date: "2028-12-25", name: "1. Weihnachtstag" },
  { date: "2028-12-26", name: "2. Weihnachtstag" },
  // 2029
  { date: "2029-01-01", name: "Neujahr" },
  { date: "2029-03-30", name: "Karfreitag" },
  { date: "2029-04-02", name: "Ostermontag" },
  { date: "2029-05-01", name: "Tag der Arbeit" },
  { date: "2029-05-10", name: "Christi Himmelfahrt" },
  { date: "2029-05-21", name: "Pfingstmontag" },
  { date: "2029-05-31", name: "Fronleichnam" },
  { date: "2029-10-03", name: "Tag der Dt. Einheit" },
  { date: "2029-11-01", name: "Allerheiligen" },
  { date: "2029-12-25", name: "1. Weihnachtstag" },
  { date: "2029-12-26", name: "2. Weihnachtstag" },
  // 2030
  { date: "2030-01-01", name: "Neujahr" },
  { date: "2030-04-19", name: "Karfreitag" },
  { date: "2030-04-22", name: "Ostermontag" },
  { date: "2030-05-01", name: "Tag der Arbeit" },
  { date: "2030-05-30", name: "Christi Himmelfahrt" },
  { date: "2030-06-10", name: "Pfingstmontag" },
  { date: "2030-06-20", name: "Fronleichnam" },
  { date: "2030-10-03", name: "Tag der Dt. Einheit" },
  { date: "2030-11-01", name: "Allerheiligen" },
  { date: "2030-12-25", name: "1. Weihnachtstag" },
  { date: "2030-12-26", name: "2. Weihnachtstag" }
];

// ---------- EKW Seiten ----------
const EKW_PAGES = [
  {
    id: "ekw-001",
    title: "EK Wikipedia – Startseite",
    parentId: null,
    depth: 0,
    pageType: "Navigation",
    status: "aktiv",
    owner: "Tim",
    lastUpdated: "2024-11-01",
    versionCount: 12,
    notes: "Haupteinstiegsseite des EKW Space",
    migration: "behalten",
    viewers: ["Alle Mitarbeiter"],
    editors: ["Tim", "Felix"]
  },
  {
    id: "ekw-002",
    title: "Produktkatalog",
    parentId: "ekw-001",
    depth: 1,
    pageType: "Übersicht",
    status: "aktiv",
    owner: "Felix",
    lastUpdated: "2024-10-15",
    versionCount: 8,
    notes: "",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Felix", "Sebastian"]
  },
  {
    id: "ekw-003",
    title: "Küchenmodelle 2024",
    parentId: "ekw-002",
    depth: 2,
    pageType: "Arbeit",
    status: "aktiv",
    owner: "Felix",
    lastUpdated: "2024-09-20",
    versionCount: 15,
    notes: "Enthält alle aktuellen Modellreihen",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Felix"]
  },
  {
    id: "ekw-004",
    title: "Materialspezifikationen",
    parentId: "ekw-002",
    depth: 2,
    pageType: "Erklärung",
    status: "aktiv",
    owner: "Sebastian",
    lastUpdated: "2024-08-10",
    versionCount: 6,
    notes: "",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Sebastian"]
  },
  {
    id: "ekw-005",
    title: "Interne Prozesse",
    parentId: "ekw-001",
    depth: 1,
    pageType: "Übersicht",
    status: "aktiv",
    owner: "Tim",
    lastUpdated: "2024-07-05",
    versionCount: 10,
    notes: "",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Tim"]
  },
  {
    id: "ekw-006",
    title: "Onboarding-Leitfaden",
    parentId: "ekw-005",
    depth: 2,
    pageType: "Erklärung",
    status: "aktiv",
    owner: "Felix",
    lastUpdated: "2023-11-12",
    versionCount: 3,
    notes: "",
    migration: "zusammenführen",
    viewers: ["Einkauf"],
    editors: ["Felix"]
  },
  {
    id: "ekw-007",
    title: "Alte Preisliste 2022",
    parentId: "ekw-002",
    depth: 2,
    pageType: null,
    status: "veraltet",
    owner: null,
    lastUpdated: "2022-06-15",
    versionCount: 2,
    notes: "",
    migration: "archivieren",
    viewers: [],
    editors: []
  },
  {
    id: "ekw-008",
    title: "Qualitätssicherung",
    parentId: "ekw-005",
    depth: 2,
    pageType: "Arbeit",
    status: "aktiv",
    owner: "Sebastian",
    lastUpdated: "2024-10-28",
    versionCount: 9,
    notes: "Aktuelle QS-Prozesse und Checklisten",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Sebastian"]
  },
  {
    id: "ekw-009",
    title: "Lieferantenliste (alt)",
    parentId: "ekw-005",
    depth: 2,
    pageType: "Arbeit",
    status: "veraltet",
    owner: "Tim",
    lastUpdated: "2023-03-20",
    versionCount: 4,
    notes: "",
    migration: "löschen",
    viewers: [],
    editors: []
  },
  {
    id: "ekw-010",
    title: "Messeplanung",
    parentId: "ekw-001",
    depth: 1,
    pageType: "Übersicht",
    status: "aktiv",
    owner: "Sebastian",
    lastUpdated: "2024-06-01",
    versionCount: 7,
    notes: "",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Sebastian"]
  }
];

// ---------- EKW2 Seiten ----------
const EKW2_PAGES = [
  {
    id: "ekw2-001",
    title: "EK Wikipedia 2.0 – Startseite",
    parentId: null,
    depth: 0,
    pageType: "Navigation",
    status: "aktiv",
    owner: "Tim",
    lastUpdated: "2025-01-10",
    versionCount: 5,
    notes: "Neuer Space – Aufbau begonnen",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Tim"]
  },
  {
    id: "ekw2-002",
    title: "Produktkatalog",
    parentId: "ekw2-001",
    depth: 1,
    pageType: "Übersicht",
    status: "aktiv",
    owner: "Felix",
    lastUpdated: "2025-01-08",
    versionCount: 3,
    notes: "Migriert aus EKW",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Felix"]
  },
  {
    id: "ekw2-003",
    title: "Qualitätssicherung",
    parentId: "ekw2-001",
    depth: 1,
    pageType: "Arbeit",
    status: "aktiv",
    owner: "Sebastian",
    lastUpdated: "2025-01-05",
    versionCount: 2,
    notes: "Überarbeitet aus EKW",
    migration: "behalten",
    viewers: ["Einkauf"],
    editors: ["Sebastian"]
  }
];

// ---------- Kernprozesse (mit Workflow-Steps) ----------
const PROCESSES = [
  {
    id: "proc-001",
    name: "Lieferantenbesuche dokumentieren",
    description: "Alle Lieferantenbesuche werden im EKW unter Interne Prozesse dokumentiert.",
    status: "Freigegeben",
    bereichId: "ekw-005",
    mehrwert: "Transparente Lieferantenbewertung und Nachverfolgung",
    steps: [
      { id: "step-001a", title: "Besuch planen", description: "Termin mit Lieferant abstimmen", order: 1 },
      { id: "step-001b", title: "Besuch durchführen", description: "Vor-Ort-Prüfung und Gespräche", order: 2 },
      { id: "step-001c", title: "Bericht erstellen", description: "Ergebnisse dokumentieren", order: 3 },
      { id: "step-001d", title: "Review & Freigabe", description: "Bericht prüfen und ablegen", order: 4 }
    ]
  },
  {
    id: "proc-002",
    name: "QS-Checklisten pflegen",
    description: "Qualitätssicherungs-Checklisten werden quartalsweise aktualisiert.",
    status: "In Prüfung",
    bereichId: "ekw-005",
    mehrwert: "Einheitliche Qualitätsstandards sicherstellen",
    steps: [
      { id: "step-002a", title: "Normen prüfen", description: "Aktuelle Normen recherchieren", order: 1 },
      { id: "step-002b", title: "Checkliste aktualisieren", description: "Einträge anpassen", order: 2 },
      { id: "step-002c", title: "Freigabe einholen", description: "QS-Leitung genehmigt", order: 3 }
    ]
  },
  {
    id: "proc-003",
    name: "Produktdaten aktualisieren",
    description: "Bei jedem neuen Modell werden die Produktdatenblätter aktualisiert.",
    status: "Freigegeben",
    bereichId: "ekw-002",
    mehrwert: "Aktuelle Produktinformationen für den Vertrieb",
    steps: [
      { id: "step-003a", title: "Daten sammeln", description: "Neue Modelldaten zusammenstellen", order: 1 },
      { id: "step-003b", title: "Datenblatt erstellen", description: "Formatierung und Inhalte", order: 2 },
      { id: "step-003c", title: "Review", description: "Produktmanagement prüft", order: 3 },
      { id: "step-003d", title: "Veröffentlichen", description: "Im Katalog freischalten", order: 4 }
    ]
  },
  {
    id: "proc-004",
    name: "Messestand-Planung",
    description: "Ablauf der jährlichen Messeplanung.",
    status: "Entwurf",
    bereichId: "ekw-010",
    mehrwert: "Strukturierte und termingerechte Messevorbereitung",
    steps: [
      { id: "step-004a", title: "Konzept erstellen", description: "Standkonzept und Budget", order: 1 },
      { id: "step-004b", title: "Material bestellen", description: "Messematerialien ordern", order: 2 },
      { id: "step-004c", title: "Personal planen", description: "Standbesetzung festlegen", order: 3 }
    ]
  }
];

// ---------- Rollout-Zeitplan ----------
const ROLLOUT_ITEMS = [
  {
    id: "roll-001",
    pageId: "ekw-002",
    space: "ekw2",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    status: "geplant",
    feedbackDate: "2026-05-15",
    feedbackNotes: "Zwischen-Review mit Vertrieb",
    responsible: "Felix"
  },
  {
    id: "roll-002",
    pageId: "ekw-005",
    space: "ekw2",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    status: "geplant",
    feedbackDate: "2026-08-15",
    feedbackNotes: "Prozess-Review mit allen Abteilungen",
    responsible: "Tim"
  },
  {
    id: "roll-003",
    pageId: "ekw-008",
    space: "ekw",
    startDate: "2026-02-01",
    endDate: "2026-03-31",
    status: "in Arbeit",
    feedbackDate: "2026-03-01",
    feedbackNotes: "QS-Team Feedback einholen",
    responsible: "Sebastian"
  },
  {
    id: "roll-004",
    pageId: "ekw-010",
    space: "ekw2",
    startDate: "2027-01-15",
    endDate: "2027-06-30",
    status: "geplant",
    feedbackDate: "2027-04-01",
    feedbackNotes: "Messeplanung-Migration Review",
    responsible: "Sebastian"
  }
];

// ---------- Rollout-Checkliste ----------
var ROLLOUT_CHECKLIST = {
  rolloutStartDate: "",
  feedbackLoopDate: "",
  items: []
  // items: [{ pageId: "ekw-001", checked: false, date: "" }, ...]
};

// ---------- Session Storage Persistence ----------
function loadSessionData() {
  var savedEkw = sessionStorage.getItem("ekw_pages");
  var savedEkw2 = sessionStorage.getItem("ekw2_pages");
  var savedProc = sessionStorage.getItem("ekw_processes");
  var savedRollout = sessionStorage.getItem("ekw_rollout");
  var savedUsers = sessionStorage.getItem("ekw_users");
  var savedTeams = sessionStorage.getItem("ekw_teams");
  var savedChecklist = sessionStorage.getItem("ekw_checklist");
  if (savedEkw) {
    var parsed = JSON.parse(savedEkw);
    EKW_PAGES.length = 0;
    parsed.forEach(function(p) { EKW_PAGES.push(p); });
  }
  if (savedEkw2) {
    var parsed2 = JSON.parse(savedEkw2);
    EKW2_PAGES.length = 0;
    parsed2.forEach(function(p) { EKW2_PAGES.push(p); });
  }
  if (savedProc) {
    var parsed3 = JSON.parse(savedProc);
    PROCESSES.length = 0;
    parsed3.forEach(function(p) { PROCESSES.push(p); });
  }
  if (savedRollout) {
    var parsed4 = JSON.parse(savedRollout);
    ROLLOUT_ITEMS.length = 0;
    parsed4.forEach(function(r) { ROLLOUT_ITEMS.push(r); });
  }
  if (savedUsers) {
    var parsed5 = JSON.parse(savedUsers);
    USERS.length = 0;
    parsed5.forEach(function(u) { USERS.push(u); });
  }
  if (savedTeams) {
    var parsed6 = JSON.parse(savedTeams);
    TEAMS.length = 0;
    parsed6.forEach(function(t) { TEAMS.push(t); });
  }
  if (savedChecklist) {
    var parsed7 = JSON.parse(savedChecklist);
    ROLLOUT_CHECKLIST.rolloutStartDate = parsed7.rolloutStartDate || "";
    ROLLOUT_CHECKLIST.feedbackLoopDate = parsed7.feedbackLoopDate || "";
    ROLLOUT_CHECKLIST.items = parsed7.items || [];
  }
}

function saveSessionData() {
  sessionStorage.setItem("ekw_pages", JSON.stringify(EKW_PAGES));
  sessionStorage.setItem("ekw2_pages", JSON.stringify(EKW2_PAGES));
  sessionStorage.setItem("ekw_processes", JSON.stringify(PROCESSES));
  sessionStorage.setItem("ekw_rollout", JSON.stringify(ROLLOUT_ITEMS));
  sessionStorage.setItem("ekw_users", JSON.stringify(USERS));
  sessionStorage.setItem("ekw_teams", JSON.stringify(TEAMS));
  sessionStorage.setItem("ekw_checklist", JSON.stringify(ROLLOUT_CHECKLIST));
}

function getPages(space) {
  return space === "ekw" ? EKW_PAGES : EKW2_PAGES;
}

function findPageById(id) {
  return EKW_PAGES.find(function(p) { return p.id === id; }) || EKW2_PAGES.find(function(p) { return p.id === id; });
}

function updatePage(id, field, value) {
  var page = findPageById(id);
  if (page) {
    page[field] = value;
    saveSessionData();
  }
}

// ---------- Page CRUD ----------
function generatePageId(space) {
  var prefix = space === "ekw" ? "ekw" : "ekw2";
  var pages = getPages(space);
  var maxNum = 0;
  pages.forEach(function(p) {
    var match = p.id.match(new RegExp("^" + prefix + "-(\\d+)$"));
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  });
  return prefix + "-" + String(maxNum + 1).padStart(3, "0");
}

function addPage(space, pageData) {
  var pages = getPages(space);
  pages.push(pageData);
  saveSessionData();
}

function removePage(id) {
  removePageRecursive(id, EKW_PAGES);
  removePageRecursive(id, EKW2_PAGES);
  var procIds = PROCESSES.filter(function(p) { return p.bereichId === id; }).map(function(p) { return p.id; });
  procIds.forEach(function(pid) { removeProcess(pid); });
  // Remove rollout items for this page
  for (var i = ROLLOUT_ITEMS.length - 1; i >= 0; i--) {
    if (ROLLOUT_ITEMS[i].pageId === id) ROLLOUT_ITEMS.splice(i, 1);
  }
  saveSessionData();
}

function removePageRecursive(id, arr) {
  var children = arr.filter(function(p) { return p.parentId === id; });
  children.forEach(function(child) { removePageRecursive(child.id, arr); });
  var idx = arr.findIndex(function(p) { return p.id === id; });
  if (idx > -1) arr.splice(idx, 1);
}

// ---------- Process CRUD ----------
function getProcessesByBereich(bereichId) {
  return PROCESSES.filter(function(p) { return p.bereichId === bereichId; });
}

function addProcess(process) {
  PROCESSES.push(process);
  saveSessionData();
}

function updateProcess(id, field, value) {
  var proc = PROCESSES.find(function(p) { return p.id === id; });
  if (proc) {
    proc[field] = value;
    saveSessionData();
  }
}

function removeProcess(id) {
  var idx = PROCESSES.findIndex(function(p) { return p.id === id; });
  if (idx > -1) {
    PROCESSES.splice(idx, 1);
    saveSessionData();
  }
}

function addProcessStep(processId, step) {
  var proc = PROCESSES.find(function(p) { return p.id === processId; });
  if (proc) {
    if (!proc.steps) proc.steps = [];
    proc.steps.push(step);
    saveSessionData();
  }
}

function updateProcessStep(processId, stepId, field, value) {
  var proc = PROCESSES.find(function(p) { return p.id === processId; });
  if (proc && proc.steps) {
    var step = proc.steps.find(function(s) { return s.id === stepId; });
    if (step) {
      step[field] = value;
      saveSessionData();
    }
  }
}

function removeProcessStep(processId, stepId) {
  var proc = PROCESSES.find(function(p) { return p.id === processId; });
  if (proc && proc.steps) {
    var idx = proc.steps.findIndex(function(s) { return s.id === stepId; });
    if (idx > -1) {
      proc.steps.splice(idx, 1);
      saveSessionData();
    }
  }
}

// ---------- Rollout CRUD ----------
function addRolloutItem(item) {
  ROLLOUT_ITEMS.push(item);
  saveSessionData();
}

function updateRolloutItem(id, field, value) {
  var item = ROLLOUT_ITEMS.find(function(r) { return r.id === id; });
  if (item) {
    item[field] = value;
    saveSessionData();
  }
}

function removeRolloutItem(id) {
  var idx = ROLLOUT_ITEMS.findIndex(function(r) { return r.id === id; });
  if (idx > -1) {
    ROLLOUT_ITEMS.splice(idx, 1);
    saveSessionData();
  }
}

// ---------- User CRUD ----------
function getUserNames() {
  return USERS.map(function(u) { return u.name; });
}

function addUser(name, team) {
  USERS.push({ id: "user-" + Date.now(), name: name, team: team || "Einkauf" });
  saveSessionData();
}

function updateUser(id, field, value) {
  var user = USERS.find(function(u) { return u.id === id; });
  if (user) {
    user[field] = value;
    saveSessionData();
  }
}

function removeUser(id) {
  var idx = USERS.findIndex(function(u) { return u.id === id; });
  if (idx > -1) {
    USERS.splice(idx, 1);
    saveSessionData();
  }
}

// ---------- Checklist CRUD ----------
function getChecklistItem(pageId) {
  return ROLLOUT_CHECKLIST.items.find(function(i) { return i.pageId === pageId; });
}

function setChecklistItem(pageId, checked, date) {
  var item = getChecklistItem(pageId);
  if (item) {
    if (checked !== undefined) item.checked = checked;
    if (date !== undefined) item.date = date;
  } else {
    ROLLOUT_CHECKLIST.items.push({ pageId: pageId, checked: !!checked, date: date || "" });
  }
  saveSessionData();
}

function updateChecklistGlobalDate(field, value) {
  ROLLOUT_CHECKLIST[field] = value || "";
  saveSessionData();
}

function getChecklistProgress(pages) {
  var total = pages.length;
  if (total === 0) return { total: 0, checked: 0, pct: 0 };
  var checked = 0;
  pages.forEach(function(p) {
    var item = getChecklistItem(p.id);
    if (item && item.checked) checked++;
  });
  return { total: total, checked: checked, pct: Math.round(checked / total * 100) };
}

// ---------- Holiday Helpers ----------
function getHolidaysInRange(startDate, endDate) {
  var start = new Date(startDate);
  var end = new Date(endDate);
  return NRW_HOLIDAYS.filter(function(h) {
    var d = new Date(h.date);
    return d >= start && d <= end;
  });
}

// ---------- Hierarchy Helpers ----------
function getHierarchyLabel(depth) {
  switch (depth) {
    case 0: return "Space";
    case 1: return "Bereich";
    case 2: return "Seite";
    default: return "Unterseite";
  }
}

function getDescendantIds(parentId, pages) {
  var ids = new Set();
  function collect(pid) {
    pages.forEach(function(p) {
      if (p.parentId === pid) {
        ids.add(p.id);
        collect(p.id);
      }
    });
  }
  collect(parentId);
  return ids;
}

function isDescendantOf(page, ancestorId, allPages) {
  var current = page;
  while (current && current.parentId) {
    if (current.parentId === ancestorId) return true;
    current = allPages.find(function(p) { return p.id === current.parentId; });
  }
  return false;
}

// ---------- Rollout Helpers ----------
function getQuarter(dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  var q = Math.ceil((d.getMonth() + 1) / 3);
  return d.getFullYear() + "-Q" + q;
}

function getWeekNumber(dateStr) {
  if (!dateStr) return 0;
  var d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  var week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function getBereichForPage(pageId) {
  var page = findPageById(pageId);
  if (!page) return null;
  if (page.depth === 1) return page;
  var allPages = EKW_PAGES.concat(EKW2_PAGES);
  var current = page;
  while (current && current.parentId) {
    current = allPages.find(function(p) { return p.id === current.parentId; });
    if (current && current.depth === 1) return current;
  }
  return null;
}
