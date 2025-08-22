interface StatusBarProps {
  isConnected: boolean;
  isRegistered: boolean;
}

export const StatusBar = ({ isConnected, isRegistered }: StatusBarProps) => {
  return (
    <div className="status-bar">
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className={`status-icon ${isConnected ? 'connected' : 'disconnected'}`}></span>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div className={`status-indicator ${isRegistered ? 'registered' : 'unregistered'}`}>
        <span className={`status-icon ${isRegistered ? 'registered' : 'unregistered'}`}></span>
        {isRegistered ? 'Registered' : 'Unregistered'}
      </div>
    </div>
  );
};
