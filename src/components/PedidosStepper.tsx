import React from 'react';

interface PedidoStepperProps {
  steps: { key: string; label: string; icon: React.ReactElement }[];
  currentStep: number;
}

const PedidoStepper: React.FC<PedidoStepperProps> = ({ steps, currentStep }) => (
  <nav
    className="flex items-center justify-center gap-0 mb-7 w-full"
    aria-label="Mapa de traslado del pedido"
    style={{ minWidth: 180 }}
  >
    {steps.map((step, idx) => {
      const isActive = idx === currentStep;
      const isCompleted = idx < currentStep;
      const isLast = idx === steps.length - 1;
      return (
        <React.Fragment key={step.key}>
          <div
            className="flex flex-col items-center justify-center relative"
            style={{ minWidth: 36 }}
          >
            <div
              className={`flex items-center justify-center rounded-full border transition-all duration-200
                ${isCompleted ? 'bg-green-500 border-green-500' : isActive ? 'bg-blue-500 border-blue-500' : 'bg-gray-200 border-gray-300'}
              `}
              style={{ width: 36, height: 36 }}
              aria-current={isActive ? 'step' : undefined}
              title={step.label}
            >
              {React.isValidElement(step.icon)
                ? React.cloneElement(step.icon as React.ReactElement<any>, {
                  className: [
                    'w-6 h-6',
                    (isCompleted || isActive) ? 'text-white' : 'text-gray-400'
                  ].join(' ')
                })
                : step.icon}
            </div>
            <span className="mt-1 text-xs text-center text-gray-700 font-medium max-w-[70px] truncate sm:max-w-[120px] sm:whitespace-normal">
              {step.label}
            </span>
          </div>
          {!isLast && (
            <div
              className={`h-1 w-8 sm:w-10 mx-1 rounded-full transition-all duration-300
                ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

export default PedidoStepper;
