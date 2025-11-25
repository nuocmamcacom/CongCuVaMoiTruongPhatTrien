import React from 'react';
import './Card.scss';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  const cardClass = [
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    hover && 'card--hover',
    interactive && 'card--interactive',
    onClick && 'card--clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClass}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;