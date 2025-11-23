export type PhraseNub = {
  phrase: string;
  phraseLower: string;
};

type PhraseOfLang<LangT extends string> = { lang: LangT } & PhraseNub;

type SomaliPhrase = PhraseOfLang<"somali"> & { italic: boolean };
type EnglishPhrase = PhraseOfLang<"english">;

export type EitherPhrase = SomaliPhrase | EnglishPhrase;

export type Language = EitherPhrase["lang"];

export function otherLanguage(lang: Language): Language {
  switch (lang) {
    case "somali":
      return "english";
    case "english":
      return "somali";
  }
}

export function displayLanguage(lang: Language): string {
  switch (lang) {
    case "somali":
      return "Somali";
    case "english":
      return "English";
  }
}

export type PhraseBookRecord = {
  id: number;
  keyPhrase: EitherPhrase;
  altKeyPhrases: Array<EitherPhrase>;
  valuePhrases: Array<EitherPhrase>;
};

export type Query = {
  keyLanguage: Language;
  search: string;
};

export const kInitialQuery: Query = { keyLanguage: "english", search: "" };
