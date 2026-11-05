// Las cookies HttpOnly de autenticación se envían automáticamente con la API.
// Si una petición autenticada recibe 401, se renuevan usando la cookie y se
// reintenta una sola vez.

const API_URL = import.meta.env.VITE_API_URL || '';
const fetchOriginal = window.fetch;

let renovacionEnCurso = null;

function esSolicitudApi(input) {
    const url = input instanceof Request
        ? new URL(input.url)
        : new URL(input, window.location.href);
    const origenApi = new URL(API_URL || window.location.origin, window.location.href);
    return url.origin === origenApi.origin && url.pathname.includes('/api/');
}

function requiereAutenticacion(options, input) {
    const headers = new Headers(
        options.headers || (input instanceof Request ? input.headers : undefined)
    );
    const pathname = new URL(
        input instanceof Request ? input.url : input,
        window.location.href
    ).pathname;

    return Boolean(headers.get('Authorization'))
        || pathname.endsWith('/api/usuarios/me');
}

function esEndpointAutenticacion(input) {
    const url = input instanceof Request
        ? new URL(input.url)
        : new URL(input, window.location.href);
    return /\/api\/autenticador\/(login|refresh|logout)(\/|$)/.test(url.pathname);
}

async function renovarToken() {
    if (!renovacionEnCurso) {
        renovacionEnCurso = (async () => {
            const response = await fetchOriginal(`${API_URL}/api/autenticador/refresh`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json().catch(() => ({}));
            return response.ok && data?.success === true;
        })();
    }

    try {
        return await renovacionEnCurso;
    } finally {
        renovacionEnCurso = null;
    }
}

window.fetch = async (...args) => {
    const [input, options = {}] = args;
    if (!esSolicitudApi(input)) {
        return fetchOriginal(...args);
    }

    const headers = new Headers(
        options.headers || (input instanceof Request ? input.headers : undefined)
    );
    const authNecesaria = requiereAutenticacion(options, input);
    headers.delete('Authorization');

    const opcionesApi = {
        ...options,
        credentials: 'include',
        headers
    };
    const requestInput = input instanceof Request ? input.clone() : input;
    const response = await fetchOriginal(requestInput, opcionesApi);

    if (
        response.status !== 401
        || !authNecesaria
        || esEndpointAutenticacion(input)
    ) {
        return response;
    }

    if (!await renovarToken()) {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return response;
    }

    return fetchOriginal(
        input instanceof Request ? input.clone() : input,
        opcionesApi
    );
};
