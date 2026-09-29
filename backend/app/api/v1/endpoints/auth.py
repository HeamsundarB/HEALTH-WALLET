from fastapi import APIRouter, Depends, status, Response, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import (
    UserRegisterRequest,
    RegisterResponse,
    OTPVerifyRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    MessageResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Synthetic User Account",
    description="Register a new synthetic user account and trigger a 6-digit simulated OTP verification code."
)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    return AuthService.register_user(db, req)

@router.post(
    "/otp/verify",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Simulated OTP",
    description="Verify prototype 6-digit OTP code against hashed storage to mark user verified."
)
def verify_otp(req: OTPVerifyRequest, db: Session = Depends(get_db)):
    return AuthService.verify_otp(db, req)

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticate synthetic user email/password, returning JWT Access Token and set HttpOnly Refresh Token cookie."
)
def login(req: LoginRequest, response: Response, request: Request, db: Session = Depends(get_db)):
    request_info = {
        "ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
    }
    return AuthService.login_user(db, req, response, request_info)

@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    summary="Refresh Access Token",
    description="Present valid refresh token (via cookie or request body) to receive a fresh JWT access token."
)
def refresh_token(
    request: Request,
    req_body: RefreshTokenRequest = None,
    db: Session = Depends(get_db)
):
    token_str = req_body.refresh_token if req_body else None
    return AuthService.refresh_access_token(db, request, token_str)

@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="User Logout",
    description="Revoke the user's refresh token session in database and clear refresh cookie."
)
def logout(
    request: Request,
    response: Response,
    req_body: RefreshTokenRequest = None,
    db: Session = Depends(get_db)
):
    token_str = req_body.refresh_token if req_body else None
    return AuthService.logout_user(db, request, response, token_str)
