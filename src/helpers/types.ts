// ======================================================================
// APPLICATION TYPE DEFINITIONS
// ======================================================================

/**
 * CallDirection
 * 
 * Represents the direction of a call in the VoIP application.
 * 
 * @typedef {'incoming' | 'outgoing'} CallDirection
 * 
 * @property 'incoming' - Call received from another party
 * @property 'outgoing' - Call initiated to another party
 * 
 * @example
 * ```typescript
 * const direction: CallDirection = 'incoming';
 * ```
 * 
 * @since 1.0.0
 */
export type CallDirection = 'incoming' | 'outgoing';

/**
 * CallStatus
 * 
 * Represents the various states a call can be in throughout its lifecycle.
 * 
 * @typedef {'completed' | 'missed' | 'rejected' | 'in-progress'} CallStatus
 * 
 * @property 'completed' - Call was successfully completed and ended normally
 * @property 'missed' - Incoming call was not answered within the timeout period
 * @property 'rejected' - Call was explicitly rejected by the user
 * @property 'in-progress' - Call is currently active (ongoing conversation)
 * 
 * @example
 * ```typescript
 * const status: CallStatus = 'in-progress';
 * ```
 * 
 * @since 1.0.0
 */
export type CallStatus = 'completed' | 'missed' | 'rejected' | 'in-progress';
