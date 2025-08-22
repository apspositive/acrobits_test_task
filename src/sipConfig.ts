// SIP Configuration
export const sipConfig = {
  // User 1
  user1: {
    uri: 'sip:3100@pbx.acrobits.cz',
    password: 'misscom'
  },
  // User 2
  user2: {
    uri: 'sip:3101@pbx.acrobits.cz',
    password: 'misscom'
  },
  // WebSocket server
  transportOptions: {
    server: 'wss://pbx.acrobits.cz:7443',
    connectionTimeout: 5,
    keepAliveInterval: 30,
    traceSip: true
  }
};

export default sipConfig;
