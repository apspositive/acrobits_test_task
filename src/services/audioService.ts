// ======================================================================
// AUDIO SERVICE
// ======================================================================

/**
 * AudioService class
 * 
 * This service handles audio playback for the VoIP application,
 * including ringtone playback for incoming calls.
 */
export class AudioService {
  private ringtone: HTMLAudioElement | null = null;
  private isPlaying = false;
  
  constructor() {
    this.initializeRingtone();
  }
  
  /**
   * Initialize the ringtone audio element
   * 
   * Creates an HTMLAudioElement for the ringtone and sets it to loop
   */
  private initializeRingtone() {
    try {
      // Create audio element for ringtone
      this.ringtone = new Audio();
      this.ringtone.src = '/src/assets/ringtone.mp3';
      this.ringtone.loop = true;
      this.ringtone.preload = 'auto';
      
      // Handle playback errors
      this.ringtone.addEventListener('error', (e) => {
        console.error('Error loading ringtone:', e);
      });
    } catch (error) {
      console.error('Error initializing ringtone:', error);
    }
  }
  
  /**
   * Play the ringtone
   * 
   * Plays the ringtone sound for incoming calls
   * Only plays if not already playing
   */
  public async playRingtone() {
    if (this.isPlaying || !this.ringtone) {
      return;
    }
    
    try {
      // Reset to beginning
      this.ringtone.currentTime = 0;
      // Play the ringtone
      await this.ringtone.play();
      this.isPlaying = true;
      console.log('Ringtone started');
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  }
  
  /**
   * Stop the ringtone
   * 
   * Stops the ringtone playback if currently playing
   */
  public async stopRingtone() {
    if (!this.isPlaying || !this.ringtone) {
      return;
    }
    
    try {
      await this.ringtone.pause();
      this.ringtone.currentTime = 0;
      this.isPlaying = false;
      console.log('Ringtone stopped');
    } catch (error) {
      console.error('Error stopping ringtone:', error);
    }
  }
  
  /**
   * Cleanup audio resources
   * 
   * Stops any playing audio and releases resources
   */
  public cleanup() {
    this.stopRingtone();
    this.ringtone = null;
  }
}

// Export a singleton instance
export const audioService = new AudioService();
