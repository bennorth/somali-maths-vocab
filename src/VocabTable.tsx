import { Suspense, use, useState, type ChangeEventHandler } from "react";
import { Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

type VocabRecord = {
  somali: string;
  english: string;
};

function delaySeconds(t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, t * 1000.0);
  });
}

let _records: Promise<Array<VocabRecord>> | null = null;

const _fetchRecords = async () => {
  const data: Array<VocabRecord> = [
    { somali: "hello", english: "ttt world" },
    { somali: "a hello", english: "www world" },
    { somali: "g hello", english: "aaa world" },
    { somali: "z hello", english: "bbb world" },
  ];
  await delaySeconds(0.2);
  return data;
};

const fetchRecords = () => {
  if (_records == null) _records = _fetchRecords();
  return _records;
};

type VocabTableRecordProps = { r: VocabRecord };
const VocabTableRecord: React.FC<VocabTableRecordProps> = ({ r }) => {
  return (
    <tr>
      <td>{r.somali}</td>
      <td>{r.english}</td>
    </tr>
  );
};

type VocabTableContentProps = { query: Query };
const VocabTableContent: React.FC<VocabTableContentProps> = ({ query }) => {
  const records = use(fetchRecords());
  const displayRecords = queryResults(records, query);
  return displayRecords.map((r) => <VocabTableRecord r={r} />);
};

function Loading() {
  return <h2>🌀 Loading...</h2>;
}

type Language = "somali" | "english";

type Query = {
  keyLanguage: Language;

  search: string;
};

const kInitialQuery: Query = { keyLanguage: "english", search: "" };

function queryResults(allRecords: Array<VocabRecord>, query: Query) {
  let result = allRecords.slice();

  console.log("searching", result, "for", query.search);
  console.log(result[0][query.keyLanguage]);
  console.log(result[0][query.keyLanguage].includes(""));
  result = result.filter((r) => r[query.keyLanguage].includes(query.search));

  console.log("filtered to", result);

  result.sort((a, b) => {
    const aKey = a[query.keyLanguage];
    const bKey = b[query.keyLanguage];
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });

  return result;
}

type QueryControlProps = {
  query: Query;
  setQuery: (q: Query) => void;
};
const QueryControl: React.FC<QueryControlProps> = ({ query, setQuery }) => {
  const setSearch: ChangeEventHandler<HTMLInputElement> = (evt) => {
    setQuery({ keyLanguage: query.keyLanguage, search: evt.target.value });
  };
  const setLanguageIsSomali: ChangeEventHandler<HTMLInputElement> = (evt) => {
    setQuery({
      keyLanguage: evt.target.checked ? "somali" : "english",
      search: query.search,
    });
  };
  return (
    <div className="_QueryControl">
      <Form>
        <Form.Text>Well?</Form.Text>
        <Form.Control
          type="plaintext"
          value={query.search}
          onChange={setSearch}
        />
        <Form.Check
          type="switch"
          checked={query.keyLanguage === "somali"}
          label="English to Somali?"
          onChange={setLanguageIsSomali}
        />
      </Form>
    </div>
  );
};

export const VocabTable: React.FC = () => {
  const [query, setQuery] = useState<Query>(kInitialQuery);

  return (
    <div className="_VocabTable">
      <p>{JSON.stringify(query)}</p>
      <Suspense fallback={<Loading />}>
        <QueryControl {...{ query, setQuery }} />
        <table>
          <VocabTableContent {...{ query }} />
        </table>
      </Suspense>
    </div>
  );
};
