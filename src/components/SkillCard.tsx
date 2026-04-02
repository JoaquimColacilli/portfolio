import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SkillCardProps {
    name: string;
    icon: React.ReactNode;
    skills: string[];
    delay: number;
    inView: boolean;
    currentLang: string; 
}
export const SkillCard: React.FC<SkillCardProps> = ({
  name,
  icon,
  skills,
  delay,
  inView,
  currentLang
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedSkills = isExpanded ? skills : skills.slice(0, 4);
  const hasMoreSkills = skills.length > 4;

  return (
    <div 
      className={`group relative bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all duration-500 transform ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-700/50 rounded-lg text-emerald-400">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white">{name}</h3>
        </div>
        <div className="space-y-3">
          {displayedSkills.map((skill) => (
            <div key={skill} className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-400 rounded-full" />
              <span className="text-gray-300">{skill}</span>
            </div>
          ))}
        </div>
        {hasMoreSkills && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white group"
          >
<span>{isExpanded ? (currentLang === 'es' ? 'Mostrar Menos' : 'Show Less') : (currentLang === 'es' ? 'Mostrar Más' : 'Show More')}</span>
{isExpanded ? (
              <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};