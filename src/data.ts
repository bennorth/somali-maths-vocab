import type { PhraseBookRecord, PhraseNub } from "./model";

const _addLower = (phrase: PhraseNub) => {
  phrase.phraseLower = phrase.phrase.toLowerCase();
};

const _fetchRecords = async () => {
  const resp = await fetch("phrase-book.json");
  const untypedData = (await resp.json()) as Array<any>;

  untypedData.forEach((obj, id) => {
    obj.id = id;
    _addLower(obj.keyPhrase);
    obj.altKeyPhrases.forEach(_addLower);
    obj.valuePhrases.forEach(_addLower);
  });

  return untypedData as Array<PhraseBookRecord>;
};

let _records: Promise<Array<PhraseBookRecord>> | null = null;
export const fetchRecords = () => {
  if (_records == null) _records = _fetchRecords();
  return _records;
};
