/* =====================================================
   Authentication Module
   Handles login, register, logout, password reset
   ===================================================== */

var Auth = (function () {
  // Get current session
  async function getSession() {
    var result = await supabase.auth.getSession();
    return result.data.session;
  }

  // Get current user
  async function getUser() {
    var result = await supabase.auth.getUser();
    return result.data.user;
  }

  // Login with email + password
  async function login(email, password) {
    var result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (result.error) throw result.error;
    return result.data;
  }

  // Register new account
  async function register(email, password, fullName) {
    var result = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (result.error) throw result.error;
    return result.data;
  }

  // Logout
  async function logout() {
    var result = await supabase.auth.signOut();
    if (result.error) throw result.error;
    window.location.href = "login.html";
  }

  // Reset password
  async function resetPassword(email) {
    var result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password.html"
    });
    if (result.error) throw result.error;
    return result.data;
  }

  // Auth guard – redirect to login if not authenticated
  async function requireAuth() {
    var session = await getSession();
    if (!session) {
      window.location.href = "login.html";
      return null;
    }
    return session;
  }

  // Redirect to app if already authenticated (for login page)
  async function redirectIfAuthenticated() {
    var session = await getSession();
    if (session) {
      window.location.href = "index.html";
      return true;
    }
    return false;
  }

  // Listen for auth state changes
  function onAuthStateChange(callback) {
    supabase.auth.onAuthStateChange(function (event, session) {
      callback(event, session);
    });
  }

  // Get display name from user metadata
  function getDisplayName(user) {
    if (!user) return "Unbekannt";
    if (user.user_metadata && user.user_metadata.full_name) {
      return user.user_metadata.full_name;
    }
    return user.email || "Unbekannt";
  }

  return {
    getSession: getSession,
    getUser: getUser,
    login: login,
    register: register,
    logout: logout,
    resetPassword: resetPassword,
    requireAuth: requireAuth,
    redirectIfAuthenticated: redirectIfAuthenticated,
    onAuthStateChange: onAuthStateChange,
    getDisplayName: getDisplayName
  };
})();
