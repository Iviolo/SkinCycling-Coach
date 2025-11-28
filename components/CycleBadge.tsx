import React from 'react';

interface CycleBadgeProps {
  night: number;
}

const CycleBadge: React.FC<CycleBadgeProps> = ({ night }) => {
  // Orange #f4a460, Pink #e084d9, Green #7db8a8
  const colors = {
    1: 'bg-[#f4a460]/10 text-[#f4a460] border-[#f4a460]/20', // Night 1 - Orange
    2: 'bg-[#e084d9]/10 text-[#e084d9] border-[#e084d9]/20', // Night 2 - Pink
    3: 'bg-[#7db8a8]/10 text-[#7db8a8] border-[#7db8a8]/20', // Night 3 - Green
    4: 'bg-[#7db8a8]/10 text-[#7db8a8] border-[#7db8a8]/20', // Night 4 - Green
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