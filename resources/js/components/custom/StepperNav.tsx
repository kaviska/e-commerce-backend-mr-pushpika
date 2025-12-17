import React from 'react';
import { FiCheck } from 'react-icons/fi';

interface StepperNavProps {
    currentStep: number;
}

const StepperNav: React.FC<StepperNavProps> = ({ currentStep }) => {
    const steps = [
        { number: 1, label: 'Address & Payment' },
        { number: 2, label: 'Payment Processing' },
        { number: 3, label: 'Confirmation' }
    ];

    return (
        <div className="w-full py-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                        <div 
                            className="h-full bg-green-600 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {steps.map((step, index) => (
                        <div key={step.number} className="flex flex-col items-center relative">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                    currentStep > step.number
                                        ? 'bg-green-600 text-white'
                                        : currentStep === step.number
                                        ? 'bg-green-600 text-white ring-4 ring-green-100'
                                        : 'bg-white text-gray-400 border-2 border-gray-300'
                                }`}
                            >
                                {currentStep > step.number ? (
                                    <FiCheck className="w-5 h-5" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span
                                className={`mt-2 text-sm font-medium text-center whitespace-nowrap ${
                                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepperNav;
