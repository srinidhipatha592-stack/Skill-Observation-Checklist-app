from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    username: str | None = None
    password: str
    role: str
    school_name: str | None = None
    employee_id: str | None = None
    qualification: str | None = None


class LoginRequest(BaseModel):
    identifier: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str