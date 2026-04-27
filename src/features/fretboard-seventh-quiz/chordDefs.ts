export type SeventhChordQuality = 'maj7' | '7' | 'm7' | 'm7b5' | 'dim7';

// Defines the string offsets for chords when the root is on a specific string.
// Key of inner Record is the string index of the root note (5 = 6th string, 0 = 1st string).
export const SEVENTH_SHAPES: Record<SeventhChordQuality, Record<number, (number | 'X')[]>> = {
  'maj7': {
    5: [0, 'X', 1, 1, 0, 'X'],
    4: ['X', 0, 2, 1, 2, 0],
    3: ['X', 'X', 0, 2, 2, 2],
    2: ['X', 'X', 0, 0, 0, 2],
    1: ['X', 2, 1, -1, -1, -1],
    0: ['X', 'X', 1, 1, 0, 0],
  },
  '7': {
    5: [0, 2, 0, 1, 0, 0],
    4: ['X', 0, 2, 0, 2, 0],
    3: ['X', 'X', 0, 2, 1, 2],
    2: ['X', 'X', 0, 0, 0, 1],
    1: ['X', 2, 1, 2, 0, 'X'],
    0: ['X', 'X', 0, 1, 0, 0],
  },
  'm7': {
    5: [0, 2, 0, 0, 0, 0],
    4: ['X', 0, 2, 0, 1, 0],
    3: ['X', 'X', 0, 2, 1, 1],
    2: ['X', 'X', 0, 0, -1, 1],
    1: ['X', 2, 0, 2, 0, 'X'],
    0: ['X', 'X', 0, 0, 0, 0],
  },
  'm7b5': {
    5: [0, 'X', 0, 0, -1, 'X'],
    4: ['X', 0, 1, 0, 1, 'X'],
    3: ['X', 'X', 0, 1, 1, 1],
    2: ['X', 'X', -1, 0, -1, 1],
    1: ['X', 'X', 0, 2, 0, 1],
    0: ['X', 'X', 0, 0, -1, 0],
  },
  'dim7': {
    5: [0, 'X', -1, 0, -1, 'X'],
    4: ['X', 0, 1, -1, 1, 'X'],
    3: ['X', 'X', 0, 1, 0, 1],
    2: ['X', 'X', -1, 0, -1, 0],
    1: ['X', 'X', 0, 1, 0, 1],
    0: ['X', 'X', -1, 0, -1, 0],
  }
};

export type SeventhPosition = 'pos1' | 'pos2' | 'pos3' | 'pos4' | 'pos5';

export const POSITION_RANGES: Record<SeventhPosition, [number, number]> = {
  pos1: [0, 4],   // Open position
  pos2: [3, 7],
  pos3: [5, 9],
  pos4: [7, 11],
  pos5: [10, 14]
};

export const POSITIONS_LIST: SeventhPosition[] = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'];
export const POSITION_NAMES: Record<SeventhPosition, string> = {
  pos1: 'Position 1 (開放位置)',
  pos2: 'Position 2',
  pos3: 'Position 3',
  pos4: 'Position 4',
  pos5: 'Position 5'
};
