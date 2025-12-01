
import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-secondary text-white hover:bg-green-600 focus:ring-green-500',
    outline: 'bg-transparent border border-primary text-primary hover:bg-indigo-50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
