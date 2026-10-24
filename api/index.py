"""Vercel serverless entry point: serves the FastAPI app from main.py under /api."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: E402,F401
