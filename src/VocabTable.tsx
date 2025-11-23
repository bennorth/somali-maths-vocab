import { Suspense, use, useState, type ChangeEventHandler } from "react";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  displayLanguage,
  kInitialQuery,
  otherLanguage,
  queryResults,
  type EitherPhrase,
  type Language,
  type PhraseBookRecord,
  type Query,
} from "./model";
import { fetchRecords } from "./data";

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

  const clsName = italic ? "_SinglePhrase italic" : "_SinglePhrase";

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
            <span key={idx}>
              (<SinglePhrase phrase={phrase} />)
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
  setQuery: (newQuery: Query) => void;
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
