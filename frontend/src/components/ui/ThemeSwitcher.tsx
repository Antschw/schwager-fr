import { useTheme } from '@heroui/use-theme'
import { Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { useEffect } from 'react'

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const { t } = useTranslation()

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme || 'light')
    }, [theme])

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Button
                isIconOnly
                variant="light"
                onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label={
                    theme === 'light' ? t('common.darkMode') : t('common.lightMode')
                }
                className="text-default-500 hover:text-default-700"
            >
                <motion.div
                    key={theme}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                >
                    <Icon
                        icon={theme === 'light' ? "lucide:moon" : "lucide:sun"}
                        className="w-5 h-5"
                    />
                </motion.div>
            </Button>
        </motion.div>
    )
}