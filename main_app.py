import multiprocessing
import uvicorn
import sys
import os
import webbrowser
from threading import Timer

# PyInstaller freeze support for multiprocessing
multiprocessing.freeze_support()

# Define paths
if getattr(sys, 'frozen', False):
    # Run from PyInstaller
    BASE_DIR = sys._MEIPASS
    DATA_DIR = os.path.dirname(sys.executable)
else:
    # Run from script
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = BASE_DIR

# Set environment variables for the database to use
os.environ["APP_DATA_DIR"] = DATA_DIR
os.environ["APP_BASE_DIR"] = BASE_DIR

# Add the backend directory to sys.path so app module can be imported
backend_dir = os.path.join(BASE_DIR, "backend")
sys.path.insert(0, backend_dir)

# Now we can import the FastAPI app safely
from app.main import app

def open_browser():
    webbrowser.open_new('http://127.0.0.1:8000')

if __name__ == '__main__':
    # Start a timer to open the browser shortly after the server starts
    Timer(1.5, open_browser).start()
    
    # Run the Uvicorn server programmatically
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
