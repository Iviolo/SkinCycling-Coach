import React from 'react';
import { NIGHT_COLORS } from '../constants';

interface CycleBadgeProps {
  night: number;
}

const CycleBadge: React.FC<CycleBadgeProps> = ({ night }) => {
  // Map night number to hex color
  // Night 1: Orange, Night 2: Pink, Night 3/4: Green
  const getColor = (n: number) => {
      switch(n) {
          case 1: return NIGHT_COLORS.night_1;
          case 2: return NIGHT_COLORS.night_2;
          default: return NIGHT_COLORS.night_3_4;
      }
  };

  const color = getColor(night);

  const labels: Record<number, string> = {
    1: 'Esfoliazione',
    2: 'Retinoide',
    3: 'Recupero',
    4: 'Recupero'
  };

  return (
    <div 
        className="px-3 py-1 rounded-full text-xs font-semibold border"
        style={{ 
            backgroundColor: `${color}1A`, // 10% opacity (approx hex 1A)
            color: color, 
            borderColor: `${color}33` // 20% opacity (approx hex 33)
        }}
    >
      Notte {night}: {labels[night] || labels[4]}
    </div>
  );
};

export default CycleBadge;