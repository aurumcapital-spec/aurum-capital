import pathlib

path = pathlib.Path('server/index.js')
content = path.read_text(encoding='utf-8')

require_line = "const chatbotRoute = require('./routes/chatbot');"
mount_line = "app.use('/api/chatbot', chatbotRoute);"

if require_line not in content:
    content = content.replace(
        "app.use('/api', require('./routes/setup'));",
        "app.use('/api', require('./routes/setup'));\n" + require_line
    )
    print('Added require line')
else:
    print('Require line already exists')

if mount_line not in content:
    content = content.replace(
        "app.use('/api', require('./routes/setup'));",
        "app.use('/api', require('./routes/setup'));\n" + require_line + "\n" + mount_line
    )
    print('Added mount line')
else:
    print('Mount line already exists')

path.write_text(content, encoding='utf-8')
print('Done: index.js patched')
