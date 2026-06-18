import argparse
import json
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = BASE_DIR / "class_10_cbse_all_subjects.json"
DEFAULT_SOURCE_DIR = BASE_DIR / "class10_ncert_json_notes"
FRONTEND_SYLLABUS_PATH = BASE_DIR.parent.parent / "frontend" / "src" / "data" / "class10Syllabus.js"

SOURCE_GROUPS = [
    ("Maths", ["class10_mathematics.json"]),
    ("Science", ["class10_science.json"]),
    ("Social Science", ["class10_history.json", "class10_geography.json", "class10_political_science.json"]),
    ("English", ["class10_english_first_flight.json", "class10_english_footprints.json"]),
    ("Hindi", ["class10_hindi_kshitij.json", "class10_hindi_sparsh.json"]),
    ("Sanskrit", ["class10_sanskrit.json"]),
]


def slug(value: str) -> str:
    pieces = []
    for char in value.lower():
        if char.isascii() and char.isalnum():
            pieces.append(char)
        elif char.isspace() or char in "-_./'’:":
            pieces.append("_")
        elif char.isalnum():
            pieces.append(f"u{ord(char):x}")
        else:
            pieces.append("_")
    return re.sub(r"_+", "_", "".join(pieces)).strip("_")


def content_id(subject: str, chapter: str, topic: str) -> str:
    return slug(f"class_10_CBSE_{subject}_{chapter}_{topic}")


def as_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        result = []
        for item in value:
            if isinstance(item, dict):
                text = str(item.get("explanation") or item.get("text") or item.get("title") or item).strip()
            else:
                text = str(item).strip()
            if text:
                result.append(text)
        return result
    if isinstance(value, str):
        parts = [part.strip() for part in value.split(";")]
        return [part for part in parts if part]
    return [str(value).strip()]


def keyword_terms(value) -> list[dict]:
    if value is None:
        return []
    if isinstance(value, list):
        terms = []
        for item in value:
            if isinstance(item, dict):
                term = str(item.get("keyword") or item.get("term") or "").strip()
                meaning = str(item.get("definition") or item.get("meaning") or "").strip()
                example = str(item.get("simpleExample") or item.get("example") or "").strip()
                if term:
                    terms.append({"term": term, "meaning": meaning or term, "example": example})
            else:
                text = str(item).strip()
                if text:
                    terms.append({"term": text, "meaning": text, "example": ""})
        return terms
    return [{"term": term, "meaning": term, "example": ""} for term in as_list(value)]


def step_by_step_items(topic: dict, fallback_examples: list[str]) -> list[str]:
    steps = topic.get("stepByStepExplanation")
    if not steps:
        return fallback_examples
    if isinstance(steps, list):
        formatted_steps = []
        for item in steps:
            if isinstance(item, dict):
                title = str(item.get("title") or "").strip()
                explanation = str(item.get("explanation") or "").strip()
                if title and explanation:
                    formatted_steps.append(f"{title}: {explanation}")
                elif title or explanation:
                    formatted_steps.append(title or explanation)
            else:
                text = str(item).strip()
                if text:
                    formatted_steps.append(text)
        return formatted_steps or fallback_examples
    if isinstance(steps, str):
        return as_list(steps) or fallback_examples
    return fallback_examples


def load_source_file(source_dir: Path, filename: str) -> dict:
    path = source_dir / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing Class 10 source JSON: {path}")
    with path.open("r", encoding="utf-8-sig") as file:
        data = json.load(file)
    if isinstance(data, list):
        return {"chapters": data, "bookName": path.stem}
    if isinstance(data, dict) and "chapters" in data:
        data.setdefault("bookName", path.stem)
        return data
    raise ValueError(f"{path} must contain a chapters array or an object with a chapters array.")


def language_for(subject: str, source: dict, chapter: dict) -> str:
    explicit = source.get("language") or chapter.get("language")
    if explicit:
        return str(explicit).strip()
    if subject == "Hindi":
        return "hi"
    if subject == "Sanskrit":
        return "sa"
    return "en"


def make_doc(subject: str, source: dict, chapter: dict, topic: dict) -> dict:
    chapter_title = str(chapter.get("chapter") or "").strip()
    topic_title = str(topic.get("topic") or "").strip()
    if not chapter_title or not topic_title:
        raise ValueError(f"Missing chapter/topic title in {subject}: {chapter}")

    examples = as_list(topic.get("examples"))
    step_by_step = step_by_step_items(topic, examples)
    revision_notes = as_list(topic.get("revisionNotes"))
    quick_summary = str(topic.get("quickSummary") or "").strip()
    book_name = str(source.get("bookName") or chapter.get("bookName") or "").strip()
    source_label = (
        f"Based on NCERT {book_name} + AI-generated teacher-style explanation"
        if book_name
        else "Based on NCERT + AI-generated teacher-style explanation"
    )

    return {
        "id": content_id(subject, chapter_title, topic_title),
        "classLevel": "10",
        "board": str(source.get("board") or chapter.get("board") or "CBSE").strip(),
        "subject": subject,
        "chapterNumber": chapter.get("chapterNumber"),
        "chapterTitle": chapter_title,
        "topicTitle": topic_title,
        "language": language_for(subject, source, chapter),
        "status": "published",
        "sourceLabel": source_label,
        "studyContent": {
            "title": topic_title,
            "intro": str(topic.get("meaning") or "").strip(),
            "ncertBasedExplanation": str(topic.get("ncertBasedExplanation") or "").strip(),
            "aiSimplifiedExplanation": str(topic.get("easyExplanation") or "").strip(),
            "stepByStep": step_by_step,
            "keywords": keyword_terms(topic.get("importantKeywords")),
            "realLifeExample": examples[0] if examples else "",
            "diagram": {
                "type": "text",
                "title": f"{topic_title} Flow",
                "content": " -> ".join([topic_title, "Concept", "Example", "Revision"]),
            },
            "summary": [quick_summary] if quick_summary else revision_notes,
        },
        "revisionContent": {
            "quickMeaning": str(topic.get("meaning") or quick_summary or topic_title).strip(),
            "keyPoints": revision_notes or ([quick_summary] if quick_summary else examples),
            "importantTerms": keyword_terms(topic.get("importantKeywords")),
            "mustRemember": revision_notes[:3] or ([quick_summary] if quick_summary else []),
            "quickFlowchart": " -> ".join([topic_title, "Key idea", "Example", "Revision"]),
            "examPoints": [
                f"Explain {topic_title}.",
                "Write two important points.",
                "Give one example from the chapter or daily life.",
            ],
        },
    }


def iter_subject_sources(source_dir: Path):
    for subject, filenames in SOURCE_GROUPS:
        for filename in filenames:
            yield subject, load_source_file(source_dir, filename)


def build_seed(source_dir: Path) -> list[dict]:
    docs = []
    seen = set()
    for subject, data in iter_subject_sources(source_dir):
        for chapter in data.get("chapters", []):
            for topic in chapter.get("topics", []):
                doc = make_doc(subject, data, chapter, topic)
                if doc["id"] in seen:
                    raise ValueError(f"Duplicate content id: {doc['id']}")
                seen.add(doc["id"])
                docs.append(doc)
    return docs


def build_frontend_syllabus(source_dir: Path) -> dict:
    syllabus = {}
    for subject, filenames in SOURCE_GROUPS:
        chapters = []
        for filename in filenames:
            data = load_source_file(source_dir, filename)
            for chapter in data.get("chapters", []):
                chapter_title = str(chapter.get("chapter") or "").strip()
                if not chapter_title:
                    continue
                chapters.append({
                    "title": chapter_title,
                    "subtopics": [
                        str(topic.get("topic") or "").strip()
                        for topic in chapter.get("topics", [])
                        if str(topic.get("topic") or "").strip()
                    ],
                })
        syllabus[subject] = chapters
    return syllabus


def main():
    parser = argparse.ArgumentParser(description="Generate Class 10 CBSE content seed from NCERT JSON notes.")
    parser.add_argument("--source-dir", default=str(DEFAULT_SOURCE_DIR), help="Directory containing Class 10 JSON files.")
    parser.add_argument("--output", default=str(OUTPUT_PATH), help="Output seed JSON path.")
    args = parser.parse_args()

    docs = build_seed(Path(args.source_dir))
    output_path = Path(args.output)
    output_path.write_text(json.dumps(docs, ensure_ascii=False, indent=2), encoding="utf-8")
    frontend_syllabus = build_frontend_syllabus(Path(args.source_dir))
    FRONTEND_SYLLABUS_PATH.write_text(
        "export const CLASS_10_CBSE_SYLLABUS = "
        + json.dumps(frontend_syllabus, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(docs)} content documents to {output_path}")
    print(f"Wrote frontend syllabus to {FRONTEND_SYLLABUS_PATH}")


if __name__ == "__main__":
    main()
