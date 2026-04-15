const TOKEN_KEY = "aims_token";

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Redirects to login if no token is found
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "login-forms.html";
    return;
  }

  // Verify token is still valid with the backend
  fetch("http://localhost:3001/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) {
        clearToken();
        window.location.href = "login-forms.html";
      }
    })
    .catch(() => {
      clearToken();
      window.location.href = "login-forms.html";
    });
}

// Call this on the logout button
function logout() {
  clearToken();
  window.location.href = "login-forms.html";
}