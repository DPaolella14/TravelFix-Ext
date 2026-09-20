#!/usr/bin/env python3
"""
TravelFix Local Development Server
Serves the TravelFix web application on http://localhost:8080.
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print("============================================================")
                print(f"[TravelFix Server] Active at: http://localhost:{port}")
                print(f"[TravelFix Server] Serving directory: {DIRECTORY}")
                print("Press Ctrl+C to stop the server.")
                print("============================================================")
                if "--open" in sys.argv:
                    webbrowser.open(f"http://localhost:{port}")
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e) or e.errno == 10048:
                port += 1
            else:
                raise e

if __name__ == "__main__":
    run_server()
