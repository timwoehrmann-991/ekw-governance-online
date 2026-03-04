/* ==========================================================================
   EKW Governance Tool – App Controller
   Event Handling, Tab Control, State Management
   ========================================================================== */

(function () {
  "use strict";

  // ---------- State ----------
  var activeTab = "tree";
  var activeSpace = "ekw";
  var expandedNodes = new Set();
  var sortKey = "title";
  var sortDir = "asc";
  var filters = { pageType: "", status: "", migration: "", bereich: "" };
  var addPageParentId = null;
  var deletePageId = null;

  // Compare state
  var compareView = "pages"; // "pages" or "processes"
  var compareEkwFilter = "";
  var compareEkw2Filter = "";
  var compareOnlyDiffs = false;

  // Zeitplan state
  var zeitplanView = "timeline"; // "timeline", "list", or "checkliste"
  var zeitplanFilters = { space: "", bereich: "", status: "" };
  var zeitplanRange = { fromMonth: null, fromYear: null, toMonth: null, toYear: null };

  // Zuständigkeiten state
  var zustView = "person"; // "person", "page", "distribution"
  var zustFilters = { space: "", bereich: "", person: "" };

  // Workflow collapse state (Set of bereichIds where workflow tile is collapsed)
  var collapsedWorkflows = new Set();

  // Compare expand/collapse state
  var compareExpandedNodes = new Set();

  // Compare add-page state
  var compareAddPageSpace = null;
  var compareAddPageParentId = null;

  // Rollout modal state
  var editRolloutId = null;

  // ---------- DOM References ----------
  var tabBtns = document.querySelectorAll(".tab-btn");
  var tabPanels = document.querySelectorAll(".tab-panel");
  var spaceBtns = document.querySelectorAll(".space-btn");
  var spaceSwitcher = document.getElementById("spaceSwitcher");
  var themeToggle = document.getElementById("themeToggle");
  var themeLabel = document.getElementById("themeLabel");

  var treeContainer = document.getElementById("treeContainer");
  var tableBody = document.getElementById("tableBody");
  var dataTable = document.getElementById("dataTable");
  var govResults = document.getElementById("govResults");
  var govStats = document.getElementById("govStats");

  // Compare
  var comparePageContainer = document.getElementById("comparePageContainer");
  var compareProcessContainer = document.getElementById("compareProcessContainer");
  var compareOnlyDiffsCheckbox = document.getElementById("compareOnlyDiffs");

  // Zeitplan
  var zeitplanContainer = document.getElementById("zeitplanContainer");

  // Zuständigkeiten
  var zustaendigkeitenContainer = document.getElementById("zustaendigkeitenContainer");

  // User Management Modal
  var userMgmtBtn = document.getElementById("userMgmtBtn");
  var userMgmtOverlay = document.getElementById("userMgmtOverlay");
  var userMgmtList = document.getElementById("userMgmtList");
  var userMgmtClose = document.getElementById("userMgmtClose");
  var userMgmtDone = document.getElementById("userMgmtDone");
  var newUserName = document.getElementById("newUserName");
  var newUserTeam = document.getElementById("newUserTeam");
  var addUserBtn = document.getElementById("addUserBtn");

  // Zuständigkeiten filters
  var zustFilterSpace = document.getElementById("zustFilterSpace");
  var zustFilterBereich = document.getElementById("zustFilterBereich");
  var zustFilterPerson = document.getElementById("zustFilterPerson");

  // Zuständigkeiten exports
  var exportZustCsvBtn = document.getElementById("exportZustCsvBtn");
  var exportZustPdfBtn = document.getElementById("exportZustPdfBtn");

  // Zeitplan range selectors
  var zeitplanRangeFromMonth = document.getElementById("zeitplanRangeFromMonth");
  var zeitplanRangeFromYear = document.getElementById("zeitplanRangeFromYear");
  var zeitplanRangeToMonth = document.getElementById("zeitplanRangeToMonth");
  var zeitplanRangeToYear = document.getElementById("zeitplanRangeToYear");
  var zeitplanQuarterBtns = document.getElementById("zeitplanQuarterBtns");

  var filterBereich = document.getElementById("filterBereich");
  var filterType = document.getElementById("filterType");
  var filterStatus = document.getElementById("filterStatus");
  var filterMigration = document.getElementById("filterMigration");

  var exportCsvBtn = document.getElementById("exportCsvBtn");
  var exportPdfBtn = document.getElementById("exportPdfBtn");
  var exportCompareBtn = document.getElementById("exportCompareBtn");
  var exportComparePdfBtn = document.getElementById("exportComparePdfBtn");
  var exportGovCsvBtn = document.getElementById("exportGovCsvBtn");
  var exportGovPdfBtn = document.getElementById("exportGovPdfBtn");
  var exportZeitplanCsvBtn = document.getElementById("exportZeitplanCsvBtn");
  var exportZeitplanPdfBtn = document.getElementById("exportZeitplanPdfBtn");

  var sidePanel = document.getElementById("sidePanel");
  var sidePanelOverlay = document.getElementById("sidePanelOverlay");
  var sidePanelTitle = document.getElementById("sidePanelTitle");
  var sidePanelBody = document.getElementById("sidePanelBody");
  var sidePanelClose = document.getElementById("sidePanelClose");

  // Add Page Modal
  var addPageOverlay = document.getElementById("addPageOverlay");
  var addPageModalTitle = document.getElementById("addPageModalTitle");
  var newPageTitle = document.getElementById("newPageTitle");
  var newPageType = document.getElementById("newPageType");
  var newPageStatus = document.getElementById("newPageStatus");
  var newPageOwner = document.getElementById("newPageOwner");
  var newPageMigration = document.getElementById("newPageMigration");
  var addPageCancel = document.getElementById("addPageCancel");
  var addPageSave = document.getElementById("addPageSave");
  var addPageModalClose = document.getElementById("addPageModalClose");

  // Delete Modal
  var deletePageOverlay = document.getElementById("deletePageOverlay");
  var deletePageMessage = document.getElementById("deletePageMessage");
  var deletePageCancel = document.getElementById("deletePageCancel");
  var deletePageConfirm = document.getElementById("deletePageConfirm");

  // Add Rollout Modal
  var addRolloutOverlay = document.getElementById("addRolloutOverlay");
  var rolloutModalTitle = document.getElementById("rolloutModalTitle");
  var rolloutPage = document.getElementById("rolloutPage");
  var rolloutSpace = document.getElementById("rolloutSpace");
  var rolloutStart = document.getElementById("rolloutStart");
  var rolloutEnd = document.getElementById("rolloutEnd");
  var rolloutStatusSel = document.getElementById("rolloutStatus");
  var rolloutResponsible = document.getElementById("rolloutResponsible");
  var rolloutFeedbackDate = document.getElementById("rolloutFeedbackDate");
  var rolloutFeedbackNotes = document.getElementById("rolloutFeedbackNotes");
  var rolloutCancel = document.getElementById("rolloutCancel");
  var rolloutSave = document.getElementById("rolloutSave");
  var rolloutModalClose = document.getElementById("rolloutModalClose");
  var addRolloutBtn = document.getElementById("addRolloutBtn");

  // Zeitplan filters
  var zeitplanFilterSpace = document.getElementById("zeitplanFilterSpace");
  var zeitplanFilterBereich = document.getElementById("zeitplanFilterBereich");
  var zeitplanFilterStatus = document.getElementById("zeitplanFilterStatus");

  // ---------- Init ----------
  function init() {
    loadSessionData();
    initTheme();
    populateFilters();
    populateZustFilters();
    populateModalSelects();
    expandAllRoots();
    renderCurrentView();
    bindEvents();
  }

  function expandAllRoots() {
    var pages = getPages(activeSpace);
    pages.filter(function(p) { return !p.parentId; }).forEach(function(p) { expandedNodes.add(p.id); });
  }

  function initTheme() {
    var saved = localStorage.getItem("ekw-theme");
    if (saved && (saved === "light" || saved === "dark" || saved === "beige")) {
      document.documentElement.setAttribute("data-theme", saved);
    }
    updateThemeLabel();
  }

  function updateThemeLabel() {
    var current = document.documentElement.getAttribute("data-theme") || "light";
    var labels = { light: "Light", beige: "Beige", dark: "Dark" };
    if (themeLabel) themeLabel.textContent = labels[current] || "Light";
  }

  function populateFilters() {
    filterType.innerHTML = '<option value="">Alle Seitentypen</option>' +
      PAGE_TYPES.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join("");
    filterStatus.innerHTML = '<option value="">Alle Status</option>' +
      PAGE_STATUS.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join("");
    filterMigration.innerHTML = '<option value="">Alle Migrationen</option>' +
      MIGRATION_OPTIONS.map(function(m) { return '<option value="' + m + '">' + m + '</option>'; }).join("");
    populateBereichFilter();
    populateZeitplanFilters();
  }

  function populateBereichFilter() {
    var pages = getPages(activeSpace);
    var bereiche = pages.filter(function(p) { return p.depth === 1; });
    filterBereich.innerHTML = '<option value="">Alle Bereiche</option>' +
      bereiche.map(function(b) {
        var descendants = getDescendantIds(b.id, pages);
        return '<option value="' + b.id + '">' + b.title + ' (' + descendants.size + ' Seiten)</option>';
      }).join("");
  }

  function populateZeitplanFilters() {
    // Status
    zeitplanFilterStatus.innerHTML = '<option value="">Alle Status</option>' +
      ROLLOUT_STATUS.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join("");

    // Bereich (all spaces)
    var allPages = EKW_PAGES.concat(EKW2_PAGES);
    var bereiche = allPages.filter(function(p) { return p.depth === 1; });
    var seen = {};
    zeitplanFilterBereich.innerHTML = '<option value="">Alle Bereiche</option>' +
      bereiche.filter(function(b) {
        if (seen[b.id]) return false;
        seen[b.id] = true;
        return true;
      }).map(function(b) {
        return '<option value="' + b.id + '">' + escapeHtml(b.title) + '</option>';
      }).join("");

    // Month/Year range selectors
    var monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    var minYear = 2026;
    var maxYear = 2030;

    // Determine range from data
    ROLLOUT_ITEMS.forEach(function(item) {
      if (item.startDate) {
        var y = new Date(item.startDate).getFullYear();
        if (y < minYear) minYear = y;
        if (y > maxYear) maxYear = y;
      }
      if (item.endDate) {
        var y2 = new Date(item.endDate).getFullYear();
        if (y2 > maxYear) maxYear = y2;
      }
    });

    var monthHtml = '<option value="">--</option>';
    for (var m = 0; m < 12; m++) {
      monthHtml += '<option value="' + m + '">' + monthNames[m] + '</option>';
    }

    var yearHtml = '<option value="">--</option>';
    for (var y = minYear; y <= maxYear; y++) {
      yearHtml += '<option value="' + y + '">' + y + '</option>';
    }

    zeitplanRangeFromMonth.innerHTML = monthHtml;
    zeitplanRangeFromYear.innerHTML = yearHtml;
    zeitplanRangeToMonth.innerHTML = monthHtml;
    zeitplanRangeToYear.innerHTML = yearHtml;

    // Set defaults if not set: first month with data -> +3 months
    if (zeitplanRange.fromMonth === null && ROLLOUT_ITEMS.length > 0) {
      var allDates = [];
      ROLLOUT_ITEMS.forEach(function(item) {
        if (item.startDate) allDates.push(new Date(item.startDate));
        if (item.endDate) allDates.push(new Date(item.endDate));
      });
      if (allDates.length > 0) {
        var earliest = new Date(Math.min.apply(null, allDates));
        var latest = new Date(Math.max.apply(null, allDates));
        zeitplanRange.fromMonth = earliest.getMonth();
        zeitplanRange.fromYear = earliest.getFullYear();
        zeitplanRange.toMonth = latest.getMonth();
        zeitplanRange.toYear = latest.getFullYear();

        zeitplanRangeFromMonth.value = zeitplanRange.fromMonth;
        zeitplanRangeFromYear.value = zeitplanRange.fromYear;
        zeitplanRangeToMonth.value = zeitplanRange.toMonth;
        zeitplanRangeToYear.value = zeitplanRange.toYear;
      }
    } else if (zeitplanRange.fromMonth !== null) {
      zeitplanRangeFromMonth.value = zeitplanRange.fromMonth;
      zeitplanRangeFromYear.value = zeitplanRange.fromYear;
      zeitplanRangeToMonth.value = zeitplanRange.toMonth;
      zeitplanRangeToYear.value = zeitplanRange.toYear;
    }

    // Quarter quick-select buttons for 2026 and 2027
    var qHtml = '';
    [2026, 2027].forEach(function(year) {
      for (var q = 1; q <= 4; q++) {
        var fromM = (q - 1) * 3;
        var toM = fromM + 2;
        var isActive = zeitplanRange.fromMonth === fromM && zeitplanRange.fromYear === year &&
                       zeitplanRange.toMonth === toM && zeitplanRange.toYear === year;
        qHtml += '<button class="zeitplan-quarter-btn' + (isActive ? ' active' : '') + '" data-q-year="' + year + '" data-q-num="' + q + '">Q' + q + ' ' + year + '</button>';
      }
    });
    zeitplanQuarterBtns.innerHTML = qHtml;
  }

  function populateZustFilters() {
    var allPages = EKW_PAGES.concat(EKW2_PAGES);
    var bereiche = allPages.filter(function(p) { return p.depth === 1; });
    var seen = {};
    zustFilterBereich.innerHTML = '<option value="">Alle Bereiche</option>' +
      bereiche.filter(function(b) {
        if (seen[b.id]) return false;
        seen[b.id] = true;
        return true;
      }).map(function(b) {
        return '<option value="' + b.id + '">' + escapeHtml(b.title) + '</option>';
      }).join("");
  }

  function populateModalSelects() {
    newPageType.innerHTML = buildOptionsHtml(PAGE_TYPES, null, "\u2013 Seitentyp wählen \u2013");
    newPageStatus.innerHTML = buildOptionsHtml(PAGE_STATUS, null, "\u2013 Status wählen \u2013");
    newPageMigration.innerHTML = buildOptionsHtml(MIGRATION_OPTIONS, null, "\u2013 Migration \u2013");
    newPageOwner.innerHTML = buildUserOptionsHtml(null, "\u2013 Owner wählen \u2013");
    rolloutStatusSel.innerHTML = buildOptionsHtml(ROLLOUT_STATUS, null, "\u2013 Status \u2013");
    rolloutResponsible.innerHTML = buildUserOptionsHtml(null, "\u2013 Verantwortlich \u2013");
  }

  function populateRolloutPageSelect() {
    var allPages = EKW_PAGES.concat(EKW2_PAGES);
    var html = '<option value="">\u2013 Seite wählen \u2013</option>';
    allPages.forEach(function(p) {
      var prefix = p.id.indexOf("ekw2-") === 0 ? "[EKW2] " : "[EKW] ";
      var indent = "";
      for (var i = 0; i < (p.depth || 0); i++) indent += "\u00A0\u00A0";
      html += '<option value="' + p.id + '">' + indent + prefix + escapeHtml(p.title) + '</option>';
    });
    rolloutPage.innerHTML = html;
  }

  // ---------- Rendering ----------
  function renderCurrentView() {
    var pages = getPages(activeSpace);

    switch (activeTab) {
      case "tree":
        renderTree(treeContainer, pages, expandedNodes, collapsedWorkflows);
        break;
      case "table":
        renderTable(tableBody, pages, sortKey, sortDir, filters);
        updateSortHeaders();
        break;
      case "governance":
        renderGovernance(govResults, govStats, pages);
        break;
      case "compare":
        renderCompareView();
        break;
      case "zeitplan":
        renderZeitplanView();
        break;
      case "zustaendigkeiten":
        renderZustaendigkeitenView();
        break;
    }
  }

  function renderCompareView() {
    if (compareView === "pages") {
      comparePageContainer.style.display = "";
      compareProcessContainer.style.display = "none";
      // Auto-expand roots and bereiche on first render
      if (compareExpandedNodes.size === 0) {
        EKW_PAGES.concat(EKW2_PAGES).forEach(function(p) {
          if (p.depth === 0 || p.depth === 1) compareExpandedNodes.add(p.id);
        });
      }
      renderCompare5050(comparePageContainer, EKW_PAGES, EKW2_PAGES, compareEkwFilter, compareEkw2Filter, compareOnlyDiffs, collapsedWorkflows, compareExpandedNodes);
      bindCompareFilterEvents();
    } else {
      comparePageContainer.style.display = "none";
      compareProcessContainer.style.display = "";
      renderProcessComparison(compareProcessContainer);
    }
  }

  function renderZeitplanView() {
    if (zeitplanView === "timeline") {
      renderZeitplanTimeline(zeitplanContainer, ROLLOUT_ITEMS, zeitplanFilters, zeitplanRange);
    } else if (zeitplanView === "checkliste") {
      renderRolloutChecklist(zeitplanContainer);
    } else {
      renderZeitplanList(zeitplanContainer, ROLLOUT_ITEMS, zeitplanFilters);
    }
  }

  function renderZustaendigkeitenView() {
    renderZustaendigkeiten(zustaendigkeitenContainer, zustView, zustFilters);
  }

  function updateSortHeaders() {
    dataTable.querySelectorAll("th").forEach(function(th) {
      th.classList.remove("sorted-asc", "sorted-desc");
      if (th.dataset.sort === sortKey) {
        th.classList.add(sortDir === "asc" ? "sorted-asc" : "sorted-desc");
      }
    });
  }

  // ---------- Side Panel ----------
  function openSidePanel(pageId) {
    var page = findPageById(pageId);
    if (!page) return;

    sidePanelTitle.textContent = page.title;
    renderSidePanel(sidePanelBody, page);
    sidePanel.classList.add("open");
    sidePanelOverlay.classList.add("open");
    bindSidePanelEvents(page);
  }

  function closeSidePanel() {
    sidePanel.classList.remove("open");
    sidePanelOverlay.classList.remove("open");
  }

  function bindSidePanelEvents(page) {
    sidePanelBody.querySelectorAll("input[data-id], select[data-id], textarea[data-id]").forEach(function(el) {
      el.addEventListener("change", handlePanelEdit);
      if (el.tagName === "INPUT") el.addEventListener("input", handlePanelEdit);
    });
  }

  function handlePanelEdit(e) {
    var el = e.target;
    var id = el.dataset.id;
    var field = el.dataset.field;
    if (!id || !field) return;

    var value = el.value;

    if (field === "viewers" || field === "editors") {
      value = value ? value.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];
      updatePage(id, field, value);
      return;
    }

    if (field === "versionCount") {
      value = parseInt(value, 10) || 0;
    }
    if (value === "") value = null;

    updatePage(id, field, value);

    // Auto-set lastUpdated to today's date on any edit
    if (field !== "lastUpdated") {
      var today = new Date().toISOString().split("T")[0];
      updatePage(id, "lastUpdated", today);
      var dateInput = sidePanelBody.querySelector('input[data-field="lastUpdated"][data-id="' + id + '"]');
      if (dateInput) dateInput.value = today;
    }

    var page = findPageById(id);

    if (field === "title" && page) {
      sidePanelTitle.textContent = value || page.id;
    }
  }

  // ---------- Modals ----------
  function openAddPageModal(parentId) {
    var parentPage = findPageById(parentId);
    if (!parentPage) return;

    if ((parentPage.depth || 0) >= 7) {
      alert("Maximale Verschachtelungstiefe (8 Ebenen) erreicht.");
      return;
    }

    var pages = getPages(activeSpace);
    var siblingsCount = pages.filter(function(p) { return p.parentId === parentId; }).length;
    if (siblingsCount >= 100) {
      alert("Maximale Seitenanzahl (100) pro Ebene erreicht.");
      return;
    }

    addPageParentId = parentId;
    compareAddPageSpace = null; // not from compare view
    var newDepth = (parentPage.depth || 0) + 1;
    var label = getHierarchyLabel(newDepth);
    addPageModalTitle.textContent = label + ' unter "' + parentPage.title + '" hinzufügen';
    newPageTitle.value = "";
    newPageType.value = "";
    newPageStatus.value = "";
    newPageOwner.value = "";
    newPageMigration.value = "";
    newPageTitle.style.borderColor = "";
    addPageOverlay.classList.add("open");
    setTimeout(function() { newPageTitle.focus(); }, 100);
  }

  function openAddPageModalForCompare(parentId, space) {
    var parentPage = findPageById(parentId);
    if (!parentPage) return;

    if ((parentPage.depth || 0) >= 7) {
      alert("Maximale Verschachtelungstiefe (8 Ebenen) erreicht.");
      return;
    }

    addPageParentId = parentId;
    compareAddPageSpace = space;
    var newDepth = (parentPage.depth || 0) + 1;
    var label = getHierarchyLabel(newDepth);
    addPageModalTitle.textContent = label + ' unter "' + parentPage.title + '" hinzufügen';
    newPageTitle.value = "";
    newPageType.value = "";
    newPageStatus.value = "";
    newPageOwner.value = "";
    newPageMigration.value = "";
    newPageTitle.style.borderColor = "";
    addPageOverlay.classList.add("open");
    setTimeout(function() { newPageTitle.focus(); }, 100);
  }

  function openDeleteModal(pageId) {
    var page = findPageById(pageId);
    if (!page) return;

    deletePageId = pageId;
    var pages = getPages(activeSpace);
    var descendants = getDescendantIds(pageId, pages);
    var childCount = descendants.size;

    deletePageMessage.textContent = childCount > 0
      ? '"' + page.title + '" und ' + childCount + ' Unterseite(n) wirklich löschen?'
      : '"' + page.title + '" wirklich löschen?';
    deletePageOverlay.classList.add("open");
  }

  function openRolloutModal() {
    editRolloutId = null;
    rolloutModalTitle.textContent = "Rollout-Eintrag erstellen";
    populateRolloutPageSelect();
    rolloutPage.value = "";
    rolloutSpace.value = "ekw2";
    rolloutStart.value = "";
    rolloutEnd.value = "";
    rolloutStatusSel.value = "";
    rolloutResponsible.value = "";
    rolloutFeedbackDate.value = "";
    rolloutFeedbackNotes.value = "";
    addRolloutOverlay.classList.add("open");
  }

  // ---------- Compare Filter Events ----------
  function bindCompareFilterEvents() {
    var ekwFilterEl = document.getElementById("compareEkwFilter");
    var ekw2FilterEl = document.getElementById("compareEkw2Filter");

    if (ekwFilterEl) {
      ekwFilterEl.addEventListener("change", function() {
        compareEkwFilter = ekwFilterEl.value;
        renderCompareView();
      });
    }
    if (ekw2FilterEl) {
      ekw2FilterEl.addEventListener("change", function() {
        compareEkw2Filter = ekw2FilterEl.value;
        renderCompareView();
      });
    }
  }

  // ---------- Workflow Tile Event Handling ----------
  function handleWorkflowEvents(e) {
    // Add process
    var addProcBtn = e.target.closest("[data-add-process]");
    if (addProcBtn) {
      e.stopPropagation();
      var bereichId = addProcBtn.dataset.addProcess;
      addProcess({
        id: "proc-" + Date.now(),
        name: "",
        description: "",
        status: "Entwurf",
        bereichId: bereichId,
        mehrwert: "",
        steps: []
      });
      renderCurrentView();
      return true;
    }

    // Delete process
    var delProcBtn = e.target.closest("[data-delete-process]");
    if (delProcBtn) {
      e.stopPropagation();
      removeProcess(delProcBtn.dataset.deleteProcess);
      renderCurrentView();
      return true;
    }

    // Add step
    var addStepBtn = e.target.closest("[data-add-step]");
    if (addStepBtn) {
      e.stopPropagation();
      var processId = addStepBtn.dataset.addStep;
      var proc = PROCESSES.find(function(p) { return p.id === processId; });
      var nextOrder = proc && proc.steps ? proc.steps.length + 1 : 1;
      addProcessStep(processId, {
        id: "step-" + Date.now(),
        title: "",
        description: "",
        order: nextOrder
      });
      renderCurrentView();
      return true;
    }

    // Delete step
    var delStepBtn = e.target.closest("[data-delete-step]");
    if (delStepBtn) {
      e.stopPropagation();
      removeProcessStep(delStepBtn.dataset.stepProcess, delStepBtn.dataset.deleteStep);
      renderCurrentView();
      return true;
    }

    return false;
  }

  function handleWorkflowInputs(e) {
    var el = e.target;

    // Process field edit (name, status, mehrwert)
    if (el.dataset.processId && el.dataset.pfield) {
      updateProcess(el.dataset.processId, el.dataset.pfield, el.value);
      return true;
    }

    // Step field edit
    if (el.dataset.stepId && el.dataset.stepProcess && el.dataset.sfield) {
      updateProcessStep(el.dataset.stepProcess, el.dataset.stepId, el.dataset.sfield, el.value);
      return true;
    }

    return false;
  }

  // ---------- Event Binding ----------
  function bindEvents() {
    // Tab navigation
    tabBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        activeTab = btn.dataset.tab;
        tabBtns.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        tabPanels.forEach(function(p) { p.classList.remove("active"); });
        document.getElementById("panel-" + activeTab).classList.add("active");

        if (activeTab === "tree" || activeTab === "table") {
          spaceSwitcher.classList.remove("hidden");
        } else {
          spaceSwitcher.classList.add("hidden");
        }

        if (activeTab === "table") populateBereichFilter();
        if (activeTab === "zeitplan") populateZeitplanFilters();
        if (activeTab === "zustaendigkeiten") populateZustFilters();
        renderCurrentView();
      });
    });

    // Space switcher
    spaceBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        activeSpace = btn.dataset.space;
        spaceBtns.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        expandedNodes.clear();
        expandAllRoots();
        populateBereichFilter();
        filters.bereich = "";
        filterBereich.value = "";
        renderCurrentView();
      });
    });

    // Theme toggle: 3-way cycle
    themeToggle.addEventListener("click", function() {
      var current = document.documentElement.getAttribute("data-theme") || "light";
      var next;
      if (current === "light") next = "beige";
      else if (current === "beige") next = "dark";
      else next = "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("ekw-theme", next);
      updateThemeLabel();
    });

    // Tree: toggle, add, delete, click + workflow events
    treeContainer.addEventListener("click", function(e) {
      // Workflow collapse toggle
      var wfToggle = e.target.closest("[data-toggle-workflow]");
      if (wfToggle) {
        e.stopPropagation();
        var bereichId = wfToggle.dataset.toggleWorkflow;
        if (collapsedWorkflows.has(bereichId)) {
          collapsedWorkflows.delete(bereichId);
        } else {
          collapsedWorkflows.add(bereichId);
        }
        renderCurrentView();
        return;
      }

      // Workflow events first
      if (handleWorkflowEvents(e)) return;

      // Add button
      var addBtn = e.target.closest(".tree-add-btn");
      if (addBtn) {
        e.stopPropagation();
        openAddPageModal(addBtn.dataset.addChild);
        return;
      }

      // Delete button
      var deleteBtn = e.target.closest(".tree-delete-btn");
      if (deleteBtn) {
        e.stopPropagation();
        openDeleteModal(deleteBtn.dataset.delete);
        return;
      }

      // Toggle
      var toggleBtn = e.target.closest(".tree-toggle");
      if (toggleBtn) {
        e.stopPropagation();
        var id = toggleBtn.dataset.toggle;
        if (expandedNodes.has(id)) {
          expandedNodes.delete(id);
        } else {
          expandedNodes.add(id);
        }
        renderCurrentView();
        return;
      }

      // Click on tree item (not workflow)
      var treeItem = e.target.closest(".tree-item");
      if (treeItem && !e.target.closest(".workflow-tile")) {
        openSidePanel(treeItem.dataset.id);
      }
    });

    // Workflow input changes
    treeContainer.addEventListener("change", function(e) {
      handleWorkflowInputs(e);
    });
    treeContainer.addEventListener("input", function(e) {
      var el = e.target;
      if (el.classList.contains("workflow-process-name") || el.classList.contains("workflow-step-title") ||
          el.classList.contains("workflow-step-desc") || el.classList.contains("workflow-mehrwert-input")) {
        handleWorkflowInputs(e);
      }
    });

    // Table: sort headers
    dataTable.querySelectorAll("th[data-sort]").forEach(function(th) {
      th.addEventListener("click", function() {
        var key = th.dataset.sort;
        if (sortKey === key) {
          sortDir = sortDir === "asc" ? "desc" : "asc";
        } else {
          sortKey = key;
          sortDir = "asc";
        }
        renderCurrentView();
      });
    });

    // Table: inline edits
    tableBody.addEventListener("change", function(e) {
      var el = e.target;
      if (el.dataset.id && el.dataset.field) {
        var value = el.value;
        if (value === "") value = null;
        updatePage(el.dataset.id, el.dataset.field, value);
        renderCurrentView();
      }
    });

    // Table: click title to open panel
    tableBody.addEventListener("click", function(e) {
      var clickable = e.target.closest(".cell-clickable");
      if (clickable) openSidePanel(clickable.dataset.id);
    });

    // Filters
    filterBereich.addEventListener("change", function() {
      filters.bereich = filterBereich.value;
      renderCurrentView();
    });
    filterType.addEventListener("change", function() {
      filters.pageType = filterType.value;
      renderCurrentView();
    });
    filterStatus.addEventListener("change", function() {
      filters.status = filterStatus.value;
      renderCurrentView();
    });
    filterMigration.addEventListener("change", function() {
      filters.migration = filterMigration.value;
      renderCurrentView();
    });

    // Compare page container: workflow + page events
    comparePageContainer.addEventListener("click", function(e) {
      // Compare tree expand/collapse toggle
      var compareToggle = e.target.closest("[data-compare-toggle]");
      if (compareToggle) {
        e.stopPropagation();
        var nodeId = compareToggle.dataset.compareToggle;
        if (compareExpandedNodes.has(nodeId)) {
          compareExpandedNodes.delete(nodeId);
        } else {
          compareExpandedNodes.add(nodeId);
        }
        renderCompareView();
        return;
      }

      // Workflow collapse toggle in compare view
      var wfToggle = e.target.closest("[data-toggle-workflow]");
      if (wfToggle) {
        e.stopPropagation();
        var bereichId = wfToggle.dataset.toggleWorkflow;
        if (collapsedWorkflows.has(bereichId)) {
          collapsedWorkflows.delete(bereichId);
        } else {
          collapsedWorkflows.add(bereichId);
        }
        renderCompareView();
        return;
      }

      // Workflow events (add/delete process, add/delete step)
      if (handleWorkflowEvents(e)) {
        renderCompareView();
        return;
      }

      // Add page from compare view
      var addBtn = e.target.closest("[data-compare-add-page]");
      if (addBtn) {
        e.stopPropagation();
        var parentId = addBtn.dataset.compareAddPage;
        var space = addBtn.dataset.compareSpace;
        compareAddPageSpace = space;
        openAddPageModalForCompare(parentId, space);
        return;
      }

      // Delete page from compare view
      var delBtn = e.target.closest("[data-compare-delete-page]");
      if (delBtn) {
        e.stopPropagation();
        openDeleteModal(delBtn.dataset.compareDeletePage);
        return;
      }

      // Click on compare tree item to open side panel
      var treeItem = e.target.closest(".compare-tree-item[data-page-id]");
      if (treeItem && !e.target.closest(".compare-workflow-tile")) {
        openSidePanel(treeItem.dataset.pageId);
      }
    });

    // Compare page container: workflow input changes
    comparePageContainer.addEventListener("change", function(e) {
      if (handleWorkflowInputs(e)) {
        renderCompareView();
      }
    });
    comparePageContainer.addEventListener("input", function(e) {
      var el = e.target;
      if (el.classList.contains("workflow-process-name") || el.classList.contains("workflow-step-title") ||
          el.classList.contains("workflow-step-desc") || el.classList.contains("workflow-mehrwert-input")) {
        handleWorkflowInputs(e);
      }
    });

    // Compare process container: workflow events
    compareProcessContainer.addEventListener("click", function(e) {
      if (handleWorkflowEvents(e)) {
        renderCompareView();
      }
    });
    compareProcessContainer.addEventListener("change", function(e) {
      if (handleWorkflowInputs(e)) {
        renderCompareView();
      }
    });
    compareProcessContainer.addEventListener("input", function(e) {
      var el = e.target;
      if (el.classList.contains("workflow-process-name") || el.classList.contains("workflow-step-title") ||
          el.classList.contains("workflow-step-desc") || el.classList.contains("workflow-mehrwert-input")) {
        handleWorkflowInputs(e);
      }
    });

    // Compare sub-tab toggle
    document.querySelectorAll("[data-compare-view]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        compareView = btn.dataset.compareView;
        document.querySelectorAll("[data-compare-view]").forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderCompareView();
      });
    });

    // Compare only-diffs checkbox
    compareOnlyDiffsCheckbox.addEventListener("change", function() {
      compareOnlyDiffs = compareOnlyDiffsCheckbox.checked;
      renderCompareView();
    });

    // Zeitplan view toggle
    document.querySelectorAll("[data-zview]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        zeitplanView = btn.dataset.zview;
        document.querySelectorAll("[data-zview]").forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderZeitplanView();
      });
    });

    // Zeitplan filters
    zeitplanFilterSpace.addEventListener("change", function() {
      zeitplanFilters.space = zeitplanFilterSpace.value;
      renderZeitplanView();
    });
    zeitplanFilterBereich.addEventListener("change", function() {
      zeitplanFilters.bereich = zeitplanFilterBereich.value;
      renderZeitplanView();
    });
    zeitplanFilterStatus.addEventListener("change", function() {
      zeitplanFilters.status = zeitplanFilterStatus.value;
      renderZeitplanView();
    });

    // Zeitplan: delete rollout items
    zeitplanContainer.addEventListener("click", function(e) {
      var delBtn = e.target.closest("[data-delete-rollout]");
      if (delBtn) {
        removeRolloutItem(delBtn.dataset.deleteRollout);
        renderZeitplanView();
      }
    });

    // Checkliste: checkbox toggle + date changes
    zeitplanContainer.addEventListener("change", function(e) {
      var el = e.target;
      // Checkbox toggle
      if (el.dataset.checklistPage) {
        setChecklistItem(el.dataset.checklistPage, el.checked, undefined);
        renderZeitplanView();
        return;
      }
      // Individual date
      if (el.dataset.checklistDate) {
        setChecklistItem(el.dataset.checklistDate, undefined, el.value);
        return;
      }
      // Global dates
      if (el.dataset.checklistGlobal) {
        updateChecklistGlobalDate(el.dataset.checklistGlobal, el.value);
        return;
      }
    });

    // Export buttons
    exportCsvBtn.addEventListener("click", function() {
      exportTableCsv(getPages(activeSpace));
    });
    exportPdfBtn.addEventListener("click", function() {
      exportTablePdf(getPages(activeSpace), activeSpace === "ekw" ? "EK-Wikipedia" : "EK-Wikipedia 2.0");
    });
    exportCompareBtn.addEventListener("click", function() {
      if (compareView === "processes") {
        exportProcessComparisonCsv();
      } else {
        exportCompareCsv(EKW_PAGES, EKW2_PAGES);
      }
    });
    exportComparePdfBtn.addEventListener("click", function() {
      if (compareView === "processes") {
        // Process comparison PDF
        var html = '<h2>Prozessvergleich EKW / EKW2</h2>';
        var comparison = buildProcessComparison();
        html += '<table><thead><tr><th>Prozess</th><th>EKW Status</th><th>EKW Schritte</th><th>EKW2 Status</th><th>EKW2 Schritte</th></tr></thead><tbody>';
        comparison.forEach(function(row) {
          html += '<tr><td>' + escapeHtml((row.ekwProc || row.ekw2Proc).name) + '</td>';
          html += '<td>' + (row.ekwProc ? row.ekwProc.status : "\u2013") + '</td>';
          html += '<td>' + (row.ekwProc ? (row.ekwProc.steps || []).length : "\u2013") + '</td>';
          html += '<td>' + (row.ekw2Proc ? row.ekw2Proc.status : "\u2013") + '</td>';
          html += '<td>' + (row.ekw2Proc ? (row.ekw2Proc.steps || []).length : "\u2013") + '</td></tr>';
        });
        html += '</tbody></table>';
        openPrintWindow("Prozessvergleich EKW / EKW2", html);
      } else {
        exportComparePdf(EKW_PAGES, EKW2_PAGES);
      }
    });
    exportGovCsvBtn.addEventListener("click", function() {
      exportGovernanceCsv();
    });
    exportGovPdfBtn.addEventListener("click", function() {
      exportGovernancePdf();
    });
    exportZeitplanCsvBtn.addEventListener("click", function() {
      exportZeitplanCsv();
    });
    exportZeitplanPdfBtn.addEventListener("click", function() {
      exportZeitplanPdf();
    });

    // Zeitplan range selectors
    function handleRangeChange() {
      var fm = zeitplanRangeFromMonth.value;
      var fy = zeitplanRangeFromYear.value;
      var tm = zeitplanRangeToMonth.value;
      var ty = zeitplanRangeToYear.value;
      zeitplanRange.fromMonth = fm !== "" ? parseInt(fm, 10) : null;
      zeitplanRange.fromYear = fy !== "" ? parseInt(fy, 10) : null;
      zeitplanRange.toMonth = tm !== "" ? parseInt(tm, 10) : null;
      zeitplanRange.toYear = ty !== "" ? parseInt(ty, 10) : null;
      renderZeitplanView();
    }
    zeitplanRangeFromMonth.addEventListener("change", handleRangeChange);
    zeitplanRangeFromYear.addEventListener("change", handleRangeChange);
    zeitplanRangeToMonth.addEventListener("change", handleRangeChange);
    zeitplanRangeToYear.addEventListener("change", handleRangeChange);

    // Quarter quick-select buttons
    zeitplanQuarterBtns.addEventListener("click", function(e) {
      var btn = e.target.closest(".zeitplan-quarter-btn");
      if (!btn) return;
      var year = parseInt(btn.dataset.qYear, 10);
      var q = parseInt(btn.dataset.qNum, 10);
      var fromM = (q - 1) * 3;
      var toM = fromM + 2;
      // Toggle off if already active
      if (zeitplanRange.fromMonth === fromM && zeitplanRange.fromYear === year &&
          zeitplanRange.toMonth === toM && zeitplanRange.toYear === year) {
        zeitplanRange = { fromMonth: null, fromYear: null, toMonth: null, toYear: null };
      } else {
        zeitplanRange.fromMonth = fromM;
        zeitplanRange.fromYear = year;
        zeitplanRange.toMonth = toM;
        zeitplanRange.toYear = year;
      }
      // Sync dropdowns
      zeitplanRangeFromMonth.value = zeitplanRange.fromMonth !== null ? zeitplanRange.fromMonth : "";
      zeitplanRangeFromYear.value = zeitplanRange.fromYear !== null ? zeitplanRange.fromYear : "";
      zeitplanRangeToMonth.value = zeitplanRange.toMonth !== null ? zeitplanRange.toMonth : "";
      zeitplanRangeToYear.value = zeitplanRange.toYear !== null ? zeitplanRange.toYear : "";
      populateZeitplanFilters();
      renderZeitplanView();
    });

    // Zuständigkeiten sub-tab toggle
    document.querySelectorAll("[data-zust-view]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        zustView = btn.dataset.zustView;
        document.querySelectorAll("[data-zust-view]").forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderZustaendigkeitenView();
      });
    });

    // Zuständigkeiten filters
    zustFilterSpace.addEventListener("change", function() {
      zustFilters.space = zustFilterSpace.value;
      renderZustaendigkeitenView();
    });
    zustFilterBereich.addEventListener("change", function() {
      zustFilters.bereich = zustFilterBereich.value;
      renderZustaendigkeitenView();
    });
    zustFilterPerson.addEventListener("input", function() {
      zustFilters.person = zustFilterPerson.value;
      renderZustaendigkeitenView();
    });

    // Zuständigkeiten inline editing (event delegation)
    zustaendigkeitenContainer.addEventListener("change", function(e) {
      var el = e.target;
      // "Nach Seite" table edits
      if (el.dataset.zustId && el.dataset.zustField) {
        var pageId = el.dataset.zustId;
        var field = el.dataset.zustField;
        var value = el.value;
        if (field === "viewers" || field === "editors") {
          value = value.split(",").map(function(s) { return s.trim(); }).filter(function(s) { return s; });
        }
        updatePage(pageId, field, value);
        // Auto-update lastUpdated
        var today = new Date().toISOString().slice(0, 10);
        updatePage(pageId, "lastUpdated", today);
      }
    });
    zustaendigkeitenContainer.addEventListener("input", function(e) {
      var el = e.target;
      if (el.dataset.zustId && el.dataset.zustField) {
        var pageId = el.dataset.zustId;
        var field = el.dataset.zustField;
        var value = el.value;
        if (field === "viewers" || field === "editors") {
          value = value.split(",").map(function(s) { return s.trim(); }).filter(function(s) { return s; });
        }
        updatePage(pageId, field, value);
        var today = new Date().toISOString().slice(0, 10);
        updatePage(pageId, "lastUpdated", today);
      }
    });
    zustaendigkeitenContainer.addEventListener("click", function(e) {
      // Remove button in "Nach Person" view
      var removeBtn = e.target.closest("[data-zust-remove]");
      if (removeBtn) {
        var role = removeBtn.dataset.zustRemove;
        var pageId = removeBtn.dataset.zustPage;
        var person = removeBtn.dataset.zustPerson;
        var page = findPageById(pageId);
        if (!page) return;
        if (role === "owner") {
          updatePage(pageId, "owner", "");
        } else if (role === "viewers") {
          var viewers = (page.viewers || []).filter(function(v) { return v !== person; });
          updatePage(pageId, "viewers", viewers);
        } else if (role === "editors") {
          var editors = (page.editors || []).filter(function(ed) { return ed !== person; });
          updatePage(pageId, "editors", editors);
        }
        var today = new Date().toISOString().slice(0, 10);
        updatePage(pageId, "lastUpdated", today);
        renderZustaendigkeitenView();
      }
      // Clickable page title opens side panel
      var pageTitle = e.target.closest("[data-page-id]");
      if (pageTitle && !removeBtn) {
        openSidePanel(pageTitle.dataset.pageId);
      }
    });

    // Zuständigkeiten exports
    exportZustCsvBtn.addEventListener("click", function() {
      var pages = EKW_PAGES.concat(EKW2_PAGES);
      if (zustFilters.space === "ekw") pages = EKW_PAGES.slice();
      else if (zustFilters.space === "ekw2") pages = EKW2_PAGES.slice();
      exportZustaendigkeitenCsv(pages);
    });
    exportZustPdfBtn.addEventListener("click", function() {
      var pages = EKW_PAGES.concat(EKW2_PAGES);
      if (zustFilters.space === "ekw") pages = EKW_PAGES.slice();
      else if (zustFilters.space === "ekw2") pages = EKW2_PAGES.slice();
      exportZustaendigkeitenPdf(pages);
    });

    // User Management Modal
    userMgmtBtn.addEventListener("click", function() {
      renderUserMgmtList(userMgmtList);
      // Populate new user team select
      var teamHtml = '';
      TEAMS.forEach(function(t) {
        teamHtml += '<option value="' + escapeHtml(t) + '">' + escapeHtml(t) + '</option>';
      });
      newUserTeam.innerHTML = teamHtml;
      userMgmtOverlay.classList.add("open");
    });

    userMgmtClose.addEventListener("click", function() {
      userMgmtOverlay.classList.remove("open");
      populateModalSelects();
      renderCurrentView();
    });
    userMgmtDone.addEventListener("click", function() {
      userMgmtOverlay.classList.remove("open");
      populateModalSelects();
      renderCurrentView();
    });

    addUserBtn.addEventListener("click", function() {
      var name = newUserName.value.trim();
      if (!name) { newUserName.style.borderColor = "var(--red)"; return; }
      var team = newUserTeam.value || "Einkauf";
      addUser(name, team);
      newUserName.value = "";
      newUserName.style.borderColor = "";
      renderUserMgmtList(userMgmtList);
    });

    // User list inline editing + delete
    userMgmtList.addEventListener("change", function(e) {
      var el = e.target;
      if (el.dataset.userId && el.dataset.ufield) {
        // Handle "new team" option
        if (el.dataset.ufield === "team" && el.value === "__new__") {
          var newTeam = prompt("Neuen Team-Namen eingeben:");
          if (newTeam && newTeam.trim()) {
            newTeam = newTeam.trim();
            if (TEAMS.indexOf(newTeam) === -1) {
              TEAMS.push(newTeam);
              saveSessionData();
            }
            updateUser(el.dataset.userId, "team", newTeam);
          }
          renderUserMgmtList(userMgmtList);
          return;
        }
        updateUser(el.dataset.userId, el.dataset.ufield, el.value);
      }
    });
    userMgmtList.addEventListener("input", function(e) {
      var el = e.target;
      if (el.classList.contains("user-field") && el.dataset.userId && el.dataset.ufield) {
        updateUser(el.dataset.userId, el.dataset.ufield, el.value);
      }
    });
    userMgmtList.addEventListener("click", function(e) {
      var delBtn = e.target.closest("[data-delete-user]");
      if (delBtn) {
        removeUser(delBtn.dataset.deleteUser);
        renderUserMgmtList(userMgmtList);
      }
    });

    // Governance: click to open panel
    govResults.addEventListener("click", function(e) {
      var issue = e.target.closest(".gov-issue");
      if (issue) openSidePanel(issue.dataset.id);
    });

    // Side panel close – re-render both tree and compare to stay in sync
    sidePanelClose.addEventListener("click", function() {
      closeSidePanel();
      renderCurrentView();
      // Also refresh compare view if we're on the compare tab
      if (activeTab === "compare") renderCompareView();
    });
    sidePanelOverlay.addEventListener("click", function() {
      closeSidePanel();
      renderCurrentView();
      if (activeTab === "compare") renderCompareView();
    });

    // Add Page Modal
    addPageSave.addEventListener("click", function() {
      var title = newPageTitle.value.trim();
      if (!title) {
        newPageTitle.style.borderColor = "var(--red)";
        return;
      }

      var parentPage = findPageById(addPageParentId);
      var newDepth = parentPage ? (parentPage.depth || 0) + 1 : 1;

      // Determine which space to add to
      var targetSpace = compareAddPageSpace || activeSpace;

      addPage(targetSpace, {
        id: generatePageId(targetSpace),
        title: title,
        parentId: addPageParentId,
        depth: newDepth,
        pageType: newPageType.value || null,
        status: newPageStatus.value || null,
        owner: newPageOwner.value || null,
        lastUpdated: new Date().toISOString().split("T")[0],
        versionCount: 1,
        notes: "",
        migration: newPageMigration.value || null,
        viewers: [],
        editors: []
      });

      expandedNodes.add(addPageParentId);
      addPageOverlay.classList.remove("open");
      compareAddPageSpace = null;
      populateBereichFilter();
      renderCurrentView();
    });

    addPageCancel.addEventListener("click", function() {
      addPageOverlay.classList.remove("open");
    });
    addPageModalClose.addEventListener("click", function() {
      addPageOverlay.classList.remove("open");
    });

    // Delete Page Modal
    deletePageConfirm.addEventListener("click", function() {
      if (deletePageId) {
        removePage(deletePageId);
        deletePageId = null;
        deletePageOverlay.classList.remove("open");
        populateBereichFilter();
        renderCurrentView();
      }
    });
    deletePageCancel.addEventListener("click", function() {
      deletePageOverlay.classList.remove("open");
      deletePageId = null;
    });

    // Add Rollout Modal
    addRolloutBtn.addEventListener("click", function() {
      openRolloutModal();
    });

    rolloutSave.addEventListener("click", function() {
      var pageId = rolloutPage.value;
      if (!pageId) {
        rolloutPage.style.borderColor = "var(--red)";
        return;
      }

      addRolloutItem({
        id: "roll-" + Date.now(),
        pageId: pageId,
        space: rolloutSpace.value || "ekw2",
        startDate: rolloutStart.value || null,
        endDate: rolloutEnd.value || null,
        status: rolloutStatusSel.value || "geplant",
        feedbackDate: rolloutFeedbackDate.value || null,
        feedbackNotes: rolloutFeedbackNotes.value || "",
        responsible: rolloutResponsible.value || ""
      });

      addRolloutOverlay.classList.remove("open");
      populateZeitplanFilters();
      renderZeitplanView();
    });

    rolloutCancel.addEventListener("click", function() {
      addRolloutOverlay.classList.remove("open");
    });
    rolloutModalClose.addEventListener("click", function() {
      addRolloutOverlay.classList.remove("open");
    });

    // Escape key
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        if (sidePanel.classList.contains("open")) {
          closeSidePanel();
          renderCurrentView();
        }
        if (addPageOverlay.classList.contains("open")) {
          addPageOverlay.classList.remove("open");
        }
        if (deletePageOverlay.classList.contains("open")) {
          deletePageOverlay.classList.remove("open");
          deletePageId = null;
        }
        if (addRolloutOverlay.classList.contains("open")) {
          addRolloutOverlay.classList.remove("open");
        }
        if (userMgmtOverlay.classList.contains("open")) {
          userMgmtOverlay.classList.remove("open");
          populateModalSelects();
          renderCurrentView();
        }
      }
    });
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", init);
})();
