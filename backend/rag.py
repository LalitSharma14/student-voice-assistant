"""
rag.py — RAG (Retrieval Augmented Generation) engine

What this does:
  1. Reads NCERT PDF books from the books/ folder
  2. Splits them into small text chunks
  3. Stores chunks in ChromaDB (local vector database, no cloud needed)
  4. When a student asks a question, finds the most relevant chunks
  5. Returns those chunks to llm.py so the LLM answers FROM the book

Folder structure expected:
  books/
    class_5/
      evs_class_5
      bansuri_class_5
      khelyoga_class_5
"""

import os
import re
from pathlib import Path
from typing import Optional

import chromadb
from chromadb.utils import embedding_functions

# ── Config ─────────────────────────────────────────────────
BOOKS_DIR     = Path(os.getenv("BOOKS_DIR",  "books"))
CHROMA_DIR    = Path(os.getenv("CHROMA_DIR", "chroma_db"))
CHUNK_SIZE    = 400
CHUNK_OVERLAP = 80
TOP_K         = 5

# Subject aliases — maps any variation to canonical name
SUBJECT_ALIASES = {
    "evs":                   "evs",
    "environmental":         "evs",
    "environmental studies": "evs",
    "science":               "evs",
    "sci":                   "evs",
    "nature":                "evs",

    "bansuri":               "bansuri",
    "hindi":                 "bansuri",
    "language":              "bansuri",
    "bhasha":                "bansuri",

    "khelyoga":              "khelyoga",
    "khel":                  "khelyoga",
    "yoga":                  "khelyoga",
    "physical":              "khelyoga",
    "pe":                    "khelyoga",
    "activity":              "khelyoga",
    "sports":                "khelyoga",
    "exercise":              "khelyoga",
}

# Canonical subject → PDF filename (must match your actual filenames)
SUBJECT_FILE_MAP = {
    "evs":      "evs_class_5",
    "bansuri":  "bansuri_class_5",
    "khelyoga": "khelyoga_class_5",
}

# Keywords used to auto-detect subject from question
SUBJECT_KEYWORDS = {
    "evs": [
        "plant", "animal", "water", "air", "soil", "food", "shelter",
        "family", "work", "travel", "environment", "tree", "leaf",
        "seed", "flower", "fruit", "root", "stem", "insect", "bird",
        "fish", "farm", "crop", "rain", "river", "pond", "mountain",
        "village", "city", "market", "health", "disease", "body",
        "sense", "organ", "sun", "moon", "star", "weather", "season",
        "direction", "map", "community", "house", "building", "road",
        "photosynthesis", "ecosystem", "habitat", "nutrition",
    ],
    "bansuri": [
        "story", "poem", "chapter", "lesson", "character", "paragraph",
        "reading", "comprehension", "word", "sentence", "meaning",
        "bansuri", "hindi", "language", "grammar", "fill in the blanks",
        "question answer", "passage", "write", "describe", "bansuri",
    ],
    "khelyoga": [
        "game", "play", "sport", "exercise", "yoga", "run", "jump",
        "throw", "catch", "balance", "physical", "activity", "body",
        "stretch", "warm up", "team", "rule", "field", "outdoor",
        "indoor", "health", "fit", "strength", "flexibility",
        "breathing", "posture", "movement", "khelyoga",
    ],
}

# ── ChromaDB singleton ─────────────────────────────────────
_chroma_client = None
_embedding_fn  = None


def _get_client():
    global _chroma_client, _embedding_fn

    if _chroma_client is not None:
        return _chroma_client, _embedding_fn

    CHROMA_DIR.mkdir(parents=True, exist_ok=True)

    _chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    _embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    print("[RAG] ✅ ChromaDB client initialised")
    return _chroma_client, _embedding_fn


# ── Helpers ─────────────────────────────────────────────────
def _normalize_subject(subject: str) -> str:
    """Normalize any subject string to canonical name."""
    key = subject.lower().strip().replace("-", " ").replace("_", " ")
    return SUBJECT_ALIASES.get(key, key)


def _collection_name(class_level: str, subject: str) -> str:
    """Each class+subject gets its own ChromaDB collection."""
    subj = _normalize_subject(subject).replace(" ", "_")
    return f"class_{class_level}_{subj}"


def _list_collection_names() -> list[str]:
    """Get all existing collection names safely across ChromaDB versions."""
    client, _ = _get_client()
    try:
        collections = client.list_collections()
        names = []
        for c in collections:
            if hasattr(c, "name"):
                names.append(c.name)
            elif isinstance(c, str):
                names.append(c)
        return names
    except Exception as e:
        print(f"[RAG] ⚠️  Could not list collections: {e}")
        return []


def detect_subject_from_question(question: str) -> Optional[str]:
    """
    Auto-detect which subject a question is about.
    Returns canonical subject name or None if unclear.
    """
    q_lower = question.lower()
    scores  = {}
    for subject, keywords in SUBJECT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in q_lower)
        if score > 0:
            scores[subject] = score
    if not scores:
        return None
    return max(scores, key=scores.get)


# ── PDF text extraction ──────────────────────────────────────
def _extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract all text from a PDF using pypdf, fallback to pdfminer."""
    try:
        import pypdf
        reader    = pypdf.PdfReader(str(pdf_path))
        pages     = []
        for page in reader.pages:
            text = page.extract_text() or ""
            pages.append(text.strip())
        full_text = "\n\n".join(p for p in pages if p)
        print(f"[RAG] Extracted {len(full_text)} chars from {pdf_path.name} via pypdf")
        return full_text
    except Exception as e:
        print(f"[RAG] pypdf failed ({e}), trying pdfminer...")

    try:
        from pdfminer.high_level import extract_text
        full_text = extract_text(str(pdf_path))
        print(f"[RAG] Extracted {len(full_text)} chars from {pdf_path.name} via pdfminer")
        return full_text or ""
    except Exception as e:
        print(f"[RAG] ❌ PDF extraction failed: {e}")
        return ""


# ── Chunking ─────────────────────────────────────────────────
def _chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int    = CHUNK_OVERLAP,
) -> list[str]:
    """Split text into overlapping chunks."""
    text       = re.sub(r"\n{3,}", "\n\n", text).strip()
    paragraphs = re.split(r"\n\n+", text)

    chunks  = []
    current = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current) + len(para) + 2 <= chunk_size:
            current = (current + "\n\n" + para).strip() if current else para
        else:
            if current:
                chunks.append(current)
                overlap_text = current[-overlap:] if len(current) > overlap else current
                current      = (overlap_text + "\n\n" + para).strip()
            else:
                # Single paragraph longer than chunk_size — split by sentence
                sentences = re.split(r"(?<=[.!?।])\s+", para)
                for sentence in sentences:
                    if len(current) + len(sentence) + 1 <= chunk_size:
                        current = (current + " " + sentence).strip() if current else sentence
                    else:
                        if current:
                            chunks.append(current)
                        current = sentence

    if current:
        chunks.append(current)

    return [c for c in chunks if len(c.strip()) > 60]


# ══════════════════════════════════════════════════════════
#  PUBLIC API
# ══════════════════════════════════════════════════════════

def ingest_book(
    class_level: str,
    subject: str,
    pdf_path: Optional[Path] = None,
) -> dict:
    """
    Ingest one PDF into ChromaDB.

    Returns: { "status": "ok"|"error", "chunks": N, "message": "..." }
    """
    client, embed_fn = _get_client()

    canonical_subject = _normalize_subject(subject)

    # Resolve PDF path
    if pdf_path is None:
        filename = SUBJECT_FILE_MAP.get(canonical_subject, f"{canonical_subject}_class_{class_level}")
        pdf_path = BOOKS_DIR / f"class_{class_level}" / filename

    # Try with and without .pdf extension
    if not pdf_path.exists():
        pdf_path_with_ext = Path(str(pdf_path) + ".pdf")
        if pdf_path_with_ext.exists():
            pdf_path = pdf_path_with_ext
        else:
            msg = f"PDF not found: {pdf_path}"
            print(f"[RAG] ❌ {msg}")
            return {"status": "error", "chunks": 0, "message": msg}

    text = _extract_text_from_pdf(pdf_path)
    if not text.strip():
        return {
            "status":  "error",
            "chunks":  0,
            "message": "PDF text extraction returned empty.",
        }

    chunks = _chunk_text(text)
    print(f"[RAG] {len(chunks)} chunks from {pdf_path.name}")

    coll_name = _collection_name(class_level, canonical_subject)

    # Delete existing to avoid duplicates on re-ingest
    try:
        client.delete_collection(name=coll_name)
        print(f"[RAG] Deleted existing collection '{coll_name}'")
    except Exception:
        pass

    collection = client.create_collection(
        name=coll_name,
        embedding_function=embed_fn,
        metadata={"hnsw:space": "cosine"},
    )

    # Add in batches of 100
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch     = chunks[i: i + batch_size]
        ids       = [f"{coll_name}_chunk_{i + j}" for j in range(len(batch))]
        metadatas = [
            {
                "class":       class_level,
                "subject":     canonical_subject,
                "chunk_index": i + j,
            }
            for j in range(len(batch))
        ]
        collection.add(documents=batch, ids=ids, metadatas=metadatas)

    msg = f"Ingested {len(chunks)} chunks from {pdf_path.name} into '{coll_name}'"
    print(f"[RAG] ✅ {msg}")
    return {"status": "ok", "chunks": len(chunks), "message": msg}


def ingest_all_books(class_level: str) -> list[dict]:
    """
    Ingest all PDFs found in books/class_{class_level}/.
    Call this once after placing PDFs in the books/ folder.
    Handles files with or without .pdf extension.
    """
    results   = []
    class_dir = BOOKS_DIR / f"class_{class_level}"

    if not class_dir.exists():
        print(f"[RAG] ❌ No books directory: {class_dir}")
        return [{"status": "error", "message": f"Directory not found: {class_dir}"}]

    # Find all files — with or without .pdf extension
    all_files = list(class_dir.glob("*.pdf")) + [
        f for f in class_dir.iterdir()
        if f.is_file() and not f.suffix
    ]

    if not all_files:
        return [{"status": "error", "message": f"No files found in {class_dir}"}]

    for file_path in all_files:
        # Use filename stem as subject key
        raw_subject = file_path.stem.lower().replace(f"_class_{class_level}", "").strip("_")
        canonical   = _normalize_subject(raw_subject)

        result = ingest_book(class_level, canonical, pdf_path=file_path)
        results.append({**result, "subject": canonical, "class": class_level})

    return results


def retrieve_context(
    question: str,
    class_level: str,
    subject: Optional[str] = None,
    top_k: int = TOP_K,
) -> str:
    """
    Find the most relevant book passages for a student's question.

    - If subject is given, searches that book directly.
    - If subject is None, auto-detects from question keywords.
    - If no book ingested for that class+subject, returns empty string
      so caller falls back to LLM-only mode gracefully.

    Returns formatted string of passages ready to inject into LLM prompt.
    """
    client, embed_fn = _get_client()

    # Resolve subject
    if subject:
        canonical_subject = _normalize_subject(subject)
    else:
        canonical_subject = detect_subject_from_question(question)
        if not canonical_subject:
            print("[RAG] ⚠️  Could not detect subject — LLM-only fallback")
            return ""

    coll_name = _collection_name(class_level, canonical_subject)

    # Check collection exists
    existing = _list_collection_names()
    if coll_name not in existing:
        print(f"[RAG] ⚠️  No collection '{coll_name}' — LLM-only fallback")
        return ""

    try:
        collection = client.get_collection(
            name=coll_name,
            embedding_function=embed_fn,
        )

        count = collection.count()
        if count == 0:
            print(f"[RAG] ⚠️  Collection '{coll_name}' is empty")
            return ""

        results = collection.query(
            query_texts=[question],
            n_results=min(top_k, count),
        )

        passages = results.get("documents", [[]])[0]
        if not passages:
            return ""

        formatted = "\n\n---\n\n".join(
            f"[Book passage {i+1}]\n{p.strip()}"
            for i, p in enumerate(passages)
            if p.strip()
        )

        print(
            f"[RAG] ✅ Retrieved {len(passages)} passages "
            f"| class={class_level} subject={canonical_subject}"
        )
        return formatted

    except Exception as e:
        print(f"[RAG] ❌ Retrieval error: {e}")
        return ""


def is_book_available(class_level: str, subject: str) -> bool:
    """Check if a book has been ingested for this class+subject."""
    canonical = _normalize_subject(subject)
    coll_name = _collection_name(class_level, canonical)
    return coll_name in _list_collection_names()


def list_ingested_books() -> list[dict]:
    """Return all ingested collections with their chunk counts."""
    client, _ = _get_client()
    names     = _list_collection_names()
    result    = []
    for name in names:
        try:
            count = client.get_collection(name).count()
            result.append({"collection": name, "chunks": count})
        except Exception:
            result.append({"collection": name, "chunks": "unknown"})
    return result