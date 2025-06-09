import { useTheme } from '@heroui/use-theme'
import { Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme()
    const { t } = useTranslation()

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Button
                isIconOnly
                variant="ghost"
                onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label={
                    theme === 'light' ? t('common.darkMode') : t('common.lightMode')
                }
                className="
          text-gray-600 dark:text-gray-300
          hover:text-gray-800 dark:hover:text-gray-100
          transition-colors duration-300
        "
            >
                <motion.span
                    key={theme}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </motion.span>
            </Button>
        </motion.div>
    )
}
