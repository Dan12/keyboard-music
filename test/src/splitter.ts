class Splitter {
  public static emptyTol = 0.0017; // under this is considered silence
  public static emptyLen = 200;    // have to have tolerated silence for 20 bytes to be considered in the silent section
  public static moveBufferHead = -600;   // move buffer head back to compensate for immediate start to sound and possible cutoffs
  public static moveBufferTail = -1000;   // move buffer length back due to the amount of empty space afterwards
  public static roundBuffer = 128;    // round output buffer to have nice chunks and get ride of static overlay

  /** @return a 2D array of start and end points for each sound */
  public static analyze(buffer: AudioBuffer): number[][] {
    let ch1 = buffer.getChannelData(0);
    let ch2 = buffer.getChannelData(1);

    let ret = <number[][]>[];

    // scan for silence and find audio start and end points and use those points to split audio
    for (let i = 0; i < ch1.length; i++) {
      // scan until no silence for one byte in both channels
      if (Math.abs(ch1[i]) > Splitter.emptyTol && Math.abs(ch2[i]) > Splitter.emptyTol) {
        let startPos = i;

        // make sure that audio is not silent for at least emptyLen number of bytes
        let isValid = true;
        for (; i < startPos + Splitter.emptyLen; i++) {
          if (Math.abs(ch1[i]) <= Splitter.emptyTol && Math.abs(ch2[i]) <= Splitter.emptyTol) {
            isValid = false;
            break;
          }
        }

        // valid audio sample determined
        if (isValid) {
          while (i < ch1.length) {
            i++;
            // scan until one byte of silence detected
            if (Math.abs(ch1[i]) <= Splitter.emptyTol && Math.abs(ch2[i]) <= Splitter.emptyTol) {
              let endPos = i;

              // make sure that audio is silent for at least emptyTol number of bytes
              let isOver = true;
              for (; i < endPos + Splitter.emptyLen; i++) {
                if (Math.abs(ch1[i]) > Splitter.emptyTol && Math.abs(ch2[i]) > Splitter.emptyTol) {
                  isOver = false;
                  break;
                }
              }

              // if audio section boundary found, make a new file with the data within the boundaries
              if (isOver) {
                startPos += Splitter.moveBufferHead;
                startPos = Math.floor((startPos) / Splitter.roundBuffer) * Splitter.roundBuffer;
                endPos += Splitter.moveBufferTail;
                endPos = Math.floor((endPos) / Splitter.roundBuffer) * Splitter.roundBuffer;
                ret.push([startPos, endPos]);
                break;
              }
            }
          }
        }
      }
    }

    return ret;
  }
}