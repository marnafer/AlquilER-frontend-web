import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './AppRouter';

function App() {
    return (
        // BrowserRouter maneja el enrutamiento de toda la app
        <BrowserRouter>
            {/* AuthProvider provee el estado de autenticación a toda la app */}
            <AuthProvider>
                {/* UIProvider provee toast global y modal de confirmación */}
                <UIProvider>
                    {/* ThemeProvider maneja el modo claro/oscuro global */}
                    <ThemeProvider>
                        <AppRouter />
                    </ThemeProvider>
                </UIProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;