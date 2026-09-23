// export const BASE_URL = "https://quiz-backend-4pjd.onrender.com";
export const BASE_URL ="http://localhost:5000"
// ── Auth token helpers ─────────────────────────────────────────
export const getToken = () => localStorage.getItem('admin_token');

export const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});