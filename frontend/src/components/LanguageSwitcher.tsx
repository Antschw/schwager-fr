import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();

    const languages = [
        { key: 'fr', label: t('common.french'), flag: '🇫🇷' },
        { key: 'en', label: t('common.english'), flag: '🇺🇸' },
    ];

    const currentLanguage = languages.find(lang => lang.key === i18n.language) || languages[0];

    const handleLanguageChange = (language: string) => {
        i18n.changeLanguage(language);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
        >
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="ghost"
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
    );
};