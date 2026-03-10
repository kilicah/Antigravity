
import re
import os
import sys
import json
from datetime import datetime

def parse_whatsapp_chat(file_path):
    # Regex patterns for different WhatsApp export formats
    patterns = [
        # [DD.MM.YYYY HH:mm:ss] Name: Message
        r'^\[(?P<date>\d{1,2}[\./]\d{1,2}[\./]\d{2,4}),?\s+(?P<time>\d{1,2}:\d{2}(?::\d{2})?)\]\s+(?P<sender>[^:]+):\s+(?P<message>.*)$',
        # DD/MM/YYYY, HH:mm - Name: Message
        r'^(?P<date>\d{1,2}[\./]\d{1,2}[\./]\d{2,4}),?\s+(?P<time>\d{1,2}:\d{2}(?::\d{2})?)\s+-\s+(?P<sender>[^:]+):\s+(?P<message>.*)$',
        # DD.MM.YYYY HH:mm - Name: Message
        r'^(?P<date>\d{1,2}[\./]\d{1,2}[\./]\d{2,4})\s+(?P<time>\d{1,2}:\d{2}(?::\d{2})?)\s+-\s+(?P<sender>[^:]+):\s+(?P<message>.*)$',
    ]

    messages = []
    current_message = None

    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return None

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            matched = False
            for pattern in patterns:
                match = re.match(pattern, line)
                if match:
                    if current_message:
                        messages.append(current_message)
                    
                    current_message = {
                        'date': match.group('date'),
                        'time': match.group('time'),
                        'sender': match.group('sender').strip(),
                        'message': match.group('message')
                    }
                    matched = True
                    break
            
            if not matched and current_message:
                # This could be a multi-line message
                current_message['message'] += " " + line
            elif not matched and not current_message:
                # System messages or start of file that doesn't match
                pass

        if current_message:
            messages.append(current_message)

    return messages

def generate_report(messages, output_file):
    if not messages:
        return

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# WhatsApp Chat Analysis Report\n\n")
        f.write(f"Processed on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        # Summary Section
        senders = set(m['sender'] for m in messages)
        f.write(f"## Summary\n")
        f.write(f"- **Participants:** {', '.join(senders)}\n")
        f.write(f"- **Total Messages:** {len(messages)}\n\n")

        # To-Do Extraction (Rough heuristic: Look for keywords)
        todo_keywords = ['yap', 'edilecek', 'yapalım', 'deadline', 'tarih', 'lazım', 'görev', 'not al']
        todos = [m for m in messages if any(key in m['message'].lower() for key in todo_keywords)]

        if todos:
            f.write("## Potential Action Items / To-Dos\n")
            for todo in todos:
                f.write(f"- [ ] **{todo['sender']}**: {todo['message']} *({todo['date']} {todo['time']})*\n")
            f.write("\n")

        # Timeline
        f.write("## Recent Conversation Timeline\n")
        for m in messages[-20:]: # Last 20 messages
            f.write(f"**[{m['date']} {m['time']}] {m['sender']}:** {m['message']}\n\n")

    print(f"Report generated: {output_file}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Analyze WhatsApp exported chat.')
    parser.add_argument('--file', help='Path to the exported .txt file')
    args = parser.parse_args()

    if args.file:
        msgs = parse_whatsapp_chat(args.file)
        if msgs:
            report_name = f"report_{os.path.basename(args.file).replace('.txt', '')}.md"
            output_path = os.path.join(os.path.dirname(args.file), '..', 'reports', report_name)
            generate_report(msgs, output_path)
    else:
        # Default behavior: check exports folder
        export_dir = 'c:/X/Antigravity/Whatsapp/exports'
        files = [f for f in os.listdir(export_dir) if f.endswith('.txt')]
        for f in files:
            path = os.path.join(export_dir, f)
            msgs = parse_whatsapp_chat(path)
            if msgs:
                report_name = f"report_{f.replace('.txt', '')}.md"
                output_path = os.path.join(export_dir, '..', 'reports', report_name)
                generate_report(msgs, output_path)
