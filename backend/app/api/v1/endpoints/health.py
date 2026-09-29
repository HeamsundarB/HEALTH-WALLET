from fastapi import APIRouter, status
from app.schemas.health import HealthResponse
from app.services.health_service import HealthService

router = APIRouter()

@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Service Health Status",
    description="Returns simple operational health confirmation for the Health Wallet backend service."
)
def get_health() -> HealthResponse:
    return HealthService.check_health()
