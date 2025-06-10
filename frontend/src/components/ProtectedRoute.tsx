import { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { Spinner } from '@heroui/react'
import useAuth from '../hooks/useAuth'

interface ProtectedRouteProps {
    children: ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
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
                    <p className="text-foreground/70">Vérification de l'authentification...</p>
                </div>
            </div>
        )
    }

    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}