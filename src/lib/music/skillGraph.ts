export const BASIC_MAJOR_KEYS = ["C", "D", "E", "G", "A", "B"]; // Lv1-2
export const FLAT_MAJOR_KEYS = ["F", "Db", "Eb", "Gb", "Ab", "Bb"]; // Lv3+
export const SHARP_KEYS = ["C", "D", "E", "G", "A", "B", "F#"]; // 一般升記號調
export const DOUBLE_SHARP_KEYS = ["C#", "D#", "G#", "A#"]; // Lv9+ 重升記號調

export const BASIC_MINOR_KEYS = ["A", "E", "B", "D", "G", "C"]; // Lv6+
export const ADVANCED_MINOR_KEYS = ["F#", "C#", "F", "Bb", "Eb", "Ab"]; // Lv7+
export const DOUBLE_SHARP_MINOR_KEYS = ["G#", "D#"]; // Lv9+

export type PracticeMode = "major" | "minor" | "mixed";

export function getAvailableKeys(level: number, mode: PracticeMode = "major"): string[] {
  if (mode === "major") {
    const availableKeys: string[] = [];
    if (level >= 1) availableKeys.push(...BASIC_MAJOR_KEYS);
    if (level >= 3) availableKeys.push(...FLAT_MAJOR_KEYS);
    if (level >= 5) availableKeys.push("F#");
    if (level >= 9) availableKeys.push(...DOUBLE_SHARP_KEYS);
    return availableKeys;
  } else if (mode === "minor") {
    const availableKeys: string[] = [];
    if (level >= 6) availableKeys.push(...BASIC_MINOR_KEYS);
    if (level >= 7) availableKeys.push(...ADVANCED_MINOR_KEYS);
    if (level >= 9) availableKeys.push(...DOUBLE_SHARP_MINOR_KEYS);
    return availableKeys;
  } else if (mode === "mixed") {
    return [...getAvailableKeys(level, "major"), ...getAvailableKeys(level, "minor")];
  }
  return [];
}
