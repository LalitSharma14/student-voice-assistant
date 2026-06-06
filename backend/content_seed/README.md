# Content Library Seed Data

This folder stores reviewed learning content before it is uploaded to Firestore.

Current seed:

- `class_5_cbse_all_subjects.json`
- `class_6_cbse_all_subjects.json`
- Board: CBSE
- Class 5 subjects: EVS, Maths, English, Hindi
- Class 6 subjects: Maths, Science, Social Science, English, Hindi
- Class 5 topics: 256 total topic documents matching the current frontend Class 5 NCERT-style syllabus
- Class 6 topics: 216 total topic documents matching the current frontend Class 6 CBSE syllabus

The older `class_5_cbse_science.json` file is kept only as an early demo seed. The active seed is generated from the NCERT-style Class 5 syllabus in `generate_class_5_cbse_all_subjects.py`.
The Class 6 seed is generated from `generate_class_6_cbse_all_subjects.py`.

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

To upload Class 6 instead of Class 5:

```cmd
python backend\import_content_library.py --seed backend\content_seed\class_6_cbse_all_subjects.json --dry-run
python backend\import_content_library.py --seed backend\content_seed\class_6_cbse_all_subjects.json
```

## Regenerate The Full Class 5 Seed

If the frontend Class 5 syllabus changes, update:

```text
backend/content_seed/generate_class_5_cbse_all_subjects.py
```

Then run:

```cmd
python backend\content_seed\generate_class_5_cbse_all_subjects.py
```

## Regenerate The Full Class 6 Seed

If the frontend Class 6 syllabus changes, update:

```text
backend/content_seed/generate_class_6_cbse_all_subjects.py
```

Then run:

```cmd
python backend\content_seed\generate_class_6_cbse_all_subjects.py
```

## Frontend Behavior

When a student clicks Study or Revise:

1. The frontend checks `contentLibrary`.
2. If a published document exists, stored content is displayed immediately.
3. If no content exists, the existing AI fallback is used.
4. The student sees only a clean label like `Study Topic: Photosynthesis`, not the internal AI prompt.
