import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import AppRouter from './AppRouter';

function App() {
    return (
        // BrowserRouter maneja el enrutamiento de toda la app
        <BrowserRouter>
            {/* AuthProvider provee el estado de autenticación a toda la app */}
            <AuthProvider>
                {/* UIProvider provee toast global y modal de confirmación */}
                <UIProvider>
                    <AppRouter />
                </UIProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;