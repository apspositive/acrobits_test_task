// ======================================================================
// APPLICATION CONSTANTS
// ======================================================================

/**
 * Call status constants
 * 
 * These constants represent the various states a call can be in:
 * - COMPLETED: Call was successfully completed
 * - MISSED: Incoming call was not answered
 * - REJECTED: Call was explicitly rejected
 * - IN_PROGRESS: Call is currently active
 * - READY: System is ready for a new call
 * - ON_HOLD: Current call is on hold
 * - MUTED: Current call is muted
 * - CONNECTED: System is connected to the SIP server
 */
export const CALL_STATUS = {
  COMPLETED: 'completed',
  MISSED: 'missed',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in-progress',
  READY: 'Ready',
  ON_HOLD: 'On Hold',
  MUTED: 'Muted',
  CONNECTED: 'Connected',
} as const;

/**
 * Button text constants
 * 
 * These constants define the text displayed on various buttons in the UI:
 * - CALL: Place an outgoing call
 * - HANG_UP: End the current call
 * - ACCEPT: Accept an incoming call
 * - REJECT: Reject an incoming call
 * - IGNORE: Ignore an incoming call
 * - RESUME: Resume a call that was on hold
 * - HOLD: Put the current call on hold
 * - MUTE: Mute the current call
 * - UNMUTE: Unmute the current call
 */
export const BUTTON_TEXT = {
  CALL: 'Call',
  HANG_UP: 'Hang Up',
  ACCEPT: 'Accept',
  REJECT: 'Reject',
  IGNORE: 'Ignore',
  RESUME: 'Resume',
  HOLD: 'Hold',
  MUTE: 'Mute',
  UNMUTE: 'Unmute',
} as const;

/**
 * Screen constants
 * 
 * These constants represent the different screens in the application:
 * - MAIN: Main dialer screen
 * - HISTORY: Call history screen
 */
export const SCREEN = {
  MAIN: 'main',
  HISTORY: 'history',
} as const;

/**
 * Theme constants
 * 
 * These constants represent the available UI themes:
 * - LIGHT: Light theme
 * - DARK: Dark theme
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
