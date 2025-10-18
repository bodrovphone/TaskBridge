'use client'

import { Avatar } from "@nextui-org/react";
import { User, UserCheck } from "lucide-react";

interface FallbackAvatarProps {
 src?: string;
 name: string;
 size?: "sm" | "md" | "lg";
 className?: string;
 gender?: 'male' | 'female' | null;
}

// Generate consistent colors based on name
function getAvatarColors(name: string, gender?: 'male' | 'female' | null) {
 const hash = name.split('').reduce((a, b) => {
  a = ((a << 5) - a) + b.charCodeAt(0);
  return a & a;
 }, 0);

 const baseColors = {
  male: [
   { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-green-400 to-green-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-purple-400 to-purple-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-indigo-400 to-indigo-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-teal-400 to-teal-600', text: 'text-white' },
  ],
  female: [
   { bg: 'bg-gradient-to-br from-pink-400 to-pink-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-purple-400 to-purple-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-rose-400 to-rose-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-violet-400 to-violet-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600', text: 'text-white' },
  ],
  default: [
   { bg: 'bg-gradient-to-br from-gray-400 to-gray-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-slate-400 to-slate-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-zinc-400 to-zinc-600', text: 'text-white' },
   { bg: 'bg-gradient-to-br from-neutral-400 to-neutral-600', text: 'text-white' },
  ]
 };

 const colorSet = gender ? baseColors[gender] : baseColors.default;
 return colorSet[Math.abs(hash) % colorSet.length];
}

// Detect gender from Bulgarian names
function detectGender(name: string): 'male' | 'female' | null {
 const firstName = name.split(' ')[0].toLowerCase();
 
 // Bulgarian female name endings
 const femaleEndings = ['а', 'я', 'ка', 'на', 'та', 'ла', 'ра', 'са'];
 // Bulgarian male name patterns
 const maleNames = ['георги', 'петър', 'иван', 'димитър', 'стефан', 'николай', 'александър'];
 const femaleNames = ['мария', 'елена', 'анна', 'десислава', 'радост', 'надежда'];
 
 // Check explicit name lists first
 if (maleNames.some(male => firstName.includes(male))) return 'male';
 if (femaleNames.some(female => firstName.includes(female))) return 'female';
 
 // Check endings
 if (femaleEndings.some(ending => firstName.endsWith(ending))) return 'female';
 
 return 'male'; // Default to male for Bulgarian context
}

export default function FallbackAvatar({ 
 src, 
 name, 
 size = "lg", 
 className = "",
 gender 
}: FallbackAvatarProps) {
 // Auto-detect gender if not provided
 const detectedGender = gender || detectGender(name);
 const colors = getAvatarColors(name, detectedGender);
 
 // Get initials from name
 const getInitials = (name: string) => {
  return name
   .split(' ')
   .map(word => word.charAt(0))
   .join('')
   .toUpperCase()
   .slice(0, 2);
 };

 // If src is provided and loads successfully, use regular Avatar
 if (src) {
  return (
   <div className="relative">
    <Avatar
     src={src}
     name={name}
     size={size}
     className={`ring-4 ring-gray-100 hover:ring-blue-200 transition-all duration-300 ${className}`}
     fallback={
      <div className={`w-full h-full ${colors.bg} ${colors.text} flex items-center justify-center font-bold rounded-full`}>
       {getInitials(name)}
      </div>
     }
    />
   </div>
  );
 }

 // Return custom fallback avatar
 return (
  <div className={`relative ${className}`}>
   <div className={`
    ${colors.bg} ${colors.text} 
    ${size === 'sm' ? 'w-8 h-8 text-xs' : 
     size === 'md' ? 'w-12 h-12 text-sm' : 
     'w-16 h-16 text-lg'} 
    rounded-full flex items-center justify-center font-bold
    transition-transform duration-200 hover:scale-105
   `}>
    {getInitials(name)}
   </div>
   
   {/* Gender indicator icon */}
   <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center">
    {detectedGender === 'female' ? (
     <div className="w-2.5 h-2.5 bg-pink-400 rounded-full"></div>
    ) : (
     <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
    )}
   </div>
  </div>
 );
}