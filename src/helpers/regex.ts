// ======================================================================
// REGULAR EXPRESSIONS
// ======================================================================

/**
 * Phone number validation regex
 * 
 * Matches strings that contain only digits and have a minimum length of 4 characters
 * 
 * Pattern explanation:
 * ^     - Start of string
 * \d    - Matches any digit (0-9)
 * {4,}  - Matches 4 or more of the previous token
 * $     - End of string
 */
export const PHONE_NUMBER_REGEX = /^\d{4,}$/;

/**
 * SIP URI parsing regex
 * 
 * Extracts the username and domain from a SIP URI string
 * Expected format: sip:username@domain
 * 
 * Pattern explanation:
 * sip:  - Matches the literal string "sip:"
 * (.*?) - Capturing group 1: Non-greedy match of any characters (username)
 * @     - Matches the literal @ symbol
 * (.*)  - Capturing group 2: Greedy match of any characters (domain)
 */
export const SIP_URI_REGEX = /sip:(.*?)@(.*)/;
