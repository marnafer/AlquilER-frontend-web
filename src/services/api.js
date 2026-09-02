const API_URL = 'http://localhost:8000';

// AUTENTICACIÓN

export async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function register(userData) {
    try {
        console.log('📤 Enviando al backend:', userData);
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        console.log('📥 Respuesta del backend:', result);
        return result;
    } catch (error) {
        console.error('❌ Error en register:', error);
        return { success: false, error: error.message };
    }
}

export async function getPerfil(token) {
    try {
        const response = await fetch(`${API_URL}/api/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        console.log('📥 Respuesta perfil:', result);
        return result;
    } catch (error) {
        console.error('❌ Error en getPerfil:', error);
        return { success: false, error: error.message };
    }
}

export async function getPropiedades() {
    try {
        const response = await fetch(`${API_URL}/api/propiedades`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return [];
    } catch (error) {
        console.error('Error en getPropiedades:', error);
        return [];
    }
}

export async function getPropiedad(id) {
    try {
        const response = await fetch(`${API_URL}/api/propiedades/${id}`);
        const result = await response.json();
        if (result.success && result.data) {
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error en getPropiedad:', error);
        return null;
    }
}

export async function getCategorias() {
    try {
        const response = await fetch(`${API_URL}/api/categorias`);
        const result = await response.json();
        if (result.success && result.data && result.data.items) {
            return result.data.items;
        }
        return [];
    } catch (error) {
        console.error('Error en getCategorias:', error);
        return [];
    }
}

export async function getFavoritos(token) {
    try {
        const response = await fetch(`${API_URL}/api/favoritos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function addFavorito(propiedadId, token) {
    try {
        const response = await fetch(`${API_URL}/api/favoritos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ propiedad_id: propiedadId })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function removeFavorito(favoritoId, token) {
    try {
        const response = await fetch(`${API_URL}/api/favoritos/${favoritoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getReservas(token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createReserva(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createConsulta(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getConsultas(token) {
    try {
        const response = await fetch(`${API_URL}/api/consultas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createResena(data, token) {
    try {
        const response = await fetch(`${API_URL}/api/resenas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}