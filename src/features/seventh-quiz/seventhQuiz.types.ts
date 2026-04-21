export type SeventhChordKey = 'Maj7' | '7' | 'Min7' | 'm7b5' | 'Maj7#5' | 'mMaj7' | 'Dim7' | 'Aug7'

export interface SeventhChordType {
  key: SeventhChordKey
  name: string
  steps: [number, number, number] // [semitones to 3rd, semitones to 5th, semitones to 7th]
}

export interface GeneratedSeventhChord {
  root: string        // e.g. "C#"
  notes: [string, string, string, string] // e.g. ["C#", "E#", "G#", "B#"]
  chordType: SeventhChordType
}

export interface SeventhQuizQuestion {
  displayNotes: [string, string, string, string] // shuffled
  answer: GeneratedSeventhChord
  rootOptions: string[]   // 4 choices
  typeOptions: SeventhChordType[] // 4 choices
}

export interface SeventhQuizState {
  question: SeventhQuizQuestion | null
  selectedRoot: string | null
  selectedType: SeventhChordKey | null
  submitted: boolean
  isCorrect: boolean | null
  score: number
  total: number
  qnum: number
}

export interface SeventhQuizActions {
  nextQuestion: (level: number) => void
  selectRoot: (root: string) => void
  selectType: (key: SeventhChordKey) => void
  submit: () => boolean
}
