import sys
import os

# Adds the root 'Antigravity' folder to PYTHONPATH so we can import from core
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from core.logger import get_logger

def main():
    logger = get_logger("example_project")
    print(f"Hello from the Antigravity Example Project!")
    print(f"This project is using the shared logger: {logger}")

if __name__ == "__main__":
    main()
