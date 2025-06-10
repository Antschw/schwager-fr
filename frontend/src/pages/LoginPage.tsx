import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    Button,
    Card,
    CardBody,
    Input,
    Link,
    Spinner
} from '@heroui/react'
import { Icon } from '@iconify/react'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import ThemeSwitcher from '../components/ui/ThemeSwitcher'
import useAuth from '../hooks/useAuth'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface LoginForm {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, loading: authLoading, refreshUser, isInitialized } = useAuth();
    const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)'); // md breakpoint

    // Rediriger vers le hub si l'utilisateur est déjà connecté
    useEffect(() => {
        if (isInitialized && !authLoading && user) {
            navigate('/hub', { replace: true });
        }
    }, [user, authLoading, isInitialized, navigate]);

    // Afficher un spinner pendant la vérification initiale de l'authentification
    if (!isInitialized || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-default-100">
                <div className="text-center">
                    <Spinner
                        size="lg"
                        color="primary"
                        className="mb-4"
                    />
                    <p className="text-foreground/70">Chargement...</p>
                </div>
            </div>
        );
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email) {
            newErrors.email = t('login.invalidEmail') || 'Email invalide';
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = t('login.invalidEmail') || 'Email invalide';
        }

        // Password validation
        if (!form.password) {
            newErrors.password = t('login.passwordRequired') || 'Mot de passe requis';
        } else if (form.password.length < 6) {
            newErrors.password = t('login.minPasswordLength') || 'Le mot de passe doit contenir au moins 6 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://schwager.fr';
            const loginUrl = `${apiUrl}/auth-api/auth/login`;

            console.log('Tentative de connexion à:', loginUrl);

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important pour les cookies
                body: JSON.stringify(form),
            });

            console.log('Statut de la réponse:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Connexion réussie:', data);

                // Rafraîchir les données utilisateur
                const userData = await refreshUser();

                if (userData) {
                    // Rediriger vers la page hub
                    navigate('/hub', { replace: true });
                } else {
                    setErrors({ general: 'Erreur lors de la récupération des données utilisateur' });
                }

            } else {
                const errorData = await response.json().catch(() => ({}));
                console.log('Échec de la connexion:', errorData);

                if (response.status === 401) {
                    setErrors({
                        general: t('errors.invalidCredentials') || 'Email ou mot de passe incorrect'
                    });
                } else if (response.status === 429) {
                    setErrors({
                        general: t('errors.tooManyAttempts') || 'Trop de tentatives, veuillez réessayer plus tard'
                    });
                } else {
                    const errorMessage = errorData.message || t('errors.serverError') || 'Erreur serveur';
                    setErrors({ general: errorMessage });
                }
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            const networkError = t('errors.networkError') || 'Erreur de connexion réseau';
            setErrors({ general: networkError });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        // Effacer les erreurs quand l'utilisateur commence à taper
        if (errors[field] || errors.general) {
            setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-default-100 flex flex-col">
            {/* Header with theme and language switchers */}
            <motion.header
                className="absolute top-0 right-0 p-4 z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                </div>
            </motion.header>

            {/* Main content */}
            <main className={`flex-1 flex items-center justify-center p-4 ${isMobile ? 'pt-8' : ''}`}>
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Site name */}
                    <motion.div
                        className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <h1 className={`font-bold font-helvetica text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`}>
                            {t('common.siteName') || 'schwager.fr'}
                        </h1>
                    </motion.div>

                    {/* Login card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Card className="shadow-2xl bg-content1 border-1 border-default-200">
                            <CardBody className={`${isMobile ? 'p-4 md:p-6' : 'p-6 md:p-8'}`}>
                                <motion.div
                                    className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-6'}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    <h2 className={`font-semibold text-foreground ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                                        {t('login.title') || 'Connexion'}
                                    </h2>
                                </motion.div>

                                {/* General error message */}
                                {errors.general && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon icon="lucide:alert-circle" className="text-danger" />
                                            <p className="text-danger text-sm">{errors.general}</p>
                                        </div>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className={`flex flex-col ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                        className="w-full"
                                    >
                                        <Input
                                            isRequired
                                            name="email"
                                            type="email"
                                            label={t('login.email') || 'Email'}
                                            placeholder={t('login.emailPlaceholder') || 'votre@email.com'}
                                            value={form.email}
                                            onChange={handleInputChange('email')}
                                            isInvalid={!!errors.email}
                                            errorMessage={errors.email}
                                            variant="bordered"
                                            size={isMobile ? "md" : "lg"}
                                            className="w-full"
                                            classNames={{
                                                input: "text-foreground",
                                                label: "text-foreground/70",
                                                inputWrapper: "w-full",
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                        className="w-full"
                                    >
                                        <Input
                                            isRequired
                                            name="password"
                                            type="password"
                                            label={t('login.password') || 'Mot de passe'}
                                            placeholder={t('login.passwordPlaceholder') || '••••••••'}
                                            value={form.password}
                                            onChange={handleInputChange('password')}
                                            isInvalid={!!errors.password}
                                            errorMessage={errors.password}
                                            variant="bordered"
                                            size={isMobile ? "md" : "lg"}
                                            className="w-full"
                                            classNames={{
                                                input: "text-foreground",
                                                label: "text-foreground/70",
                                                inputWrapper: "w-full",
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="flex justify-end w-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7, duration: 0.5 }}
                                    >
                                        <Link href="#" size="sm" color="primary">
                                            {t('login.forgotPassword') || 'Mot de passe oublié ?'}
                                        </Link>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8, duration: 0.5 }}
                                        className="w-full"
                                    >
                                        <Button
                                            type="submit"
                                            color="primary"
                                            size={isMobile ? "md" : "lg"}
                                            className="w-full font-semibold"
                                            isLoading={isLoading}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (t('login.loading') || 'Connexion...') : (t('login.submitButton') || 'Se connecter')}
                                        </Button>
                                    </motion.div>
                                </form>
                            </CardBody>
                        </Card>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}