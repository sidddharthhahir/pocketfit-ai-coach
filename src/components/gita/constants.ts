export const CHAPTER_VERSE_COUNTS = [
  47, 72, 43, 42, 29, 47, 30, 28, 34, 42,
  55, 20, 35, 27, 20, 24, 28, 78,
];

export const CHAPTER_NAMES = [
  "Arjuna's Despair",
  "The Way of Knowledge",
  "The Path of Action",
  "Knowledge & Renunciation",
  "Action & Renunciation",
  "The Practice of Meditation",
  "Knowledge & Realization",
  "The Imperishable Absolute",
  "Royal Knowledge",
  "Divine Glories",
  "The Universal Form",
  "Devotion",
  "The Field & Knower",
  "The Three Gunas",
  "The Supreme Self",
  "Divine & Demonic Natures",
  "Three Kinds of Faith",
  "Liberation Through Renunciation",
];

export const TOTAL_VERSES = CHAPTER_VERSE_COUNTS.reduce((a, b) => a + b, 0);

export interface VerseData {
  reference: string;
  shlok: string | null;
  transliteration: string | null;
  meaning: string;
  context: string;
  deeper_understanding: string;
  reflection: string;
  insight: string;
  chapter_intro: string | null;
}

export interface QuestionAnswer {
  answer: string;
  related_verse: string | null;
}
