# VoIP Application

A React-based VoIP (Voice over IP) application that allows users to make and receive calls using SIP over WebSocket.

## Features

- SIP registration and authentication
- Call initiation and termination
- Call history tracking
- Mute and Hold functionality
- Real-time call duration display
- Light/Dark theme support
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd acrobits_test_task
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Starting the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port if 5173 is in use).

## Stopping the Application

To stop the development server:

1. In the terminal where the server is running, press `Ctrl + C`

2. Alternatively, to stop all running instances:
   ```bash
   pkill -f "npm run dev"
   pkill -f "vite"
   
## Testing the Application

1. Open the application in your browser at `http://localhost:5173`

2. The application will automatically attempt to connect and register with the SIP server

3. Check the status bar at the top:
   - Green "Connected" indicator means WebSocket connection is established
   - Green "Registered" indicator means SIP registration was successful

4. To make a test call:
   - Enter a phone number in the dial pad (e.g., 3101)
   - Click the "Call" button (enabled only when connected and registered)
   - The call screen will appear with call controls
   - Click "Hang Up" to end the call

5. View call history in the list below the dial pad

## Configuration

The SIP configuration can be found in `src/sipConfig.ts`:

- User credentials (URI and password)
- WebSocket server address
- Transport options

## Architecture

The application follows a component-based architecture with separation of concerns:

- `VoIPApp.tsx`: Main application component handling SIP logic and state
- `CallScreen.tsx`: Dedicated call interface
- `StatusBar.tsx`: Connection status indicators
- `DialPad.tsx`: Phone number input interface
- `CallControls.tsx`: Call action buttons
- `CallHistory.tsx`: Call history display

## Troubleshooting

- If the status shows "Disconnected", check:
  - Network connectivity
  - WebSocket server availability
  - Correct SIP credentials in `sipConfig.ts`

- If calls fail to connect:
  - Verify both users are registered
  - Check firewall settings
  - Ensure the SIP server is properly configured

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```
