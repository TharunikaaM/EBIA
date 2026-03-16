import os

filepath = r'd:\Final Year Project\ebia\backend\data\sample_documents.json'

print(f"Checking file: {filepath}")
if not os.path.exists(filepath):
    print("File does not exist!")
else:
    with open(filepath, 'rb') as f:
        head = f.read(10)
        print(f"File head (hex): {head.hex()}")
        print(f"File head (raw): {head}")

    for enc in ['utf-8', 'utf-16', 'utf-16-le', 'utf-16-be', 'utf-8-sig', 'latin-1']:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                content = f.read(50)
                print(f"Success with {enc}: {content[:20]}...")
        except Exception as e:
            print(f"Failed with {enc}: {e}")
