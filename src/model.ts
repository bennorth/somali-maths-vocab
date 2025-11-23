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

export function queryResults(
  allRecords: Array<PhraseBookRecord>,
  query: Query
) {
  const queryKeyLang = query.keyLanguage;
  const querySearchLower = query.search.toLowerCase();

  let result = allRecords.slice();

  result = result.filter(
    (r) =>
      r.keyPhrase.lang === queryKeyLang &&
      r.keyPhrase.phraseLower.includes(querySearchLower)
  );

  result.sort((a, b) => {
    const aKey = a.keyPhrase.phrase;
    const bKey = b.keyPhrase.phrase;
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });

  return result;
}
