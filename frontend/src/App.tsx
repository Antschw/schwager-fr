import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HubPage from './pages/HubPage'
import PlantPage from './pages/PlantPage'
import ProtectedRoute from './components/ProtectedRoute'
import useAuth from './hooks/useAuth'
import { Spinner } from '@heroui/react'

function App() {
    const { user, loading, isInitialized } = useAuth()

    // Afficher un spinner pendant le chargement initial
    if (!isInitialized || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-default-100">
                <div className="text-center">
                    <Spinner
                        size="lg"
                        color="primary"
                        className="mb-4"
                    />
                    <p className="text-foreground/70">Initialisation...</p>
                </div>
            </div>
        )
    }

    return (
        <Router>
            <Routes>
                {/* Redirection automatique vers le hub si connecté */}
                <Route
                    path="/"
                    element={
                        user ? <Navigate to="/hub" replace /> : <LoginPage />
                    }
                />

                {/* Page de connexion explicite */}
                <Route
                    path="/login"
                    element={
                        user ? <Navigate to="/hub" replace /> : <LoginPage />
                    }
                />

                {/* Page Hub après connexion */}
                <Route
                    path="/hub"
                    element={
                        <ProtectedRoute>
                            <HubPage />
                        </ProtectedRoute>
                    }
                />

                {/* Page Plant Monitoring */}
                <Route
                    path="/plants"
                    element={
                        <ProtectedRoute>
                            <PlantPage />
                        </ProtectedRoute>
                    }
                />

                {/* Toutes les autres routes redirigent vers la page d'accueil */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    )
}

export default App