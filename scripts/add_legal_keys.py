#!/usr/bin/env python3
"""Add i18n keys for legal pages content + back link."""

FILE = "/home/z/my-project/src/lib/i18n.ts"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# We need to add keys after "footer.agb" in each language block
# The keys are in different positions for each language.

# EN block: after "footer.agb": "AGB",
en_after = '"footer.agb": "AGB",'
en_keys = '''    "footer.agb": "AGB",
    "legal.back": "Back to home",
    "legal.impressum.body": "SRC — Security & Resilience Counsel\\nBerne, Switzerland\\n\\nContact: info@src.guide\\n\\nThe content on this website is provided for general information purposes only. While we make every effort to ensure accuracy, SRC makes no warranties regarding completeness or reliability of the information. Liability for any damages arising from the use of this website is excluded to the extent permitted by law.",'''

de_after = '"footer.agb": "AGB",'  # appears at line ~355
de_keys = '''    "footer.agb": "AGB",
    "legal.back": "Zurück zur Startseite",
    "legal.impressum.body": "SRC — Security & Resilience Counsel\\nBern, Schweiz\\n\\nKontakt: info@src.guide\\n\\nDie Inhalte dieser Website dienen nur der allgemeinen Information. Obwohl wir uns um Genauigkeit bemühen, übernimmt SRC keine Gewähr für die Vollständigkeit oder Zuverlässigkeit der Informationen. Eine Haftung für Schäden, die aus der Nutzung dieser Website entstehen, ist soweit gesetzlich zulässig ausgeschlossen.",'''

fr_after = '"footer.agb": "CGV",'  # appears at line ~594
fr_keys = '''    "footer.agb": "CGV",
    "legal.back": "Retour à l\\'accueil",
    "legal.impressum.body": "SRC — Security & Resilience Counsel\\nBerne, Suisse\\n\\nContact : info@src.guide\\n\\nLe contenu de ce site est fourni à titre informatif uniquement. Bien que nous nous efforcions d\\'assurer l\\'exactitude des informations, SRC ne garantit pas leur exhaustivité ou leur fiabilité. La responsabilité pour tout dommage résultant de l\\'utilisation de ce site est exclue dans la mesure permise par la loi.",'''

it_after = '"footer.agb": "CGC",'  # appears at line ~833
it_keys = '''    "footer.agb": "CGC",
    "legal.back": "Torna alla homepage",
    "legal.impressum.body": "SRC — Security & Resilience Counsel\\nBerna, Svizzera\\n\\nContatto: info@src.guide\\n\\nI contenuti di questo sito sono forniti solo a scopo informativo. Sebbene ci impegniamo per garantire l\\'accuratezza, SRC non fornisce garanzie circa la completezza o l\\'affidabilità delle informazioni. La responsabilità per eventuali danni derivanti dall\\'uso di questo sito è esclusa nella misura consentita dalla legge.",'''

# Replace each occurrence — need to be careful about order (longest first) and uniqueness
# Since "footer.agb": "AGB" appears twice (EN and DE), we need positional replacement

# Find positions of each marker
lines = content.split('\n')
results = []
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == en_after and 'legal.back' not in content[:content.find(stripped) + 500]:
        results.append((i, 'en', en_keys.split('\n')))
    elif stripped == fr_after and 'legal.back' not in content[content.find(stripped):content.find(stripped)+500]:
        results.append((i, 'fr', fr_keys.split('\n')))
    elif stripped == it_after and 'legal.back' not in content[content.find(stripped):content.find(stripped)+500]:
        results.append((i, 'it', it_keys.split('\n')))

# Process from bottom to top to preserve line numbers
results.sort(key=lambda x: x[0], reverse=True)

for line_idx, lang, new_lines in results:
    # Replace the original line with the new multi-line content
    lines[line_idx:line_idx+1] = new_lines

# Handle DE — find the second occurrence of "footer.agb": "AGB" that doesn't have legal.back after it
de_count = 0
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == '"footer.agb": "AGB",':
        de_count += 1
        if de_count == 2:  # Second occurrence is DE
            de_insert = de_keys.split('\n')
            lines[i:i+1] = de_insert
            break

with open(FILE, "w", encoding="utf-8") as f:
    f.write('\n'.join(lines))

print("Done - added legal page i18n keys")