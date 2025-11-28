import React from 'react';

interface CycleBadgeProps {
  night: number;
}

const CycleBadge: React.FC<CycleBadgeProps> = ({ night }) => {
  const colors = {
    1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    2: 'bg-purple-100 text-purple-700 border-purple-200',
    3: 'bg-sky-100 text-sky-700 border-sky-200',
    4: 'bg-sky-100 text-sky-700 border-sky-200',
  };

  const labels = {
    1: 'Esfoliazione',
    2: 'Retinoide',
    3: 'Recupero',
    4: 'Recupero'
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[night as keyof typeof colors] || colors[4]}`}>
      Notte {night}: {labels[night as keyof typeof labels]}
    </div>
  );
};

export default CycleBadge;