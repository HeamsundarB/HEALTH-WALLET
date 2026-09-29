from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(..., example="ok")
    service: str = Field(..., example="health-wallet-backend")
    version: str = Field(default="0.1.0", example="0.1.0")

class ErrorResponse(BaseModel):
    error: str = Field(..., example="Resource not found")
    detail: str = Field(..., example="Detailed error description")
    code: int = Field(..., example=404)
