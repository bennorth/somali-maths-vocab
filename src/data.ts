import type { PhraseBookRecord } from "./model";

const _fetchRecords = async () => {
  const resp = await fetch("phrase-book.json");
  const untypedData = (await resp.json()) as Array<unknown>;
  return untypedData.map((obj, id) =>
    Object.assign({}, obj, { id })
  ) as Array<PhraseBookRecord>;
};

let _records: Promise<Array<PhraseBookRecord>> | null = null;
export const fetchRecords = () => {
  if (_records == null) _records = _fetchRecords();
  return _records;
};
