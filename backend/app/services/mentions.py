from __future__ import annotations
import re
from typing import List

MENTION_RE = re.compile(r'@([A-Za-z0-9_]{2,32})')

def extract_mentions(text: str | None) -> List[str]:
    if not text:
        return []
    return list({m.lower() for m in MENTION_RE.findall(text)})