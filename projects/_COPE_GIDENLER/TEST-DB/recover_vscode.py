import os
import json
import shutil
import glob
from datetime import datetime

history_dir = os.path.expandvars(r"%APPDATA%\Code\User\History")
recovery_dir = os.path.join(os.getcwd(), "RECOVERED_FILES")
os.makedirs(recovery_dir, exist_ok=True)

targets = [
    "OrderEntryForm.tsx",
    "OrderEntryForm_Backup.tsx",
    "OrderEntryForm_Backup_utf8.tsx",
    "SalesContractDocument.tsx",
    "Step2Items.tsx",
    "Step3Terms.tsx"
]

print(f"Searching VS Code history in: {history_dir}")

for root, _, files in os.walk(history_dir):
    if "entries.json" in files:
        entries_file = os.path.join(root, "entries.json")
        try:
            with open(entries_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            resource = data.get("resource", "")
            
            for target in targets:
                if target in resource:
                    print(f"\nFound history for: {resource}")
                    entries = data.get("entries", [])
                    if not entries:
                        continue
                        
                    # Sort entries by timestamp descending
                    entries.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
                    
                    # Take the 3 most recent entries
                    for i, entry in enumerate(entries[:3]):
                        entry_id = entry.get("id", "")
                        source_path = os.path.join(root, entry_id)
                        
                        if os.path.exists(source_path):
                            timestamp_ms = entry.get("timestamp", 0)
                            dt = datetime.fromtimestamp(timestamp_ms / 1000.0)
                            time_str = dt.strftime("%Y-%m-%d_%H-%M-%S")
                            
                            dest_filename = f"{target}_{time_str}.tsx"
                            dest_path = os.path.join(recovery_dir, dest_filename)
                            
                            shutil.copy2(source_path, dest_path)
                            print(f"  -> Recovered: {dest_filename} (Size: {os.path.getsize(dest_path)} bytes)")
        except Exception as e:
            pass

print(f"\nDone. Check the {recovery_dir} folder.")
