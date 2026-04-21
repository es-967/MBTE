import type { SeventhChordType, GeneratedSeventhChord, SeventhQuizQuestion } from './seventhQuiz.types'

const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const
const FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] as const
// Roots that conventionally use flat spelling
const FLAT_ROOT_SEMITONES = new Set([5, 10, 3, 8, 1, 6, 11]) // F Bb Eb Ab Db Gb Cb

export const SEVENTH_CHORD_TYPES: SeventhChordType[] = [
  { key: 'Maj7', name: '大七和弦', steps: [4, 7, 11] },
  { key: '7', name: '屬七和弦', steps: [4, 7, 10] },
  { key: 'Min7', name: '小七和弦', steps: [3, 7, 10] },
  { key: 'm7b5', name: '半減七和弦', steps: [3, 6, 10] },
  { key: 'Maj7#5', name: '增大七和弦', steps: [4, 8, 11] },
  { key: 'mMaj7', name: '小大七和弦', steps: [3, 7, 11] },
  { key: 'Dim7', name: '減七和弦', steps: [3, 6, 9] },
  { key: 'Aug7', name: '增屬七和弦', steps: [4, 8, 10] },
]

const NOTE_LETTERS = ['C','D','E','F','G','A','B'] as const
const LETTER_BASE: Record<string, number> = { C:0,D:2,E:4,F:5,G:7,A:9,B:11 }

/** Given a root note name + target semitone + letter distance, derive correct note name.
 */
function buildInterval(rootName: string, targetSemi: number, letterSteps: number): string {
  const rootLetterIdx = NOTE_LETTERS.indexOf(rootName[0] as typeof NOTE_LETTERS[number])
  const targetLetter = NOTE_LETTERS[(rootLetterIdx + letterSteps) % 7]
  const baseSemi = LETTER_BASE[targetLetter]
  const diff = ((targetSemi - baseSemi) % 12 + 12) % 12
  const acc = diff <= 3 ? diff : diff - 12 // extended clamp for bb, 𝄪 etc
  
  if (acc === 2) return targetLetter + '𝄪'
  if (acc === 3) return targetLetter + '𝄪#'
  if (acc === 1) return targetLetter + '#'
  if (acc === -1) return targetLetter + 'b'
  if (acc === -2) return targetLetter + 'bb'
  return targetLetter
}

export function buildSeventhChord(rootSemi: number, chordType: SeventhChordType): GeneratedSeventhChord {
  const useFlat = FLAT_ROOT_SEMITONES.has(rootSemi)
  // For Seventh chords, let's allow more varied roots optionally
  // But let's stay consistent with Triad logic for now unless requested
  const root = useFlat ? FLAT[rootSemi] : SHARP[rootSemi]
  const [s1, s2, s3] = chordType.steps
  
  const semi2 = (rootSemi + s1) % 12
  const semi3 = (rootSemi + s2) % 12
  const semi4 = (rootSemi + s3) % 12
  
  const note2 = buildInterval(root, semi2, 2)
  const note3 = buildInterval(root, semi3, 4)
  const note4 = buildInterval(root, semi4, 6)
  
  return { root, notes: [root, note2, note3, note4], chordType }
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function generateSeventhQuestion(level: number): SeventhQuizQuestion {
  let chordType: SeventhChordType;
  let rootSemi: number;
  let shuffleNotes = false;

  if (level < 2) {
    // Level 1: C root, basic Maj7/7/Min7/Dim7? Let's use first 4
    rootSemi = 0; 
    chordType = SEVENTH_CHORD_TYPES[Math.floor(Math.random() * 4)];
  } else if (level < 4) {
    // Level 2-3: C, F, G roots
    const allowedRoots = [0, 5, 7];
    rootSemi = allowedRoots[Math.floor(Math.random() * allowedRoots.length)];
    chordType = SEVENTH_CHORD_TYPES[Math.floor(Math.random() * 4)];
  } else if (level < 6) {
    // Level 4-5: Diatonic seventh chords of C major
    const diatonicChords = [
      { root: 0, typeKey: 'Maj7' },
      { root: 2, typeKey: 'Min7' },
      { root: 4, typeKey: 'Min7' },
      { root: 5, typeKey: 'Maj7' },
      { root: 7, typeKey: '7' },
      { root: 9, typeKey: 'Min7' },
      { root: 11, typeKey: 'm7b5' },
    ];
    const choice = diatonicChords[Math.floor(Math.random() * diatonicChords.length)];
    rootSemi = choice.root;
    chordType = SEVENTH_CHORD_TYPES.find(t => t.key === choice.typeKey)!;
  } else if (level < 9) {
    // Level 6-8: All 12 roots, first 6 types
    rootSemi = Math.floor(Math.random() * 12);
    chordType = SEVENTH_CHORD_TYPES[Math.floor(Math.random() * 6)];
    shuffleNotes = true;
  } else {
    // Level 9+: All 12 roots, all 8 types, shuffled
    rootSemi = Math.floor(Math.random() * 12);
    chordType = SEVENTH_CHORD_TYPES[Math.floor(Math.random() * SEVENTH_CHORD_TYPES.length)];
    shuffleNotes = true;
  }

  const chord = buildSeventhChord(rootSemi, chordType);

  // Wrong root options
  const otherSemitones = shuffle(
    [...Array(12).keys()].filter(i => i !== rootSemi)
  ).slice(0, 3);
  const wrongRoots = otherSemitones.map(i =>
    FLAT_ROOT_SEMITONES.has(i) ? FLAT[i] : SHARP[i]
  );
  const rootOptions = shuffle([chord.root, ...wrongRoots]);
  
  // Pick 4 types including the answer
  const typeOptions = shuffle([
    chordType,
    ...shuffle(SEVENTH_CHORD_TYPES.filter(t => t.key !== chordType.key)).slice(0, 3)
  ]);

  return {
    displayNotes: shuffleNotes ? shuffle(chord.notes) as [string, string, string, string] : [...chord.notes] as [string, string, string, string],
    answer: chord,
    rootOptions,
    typeOptions,
  };
}
