#!/usr/bin/env python3
"""Fix legal i18n keys properly."""

FILE = "/home/z/my-project/src/lib/i18n.ts"

with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Remove the duplicate EN block at lines ~360-361 (in DE section)
# And add proper datenschutz/agb body keys for all 4 languages

# Strategy: find each "footer.agb" line and insert the full legal block after it

legal_blocks = {
    # After EN "footer.agb": "AGB",
    '"footer.agb": "AGB",': [
        '    "legal.back": "Back to home",\n',
        '    "legal.impressum.body": "SRC \\u2014 Security & Resilience Counsel\\nBerne, Switzerland\\n\\nContact: info@src.guide\\n\\nThe content on this website is provided for general information purposes only. While we make every effort to ensure accuracy, SRC makes no warranties regarding completeness or reliability of the information. Liability for any damages arising from the use of this website is excluded to the extent permitted by law.",\n',
        '    "legal.datenschutz.body": "SRC protects your privacy. Personal data is only collected to the extent necessary for the provision of our services and is not passed on to third parties without your consent. For more information, please contact us at info@src.guide.",\n',
        '    "legal.agb.body": "The use of this website is governed by Swiss law. All content, including analyses and publications, is protected by copyright. Reproduction or distribution without prior written consent is prohibited.",\n',
    ],
    # After DE "footer.agb": "AGB", (second occurrence)
    '"footer.agb": "AGB",_DE': [
        '    "legal.back": "Zur\\u00fcck zur Startseite",\n',
        '    "legal.impressum.body": "SRC \\u2014 Security & Resilience Counsel\\nBern, Schweiz\\n\\nKontakt: info@src.guide\\n\\nDie Inhalte dieser Website dienen nur der allgemeinen Information. Obwohl wir uns um Genauigkeit bem\\u00fchen, \\u00fcbernimmt SRC keine Gew\\u00e4hr f\\u00fcr die Vollst\\u00e4ndigkeit oder Zuverl\\u00e4ssigkeit der Informationen. Eine Haftung f\\u00fcr Sch\\u00e4den, die aus der Nutzung dieser Website entstehen, ist soweit gesetzlich zul\\u00e4ssig ausgeschlossen.",\n',
        '    "legal.datenschutz.body": "SRC sch\\u00fctzt Ihre Privatsph\\u00e4re. Personendaten werden nur insoweit erhoben, als dies f\\u00fcr die Erbringung unserer Leistungen erforderlich ist, und ohne Ihre Zustimmung nicht an Dritte weitergegeben. F\\u00fcr weitere Informationen kontaktieren Sie uns unter info@src.guide.",\n',
        '    "legal.agb.body": "Die Nutzung dieser Website unterliegt Schweizer Recht. Alle Inhalte, einschliesslich Analysen und Publikationen, sind urheberrechtlich gesch\\u00fctzt. Vervielf\\u00e4ltigung oder Verbreitung ohne vorherige schriftliche Zustimmung ist untersagt.",\n',
    ],
    # After FR "footer.agb": "CGV",
    '"footer.agb": "CGV",': [
        '    "legal.back": "Retour \\u00e0 l\'accueil",\n',
        '    "legal.impressum.body": "SRC \\u2014 Security & Resilience Counsel\\nBerne, Suisse\\n\\nContact : info@src.guide\\n\\nLe contenu de ce site est fourni \\u00e0 titre informatif uniquement. Bien que nous nous efforcions d\'assurer l\'exactitude des informations, SRC ne garantit pas leur exhaustivit\\u00e9 ou leur fiabilit\\u00e9. La responsabilit\\u00e9 pour tout dommage r\\u00e9sultant de l\'utilisation de ce site est exclue dans la mesure permise par la loi.",\n',
        '    "legal.datenschutz.body": "SRC prot\\u00e8ge votre vie priv\\u00e9e. Les donn\\u00e9es personnelles ne sont collect\\u00e9es que dans la mesure n\\u00e9cessaire \\u00e0 la fourniture de nos services et ne sont pas transmises \\u00e0 des tiers sans votre consentement. Pour plus d\'informations, contactez-nous \\u00e0 info@src.guide.",\n',
        '    "legal.agb.body": "L\'utilisation de ce site est r\\u00e9gie par le droit suisse. Tout le contenu, y compris les analyses et les publications, est prot\\u00e9g\\u00e9 par le droit d\'auteur. La reproduction ou la distribution sans consentement pr\\u00e9alable \\u00e9crit est interdite.",\n',
    ],
    # After IT "footer.agb": "CGC",
    '"footer.agb": "CGC",': [
        '    "legal.back": "Torna alla homepage",\n',
        '    "legal.impressum.body": "SRC \\u2014 Security & Resilience Counsel\\nBerna, Svizzera\\n\\nContatto: info@src.guide\\n\\nI contenuti di questo sito sono forniti solo a scopo informativo. Sebbene ci impegniamo per garantire l\'accuratezza, SRC non fornisce garanzie circa la completezza o l\'affidabilit\\u00e0 delle informazioni. La responsabilit\\u00e0 per eventuali danni derivanti dall\'uso di questo sito \\u00e8 esclusa nella misura consentita dalla legge.",\n',
        '    "legal.datenschutz.body": "SRC protegge la vostra privacy. I dati personali vengono raccolti solo nella misura necessaria per la fornitura dei nostri servizi e non vengono ceduti a terzi senza il vostro consenso. Per ulteriori informazioni, contattateci all\'indirizzo info@src.guide.",\n',
        '    "legal.agb.body": "L\'utilizzo di questo sito \\u00e8 regolato dal diritto svizzero. Tutti i contenuti, incluse le analisi e le pubblicazioni, sono protetti dal diritto d\'autore. La riproduzione o la distribuzione senza previo consenso scritto \\u00e8 vietata.",\n',
    ],
}

# First, remove any existing legal.* keys and the duplicate EN block in DE section
cleaned = []
skip_next = 0
for i, line in enumerate(lines):
    if skip_next > 0:
        skip_next -= 1
        continue
    stripped = line.strip()
    # Remove all existing legal.* keys
    if stripped.startswith('"legal.'):
        continue
    cleaned.append(line)

lines = cleaned

# Now insert legal blocks at the right positions
# Find "footer.agb" lines and insert after them
agb_seen = {}  # track which occurrence
insertions = []  # (line_idx, block_lines)

for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == '"footer.agb": "AGB",':
        count = agb_seen.get("AGB", 0) + 1
        agb_seen["AGB"] = count
        if count == 1:
            insertions.append((i, legal_blocks['"footer.agb": "AGB",']))
        elif count == 2:
            insertions.append((i, legal_blocks['"footer.agb": "AGB",_DE']))
    elif stripped == '"footer.agb": "CGV",':
        insertions.append((i, legal_blocks['"footer.agb": "CGV",']))
    elif stripped == '"footer.agb": "CGC",':
        insertions.append((i, legal_blocks['"footer.agb": "CGC",']))

# Apply insertions from bottom to top
insertions.sort(key=lambda x: x[0], reverse=True)
for idx, block in insertions:
    for j, bl in enumerate(block):
        lines.insert(idx + 1 + j, bl)

with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Done - legal i18n keys properly inserted")