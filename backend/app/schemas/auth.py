from pydantic import BaseModel


class AuthRegister(BaseModel):
    username: str
    email: str
    password: str


class AuthLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
