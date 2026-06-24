#!/usr/bin/env python3
"""Add i18n keys for empty states: opinions, ticker, focus areas."""

FILE = "/home/z/my-project/src/lib/i18n.ts"

with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# We need to insert new keys after "opinions.read-full" in each language block
# EN: line 218, DE: line 455, FR: line 692, IT: line 929
# Also need to remove/replace ticker.1-8 with empty placeholder or keep them but make ticker conditional

new_keys = {
    "en": [
        '    "opinions.empty": "No opinions published yet.",\n',
        '    "opinions.empty.hint": "Opinions and commentary from SRC experts will appear here once published.",\n',
    ],
    "de": [
        '    "opinions.empty": "Noch keine Meinungen veröffentlicht.",\n',
        '    "opinions.empty.hint": "Meinungen und Kommentare von SRC-Experten erscheinen hier nach der Veröffentlichung.",\n',
    ],
    "fr": [
        '    "opinions.empty": "Aucune opinion publiée pour le moment.",\n',
        '    "opinions.empty.hint": "Les opinions et commentaires des experts SRC apparaîtront ici une fois publiés.",\n',
    ],
    "it": [
        '    "opinions.empty": "Nessuna opinione pubblicata ancora.",\n',
        '    "opinions.empty.hint": "Opinioni e commenti degli esperti SRC appariranno qui una volta pubblicati.",\n',
    ],
}

# Insert positions (0-indexed line numbers, after the "opinions.read-full" line)
# EN: line 218 (0-indexed: 217), DE: 454, FR: 691, IT: 928
insert_after = {
    "en": 218,  # after line 218 (1-indexed)
    "de": 455,
    "fr": 692,
    "it": 929,
}

# Build new lines
new_lines = []
for lang, idx in insert_after.items():
    new_lines.extend(new_keys[lang])
    # Also insert after the correct line number

# We need to insert at multiple positions, so process from bottom to top
positions = sorted(insert_after.items(), key=lambda x: x[1], reverse=True)

for lang, line_idx in positions:
    # line_idx is 1-indexed (the line with "opinions.read-full")
    # Insert AFTER that line
    insert_pos = line_idx  # 0-indexed position after that line
    for key_line in reversed(new_keys[lang]):
        lines.insert(insert_pos, key_line)

with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Done - added empty state keys for all 4 languages")