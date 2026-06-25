#!/usr/bin/env python3
"""Add new membership i18n keys for the enhanced membership page."""

import re

I18N_PATH = "/home/z/my-project/src/lib/i18n.ts"

NEW_KEYS = {
    "en": {
        "membership.toggle.monthly": "Monthly",
        "membership.toggle.annual": "Annual",
        "membership.toggle.save": "Save 20%",
        "membership.compare.feature": "Feature",
        "membership.badge.institutional": "Institutional",
        "membership.testimonial.tag": "Trusted by Professionals",
        "membership.testimonial.title": "What Our Members Say",
        "membership.testimonial.t1.quote": "The early-access briefings have given our crisis team a critical 24-hour head start on emerging geopolitical risks. SRC's analysis is consistently ahead of mainstream coverage.",
        "membership.testimonial.t1.role": "Head of Security Strategy",
        "membership.testimonial.t1.org": "Multinational Corporation, Zurich",
        "membership.testimonial.t2.quote": "As a government agency, we require rigorous, non-partisan analysis. The bespoke briefings and direct expert access have become an essential input to our strategic planning cycles.",
        "membership.testimonial.t2.role": "Director of Strategic Analysis",
        "membership.testimonial.t2.org": "European Government Agency",
        "membership.testimonial.t3.quote": "The weekly reports and video sections provide exactly the depth our team needs. The structured format saves us hours of open-source research every week.",
        "membership.testimonial.t3.role": "Intelligence Analyst",
        "membership.testimonial.t3.org": "Private Security Firm, Geneva",
        "membership.enterprise.tag": "For Institutions",
        "membership.enterprise.title": "Enterprise & Government Membership",
        "membership.enterprise.desc": "Tailored intelligence solutions for organisations that operate at scale. Custom briefings, multi-seat access, dedicated account management, and content aligned to your strategic priorities.",
        "membership.enterprise.cta": "Request Institutional Briefing",
        "membership.enterprise.f1": "Multi-seat licences with role-based access control",
        "membership.enterprise.f2": "Dedicated relationship manager and priority support",
        "membership.enterprise.f3": "Custom intelligence briefings aligned to your sector",
        "membership.enterprise.f4": "Corporate invoicing with VAT and flexible payment terms",
        "membership.enterprise.f5": "Exclusive live briefings and quarterly expert panels",
        "membership.enterprise.f6": "Annual risk assessment tailored to your organisation",
    },
    "de": {
        "membership.toggle.monthly": "Monatlich",
        "membership.toggle.annual": "Jährlich",
        "membership.toggle.save": "20% sparen",
        "membership.compare.feature": "Funktion",
        "membership.badge.institutional": "Institutionell",
        "membership.testimonial.tag": "Vertraut von Fachleuten",
        "membership.testimonial.title": "Was unsere Mitglieder sagen",
        "membership.testimonial.t1.quote": "Die Early-Access-Briefings haben unserem Krisenteam einen entscheidenden 24-Stunden-Vorsprung bei aufkommenden geopolitischen Risiken verschafft. Die Analysen von SRC sind stets einen Schritt voraus.",
        "membership.testimonial.t1.role": "Leiter Sicherheitsstrategie",
        "membership.testimonial.t1.org": "Multinationales Unternehmen, Zürich",
        "membership.testimonial.t2.quote": "Als Regierungsbehörde benötigen wir rigorose, unparteiische Analysen. Die maßgeschneiderten Briefings und der direkte Expertenzugang sind ein wesentlicher Bestandteil unserer strategischen Planung geworden.",
        "membership.testimonial.t2.role": "Direktor Strategische Analyse",
        "membership.testimonial.t2.org": "Europäische Regierungsbehörde",
        "membership.testimonial.t3.quote": "Die wöchentlichen Berichte und Video-Sektionen bieten genau die Tiefe, die unser Team benötigt. Das strukturierte Format spart uns jede Woche Stunden an Open-Source-Recherche.",
        "membership.testimonial.t3.role": "Intelligence-Analyst",
        "membership.testimonial.t3.org": "Privates Sicherheitsunternehmen, Genf",
        "membership.enterprise.tag": "Für Institutionen",
        "membership.enterprise.title": "Enterprise- & Regierungsmitgliedschaft",
        "membership.enterprise.desc": "Massgeschneiderte Intelligence-Lösungen für Organisationen, die in grossem Massstab operieren. Individuelle Briefings, Mehrplatzlizenzen, dediziertes Kundenmanagement und auf Ihre strategischen Prioritäten abgestimmte Inhalte.",
        "membership.enterprise.cta": "Institutionelles Briefing anfragen",
        "membership.enterprise.f1": "Mehrfachlizenzen mit rollenbasierter Zugriffskontrolle",
        "membership.enterprise.f2": "Dedizierter Kundenmanager und Prioritäts-Support",
        "membership.enterprise.f3": "Massgeschneiderte Intelligence-Briefings für Ihren Sektor",
        "membership.enterprise.f4": "Unternehmensabrechnung mit MwSt. und flexiblen Zahlungsbedingungen",
        "membership.enterprise.f5": "Exklusive Live-Briefings und vierteljährliche Experten-Panels",
        "membership.enterprise.f6": "Jährliche Risikoanalyse massgeschneidert auf Ihre Organisation",
    },
    "fr": {
        "membership.toggle.monthly": "Mensuel",
        "membership.toggle.annual": "Annuel",
        "membership.toggle.save": "Économisez 20%",
        "membership.compare.feature": "Fonctionnalité",
        "membership.badge.institutional": "Institutionnel",
        "membership.testimonial.tag": "La confiance des professionnels",
        "membership.testimonial.title": "Ce que disent nos membres",
        "membership.testimonial.t1.quote": "Les briefings en accès anticipé ont donné à notre équipe de crise une avance critique de 24 heures sur les risques géopolitiques émergents. L'analyse de SRC est systématiquement en avance sur la couverture médiatique.",
        "membership.testimonial.t1.role": "Responsable de la stratégie de sécurité",
        "membership.testimonial.t1.org": "Société multinationale, Zurich",
        "membership.testimonial.t2.quote": "En tant qu'agence gouvernementale, nous exigeons des analyses rigoureuses et indépendantes. Les briefings sur mesure et l'accès direct aux experts sont devenus un apport essentiel à nos cycles de planification stratégique.",
        "membership.testimonial.t2.role": "Directeur de l'analyse stratégique",
        "membership.testimonial.t2.org": "Agence gouvernementale européenne",
        "membership.testimonial.t3.quote": "Les rapports hebdomadaires et les sections vidéo offrent exactement la profondeur dont notre équipe a besoin. Le format structuré nous fait gagner des heures de recherche en sources ouvertes chaque semaine.",
        "membership.testimonial.t3.role": "Analyste en renseignement",
        "membership.testimonial.t3.org": "Société de sécurité privée, Genève",
        "membership.enterprise.tag": "Pour les institutions",
        "membership.enterprise.title": "Adhésion Entreprise & Gouvernement",
        "membership.enterprise.desc": "Solutions de renseignement sur mesure pour les organisations opérant à grande échelle. Briefings personnalisés, accès multi-utilisateurs, gestion de compte dédiée et contenus alignés sur vos priorités stratégiques.",
        "membership.enterprise.cta": "Demander un briefing institutionnel",
        "membership.enterprise.f1": "Licences multi-utilisateurs avec contrôle d'accès par rôle",
        "membership.enterprise.f2": "Gestionnaire de compte dédié et support prioritaire",
        "membership.enterprise.f3": "Briefings de renseignement personnalisés pour votre secteur",
        "membership.enterprise.f4": "Facturation d'entreprise avec TVA et conditions de paiement flexibles",
        "membership.enterprise.f5": "Briefings en direct exclusifs et panels d'experts trimestriels",
        "membership.enterprise.f6": "Evaluation annuelle des risques adaptée à votre organisation",
    },
    "it": {
        "membership.toggle.monthly": "Mensile",
        "membership.toggle.annual": "Annuale",
        "membership.toggle.save": "Risparmia il 20%",
        "membership.compare.feature": "Funzionalità",
        "membership.badge.institutional": "Istituzionale",
        "membership.testimonial.tag": "La fiducia dei professionisti",
        "membership.testimonial.title": "Cosa dicono i nostri membri",
        "membership.testimonial.t1.quote": "I briefing in accesso anticipato hanno dato al nostro team di crisi un vantaggio critico di 24 ore sui rischi geopolitici emergenti. L'analisi di SRC è costantemente un passo avanti rispetto alla copertura mainstream.",
        "membership.testimonial.t1.role": "Responsabile della strategia di sicurezza",
        "membership.testimonial.t1.org": "Società multinazionale, Zurigo",
        "membership.testimonial.t2.quote": "Come agenzia governativa, richiediamo analisi rigorose e imparziali. I briefing su misura e l'accesso diretto agli esperti sono diventati un contributo essenziale ai nostri cicli di pianificazione strategica.",
        "membership.testimonial.t2.role": "Direttore dell'analisi strategica",
        "membership.testimonial.t2.org": "Agenzia governativa europea",
        "membership.testimonial.t3.quote": "I rapporti settimanali e le sezioni video offrono esattamente la profondità di cui il nostro team ha bisogno. Il formato strutturato ci fa risparmiare ore di ricerca in fonti aperte ogni settimana.",
        "membership.testimonial.t3.role": "Analista di intelligence",
        "membership.testimonial.t3.org": "Società di sicurezza privata, Ginevra",
        "membership.enterprise.tag": "Per le istituzioni",
        "membership.enterprise.title": "Abbonamento Enterprise e Governo",
        "membership.enterprise.desc": "Soluzioni di intelligence su misura per organizzazioni che operano su larga scala. Briefing personalizzati, accesso multi-posto, account manager dedicato e contenuti allineati alle vostre priorità strategiche.",
        "membership.enterprise.cta": "Richiedi un briefing istituzionale",
        "membership.enterprise.f1": "Licenze multi-utente con controllo degli accessi basato sui ruoli",
        "membership.enterprise.f2": "Account manager dedicato e supporto prioritario",
        "membership.enterprise.f3": "Briefing di intelligence personalizzati per il vostro settore",
        "membership.enterprise.f4": "Fatturazione aziendale con IVA e termini di pagamento flessibili",
        "membership.enterprise.f5": "Briefing live esclusivi e panel di esperti trimestrali",
        "membership.enterprise.f6": "Valutazione annuale dei rischi personalizzata per la vostra organizzazione",
    },
}

with open(I18N_PATH, "r", encoding="utf-8") as f:
    content = f.read()

for lang, keys in NEW_KEYS.items():
    # Find the end of the last membership key for this language
    # We look for the pattern that closes the language object
    # The last key is "membership.truth.no": "—",
    # Find it within the correct language block
    
    # Find the language block start
    lang_pattern = f'  {lang}: {{'
    lang_start = content.find(lang_pattern)
    if lang_start == -1:
        print(f"ERROR: Could not find language block for '{lang}'")
        continue
    
    # Find "membership.truth.no" within this block (it's the last membership key)
    search_from = lang_start
    truth_no_pattern = '"membership.truth.no":'
    truth_no_pos = content.find(truth_no_pattern, search_from)
    if truth_no_pos == -1:
        print(f"ERROR: Could not find membership.truth.no for '{lang}'")
        continue
    
    # Find the end of this line (the comma after the value)
    line_end = content.find("\n", truth_no_pos)
    
    # Build the new keys string
    new_keys_str = ",\n"
    for key, value in keys.items():
        # Escape any double quotes in the value
        escaped_value = value.replace("\\", "\\\\").replace('"', '\\"')
        new_keys_str += f'    "{key}": "{escaped_value}",\n'
    
    # Insert the new keys after the truth.no line
    content = content[:line_end] + new_keys_str + content[line_end:]
    print(f"Added {len(keys)} keys for '{lang}'")

with open(I18N_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Done!")