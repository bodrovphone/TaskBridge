'use client'

import { usePathname } from "next/navigation"
import { LocaleLink } from "@/components/locale-link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from 'react-i18next'
import { Handshake, Plus } from "lucide-react"
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle, 
  NavbarMenu, 
  NavbarMenuItem,
  Button,
  Link as NextUILink
} from "@nextui-org/react"

function Header() {
  const pathname = usePathname()
  const { t } = useTranslation()

  // Authentication is currently disabled - always show non-authenticated state

  const navigation = [
    { name: t('nav.browseTasks'), href: "/browse-tasks" },
    { name: t('nav.howItWorks'), href: "/#how-it-works" },
    { name: t('nav.categories'), href: "/#categories" },
    { name: t('nav.forProfessionals'), href: "/#for-professionals" },
  ]

  return (
    <Navbar 
      maxWidth="xl"
      position="sticky"
      className="bg-white shadow-sm border-b border-gray-100"
      height="4rem"
      isBordered
    >
      {/* Logo/Brand */}
      <NavbarBrand>
        <LocaleLink href="/" className="flex items-center">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-2">
            <Handshake className="text-white" size={16} />
          </div>
          <span className="text-xl font-bold text-gray-900">Trudify</span>
        </LocaleLink>
      </NavbarBrand>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden md:flex gap-8" justify="center">
        {navigation.map((item) => (
          <NavbarItem key={item.name}>
            <NextUILink
              as={Link}
              href={item.href}
              className="text-gray-900 hover:text-primary font-medium transition-colors relative"
              underline="hover"
            >
              {item.name}
            </NextUILink>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Actions Section */}
      <NavbarContent justify="end">
        <NavbarItem className="hidden md:flex">
          <LanguageSwitcher />
        </NavbarItem>
        <NavbarItem>
          <Button 
            as={Link}
            href="/create-task"
            color="primary"
            variant="solid"
            startContent={<Plus size={16} />}
            className="font-medium"
          >
            {t('nav.createTask')}
          </Button>
        </NavbarItem>
        <NavbarMenuToggle className="md:hidden" />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-white">
        {navigation.map((item) => (
          <NavbarMenuItem key={item.name}>
            <NextUILink
              as={Link}
              href={item.href}
              className="w-full text-gray-900 hover:text-primary font-medium py-2"
              size="lg"
            >
              {item.name}
            </NextUILink>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <div className="pt-4 border-t border-gray-200 w-full">
            <LanguageSwitcher />
          </div>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}

Header.displayName = 'Header'

export default Header