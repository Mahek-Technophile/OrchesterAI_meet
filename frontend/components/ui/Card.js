const Card = ({ children, className = '', title, subtitle, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="p-6 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className={title || subtitle ? 'p-6' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default Card;