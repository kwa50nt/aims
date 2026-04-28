const TOKEN_KEY = "aims_token";
const ROLE_KEY  = "aims_role";

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

function requireAuth(...allowedRoles) {
  const token = getToken();
  if (!token) {
    window.location.href = "/login-forms.html";
    return;
  }

  if (allowedRoles.length > 0) {
    const role = localStorage.getItem(ROLE_KEY);
    if (!allowedRoles.includes(role)) {
      const correctPage = role === "Alumni" ? "/profile.html" : "/index.html";
      window.location.replace(correctPage);
    }
  }
}

function logout() {
  clearToken();
  window.location.href = "/login-forms.html";
}