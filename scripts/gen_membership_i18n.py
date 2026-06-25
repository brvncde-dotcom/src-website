#!/usr/bin/env python3
"""Generate i18n keys for the membership page in all 4 languages."""

FILE = "/home/z/my-project/src/lib/i18n.ts"

# Read current file
with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# ═══ ENGLISH ═══
en_keys = '''
    "nav.membership": "Membership",
    "membership.hero.tag": "Membership",
    "membership.hero.title.1": "Access Intelligence",
    "membership.hero.title.2": "That Matters",
    "membership.hero.desc": "From free opinions to exclusive expert briefings \u2014 choose the level of insight that matches your role. Every tier is grounded in SRC\\u2019s rigorous, AI-augmented methodology.",
    "membership.tier.free": "Free",
    "membership.tier.basic": "Basic",
    "membership.tier.premium": "Premium",
    "membership.tier.expert": "Expert",
    "membership.badge.popular": "Most Popular",
    "membership.price.free": "Free",
    "membership.price.free.note": "No credit card required",
    "membership.price.basic": "CHF 49",
    "membership.price.basic.period": "/month",
    "membership.price.basic.annual": "CHF 490/year",
    "membership.price.basic.save": "Save 17%",
    "membership.price.premium": "CHF 149",
    "membership.price.premium.period": "/month",
    "membership.price.premium.annual": "CHF 1,490/year",
    "membership.price.premium.save": "Save 17%",
    "membership.price.expert": "CHF 349",
    "membership.price.expert.period": "/month",
    "membership.price.expert.annual": "CHF 3,490/year",
    "membership.price.expert.save": "Save 17%",
    "membership.tier.free.desc": "Stay informed with public opinions and event access. No registration needed for opinions.",
    "membership.tier.basic.desc": "Full access to analyses and statements. Ideal for professionals who need reliable baseline intelligence.",
    "membership.tier.premium.desc": "Exclusive briefings, early access, and breaking alerts. For decision-makers who need to stay ahead.",
    "membership.tier.expert.desc": "Direct expert interaction, live briefings, and custom topic requests. For those who shape strategy.",
    "membership.cta.free": "Start Reading",
    "membership.cta.basic": "Get Basic Access",
    "membership.cta.premium": "Get Premium Access",
    "membership.cta.expert": "Contact Us",
    "membership.cta.current": "Current Plan",
    "membership.group.content": "Content Access",
    "membership.group.events": "Events & Interaction",
    "membership.group.delivery": "Delivery & Alerts",
    "membership.group.support": "Support",
    "membership.feat.opinions": "Opinions & Commentary",
    "membership.feat.reports-summary": "Report Titles & Summaries",
    "membership.feat.reports-basic": "Analyses & Statements",
    "membership.feat.reports-strategy": "Strategy Papers & Studies",
    "membership.feat.video": "Video Sections (vAvatar)",
    "membership.feat.interviews": "Expert Interviews",
    "membership.feat.briefings": "Exclusive Intelligence Briefings",
    "membership.feat.early": "Early Access (24\\u201348h)",
    "membership.feat.breaking": "Breaking News Alerts",
    "membership.feat.archive": "Full Report Archive",
    "membership.feat.pdf": "PDF Downloads",
    "membership.feat.events-public": "Public Events",
    "membership.feat.events-priority": "Priority Event Registration",
    "membership.feat.events-briefing": "Quarterly Expert Panel Briefings",
    "membership.feat.events-live": "Live Video Briefings",
    "membership.feat.events-qa": "Monthly Expert Q&A Sessions",
    "membership.feat.events-1to1": "Annual 1:1 Strategy Briefing",
    "membership.feat.newsletter": "Weekly Newsletter",
    "membership.feat.section-news": "Section-Specific Newsletters",
    "membership.feat.push": "Real-Time Push Notifications",
    "membership.feat.risk": "Annual SRC Risk Assessment",
    "membership.feat.topic-request": "Request a Topic",
    "membership.feat.support-email": "Email Support",
    "membership.feat.support-manager": "Dedicated Relationship Manager",
    "membership.feat.support-invoice": "Corporate Invoicing & VAT",
    "membership.compare.title": "Compare Plans in Detail",
    "membership.compare.desc": "Every plan includes access to our public opinions. Higher tiers unlock progressively deeper intelligence, faster delivery, and direct expert access.",
    "membership.trust.title": "Why Thousands Trust SRC",
    "membership.trust.independent": "Non-partisan and independent \u2014 no political, commercial, or ideological agenda.",
    "membership.trust.swiss": "Headquartered in Zug, Switzerland. Operates under Swiss neutrality principles.",
    "membership.trust.methodology": "AI-augmented analysis validated by domain experts. Speed meets rigour.",
    "membership.truth.yes": "Included",
    "membership.truth.no": "\u2014",
'''

# ═══ GERMAN ═══
de_keys = '''
    "nav.membership": "Mitgliedschaft",
    "membership.hero.tag": "Mitgliedschaft",
    "membership.hero.title.1": "Zugang zu",
    "membership.hero.title.2": "relevanter Aufkl\u00e4rung",
    "membership.hero.desc": "Von kostenlosen Meinungen bis zu exklusiven Experten-Briefings \u2014 w\u00e4hlen Sie den Einblick, der zu Ihrer Rolle passt. Jede Stufe basiert auf SRCs rigoroser, KI-unterst\u00fctzter Methodik.",
    "membership.tier.free": "Kostenlos",
    "membership.tier.basic": "Basis",
    "membership.tier.premium": "Premium",
    "membership.tier.expert": "Experte",
    "membership.badge.popular": "Am Beliebtesten",
    "membership.price.free": "Kostenlos",
    "membership.price.free.note": "Keine Kreditkarte erforderlich",
    "membership.price.basic": "CHF 49",
    "membership.price.basic.period": "/Monat",
    "membership.price.basic.annual": "CHF 490/Jahr",
    "membership.price.basic.save": "17% sparen",
    "membership.price.premium": "CHF 149",
    "membership.price.premium.period": "/Monat",
    "membership.price.premium.annual": "CHF 1,490/Jahr",
    "membership.price.premium.save": "17% sparen",
    "membership.price.expert": "CHF 349",
    "membership.price.expert.period": "/Monat",
    "membership.price.expert.annual": "CHF 3,490/Jahr",
    "membership.price.expert.save": "17% sparen",
    "membership.tier.free.desc": "Bleiben Sie mit \u00f6ffentlichen Meinungen und Veranstaltungszugang informiert. Keine Registrierung f\u00fcr Meinungen erforderlich.",
    "membership.tier.basic.desc": "Voller Zugang zu Analysen und Stellungnahmen. Ideal f\u00fcr Fachleute, die zuverl\u00e4ssige Grundlagenaufkl\u00e4rung ben\u00f6tigen.",
    "membership.tier.premium.desc": "Exklusive Briefings, Fr\u00fchzugang und Breaking-News-Alerts. F\u00fcr Entscheidungstr\u00e4ger, die einen Schritt voraus sein m\u00fcssen.",
    "membership.tier.expert.desc": "Direkter Expertenkontakt, Live-Briefings und individuelle Themenanfragen. F\u00fcr diejenigen, die Strategie gestalten.",
    "membership.cta.free": "Jetzt Lesen",
    "membership.cta.basic": "Basis-Zugang Sichern",
    "membership.cta.premium": "Premium-Zugang Sichern",
    "membership.cta.expert": "Kontaktieren Sie Uns",
    "membership.cta.current": "Aktueller Plan",
    "membership.group.content": "Inhaltszugang",
    "membership.group.events": "Veranstaltungen & Interaktion",
    "membership.group.delivery": "Versand & Warnungen",
    "membership.group.support": "Unterst\u00fctzung",
    "membership.feat.opinions": "Meinungen & Kommentar",
    "membership.feat.reports-summary": "Berichtstitel & Zusammenfassungen",
    "membership.feat.reports-basic": "Analysen & Stellungnahmen",
    "membership.feat.reports-strategy": "Strategiepapiere & Studien",
    "membership.feat.video": "Video-Bereiche (vAvatar)",
    "membership.feat.interviews": "Experten-Interviews",
    "membership.feat.briefings": "Exklusive Intelligence-Briefings",
    "membership.feat.early": "Fr\u00fchzugang (24\u201348 Std.)",
    "membership.feat.breaking": "Breaking-News-Warnungen",
    "membership.feat.archive": "Vollst\u00e4ndiges Berichtsarchiv",
    "membership.feat.pdf": "PDF-Downloads",
    "membership.feat.events-public": "\u00d6ffentliche Veranstaltungen",
    "membership.feat.events-priority": "Priorit\u00e4tsanmeldung",
    "membership.feat.events-briefing": "Viertelj\u00e4hrliche Experten-Briefings",
    "membership.feat.events-live": "Live-Video-Briefings",
    "membership.feat.events-qa": "Monatliche Experten-Q&A",
    "membership.feat.events-1to1": "J\u00e4hrliches 1:1-Strategiegespr\u00e4ch",
    "membership.feat.newsletter": "Wochen-Newsletter",
    "membership.feat.section-news": "Bereichsspezifische Newsletter",
    "membership.feat.push": "Echtzeit-Push-Benachrichtigungen",
    "membership.feat.risk": "J\u00e4hrliche SRC-Risikobewertung",
    "membership.feat.topic-request": "Thema Anfragen",
    "membership.feat.support-email": "E-Mail-Support",
    "membership.feat.support-manager": "Dedizierter Kundenbetreuer",
    "membership.feat.support-invoice": "Unternehmensrechnung & MwSt.",
    "membership.compare.title": "Pl\u00e4ne im Detail Vergleichen",
    "membership.compare.desc": "Jeder Plan umfasst Zugang zu unseren \u00f6ffentlichen Meinungen. H\u00f6here Stufen schalten schrittweise tiefere Aufkl\u00e4rung, schnellere Lieferung und direkten Experten-Zugang frei.",
    "membership.trust.title": "Warum Tausende SRC Vertrauen",
    "membership.trust.independent": "Unparteiisch und unabh\u00e4ngig \u2014 keine politische, kommerzielle oder ideologische Agenda.",
    "membership.trust.swiss": "Hauptsitz in Zug, Schweiz. T\u00e4tigkeit nach Schweizer Neutralit\u00e4tsprinzipien.",
    "membership.trust.methodology": "KI-unterst\u00fctzte Analyse, validiert durch Fachexperten. Geschwindigkeit trifft auf Gr\u00fcndlichkeit.",
    "membership.truth.yes": "Inklusiv",
    "membership.truth.no": "\u2014",
'''

# ═══ FRENCH ═══
fr_keys = '''
    "nav.membership": "Adh\u00e9sion",
    "membership.hero.tag": "Adh\u00e9sion",
    "membership.hero.title.1": "Acc\u00e9dez \u00e0 l\\'Intelligence",
    "membership.hero.title.2": "Qui Compte",
    "membership.hero.desc": "Des opinions gratuites aux briefings exclusifs d\\'experts \u2014 choisissez le niveau d\\'analyse adapt\u00e9 \u00e0 votre r\u00f4le. Chaque formule repose sur la m\u00e9thodologie rigoureuse et augment\u00e9e par l\\'IA de SRC.",
    "membership.tier.free": "Gratuit",
    "membership.tier.basic": "Basique",
    "membership.tier.premium": "Premium",
    "membership.tier.expert": "Expert",
    "membership.badge.popular": "Le Plus Populaire",
    "membership.price.free": "Gratuit",
    "membership.price.free.note": "Aucune carte de cr\u00e9dit requise",
    "membership.price.basic": "CHF 49",
    "membership.price.basic.period": "/mois",
    "membership.price.basic.annual": "CHF 490/an",
    "membership.price.basic.save": "\u00c9conomisez 17%",
    "membership.price.premium": "CHF 149",
    "membership.price.premium.period": "/mois",
    "membership.price.premium.annual": "CHF 1,490/an",
    "membership.price.premium.save": "\u00c9conomisez 17%",
    "membership.price.expert": "CHF 349",
    "membership.price.expert.period": "/mois",
    "membership.price.expert.annual": "CHF 3,490/an",
    "membership.price.expert.save": "\u00c9conomisez 17%",
    "membership.tier.free.desc": "Restez inform\u00e9 avec les opinions publiques et l\\'acc\u00e8s aux \u00e9v\u00e9nements. Aucune inscription n\u00e9cessaire pour les opinions.",
    "membership.tier.basic.desc": "Acc\u00e8s complet aux analyses et prises de position. Id\u00e9al pour les professionnels needing des renseignements de base fiables.",
    "membership.tier.premium.desc": "Briefings exclusifs, acc\u00e8s anticip\u00e9 et alertes instantan\u00e9es. Pour les d\u00e9cideurs qui doivent rester en avance.",
    "membership.tier.expert.desc": "Interaction directe avec les experts, briefings en direct et demandes de sujets personnalis\u00e9es. Pour ceux qui fa\u00e7onnent la strat\u00e9gie.",
    "membership.cta.free": "Commencer \u00e0 Lire",
    "membership.cta.basic": "Acc\u00e9der au Basique",
    "membership.cta.premium": "Acc\u00e9der au Premium",
    "membership.cta.expert": "Nous Contacter",
    "membership.cta.current": "Plan Actuel",
    "membership.group.content": "Acc\u00e8s au Contenu",
    "membership.group.events": "\u00c9v\u00e9nements & Interaction",
    "membership.group.delivery": "Diffusion & Alertes",
    "membership.group.support": "Support",
    "membership.feat.opinions": "Opinions & Commentaires",
    "membership.feat.reports-summary": "Titres & R\u00e9sum\u00e9s de Rapports",
    "membership.feat.reports-basic": "Analyses & Prises de Position",
    "membership.feat.reports-strategy": "Documents Strat\u00e9giques & \u00c9tudes",
    "membership.feat.video": "Sections Vid\u00e9o (vAvatar)",
    "membership.feat.interviews": "Interviews d\\'Experts",
    "membership.feat.briefings": "Briefings de Renseignement Exclusifs",
    "membership.feat.early": "Acc\u00e8s Anticip\u00e9 (24\u201348h)",
    "membership.feat.breaking": "Alertes Flash",
    "membership.feat.archive": "Archives Compl\u00e8tes",
    "membership.feat.pdf": "T\u00e9l\u00e9chargements PDF",
    "membership.feat.events-public": "\u00c9v\u00e9nements Publics",
    "membership.feat.events-priority": "Inscription Prioritaire",
    "membership.feat.events-briefing": "Briefings Trimestriels du Panel",
    "membership.feat.events-live": "Briefings Vid\u00e9o en Direct",
    "membership.feat.events-qa": "Sessions Q&A Mensuelles",
    "membership.feat.events-1to1": "Briefing Strat\u00e9gique Annuel 1:1",
    "membership.feat.newsletter": "Newsletter Hebdomadaire",
    "membership.feat.section-news": "Newsletter par Domaine",
    "membership.feat.push": "Notifications Push en Temps R\u00e9el",
    "membership.feat.risk": "\u00c9valuation Annuelle des Risques SRC",
    "membership.feat.topic-request": "Demander un Sujet",
    "membership.feat.support-email": "Support par E-mail",
    "membership.feat.support-manager": "Gestionnaire D\u00e9di\u00e9",
    "membership.feat.support-invoice": "Facturation Entreprise & TVA",
    "membership.compare.title": "Comparer les Forfaits en D\u00e9tail",
    "membership.compare.desc": "Chaque formule inclut l\\'acc\u00e8s \u00e0 nos opinions publiques. Les formules sup\u00e9rieures d\u00e9bloquent progressivement une analyse plus approfondie, une diffusion plus rapide et un acc\u00e8s direct aux experts.",
    "membership.trust.title": "Pourquoi Des Milliers Fait Confiance \u00e0 SRC",
    "membership.trust.independent": "Non partisan et ind\u00e9pendant \u2014 sans agenda politique, commercial ou id\u00e9ologique.",
    "membership.trust.swiss": "Si\u00e8ge social \u00e0 Zoug, Suisse. Op\u00e8re selon les principes de neutralit\u00e9 suisse.",
    "membership.trust.methodology": "Analyse augment\u00e9e par l\\'IA valid\u00e9e par des experts. La rapidit\u00e9 rencontre la rigueur.",
    "membership.truth.yes": "Inclus",
    "membership.truth.no": "\u2014",
'''

# ═══ ITALIAN ═══
it_keys = '''
    "nav.membership": "Abbonamento",
    "membership.hero.tag": "Abbonamento",
    "membership.hero.title.1": "Accedi alle",
    "membership.hero.title.2": "Intelligence Che Conta",
    "membership.hero.desc": "Dalle opinioni gratuite ai briefing esclusivi degli esperti \u2014 scegli il livello di analisi adatto al tuo ruolo. Ogni livello \u00e8 fondato sulla metodologia rigorosa e potenziata dall\\'IA di SRC.",
    "membership.tier.free": "Gratuito",
    "membership.tier.basic": "Base",
    "membership.tier.premium": "Premium",
    "membership.tier.expert": "Esperto",
    "membership.badge.popular": "Il Pi\u00f9 Popolare",
    "membership.price.free": "Gratuito",
    "membership.price.free.note": "Nessuna carta di credito richiesta",
    "membership.price.basic": "CHF 49",
    "membership.price.basic.period": "/mese",
    "membership.price.basic.annual": "CHF 490/anno",
    "membership.price.basic.save": "Risparmia il 17%",
    "membership.price.premium": "CHF 149",
    "membership.price.premium.period": "/mese",
    "membership.price.premium.annual": "CHF 1,490/anno",
    "membership.price.premium.save": "Risparmia il 17%",
    "membership.price.expert": "CHF 349",
    "membership.price.expert.period": "/mese",
    "membership.price.expert.annual": "CHF 3,490/anno",
    "membership.price.expert.save": "Risparmia il 17%",
    "membership.tier.free.desc": "Resta informato con opinioni pubbliche e accesso agli eventi. Nessuna registrazione necessaria per le opinioni.",
    "membership.tier.basic.desc": "Accesso completo ad analisi e dichiarazioni. Ideale per i professionisti che necessitano di un\\'affidabile intelligence di base.",
    "membership.tier.premium.desc": "Briefing esclusivi, accesso anticipato e avvisi di breaking news. Per i decisori che devono restare avanti.",
    "membership.tier.expert.desc": "Interazione diretta con gli esperti, briefing dal vivo e richieste di argomenti personalizzate. Per chi definisce la strategia.",
    "membership.cta.free": "Inizia a Leggere",
    "membership.cta.basic": "Ottieni l\\'Accesso Base",
    "membership.cta.premium": "Ottieni l\\'Accesso Premium",
    "membership.cta.expert": "Contattaci",
    "membership.cta.current": "Piano Attuale",
    "membership.group.content": "Accesso ai Contenuti",
    "membership.group.events": "Eventi e Interazione",
    "membership.group.delivery": "Consegna e Avvisi",
    "membership.group.support": "Supporto",
    "membership.feat.opinions": "Opinioni e Commenti",
    "membership.feat.reports-summary": "Titoli e Riassunti dei Rapporti",
    "membership.feat.reports-basic": "Analisi e Dichiarazioni",
    "membership.feat.reports-strategy": "Documenti Strategici e Studi",
    "membership.feat.video": "Sezioni Video (vAvatar)",
    "membership.feat.interviews": "Interviste agli Esperti",
    "membership.feat.briefings": "Briefing di Intelligence Esclusivi",
    "membership.feat.early": "Accesso Anticipato (24\u201348h)",
    "membership.feat.breaking": "Avvisi di Ultime Notizie",
    "membership.feat.archive": "Archivio Completo dei Rapporti",
    "membership.feat.pdf": "Download PDF",
    "membership.feat.events-public": "Eventi Pubblici",
    "membership.feat.events-priority": "Registrazione Prioritaria",
    "membership.feat.events-briefing": "Briefing Trimestrali del Panel",
    "membership.feat.events-live": "Briefing Video in Diretta",
    "membership.feat.events-qa": "Sessioni Q&A Mensili con Esperti",
    "membership.feat.events-1to1": "Briefing Strategico Annuale 1:1",
    "membership.feat.newsletter": "Newsletter Settimanale",
    "membership.feat.section-news": "Newsletter per Area Tematica",
    "membership.feat.push": "Notifiche Push in Tempo Reale",
    "membership.feat.risk": "Valutazione Annuale dei Rischi SRC",
    "membership.feat.topic-request": "Richiedi un Argomento",
    "membership.feat.support-email": "Supporto via E-mail",
    "membership.feat.support-manager": "Referente Dedicato",
    "membership.feat.support-invoice": "Fatturazione Aziendale e IVA",
    "membership.compare.title": "Confronta i Piani in Dettaglio",
    "membership.compare.desc": "Ogni piano include l\\'accesso alle nostre opinioni pubbliche. I piani superiori sbloccano progressivamente un\\'analisi pi\u00f9 approfondita, una consegna pi\u00f9 rapida e l\\'accesso diretto agli esperti.",
    "membership.trust.title": "Perché Migliaia Si Fidano di SRC",
    "membership.trust.independent": "Non partigiano e indipendente \u2014 nessuna agenda politica, commerciale o ideologica.",
    "membership.trust.swiss": "Sede a Zugo, Svizzera. Opera secondo i principi di neutralit\u00e0 svizzera.",
    "membership.trust.methodology": "Analisi potenziata dall\\'IA validata da esperti di dominio. Velocit\u00e0 incontra rigore.",
    "membership.truth.yes": "Incluso",
    "membership.truth.no": "\u2014",
'''

# Insert keys into each language block
# Strategy: insert after "legal.agb.body" line in each language block
# We need to find the insertion points

lines = content.split('\n')

# Find all "legal.agb.body" lines and insert after each one
insertions = []
for i, line in enumerate(lines):
    if '"legal.agb.body"' in line and 'membership' not in content[max(0, content[:content.find(line, max(0, i-500))].rfind('\n')):]:  # rough check
        insertions.append(i)

# Actually, let me find all occurrences of the closing of legal.agb.body by looking for the next line after it
# Since there are 4 language blocks, there should be 4 occurrences
agb_body_lines = []
for i, line in enumerate(lines):
    if '"legal.agb.body"' in line:
        agb_body_lines.append(i)

print(f"Found {len(agb_body_lines)} legal.agb.body lines at positions: {agb_body_lines}")

# We have 4 language blocks. Insert membership keys after each one.
lang_blocks = [en_keys, de_keys, fr_keys, it_keys]

if len(agb_body_lines) == 4:
    for idx, pos in enumerate(reversed(agb_body_lines)):
        block_lines = lang_blocks[3 - idx].strip().split('\n')
        formatted = [line + ',\n' for line in block_lines]
        # Remove trailing comma from last line
        formatted[-1] = formatted[-1].replace(',\n', '\n')
        for j, fl in enumerate(reversed(formatted)):
            lines.insert(pos + 1 + j, fl)
else:
    print(f"ERROR: Expected 4 language blocks, found {len(agb_body_lines)}")
    # Fallback: insert at end of file before closing
    for block in reversed(lang_blocks):
        block_lines = block.strip().split('\n')
        formatted = [line + ',\n' for line in block_lines]
        for fl in reversed(formatted):
            lines.append(fl)

with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Done - membership i18n keys added")