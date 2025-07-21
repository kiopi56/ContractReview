from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import fugashi

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 形態素解析器
tagger = fugashi.Tagger()

@app.get("/")
def read_root():
    return {"message": "FastAPI動作中", "status": "OK"}

@app.post("/check")
async def check(doc: dict = Body(...)):
    must = ["NDA", "法律", "損害賠償", "責任", "解除"]
    text = doc.get("text", "")
    
    # 形態素解析して単語リストを作成
    words = [word.surface for word in tagger(text)]
    
    # 不足している項目をチェック
    missing = [m for m in must if not any(m in word for word in words)]
    
    return {
        "missing": missing,
        "found": [m for m in must if m not in missing],
        "word_count": len(words)
    }