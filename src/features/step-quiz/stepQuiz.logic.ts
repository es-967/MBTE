import { StepQuestion, StepQuizMode } from './stepQuiz.types';

const DIATONIC = ['C','D','E','F','G','A','B'];
const DIA_ST   = [0,2,4,5,7,9,11];

const ROOTS = {
  nat:   ['C','D','E','F','G','A','B'],
  sharp: ['C#','D#','F#','G#','A#'],
  flat:  ['Db','Eb','Gb','Ab','Bb'],
};

const INTERVALS = [
  { name: '小二度 (Minor 2nd)', w: 0, h: 1, level: 1 },
  { name: '大二度 (Major 2nd)', w: 1, h: 0, level: 1 },
  { name: '增二度 (Augmented 2nd)', w: 1, h: 1, level: 3 },
  { name: '減三度 (Diminished 3rd)', w: 0, h: 2, level: 3 },
  { name: '小三度 (Minor 3rd)', w: 1, h: 1, level: 2 },
  { name: '大三度 (Major 3rd)', w: 2, h: 0, level: 2 },
  { name: '減四度 (Diminished 4th)', w: 1, h: 2, level: 4 },
  { name: '完全四度 (Perfect 4th)', w: 2, h: 1, level: 3 },
  { name: '增四度 (Augmented 4th)', w: 3, h: 0, level: 3 },
  { name: '減五度 (Diminished 5th)', w: 2, h: 2, level: 3 },
  { name: '完全五度 (Perfect 5th)', w: 3, h: 1, level: 3 },
  { name: '增五度 (Augmented 5th)', w: 4, h: 0, level: 4 },
  { name: '小六度 (Minor 6th)', w: 3, h: 2, level: 4 },
  { name: '大六度 (Major 6th)', w: 4, h: 1, level: 4 },
  { name: '減七度 (Diminished 7th)', w: 3, h: 3, level: 5 },
  { name: '小七度 (Minor 7th)', w: 4, h: 2, level: 5 },
  { name: '大七度 (Major 7th)', w: 5, h: 1, level: 5 },
  { name: '完全八度 (Perfect 8ve)', w: 5, h: 2, level: 5 },
];

function accOf(note: string) {
  let acc = 0;
  for (let i = 1; i < note.length; i++) {
    if (note[i] === '#') acc++;
    else if (note[i] === 'b') acc--;
  }
  return acc;
}

function noteToST(note: string) {
  return (DIA_ST[DIATONIC.indexOf(note[0])] + accOf(note) + 12) % 12;
}

function pickNotes(level: number) {
  let allowedNotes1: string[] = ROOTS.nat;
  let allowedNotes2: string[] = ROOTS.nat;
  let maxN = 1;

  if (level === 1) {
    maxN = 1; // 2nds
  } else if (level === 2) {
    allowedNotes2 = [...ROOTS.nat, ...ROOTS.sharp, ...ROOTS.flat];
    maxN = 2; // up to 3rds
  } else if (level === 3) {
    allowedNotes1 = [...ROOTS.nat, ...ROOTS.sharp, ...ROOTS.flat];
    allowedNotes2 = [...ROOTS.nat, ...ROOTS.sharp, ...ROOTS.flat];
    maxN = 4; // up to 5ths
  } else if (level === 4) {
    allowedNotes1 = [...ROOTS.nat, ...ROOTS.sharp, ...ROOTS.flat];
    allowedNotes2 = [...ROOTS.nat, ...ROOTS.sharp, ...ROOTS.flat];
    maxN = 5; // up to 6ths
  } else {
    allowedNotes1 = [...ROOTS.nat, ...ROOTS.sharp, ...ROOTS.flat];
    allowedNotes2 = [...ROOTS.nat, ...ROOTS.sharp, ...ROOTS.flat];
    maxN = 7; // up to 8ves
  }

  let attempts = 0;
  while (attempts < 500) {
    const note1 = allowedNotes1[Math.floor(Math.random() * allowedNotes1.length)];
    const note2 = allowedNotes2[Math.floor(Math.random() * allowedNotes2.length)];

    if (note1 === note2) continue;

    const idx1 = DIATONIC.indexOf(note1[0]);
    const idx2 = DIATONIC.indexOf(note2[0]);

    // Calculate N (number of diatonic steps strictly upwards)
    let N = (idx2 - idx1 + 7) % 7;
    if (N === 0) N = 7; // Treat unison as octave for upward distance

    if (N > maxN) continue;

    let st1 = noteToST(note1);
    let st2 = noteToST(note2);

    // Calculate S (semitones strictly upwards)
    let S = (st2 - st1 + 12) % 12;
    if (S === 0 && N === 7) S = 12;

    // Calculate Whole (W) and Half (H) steps
    let W = S - N;
    let H = 2 * N - S;

    if (W < 0 || H < 0) continue;

    return { note1, note2, S, W, H, N };
  }
  return { note1: 'C', note2: 'D', S: 2, W: 1, H: 0, N: 1 };
}

export function generateStepQuestion(level: number, mode: StepQuizMode = 'mixed'): StepQuestion {
  let selectedMode = mode;
  if (selectedMode === 'mixed') {
    const rand = Math.random();
    if (rand < 0.5) selectedMode = 'semitones';
    else selectedMode = 'note-steps';
  }
  
  if (selectedMode === 'semitones') {
    // Type A: Note -> Semitones (Restricted to 1 or 2 semitones, and MUST be adjacent diatonic notes N=1)
    let note1, note2, S;
    while (true) {
      const res = pickNotes(level === 1 ? 1 : 2);
      if (res.N === 1 && (res.S === 1 || res.S === 2)) {
        note1 = res.note1;
        note2 = res.note2;
        S = res.S;
        break;
      }
    }
    
    let options = [1, 2];
    
    return {
      type: 'semitones',
      title: `${note1} → ${note2}`,
      subtitle: '是全音還是半音？',
      answer: S.toString(),
      options: options.map(String)
    };
  } else if (selectedMode === 'interval-name') {
    // Type B: Interval -> Steps
    const validIntervals = INTERVALS.filter(i => i.level <= level);
    const interval = validIntervals[Math.floor(Math.random() * validIntervals.length)];
    let options = new Set<string>([`${interval.w},${interval.h}`]);
    
    while(options.size < 4) {
      const wrong = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
      options.add(`${wrong.w},${wrong.h}`);
    }
    
    return {
      type: 'steps',
      title: interval.name,
      subtitle: '包含幾個全音與半音？',
      answer: `${interval.w},${interval.h}`,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    };
  } else {
    // Type C: Note -> Steps
    const { note1, note2, W, H } = pickNotes(level);
    let options = new Set<string>([`${W},${H}`]);
    
    // Add enharmonic traps if possible
    if (W - 1 >= 0) options.add(`${W - 1},${H + 2}`);
    if (H - 2 >= 0) options.add(`${W + 1},${H - 2}`);
    if (W - 1 >= 0) options.add(`${W - 1},${H + 1}`);
    if (H - 1 >= 0) options.add(`${W + 1},${H - 1}`);
    
    while(options.size < 4) {
      const wrong = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
      options.add(`${wrong.w},${wrong.h}`);
    }
    
    return {
      type: 'steps',
      title: `${note1} → ${note2}`,
      subtitle: '向上相距多遠？',
      answer: `${W},${H}`,
      options: Array.from(options).slice(0, 4).sort(() => Math.random() - 0.5)
    };
  }
}
