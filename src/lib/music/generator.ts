import { ALL_NOTES, MAJOR_SCALES, MINOR_SCALES } from "./data";
import { getAvailableKeys, PracticeMode } from "./skillGraph";

export interface Question {
  key: string;
  answer: string[];
  mode: "major" | "minor";
  options: string[];
}

export function filterNotes(key: string, mode: "major" | "minor", level: number): string[] {
  const allowDoubleSharp = level >= 9;

  const sharpMajorKeys = ["C", "D", "E", "G", "A", "B", "C#", "D#", "F#", "G#", "A#"];
  const flatMajorKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb"];
  const sharpMinorKeys = ["A", "E", "B", "F#", "C#", "G#", "D#"];
  const flatMinorKeys = ["D", "G", "C", "F", "Bb", "Eb", "Ab"];

  let isSharpKey = false;
  if (mode === "major" && sharpMajorKeys.includes(key)) {
    isSharpKey = true;
  } else if (mode === "minor" && sharpMinorKeys.includes(key)) {
    isSharpKey = true;
  } else if (mode === "major" && flatMajorKeys.includes(key)) {
    isSharpKey = false;
  } else if (mode === "minor" && flatMinorKeys.includes(key)) {
    isSharpKey = false;
  } else {
    return ALL_NOTES.filter(n => allowDoubleSharp || !n.includes("𝄪"));
  }

  if (isSharpKey) {
    return ALL_NOTES.filter(n => !n.includes("b") && (allowDoubleSharp || !n.includes("𝄪")));
  } else {
    return ALL_NOTES.filter(n => !n.includes("#") && (allowDoubleSharp || !n.includes("𝄪")));
  }
}

export function generateQuestion(
  level: number,
  mode: PracticeMode,
  difficulty: "easy" | "normal" | "hard" = "normal"
): Question {
  let effectiveLevel = level;
  if (difficulty === "easy") effectiveLevel = Math.max(1, level - 2);
  if (difficulty === "hard") effectiveLevel = Math.min(9, level + 2);

  let selectedMode: "major" | "minor" = mode === "mixed" ? "major" : mode;
  let key = "C";

  if (mode === "mixed") {
    const availableMajor = getAvailableKeys(effectiveLevel, "major");
    const availableMinor = getAvailableKeys(effectiveLevel, "minor");
    
    const allAvailable: { key: string; mode: "major" | "minor" }[] = [];
    availableMajor.forEach(k => allAvailable.push({ key: k, mode: "major" }));
    availableMinor.forEach(k => allAvailable.push({ key: k, mode: "minor" }));

    if (allAvailable.length === 0) {
      allAvailable.push({ key: "C", mode: "major" });
    }

    const randomChoice = allAvailable[Math.floor(Math.random() * allAvailable.length)];
    key = randomChoice.key;
    selectedMode = randomChoice.mode;
  } else {
    let availableKeys = getAvailableKeys(effectiveLevel, mode);
    if (availableKeys.length === 0) {
      availableKeys = ["C"];
      selectedMode = "major";
    }
    key = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  }

  const scales = selectedMode === "major" ? MAJOR_SCALES : MINOR_SCALES;
  const answer = scales[key] || MAJOR_SCALES["C"];
  const options = filterNotes(key, selectedMode, level);

  return {
    key,
    answer,
    mode: selectedMode,
    options
  };
}
