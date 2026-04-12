import type { IntervalQuality, IntervalDegree, IntervalDef, QuizQuestion } from './intervalQuiz.types';

const DIATONIC = ['C','D','E','F','G','A','B'];
const DIA_ST   = [0,2,4,5,7,9,11];

const ROOTS = {
  nat:   ['C','D','E','F','G','A','B'],
  sharp: ['C#','D#','E#','F#','G#','A#','B#'],
  flat:  ['Cb','Db','Eb','Fb','Gb','Ab','Bb'],
};

const ALL_INTERVALS: IntervalDef[] = [
  {deg:1,q:'完全',st:0, name:'完全一度'},
  {deg:1,q:'增',  st:1, name:'增一度'},
  {deg:2,q:'減',  st:0, name:'減二度'},
  {deg:2,q:'小',  st:1, name:'小二度'},
  {deg:2,q:'大',  st:2, name:'大二度'},
  {deg:2,q:'增',  st:3, name:'增二度'},
  {deg:3,q:'減',  st:2, name:'減三度'},
  {deg:3,q:'小',  st:3, name:'小三度'},
  {deg:3,q:'大',  st:4, name:'大三度'},
  {deg:3,q:'增',  st:5, name:'增三度'},
  {deg:4,q:'減',  st:4, name:'減四度'},
  {deg:4,q:'完全',st:5, name:'完全四度'},
  {deg:4,q:'增',  st:6, name:'增四度'},
  {deg:5,q:'減',  st:6, name:'減五度'},
  {deg:5,q:'完全',st:7, name:'完全五度'},
  {deg:5,q:'增',  st:8, name:'增五度'},
  {deg:6,q:'減',  st:7, name:'減六度'},
  {deg:6,q:'小',  st:8, name:'小六度'},
  {deg:6,q:'大',  st:9, name:'大六度'},
  {deg:6,q:'增',  st:10,name:'增六度'},
  {deg:7,q:'減',  st:9, name:'減七度'},
  {deg:7,q:'小',  st:10,name:'小七度'},
  {deg:7,q:'大',  st:11,name:'大七度'},
  {deg:7,q:'增',  st:12,name:'增七度'},
  {deg:8,q:'減',  st:11,name:'減八度'},
  {deg:8,q:'完全',st:12,name:'完全八度'},
  {deg:8,q:'增',  st:13,name:'增八度'},
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

function diaNatBetween(li1: number, li2: number) {
  return (DIA_ST[li2] - DIA_ST[li1] + 12) % 12;
}

function isEnharmonic(note1: string, note2: string) {
  return noteToST(note1) === noteToST(note2);
}

function buildNote2(root: string, idef: IntervalDef) {
  const li1 = DIATONIC.indexOf(root[0]);
  const li2 = (li1 + (idef.deg - 1)) % 7;
  const letter2 = DIATONIC[li2];
  const acc1 = accOf(root);
  const diaNat = diaNatBetween(li1, li2);
  const acc2 = idef.st - diaNat + acc1;
  if (acc2 < -2 || acc2 > 2) return null;
  const suffix = acc2 === 2 ? '##' : acc2 === 1 ? '#' : acc2 === -1 ? 'b' : acc2 === -2 ? 'bb' : '';
  const note2 = letter2 + suffix;

  if (idef.deg !== 1 && isEnharmonic(root, note2) && idef.st % 12 === 0) {
    return null;
  }

  return note2;
}

export function generateQuestion(level: number): QuizQuestion {
  let allowedRoots: string[] = [];
  let allowDoubleAccidentals = false;

  if (level <= 2) {
    allowedRoots = ['C'];
  } else if (level <= 6) {
    allowedRoots = ROOTS.nat;
  } else {
    allowedRoots = [...ROOTS.nat, ...ROOTS.sharp, ...ROOTS.flat];
  }

  if (level >= 11) {
    allowDoubleAccidentals = true;
  }

  let attempts = 0;
  while (attempts < 500) {
    const root = allowedRoots[Math.floor(Math.random() * allowedRoots.length)];
    const idef = ALL_INTERVALS[Math.floor(Math.random() * ALL_INTERVALS.length)];
    
    let isValid = true;

    if (root === 'C') {
      if (level <= 4 && (idef.q === '增' || idef.q === '減')) {
        isValid = false;
      }
    } else {
      if (level <= 4) {
        if (idef.deg > 3) isValid = false;
        if (idef.q === '增' || idef.q === '減') isValid = false;
      } else if (level <= 8) {
        if (idef.deg > 5) isValid = false;
      }
    }

    if (!isValid) {
      attempts++;
      continue;
    }

    const note2 = buildNote2(root, idef);
    
    if (note2 !== null) {
      if (!allowDoubleAccidentals && (note2.includes('##') || note2.includes('bb'))) {
        attempts++;
        continue;
      }

      return {
        root,
        note2,
        answer: idef,
        qualityOptions: ['完全', '大', '小', '增', '減'],
        degreeOptions: [1, 2, 3, 4, 5, 6, 7, 8]
      };
    }
    attempts++;
  }
  
  return {
    root: 'C',
    note2: 'E',
    answer: {deg: 3, q: '大', st: 4, name: '大三度'},
    qualityOptions: ['完全', '大', '小', '增', '減'],
    degreeOptions: [1, 2, 3, 4, 5, 6, 7, 8]
  };
}
