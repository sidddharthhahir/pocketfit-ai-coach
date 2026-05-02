import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    gita: {
      title: "Bhagavad Gita",
      subtitle: "Daily verse, reflection & wisdom",
      todaysVerse: "Today's verse",
      chapter: "Chapter",
      verse: "Verse",
      explainDeeper: "Explain deeper",
      askQuestion: "Ask a question",
      askPlaceholder: "Ask anything about this verse…",
      send: "Send",
      cancel: "Cancel",
      bookmark: "Bookmark",
      bookmarked: "Bookmarked",
      bookmarks: "Bookmarks",
      journal: "Journal",
      journalPlaceholder: "Write your reflection on this verse…",
      saveJournal: "Save reflection",
      journalSaved: "Reflection saved",
      chapterMap: "Chapter map",
      streak: "Day streak",
      longestStreak: "Longest streak",
      next: "Next verse",
      previous: "Previous",
      loading: "Loading verse…",
      noBookmarks: "You haven't bookmarked any verses yet.",
      language: "Language",
      english: "English",
      hindi: "हिन्दी",
    },
  },
  hi: {
    gita: {
      title: "भगवद् गीता",
      subtitle: "दैनिक श्लोक, चिंतन और ज्ञान",
      todaysVerse: "आज का श्लोक",
      chapter: "अध्याय",
      verse: "श्लोक",
      explainDeeper: "विस्तार से समझाएँ",
      askQuestion: "प्रश्न पूछें",
      askPlaceholder: "इस श्लोक के बारे में कुछ भी पूछें…",
      send: "भेजें",
      cancel: "रद्द करें",
      bookmark: "सहेजें",
      bookmarked: "सहेजा गया",
      bookmarks: "सहेजे गए श्लोक",
      journal: "जर्नल",
      journalPlaceholder: "इस श्लोक पर अपना चिंतन लिखें…",
      saveJournal: "चिंतन सहेजें",
      journalSaved: "चिंतन सहेजा गया",
      chapterMap: "अध्याय सूची",
      streak: "दिन की लय",
      longestStreak: "सबसे लंबी लय",
      next: "अगला श्लोक",
      previous: "पिछला",
      loading: "श्लोक लोड हो रहा है…",
      noBookmarks: "आपने अभी तक कोई श्लोक नहीं सहेजा है।",
      language: "भाषा",
      english: "English",
      hindi: "हिन्दी",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "hi"],
    ns: ["gita"],
    defaultNS: "gita",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "boomstart_lang",
    },
  });

export default i18n;
