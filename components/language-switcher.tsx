'use client'

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from '@nextui-org/react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[1]; // Default to Bulgarian

  const handleLanguageChange = (key: any) => {
    const languageCode = key as string;
    i18n.changeLanguage(languageCode);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="light" 
          size="sm"
          startContent={<Globe size={16} />}
          className="h-8 px-2 gap-1"
        >
          <span>{currentLanguage.flag}</span>
          <span className="text-sm hidden sm:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Language selection"
        onAction={handleLanguageChange}
        selectedKeys={new Set([i18n.language])}
        selectionMode="single"
      >
        {languages.map((language) => (
          <DropdownItem
            key={language.code}
            startContent={<span className="text-lg">{language.flag}</span>}
          >
            {language.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}