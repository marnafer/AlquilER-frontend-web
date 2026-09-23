// Interceptor global de fetch: cuando el backend responde 401 a una petición
// autenticada, renueva el access token con el refresh_token guardado y reintenta
// la misma llamada. Evita dejar la sesión muerta cuando el token expira.

const API_URL = import.meta.env.VITE_API_URL || '';
const fetchOriginal = window.fetch;

let renovacionEnCurso = null;

function tokenHeader(options) {
    if (!options || !options.headers) return null;
    const headers = options.headers instanceof Headers
        ? options.headers
        : new Headers(options.headers || {});
    return headers.get('Authorization');
}

async function renovarToken() {
    const refreshTok = localStorage.getItem('refresh_token');
    if (!refreshTok) return false;

    if (!renovacionEnCurso) {
        renovacionEnCurso = (async () => {
            const response = await fetchOriginal(`${API_URL}/api/autenticador/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshTok })
            });
            const data = await response.json().catch(() => ({}));
            return { ok: response.ok, data };
        })();
    }

    try {
        const { ok, data } = await renovacionEnCurso;
        if (!ok || !data?.success || !data.data?.access_token) return false;

        localStorage.setItem('token', data.data.access_token);
        if (data.data.refresh_token) {
            localStorage.setItem('refresh_token', data.data.refresh_token);
        }
        window.dispatchEvent(new CustomEvent('auth:token-refreshed'));
        return true;
    } finally {
        renovacionEnCurso = null;
    }
}

window.fetch = async (...args) => {
    const response = await fetchOriginal(...args);

    // Solo reintentamos los 401 de peticiones que enviaban token.
    if (response.status !== 401 || !tokenHeader(args[1])) {
        return response;
    }

    const renovado = await renovarToken();
    if (!renovado) {
        // Sin refresh válido: la sesión expiró de verdad.
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return response;
    }

    const [url, options = {}] = args;
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return fetchOriginal(url, { ...options, headers });
};