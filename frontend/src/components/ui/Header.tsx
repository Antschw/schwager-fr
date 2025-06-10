import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

interface HeaderProps {
    /** Titre personnalisé à afficher (optionnel, utilise siteName par défaut) */
    title?: string
    /** Contenu supplémentaire à afficher à droite des contrôles (optionnel) */
    rightContent?: React.ReactNode
    /** Contenu supplémentaire à afficher à gauche du titre (optionnel) */
    leftContent?: React.ReactNode
    /** Classes CSS supplémentaires (optionnel) */
    className?: string
    /** Désactiver les animations (optionnel) */
    disableAnimations?: boolean
}

export default function Header({
                                   title,
                                   rightContent,
                                   leftContent,
                                   className = "",
                                   disableAnimations = false
                               }: HeaderProps) {
    const { t } = useTranslation()

    const headerContent = (
        <header
            className={`w-full p-4 flex justify-between items-center border-b border-default-200/50 backdrop-blur-sm bg-background/80 ${className}`}
        >
            <div className="flex items-center gap-4">
                {leftContent}
                <h1 className="text-xl sm:text-2xl font-bold font-helvetica text-foreground">
                    {title || t('common.siteName') || 'schwager.fr'}
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
                {rightContent}
            </div>
        </header>
    )

    // Retourner avec ou sans animation selon le paramètre
    if (disableAnimations) {
        return headerContent
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {headerContent}
        </motion.div>
    )
}