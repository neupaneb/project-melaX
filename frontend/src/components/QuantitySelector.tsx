import React from 'react';
import { Button } from './ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 10,
  disabled = false
}) => {
  const handleDecrease = () => {
    if (quantity > min && !disabled) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max && !disabled) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrease}
        disabled={quantity <= min || disabled}
        className="w-8 h-8 p-0 rounded-full"
      >
        <Minus className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center justify-center min-w-[3rem]">
        <span className="text-lg font-semibold">{quantity}</span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrease}
        disabled={quantity >= max || disabled}
        className="w-8 h-8 p-0 rounded-full"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};

