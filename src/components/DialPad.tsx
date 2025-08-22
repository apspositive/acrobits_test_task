import { useState } from 'react';

interface DialPadProps {
  onNumberChange: (number: string) => void;
  currentNumber: string;
}

export const DialPad = ({ onNumberChange, currentNumber }: DialPadProps) => {
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
              className="dial-pad-backspace"
              onClick={handleBackspace}
            >
              ⌫ Backspace
            </button>
            <button
              className="dial-pad-close"
              onClick={() => setShowDialPad(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
