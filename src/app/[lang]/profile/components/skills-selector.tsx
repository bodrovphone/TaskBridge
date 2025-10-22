'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Chip, Button, Card, CardBody } from '@heroui/react'
import { Plus, X, Search } from 'lucide-react'

interface SkillsSelectorProps {
 selectedSkills: string[]
 onChange: (skills: string[]) => void
}

// Predefined skills based on common freelance categories
const predefinedSkills = [
 // Development
 'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'PHP', 'Vue.js', 'Angular', 'Next.js',
 'Express.js', 'MongoDB', 'PostgreSQL', 'MySQL', 'GraphQL', 'REST API', 'Docker', 'AWS', 'Git',

 // Design
 'UI/UX Design', 'Graphic Design', 'Logo Design', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator',
 'Sketch', 'Prototyping', 'Wireframing', 'Brand Design', 'Web Design', 'Mobile Design',

 // Marketing
 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Google Ads',
 'Facebook Ads', 'Copywriting', 'Content Writing', 'Blog Writing', 'Technical Writing',

 // Business
 'Project Management', 'Business Analysis', 'Data Analysis', 'Market Research', 'Strategy Consulting',
 'Financial Analysis', 'Excel', 'PowerPoint', 'Presentation Design',

 // Other
 'Video Editing', 'Photography', 'Translation', 'Voice Over', 'Animation', '3D Modeling',
 'Game Development', 'Mobile App Development', 'E-commerce', 'WordPress', 'Shopify'
]

export function SkillsSelector({ selectedSkills, onChange }: SkillsSelectorProps) {
 const { t } = useTranslation()
 const [searchTerm, setSearchTerm] = useState('')
 const [customSkill, setCustomSkill] = useState('')

 const filteredSkills = predefinedSkills.filter(skill =>
  skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
  !selectedSkills.includes(skill)
 )

 const handleAddSkill = (skill: string) => {
  if (!selectedSkills.includes(skill)) {
   onChange([...selectedSkills, skill])
  }
 }

 const handleRemoveSkill = (skillToRemove: string) => {
  onChange(selectedSkills.filter(skill => skill !== skillToRemove))
 }

 const handleAddCustomSkill = () => {
  const trimmedSkill = customSkill.trim()
  if (trimmedSkill && !selectedSkills.includes(trimmedSkill)) {
   onChange([...selectedSkills, trimmedSkill])
   setCustomSkill('')
  }
 }

 const handleCustomSkillKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
   e.preventDefault()
   handleAddCustomSkill()
  }
 }

 return (
  <div className="space-y-4">
   {/* Selected Skills */}
   {selectedSkills.length > 0 && (
    <div>
     <p className="text-sm text-gray-600 mb-2">
      {t('profile.professional.form.selectedSkills')} ({selectedSkills.length})
     </p>
     <div className="flex flex-wrap gap-2">
      {selectedSkills.map((skill) => (
       <Chip
        key={skill}
        variant="flat"
        color="primary"
        onClose={() => handleRemoveSkill(skill)}
       >
        {skill}
       </Chip>
      ))}
     </div>
    </div>
   )}

   {/* Search Skills */}
   <div>
    <Input
     placeholder={t('profile.professional.form.searchSkills')}
     value={searchTerm}
     onValueChange={setSearchTerm}
     startContent={<Search className="w-4 h-4 text-gray-400" />}
     isClearable
     onClear={() => setSearchTerm('')}
    />
   </div>

   {/* Filtered Skills */}
   {filteredSkills.length > 0 && (
    <Card>
     <CardBody className="p-4">
      <p className="text-sm text-gray-600 mb-3">
       {t('profile.professional.form.suggestedSkills')}
      </p>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
       {filteredSkills.slice(0, 20).map((skill) => (
        <Chip
         key={skill}
         variant="bordered"
         className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
         onClick={() => handleAddSkill(skill)}
        >
         {skill}
        </Chip>
       ))}
      </div>
      {filteredSkills.length > 20 && (
       <p className="text-xs text-gray-500 mt-2">
        {t('profile.professional.form.moreSkillsAvailable', { count: filteredSkills.length - 20 })}
       </p>
      )}
     </CardBody>
    </Card>
   )}

   {/* Add Custom Skill */}
   <div>
    <p className="text-sm text-gray-600 mb-2">
     {t('profile.professional.form.addCustomSkill')}
    </p>
    <div className="flex gap-2">
     <Input
      placeholder={t('profile.professional.form.customSkillPlaceholder')}
      value={customSkill}
      onValueChange={setCustomSkill}
      onKeyPress={handleCustomSkillKeyPress}
      className="flex-1"
     />
     <Button
      isIconOnly
      color="primary"
      variant="flat"
      onPress={handleAddCustomSkill}
      isDisabled={!customSkill.trim() || selectedSkills.includes(customSkill.trim())}
     >
      <Plus className="w-4 h-4" />
     </Button>
    </div>
   </div>

   {/* Skills Limit Notice */}
   {selectedSkills.length >= 10 && (
    <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
     <p className="text-sm text-warning-700">
      {t('profile.professional.form.skillsLimitNotice')}
     </p>
    </div>
   )}
  </div>
 )
}