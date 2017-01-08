class KeyboardUtils {
  public static keyboardSymbols = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-',  '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[',  ']'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', '\\n'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '\\s',  'NA'],
  ];

  // ascii key mappings to array index
  public static keyPairs = [
    [49, 50, 51, 52, 53, 54, 55, 56,  57,  48,  189, 187],
    [81, 87, 69, 82, 84, 89, 85, 73,  79,  80,  219, 221],
    [65, 83, 68, 70, 71, 72, 74, 75,  76,  186, 222, 13],
    [90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16,  -1]
  ];

  // alternate keys for firefox
  public static backupPairs = [
    [49, 50, 51, 52, 53, 54, 55, 56,  57,  48,  173, 61],
    [81, 87, 69, 82, 84, 89, 85, 73,  79,  80,  219, 221],
    [65, 83, 68, 70, 71, 72, 74, 75,  76,  59,  222, 13],
    [90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16,  -1]
  ];

  public static getKeyboardSizeString(type: String): KeyBoardSize {
    switch (type) {
      case 'SQUARE':
        return KeyboardUtils.getKeyboardSize(KeyBoardType.SQUARE);
      case 'DOUBLE':
        return KeyboardUtils.getKeyboardSize(KeyBoardType.DOUBLE);
      default:
        return KeyboardUtils.getKeyboardSize(KeyBoardType.STANDARD);
    }
  }

  public static KeyboardTypeToString(type: KeyBoardType): string {
    switch (type) {
      case KeyBoardType.SQUARE:
        return 'SQUARE';
      case KeyBoardType.DOUBLE:
        return 'DOUBLE';
      default:
        return 'STANDARD';
    }
  }

  public static getKeyboardSize(type: KeyBoardType): KeyBoardSize {
    switch (type) {
      case KeyBoardType.SQUARE:
        return {rows: 8, cols: 8};
      case KeyBoardType.DOUBLE:
        return {rows: 8, cols: 11};
      default: // standard
        return {rows: 4, cols: 12};
    }
  }

  // returns in [row, col] order
  public static linearToGrid(i: number, cols: number): number[] {
    return [Math.floor(i / cols), i % cols];
  }

  public static gridToLinear(r: number, c: number, cols: number): number {
    return r * cols + c;
  }
}

interface KeyBoardSize {
  rows: number;
  cols: number;
}

enum KeyBoardType {
  STANDARD, // original 4*12 grid
  SQUARE, // 8*8 grid like actual pad, modifier to access lower grid
  DOUBLE, // 8*11 grid, modifier to access lower grid, option to hide lower half
}
