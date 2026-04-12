import type { ChordType, GeneratedChord, QuizQuestion } from './triadQuiz.types'

const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const
const FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] as const
// Roots that conventionally use flat spelling
const FLAT_ROOT_SEMITONES = new Set([5, 10, 3, 8, 1, 6, 11]) // F Bb Eb Ab Db Gb Cb

export const CHORD_TYPES: ChordType[] = [
  { key: 'Maj', name: '大三和弦', steps: [4, 3] },
  { key: 'Min', name: '小三和弦', steps: [3, 4] },
  { key: 'Aug', name: '增三和弦', steps: [4, 4] },
  { key: 'Dim', name: '減三和弦', steps: [3, 3] },
]

const NOTE_LETTERS = ['C','D','E','F','G','A','B'] as const
const LETTER_BASE: Record<string, number> = { C:0,D:2,E:4,F:5,G:7,A:9,B:11 }

/** Given a root note name + target semitone + letter distance, derive correct note name.
 *  e.g. root="C#", targetSemi=5 (E#), letterSteps=2 → "E#"
 *  This ensures diatonic spelling — no mixing sharps and flats.
 */
function buildInterval(rootName: string, targetSemi: number, letterSteps: number): string {
  const rootLetterIdx = NOTE_LETTERS.indexOf(rootName[0] as typeof NOTE_LETTERS[number])
  const targetLetter = NOTE_LETTERS[(rootLetterIdx + letterSteps) % 7]
  const baseSemi = LETTER_BASE[targetLetter]
  const diff = ((targetSemi - baseSemi) % 12 + 12) % 12
  const acc = diff <= 2 ? diff : diff - 12 // clamp to -2..+2
  const accStr = acc === 2 ? '##' : acc === 1 ? '#' : acc === -1 ? 'b' : acc === -2 ? 'bb' : ''
  return targetLetter + accStr
}

export function buildChord(rootSemi: number, chordType: ChordType): GeneratedChord {
  const useFlat = FLAT_ROOT_SEMITONES.has(rootSemi)
  const root = useFlat ? FLAT[rootSemi] : SHARP[rootSemi]
  const [s1, s2] = chordType.steps
  const semi2 = (rootSemi + s1) % 12
  const semi3 = (rootSemi + s1 + s2) % 12
  const note2 = buildInterval(root, semi2, 2)
  const note3 = buildInterval(root, semi3, 4)
  return { root, notes: [root, note2, note3], chordType }
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function generateQuestion(level: number): QuizQuestion {
  let chordType: ChordType;
  let rootSemi: number;
  let shuffleNotes = false;

  if (level < 2) {
    // Level 1
    rootSemi = 0; // C
    chordType = CHORD_TYPES[Math.floor(Math.random() * 4)];
  } else if (level < 4) {
    // Level 2-3
    const allowedRoots = [0, 5, 7]; // C, F, G
    rootSemi = allowedRoots[Math.floor(Math.random() * allowedRoots.length)];
    chordType = CHORD_TYPES[Math.floor(Math.random() * 4)];
  } else if (level < 6) {
    // Level 4-5
    const diatonicChords = [
      { root: 0, typeKey: 'Maj' },
      { root: 2, typeKey: 'Min' },
      { root: 4, typeKey: 'Min' },
      { root: 5, typeKey: 'Maj' },
      { root: 7, typeKey: 'Maj' },
      { root: 9, typeKey: 'Min' },
      { root: 11, typeKey: 'Dim' },
    ];
    const choice = diatonicChords[Math.floor(Math.random() * diatonicChords.length)];
    rootSemi = choice.root;
    chordType = CHORD_TYPES.find(t => t.key === choice.typeKey)!;
  } else if (level < 9) {
    // Level 6-8
    rootSemi = Math.floor(Math.random() * 12);
    chordType = CHORD_TYPES[Math.floor(Math.random() * 4)];
    shuffleNotes = true;
  } else {
    // Level 9+
    rootSemi = Math.floor(Math.random() * 12);
    chordType = CHORD_TYPES[Math.floor(Math.random() * 4)];
    shuffleNotes = true;
  }

  const chord = buildChord(rootSemi, chordType);

  // Wrong root options: 3 other semitones, converted to note names
  const otherSemitones = shuffle(
    [...Array(12).keys()].filter(i => i !== rootSemi)
  ).slice(0, 3);
  const wrongRoots = otherSemitones.map(i =>
    FLAT_ROOT_SEMITONES.has(i) ? FLAT[i] : SHARP[i]
  );
  const rootOptions = shuffle([chord.root, ...wrongRoots]);
  const typeOptions = shuffle([...CHORD_TYPES]);

  return {
    displayNotes: shuffleNotes ? shuffle(chord.notes) as [string, string, string] : [...chord.notes] as [string, string, string],
    answer: chord,
    rootOptions,
    typeOptions,
  };
}
