import os
from fastapi import FastAPI, Depends, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from supabase import create_client
from dotenv import load_dotenv
from routers import music

load_dotenv()

app = FastAPI(title="Resonance API", description="YT Music Powered Backend", version="4.0.0")

# Setup CORS with all deployed frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://resonance.vercel.app",
        "https://resonancebyechostudio.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Rate Limiting globally
from rate_limiter import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from db import supabase, verify_token

@app.get("/")
async def root():
    return {"status": "ok", "service": "Resonance Backend v4", "docs": "/docs"}

# Mount the modular router with the global auth dependency
app.include_router(
    music.router, 
    prefix="/api",
    dependencies=[Depends(verify_token)]
)
