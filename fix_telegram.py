import pathlib

files = [
    'server/routes/chatbot.js',
    'server/public/chat-widget.js',
    'server/public/dashboard.html',
    'server/utils/email.js',
    'server/public/landing.html',
    'server/public/admin-login.html',
]

old = 'https://t.me/nexvaultsupport'
new = 'https://t.me/nextvaultsupport'

for f in files:
    path = pathlib.Path(f)
    if not path.exists():
        print(f'Skipped (not found): {f}')
        continue
    content = path.read_text(encoding='utf-8')
    if old in content:
        content = content.replace(old, new)
        path.write_text(content, encoding='utf-8')
        print(f'Fixed: {f}')
    else:
        print(f'Already correct: {f}')
