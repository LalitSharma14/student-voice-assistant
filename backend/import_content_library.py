import argparse
import json
import os
from pathlib import Path


def initialize_firestore():
    import firebase_admin
    from firebase_admin import credentials, firestore

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

    if service_account_json:
        cred = credentials.Certificate(json.loads(service_account_json))
    else:
        credential_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credential_path:
            raise RuntimeError(
                "Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON path "
                "or set FIREBASE_SERVICE_ACCOUNT_JSON."
            )
        cred = credentials.Certificate(credential_path)

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    return firestore.client()


def import_seed(
    seed_path: Path,
    dry_run: bool = False,
    id_prefix: str | None = None,
    prune_missing: bool = False,
):
    with seed_path.open("r", encoding="utf-8") as file:
        topics = json.load(file)

    if not isinstance(topics, list):
        raise ValueError("Seed file must contain a JSON array of topic documents.")

    selected_topics = [
        topic
        for topic in topics
        if not id_prefix or str(topic.get("id") or "").startswith(id_prefix)
    ]
    expected_ids = {topic.get("id") for topic in selected_topics if topic.get("id")}
    scopes = {
        (
            str(topic.get("classLevel") or ""),
            str(topic.get("board") or ""),
            str(topic.get("subject") or ""),
        )
        for topic in selected_topics
    }

    db = None if dry_run else initialize_firestore()
    server_timestamp = None
    if not dry_run:
        from firebase_admin import firestore
        server_timestamp = firestore.SERVER_TIMESTAMP

    for topic in selected_topics:
        content_id = topic.get("id")
        if not content_id:
            raise ValueError("Every topic document must include an id field.")

        data = dict(topic)
        data.pop("id", None)

        if dry_run:
            print(f"[DRY RUN] contentLibrary/{content_id}")
            continue

        doc_ref = db.collection("contentLibrary").document(content_id)
        doc_ref.set(
            {
                **data,
                "updatedAt": server_timestamp,
            },
            merge=True,
        )
        print(f"Imported contentLibrary/{content_id}")

    if prune_missing:
        if dry_run:
            print("[DRY RUN] Skipped pruning because Firestore is not connected.")
            return

        for snapshot in db.collection("contentLibrary").stream():
            data = snapshot.to_dict() or {}
            scope = (
                str(data.get("classLevel") or ""),
                str(data.get("board") or ""),
                str(data.get("subject") or ""),
            )
            if scope in scopes and snapshot.id not in expected_ids:
                snapshot.reference.delete()
                print(f"Deleted obsolete contentLibrary/{snapshot.id}")


def main():
    parser = argparse.ArgumentParser(description="Import content library seed data into Firestore.")
    parser.add_argument(
        "--seed",
        default="backend/content_seed/class_5_cbse_all_subjects.json",
        help="Path to the JSON seed file.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print document IDs without writing to Firestore.",
    )
    parser.add_argument(
        "--id-prefix",
        default=None,
        help="Only import documents whose id starts with this prefix.",
    )
    parser.add_argument(
        "--prune-missing",
        action="store_true",
        help="Delete obsolete documents within the imported class, board, and subject scopes.",
    )
    args = parser.parse_args()

    import_seed(
        Path(args.seed),
        dry_run=args.dry_run,
        id_prefix=args.id_prefix,
        prune_missing=args.prune_missing,
    )


if __name__ == "__main__":
    main()
