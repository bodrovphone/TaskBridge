'use client'

import { useState } from 'react'
import { Card, CardBody, Button, Input, Textarea, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Image } from '@nextui-org/react'
import { Plus, Edit, Trash2, X, Save, Clock, Image as ImageIcon } from 'lucide-react'
import { getCategoryLabelBySlug } from '@/features/categories'
import { useTranslation } from 'react-i18next'

interface PortfolioItem {
  id: string
  title: string
  beforeImage: string
  afterImage: string
  description: string
  duration: string
  tags: string[] // Category slugs
}

interface PortfolioGalleryManagerProps {
  items: PortfolioItem[]
  onChange: (items: PortfolioItem[]) => void
  maxItems?: number
}

export function PortfolioGalleryManager({
  items,
  onChange,
  maxItems = 6
}: PortfolioGalleryManagerProps) {
  const { t } = useTranslation()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    title: '',
    beforeImage: '',
    afterImage: '',
    description: '',
    duration: '',
    tags: []
  })

  const openAddModal = () => {
    setFormData({
      title: '',
      beforeImage: '',
      afterImage: '',
      description: '',
      duration: '',
      tags: []
    })
    setEditingItem(null)
    setIsAddModalOpen(true)
  }

  const openEditModal = (item: PortfolioItem) => {
    setFormData(item)
    setEditingItem(item)
    setIsAddModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.beforeImage || !formData.afterImage) {
      alert('Please fill in title and both images')
      return
    }

    if (editingItem) {
      // Update existing item
      onChange(items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData } as PortfolioItem
          : item
      ))
    } else {
      // Add new item
      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        title: formData.title,
        beforeImage: formData.beforeImage || '',
        afterImage: formData.afterImage || '',
        description: formData.description || '',
        duration: formData.duration || '',
        tags: formData.tags || []
      }
      onChange([...items, newItem])
    }

    setIsAddModalOpen(false)
    setFormData({})
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
      onChange(items.filter(item => item.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <Card key={item.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardBody className="p-4 space-y-3">
                {/* Before/After Images */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-medium">Before</p>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {item.beforeImage ? (
                        <Image
                          src={item.beforeImage}
                          alt="Before"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-medium">After</p>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {item.afterImage ? (
                        <Image
                          src={item.afterImage}
                          alt="After"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  )}
                </div>

                {/* Duration & Tags */}
                <div className="flex items-center justify-between gap-3">
                  {item.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap font-medium">{item.duration}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 justify-end">
                    {item.tags.slice(0, 2).map(tag => (
                      <Chip key={tag} size="sm" variant="flat" color="primary" className="text-xs">
                        {getCategoryLabelBySlug(tag, t)}
                      </Chip>
                    ))}
                    {item.tags.length > 2 && (
                      <Chip size="sm" variant="flat" className="text-xs">
                        +{item.tags.length - 2}
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Edit className="w-3 h-3" />}
                    onPress={() => openEditModal(item)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<Trash2 className="w-3 h-3" />}
                    onPress={() => handleDelete(item.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No portfolio items yet</p>
          <Button
            color="primary"
            variant="flat"
            startContent={<Plus className="w-4 h-4" />}
            onPress={openAddModal}
          >
            Add Your First Portfolio Item
          </Button>
        </div>
      )}

      {/* Add Button (when items exist) */}
      {items.length > 0 && items.length < maxItems && (
        <Button
          color="primary"
          variant="bordered"
          startContent={<Plus className="w-4 h-4" />}
          onPress={openAddModal}
          className="w-full"
        >
          Add Portfolio Item ({items.length}/{maxItems})
        </Button>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Title */}
              <Input
                label="Project Title"
                placeholder="e.g., Deep cleaning of apartment"
                value={formData.title || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                isRequired
              />

              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Before Image URL"
                  placeholder="https://..."
                  value={formData.beforeImage || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, beforeImage: value }))}
                  isRequired
                  description="URL to before image"
                />
                <Input
                  label="After Image URL"
                  placeholder="https://..."
                  value={formData.afterImage || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, afterImage: value }))}
                  isRequired
                  description="URL to after image"
                />
              </div>

              {/* Image Preview */}
              {(formData.beforeImage || formData.afterImage) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Before Preview</p>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {formData.beforeImage && (
                        <Image
                          src={formData.beforeImage}
                          alt="Before preview"
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">After Preview</p>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {formData.afterImage && (
                        <Image
                          src={formData.afterImage}
                          alt="After preview"
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="Describe the work done, techniques used, challenges overcome..."
                value={formData.description || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                minRows={3}
                maxRows={5}
              />

              {/* Duration */}
              <Input
                label="Duration (Optional)"
                placeholder="e.g., 4 hours, 2 days"
                value={formData.duration || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                startContent={<Clock className="w-4 h-4 text-gray-400" />}
              />

              {/* Tags Note */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 Tags will be automatically added based on your selected service categories
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={() => setIsAddModalOpen(false)}
              startContent={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              startContent={<Save className="w-4 h-4" />}
            >
              {editingItem ? 'Update' : 'Add'} Portfolio Item
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
