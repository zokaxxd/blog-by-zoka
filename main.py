from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import sqlite3
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

#================= Hash

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password[:72])

def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password[:72], hashed_password)


# ============ Token func

def create_token(data: dict):
    dados = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    dados.update({"exp": expire})
    token = jwt.encode(dados, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        email = payload.get("email")

        if user_id is None or email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        return {"user_id": user_id, "email": email}
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


#============== Models
class User(BaseModel):
    name: str
    age: int
    email: EmailStr
    password: str

class Post(BaseModel):
    title: str
    content: str

class Comment(BaseModel):
    content: str

#============== Tables
def get_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    return conn, cursor

def create_table():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
create_table()

def create_post_table():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_id INTEGER,
            FOREIGN KEY (author_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()
create_post_table()

def like_post():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        author_id INTEGER
    )
        ''')
    conn.commit()
    conn.close()
like_post()

def create_comment_table():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            post_id INTEGER,
            author_id INTEGER,
            FOREIGN KEY (post_id) REFERENCES posts (id),
            FOREIGN KEY (author_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()
create_comment_table()

# ============= Routes
@app.get("/users")
def all_users(name: str = None, Limit: int = 10, offset: int = 0):
    conn, cursor = get_db()

    query = "SELECT * FROM users"
    params = ()

    if name:
        query += " WHERE name LIKE ?"
        params = (f"%{name}%",)
    if name:
        cursor.execute("SELECT COUNT(*) FROM users WHERE name LIKE ?", (f"%{name}%"))
    else:
        cursor.execute("SELECT COUNT(*) FROM users")

    total = cursor.fetchone()[0]

    query += " LIMIT ? OFFSET ?"
    params += (Limit, offset)

    cursor.execute(query, params)
    data = cursor.fetchall()
    conn.close()

    users = [
        {
            "id": u[0],
            "name": u[1],
            "age": u[2],
            "email": u[3]
        }
        for u in data
    ]
    return{
        "total": total,
        "limit": Limit,
        "offset": offset,
        "users": users
    }

@app.post("/users")
def create_user(user: User):
    conn, cursor = get_db()
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    exist = cursor.fetchone()
    
    if exist:
        conn.close()
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    pass_hash = hash_password(user.password)
    cursor.execute("INSERT INTO users (name, age, email, password) VALUES (?, ?, ?, ?)",
                (user.name, user.age, user.email, pass_hash))
    conn.commit()
    conn.close()
    
    return {
        "msg": "usuario criado",
        "user": {
            "name": user.name,
            "idade": user.age,
            "email": user.email
        }
    }

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn, cursor = get_db()
    cursor.execute("SELECT id, email, password FROM users WHERE email = ?", (form_data.username,))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(form_data.password, user[2]):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    token_data = {"sub": str(user[0]), "email": user[1]}
    token = create_token(token_data)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/profile")
def profile(user: dict = Depends(verify_token)):
    conn, cursor = get_db()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user["user_id"],))
    data = cursor.fetchone()
    conn.close()

    return{
        "name": data[1],
        "age": data[2],
        "email": data[3]
    }

@app.put("/users/{id}")
def update_user(user: User, id: int):
    conn, cursor = get_db()
    cursor.execute("SELECT * FROM users WHERE email = ? AND id != ?", (user.email, id))
    exist = cursor.fetchone()
    
    if exist:
        conn.close()
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    pass_hash = hash_password(user.password)
    
    cursor.execute("UPDATE users SET name = ?, age = ?, email = ?, password = ? WHERE id = ?",
            (user.name, user.age, user.email, pass_hash, id))
    conn.commit()
    conn.close()

    return {"msg": "usuario atualizado"}

@app.post("/posts")
def create_post(post: Post, user: dict = Depends(verify_token)):
    conn, cursor = get_db()
    cursor.execute("INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)"
                ,(post.title, post.content, user["user_id"])
                )
    conn.commit()
    conn.close()
    return {"msg": "post criado"}

@app.get("/posts")
def get_posts(user: dict = Depends(verify_token)):
    conn, cursor = get_db()
    cursor.execute("SELECT * FROM posts")
    data = cursor.fetchall()
    conn.close()
    
    posts = [
        {
            "id": p[0],
            "title": p[1],
            "content": p[2],
            "author_id": p[3]
        }
        for p in data
    ]
    return {
        "posts": posts
    }

@app.get("/posts/{id}")
def get_post(id: int, user: dict = Depends(verify_token)):
    conn, cursor = get_db()
    cursor.execute("SELECT * FROM posts WHERE id = ?", (id,))
    data = cursor.fetchone()
    conn.close()

    if not data:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    return {
        "id": data[0],
        "title": data[1],
        "content": data[2],
        "author_id": data[3]
    }

@app.delete("/posts/{id}")
def del_post(id: int, user: dict = Depends(verify_token)):
    conn,cursor = get_db()
    cursor.execute("DELETE FROM posts WHERE id = ? AND author_id = ?", (id, user["user_id"]))
    conn.commit()
    conn.close()

    return {"msg": "post deletado"}

@app.post("/posts/{id}/comments")
def comment(Comment: Comment, id: int, user: dict = Depends(verify_token)):
    conn, cursor = get_db()
    cursor.execute("INSERT INTO comments (content, post_id, author_id) VALUES (?, ?, ?)"
                ,(Comment.content, id, user["user_id"])
                )
    conn.commit()
    conn.close()
    return {"msg": "comentário enviado"}

@app.get("/posts/{id}/comments")
def get_comments(id: int, user: dict = Depends(verify_token)):
    conn, cursor = get_db()
    cursor.execute("SELECT * FROM comments WHERE post_id = ?", (id,))
    data = cursor.fetchall()
    conn.close()
    
    comments = [
        {
            "id": c[0],
            "content": c[1],
            "author_id": c[3]
        }
        for c in data
    ]
    return {
        "comments": comments
    }

@app.delete("/comments/{id}")
def del_comment(id: int, user: dict = Depends(verify_token)):
    conn,cursor = get_db()
    
    cursor.execute("DELETE FROM comments WHERE id = ? AND author_id = ?", (id, user["user_id"]))
    conn.commit()
    conn.close()

    return {"msg": "comentário deletado"}

@app.post("/posts/{id}/likes")
def like_a_post(id: int, user: dict = Depends(verify_token)):
    conn, cursor = get_db()

    cursor.execute("INSERT INTO likes (post_id, author_id) VALUES (?, ?)", (id, user["user_id"]))
    curtiu = cursor.fetchone()

    if curtiu:
        conn.close()
        raise HTTPException(status_code=400, detail="Post já curtido")
    
    cursor.execute("INSERT INTO likes (post_id, author_id) VALUES (?, ?)", (id, user["user_id"]))
    conn.commit()
    conn.close()
    return {"msg": "post curtido"}

@app.delete("/posts/{id}/likes")
def unlike_a_post(id: int, user: dict = Depends(verify_token)):
    conn, cursor = get_db()
    
    cursor.execute("DELETE FROM likes WHERE post_id = ? AND author_id = ?", (id, user["user_id"]))

    conn.commit()
    conn.close()
    return {"msg": "post não mais curtido"}


