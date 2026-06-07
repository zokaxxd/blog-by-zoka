from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import users, posts, comments

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(posts.router)
app.include_router(comments.router)

@app.get("/")
def home():
    return {"message": "Welcome to the Blog API!"}