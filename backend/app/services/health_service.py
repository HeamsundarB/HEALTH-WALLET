from app.schemas.health import HealthResponse
from app.core.config import settings

class HealthService:
    @staticmethod
    def check_health() -> HealthResponse:
        return HealthResponse(
            status="ok",
            service="health-wallet-backend",
            version="0.1.0"
        )
