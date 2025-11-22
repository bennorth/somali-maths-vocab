import csv, json, sys, itertools, dataclasses
from typing import Literal

immutable_dataclass = dataclasses.dataclass(frozen=True)


@immutable_dataclass
class SomaliPhrase:
    lang: Literal["somali"]
    phrase: str
    italic: bool

    @classmethod
    def make(cls, phrase: str, italic: bool):
        return cls("somali", phrase, italic)


@immutable_dataclass
class EnglishPhrase:
    lang: Literal["english"]
    phrase: str

    @classmethod
    def make(cls, phrase: str):
        return cls("english", phrase)


type EitherPhrase = SomaliPhrase | EnglishPhrase
type PhraseBucket = set[EitherPhrase]


@immutable_dataclass
class PhraseLink:
    eng: EnglishPhrase
    som: SomaliPhrase


records: list[PhraseLink] = []
for row in itertools.islice(csv.reader(sys.stdin), 1, None):
    records.append(
        PhraseLink(EnglishPhrase.make(row[1]), SomaliPhrase.make(row[2], row[3] == "Y"))
    )

# Gather records into buckets as finely as possible while obeying the
# rule that an English phrase and a Somali phrase belong in the same
# bucket if there is a record linking them and each phrase (of either
# language) is in exactly one bucket.


def bucket_contains(bucket: PhraseBucket, phrase_link: PhraseLink):
    return any(
        (
            (isinstance(ph, SomaliPhrase) and ph.phrase == phrase_link.som.phrase)
            or (isinstance(ph, EnglishPhrase) and ph.phrase == phrase_link.eng.phrase)
        )
        for ph in bucket
    )


buckets: list[PhraseBucket] = []
for r in records:
    candidate_bs = [b for b in buckets if bucket_contains(b, r)]
    target_bucket: set[SomaliPhrase | EnglishPhrase]
    if len(candidate_bs) > 1:
        target_bucket: PhraseBucket = set()
        for b in candidate_bs:
            target_bucket.update(b)
            buckets.remove(b)
        buckets.append(target_bucket)
    elif len(candidate_bs) == 0:
        target_bucket = set()
        buckets.append(target_bucket)
    else:  # Exactly one candidate
        target_bucket = candidate_bs[0]
    target_bucket.add(r.eng)
    target_bucket.add(r.som)


# Use camelCase ready for export as JSON.
@immutable_dataclass
class PhraseBookRecord:
    keyPhrase: EitherPhrase
    altKeyPhrases: list[EitherPhrase]
    valuePhrases: list[EitherPhrase]


phrase_book: list[PhraseBookRecord] = []
for b in buckets:
    for ph in b:
        alt_key_phrases = [
            ph1 for ph1 in b if ph1.lang == ph.lang and ph1.phrase != ph.phrase
        ]
        value_phrases = [ph1 for ph1 in b if ph1.lang != ph.lang]
        pbr = PhraseBookRecord(ph, alt_key_phrases, value_phrases)
        phrase_book.append(pbr)

print(json.dumps([dataclasses.asdict(e) for e in phrase_book]))
