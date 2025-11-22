import { Suspense, use, useState, type ChangeEventHandler } from "react";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

type SomaliPhrase = {
  lang: "somali";
  phrase: string;
  italic: boolean;
};

type EnglishPhrase = {
  lang: "english";
  phrase: string;
};

type EitherPhrase = SomaliPhrase | EnglishPhrase;

type Language = EitherPhrase["lang"];
function otherLanguage(lang: Language): Language {
  switch (lang) {
    case "somali":
      return "english";
    case "english":
      return "somali";
  }
}

function displayLanguage(lang: Language): string {
  switch (lang) {
    case "somali":
      return "Somali";
    case "english":
      return "English";
  }
}

type PhraseBookRecord = {
  id: number;
  keyPhrase: EitherPhrase;
  altKeyPhrases: Array<EitherPhrase>;
  valuePhrases: Array<EitherPhrase>;
};

const _fetchRecords = async () => {
  const resp = await fetch("phrase-book.json");
  const untypedData = (await resp.json()) as Array<unknown>;
  return untypedData.map((obj, id) =>
    Object.assign({}, obj, { id })
  ) as Array<PhraseBookRecord>;
};

let _records: Promise<Array<PhraseBookRecord>> | null = null;
const fetchRecords = () => {
  if (_records == null) _records = _fetchRecords();
  return _records;
};

type SinglePhraseProps = { phrase: EitherPhrase };
const SinglePhrase: React.FC<SinglePhraseProps> = ({ phrase }) => {
  const italic = (() => {
    switch (phrase.lang) {
      case "somali":
        return phrase.italic;
      case "english":
        return false;
    }
  })();

  const clsName = italic ?? false ? "_SinglePhrase italic" : "_SinglePhrase";

  return <span className={clsName}>{phrase.phrase}</span>;
};

type PhraseBookRecordDisplayProps = { record: PhraseBookRecord };
const PhraseBookRecordDisplay: React.FC<PhraseBookRecordDisplayProps> = ({
  record,
}) => {
  return (
    <div className="_PhraseBookRecordDisplay">
      <div className="key-phrases">
        <span className="primary-key">
          <SinglePhrase phrase={record.keyPhrase} />
        </span>
        <div className="alt-key-phrases">
          {record.altKeyPhrases.map((phrase, idx) => (
            <span>
              (
              <SinglePhrase key={idx} phrase={phrase} />)
            </span>
          ))}
        </div>
      </div>
      <div className="value-phrases">
        {record.valuePhrases.map((phrase, idx) => (
          <SinglePhrase key={idx} phrase={phrase} />
        ))}
      </div>
    </div>
  );
};

type VocabTableContentProps = { query: Query };
const VocabTableContent: React.FC<VocabTableContentProps> = ({ query }) => {
  const records = use(fetchRecords());
  const displayRecords = queryResults(records, query);

  const setLeftMargin = (elt: HTMLDivElement | null) => {
    if (elt == null) return;
    const scrollbarWd = elt.offsetWidth - elt.clientWidth;
    elt.style.marginLeft = `${scrollbarWd}px`;
  };

  return (
    <div className="_VocabTableContent" ref={setLeftMargin}>
      {displayRecords.map((r) => (
        <PhraseBookRecordDisplay key={r.id} record={r} />
      ))}
    </div>
  );
};

function Loading() {
  return <h2>Loading...</h2>;
}

type Query = {
  keyLanguage: Language;
  search: string;
};

const kInitialQuery: Query = { keyLanguage: "english", search: "" };

function queryResults(allRecords: Array<PhraseBookRecord>, query: Query) {
  let result = allRecords.slice();

  result = result.filter(
    (r) =>
      r.keyPhrase.lang === query.keyLanguage &&
      r.keyPhrase.phrase.toLowerCase().includes(query.search.toLowerCase())
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

type DirectionToggleProps = {
  keyLang: Language;
  setKeyLang: (newKeyLang: Language) => void;
};

const DirectionToggle: React.FC<DirectionToggleProps> = ({
  keyLang,
  setKeyLang,
}) => {
  return (
    <div className="_DirectionToggle">
      <span className="key-lang">{displayLanguage(keyLang)}</span>
      <span
        className="toggle-direction"
        onClick={() => setKeyLang(otherLanguage(keyLang))}
      >
        ⇄
      </span>
      <span className="value-lang">
        {displayLanguage(otherLanguage(keyLang))}
      </span>
    </div>
  );
};

type QueryControlProps = {
  query: Query;
  setQuery: (q: Query) => void;
};
const QueryControl: React.FC<QueryControlProps> = ({ query, setQuery }) => {
  const setSearch: ChangeEventHandler<HTMLInputElement> = (evt) => {
    setQuery({ keyLanguage: query.keyLanguage, search: evt.target.value });
  };
  const setKeyLanguage = (lang: Language) => {
    setQuery({ keyLanguage: lang, search: query.search });
  };

  const clearSearch = () => {
    setQuery({ keyLanguage: query.keyLanguage, search: "" });
  };

  return (
    <div className="_QueryControl">
      <Form className="search-bar">
        <span className="search-icon">
          <span>
            <span />
          </span>
          <span>
            <span />
          </span>
        </span>
        <Form.Control
          type="plaintext"
          value={query.search}
          onChange={setSearch}
        />
        <span className="clear-button" onClick={clearSearch}>
          ×
        </span>
      </Form>
      <DirectionToggle
        keyLang={query.keyLanguage}
        setKeyLang={setKeyLanguage}
      />
    </div>
  );
};

export const VocabTable: React.FC = () => {
  const [query, setQuery] = useState<Query>(kInitialQuery);

  return (
    <div className="_VocabTable">
      <Suspense fallback={<Loading />}>
        <QueryControl {...{ query, setQuery }} />
        <VocabTableContent {...{ query }} />
      </Suspense>
    </div>
  );
};
