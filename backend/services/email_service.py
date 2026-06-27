from typing import Optional

def send_email(
    email: str,
    subject: str,
    message: str,
    attachment: Optional[bytes] = None,
    filename: Optional[str] = None
):
    print(f"Sending Email To: {email}")
    print(f"Subject: {subject}")
    print(f"Message: {message}")
    
    if attachment and filename:
        print(f"Attached File: {filename} ({len(attachment)} bytes)")
    
    # In a real environment, you would use smtplib, SendGrid, etc.
    # to construct a MIME multipart message and send it here.
    return True
