from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, members, documents, files

# 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WeSign API",
    description="WeSign - 용역 계약 서류 자동화 서비스 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(members.router)
app.include_router(documents.router)
app.include_router(files.router)


@app.get("/")
def root():
    return {"message": "WeSign API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
