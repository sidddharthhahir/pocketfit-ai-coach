export const CHAPTER_VERSE_COUNTS = [
  47, 72, 43, 42, 29, 47, 30, 28, 34, 42,
  55, 20, 35, 27, 20, 24, 28, 78,
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
