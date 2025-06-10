import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, CardHeader, Avatar, Chip } from '@heroui/react'
import { Icon } from '@iconify/react'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import ThemeSwitcher from '../components/ui/ThemeSwitcher'
import useAuth from '../hooks/useAuth'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function HubPage() {
    const { t } = useTranslation()
    const { user, logout } = useAuth()
    const isMobile = useMediaQuery('(max-width: 1023px)') // lg breakpoint

    const handleLogout = async () => {
        await logout()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-default-100">
            {/* Header */}
            <motion.header
                className="w-full p-4 flex justify-between items-center border-b border-default-200/50 backdrop-blur-sm bg-background/80"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center">
                    <h1 className="text-xl sm:text-2xl font-bold font-helvetica text-foreground">
                        {t('common.siteName') || 'schwager.fr'}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                </div>
            </motion.header>

            {/* User Card - Mobile only */}
            {user && isMobile && (
                <motion.div
                    className="mx-4 mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-content1 border border-default-200/50">
                        <CardBody className="p-4">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    name={`${user.firstName} ${user.lastName}`}
                                    size="md"
                                    className="text-small"
                                />
                                <div className="flex-1">
                                    <p className="text-base font-medium text-foreground">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-foreground/60">
                                        {user.email}
                                    </p>
                                </div>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    className="capitalize"
                                >
                                    {user.role}
                                </Chip>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            )}

            {/* Main content */}
            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        {t('hub.welcome') || `Bienvenue ${user?.firstName || ''}`}
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
                    {/* Card Dashboard */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-default-200/50">
                            <CardHeader className="flex gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Icon icon="lucide:bar-chart-3" className="text-primary text-2xl" />
                                </div>
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
                    </motion.div>

                    {/* Card Analytics */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-default-200/50">
                            <CardHeader className="flex gap-3">
                                <div className="p-2 bg-success/10 rounded-lg">
                                    <Icon icon="lucide:trending-up" className="text-success text-2xl" />
                                </div>
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
                    </motion.div>

                    {/* Card Settings */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-default-200/50">
                            <CardHeader className="flex gap-3">
                                <div className="p-2 bg-warning/10 rounded-lg">
                                    <Icon icon="lucide:settings" className="text-warning text-2xl" />
                                </div>
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
                    </motion.div>

                    {/* Card API Documentation */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-default-200/50">
                            <CardHeader className="flex gap-3">
                                <div className="p-2 bg-secondary/10 rounded-lg">
                                    <Icon icon="lucide:book-open" className="text-secondary text-2xl" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-md font-semibold">API Docs</p>
                                    <p className="text-small text-default-500">Documentation</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <p className="text-default-600">
                                    Consultez la documentation de l'API
                                </p>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Card Profile */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-default-200/50">
                            <CardHeader className="flex gap-3">
                                <div className="p-2 bg-default/10 rounded-lg">
                                    <Icon icon="lucide:user" className="text-default-700 text-2xl" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-md font-semibold">Profil</p>
                                    <p className="text-small text-default-500">Mon compte</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <p className="text-default-600">
                                    Gérez votre profil et informations personnelles
                                </p>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Card Support */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-default-200/50">
                            <CardHeader className="flex gap-3">
                                <div className="p-2 bg-danger/10 rounded-lg">
                                    <Icon icon="lucide:help-circle" className="text-danger text-2xl" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-md font-semibold">Support</p>
                                    <p className="text-small text-default-500">Aide et assistance</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <p className="text-default-600">
                                    Obtenez de l'aide et contactez le support
                                </p>
                            </CardBody>
                        </Card>
                    </motion.div>
                </motion.div>

                <div className="flex justify-center gap-10 mt-12">
                    {/* User info - Desktop only */}
                    {user && !isMobile && (
                        <div className="flex items-center gap-3">
                            <Avatar
                                name={`${user.firstName} ${user.lastName}`}
                                size="sm"
                                className="text-tiny"
                            />
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-foreground/60">
                                    {user.email}
                                </p>
                            </div>
                            <Chip
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="capitalize"
                            >
                                {user.role}
                            </Chip>
                        </div>
                    )}

                    {/* Logout Button - Responsive */}
                    <Button
                        color="danger"
                        variant="ghost"
                        onPress={handleLogout}
                        startContent={<Icon icon="lucide:log-out" />}
                        className="ml-2"
                    >
                        {(t('common.logout') || 'Déconnexion')}
                    </Button>
                </div>

                {/* Footer info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="text-center mt-12"
                >
                </motion.div>
            </main>

        </div>
    )
}