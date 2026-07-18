import pathlib, re

path = pathlib.Path('server/public/landing.html')
content = path.read_text(encoding='utf-8')

# ── 1. Remove orphaned leftover divs ─────────────────────────────────────────
leftovers = [
    '\n          </div>\n        </div>\n        </div>\n      </div>\n    <div class="author-location">Accra, Ghana</div>\n          </div>\n        </div>',
]
for l in leftovers:
    if l in content:
        content = content.replace(l, '\n          </div>\n        </div>\n        </div>\n      </div>')
        print('Removed leftover')

# Simpler: just remove any standalone author-location with Accra, Ghana
content = re.sub(r'\s*<div class="author-location">Accra, Ghana</div>\s*(?=\s*</div>\s*</div>\s*(?!</div>))', '', content)
print('Cleaned orphaned location text')

# ── 2. Replace all dicebear avatar img tags with randomuser.me real photos ───
# Map seed names to real randomuser.me photo indices (consistent, always same person)
avatars = {
    'JamesKingsley':    'https://randomuser.me/api/portraits/men/32.jpg',
    'SofiaRamos':       'https://randomuser.me/api/portraits/women/44.jpg',
    'MarcusChidi':      'https://randomuser.me/api/portraits/men/75.jpg',
    'AishaKofi':        'https://randomuser.me/api/portraits/women/68.jpg',
    'DavidPark':        'https://randomuser.me/api/portraits/men/52.jpg',
    'CarlosMendez':     'https://randomuser.me/api/portraits/men/41.jpg',
    'MargaretOliver':   'https://randomuser.me/api/portraits/women/56.jpg',
    'OmarFarouq':       'https://randomuser.me/api/portraits/men/64.jpg',
    'PriyaSharma':      'https://randomuser.me/api/portraits/women/33.jpg',
}

for seed, photo_url in avatars.items():
    old_src = f'https://api.dicebear.com/7.x/personas/svg?seed={seed}&backgroundColor='
    # Find and replace the full img src (background color varies per avatar)
    pattern = rf'https://api\.dicebear\.com/7\.x/personas/svg\?seed={seed}&backgroundColor=[0-9a-f]+'
    content = re.sub(pattern, photo_url, content)
    print(f'Replaced avatar: {seed}')

# ── 3. Update img styles to look better with real photos ─────────────────────
# Make sure object-fit is set for real photos
content = content.replace(
    'style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0"',
    'style="border-radius:50%;border:2px solid rgba(245,158,11,0.3);flex-shrink:0;object-fit:cover;width:52px;height:52px"'
)
print('Updated img styles')

path.write_text(content, encoding='utf-8')
print('Done: landing.html updated with real faces')
