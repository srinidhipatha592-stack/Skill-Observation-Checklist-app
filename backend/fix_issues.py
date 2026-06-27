import os

backend_dir = r"c:\Users\Shanmukh\OneDrive\Desktop\Skill Observation Checklist App (2)\Skill Observation Checklist App\backend"

for root, _, files in os.walk(backend_dir):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            original = content

            if "datetime.now(timezone.utc)" in content:
                content = content.replace("default=lambda: datetime.now(timezone.utc)", "default=lambda: datetime.now(timezone.utc)")
                content = content.replace("datetime.now(timezone.utc)", "datetime.now(timezone.utc)")

            # Add timezone import if needed
            if "timezone.utc" in content:
                lines = content.split('\n')
                new_lines = []
                for line in lines:
                    if line.startswith("from datetime import") and "timezone" not in line:
                        line = line.replace("from datetime import datetime", "from datetime import datetime, timezone")
                    new_lines.append(line)
                content = '\n'.join(new_lines)

            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
