class AudioTools {
  public static audioContext = new (window.AudioContext || window.webkitAudioContext)();
}
