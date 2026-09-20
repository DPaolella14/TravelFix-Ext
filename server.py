#!/usr/bin/env python3
"""
TravelFix launcher.

Kept at the repo root so the familiar command still works:

    python server.py
    python server.py --open

The actual server lives in server/app.py. It serves the static site and the
sign-in API together on one port, which is why there is no separate backend
to start.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server'))

from app import run  # noqa: E402

if __name__ == '__main__':
    run()
