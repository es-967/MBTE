export type ChordKey = 'Maj' | 'Min' | 'Aug' | 'Dim'

export interface ChordType {
  key: ChordKey
  name: string
  steps: [number, number] // [semitones to 3rd, semitones to 5th]
}

export interface GeneratedChord {
  root: string        // e.g. "C#"
  notes: [string, string, string] // e.g. ["C#", "E#", "G#"]
  chordType: ChordType
}

export interface QuizQuestion {
  displayNotes: [string, string, string] // shuffled
  answer: GeneratedChord
  rootOptions: string[]   // 4 choices
  typeOptions: ChordType[] // 4 choices
}

export interface TriadQuizState {
  question: QuizQuestion | null
  selectedRoot: string | null
  selectedType: ChordKey | null
  submitted: boolean
  isCorrect: boolean | null
  score: number
  total: number
  qnum: number
}

export interface TriadQuizActions {
  nextQuestion: (level: number) => void
  selectRoot: (root: string) => void
  selectType: (key: ChordKey) => void
  submit: () => boolean
}
