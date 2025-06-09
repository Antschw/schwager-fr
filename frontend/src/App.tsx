import {useEffect, useState} from 'react'
import {motion} from 'framer-motion'
import {useTranslation} from 'react-i18next'
import {
    addToast,
    Button,
    Card,
    CardBody,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Form,
    Input,
    Link
} from '@heroui/react'
import {Icon} from '@iconify/react'
import {useTheme} from '@heroui/use-theme'

interface LoginForm {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function App() {
    const { theme, setTheme } = useTheme();
    const { i18n, t } = useTranslation();
    const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const isDark = theme === 'dark';

    // Apply theme class to document element
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme || 'light');
    }, [theme]);

    const languages = [
        { key: 'fr', label: t('common.french'), flag: '🇫🇷' },
        { key: 'en', label: t('common.english'), flag: '🇺🇸' },
    ];

    const currentLanguage = languages.find(lang => lang.key === i18n.language) || languages[0];

    const handleLanguageChange = (language: string) => {
        i18n.changeLanguage(language);
    };

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email) {
            newErrors.email = t('login.invalidEmail');
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = t('login.invalidEmail');
        }

        // Password validation
        if (!form.password) {
            newErrors.password = t('login.passwordRequired');
        } else if (form.password.length < 6) {
            newErrors.password = t('login.minPasswordLength');
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
            // Use environment variables for API URL
            const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/auth-api'}/auth/login`;

            console.log('Attempting login to:', apiUrl); // Debug log

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify(form),
            });

            console.log('Response status:', response.status); // Debug log

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);

                // Show success toast with HeroUI
                addToast({
                    title: t('login.successMessage'),
                    description: `${t('login.welcomeBack')} ${data.user?.firstName || ''}`,
                    color: "success",
                    icon: <Icon icon="lucide:check-circle" />,
                });

                // Wait a bit for the toast, then redirect to hub
                setTimeout(() => {
                    window.location.href = import.meta.env.VITE_HUB_URL || 'http://localhost:3001';
                }, 2000);

            } else {
                const errorData = await response.json();
                console.log('Login failed:', errorData); // Debug log

                if (response.status === 401) {
                    setErrors({ general: t('errors.invalidCredentials') });
                    addToast({
                        title: t('errors.authenticationFailed'),
                        description: t('errors.invalidCredentials'),
                        color: "danger",
                        icon: <Icon icon="lucide:x-circle" />,
                    });
                } else {
                    const errorMessage = errorData.message || t('errors.serverError');
                    setErrors({ general: errorMessage });
                    addToast({
                        title: t('errors.loginFailed'),
                        description: errorMessage,
                        color: "danger",
                        icon: <Icon icon="lucide:alert-circle" />,
                    });
                }
            }
        } catch (error) {
            console.error('Network error:', error);
            const networkError = t('errors.networkError');
            setErrors({ general: networkError });
            addToast({
                title: t('errors.connectionFailed'),
                description: networkError,
                color: "danger",
                icon: <Icon icon="lucide:wifi-off" />,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        // Clear errors when user starts typing
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
                    {/* Language Switcher */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="text-default-500 hover:text-default-700"
                                    startContent={
                                        <motion.span
                                            whileHover={{ scale: 1.2 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {currentLanguage.flag}
                                        </motion.span>
                                    }
                                >
                                    {currentLanguage.key.toUpperCase()}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Language selection"
                                onAction={(key) => handleLanguageChange(key as string)}
                            >
                                {languages.map((language) => (
                                    <DropdownItem
                                        key={language.key}
                                        startContent={language.flag}
                                        className={i18n.language === language.key ? "bg-primary/10" : ""}
                                    >
                                        {language.label}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </motion.div>

                    {/* Theme Switcher */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={toggleTheme}
                            aria-label={isDark ? t('common.lightMode') : t('common.darkMode')}
                            className="text-default-500 hover:text-default-700"
                        >
                            <motion.div
                                key={theme}
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Icon
                                    icon={isDark ? "lucide:sun" : "lucide:moon"}
                                    className="w-5 h-5"
                                />
                            </motion.div>
                        </Button>
                    </motion.div>
                </div>
            </motion.header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Site name */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold font-helvetica text-foreground">
                            {t('common.siteName')}
                        </h1>
                    </motion.div>

                    {/* Login card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Card className="shadow-2xl bg-content1 border-1 border-default-200">
                            <CardBody className="p-6 md:p-8">
                                <motion.div
                                    className="flex items-center justify-between mb-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                                        {t('login.title')}
                                    </h2>
                                </motion.div>

                                {/* General error message */}
                                {errors.general && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg"
                                    >
                                        <p className="text-danger text-sm">{errors.general}</p>
                                    </motion.div>
                                )}

                                <Form onSubmit={handleSubmit} className="flex flex-col space-y-6">
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
                                            label={t('login.email')}
                                            placeholder={t('login.emailPlaceholder')}
                                            value={form.email}
                                            onChange={handleInputChange('email')}
                                            isInvalid={!!errors.email}
                                            errorMessage={errors.email}
                                            variant="bordered"
                                            size="lg"
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
                                            label={t('login.password')}
                                            placeholder={t('login.passwordPlaceholder')}
                                            value={form.password}
                                            onChange={handleInputChange('password')}
                                            isInvalid={!!errors.password}
                                            errorMessage={errors.password}
                                            variant="bordered"
                                            size="lg"
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
                                            {t('login.forgotPassword')}
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
                                            size="lg"
                                            className="w-full font-semibold"
                                            isLoading={isLoading}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? t('login.loading') : t('login.submitButton')}
                                        </Button>
                                    </motion.div>
                                </Form>
                            </CardBody>
                        </Card>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}