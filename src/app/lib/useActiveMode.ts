export function getActiveMode() {
  return localStorage.getItem("activeMode") || "USER";
}

export function requireBusinessMode() {
  const mode = getActiveMode();
  if (mode !== "BUSINESS") {
    window.location.href = "/user-dashboard";
  }
}
