/* ==========================================================================
   EKW Governance Tool – Scoring & Warning Logic
   ========================================================================== */

// ---------- Helper ----------
function daysBetween(dateStr, today) {
  if (!dateStr) return 9999;
  var d = new Date(dateStr);
  var t = today || new Date();
  return Math.floor((t - d) / (1000 * 60 * 60 * 24));
}

// ---------- Potential Score (0-100) ----------
function calcPotentialScore(page) {
  var daysSince = daysBetween(page.lastUpdated, new Date());
  var recency = Math.max(0, 50 - daysSince * 0.15);
  var activity = Math.min((page.versionCount || 0) * 4, 50);
  return Math.round(recency + activity);
}

// ---------- Governance Score (0-100) ----------
function calcGovernanceScore(page) {
  var score = 0;
  if (page.pageType) score += 25;
  if (page.owner) score += 25;
  if (page.status) score += 25;
  if (page.migration) score += 25;
  return score;
}

// ---------- Score Color Class ----------
function scoreColorClass(score) {
  if (score < 40) return "score-red";
  if (score < 70) return "score-yellow";
  return "score-green";
}

// ---------- Governance Rules ----------
function runGovernanceCheck(pages) {
  var issues = [];

  pages.forEach(function(page) {
    if (!page.pageType) {
      issues.push({
        severity: "critical",
        icon: "\uD83D\uDD34",
        title: page.title,
        pageId: page.id,
        rule: "Kein Seitentyp",
        description: "Seite hat keinen zugewiesenen Seitentyp"
      });
    }

    if (!page.owner) {
      issues.push({
        severity: "warning",
        icon: "\uD83D\uDFE1",
        title: page.title,
        pageId: page.id,
        rule: "Kein Owner",
        description: "Seite hat keinen verantwortlichen Owner"
      });
    }

    var daysSince = daysBetween(page.lastUpdated, new Date());
    if (daysSince > 180 && (page.versionCount || 0) < 3) {
      issues.push({
        severity: "warning",
        icon: "\uD83D\uDFE1",
        title: page.title,
        pageId: page.id,
        rule: "Veraltet",
        description: "Letzte Aktualisierung vor " + daysSince + " Tagen, nur " + (page.versionCount || 0) + " Version(en)"
      });
    }

    if (page.parentId) {
      var parentExists = pages.some(function(p) { return p.id === page.parentId; });
      if (!parentExists) {
        issues.push({
          severity: "critical",
          icon: "\uD83D\uDD34",
          title: page.title,
          pageId: page.id,
          rule: "Verwaist",
          description: "Elternseite '" + page.parentId + "' existiert nicht"
        });
      }
    }

    if (page.status === "redundant" && !page.notes) {
      issues.push({
        severity: "warning",
        icon: "\uD83D\uDFE1",
        title: page.title,
        pageId: page.id,
        rule: "Keine Notizen bei redundant",
        description: "Redundante Seite ohne Erklärung in den Notizen"
      });
    }
  });

  return issues;
}

// ---------- Compare Logic (Pages) ----------
function buildComparison(ekwPages, ekw2Pages) {
  var result = [];
  var ekwTitles = {};
  ekwPages.forEach(function(p) { ekwTitles[p.title] = true; });

  ekwPages.forEach(function(page) {
    var match = ekw2Pages.find(function(p) { return p.title === page.title; });
    result.push({
      ekwPage: page,
      ekw2Page: match || null,
      status: match ? "both" : "ekw-only"
    });
  });

  ekw2Pages.forEach(function(page) {
    if (!ekwTitles[page.title]) {
      result.push({
        ekwPage: null,
        ekw2Page: page,
        status: "ekw2-only"
      });
    }
  });

  return result;
}

// ---------- Compare Logic (Processes) ----------
function buildProcessComparison() {
  // Collect EKW processes (linked to ekw- bereichIds)
  var ekwProcs = PROCESSES.filter(function(p) { return p.bereichId && p.bereichId.indexOf("ekw-") === 0 && p.bereichId.indexOf("ekw2-") !== 0; });
  var ekw2Procs = PROCESSES.filter(function(p) { return p.bereichId && p.bereichId.indexOf("ekw2-") === 0; });

  var result = [];
  var ekwNames = {};
  ekwProcs.forEach(function(p) { ekwNames[p.name] = true; });

  ekwProcs.forEach(function(proc) {
    var match = ekw2Procs.find(function(p) { return p.name === proc.name; });
    result.push({
      ekwProc: proc,
      ekw2Proc: match || null,
      status: match ? "both" : "ekw-only"
    });
  });

  ekw2Procs.forEach(function(proc) {
    if (!ekwNames[proc.name]) {
      result.push({
        ekwProc: null,
        ekw2Proc: proc,
        status: "ekw2-only"
      });
    }
  });

  return result;
}
