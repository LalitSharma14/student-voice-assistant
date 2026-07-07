import argparse
import json
import os


def initialize_firebase():
    import firebase_admin
    from firebase_admin import credentials, firestore

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        credential = credentials.Certificate(json.loads(service_account_json))
    else:
        credential_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credential_path:
            raise RuntimeError("Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.")
        credential = credentials.Certificate(credential_path)

    if not firebase_admin._apps:
        firebase_admin.initialize_app(credential)
    return firestore.client()


def provision(email: str, password: str, name: str):
    from firebase_admin import auth, firestore

    db = initialize_firebase()
    try:
        user = auth.get_user_by_email(email)
        user = auth.update_user(
            user.uid,
            password=password,
            display_name=name,
            email_verified=True,
            disabled=False,
        )
        action = "Updated"
    except auth.UserNotFoundError:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name,
            email_verified=True,
            disabled=False,
        )
        action = "Created"

    claims = dict(user.custom_claims or {})
    claims["qa_tester"] = True
    auth.set_custom_user_claims(user.uid, claims)
    db.collection("users").document(user.uid).set(
        {
            "name": name,
            "email": email,
            "mobile": "",
            "classLevel": "5",
            "board": "CBSE",
            "answerLanguage": "en",
            "authProvider": "password",
            "qaTester": True,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )
    print(f"{action} verified QA tester: {email} ({user.uid})")


def remove(email: str):
    from firebase_admin import auth

    initialize_firebase()
    try:
        user = auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        print(f"QA tester does not exist: {email}")
        return
    auth.delete_user(user.uid)
    print(f"Removed QA tester authentication account: {email}")


def main():
    parser = argparse.ArgumentParser(description="Provision or remove a verified Firebase QA tester.")
    parser.add_argument("action", choices=["provision", "remove"])
    parser.add_argument("--email", required=True)
    parser.add_argument("--password")
    parser.add_argument("--name", default="Teachifyy QA")
    args = parser.parse_args()

    email = args.email.strip().lower()
    if args.action == "provision":
        if not args.password:
            parser.error("--password is required when provisioning")
        provision(email, args.password, args.name.strip())
    else:
        remove(email)


if __name__ == "__main__":
    main()
