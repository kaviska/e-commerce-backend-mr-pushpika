import React, { useCallback, useEffect, useState, useRef } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ min, max, step = 1, value, onValueChange, className = '' }) => {
  const [localValue, setLocalValue] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<'min' | 'max' | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = type;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    let newValue = Math.round((percentage * (max - min) + min) / step) * step;

    setLocalValue(prev => {
      const next = [...prev] as [number, number];
      if (isDragging.current === 'min') {
        newValue = Math.min(newValue, prev[1] - step);
        next[0] = Math.max(newValue, min);
      } else {
        newValue = Math.max(newValue, prev[0] + step);
        next[1] = Math.min(newValue, max);
      }
      onValueChange(next);
      return next;
    });
  }, [max, min, step, onValueChange]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  return (
    <div className={`relative w-full h-6 flex items-center select-none ${className}`}>
      <div ref={trackRef} className="relative w-full h-2 bg-gray-200 rounded-full">
        {/* Active Range */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{
            left: `${getPercentage(localValue[0])}%`,
            width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`,
          }}
        />

        {/* Min Thumb */}
        <div
          className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full cursor-grab active:cursor-grabbing shadow-sm top-1/2 -translate-y-1/2 -translate-x-1/2 hover:scale-110 transition-transform"
          style={{ left: `${getPercentage(localValue[0])}%` }}
          onMouseDown={handleMouseDown('min')}
        />

        {/* Max Thumb */}
        <div
          className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full cursor-grab active:cursor-grabbing shadow-sm top-1/2 -translate-y-1/2 -translate-x-1/2 hover:scale-110 transition-transform"
          style={{ left: `${getPercentage(localValue[1])}%` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>
    </div>
  );
};

export default Slider;
