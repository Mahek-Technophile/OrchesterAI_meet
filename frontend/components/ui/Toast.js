import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from 'lucide-react';

const Toast = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-success-600" />,
    error: <XCircleIcon className="w-5 h-5 text-error-600" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 text-warning-600" />,
    info: <InformationCircleIcon className="w-5 h-5 text-primary-600" />,
  };
  
  const backgrounds = {
    success: 'bg-success-50 border-success-200',
    error: 'bg-error-50 border-error-200',
    warning: 'bg-warning-50 border-warning-200',
    info: 'bg-primary-50 border-primary-200',
  };
  
  const textColors = {
    success: 'text-success-800',
    error: 'text-error-800',
    warning: 'text-warning-800',
    info: 'text-primary-800',
  };
  
  return (
    <div className={`rounded-lg border p-4 ${backgrounds[type]} animate-slide-up`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColors[type]}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColors[type]}`}
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;