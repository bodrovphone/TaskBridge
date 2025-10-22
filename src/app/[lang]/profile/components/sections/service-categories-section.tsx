'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { FileText, Edit, X, Save } from 'lucide-react'
import { ServiceCategoriesSelector } from '../service-categories-selector'

interface ServiceCategoriesSectionProps {
  serviceCategories: string[]
  onSave: (categories: string[]) => void
}

export function ServiceCategoriesSection({ serviceCategories, onSave }: ServiceCategoriesSectionProps) {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempCategories, setTempCategories] = useState<string[]>([])

  const openModal = () => {
    setTempCategories(serviceCategories)
    setIsModalOpen(true)
  }

  const saveModal = () => {
    onSave(tempCategories)
    setIsModalOpen(false)
  }

  const cancelModal = () => {
    setTempCategories([])
    setIsModalOpen(false)
  }

  return (
    <>
      <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-100 flex-shrink-0">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {t('profile.professional.serviceCategories')}
              </h3>
            </div>
            {serviceCategories.length > 0 && (
              <Button
                size="sm"
                startContent={<Edit className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                onPress={openModal}
                className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 flex-shrink-0 text-xs md:text-sm"
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="space-y-4 px-4 md:px-6 py-6">
          {serviceCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {serviceCategories.map(category => (
                <Chip key={category} variant="flat" color="primary" className="shadow-sm">
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Chip>
              ))}
            </div>
          ) : (
            // Empty state - Call to Action
            <div className="text-center py-10 px-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border-2 border-dashed border-blue-200 overflow-hidden">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  {t('profile.professional.addServiceCategories')}
                </h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                  {t('profile.professional.categoriesHelp')}
                </p>
                <div className="pt-2">
                  <Button
                    size="lg"
                    color="primary"
                    onPress={openModal}
                    className="font-semibold shadow-lg"
                  >
                    {t('profile.professional.selectCategories')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Service Categories Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={cancelModal}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('profile.professional.selectCategories')}
          </ModalHeader>
          <ModalBody>
            <ServiceCategoriesSelector
              selectedCategories={tempCategories}
              onChange={setTempCategories}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={cancelModal}
              startContent={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={saveModal}
              startContent={<Save className="w-4 h-4" />}
            >
              Save Categories
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
