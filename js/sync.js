/* =====================================================
   Cloud Sync – Bridges sessionStorage ↔ Supabase
   Strategy: Load from cloud on init, save to both
   sessionStorage (fast) and Supabase (persistent).
   Uses the existing upsert_store RPC function (security
   definer) to bypass RLS can_edit restrictions.
   ===================================================== */

var CloudSync = (function () {
  var STORE_KEY = "ekw_governance";
  var _saving = false;
  var _saveTimer = null;
  var _skipCloudOnce = false; // prevent recursive save

  // Collect all data into one object
  function _collectData() {
    return {
      ekw_pages: EKW_PAGES,
      ekw2_pages: EKW2_PAGES,
      processes: PROCESSES,
      rollout_items: ROLLOUT_ITEMS,
      users: USERS,
      teams: TEAMS,
      checklist: ROLLOUT_CHECKLIST
    };
  }

  // Apply loaded data to global variables
  function _applyData(data) {
    if (!data) return false;
    if (data.ekw_pages && Array.isArray(data.ekw_pages)) {
      EKW_PAGES.length = 0;
      data.ekw_pages.forEach(function (p) { EKW_PAGES.push(p); });
    }
    if (data.ekw2_pages && Array.isArray(data.ekw2_pages)) {
      EKW2_PAGES.length = 0;
      data.ekw2_pages.forEach(function (p) { EKW2_PAGES.push(p); });
    }
    if (data.processes && Array.isArray(data.processes)) {
      PROCESSES.length = 0;
      data.processes.forEach(function (p) { PROCESSES.push(p); });
    }
    if (data.rollout_items && Array.isArray(data.rollout_items)) {
      ROLLOUT_ITEMS.length = 0;
      data.rollout_items.forEach(function (r) { ROLLOUT_ITEMS.push(r); });
    }
    if (data.users && Array.isArray(data.users)) {
      USERS.length = 0;
      data.users.forEach(function (u) { USERS.push(u); });
    }
    if (data.teams && Array.isArray(data.teams)) {
      TEAMS.length = 0;
      data.teams.forEach(function (t) { TEAMS.push(t); });
    }
    if (data.checklist) {
      ROLLOUT_CHECKLIST.rolloutStartDate = data.checklist.rolloutStartDate || "";
      ROLLOUT_CHECKLIST.feedbackLoopDate = data.checklist.feedbackLoopDate || "";
      ROLLOUT_CHECKLIST.items = data.checklist.items || [];
    }
    return true;
  }

  // Load data from Supabase (called once on app init)
  async function loadFromCloud() {
    try {
      if (typeof supabase === "undefined" || !supabase) {
        loadSessionData();
        return false;
      }

      var result = await supabase
        .from("app_store")
        .select("data")
        .eq("store_key", STORE_KEY)
        .single();

      if (result.error) {
        console.warn("CloudSync: Load error –", result.error.message);
        loadSessionData();
        // If row doesn't exist yet, seed it
        if (result.error.code === "PGRST116") {
          await _pushToCloud();
        }
        return false;
      }

      var data = result.data && result.data.data;
      if (data && Object.keys(data).length > 0) {
        _applyData(data);
        // Sync to sessionStorage without triggering cloud save
        _skipCloudOnce = true;
        saveSessionData();
        _skipCloudOnce = false;
        return true;
      } else {
        // No cloud data yet – load defaults and push to cloud
        loadSessionData();
        await _pushToCloud();
        return true;
      }
    } catch (err) {
      console.warn("CloudSync: Exception –", err);
      loadSessionData();
      return false;
    }
  }

  // Push current data to Supabase via upsert_store RPC
  async function _pushToCloud() {
    if (_saving) return;
    _saving = true;
    try {
      if (typeof supabase === "undefined" || !supabase) {
        _saving = false;
        return;
      }
      var payload = _collectData();

      // Try RPC upsert_store first (bypasses RLS)
      var result = await supabase.rpc("upsert_store", {
        p_key: STORE_KEY,
        p_data: payload
      });

      if (result.error) {
        console.warn("CloudSync: RPC error –", result.error.message);
        // Fallback: direct upsert
        var result2 = await supabase
          .from("app_store")
          .upsert({
            store_key: STORE_KEY,
            data: payload,
            updated_at: new Date().toISOString()
          }, { onConflict: "store_key" });
        if (result2.error) {
          console.warn("CloudSync: Fallback save error –", result2.error.message);
        }
      }
    } catch (err) {
      console.warn("CloudSync: Save exception –", err);
    }
    _saving = false;
  }

  // Called from saveSessionData() hook – debounced cloud push
  function save() {
    if (_skipCloudOnce) return;
    // Debounce cloud save (800ms)
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(function () {
      _pushToCloud();
    }, 800);
  }

  return {
    loadFromCloud: loadFromCloud,
    save: save
  };
})();
