import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HubPage from './pages/HubPage'

function App() {
    return (
        <Router>
            <Routes>
                {/* Page d'accueil = page de connexion */}
                <Route path="/" element={<LoginPage />} />

                {/* Page de connexion explicite (même chose que /) */}
                <Route path="/login" element={<LoginPage />} />

                {/* Page Hub après connexion */}
                <Route path="/hub" element={<HubPage />} />

                {/* Toutes les autres routes redirigent vers la page d'accueil */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    )
}

export default App