/* ==========================================================================
   EKW Governance Tool – UI Rendering
   Tree, Table, Governance, Compare 50/50, Workflow, Timeline, Exports
   ========================================================================== */

// ---------- Helpers ----------
function typeBadgeClass(type) {
  if (!type) return "badge-none";
  var map = {
    "Navigation": "badge-navigation",
    "Übersicht": "badge-uebersicht",
    "Arbeit": "badge-arbeit",
    "Erklärung": "badge-erklaerung"
  };
  return map[type] || "badge-none";
}

function statusBadgeClass(status) {
  if (!status) return "badge-none";
  var map = {
    "aktiv": "badge-aktiv",
    "vorbereitet": "badge-vorbereitet",
    "informativ": "badge-informativ",
    "veraltet": "badge-veraltet",
    "redundant": "badge-redundant",
    "archivwürdig": "badge-archivwuerdig"
  };
  return map[status] || "badge-none";
}

function hierarchyBadgeClass(depth) {
  switch (depth) {
    case 0: return "badge-hierarchy-space";
    case 1: return "badge-hierarchy-bereich";
    case 2: return "badge-hierarchy-seite";
    default: return "badge-hierarchy-unterseite";
  }
}

function processStatusBadgeClass(status) {
  if (!status) return "badge-none";
  if (status === "Entwurf") return "badge-entwurf";
  if (status === "In Prüfung") return "badge-pruefung";
  if (status === "Freigegeben") return "badge-freigegeben";
  return "badge-none";
}

function rolloutStatusBadgeClass(status) {
  if (!status) return "badge-none";
  var map = {
    "geplant": "badge-geplant",
    "in Arbeit": "badge-in-arbeit",
    "abgeschlossen": "badge-abgeschlossen",
    "verschoben": "badge-verschoben"
  };
  return map[status] || "badge-none";
}

function renderScoreBar(score) {
  var cls = scoreColorClass(score);
  return '<div class="score-bar-container">' +
    '<div class="score-bar"><div class="score-bar-fill ' + cls + '" style="width:' + score + '%"></div></div>' +
    '<span class="score-value ' + cls + '">' + score + '</span></div>';
}

function buildOptionsHtml(options, selected, placeholder) {
  var html = '<option value="">' + (placeholder || "\u2013") + '</option>';
  options.forEach(function(opt) {
    html += '<option value="' + opt + '"' + (opt === selected ? ' selected' : '') + '>' + opt + '</option>';
  });
  return html;
}

function buildUserOptionsHtml(selected, placeholder) {
  var html = '<option value="">' + (placeholder || "\u2013 Nutzer wählen \u2013") + '</option>';
  var names = getUserNames();
  var found = false;
  names.forEach(function(name) {
    var sel = name === selected ? ' selected' : '';
    if (name === selected) found = true;
    html += '<option value="' + escapeHtml(name) + '"' + sel + '>' + escapeHtml(name) + '</option>';
  });
  if (selected && !found) {
    html += '<option value="' + escapeHtml(selected) + '" selected>' + escapeHtml(selected) + ' (extern)</option>';
  }
  return html;
}

// ---------- Tree Rendering ----------
function buildTree(pages) {
  var roots = pages.filter(function(p) { return !p.parentId; });
  var childMap = {};
  pages.forEach(function(p) {
    if (p.parentId) {
      if (!childMap[p.parentId]) childMap[p.parentId] = [];
      childMap[p.parentId].push(p);
    }
  });
  return { roots: roots, childMap: childMap };
}

function renderTreeNode(page, childMap, expandedSet, collapsedWorkflows) {
  var children = childMap[page.id] || [];
  var hasChildren = children.length > 0;
  var isExpanded = expandedSet.has(page.id);
  var depth = page.depth || 0;
  var label = getHierarchyLabel(depth);

  var html = '<div class="tree-item" data-id="' + page.id + '" data-depth="' + depth + '">';

  // Indent
  html += '<div class="tree-indent" style="width:' + (depth * 28) + 'px">';
  for (var i = 0; i < depth; i++) {
    html += '<span class="tree-line-seg"></span>';
  }
  html += '</div>';

  // Toggle
  html += '<button class="tree-toggle ' + (isExpanded ? 'expanded' : '') + ' ' + (!hasChildren && !isBereichPage(page) ? 'no-children' : '') + '" data-toggle="' + page.id + '">&#9654;</button>';

  // Hierarchy label
  html += '<span class="badge badge-sm ' + hierarchyBadgeClass(depth) + '">' + label + '</span>';

  // Title
  html += '<span class="tree-title">' + escapeHtml(page.title) + '</span>';

  // Action buttons
  html += '<div class="tree-actions">';
  if (depth < 7) {
    html += '<button class="tree-action-btn tree-add-btn" data-add-child="' + page.id + '" title="Unterseite hinzufügen">+</button>';
  }
  if (depth > 0) {
    html += '<button class="tree-action-btn tree-delete-btn" data-delete="' + page.id + '" title="Seite entfernen">&times;</button>';
  }
  html += '</div>';

  // Meta (fixed-width grid for alignment)
  html += '<div class="tree-meta">';
  html += '<span class="badge ' + typeBadgeClass(page.pageType) + '">' + (page.pageType || "Kein Typ") + '</span>';
  html += '<span class="badge ' + statusBadgeClass(page.status) + '">' + (page.status || "\u2013") + '</span>';
  html += '<span class="tree-owner">' + (page.owner || "\u2013") + '</span>';
  html += '</div>';

  html += '</div>';

  // Workflow tile for pages (depth >= 1) – shown when expanded, independently collapsible
  if (depth >= 1 && isExpanded) {
    var isWorkflowCollapsed = collapsedWorkflows && collapsedWorkflows.has(page.id);
    html += renderWorkflowTile(page, isWorkflowCollapsed);
  }

  // Children
  if (hasChildren && isExpanded) {
    html += '<div class="tree-children">';
    children.forEach(function(child) {
      html += renderTreeNode(child, childMap, expandedSet, collapsedWorkflows);
    });
    html += '</div>';
  }

  return html;
}

function isBereichPage(page) {
  return (page.depth || 0) >= 1;
}

function buildPageMoveOptions(currentBereichId) {
  var isEkw2 = currentBereichId && currentBereichId.indexOf("ekw2-") === 0;
  var pages = isEkw2 ? EKW2_PAGES : EKW_PAGES;
  var validPages = pages.filter(function(p) { return (p.depth || 0) >= 1; });
  var html = '';
  validPages.forEach(function(p) {
    var indent = '';
    for (var i = 1; i < (p.depth || 0); i++) indent += '\u00A0\u00A0';
    html += '<option value="' + p.id + '"' + (p.id === currentBereichId ? ' selected' : '') + '>' + indent + escapeHtml(p.title) + '</option>';
  });
  return html;
}

function renderTree(container, pages, expandedSet, collapsedWorkflows) {
  var data = buildTree(pages);
  if (data.roots.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">&#128466;</div><div class="empty-state-text">Keine Seiten vorhanden. Daten in data.js pflegen.</div></div>';
    return;
  }
  var html = '';
  data.roots.forEach(function(root) {
    html += renderTreeNode(root, data.childMap, expandedSet, collapsedWorkflows);
  });
  container.innerHTML = html;
}

// ---------- Workflow Tile Rendering ----------
function renderWorkflowTile(bereichPage, isCollapsed) {
  var processes = getProcessesByBereich(bereichPage.id);
  var html = '<div class="workflow-tile' + (isCollapsed ? ' workflow-tile-collapsed' : '') + '" data-bereich-id="' + bereichPage.id + '">';

  html += '<div class="workflow-tile-header">';
  html += '<button class="workflow-tile-toggle' + (isCollapsed ? '' : ' expanded') + '" data-toggle-workflow="' + bereichPage.id + '" title="Kernprozesse ein-/ausklappen">&#9654;</button>';
  html += '<span class="workflow-tile-title">&#9881; Kernprozesse: ' + escapeHtml(bereichPage.title) +
    ' <span class="workflow-tile-count">' + processes.length + '</span></span>';
  if (!isCollapsed) {
    html += '<button class="btn btn-primary btn-small" data-add-process="' + bereichPage.id + '">+ Prozess</button>';
  }
  html += '</div>';

  if (!isCollapsed) {
    if (processes.length === 0) {
      html += '<div class="empty-hint">Noch keine Kernprozesse definiert. Klicken Sie "+ Prozess" um einen anzulegen.</div>';
    } else {
      processes.forEach(function(proc) {
        html += renderWorkflowProcess(proc);
      });
    }
  }

  html += '</div>';
  return html;
}

function renderWorkflowProcess(proc) {
  var html = '<div class="workflow-process" data-process-id="' + proc.id + '">';

  // Header
  html += '<div class="workflow-process-header">';
  html += '<input class="workflow-process-name" data-process-id="' + proc.id + '" data-pfield="name" type="text" value="' + escapeHtml(proc.name || '') + '" placeholder="Prozessname">';
  html += '<span class="badge ' + processStatusBadgeClass(proc.status) + '">' + (proc.status || "\u2013") + '</span>';
  html += '<select class="panel-select" data-process-id="' + proc.id + '" data-pfield="status" style="width:auto;min-width:110px;padding:4px 8px;font-size:0.78rem">' + buildOptionsHtml(PROCESS_STATUS, proc.status, "\u2013") + '</select>';
  html += '<select class="panel-select" data-process-id="' + proc.id + '" data-pfield="bereichId" style="width:auto;min-width:120px;padding:4px 8px;font-size:0.78rem" title="Zugeordnete Seite">' + buildPageMoveOptions(proc.bereichId) + '</select>';
  html += '<button class="tree-action-btn tree-delete-btn" data-delete-process="' + proc.id + '" title="Prozess entfernen">&times;</button>';
  html += '</div>';

  // Steps as connected boxes
  html += '<div class="workflow-steps-container">';
  var steps = (proc.steps || []).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  steps.forEach(function(step, idx) {
    if (idx > 0) {
      html += '<div class="workflow-arrow">&rarr;</div>';
    }
    html += '<div class="workflow-step-box" data-step-id="' + step.id + '" data-process-id="' + proc.id + '">';
    html += '<button class="workflow-step-delete" data-delete-step="' + step.id + '" data-step-process="' + proc.id + '" title="Step entfernen">&times;</button>';
    html += '<div class="workflow-step-number">Schritt ' + (idx + 1) + '</div>';
    html += '<input class="workflow-step-title" data-step-id="' + step.id + '" data-step-process="' + proc.id + '" data-sfield="title" type="text" value="' + escapeHtml(step.title || '') + '" placeholder="Titel">';
    html += '<textarea class="workflow-step-desc" data-step-id="' + step.id + '" data-step-process="' + proc.id + '" data-sfield="description" placeholder="Beschreibung">' + escapeHtml(step.description || '') + '</textarea>';
    html += '</div>';
  });

  // Add step button
  html += '<div class="workflow-arrow">&rarr;</div>';

  // Mehrwert box
  html += '<div class="workflow-mehrwert" data-process-id="' + proc.id + '">';
  html += '<div class="workflow-mehrwert-label">Mehrwert</div>';
  html += '<textarea class="workflow-mehrwert-input" data-process-id="' + proc.id + '" data-pfield="mehrwert" placeholder="Mehrwert beschreiben">' + escapeHtml(proc.mehrwert || '') + '</textarea>';
  html += '</div>';

  html += '<button class="workflow-add-step" data-add-step="' + proc.id + '" title="Schritt hinzufügen">+</button>';
  html += '</div>';

  html += '</div>';
  return html;
}

// ---------- Table Rendering ----------
function renderTable(tbody, pages, sortKey, sortDir, filters) {
  var filtered = pages.slice();

  if (filters.bereich) {
    var descendantIds = getDescendantIds(filters.bereich, pages);
    filtered = filtered.filter(function(p) {
      return p.id === filters.bereich || descendantIds.has(p.id);
    });
  }
  if (filters.pageType) {
    filtered = filtered.filter(function(p) { return p.pageType === filters.pageType; });
  }
  if (filters.status) {
    filtered = filtered.filter(function(p) { return p.status === filters.status; });
  }
  if (filters.migration) {
    filtered = filtered.filter(function(p) { return p.migration === filters.migration; });
  }

  if (sortKey) {
    filtered.sort(function(a, b) {
      var va = a[sortKey];
      var vb = b[sortKey];
      if (va == null) va = "";
      if (vb == null) vb = "";
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--text-tertiary)">Keine Seiten gefunden</td></tr>';
    return filtered;
  }

  var html = '';
  filtered.forEach(function(page) {
    var label = getHierarchyLabel(page.depth || 0);

    html += '<tr data-id="' + page.id + '">';
    html += '<td><span class="cell-clickable" data-id="' + page.id + '">' + escapeHtml(page.title) + '</span></td>';
    html += '<td><span class="badge badge-sm ' + hierarchyBadgeClass(page.depth || 0) + '">' + label + '</span></td>';
    html += '<td><select class="cell-edit" data-id="' + page.id + '" data-field="pageType">' + buildOptionsHtml(PAGE_TYPES, page.pageType, "\u2013 Typ \u2013") + '</select></td>';
    html += '<td><select class="cell-edit" data-id="' + page.id + '" data-field="status">' + buildOptionsHtml(PAGE_STATUS, page.status, "\u2013 Status \u2013") + '</select></td>';
    html += '<td><input class="cell-edit" data-id="' + page.id + '" data-field="owner" type="text" value="' + escapeHtml(page.owner || '') + '" placeholder="Owner"></td>';
    html += '<td>' + (page.lastUpdated || "\u2013") + '</td>';
    html += '<td>' + (page.versionCount != null ? page.versionCount : "\u2013") + '</td>';
    html += '<td><select class="cell-edit" data-id="' + page.id + '" data-field="migration">' + buildOptionsHtml(MIGRATION_OPTIONS, page.migration, "\u2013 Migration \u2013") + '</select></td>';
    html += '<td>' + ((page.viewers || []).join(", ") || "\u2013") + '</td>';
    html += '<td>' + ((page.editors || []).join(", ") || "\u2013") + '</td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
  return filtered;
}

// ---------- Governance Rendering ----------
function renderGovernance(container, statsContainer, pages) {
  var allPages = EKW_PAGES.concat(EKW2_PAGES);
  var issues = runGovernanceCheck(allPages);

  var critical = issues.filter(function(i) { return i.severity === "critical"; });
  var warnings = issues.filter(function(i) { return i.severity === "warning"; });

  statsContainer.innerHTML =
    '<div class="gov-stat"><span class="gov-stat-dot critical"></span>' + critical.length + ' Kritisch</div>' +
    '<div class="gov-stat"><span class="gov-stat-dot warning"></span>' + warnings.length + ' Warnungen</div>';

  if (issues.length === 0) {
    container.innerHTML = '<div class="governance-empty">Alle Governance-Regeln erfüllt. Keine Probleme gefunden.</div>';
    return;
  }

  var html = '';

  if (critical.length > 0) {
    html += '<div class="governance-section"><div class="governance-section-title">\uD83D\uDD34 Kritisch (' + critical.length + ')</div><div class="gov-issue-list">';
    critical.forEach(function(issue) { html += renderGovIssue(issue); });
    html += '</div></div>';
  }

  if (warnings.length > 0) {
    html += '<div class="governance-section"><div class="governance-section-title">\uD83D\uDFE1 Warnungen (' + warnings.length + ')</div><div class="gov-issue-list">';
    warnings.forEach(function(issue) { html += renderGovIssue(issue); });
    html += '</div></div>';
  }

  container.innerHTML = html;
}

function renderGovIssue(issue) {
  var page = findPageById(issue.pageId);
  return '<div class="gov-issue" data-id="' + issue.pageId + '">' +
    '<span class="gov-issue-icon">' + issue.icon + '</span>' +
    '<div class="gov-issue-text"><div class="gov-issue-title">' + escapeHtml(issue.title) + '</div>' +
    '<div class="gov-issue-desc">' + issue.rule + ': ' + issue.description + '</div></div>' +
    '<span class="badge ' + typeBadgeClass(page ? page.pageType : null) + '">' + (page ? page.pageType || "\u2013" : "\u2013") + '</span></div>';
}

// ---------- Compare 50/50 Split Rendering ----------
function renderCompare5050(container, ekwPages, ekw2Pages, ekwFilter, ekw2Filter, onlyDiffs, collapsedWorkflows, expandedNodes) {
  var ekwFiltered = filterPagesByBereich(ekwPages, ekwFilter);
  var ekw2Filtered = filterPagesByBereich(ekw2Pages, ekw2Filter);

  // Build match sets for indicators
  var ekwTitles = {};
  var ekw2Titles = {};
  ekwPages.forEach(function(p) { ekwTitles[p.title] = true; });
  ekw2Pages.forEach(function(p) { ekw2Titles[p.title] = true; });

  if (onlyDiffs) {
    ekwFiltered = ekwFiltered.filter(function(p) { return !ekw2Titles[p.title]; });
    ekw2Filtered = ekw2Filtered.filter(function(p) { return !ekwTitles[p.title]; });
  }

  var html = '<div class="compare-split">';

  // Left side: EKW
  html += '<div class="compare-side">';
  html += '<div class="compare-side-header">';
  html += '<span class="compare-side-title">EK-Wikipedia (EKW)</span>';
  html += '<select class="compare-side-filter" id="compareEkwFilter">';
  html += buildBereichOptions(ekwPages, ekwFilter);
  html += '</select></div>';
  html += '<div class="compare-side-body">';
  html += renderCompareTreeSide(ekwFiltered, ekw2Titles, ekwPages, "ekw", collapsedWorkflows, expandedNodes);
  html += '</div></div>';

  // Right side: EKW2
  html += '<div class="compare-side">';
  html += '<div class="compare-side-header">';
  html += '<span class="compare-side-title">EK-Wikipedia 2.0 (EKW2)</span>';
  html += '<select class="compare-side-filter" id="compareEkw2Filter">';
  html += buildBereichOptions(ekw2Pages, ekw2Filter);
  html += '</select></div>';
  html += '<div class="compare-side-body">';
  html += renderCompareTreeSide(ekw2Filtered, ekwTitles, ekw2Pages, "ekw2", collapsedWorkflows, expandedNodes);
  html += '</div></div>';

  html += '</div>';
  container.innerHTML = html;
}

function filterPagesByBereich(pages, bereichId) {
  if (!bereichId) return pages;
  var descendantIds = getDescendantIds(bereichId, pages);
  return pages.filter(function(p) {
    return p.id === bereichId || descendantIds.has(p.id);
  });
}

function buildBereichOptions(pages, selectedId) {
  var html = '<option value="">Alle Bereiche</option>';
  var roots = pages.filter(function(p) { return !p.parentId; });
  var childMap = {};
  pages.forEach(function(p) {
    if (p.parentId) {
      if (!childMap[p.parentId]) childMap[p.parentId] = [];
      childMap[p.parentId].push(p);
    }
  });

  function addOptions(pid, indent) {
    var children = childMap[pid] || [];
    children.forEach(function(child) {
      var prefix = "";
      for (var i = 0; i < indent; i++) prefix += "\u00A0\u00A0\u00A0";
      html += '<option value="' + child.id + '"' + (child.id === selectedId ? ' selected' : '') + '>' + prefix + escapeHtml(child.title) + '</option>';
      addOptions(child.id, indent + 1);
    });
  }

  roots.forEach(function(root) {
    html += '<option value="' + root.id + '"' + (root.id === selectedId ? ' selected' : '') + '>' + escapeHtml(root.title) + '</option>';
    addOptions(root.id, 1);
  });

  return html;
}

function renderCompareTreeSide(pages, otherTitles, allPages, spaceKey, collapsedWorkflows, expandedNodes) {
  if (pages.length === 0) {
    return '<div class="compare-side-empty">Keine Seiten in dieser Auswahl</div>';
  }

  var data = buildTree(pages);
  var html = '';

  function renderNode(page, depth) {
    var indent = depth * 16;
    var hasMatch = otherTitles[page.title];
    var matchIcon = hasMatch
      ? '<span class="compare-match-icon compare-match-yes">&#10003;</span>'
      : '<span class="compare-match-icon compare-match-no">&#9679;</span>';

    var children = pages.filter(function(p) { return p.parentId === page.id; });
    var hasChildren = children.length > 0 || (page.depth || 0) >= 1; // pages with depth >= 1 can have workflow tiles
    var isExpanded = expandedNodes && expandedNodes.has(page.id);

    html += '<div class="compare-tree-item" data-page-id="' + page.id + '" style="padding-left:' + (8 + indent) + 'px">';

    // Toggle button
    if (hasChildren) {
      html += '<button class="tree-toggle compare-tree-toggle ' + (isExpanded ? 'expanded' : '') + '" data-compare-toggle="' + page.id + '">&#9654;</button>';
    } else {
      html += '<span class="tree-toggle no-children"></span>';
    }

    html += '<span class="badge badge-sm ' + hierarchyBadgeClass(page.depth || 0) + '">' + getHierarchyLabel(page.depth || 0) + '</span>';
    html += '<span class="compare-tree-title">' + escapeHtml(page.title) + '</span>';
    html += '<span class="badge badge-sm ' + statusBadgeClass(page.status) + '">' + (page.status || "\u2013") + '</span>';
    html += '<span class="tree-owner" style="min-width:80px;text-align:right">' + (page.owner || "\u2013") + '</span>';

    // Action buttons
    html += '<div class="compare-tree-actions">';
    if ((page.depth || 0) < 7) {
      html += '<button class="tree-action-btn tree-add-btn" data-compare-add-page="' + page.id + '" data-compare-space="' + spaceKey + '" title="Unterseite hinzufügen">+</button>';
    }
    if ((page.depth || 0) > 0) {
      html += '<button class="tree-action-btn tree-delete-btn" data-compare-delete-page="' + page.id + '" title="Seite entfernen">&times;</button>';
    }
    html += '</div>';

    html += matchIcon;
    html += '</div>';

    // Only show children and workflow if expanded
    if (isExpanded) {
      // Workflow tile for pages (depth >= 1)
      if ((page.depth || 0) >= 1) {
        var isWfCollapsed = collapsedWorkflows && collapsedWorkflows.has(page.id);
        html += renderCompareWorkflowTile(page, isWfCollapsed);
      }

      // Render children
      children.forEach(function(child) {
        renderNode(child, depth + 1);
      });
    }
  }

  data.roots.forEach(function(root) {
    renderNode(root, 0);
  });

  return html;
}

// ---------- Compare Workflow Tile (compact, editable) ----------
function renderCompareWorkflowTile(bereichPage, isCollapsed) {
  var processes = getProcessesByBereich(bereichPage.id);
  var html = '<div class="compare-workflow-tile' + (isCollapsed ? ' workflow-tile-collapsed' : '') + '" data-bereich-id="' + bereichPage.id + '">';

  html += '<div class="compare-workflow-header">';
  html += '<button class="workflow-tile-toggle' + (isCollapsed ? '' : ' expanded') + '" data-toggle-workflow="' + bereichPage.id + '" title="Kernprozesse ein-/ausklappen">&#9654;</button>';
  html += '<span class="compare-workflow-title">&#9881; Kernprozesse <span class="workflow-tile-count">' + processes.length + '</span></span>';
  if (!isCollapsed) {
    html += '<button class="btn btn-primary btn-small" data-add-process="' + bereichPage.id + '">+ Prozess</button>';
  }
  html += '</div>';

  if (!isCollapsed) {
    if (processes.length === 0) {
      html += '<div class="empty-hint" style="padding:8px 12px;font-size:0.75rem">Keine Kernprozesse definiert.</div>';
    } else {
      processes.forEach(function(proc) {
        html += renderCompareWorkflowProcess(proc);
      });
    }
  }

  html += '</div>';
  return html;
}

function renderCompareWorkflowProcess(proc) {
  var html = '<div class="compare-workflow-process" data-process-id="' + proc.id + '">';

  // Header line
  html += '<div class="compare-workflow-process-header">';
  html += '<input class="workflow-process-name" data-process-id="' + proc.id + '" data-pfield="name" type="text" value="' + escapeHtml(proc.name || '') + '" placeholder="Prozessname" style="flex:1;font-size:0.78rem;padding:2px 4px;border:1px solid transparent;border-radius:3px;background:transparent;font-family:var(--font-sans)">';
  html += '<select class="panel-select" data-process-id="' + proc.id + '" data-pfield="status" style="width:auto;min-width:90px;padding:2px 6px;font-size:0.72rem">' + buildOptionsHtml(PROCESS_STATUS, proc.status, "\u2013") + '</select>';
  html += '<select class="panel-select" data-process-id="' + proc.id + '" data-pfield="bereichId" style="width:auto;min-width:90px;padding:2px 6px;font-size:0.72rem" title="Zugeordnete Seite">' + buildPageMoveOptions(proc.bereichId) + '</select>';
  html += '<button class="tree-action-btn tree-delete-btn" data-delete-process="' + proc.id + '" title="Prozess entfernen" style="width:18px;height:18px;font-size:0.7rem">&times;</button>';
  html += '</div>';

  // Steps as compact connected boxes
  html += '<div class="compare-workflow-steps">';
  var steps = (proc.steps || []).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  steps.forEach(function(step, idx) {
    if (idx > 0) {
      html += '<span class="compare-workflow-arrow">&rarr;</span>';
    }
    html += '<div class="compare-workflow-step" data-step-id="' + step.id + '" data-process-id="' + proc.id + '">';
    html += '<button class="workflow-step-delete" data-delete-step="' + step.id + '" data-step-process="' + proc.id + '" title="Step entfernen" style="width:14px;height:14px;font-size:0.6rem;top:2px;right:2px">&times;</button>';
    html += '<input class="workflow-step-title" data-step-id="' + step.id + '" data-step-process="' + proc.id + '" data-sfield="title" type="text" value="' + escapeHtml(step.title || '') + '" placeholder="Step" style="font-size:0.7rem;padding:1px 3px">';
    html += '</div>';
  });

  // Mehrwert compact
  if (steps.length > 0) {
    html += '<span class="compare-workflow-arrow">&rarr;</span>';
  }
  html += '<div class="compare-workflow-mehrwert">';
  html += '<input class="workflow-mehrwert-input" data-process-id="' + proc.id + '" data-pfield="mehrwert" type="text" value="' + escapeHtml(proc.mehrwert || '') + '" placeholder="Mehrwert" style="font-size:0.7rem;padding:1px 3px;border:1px solid transparent;border-radius:3px;background:transparent;width:100%">';
  html += '</div>';

  html += '<button class="workflow-add-step" data-add-step="' + proc.id + '" title="Schritt hinzufügen" style="width:22px;height:22px;font-size:0.8rem;min-width:22px;margin-top:0">+</button>';
  html += '</div>';

  html += '</div>';
  return html;
}

// ---------- Process Comparison Rendering ----------
function renderProcessComparison(container) {
  // Gather pages that have processes or are depth 1 (section headers)
  function getRelevantPages(spacePages) {
    return spacePages.filter(function(p) {
      return (p.depth || 0) >= 1 && (getProcessesByBereich(p.id).length > 0 || p.depth === 1);
    });
  }

  var ekwRelevant = getRelevantPages(EKW_PAGES);
  var ekw2Relevant = getRelevantPages(EKW2_PAGES);

  // Build cross-reference maps
  var ekw2Names = {};
  var ekwNames = {};
  PROCESSES.filter(function(p) { return p.bereichId && p.bereichId.indexOf("ekw2-") === 0; }).forEach(function(p) { ekw2Names[p.name] = true; });
  PROCESSES.filter(function(p) { return p.bereichId && p.bereichId.indexOf("ekw-") === 0 && p.bereichId.indexOf("ekw2-") !== 0; }).forEach(function(p) { ekwNames[p.name] = true; });

  function renderSide(pages, crossNames, label, emptyMsg) {
    var html = '<div class="process-compare-side">';
    html += '<div class="process-compare-header">' + label + '</div>';
    var hasProcs = false;
    pages.forEach(function(page) {
      var procs = getProcessesByBereich(page.id);
      var indent = Math.max(0, (page.depth || 1) - 1) * 16;
      html += '<div class="process-compare-bereich-header" style="padding-left:' + (12 + indent) + 'px">';
      html += '<span class="badge badge-sm ' + hierarchyBadgeClass(page.depth || 0) + '">' + getHierarchyLabel(page.depth || 0) + '</span> ';
      html += escapeHtml(page.title);
      html += ' <button class="btn btn-primary btn-small" data-add-process="' + page.id + '" style="margin-left:8px;padding:2px 8px;font-size:0.68rem">+ Prozess</button>';
      html += '</div>';
      if (procs.length > 0) hasProcs = true;
      procs.forEach(function(proc) {
        html += renderProcessCompareItem(proc, crossNames[proc.name]);
      });
    });
    if (!hasProcs) {
      html += '<div class="process-compare-empty">' + emptyMsg + '</div>';
    }
    html += '</div>';
    return html;
  }

  var html = '<div class="process-compare-split">';
  html += renderSide(ekwRelevant, ekw2Names, "EK-Wikipedia (EKW)", "Keine Prozesse in EKW");
  html += renderSide(ekw2Relevant, ekwNames, "EK-Wikipedia 2.0 (EKW2)", "Keine Prozesse in EKW2");
  html += '</div>';
  container.innerHTML = html;
}

function renderProcessCompareItem(proc, hasMatch) {
  var steps = (proc.steps || []).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  var matchIcon = hasMatch
    ? '<span class="compare-match-icon compare-match-yes">&#10003;</span>'
    : '<span class="compare-match-icon compare-match-no">&#9679;</span>';

  var html = '<div class="process-compare-item" data-process-id="' + proc.id + '">';

  // Name + status (editable)
  html += '<div class="process-compare-name">' + matchIcon;
  html += '<input class="workflow-process-name" data-process-id="' + proc.id + '" data-pfield="name" type="text" value="' + escapeHtml(proc.name || '') + '" placeholder="Prozessname" style="flex:1;font-size:0.82rem;font-weight:600;padding:2px 4px;border:1px solid transparent;border-radius:3px;background:transparent;font-family:var(--font-sans)">';
  html += '<select class="panel-select" data-process-id="' + proc.id + '" data-pfield="status" style="width:auto;min-width:90px;padding:2px 6px;font-size:0.72rem">' + buildOptionsHtml(PROCESS_STATUS, proc.status, "\u2013") + '</select>';
  html += '<select class="panel-select" data-process-id="' + proc.id + '" data-pfield="bereichId" style="width:auto;min-width:90px;padding:2px 6px;font-size:0.72rem" title="Zugeordnete Seite">' + buildPageMoveOptions(proc.bereichId) + '</select>';
  html += '<button class="tree-action-btn tree-delete-btn" data-delete-process="' + proc.id + '" title="Prozess entfernen">&times;</button>';
  html += '</div>';

  // Steps compact display
  html += '<div class="compare-workflow-steps" style="margin-top:4px">';
  steps.forEach(function(step, idx) {
    if (idx > 0) html += '<span class="compare-workflow-arrow">&rarr;</span>';
    html += '<div class="compare-workflow-step" data-step-id="' + step.id + '" data-process-id="' + proc.id + '">';
    html += '<button class="workflow-step-delete" data-delete-step="' + step.id + '" data-step-process="' + proc.id + '" title="Step entfernen" style="width:14px;height:14px;font-size:0.6rem;top:2px;right:2px">&times;</button>';
    html += '<input class="workflow-step-title" data-step-id="' + step.id + '" data-step-process="' + proc.id + '" data-sfield="title" type="text" value="' + escapeHtml(step.title || '') + '" placeholder="Step" style="font-size:0.7rem;padding:1px 3px">';
    html += '</div>';
  });
  if (steps.length > 0) html += '<span class="compare-workflow-arrow">&rarr;</span>';
  html += '<div class="compare-workflow-mehrwert">';
  html += '<input class="workflow-mehrwert-input" data-process-id="' + proc.id + '" data-pfield="mehrwert" type="text" value="' + escapeHtml(proc.mehrwert || '') + '" placeholder="Mehrwert" style="font-size:0.7rem;padding:1px 3px;border:1px solid transparent;border-radius:3px;background:transparent;width:100%">';
  html += '</div>';
  html += '<button class="workflow-add-step" data-add-step="' + proc.id + '" title="Schritt hinzufügen" style="width:22px;height:22px;font-size:0.8rem;min-width:22px;margin-top:0">+</button>';
  html += '</div>';

  html += '</div>';
  return html;
}

// ---------- Timeline Rendering ----------
function renderZeitplanTimeline(container, items, filters, range) {
  var filtered = filterRolloutItems(items, filters);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="timeline-container"><div class="empty-hint" style="padding:40px">Keine Rollout-Einträge vorhanden. Klicken Sie "+ Rollout" um einen zu erstellen.</div></div>';
    return;
  }

  // Determine date range from range selectors or data
  var minDate, maxDate;

  if (range && range.fromMonth !== null && range.fromYear !== null &&
      range.toMonth !== null && range.toYear !== null) {
    minDate = new Date(range.fromYear, range.fromMonth, 1);
    maxDate = new Date(range.toYear, range.toMonth + 1, 0); // last day of toMonth
  } else {
    var allDates = [];
    filtered.forEach(function(item) {
      if (item.startDate) allDates.push(new Date(item.startDate));
      if (item.endDate) allDates.push(new Date(item.endDate));
    });
    if (allDates.length === 0) {
      container.innerHTML = '<div class="timeline-container"><div class="empty-hint" style="padding:40px">Keine Daten für die Zeitleiste vorhanden.</div></div>';
      return;
    }
    minDate = new Date(Math.min.apply(null, allDates));
    maxDate = new Date(Math.max.apply(null, allDates));
    minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
  }

  // Ensure minDate < maxDate
  if (minDate >= maxDate) {
    maxDate = new Date(minDate.getFullYear(), minDate.getMonth() + 1, 0);
  }

  var monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  var totalDays = Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24));
  if (totalDays <= 0) totalDays = 1;

  // Group by Bereich
  var groupedItems = {};
  var groupOrder = [];
  filtered.forEach(function(item) {
    var bereich = getBereichForPage(item.pageId);
    var key = bereich ? bereich.title : "Sonstige";
    if (!groupedItems[key]) { groupedItems[key] = []; groupOrder.push(key); }
    groupedItems[key].push(item);
  });

  // Build months array for header
  var months = [];
  var cur = new Date(minDate);
  while (cur <= maxDate) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  var html = '<div class="timeline-container">';

  // Header: months
  html += '<div class="timeline-header">';
  html += '<div class="timeline-label-col">Seite</div>';
  html += '<div class="timeline-months">';
  months.forEach(function(m, idx) {
    var daysInMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    var monthStart = new Date(m.getFullYear(), m.getMonth(), 1);
    var monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    // clamp to actual range
    var effStart = monthStart < minDate ? minDate : monthStart;
    var effEnd = monthEnd > maxDate ? maxDate : monthEnd;
    var effDays = Math.round((effEnd - effStart) / (1000 * 60 * 60 * 24)) + 1;
    var widthPct = effDays / totalDays * 100;

    html += '<div class="timeline-month" style="width:' + widthPct + '%">';
    html += '<span class="timeline-month-name">' + monthNames[m.getMonth()] + ' ' + m.getFullYear() + '</span>';
    html += '</div>';
  });
  html += '</div></div>';

  // Today marker
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var todayMarkHtml = '';
  if (today >= minDate && today <= maxDate) {
    var todayPct = (today - minDate) / (1000 * 60 * 60 * 24) / totalDays * 100;
    todayMarkHtml = '<div class="timeline-today-line" style="left:' + todayPct + '%" title="Heute"></div>';
  }

  // Month grid lines
  var gridLinesHtml = '';
  months.forEach(function(m) {
    var mStart = new Date(m.getFullYear(), m.getMonth(), 1);
    if (mStart > minDate && mStart <= maxDate) {
      var pct = (mStart - minDate) / (1000 * 60 * 60 * 24) / totalDays * 100;
      gridLinesHtml += '<div class="timeline-grid-line" style="left:' + pct + '%"></div>';
    }
  });

  // Body
  html += '<div class="timeline-body">';

  groupOrder.forEach(function(groupName) {
    html += '<div class="timeline-swimlane">';
    html += '<div class="timeline-swimlane-header">' + escapeHtml(groupName) + '</div>';

    groupedItems[groupName].forEach(function(item) {
      var page = findPageById(item.pageId);
      var pageTitle = page ? page.title : item.pageId;

      html += '<div class="timeline-row">';
      html += '<div class="timeline-row-label" title="' + escapeHtml(pageTitle) + '">' + escapeHtml(pageTitle) + '</div>';
      html += '<div class="timeline-row-track">';

      // Grid lines + today marker
      html += gridLinesHtml;
      html += todayMarkHtml;

      // Calculate bar position
      if (item.startDate && item.endDate) {
        var start = new Date(item.startDate);
        var end = new Date(item.endDate);
        var startPct = Math.max(0, (start - minDate) / (1000 * 60 * 60 * 24) / totalDays * 100);
        var endPct = Math.min(100, (end - minDate) / (1000 * 60 * 60 * 24) / totalDays * 100);
        var widthPct = Math.max(1.5, endPct - startPct);
        var statusClass = "bar-status-" + (item.status || "geplant").replace(/\s+/g, "-");

        html += '<div class="timeline-bar ' + statusClass + '" style="left:' + startPct + '%;width:' + widthPct + '%" title="' + escapeHtml(pageTitle) + '\n' + item.startDate + ' – ' + item.endDate + '\nStatus: ' + (item.status || "–") + '\nVerantwortlich: ' + escapeHtml(item.responsible || "–") + '">';
        html += '<span class="timeline-bar-label">' + escapeHtml(pageTitle) + '</span>';
        html += '</div>';

        // Feedback diamond
        if (item.feedbackDate) {
          var fbDate = new Date(item.feedbackDate);
          var fbPct = (fbDate - minDate) / (1000 * 60 * 60 * 24) / totalDays * 100;
          if (fbPct >= 0 && fbPct <= 100) {
            html += '<div class="timeline-feedback" style="left:' + fbPct + '%" title="Feedback ' + item.feedbackDate + ': ' + escapeHtml(item.feedbackNotes || '') + '">&#9670;</div>';
          }
        }
      }

      html += '</div></div>';
    });

    html += '</div>';
  });

  html += '</div></div>';
  container.innerHTML = html;
}

// ---------- Rollout List Rendering ----------
function renderZeitplanList(container, items, filters) {
  var filtered = filterRolloutItems(items, filters);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="rollout-list-container"><div class="empty-hint" style="padding:40px">Keine Rollout-Einträge vorhanden.</div></div>';
    return;
  }

  var html = '<div class="rollout-list-container"><table class="rollout-table"><thead><tr>';
  html += '<th>Seite</th><th>Space</th><th>Bereich</th><th>Start</th><th>Ende</th>';
  html += '<th>Status</th><th>Verantwortlich</th><th>Feedback</th><th>Aktionen</th>';
  html += '</tr></thead><tbody>';

  filtered.forEach(function(item) {
    var page = findPageById(item.pageId);
    var pageTitle = page ? page.title : item.pageId;
    var bereich = getBereichForPage(item.pageId);
    var bereichTitle = bereich ? bereich.title : "\u2013";
    var spaceLabel = item.space === "ekw2" ? "EKW2" : "EKW";

    html += '<tr data-rollout-id="' + item.id + '">';
    html += '<td>' + escapeHtml(pageTitle) + '</td>';
    html += '<td><span class="badge badge-sm ' + (item.space === "ekw2" ? "badge-archivwuerdig" : "badge-informativ") + '">' + spaceLabel + '</span></td>';
    html += '<td>' + escapeHtml(bereichTitle) + '</td>';
    html += '<td>' + (item.startDate || "\u2013") + '</td>';
    html += '<td>' + (item.endDate || "\u2013") + '</td>';
    html += '<td><span class="badge badge-sm ' + rolloutStatusBadgeClass(item.status) + '">' + (item.status || "\u2013") + '</span></td>';
    html += '<td>' + escapeHtml(item.responsible || "\u2013") + '</td>';
    html += '<td>' + (item.feedbackDate || "\u2013") + (item.feedbackNotes ? ' - ' + escapeHtml(item.feedbackNotes).substring(0, 30) : '') + '</td>';
    html += '<td><button class="tree-action-btn tree-delete-btn" data-delete-rollout="' + item.id + '" title="Löschen">&times;</button></td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function filterRolloutItems(items, filters) {
  var result = items.slice();

  if (filters.space) {
    result = result.filter(function(r) { return r.space === filters.space; });
  }
  if (filters.bereich) {
    result = result.filter(function(r) {
      var bereich = getBereichForPage(r.pageId);
      return bereich && bereich.id === filters.bereich;
    });
  }
  if (filters.status) {
    result = result.filter(function(r) { return r.status === filters.status; });
  }

  return result;
}

// ---------- Rollout Checkliste Rendering ----------
function renderRolloutChecklist(container) {
  var html = '<div class="checklist-container">';

  // Header with global dates and overall progress
  var allPages = EKW_PAGES.concat(EKW2_PAGES);
  var overallProgress = getChecklistProgress(allPages);

  html += '<div class="checklist-header">';
  html += '<div class="checklist-header-left">';
  html += '<h3 class="checklist-title">Rollout Kontrollzentrum</h3>';
  html += '<div class="checklist-overall-progress">';
  html += '<div class="checklist-progress-bar"><div class="checklist-progress-fill" style="width:' + overallProgress.pct + '%"></div></div>';
  html += '<span class="checklist-progress-text">' + overallProgress.checked + ' / ' + overallProgress.total + ' (' + overallProgress.pct + '%)</span>';
  html += '</div>';
  html += '</div>';
  html += '<div class="checklist-header-right">';
  html += '<div class="checklist-date-field">';
  html += '<label class="checklist-date-label">Rollout-Start</label>';
  html += '<input class="panel-input checklist-global-date" data-checklist-global="rolloutStartDate" type="date" value="' + (ROLLOUT_CHECKLIST.rolloutStartDate || '') + '">';
  html += '</div>';
  html += '<div class="checklist-date-field">';
  html += '<label class="checklist-date-label">Feedback-Schleife</label>';
  html += '<input class="panel-input checklist-global-date" data-checklist-global="feedbackLoopDate" type="date" value="' + (ROLLOUT_CHECKLIST.feedbackLoopDate || '') + '">';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // EKW Section
  html += renderChecklistSpace("EK-Wikipedia (EKW)", EKW_PAGES);

  // EKW2 Section
  html += renderChecklistSpace("EK-Wikipedia 2.0 (EKW2)", EKW2_PAGES);

  html += '</div>';
  container.innerHTML = html;
}

function renderChecklistSpace(spaceTitle, pages) {
  var spaceProgress = getChecklistProgress(pages);
  var html = '<div class="checklist-space">';
  html += '<div class="checklist-space-header">';
  html += '<span class="checklist-space-title">' + escapeHtml(spaceTitle) + '</span>';
  html += '<div class="checklist-progress-bar checklist-progress-sm"><div class="checklist-progress-fill" style="width:' + spaceProgress.pct + '%"></div></div>';
  html += '<span class="checklist-progress-text-sm">' + spaceProgress.checked + '/' + spaceProgress.total + '</span>';
  html += '</div>';

  var tree = buildTree(pages);
  tree.roots.forEach(function(root) {
    html += renderChecklistNode(root, pages, 0);
  });

  html += '</div>';
  return html;
}

function renderChecklistNode(page, allPages, depth) {
  var children = allPages.filter(function(p) { return p.parentId === page.id; });
  var item = getChecklistItem(page.id);
  var isChecked = item && item.checked;
  var itemDate = item ? item.date || "" : "";
  var label = getHierarchyLabel(page.depth || 0);

  // Calculate sub-tree progress for bereiche
  var subProgress = null;
  if (children.length > 0) {
    var descendants = [page];
    function collectAll(pid) {
      allPages.forEach(function(p) {
        if (p.parentId === pid) { descendants.push(p); collectAll(p.id); }
      });
    }
    collectAll(page.id);
    subProgress = getChecklistProgress(descendants);
  }

  var html = '<div class="checklist-item" data-depth="' + depth + '" style="padding-left:' + (depth * 24 + 12) + 'px">';

  // Checkbox
  html += '<label class="checklist-checkbox-wrap">';
  html += '<input type="checkbox" class="checklist-check" data-checklist-page="' + page.id + '"' + (isChecked ? ' checked' : '') + '>';
  html += '<span class="checklist-checkmark"></span>';
  html += '</label>';

  // Hierarchy badge
  html += '<span class="badge badge-sm ' + hierarchyBadgeClass(page.depth || 0) + '">' + label + '</span>';

  // Title
  html += '<span class="checklist-item-title' + (isChecked ? ' checklist-checked' : '') + '">' + escapeHtml(page.title) + '</span>';

  // Status badge
  html += '<span class="badge badge-sm ' + statusBadgeClass(page.status) + '">' + (page.status || "\u2013") + '</span>';

  // Owner
  html += '<span class="checklist-item-owner">' + escapeHtml(page.owner || "\u2013") + '</span>';

  // Sub-progress for bereiche
  if (subProgress) {
    html += '<div class="checklist-progress-bar checklist-progress-xs"><div class="checklist-progress-fill" style="width:' + subProgress.pct + '%"></div></div>';
    html += '<span class="checklist-progress-text-xs">' + subProgress.checked + '/' + subProgress.total + '</span>';
  }

  // Date input
  html += '<input type="date" class="checklist-date-input" data-checklist-date="' + page.id + '" value="' + itemDate + '" title="Rollout-Datum">';

  html += '</div>';

  // Render children
  children.forEach(function(child) {
    html += renderChecklistNode(child, allPages, depth + 1);
  });

  return html;
}

// ---------- Side Panel Rendering ----------
function renderSidePanel(panelBody, page) {
  var html = '<div class="panel-field"><div class="panel-field-label">ID</div><div class="panel-field-value">' + page.id + '</div></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Ebene</div>' +
    '<div class="panel-field-value"><span class="badge badge-sm ' + hierarchyBadgeClass(page.depth || 0) + '">' + getHierarchyLabel(page.depth || 0) + '</span> (Tiefe ' + (page.depth || 0) + ')</div></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Titel</div>' +
    '<input class="panel-input" data-id="' + page.id + '" data-field="title" type="text" value="' + escapeHtml(page.title) + '"></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Seitentyp</div>' +
    '<select class="panel-select" data-id="' + page.id + '" data-field="pageType">' + buildOptionsHtml(PAGE_TYPES, page.pageType, "\u2013 Seitentyp wählen \u2013") + '</select></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Status</div>' +
    '<select class="panel-select" data-id="' + page.id + '" data-field="status">' + buildOptionsHtml(PAGE_STATUS, page.status, "\u2013 Status wählen \u2013") + '</select></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Owner</div>' +
    '<select class="panel-select" data-id="' + page.id + '" data-field="owner">' + buildUserOptionsHtml(page.owner) + '</select></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Letzte Aktualisierung</div>' +
    '<input class="panel-input" data-id="' + page.id + '" data-field="lastUpdated" type="date" value="' + (page.lastUpdated || '') + '"></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Versionen</div>' +
    '<input class="panel-input" data-id="' + page.id + '" data-field="versionCount" type="number" min="0" value="' + (page.versionCount || 0) + '"></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Migration</div>' +
    '<select class="panel-select" data-id="' + page.id + '" data-field="migration">' + buildOptionsHtml(MIGRATION_OPTIONS, page.migration, "\u2013 Migration wählen \u2013") + '</select></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Notizen</div>' +
    '<textarea class="panel-textarea" data-id="' + page.id + '" data-field="notes">' + escapeHtml(page.notes || '') + '</textarea></div>';

  // Viewers & Editors
  html += '<div class="panel-section-divider"></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Betrachter (Viewers)</div>' +
    '<input class="panel-input" data-id="' + page.id + '" data-field="viewers" type="text" value="' + escapeHtml((page.viewers || []).join(", ")) + '" placeholder="Namen, kommagetrennt">' +
    '<div class="panel-field-hint">Kommagetrennte Liste</div></div>';

  html += '<div class="panel-field"><div class="panel-field-label">Bearbeiter (Editors)</div>' +
    '<input class="panel-input" data-id="' + page.id + '" data-field="editors" type="text" value="' + escapeHtml((page.editors || []).join(", ")) + '" placeholder="Namen, kommagetrennt">' +
    '<div class="panel-field-hint">Kommagetrennte Liste</div></div>';

  panelBody.innerHTML = html;
}

// ---------- Zuständigkeiten Rendering ----------
function renderZustaendigkeiten(container, view, filters) {
  var allPages = EKW_PAGES.concat(EKW2_PAGES);
  var pages = allPages;

  // Apply space filter
  if (filters.space === "ekw") pages = EKW_PAGES.slice();
  else if (filters.space === "ekw2") pages = EKW2_PAGES.slice();

  // Apply bereich filter
  if (filters.bereich) {
    pages = pages.filter(function(p) {
      return p.id === filters.bereich || isDescendantOf(p, filters.bereich, allPages) || p.depth === 1 && p.id === filters.bereich;
    });
  }

  if (view === "person") {
    renderZustByPerson(container, pages, filters);
  } else if (view === "page") {
    renderZustByPage(container, pages, filters);
  } else {
    renderZustDistribution(container, pages);
  }
}

function renderZustByPerson(container, pages, filters) {
  var personSearch = (filters.person || "").toLowerCase();
  // Build person -> pages map
  var personMap = {};

  pages.forEach(function(p) {
    var spaceLabel = p.id.indexOf("ekw2-") === 0 ? "EKW2" : "EKW";
    // Owner
    if (p.owner) {
      if (!personMap[p.owner]) personMap[p.owner] = { owned: [], viewing: [], editing: [] };
      personMap[p.owner].owned.push({ page: p, space: spaceLabel });
    }
    // Viewers
    (p.viewers || []).forEach(function(v) {
      if (!personMap[v]) personMap[v] = { owned: [], viewing: [], editing: [] };
      personMap[v].viewing.push({ page: p, space: spaceLabel });
    });
    // Editors
    (p.editors || []).forEach(function(e) {
      if (!personMap[e]) personMap[e] = { owned: [], viewing: [], editing: [] };
      personMap[e].editing.push({ page: p, space: spaceLabel });
    });
  });

  var persons = Object.keys(personMap).sort();
  if (personSearch) {
    persons = persons.filter(function(name) { return name.toLowerCase().indexOf(personSearch) !== -1; });
  }

  if (persons.length === 0) {
    container.innerHTML = '<div class="empty-hint" style="padding:40px">Keine Zuständigkeiten gefunden.</div>';
    return;
  }

  var html = '<div class="zustaendigkeiten-container">';
  persons.forEach(function(name) {
    var data = personMap[name];
    var isUser = USERS.some(function(u) { return u.name === name; });
    html += '<div class="zustaendigkeiten-person-card">';
    html += '<div class="zustaendigkeiten-person-header">';
    html += '<span class="zustaendigkeiten-person-name">' + escapeHtml(name) + '</span>';
    if (!isUser) html += '<span class="badge badge-sm badge-veraltet">Extern</span>';
    html += '<div class="zustaendigkeiten-person-counts">';
    html += '<span title="Owner">&#9733; ' + data.owned.length + '</span>';
    html += '<span title="Viewer">&#9673; ' + data.viewing.length + '</span>';
    html += '<span title="Editor">&#9998; ' + data.editing.length + '</span>';
    html += '</div></div>';

    if (data.owned.length > 0) {
      html += '<div class="zustaendigkeiten-section"><div class="zustaendigkeiten-section-title">Owner von:</div>';
      data.owned.forEach(function(item) {
        html += '<div class="zustaendigkeiten-page-item">' +
          '<span class="badge badge-sm ' + (item.space === "EKW2" ? "badge-archivwuerdig" : "badge-informativ") + '">' + item.space + '</span> ' +
          '<span class="zust-page-title" data-page-id="' + item.page.id + '">' + escapeHtml(item.page.title) + '</span>' +
          '<button class="zust-remove-btn" data-zust-remove="owner" data-zust-page="' + item.page.id + '" data-zust-person="' + escapeHtml(name) + '" title="Entfernen">&times;</button>' +
          '</div>';
      });
      html += '</div>';
    }
    if (data.viewing.length > 0) {
      html += '<div class="zustaendigkeiten-section"><div class="zustaendigkeiten-section-title">Betrachter von:</div>';
      data.viewing.forEach(function(item) {
        html += '<div class="zustaendigkeiten-page-item">' +
          '<span class="badge badge-sm ' + (item.space === "EKW2" ? "badge-archivwuerdig" : "badge-informativ") + '">' + item.space + '</span> ' +
          '<span class="zust-page-title" data-page-id="' + item.page.id + '">' + escapeHtml(item.page.title) + '</span>' +
          '<button class="zust-remove-btn" data-zust-remove="viewers" data-zust-page="' + item.page.id + '" data-zust-person="' + escapeHtml(name) + '" title="Entfernen">&times;</button>' +
          '</div>';
      });
      html += '</div>';
    }
    if (data.editing.length > 0) {
      html += '<div class="zustaendigkeiten-section"><div class="zustaendigkeiten-section-title">Bearbeiter von:</div>';
      data.editing.forEach(function(item) {
        html += '<div class="zustaendigkeiten-page-item">' +
          '<span class="badge badge-sm ' + (item.space === "EKW2" ? "badge-archivwuerdig" : "badge-informativ") + '">' + item.space + '</span> ' +
          '<span class="zust-page-title" data-page-id="' + item.page.id + '">' + escapeHtml(item.page.title) + '</span>' +
          '<button class="zust-remove-btn" data-zust-remove="editors" data-zust-page="' + item.page.id + '" data-zust-person="' + escapeHtml(name) + '" title="Entfernen">&times;</button>' +
          '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderZustByPage(container, pages, filters) {
  var personSearch = (filters.person || "").toLowerCase();

  var filtered = pages;
  if (personSearch) {
    filtered = pages.filter(function(p) {
      var ownerMatch = p.owner && p.owner.toLowerCase().indexOf(personSearch) !== -1;
      var viewerMatch = (p.viewers || []).some(function(v) { return v.toLowerCase().indexOf(personSearch) !== -1; });
      var editorMatch = (p.editors || []).some(function(e) { return e.toLowerCase().indexOf(personSearch) !== -1; });
      return ownerMatch || viewerMatch || editorMatch;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-hint" style="padding:40px">Keine Seiten gefunden.</div>';
    return;
  }

  var html = '<div class="zustaendigkeiten-container">';
  html += '<table class="zustaendigkeiten-table"><thead><tr>';
  html += '<th>Seite</th><th>Space</th><th>Ebene</th><th>Owner</th><th>Betrachter</th><th>Bearbeiter</th>';
  html += '</tr></thead><tbody>';

  filtered.forEach(function(p) {
    var spaceLabel = p.id.indexOf("ekw2-") === 0 ? "EKW2" : "EKW";
    html += '<tr data-zust-page-id="' + p.id + '">';
    html += '<td><span class="zust-page-title" data-page-id="' + p.id + '">' + escapeHtml(p.title) + '</span></td>';
    html += '<td><span class="badge badge-sm ' + (spaceLabel === "EKW2" ? "badge-archivwuerdig" : "badge-informativ") + '">' + spaceLabel + '</span></td>';
    html += '<td><span class="badge badge-sm ' + hierarchyBadgeClass(p.depth || 0) + '">' + getHierarchyLabel(p.depth || 0) + '</span></td>';
    html += '<td><select class="zust-edit" data-zust-id="' + p.id + '" data-zust-field="owner">' + buildUserOptionsHtml(p.owner) + '</select></td>';
    html += '<td><input class="zust-edit" data-zust-id="' + p.id + '" data-zust-field="viewers" type="text" value="' + escapeHtml((p.viewers || []).join(", ")) + '" placeholder="Kommagetrennt"></td>';
    html += '<td><input class="zust-edit" data-zust-id="' + p.id + '" data-zust-field="editors" type="text" value="' + escapeHtml((p.editors || []).join(", ")) + '" placeholder="Kommagetrennt"></td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function renderZustDistribution(container, pages) {
  // Owner distribution
  var ownerCount = {};
  var noOwner = [];
  var noViewers = [];
  var noEditors = [];

  pages.forEach(function(p) {
    if (p.owner) {
      ownerCount[p.owner] = (ownerCount[p.owner] || 0) + 1;
    } else {
      noOwner.push(p);
    }
    if (!p.viewers || p.viewers.length === 0) noViewers.push(p);
    if (!p.editors || p.editors.length === 0) noEditors.push(p);
  });

  var owners = Object.keys(ownerCount).sort(function(a, b) { return ownerCount[b] - ownerCount[a]; });
  var maxCount = owners.length > 0 ? ownerCount[owners[0]] : 1;

  var html = '<div class="zustaendigkeiten-container">';

  // Bar chart
  html += '<div class="zustaendigkeiten-chart"><h3 class="zustaendigkeiten-chart-title">Seiten pro Owner</h3>';
  owners.forEach(function(owner) {
    var count = ownerCount[owner];
    var pct = Math.round(count / maxCount * 100);
    html += '<div class="zustaendigkeiten-bar-row">';
    html += '<div class="zustaendigkeiten-bar-label">' + escapeHtml(owner) + '</div>';
    html += '<div class="zustaendigkeiten-bar-track"><div class="zustaendigkeiten-bar-fill" style="width:' + pct + '%">' + count + '</div></div>';
    html += '</div>';
  });
  html += '</div>';

  // Warnings
  if (noOwner.length > 0) {
    html += '<div class="zustaendigkeiten-warning"><h3 class="zustaendigkeiten-warning-title">&#9888; Seiten ohne Owner (' + noOwner.length + ')</h3>';
    noOwner.forEach(function(p) {
      var spaceLabel = p.id.indexOf("ekw2-") === 0 ? "EKW2" : "EKW";
      html += '<div class="zustaendigkeiten-page-item"><span class="badge badge-sm ' + (spaceLabel === "EKW2" ? "badge-archivwuerdig" : "badge-informativ") + '">' + spaceLabel + '</span> ' + escapeHtml(p.title) + '</div>';
    });
    html += '</div>';
  }

  if (noViewers.length > 0) {
    html += '<div class="zustaendigkeiten-warning"><h3 class="zustaendigkeiten-warning-title">&#9888; Seiten ohne Betrachter (' + noViewers.length + ')</h3>';
    noViewers.forEach(function(p) {
      var spaceLabel = p.id.indexOf("ekw2-") === 0 ? "EKW2" : "EKW";
      html += '<div class="zustaendigkeiten-page-item"><span class="badge badge-sm ' + (spaceLabel === "EKW2" ? "badge-archivwuerdig" : "badge-informativ") + '">' + spaceLabel + '</span> ' + escapeHtml(p.title) + '</div>';
    });
    html += '</div>';
  }

  if (noEditors.length > 0) {
    html += '<div class="zustaendigkeiten-warning"><h3 class="zustaendigkeiten-warning-title">&#9888; Seiten ohne Bearbeiter (' + noEditors.length + ')</h3>';
    noEditors.forEach(function(p) {
      var spaceLabel = p.id.indexOf("ekw2-") === 0 ? "EKW2" : "EKW";
      html += '<div class="zustaendigkeiten-page-item"><span class="badge badge-sm ' + (spaceLabel === "EKW2" ? "badge-archivwuerdig" : "badge-informativ") + '">' + spaceLabel + '</span> ' + escapeHtml(p.title) + '</div>';
    });
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// ---------- User Management Rendering ----------
function renderUserMgmtList(container) {
  if (USERS.length === 0) {
    container.innerHTML = '<div class="empty-hint" style="padding:20px">Keine Nutzer angelegt.</div>';
    return;
  }

  var html = '<table class="user-mgmt-table"><thead><tr>';
  html += '<th>Name</th><th>Team</th><th></th>';
  html += '</tr></thead><tbody>';

  USERS.forEach(function(u) {
    html += '<tr data-user-id="' + u.id + '">';
    html += '<td><input class="panel-input user-field" data-user-id="' + u.id + '" data-ufield="name" type="text" value="' + escapeHtml(u.name) + '"></td>';
    html += '<td><select class="panel-select user-field" data-user-id="' + u.id + '" data-ufield="team" style="min-width:120px">';
    TEAMS.forEach(function(t) {
      html += '<option value="' + escapeHtml(t) + '"' + (u.team === t ? ' selected' : '') + '>' + escapeHtml(t) + '</option>';
    });
    html += '<option value="__new__">+ Neues Team...</option>';
    html += '</select></td>';
    html += '<td><button class="tree-action-btn tree-delete-btn" data-delete-user="' + u.id + '" title="Löschen">&times;</button></td>';
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ---------- Zuständigkeiten Export ----------
function exportZustaendigkeitenCsv(pages) {
  var headers = ["Seite", "Space", "Ebene", "Owner", "Betrachter", "Bearbeiter"];
  var rows = pages.map(function(p) {
    var spaceLabel = p.id.indexOf("ekw2-") === 0 ? "EKW2" : "EKW";
    return [
      p.title,
      spaceLabel,
      getHierarchyLabel(p.depth || 0),
      p.owner || "",
      (p.viewers || []).join(", "),
      (p.editors || []).join(", ")
    ];
  });
  downloadCsv(headers, rows, "ekw-zustaendigkeiten.csv");
}

function exportZustaendigkeitenPdf(pages) {
  var html = '<table><thead><tr>';
  html += '<th>Seite</th><th>Space</th><th>Ebene</th><th>Owner</th><th>Betrachter</th><th>Bearbeiter</th>';
  html += '</tr></thead><tbody>';

  pages.forEach(function(p) {
    var spaceLabel = p.id.indexOf("ekw2-") === 0 ? "EKW2" : "EKW";
    html += '<tr>';
    html += '<td>' + escapeHtml(p.title) + '</td>';
    html += '<td>' + spaceLabel + '</td>';
    html += '<td>' + getHierarchyLabel(p.depth || 0) + '</td>';
    html += '<td>' + escapeHtml(p.owner || "\u2013") + '</td>';
    html += '<td>' + ((p.viewers || []).join(", ") || "\u2013") + '</td>';
    html += '<td>' + ((p.editors || []).join(", ") || "\u2013") + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table>';
  openPrintWindow("Zuständigkeiten", html);
}

// ---------- CSV Export ----------
function exportTableCsv(pages) {
  var headers = ["Titel", "Ebene", "Seitentyp", "Status", "Owner", "Letzte Änderung", "Versionen", "Migration", "Betrachter", "Bearbeiter"];
  var rows = pages.map(function(p) {
    return [
      p.title,
      getHierarchyLabel(p.depth || 0) + " (" + (p.depth || 0) + ")",
      p.pageType || "",
      p.status || "",
      p.owner || "",
      p.lastUpdated || "",
      p.versionCount != null ? p.versionCount : "",
      p.migration || "",
      (p.viewers || []).join(", "),
      (p.editors || []).join(", ")
    ];
  });
  downloadCsv(headers, rows, "ekw-tabelle.csv");
}

function exportCompareCsv(ekwPages, ekw2Pages) {
  var comparison = buildComparison(ekwPages, ekw2Pages);
  var headers = ["EKW Titel", "EKW2 Titel", "Status", "Migration"];
  var rows = comparison.map(function(row) {
    return [
      row.ekwPage ? row.ekwPage.title : "",
      row.ekw2Page ? row.ekw2Page.title : "",
      row.status === "both" ? "In beiden" : row.status === "ekw-only" ? "Nur EKW" : "Nur EKW2",
      (row.ekwPage || row.ekw2Page).migration || ""
    ];
  });
  downloadCsv(headers, rows, "ekw-vergleich.csv");
}

function exportGovernanceCsv() {
  var allPages = EKW_PAGES.concat(EKW2_PAGES);
  var issues = runGovernanceCheck(allPages);
  var headers = ["Seite", "Schweregrad", "Regel", "Beschreibung"];
  var rows = issues.map(function(i) {
    return [i.title, i.severity === "critical" ? "Kritisch" : "Warnung", i.rule, i.description];
  });
  downloadCsv(headers, rows, "ekw-governance-check.csv");
}

function exportProcessesCsv(space) {
  var pages = getPages(space);
  var bereiche = pages.filter(function(p) { return p.depth === 1; });
  var headers = ["Bereich", "Prozessname", "Beschreibung", "Status", "Mehrwert", "Schritte"];
  var rows = [];
  bereiche.forEach(function(b) {
    getProcessesByBereich(b.id).forEach(function(proc) {
      var stepsStr = (proc.steps || []).map(function(s) { return s.title; }).join(" > ");
      rows.push([b.title, proc.name, proc.description, proc.status, proc.mehrwert || "", stepsStr]);
    });
  });
  downloadCsv(headers, rows, "ekw-kernprozesse-" + space + ".csv");
}

function exportProcessComparisonCsv() {
  var comparison = buildProcessComparison();
  var headers = ["Prozessname", "EKW Status", "EKW Schritte", "EKW2 Status", "EKW2 Schritte", "Vergleich"];
  var rows = comparison.map(function(row) {
    return [
      (row.ekwProc || row.ekw2Proc).name,
      row.ekwProc ? row.ekwProc.status : "",
      row.ekwProc ? (row.ekwProc.steps || []).length : "",
      row.ekw2Proc ? row.ekw2Proc.status : "",
      row.ekw2Proc ? (row.ekw2Proc.steps || []).length : "",
      row.status === "both" ? "In beiden" : row.status === "ekw-only" ? "Nur EKW" : "Nur EKW2"
    ];
  });
  downloadCsv(headers, rows, "ekw-prozessvergleich.csv");
}

function exportZeitplanCsv() {
  var headers = ["Seite", "Space", "Bereich", "Start", "Ende", "Status", "Verantwortlich", "Feedback-Datum", "Feedback-Notizen"];
  var rows = ROLLOUT_ITEMS.map(function(item) {
    var page = findPageById(item.pageId);
    var bereich = getBereichForPage(item.pageId);
    return [
      page ? page.title : item.pageId,
      item.space === "ekw2" ? "EKW2" : "EKW",
      bereich ? bereich.title : "",
      item.startDate || "",
      item.endDate || "",
      item.status || "",
      item.responsible || "",
      item.feedbackDate || "",
      item.feedbackNotes || ""
    ];
  });
  downloadCsv(headers, rows, "ekw-rollout-zeitplan.csv");
}

function downloadCsv(headers, rows, filename) {
  var bom = "\uFEFF";
  var csv = bom + headers.join(";") + "\n";
  rows.forEach(function(row) {
    csv += row.map(function(cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(";") + "\n";
  });
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- PDF Export ----------
function generatePrintHtml(title, contentHtml) {
  return '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>' + escapeHtml(title) + '</title>' +
    '<style>' +
    'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:11px;color:#1d1d1f;line-height:1.4;margin:20px;}' +
    'h1{font-size:18px;margin-bottom:4px;}h2{font-size:14px;margin:16px 0 8px;}' +
    '.subtitle{font-size:11px;color:#6e6e73;margin-bottom:16px;}' +
    'table{width:100%;border-collapse:collapse;margin-bottom:16px;}' +
    'th,td{padding:5px 8px;text-align:left;border-bottom:1px solid #d2d2d7;font-size:10px;}' +
    'th{background:#f5f5f7;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;font-size:9px;}' +
    '.badge{display:inline-block;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:600;}' +
    '.critical{color:#ef4444;}.warning{color:#f59e0b;}' +
    '.score-red{color:#ef4444;}.score-yellow{color:#f59e0b;}.score-green{color:#22c55e;}' +
    '.bereich-hdr{background:#f5f5f7;padding:8px 10px;font-weight:600;margin-top:12px;border-bottom:2px solid #d2d2d7;display:flex;justify-content:space-between;}' +
    '.proc-card{border:1px solid #d2d2d7;border-radius:6px;padding:8px;margin-bottom:8px;}' +
    '.proc-card strong{font-size:11px;}.proc-desc{font-size:10px;color:#6e6e73;margin-top:4px;}' +
    '.proc-status{font-size:9px;font-weight:600;margin-left:8px;}' +
    '.indent{padding-left:20px;}' +
    '.split{display:flex;gap:16px;}.split>div{flex:1;}' +
    '.workflow-steps{display:flex;gap:4px;align-items:center;margin-top:4px;font-size:9px;}' +
    '.step-box{border:1px solid #d2d2d7;border-radius:4px;padding:2px 6px;font-size:9px;}' +
    '.arrow{color:#d4b039;font-size:10px;}' +
    '.mehrwert-box{border:2px solid #d4b039;border-radius:4px;padding:2px 6px;font-size:9px;background:#fdf8e8;}' +
    '@media print{body{margin:0;}}' +
    '</style></head><body>' +
    '<h1>' + escapeHtml(title) + '</h1>' +
    '<div class="subtitle">Exportiert am ' + new Date().toLocaleDateString("de-DE") + ' \u2013 EKW Governance Tool (Häcker Küchen)</div>' +
    contentHtml + '</body></html>';
}

function openPrintWindow(title, contentHtml) {
  var printWin = window.open("", "_blank");
  if (!printWin) {
    alert("Popup wurde blockiert. Bitte Popups für diese Seite erlauben.");
    return;
  }
  printWin.document.write(generatePrintHtml(title, contentHtml));
  printWin.document.close();
  printWin.focus();
  setTimeout(function() { printWin.print(); }, 400);
}

function exportTablePdf(pages, spaceName) {
  var html = '<table><thead><tr>' +
    '<th>Titel</th><th>Ebene</th><th>Typ</th><th>Status</th><th>Owner</th>' +
    '<th>Aktualisiert</th><th>Versionen</th><th>Migration</th>' +
    '<th>Betrachter</th><th>Bearbeiter</th></tr></thead><tbody>';

  pages.forEach(function(p) {
    html += '<tr><td>' + escapeHtml(p.title) + '</td>' +
      '<td>' + getHierarchyLabel(p.depth || 0) + '</td>' +
      '<td>' + (p.pageType || "\u2013") + '</td>' +
      '<td>' + (p.status || "\u2013") + '</td>' +
      '<td>' + (p.owner || "\u2013") + '</td>' +
      '<td>' + (p.lastUpdated || "\u2013") + '</td>' +
      '<td>' + (p.versionCount || "\u2013") + '</td>' +
      '<td>' + (p.migration || "\u2013") + '</td>' +
      '<td>' + ((p.viewers || []).join(", ") || "\u2013") + '</td>' +
      '<td>' + ((p.editors || []).join(", ") || "\u2013") + '</td></tr>';
  });

  html += '</tbody></table>';
  openPrintWindow("Tabellenansicht \u2013 " + (spaceName || "EKW"), html);
}

function exportGovernancePdf() {
  var allPages = EKW_PAGES.concat(EKW2_PAGES);
  var issues = runGovernanceCheck(allPages);
  var critical = issues.filter(function(i) { return i.severity === "critical"; });
  var warnings = issues.filter(function(i) { return i.severity === "warning"; });

  var html = '<p><strong>' + critical.length + '</strong> Kritisch | <strong>' + warnings.length + '</strong> Warnungen</p>';

  if (critical.length > 0) {
    html += '<h2 class="critical">Kritisch (' + critical.length + ')</h2>' +
      '<table><thead><tr><th>Seite</th><th>Regel</th><th>Beschreibung</th></tr></thead><tbody>';
    critical.forEach(function(i) {
      html += '<tr><td>' + escapeHtml(i.title) + '</td><td>' + i.rule + '</td><td>' + i.description + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  if (warnings.length > 0) {
    html += '<h2 class="warning">Warnungen (' + warnings.length + ')</h2>' +
      '<table><thead><tr><th>Seite</th><th>Regel</th><th>Beschreibung</th></tr></thead><tbody>';
    warnings.forEach(function(i) {
      html += '<tr><td>' + escapeHtml(i.title) + '</td><td>' + i.rule + '</td><td>' + i.description + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  openPrintWindow("Governance-Check", html);
}

function exportComparePdf(ekwPages, ekw2Pages) {
  var html = '<div class="split"><div><h2>EK-Wikipedia</h2>';
  ekwPages.forEach(function(p) {
    var indent = (p.depth || 0) > 0 ? ' style="padding-left:' + ((p.depth || 0) * 12) + 'px"' : '';
    html += '<div' + indent + '>' + escapeHtml(p.title) + ' <span style="color:#86868b;font-size:9px">(' + (p.status || "\u2013") + ')</span></div>';
  });
  html += '</div><div><h2>EK-Wikipedia 2.0</h2>';
  ekw2Pages.forEach(function(p) {
    var indent = (p.depth || 0) > 0 ? ' style="padding-left:' + ((p.depth || 0) * 12) + 'px"' : '';
    html += '<div' + indent + '>' + escapeHtml(p.title) + ' <span style="color:#86868b;font-size:9px">(' + (p.status || "\u2013") + ')</span></div>';
  });
  html += '</div></div>';
  openPrintWindow("Vergleich EKW / EKW2", html);
}

function exportProcessesPdf(space) {
  var pages = getPages(space);
  var bereiche = pages.filter(function(p) { return p.depth === 1; });
  var html = '';

  bereiche.forEach(function(b) {
    var procs = getProcessesByBereich(b.id);
    html += '<div class="bereich-hdr"><span>' + escapeHtml(b.title) + '</span><span>' + procs.length + ' Prozess(e)</span></div>';
    if (procs.length === 0) {
      html += '<p style="color:#86868b;padding:8px;">Keine Kernprozesse definiert.</p>';
    } else {
      procs.forEach(function(proc) {
        html += '<div class="proc-card"><strong>' + escapeHtml(proc.name || "Unbenannt") + '</strong>' +
          '<span class="proc-status">\u2013 ' + (proc.status || "\u2013") + '</span>';
        // Steps
        if (proc.steps && proc.steps.length > 0) {
          html += '<div class="workflow-steps">';
          proc.steps.forEach(function(s, idx) {
            if (idx > 0) html += '<span class="arrow">&rarr;</span>';
            html += '<span class="step-box">' + escapeHtml(s.title || "Step") + '</span>';
          });
          if (proc.mehrwert) {
            html += '<span class="arrow">&rarr;</span>';
            html += '<span class="mehrwert-box">' + escapeHtml(proc.mehrwert) + '</span>';
          }
          html += '</div>';
        }
        html += '<div class="proc-desc">' + escapeHtml(proc.description || "Keine Beschreibung") + '</div></div>';
      });
    }
  });

  openPrintWindow("Kernprozesse \u2013 " + (space === "ekw" ? "EKW" : "EKW2"), html);
}

function exportZeitplanPdf() {
  var html = '<table><thead><tr>' +
    '<th>Seite</th><th>Space</th><th>Bereich</th><th>Start</th><th>Ende</th>' +
    '<th>Status</th><th>Verantwortlich</th><th>Feedback</th></tr></thead><tbody>';

  ROLLOUT_ITEMS.forEach(function(item) {
    var page = findPageById(item.pageId);
    var bereich = getBereichForPage(item.pageId);
    html += '<tr><td>' + escapeHtml(page ? page.title : item.pageId) + '</td>' +
      '<td>' + (item.space === "ekw2" ? "EKW2" : "EKW") + '</td>' +
      '<td>' + escapeHtml(bereich ? bereich.title : "\u2013") + '</td>' +
      '<td>' + (item.startDate || "\u2013") + '</td>' +
      '<td>' + (item.endDate || "\u2013") + '</td>' +
      '<td>' + (item.status || "\u2013") + '</td>' +
      '<td>' + escapeHtml(item.responsible || "\u2013") + '</td>' +
      '<td>' + (item.feedbackDate || "") + (item.feedbackNotes ? " - " + escapeHtml(item.feedbackNotes) : "") + '</td></tr>';
  });

  html += '</tbody></table>';
  openPrintWindow("Roll-Out Zeitplan", html);
}

// ---------- Utility ----------
function escapeHtml(str) {
  if (!str) return "";
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
