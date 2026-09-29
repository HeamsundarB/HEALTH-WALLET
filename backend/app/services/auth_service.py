import secrets
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Response, Request
from app.models.user import User, Role, UserRole, RoleName
from app.models.session import UserSession
from app.models.otp import OTPVerification
from app.core.security import (
    get_password_hash,
    verify_password,
    hash_otp,
    verify_otp_hash,
    hash_refresh_token,
    create_access_token,
    create_refresh_token,
)
from app.core.logging import logger
from app.schemas.auth import (
    UserRegisterRequest,
    RegisterResponse,
    OTPVerifyRequest,
    LoginRequest,
    TokenResponse,
)
from app.schemas.user import UserOut

class AuthService:
    @staticmethod
    def register_user(db: Session, req: UserRegisterRequest) -> RegisterResponse:
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User email already registered"
            )

        role_obj = db.query(Role).filter(Role.name == req.role).first()
        if not role_obj:
            role_obj = Role(name=req.role, description=f"{req.role.value} role")
            db.add(role_obj)
            db.flush()

        user = User(
            email=req.email,
            hashed_password=get_password_hash(req.password),
            full_name=req.full_name,
            phone_number=req.phone_number,
            is_active=True,
            is_verified=False,
        )
        db.add(user)
        db.flush()

        user_role = UserRole(user_id=user.id, role_id=role_obj.id)
        db.add(user_role)

        # Generate simulated 6-digit OTP code (PROTOTYPE SIMULATION ONLY)
        otp_code = f"{random.randint(100000, 999999)}"
        otp_entry = OTPVerification(
            user_id=user.id,
            phone_or_email=req.email,
            otp_hash=hash_otp(otp_code),
            purpose="REGISTRATION",
            is_used=False,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        )
        db.add(otp_entry)
        db.commit()

        logger.info(f"Registered synthetic user id={user.id} email={user.email} role={req.role.value}")

        return RegisterResponse(
            message="User registered successfully. Simulated OTP sent.",
            user_id=user.id,
            simulated_otp_code=otp_code,
        )

    @staticmethod
    def verify_otp(db: Session, req: OTPVerifyRequest) -> dict:
        otp_record = (
            db.query(OTPVerification)
            .filter(
                OTPVerification.user_id == req.user_id,
                OTPVerification.is_used == False,
            )
            .order_by(OTPVerification.created_at.desc())
            .first()
        )

        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No pending OTP request found or OTP already verified"
            )

        # Ensure datetime is timezone-aware for comparison
        expires_at = otp_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP code has expired"
            )

        if not verify_otp_hash(req.otp_code, otp_record.otp_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )

        # Mark single-use verification
        otp_record.is_used = True
        user = db.query(User).filter(User.id == req.user_id).first()
        if user:
            user.is_verified = True
        db.commit()

        return {"message": "OTP verified successfully. User is now verified."}

    @staticmethod
    def login_user(db: Session, req: LoginRequest, response: Response, request_info: dict = None) -> TokenResponse:
        user = db.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        user_role_names = [ur.role.name.value for ur in user.roles]

        # Generate JWT Access Token (short-lived)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "roles": user_role_names}
        )

        # Generate Refresh Token (long-lived)
        raw_refresh_token = create_refresh_token()
        refresh_hash = hash_refresh_token(raw_refresh_token)

        # Save session in database
        session_obj = UserSession(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            ip_address=request_info.get("ip") if request_info else None,
            user_agent=request_info.get("user_agent") if request_info else None,
            is_revoked=False,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        db.add(session_obj)
        db.commit()

        # Set HttpOnly + Secure cookie for refresh token
        response.set_cookie(
            key="refresh_token",
            value=raw_refresh_token,
            httponly=True,
            secure=False,  # Set to False for local http dev compatibility
            samesite="lax",
            max_age=7 * 24 * 3600,
        )

        user_out = UserOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone_number=user.phone_number,
            is_active=user.is_active,
            is_verified=user.is_verified,
            roles=[ur.role.name for ur in user.roles],
            created_at=user.created_at,
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            refresh_token=raw_refresh_token,
            user=user_out,
        )

    @staticmethod
    def refresh_access_token(db: Session, request: Request, req_body_token: str = None) -> dict:
        cookie_token = request.cookies.get("refresh_token")
        raw_token = req_body_token or cookie_token
        if not raw_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token missing"
            )

        token_hash = hash_refresh_token(raw_token)
        session_obj = (
            db.query(UserSession)
            .filter(UserSession.refresh_token_hash == token_hash)
            .first()
        )

        if not session_obj or session_obj.is_revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalid or revoked"
            )

        expires_at = session_obj.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired"
            )

        user = session_obj.user
        user_role_names = [ur.role.name.value for ur in user.roles]
        new_access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "roles": user_role_names}
        )

        return {
            "access_token": new_access_token,
            "token_type": "bearer",
        }

    @staticmethod
    def logout_user(db: Session, request: Request, response: Response, req_body_token: str = None) -> dict:
        cookie_token = request.cookies.get("refresh_token")
        raw_token = req_body_token or cookie_token
        if raw_token:
            token_hash = hash_refresh_token(raw_token)
            sessions = db.query(UserSession).filter(UserSession.refresh_token_hash == token_hash).all()
            for sess in sessions:
                sess.is_revoked = True
            db.commit()

        response.delete_cookie("refresh_token")
        return {"message": "Successfully logged out and session revoked"}
