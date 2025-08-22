// ======================================================================
// UTILITY FUNCTIONS
// ======================================================================

// Regular expressions
import { PHONE_NUMBER_REGEX } from './regex';
import { SIP_URI_REGEX } from './regex';

// ======================================================================
// VALIDATION FUNCTIONS
// ======================================================================

/**
 * Validate phone number
 * 
 * Checks if the provided string is a valid phone number:
 * - Minimum 4 digits
 * - Numbers only (no special characters or letters)
 * 
 * @param number - The phone number string to validate
 * @returns true if valid, false otherwise
 */
export const isValidPhoneNumber = (number: string): boolean => {
  return PHONE_NUMBER_REGEX.test(number);
};

/**
 * Parse SIP URI to extract username and domain
 * 
 * Extracts the username and domain from a SIP URI string
 * Expected format: sip:username@domain
 * 
 * @param uri - The SIP URI string to parse
 * @returns Object containing username and domain, or empty strings if parsing fails
 */
export const parseSipUri = (uri: string) => {
  const match = uri.match(SIP_URI_REGEX);
  return match ? { username: match[1], domain: match[2] } : { username: '', domain: '' };
};

// ======================================================================
// FORMATTING FUNCTIONS
// ======================================================================

/**
 * Format time for display
 * 
 * Converts a date object or string to a time string in the format HH:MM
 * 
 * @param date - The date object or string to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format date for display
 * 
 * Converts a date object or string to a date string in the format Month Day, Year
 * 
 * @param date - The date object or string to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Format duration for display
 * 
 * Converts seconds to a duration string in the format MM:SS
 * 
 * @param seconds - The number of seconds to format
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
