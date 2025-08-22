import { useState } from 'react';

interface DialPadProps {
  onNumberChange: (number: string) => void;
  onEnterPress?: () => void;
  currentNumber: string;
}

export const DialPad = ({ onNumberChange, onEnterPress, currentNumber }: DialPadProps) => {
  const [showDialPad, setShowDialPad] = useState(false);

  const handleKeyPress = (key: string) => {
    onNumberChange(currentNumber + key);
  };

  const handleBackspace = () => {
    onNumberChange(currentNumber.slice(0, -1));
  };

  // Validate phone number (min 4 digits, numbers only)
  const isValidPhoneNumber = (number: string): boolean => {
    return /^\d{4,}$/.test(number);
  };

  return (
    <div className="relative w-full mb-4">
      <input
        type="tel"
        value={currentNumber}
        onChange={(e) => onNumberChange(e.target.value.replace(/[^0-9]/g, ''))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnterPress && isValidPhoneNumber(currentNumber)) {
            e.preventDefault();
            onEnterPress();
          }
        }}
        placeholder="Enter phone number (min 4 digits)"
        className="w-full p-4 text-xl border-2 border-[var(--input-border)] rounded text-center bg-[var(--input-bg)] text-[var(--text-color)] box-border"
        pattern="[0-9]*"
        inputMode="tel"
      />
      <button 
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-xl opacity-70 p-0 h-[50px] flex items-center justify-center"
        onClick={() => setShowDialPad(!showDialPad)}
        aria-label="Open dial pad"
      >
        <img src="/src/assets/dialpad.svg" alt="Dial pad" className="w-6 h-6 absolute right-4" />
      </button>
      
      {/* Virtual Dial Pad */}
      {showDialPad && (
        <div className="absolute top-full left-0 right-0 bg-[var(--dial-pad-bg)] border border-[var(--border-color)] rounded-lg shadow-lg z-[100] p-4 mt-2">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
              <button
                key={key}
                className="p-4 text-2xl bg-[var(--dial-pad-key-bg)] border border-[var(--dial-pad-key-border)] rounded-lg cursor-pointer text-center text-[var(--text-color)] h-[50px] flex items-center justify-center hover:bg-[var(--dial-pad-key-hover)]"
                onClick={() => handleKeyPress(key.toString())}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              className="bg-red-600 text-white border-none rounded-lg p-4 text-base cursor-pointer h-[50px] flex items-center justify-center col-span-1 hover:bg-red-700"
              onClick={handleBackspace}
              aria-label="Backspace"
            >
              ⌫
            </button>
            <button
              className="bg-[var(--call-btn-bg)] border-none rounded-lg p-4 text-base cursor-pointer text-[var(--call-btn-text)] h-[50px] flex items-center justify-center col-span-2 font-bold hover:bg-[var(--call-btn-hover)]"
              onClick={() => {
                setShowDialPad(false);
                // Call the onEnterPress function if provided and validation passes
                if (onEnterPress && isValidPhoneNumber(currentNumber)) onEnterPress();
              }}
              disabled={!isValidPhoneNumber(currentNumber)}
            >
              Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
