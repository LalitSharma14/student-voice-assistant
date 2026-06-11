# Content Library Seed Data

This folder stores reviewed learning content before it is uploaded to Firestore.

Current seed:

- `class_5_cbse_all_subjects.json`
- `class_6_cbse_all_subjects.json`
- Board: CBSE
- Class 5 subjects: EVS, Maths, English, Hindi, Art Education
- Class 6 subjects: Maths, Science, Social Science, English, Hindi
- Class 5 topics: 121 total topic documents generated from the reviewed NCERT JSON note files in `class5_ncert_json_notes`
- Class 6 topics: 243 total topic documents. Maths, Science, Social Science, and English are generated from the detailed JSON files in `class6_teacher_style_json_v1`; Hindi is preserved from the existing Class 6 syllabus until a detailed Hindi JSON is added.

The older `class_5_cbse_science.json` file is kept only as an early demo seed. The active Class 5 seed is generated from `class5_evs.json`, `class5_mathematics.json`, `class5_english.json`, `class5_hindi.json`, and `class5_art.json` in `class5_ncert_json_notes` using `generate_class_5_cbse_all_subjects.py`.
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

If the Class 5 NCERT JSON notes change, update the files in:

```text
backend/content_seed/class5_ncert_json_notes
```

Then run:

```text
backend/content_seed/generate_class_5_cbse_all_subjects.py
```

```cmd
python backend\content_seed\generate_class_5_cbse_all_subjects.py
```

## Regenerate The Full Class 6 Seed

If the Class 6 teacher-style JSON notes change, update the files in:

```text
backend/content_seed/class6_teacher_style_json_v1
```

If Class 6 Hindi changes, update the Hindi fallback list in:

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
