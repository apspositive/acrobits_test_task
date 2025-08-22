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
    <div className="phone-input-container">
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
        className="phone-input"
        pattern="[0-9]*"
        inputMode="tel"
      />
      <button 
        className="input-icon"
        onClick={() => setShowDialPad(!showDialPad)}
        aria-label="Open dial pad"
      >
        <img src="/src/assets/dialpad.svg" alt="Dial pad" className="dialpad-icon" />
      </button>
      
      {/* Virtual Dial Pad */}
      {showDialPad && (
        <div className="dial-pad">
          <div className="dial-pad-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
              <button
                key={key}
                className="dial-pad-key"
                onClick={() => handleKeyPress(key.toString())}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="dial-pad-actions">
            <button
              className="dial-pad-backspace small"
              onClick={handleBackspace}
              aria-label="Backspace"
            >
              ⌫
            </button>
            <button
              className="dial-pad-call large"
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
