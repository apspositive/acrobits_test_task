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

  return (
    <div className="phone-input-container">
      <input
        type="tel"
        value={currentNumber}
        onChange={(e) => onNumberChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnterPress) {
            e.preventDefault();
            onEnterPress();
          }
        }}
        placeholder="Enter phone number"
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
                // Call the onEnterPress function if provided
                if (onEnterPress) onEnterPress();
              }}
            >
              Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
