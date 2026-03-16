"""
General helper functions.
"""
import json
import logging

def load_json(filepath: str) -> dict:
    """
    Loads JSON data from a given filepath.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Error loading JSON from {filepath}: {e}")
        return []

def save_json(data: dict, filepath: str) -> bool:
    """
    Saves dictionary to a JSON file.
    """
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        logging.error(f"Error saving JSON to {filepath}: {e}")
        return False
