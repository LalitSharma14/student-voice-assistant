# Content Library Seed Data

This folder stores reviewed learning content before it is uploaded to Firestore.

Current seed:

- `class_5_cbse_all_subjects.json`
- Board: CBSE
- Class: 5
- Subjects: EVS, Maths, English, Hindi
- Topics: 256 total topic documents matching the current frontend Class 5 NCERT-style syllabus

The older `class_5_cbse_science.json` file is kept only as an early demo seed. The active seed is generated from the NCERT-style Class 5 syllabus in `generate_class_5_cbse_all_subjects.py`.

## Firestore Location

Upload each topic document to:

```text
contentLibrary/{id}
```

Example:

```text
contentLibrary/class_5_cbse_evs_super_senses_animal_senses
```

Students can read documents only when:

```text
status = "published"
```

## Firestore Rules

Copy the rules from:

```text
firestore.rules
```

Paste them in:

```text
Firebase Console -> Firestore Database -> Rules
```

Then click publish.

## Import From Local VS Code

Do not commit or paste your Firebase service account secret.

1. In Firebase Console, open:

```text
Project settings -> Service accounts -> Generate new private key
```

2. Save the JSON key outside the repository, for example:

```text
C:\Users\lalit\Documents\firebase-keys\student-tutor-service-account.json
```

3. In VS Code terminal, from the repo root:

PowerShell:

```powershell
pip install -r requirements.txt
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\lalit\Documents\firebase-keys\student-tutor-service-account.json"
python backend/import_content_library.py --dry-run
python backend/import_content_library.py
```

Command Prompt:

```cmd
pip install -r requirements.txt
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\lalit\Documents\firebase-keys\student-tutor-service-account.json
python backend\import_content_library.py --dry-run
python backend\import_content_library.py
```

The dry run prints document IDs without writing. The second command uploads to Firestore.

## Regenerate The Full Class 5 Seed

If the frontend Class 5 syllabus changes, update:

```text
backend/content_seed/generate_class_5_cbse_all_subjects.py
```

Then run:

```cmd
python backend\content_seed\generate_class_5_cbse_all_subjects.py
```

## Frontend Behavior

When a student clicks Study or Revise:

1. The frontend checks `contentLibrary`.
2. If a published document exists, stored content is displayed immediately.
3. If no content exists, the existing AI fallback is used.
4. The student sees only a clean label like `Study Topic: Photosynthesis`, not the internal AI prompt.
