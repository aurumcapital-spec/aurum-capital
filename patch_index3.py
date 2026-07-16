import pathlib

path = pathlib.Path('server/index.js')
content = path.read_text(encoding='utf-8')

require_line = 'const chatbotRoute = require("./routes/chatbot");'
mount_line = 'app.use("/api/chatbot", chatbotRoute);'
anchor = 'app.use("/api", require("./routes/setup"));'

if require_line in content:
    print('Already patched, nothing to do')
elif anchor not in content:
    print('ERROR: anchor not found')
else:
    new_block = anchor + '\n' + require_line + '\n' + mount_line
    content = content.replace(anchor, new_block, 1)
    path.write_text(content, encoding='utf-8')
    print('Done: patched successfully')
