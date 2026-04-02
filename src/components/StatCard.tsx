import React from 'react';
import { useCounter } from '../hooks/useCounter';

interface StatCardProps {
  value: number;
  label: string;
  inView: boolean;
}

export const StatCard = ({ value, label, inView }: StatCardProps) => {
  const count = useCounter(inView ? value : 0, 1000); 
  
  return (
    <div className="p-4 rounded-lg bg-gray-800/50">
      <h3 className="text-3xl font-bold text-white mb-2">
        {count}+
      </h3>
      <p className="text-gray-400">{label}</p>
    </div>
  );
};