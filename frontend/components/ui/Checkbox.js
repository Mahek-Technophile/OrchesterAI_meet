import { forwardRef } from 'react';

const Checkbox = forwardRef(({ 
  label, 
  description,
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="checkbox mt-0.5"
        {...props}
      />
      <div className="flex-1 min-w-0">
        {label && (
          <label className="block text-sm font-medium text-gray-900 cursor-pointer">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;