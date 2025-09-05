from __future__ import annotations
import os
from pathlib import Path
from typing import BinaryIO
from app.core.config import get_settings

settings = get_settings()
BASE = Path(settings.upload_dir)
BASE.mkdir(parents=True, exist_ok=True)

def save_file(filename: str, data: BinaryIO) -> str:
    target = BASE / filename
    with open(target, 'wb') as f:
        f.write(data.read())
    return str(target)
