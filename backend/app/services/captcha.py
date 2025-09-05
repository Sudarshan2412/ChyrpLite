from __future__ import annotations
import secrets, time
from typing import Dict, Tuple

_store: Dict[str, Tuple[int,int,float]] = {}
TTL = 300

def new_challenge() -> dict:
    a = secrets.randbelow(9) + 1
    b = secrets.randbelow(9) + 1
    answer = a + b
    cid = secrets.token_hex(8)
    _store[cid] = (answer, 0, time.time())
    return {"id": cid, "question": f"What is {a}+{b}?"}

def verify_challenge(cid: str, answer: int) -> bool:
    rec = _store.get(cid)
    if not rec:
        return False
    correct, used, ts = rec
    if time.time() - ts > TTL:
        _store.pop(cid, None)
        return False
    if used:
        return False
    if correct == answer:
        _store[cid] = (correct, 1, ts)
        return True
    return False