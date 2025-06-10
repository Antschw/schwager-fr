import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, CardHeader } from '@heroui/react'
import { Icon } from '@iconify/react'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import ThemeSwitcher from '../components/ui/ThemeSwitcher'

export default function HubPage() {
    const { t } = useTranslation()

    const handleLogout = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/auth-api'
            await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            })
            // Recharger la page pour déclencher la redirection vers login
            window.location.href = '/'
        } catch (error) {
            console.error('Logout failed:', error)
            // En cas d'erreur, rediriger quand même vers la page de login
            window.location.href = '/'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-default-100">
            {/* Header */}
            <motion.header
                className="w-full p-4 flex justify-between items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1 className="text-2xl font-bold font-helvetica text-foreground">
                        {t('common.siteName')}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeSwitcher />

                    {/* Logout Button */}
                    <Button
                        color="danger"
                        variant="ghost"
                        onPress={handleLogout}
                        startContent={<Icon icon="lucide:log-out" />}
                        className="ml-2"
                    >
                        {t('common.logout') || 'Déconnexion'}
                    </Button>
                </div>
            </motion.header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        {t('hub.welcome') || 'Bienvenue sur le Hub'}
                    </h2>
                    <p className="text-lg text-foreground/70">
                        {t('hub.description') || 'Voici votre espace personnel'}
                    </p>
                </motion.div>

                {/* Grid des applications/services */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
                >
                    {/* Card exemple - Dashboard */}
                    <Card className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                        <CardHeader className="flex gap-3">
                            <Icon icon="lucide:bar-chart-3" className="text-primary text-2xl" />
                            <div className="flex flex-col">
                                <p className="text-md font-semibold">Dashboard</p>
                                <p className="text-small text-default-500">Tableau de bord</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-default-600">
                                Consultez vos statistiques et métriques importantes
                            </p>
                        </CardBody>
                    </Card>

                    {/* Card exemple - Analytics */}
                    <Card className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                        <CardHeader className="flex gap-3">
                            <Icon icon="lucide:trending-up" className="text-success text-2xl" />
                            <div className="flex flex-col">
                                <p className="text-md font-semibold">Analytics</p>
                                <p className="text-small text-default-500">Analyse des données</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-default-600">
                                Analysez vos données et performances
                            </p>
                        </CardBody>
                    </Card>

                    {/* Card exemple - Settings */}
                    <Card className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                        <CardHeader className="flex gap-3">
                            <Icon icon="lucide:settings" className="text-warning text-2xl" />
                            <div className="flex flex-col">
                                <p className="text-md font-semibold">Paramètres</p>
                                <p className="text-small text-default-500">Configuration</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-default-600">
                                Gérez vos préférences et paramètres
                            </p>
                        </CardBody>
                    </Card>

                    {/* Vous pouvez ajouter d'autres cards ici */}
                </motion.div>
            </main>
        </div>
    )
}