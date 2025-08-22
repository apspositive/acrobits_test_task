/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'connected': 'var(--connected-color)',
        'disconnected': 'var(--disconnected-color)',
        'registered': 'var(--registered-color)',
        'unregistered': 'var(--unregistered-color)',
        'call-btn': 'var(--call-btn-bg)',
        'hangup-btn': 'var(--hangup-btn-bg)',
        'input-bg': 'var(--input-bg)',
        'container-bg': 'var(--container-bg)',
        'text-color': 'var(--text-color)',
        'border-color': 'var(--border-color)',
        'status-bar-bg': 'var(--status-bar-bg)',
        'history-border': 'var(--history-border)',
        'disabled-bg': 'var(--disabled-bg)',
        'completed-bg': 'var(--completed-bg)',
        'completed-text': 'var(--completed-text)',
        'missed-bg': 'var(--missed-bg)',
        'missed-text': 'var(--missed-text)',
        'rejected-bg': 'var(--rejected-bg)',
        'rejected-text': 'var(--rejected-text)',
        'in-progress-bg': 'var(--in-progress-bg)',
        'in-progress-text': 'var(--in-progress-text)',
        'dial-pad-bg': 'var(--dial-pad-bg)',
        'dial-pad-key-bg': 'var(--dial-pad-key-bg)',
        'dial-pad-key-border': 'var(--dial-pad-key-border)',
        'dial-pad-key-hover': 'var(--dial-pad-key-hover)',
      },
    },
  },
  plugins: [],
}
