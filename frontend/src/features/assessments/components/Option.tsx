import React from 'react';
import { Option as OptionType } from '../types';

interface OptionProps {
  option: OptionType | string;
  index: number;
  isSelected: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export const Option: React.FC<OptionProps> = ({
  option,
  index,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const optionValue = typeof option === 'string' ? option : option.text || option.id;
  const optionLabel = typeof option === 'string' ? option : option.text;
  const optionId = `option-${index}-${optionValue}`;

  return (
    <label
      htmlFor={optionId}
      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300 font-medium shadow-sm'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-850'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input
        type="radio"
        id={optionId}
        name="quiz-option"
        value={optionValue}
        checked={isSelected}
        onChange={() => onSelect(optionValue)}
        disabled={disabled}
        className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-900 dark:bg-gray-800 dark:border-gray-700"
      />
      <span className="ml-3 text-base flex-1">{optionLabel}</span>
    </label>
  );
};
