import { useEffect, useState } from 'react'

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
}

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
                const res = await fetch(`${apiUrl}/auth-api/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })

                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'authentification:', error)
                setUser(null)
            } finally {
                setLoading(false)
                setIsInitialized(true)
            }
        }

        if (!isInitialized) {
            fetchUser()
        }
    }, [isInitialized])

    const logout = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
            await fetch(`${apiUrl}/auth-api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
        } finally {
            setUser(null)
            setIsInitialized(false)
            // Redirection vers la page de connexion
            window.location.href = '/'
        }
    }

    // Fonction pour rafraîchir les données utilisateur après connexion
    const refreshUser = async () => {
        setLoading(true)
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
            const res = await fetch(`${apiUrl}/auth-api/auth/me`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
                return data.user
            } else {
                setUser(null)
                return null
            }
        } catch (error) {
            console.error('Erreur lors du rafraîchissement utilisateur:', error)
            setUser(null)
            return null
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, logout, refreshUser, isInitialized }
}