import pathlib

pages = ['landing.html', 'login.html', 'register.html']
tag = '<script src="/chat-widget.js"></script>'

for page in pages:
    path = pathlib.Path('server/public/' + page)
    content = path.read_text(encoding='utf-8')
    if tag in content:
        print('Already patched: ' + page)
        continue
    content = content.replace('</body>', tag + '\n</body>')
    path.write_text(content, encoding='utf-8')
    print('Patched: ' + page)

print('Done')
