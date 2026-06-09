import argparse
import json
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = BASE_DIR / "class_6_cbse_all_subjects.json"
DEFAULT_SOURCE_DIR = BASE_DIR / "class6_teacher_style_json_v1"

SOURCE_FILES = {
    "English": "class6_english_teacher_style_v1.json",
    "Maths": "class6_mathematics_teacher_style_v1.json",
    "Science": "class6_science_teacher_style_v1.json",
    "Social Science": "class6_social_studies_teacher_style_v1.json",
}

SUBJECT_LABELS = {
    "Maths": "NCERT Ganita Prakash",
    "Science": "NCERT Curiosity",
    "Social Science": "NCERT Exploring Society: India and Beyond",
    "English": "NCERT Poorvi",
    "Hindi": "NCERT Malhar",
}

HINDI_SYLLABUS = [
    ("Matrbhumi", ["Kavita ka bhav", "Desh prem", "Pushp ki Abhilasha", "Shabdarth"]),
    ("Gol", ["Sansmaran", "Khel aur anubhav", "Ek daud aisi bhi", "Prashn uttar"]),
    ("Pahali Boond", ["Kavita path", "Prakriti varnan", "Varsha ka mahatva", "Bhavarth"]),
    ("Haar Ki Jeet", ["Kahani path", "Patra aur ghatna", "Naitik sandesh", "Prashn uttar"]),
    ("Rahim Ke Dohe", ["Doha path", "Arth", "Jeevan moolya", "Udaharan"]),
    ("Meri Maan", ["Atmakatha", "Maa ka prem", "Yaadein", "Prashn uttar"]),
    ("Jalate Chalo", ["Kavita ka sandesh", "Prerna", "Deepak ka pratik", "Bhavarth"]),
    ("Sattriya Aur Bihu Nritya", ["Nritya parampara", "Assam ki sanskriti", "Kala aur abhyas", "Prashn uttar"]),
    ("Maiya Main Nahin Makhan Khayo", ["Pad path", "Krishna leela", "Bhakti bhav", "Shabdarth"]),
    ("Pariksha", ["Kahani path", "Imaandari", "Mehnat", "Prashn uttar"]),
    ("Chetak Ki Veerta", ["Kavita path", "Chetak ka sahas", "Maharana Pratap", "Bhavarth"]),
    ("Hind Mahasagar Mein Chhota-sa Hindustan", ["Yatra vrittant", "Pravasi Bharatiya", "Hind Mahasagar", "Prashn uttar"]),
    ("Ped Ki Baat", ["Prakriti sandesh", "Vriksh ka mahatva", "Paryavaran", "Prashn uttar"]),
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
    return slug(f"class_6_CBSE_{subject}_{chapter}_{topic}")


def as_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
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
                    terms.append({
                        "term": term,
                        "meaning": meaning or term,
                        "example": example,
                    })
            else:
                text = str(item).strip()
                if text:
                    terms.append({"term": text, "meaning": text, "example": ""})
        return terms
    terms = as_list(value)
    return [{"term": term, "meaning": term, "example": ""} for term in terms]


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


def load_subject_file(source_dir: Path, subject: str) -> dict:
    path = source_dir / SOURCE_FILES[subject]
    if not path.exists():
        raise FileNotFoundError(f"Missing Class 6 source JSON: {path}")
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    if isinstance(data, list):
        return {"chapters": data}
    if isinstance(data, dict) and "chapters" in data:
        return data
    raise ValueError(f"{path} must contain a chapters array or a JSON object with a chapters array.")


def make_doc(subject: str, chapter: dict, topic: dict) -> dict:
    chapter_title = str(chapter.get("chapter") or "").strip()
    topic_title = str(topic.get("topic") or "").strip()
    if not chapter_title or not topic_title:
        raise ValueError(f"Missing chapter/topic title in {subject}: {chapter}")

    examples = as_list(topic.get("examples"))
    step_by_step = step_by_step_items(topic, examples)
    revision_notes = as_list(topic.get("revisionNotes"))
    quick_summary = str(topic.get("quickSummary") or "").strip()
    source_label = f"Based on {SUBJECT_LABELS[subject]} + AI-generated teacher-style explanation"

    return {
        "id": content_id(subject, chapter_title, topic_title),
        "classLevel": "6",
        "board": str(chapter.get("board") or "CBSE").strip(),
        "subject": subject,
        "chapterNumber": chapter.get("chapterNumber"),
        "chapterTitle": chapter_title,
        "topicTitle": topic_title,
        "language": chapter.get("language") or "en",
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
                "content": " -> ".join([topic_title, "Meaning", "Steps", "Examples", "Quick revision"]),
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
                "Give one textbook-style or real-life example.",
            ],
        },
    }


def make_hindi_doc(chapter_title: str, topic_title: str) -> dict:
    intro = f"{topic_title} Class 6 Hindi chapter {chapter_title} ka mahatvapurn hissa hai."
    ncert = f"NCERT Malhar mein {chapter_title} ke madhyam se {topic_title}, bhav, sandesh, shabdarth, patra, ghatna, ya jeevan moolya ko samjhaya jata hai."
    easy = f"Easy words mein, {topic_title} ko pehle mukhya bhav se jodo, phir ek example aur important shabdon ke saath apne shabdon mein samjho."
    steps = [
        f"{chapter_title} ka mukhya bhav samjho.",
        f"{topic_title} se judi line, ghatna, patra, ya sandesh ko pehchano.",
        "Mushkil shabdon ka saral arth likho.",
        "Ek chhota example ya path se point jodo.",
        "Answer ko simple Hindi ya Hinglish mein clear points mein likho.",
    ]
    keywords = [
        {"term": topic_title, "meaning": intro, "example": f"{chapter_title} mein {topic_title} ka abhyas."},
        {"term": "Bhav", "meaning": "Path ya kavita ka mukhya anubhav ya sandesh.", "example": "Kavita ka bhav apne shabdon mein likhna."},
        {"term": "Shabdarth", "meaning": "Mushkil shabdon ka saral arth.", "example": "Path ke naye shabdon ke arth."},
    ]
    summary = [
        intro,
        "Path ko ratne se pehle uska bhav samajhna zaruri hai.",
        "Important shabd, example, aur sandesh answer ko strong banate hain.",
    ]
    diagram = f"{topic_title} -> Bhav -> Shabdarth -> Example -> Revision"
    return {
        "id": content_id("Hindi", chapter_title, topic_title),
        "classLevel": "6",
        "board": "CBSE",
        "subject": "Hindi",
        "chapterTitle": chapter_title,
        "topicTitle": topic_title,
        "language": "hi",
        "status": "published",
        "sourceLabel": "Based on NCERT Malhar + AI-generated explanation",
        "studyContent": {
            "title": topic_title,
            "intro": intro,
            "ncertBasedExplanation": ncert,
            "aiSimplifiedExplanation": easy,
            "stepByStep": steps,
            "keywords": keywords,
            "realLifeExample": f"Example: {chapter_title} ke answer mein {topic_title} ko path ke sandesh se joda ja sakta hai.",
            "diagram": {
                "type": "text",
                "title": f"{topic_title} Flow",
                "content": diagram,
            },
            "summary": summary,
        },
        "revisionContent": {
            "quickMeaning": intro,
            "keyPoints": summary,
            "importantTerms": keywords,
            "mustRemember": summary,
            "quickFlowchart": diagram,
            "examPoints": [
                f"{topic_title} ko samjhaiye.",
                "Path ka mukhya bhav likhiye.",
                "Ek example ya shabdarth likhiye.",
            ],
        },
    }


def build_seed(source_dir: Path) -> list[dict]:
    docs = []
    seen = set()
    for subject in ["Maths", "Science", "Social Science", "English"]:
        data = load_subject_file(source_dir, subject)
        for chapter in data.get("chapters", []):
            for topic in chapter.get("topics", []):
                doc = make_doc(subject, chapter, topic)
                if doc["id"] in seen:
                    raise ValueError(f"Duplicate content id: {doc['id']}")
                seen.add(doc["id"])
                docs.append(doc)
    for chapter_title, topics in HINDI_SYLLABUS:
        for topic_title in topics:
            doc = make_hindi_doc(chapter_title, topic_title)
            if doc["id"] in seen:
                raise ValueError(f"Duplicate content id: {doc['id']}")
            seen.add(doc["id"])
            docs.append(doc)
    return docs


def main():
    parser = argparse.ArgumentParser(description="Generate Class 6 CBSE content seed from teacher-style JSON notes.")
    parser.add_argument(
        "--source-dir",
        default=str(DEFAULT_SOURCE_DIR),
        help="Directory containing the Class 6 teacher-style JSON files.",
    )
    parser.add_argument(
        "--output",
        default=str(OUTPUT_PATH),
        help="Output seed JSON path.",
    )
    args = parser.parse_args()

    docs = build_seed(Path(args.source_dir))
    output_path = Path(args.output)
    output_path.write_text(json.dumps(docs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(docs)} content documents to {output_path}")


if __name__ == "__main__":
    main()
