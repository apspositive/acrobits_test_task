interface StatusBarProps {
  isConnected: boolean;
  isRegistered: boolean;
}

export const StatusBar = ({ isConnected, isRegistered }: StatusBarProps) => {
  return (
    <div className="flex justify-between mb-4 bg-[var(--status-bar-bg)] p-2 rounded">
      <div className={`p-2 rounded font-bold flex items-center gap-2 ${isConnected ? 'text-[var(--connected-color)] bg-[var(--connected-bg)]' : 'text-[var(--disconnected-color)] bg-[var(--disconnected-bg)]'}`}>
        <span className={`w-3 h-3 rounded-full inline-block ${isConnected ? 'bg-[var(--connected-color)]' : 'bg-[var(--disconnected-color)]'}`}></span>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div className={`p-2 rounded font-bold flex items-center gap-2 ${isRegistered ? 'text-[var(--registered-color)] bg-[var(--registered-bg)]' : 'text-[var(--unregistered-color)] bg-[var(--unregistered-bg)]'}`}>
        <span className={`w-3 h-3 rounded-full inline-block ${isRegistered ? 'bg-[var(--registered-color)]' : 'bg-[var(--unregistered-color)]'}`}></span>
        {isRegistered ? 'Registered' : 'Unregistered'}
      </div>
    </div>
  );
};
