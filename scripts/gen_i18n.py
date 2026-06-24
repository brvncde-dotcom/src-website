#!/usr/bin/env python3
"""Generate complete i18n.ts with all translations for EN/DE/FR/IT."""

# ── EXISTING KEYS (already translated, kept as-is) ──────────────────────────
# We'll read them from the current file to preserve existing work.

import re, json

# Read existing file to extract current translations
with open("/home/z/my-project/src/lib/i18n.ts", "r") as f:
    existing = f.read()

# Extract the existing en block
en_match = re.search(r'  en: \{(.*?)\n  \},', existing, re.DOTALL)
de_match = re.search(r'  de: \{(.*?)\n  \},', existing, re.DOTALL)
fr_match = re.search(r'  fr: \{(.*?)\n  \},', existing, re.DOTALL)
it_match = re.search(r'  it: \{(.*?)\n  \},', existing, re.DOTALL)

def parse_block(block):
    """Parse a language block into a dict of key -> value."""
    d = {}
    for m in re.finditer(r'"([^"]+)":\s*"((?:[^"\\]|\\.)*)"', block):
        d[m.group(1)] = m.group(2)
    return d

en = parse_block(en_match.group(1)) if en_match else {}
de = parse_block(de_match.group(1)) if de_match else {}
fr = parse_block(fr_match.group(1)) if fr_match else {}
it = parse_block(it_match.group(1)) if it_match else {}

# ── NEW KEYS TO ADD ─────────────────────────────────────────────────────────

new_keys = {
    # === APPROACH VIEW ===
    "approach.hero.tag": {
        "en": "Methodology",
        "de": "Methodik",
        "fr": "Méthodologie",
        "it": "Metodologia",
    },
    "approach.hero.title.1": {
        "en": "AI-Augmented Analysis,",
        "de": "KI-gestützte Analyse,",
        "fr": "Analyse augmentée par l'IA,",
        "it": "Analisi potenziata dall'IA,",
    },
    "approach.hero.title.2": {
        "en": "Human-Validated Insight",
        "de": "Menschlich validierte Erkenntnisse",
        "fr": "Perspectives validées par des experts",
        "it": "Insight validati da esperti",
    },
    "approach.hero.desc": {
        "en": "SRC pioneered a research methodology that combines the speed of artificial intelligence with the judgment of domain experts. The result: timely, rigorous, and actionable analysis that no purely human or purely automated approach can achieve alone.",
        "de": "SRC hat eine Forschungsmethodik entwickelt, die die Geschwindigkeit der künstlichen Intelligenz mit dem Urteilsvermögen von Domain-Experten kombiniert. Das Ergebnis: zeitnahe, rigorose und handlungsorientierte Analysen, die kein rein menschlicher oder rein automatisierter Ansatz allein erreichen kann.",
        "fr": "SRC a développé une méthodologie de recherche qui combine la vitesse de l'intelligence artificielle avec le jugement des experts du domaine. Le résultat : des analyses opportunes, rigoureuses et actionnables qu'aucune approche purement humaine ou purement automatisée ne peut atteindre seule.",
        "it": "SRC ha sviluppato una metodologia di ricerca che combina la velocità dell'intelligenza artificiale con il giudizio degli esperti di settore. Il risultato: analisi tempestive, rigorose e operazionali che nessun approccio puramente umano o puramente automatizzato può raggiungere da solo.",
    },
    "approach.principles.tag": {
        "en": "Core Principles",
        "de": "Kernprinzipien",
        "fr": "Principes fondamentaux",
        "it": "Principi fondamentali",
    },
    "approach.principles.heading": {
        "en": "How We Work",
        "de": "Wie wir arbeiten",
        "fr": "Notre méthode",
        "it": "Come lavoriamo",
    },
    "approach.p1.title": {
        "en": "AI as Research Accelerator",
        "de": "KI als Forschungsbeschleuniger",
        "fr": "L'IA comme accélérateur de recherche",
        "it": "L'IA come acceleratore di ricerca",
    },
    "approach.p1.desc": {
        "en": "We deploy a powerful AI engine to rapidly synthesise information from thousands of open-source documents, academic publications, government reports, and news sources. This enables our experts to begin analysis from a foundation of comprehensive, structured research rather than starting from scratch. The AI identifies patterns, connections, and anomalies across datasets that would take human researchers weeks to compile manually.",
        "de": "Wir setzen einen leistungsstarken KI-Motor ein, um Informationen aus tausenden Open-Source-Dokumenten, akademischen Publikationen, Regierungsberichten und Nachrichtenquellen rasch zu synthetisieren. Dies ermöglicht es unseren Experten, ihre Analyse auf einer Grundlage umfassender, strukturierter Forschung aufzubauen — statt bei null zu beginnen. Die KI identifiziert Muster, Verbindungen und Anomalien in Datensätzen, die menschliche Forscher Wochenlang manuell zusammentragen würden.",
        "fr": "Nous déployons un moteur IA puissant pour synthétiser rapidement les informations provenant de milliers de documents open source, publications académiques, rapports gouvernementaux et sources d'actualités. Cela permet à nos experts de commencer leur analyse à partir d'une base de recherche complète et structurée plutôt que de partir de zéro. L'IA identifie des modèles, des connexions et des anomalies dans les jeux de données qui prendraient des semaines aux chercheurs humains.",
        "it": "Utilizziamo un potente motore IA per sintetizzare rapidamente informazioni da migliaia di documenti open source, pubblicazioni accademiche, rapporti governativi e fonti di notizie. Questo permette ai nostri esperti di iniziare l'analisi da una base di ricerca completa e strutturata anziché partire da zero. L'IA identifica modelli, connessioni e anomalie nei dataset che richiederebbero settimane ai ricercatori umani.",
    },
    "approach.p2.title": {
        "en": "Expert Validation at Every Stage",
        "de": "Expertenvalidierung in jeder Phase",
        "fr": "Validation experte à chaque étape",
        "it": "Validazione esperta in ogni fase",
    },
    "approach.p2.desc": {
        "en": "Every AI-produced draft undergoes rigorous review by domain specialists with deep knowledge of the specific subject area. Experts challenge assumptions, verify claims against primary sources, add contextual understanding that AI cannot replicate, and identify gaps or biases in the analysis. No publication leaves SRC without at least two independent expert reviews.",
        "de": "Jeder KI-erstellte Entwurf durchläuft eine rigorose Überprüfung durch Domänen-Spezialisten mit tiefem Wissen im jeweiligen Fachgebiet. Experten hinterfragen Annahmen, überprüfen Behauptungen anhand von Primärquellen, fügen kontextuelles Verständnis hinzu, das die KI nicht replizieren kann, und identifizieren Lücken oder Verzerrungen in der Analyse. Keine Publikation verlässt SRC ohne mindestens zwei unabhängige Expertenbewertungen.",
        "fr": "Chaque brouillon produit par l'IA fait l'objet d'un examen rigoureux par des spécialistes du domaine ayant une connaissance approfondie du sujet concerné. Les experts remettent en question les hypothèses, vérifient les affirmations auprès des sources primaires, ajoutent une compréhension contextuelle que l'IA ne peut pas reproduire et identifient les lacunes ou les biais de l'analyse. Aucune publication ne quitte SRC sans au moins deux examens d'experts indépendants.",
        "it": "Ogni bozza prodotta dall'IA viene sottoposta a una revisione rigorosa da parte di specialisti del dominio con conoscenza approfondita del settore specifico. Gli esperti mettono in discussione le assunzioni, verificano le affermazioni presso le fonti primarie, aggiungono una comprensione contestuale che l'IA non può replicare e identificano lacune o distorsioni nell'analisi. Nessuna pubblicazione esce da SRC senza almeno due revisioni esperte indipendenti.",
    },
    "approach.p3.title": {
        "en": "Non-Partisan Editorial Standards",
        "de": "Unparteiische redaktionelle Standards",
        "fr": "Standards éditoriaux non partisans",
        "it": "Standard editoriali non partigiani",
    },
    "approach.p3.desc": {
        "en": "Our editorial process ensures that every publication meets SRC's standards for factual accuracy, analytical rigour, and political neutrality. Editors review language for implicit bias, verify that conclusions are supported by evidence, and ensure that policy recommendations are balanced and actionable. We never publish analyses that serve any political party, commercial interest, or ideological agenda.",
        "de": "Unser redaktioneller Prozess stellt sicher, dass jede Publikation die Standards von SRC für faktische Genauigkeit, analytische Strenge und politische Neutralität erfüllt. Redakteure prüfen die Sprache auf implizite Voreingenommenheit, überprüfen, ob Schlussfolgerungen durch Beweise gestützt werden, und stellen sicher, dass politische Empfehlungen ausgewogen und umsetzbar sind. Wir veröffentlichen niemals Analysen, die einer politischen Partei, einem kommerziellen Interesse oder einer ideologischen Agenda dienen.",
        "fr": "Notre processus éditorial garantit que chaque publication respecte les normes de SRC en matière d'exactitude factuelle, de rigueur analytique et de neutralité politique. Les éditeurs examinent le langage pour détecter les biais implicites, vérifient que les conclusions sont étayées par des preuves et s'assurent que les recommandations politiques sont équilibrées et actionnables. Nous ne publions jamais d'analyses servant un parti politique, un intérêt commercial ou une agenda idéologique.",
        "it": "Il nostro processo editoriale garantisce che ogni pubblicazione soddisfi gli standard di SRC per accuratezza fattuale, rigore analitico e neutralità politica. I redattori esaminano il linguaggio per rilevare pregiudizi impliciti, verificano che le conclusioni siano supportate da evidenze e si assicurano che le raccomandazioni politiche siano equilibrate e operative. Non pubblichiamo mai analisi che servono un partito politico, un interesse commerciale o un'agenda ideologica.",
    },
    "approach.p4.title": {
        "en": "Human-AI Collaboration, Not Replacement",
        "de": "Mensch-KI-Zusammenarbeit, kein Ersatz",
        "fr": "Collaboration humain-IA, pas de remplacement",
        "it": "Collaborazione uomo-IA, non sostituzione",
    },
    "approach.p4.desc": {
        "en": "We view AI as a powerful tool that amplifies human expertise, not a replacement for it. Our methodology is designed to leverage the complementary strengths of both: AI provides speed, breadth, and pattern recognition; humans provide judgment, contextual understanding, ethical reasoning, and accountability. This partnership model allows SRC to produce analyses that are both timely and deeply informed.",
        "de": "Wir betrachten KI als ein leistungsstarkes Werkzeug, das menschliche Expertise verstärkt, nicht als deren Ersatz. Unsere Methodik ist darauf ausgelegt, die komplementären Stärken beider Seiten zu nutzen: KI bietet Geschwindigkeit, Breite und Mustererkennung; Menschen bieten Urteilsvermögen, kontextuelles Verständnis, ethisches Denken und Verantwortlichkeit. Dieses Partnerschaftsmodell ermöglicht es SRC, Analysen zu erstellen, die sowohl zeitnah als auch tief fundiert sind.",
        "fr": "Nous considérons l'IA comme un outil puissant qui amplifie l'expertise humaine, non comme un remplacement. Notre méthodologie est conçue pour tirer parti des forces complémentaires des deux : l'IA apporte la vitesse, l'étendue et la reconnaissance de motifs ; les humains apportent le jugement, la compréhension contextuelle, le raisonnement éthique et la responsabilité. Ce modèle de partenariat permet à SRC de produire des analyses à la fois opportunes et profondément informées.",
        "it": "Consideriamo l'IA come uno strumento potente che amplifica l'expertise umana, non come sua sostituzione. La nostra metodologia è progettata per sfruttare i punti di forza complementari di entrambi: l'IA fornisce velocità, ampiezza e riconoscimento di pattern; gli umani forniscono giudizio, comprensione contestuale, ragionamento etico e responsabilità. Questo modello di partnership permette a SRC di produrre analisi sia tempestive che profondamente informate.",
    },
    # Pipeline
    "approach.pipeline.tag": {
        "en": "From Source to Publication",
        "de": "Von der Quelle zur Publikation",
        "fr": "De la source à la publication",
        "it": "Dalla fonte alla pubblicazione",
    },
    "approach.pipeline.heading": {
        "en": "The Production Pipeline",
        "de": "Die Produktionspipeline",
        "fr": "La chaîne de production",
        "it": "La catena di produzione",
    },
    "approach.s1.title": {
        "en": "Source Collection",
        "de": "Quellensammlung",
        "fr": "Collecte des sources",
        "it": "Raccolta delle fonti",
    },
    "approach.s1.desc": {
        "en": "Our AI research engine ingests and structures data from 500+ curated sources across six domains, including government databases, academic repositories, industry reports, and multilingual news sources.",
        "de": "Unser KI-Forschungsmotor erfasst und strukturiert Daten aus über 500 kuratierten Quellen in sechs Domänen, darunter Regierungsdatenbanken, akademische Repositorien, Branchenberichte und mehrsprachige Nachrichtenquellen.",
        "fr": "Notre moteur de recherche IA ingère et structure les données de plus de 500 sources sélectionnées dans six domaines, incluant les bases de données gouvernementales, les dépôts académiques, les rapports industriels et les sources d'actualités multilingues.",
        "it": "Il nostro motore di ricerca IA acquisisce e struttura dati da oltre 500 fonti curate in sei domini, tra cui database governativi, repository accademici, rapporti di settore e fonti di notizie multilingue.",
    },
    "approach.s1.d1": {"en": "500+ curated sources", "de": "500+ kuratierte Quellen", "fr": "500+ sources sélectionnées", "it": "500+ fonti curate"},
    "approach.s1.d2": {"en": "Real-time monitoring", "de": "Echtzeit-Überwachung", "fr": "Surveillance en temps réel", "it": "Monitoraggio in tempo reale"},
    "approach.s1.d3": {"en": "6 domain-specific collections", "de": "6 domänenspezifische Sammlungen", "fr": "6 collections spécifiques par domaine", "it": "6 collezioni specifiche per dominio"},
    "approach.s1.d4": {"en": "Multilingual coverage (DE/FR/EN)", "de": "Mehrsprachige Abdeckung (DE/FR/EN)", "fr": "Couverture multilingue (DE/FR/EN)", "it": "Copertura multilingue (DE/FR/EN)"},
    "approach.s2.title": {"en": "AI Analysis Draft", "de": "KI-Analyseentwurf", "fr": "Brouillon d'analyse IA", "it": "Bozza di analisi IA"},
    "approach.s2.desc": {
        "en": "The AI engine synthesises collected data into structured analysis drafts, identifying key findings, trend patterns, risk indicators, and cross-domain connections.",
        "de": "Der KI-Motor synthetisiert die gesammelten Daten in strukturierte Analyseentwürfe und identifiziert Kernergebnisse, Trendmuster, Risikoindikatoren und domänenübergreifende Verbindungen.",
        "fr": "Le moteur IA synthétise les données collectées en brouillons d'analyse structurés, identifiant les résultats clés, les tendances, les indicateurs de risque et les connexions inter-domaines.",
        "it": "Il motore IA sintetizza i dati raccolti in bozze di analisi strutturate, identificando risultati chiave, pattern di tendenza, indicatori di rischio e connessioni tra domini.",
    },
    "approach.s2.d1": {"en": "Structured analysis framework", "de": "Strukturiertes Analyse-Framework", "fr": "Cadre d'analyse structuré", "it": "Framework di analisi strutturato"},
    "approach.s2.d2": {"en": "Cross-domain pattern matching", "de": "Domänenübergreifende Mustererkennung", "fr": "Correspondance de motifs inter-domaines", "it": "Corrispondenza di pattern tra domini"},
    "approach.s2.d3": {"en": "Risk indicator identification", "de": "Identifikation von Risikoindikatoren", "fr": "Identification des indicateurs de risque", "it": "Identificazione di indicatori di rischio"},
    "approach.s2.d4": {"en": "Trend analysis and forecasting", "de": "Trendanalyse und Prognosen", "fr": "Analyse de tendances et prévisions", "it": "Analisi delle tendenze e previsioni"},
    "approach.s3.title": {"en": "Expert Review", "de": "Expertenbewertung", "fr": "Examen expert", "it": "Revisione esperta"},
    "approach.s3.desc": {
        "en": "Domain specialists review, challenge, and enrich the AI draft. They verify factual claims, add contextual expertise, identify blind spots, and assess analytical soundness.",
        "de": "Domänen-Spezialisten überprüfen, hinterfragen und bereichern den KI-Entwurf. Sie überprüfen faktische Behauptungen, fügen kontextuelle Expertise hinzu, identifizieren blinde Flecken und beurteilen die analytische Solidität.",
        "fr": "Les spécialistes du domaine examinent, remettent en question et enrichissent le brouillon IA. Ils vérifient les affirmations factuelles, ajoutent une expertise contextuelle, identifient les angles morts et évaluent la solidité analytique.",
        "it": "Gli specialisti del dominio esaminano, mettono in discussione e arricchiscono la bozza IA. Verificano le affermazioni fattuali, aggiungono competenza contestuale, identificano punti ciechi e valutano la solidità analitica.",
    },
    "approach.s3.d1": {"en": "Minimum 2 independent reviewers", "de": "Mindestens 2 unabhängige Gutachter", "fr": "Minimum 2 réviseurs indépendants", "it": "Minimo 2 revisori indipendenti"},
    "approach.s3.d2": {"en": "Fact-checking against primary sources", "de": "Faktenprüfung anhand von Primärquellen", "fr": "Vérification des faits auprès des sources primaires", "it": "Fact-checking presso le fonti primarie"},
    "approach.s3.d3": {"en": "Contextual expertise injection", "de": "Einsatz kontextueller Expertise", "fr": "Injection d'expertise contextuelle", "it": "Iniezione di competenza contestuale"},
    "approach.s3.d4": {"en": "Methodology critique", "de": "Methodik-Kritik", "fr": "Critique méthodologique", "it": "Critica metodologica"},
    "approach.s4.title": {"en": "Editorial Finalisation", "de": "Redaktionelle Finalisierung", "fr": "Finalisation éditoriale", "it": "Finalizzazione editoriale"},
    "approach.s4.desc": {
        "en": "Senior editors review for clarity, accuracy, consistency, and adherence to SRC's non-partisan standards before publication.",
        "de": "Senioreditoren prüfen auf Klarheit, Genauigkeit, Konsistenz und Einhaltung der unparteiischen Standards von SRC vor der Publikation.",
        "fr": "Les rédacteurs en chef examinent la clarté, l'exactitude, la cohérence et le respect des standards non partisans de SRC avant publication.",
        "it": "I redattori senior verificano chiarezza, accuratezza, coerenza e conformità agli standard non partigiani di SRC prima della pubblicazione.",
    },
    "approach.s4.d1": {"en": "Language and bias review", "de": "Sprach- und Verzerrungsprüfung", "fr": "Revue du langage et des biais", "it": "Revisione del linguaggio e dei bias"},
    "approach.s4.d2": {"en": "Evidence-chain verification", "de": "Beweisketten-Verifikation", "fr": "Vérification de la chaîne de preuves", "it": "Verifica della catena di evidenze"},
    "approach.s4.d3": {"en": "Policy recommendation review", "de": "Überprüfung politischer Empfehlungen", "fr": "Revue des recommandations politiques", "it": "Revisione delle raccomandazioni politiche"},
    "approach.s4.d4": {"en": "Final quality assurance", "de": "Finale Qualitätssicherung", "fr": "Assurance qualité finale", "it": "Assicurazione qualità finale"},
    "approach.tech.heading": {"en": "Powered by Advanced AI", "de": "Angetrieben von fortschrittlicher KI", "fr": "Propulsé par l'IA avancée", "it": "Alimentato da IA avanzata"},
    "approach.tech.desc": {
        "en": "SRC uses a state-of-the-art large language model as its primary AI research engine. The system was selected for its strong multilingual capabilities — critical for global analysis — its ability to process and synthesise long-form documents, and its capacity for structured analytical output that integrates seamlessly into human expert workflows. Our AI engine enables SRC to monitor and analyse developments across all six focus areas in near real-time, producing draft analyses that serve as the starting point — not the end product — of our research process.",
        "de": "SRC verwendet ein hochmodernes großes Sprachmodell als primären KI-Forschungsmotor. Das System wurde für seine starken mehrsprachigen Fähigkeiten ausgewählt — entscheidend für globale Analysen — seine Fähigkeit, Langformdokumente zu verarbeiten und zu synthetisieren, und seine Kapazität für strukturierte analytische Ausgaben, die sich nahtlos in die Arbeitsabläufe menschlicher Experten integrieren. Unser KI-Motor ermöglicht es SRC, Entwicklungen in allen sechs Schwerpunktbereichen in nahezu Echtzeit zu überwachen und zu analysieren und Analysentwürfe zu erstellen, die als Ausgangspunkt — nicht als Endprodukt — unseres Forschungsprozesses dienen.",
        "fr": "SRC utilise un modèle de langage de pointe comme moteur de recherche IA principal. Le système a été sélectionné pour ses solides capacités multilingues — critiques pour l'analyse mondiale — sa capacité à traiter et synthétiser des documents longs, et sa capacité à produire des résultats analytiques structurés qui s'intègrent de manière transparente dans les flux de travail des experts humains. Notre moteur IA permet à SRC de surveiller et d'analyser les développements dans les six domaines de focus en temps quasi réel.",
        "it": "SRC utilizza un modello linguistico all'avanguardia come motore di ricerca IA primario. Il sistema è stato selezionato per le sue forti capacità multilingui — fondamentali per l'analisi globale — la sua capacità di elaborare e sintetizzare documenti lunghi e la sua capacità di produrre output analitici strutturati che si integrano perfettamente nei flussi di lavoro degli esperti umani.",
    },
    "approach.tech.cta": {"en": "Learn more about our technology", "de": "Mehr über unsere Technologie erfahren", "fr": "En savoir plus sur notre technologie", "it": "Scopri di più sulla nostra tecnologia"},

    # === FOCUS AREAS VIEW ===
    "focus.hero.tag": {"en": "Research Domains", "de": "Forschungsdomänen", "fr": "Domaines de recherche", "it": "Domini di ricerca"},
    "focus.hero.title": {"en": "Six Domains of Critical Infrastructure Resilience", "de": "Sechs Domänen der kritischen Infrastrukturresilienz", "fr": "Six domaines de résilience des infrastructures critiques", "it": "Sei domini di resilienza delle infrastrutture critiche"},
    "focus.hero.desc": {
        "en": "SRC's research is organised around six interconnected focus areas that collectively cover the full spectrum of security and resilience challenges.",
        "de": "Die Forschung von SRC ist um sechs miteinander verbundene Schwerpunkte organisiert, die gemeinsam das gesamte Spektrum der Sicherheits- und Resilienzherausforderungen abdecken.",
        "fr": "La recherche de SRC est organisée autour de six domaines interconnectés qui couvrent collectivement l'ensemble du spectre des défis de sécurité et de résilience.",
        "it": "La ricerca di SRC è organizzata attorno a sei aree tematiche interconnesse che coprono collettivamente l'intero spettro delle sfide di sicurezza e resilienza.",
    },
    "focus.reports-count": {"en": "published reports", "de": "veröffentlichte Berichte", "fr": "rapports publiés", "it": "rapporti pubblicati"},
    "focus.view-reports": {"en": "View Reports", "de": "Berichte ansehen", "fr": "Voir les rapports", "it": "Vedi i rapporti"},
    "focus.topics-heading": {"en": "Key Topics", "de": "Schwerpunktthemen", "fr": "Sujets clés", "it": "Argomenti chiave"},
    "focus.cross-domain": {
        "en": "Many of the most pressing challenges span multiple focus areas. SRC's cross-domain analysis methodology ensures that interdependencies and compound risks are identified and addressed holistically.",
        "de": "Viele der drängendsten Herausforderungen erstrecken sich über mehrere Schwerpunkte. Die domänenübergreifende Analysemethodik von SRC stellt sicher, dass Interdependenzen und Verbundrisiken ganzheitlich identifiziert und angegangen werden.",
        "fr": "Beaucoup des défis les plus pressants couvrent plusieurs domaines de focus. La méthodologie d'analyse inter-domaines de SRC garantit que les interdépendances et les risques composés sont identifiés et traités de manière holistique.",
        "it": "Molte delle sfide più urgenti si estendono su più aree tematiche. La metodologia di analisi inter-dominio di SRC garantisce che le interdipendenze e i rischi composti siano identificati e affrontati in modo olistico.",
    },
    "focus.cta": {"en": "Learn about our approach", "de": "Mehr über unseren Ansatz erfahren", "fr": "Découvrir notre approche", "it": "Scopri il nostro approccio"},
    # Focus area descriptions
    "focus.d1.desc": {
        "en": "The digital domain has become the central arena for geopolitical competition, economic security, and societal resilience. SRC examines how artificial intelligence, digital infrastructure, and cyber capabilities reshape power dynamics.",
        "de": "Der digitale Bereich ist zur zentralen Arena für geopolitischen Wettbewerb, wirtschaftliche Sicherheit und gesellschaftliche Resilienz geworden. SRC untersucht, wie künstliche Intelligenz, digitale Infrastruktur und Cyber-Fähigkeiten Machtdynamiken neu gestalten.",
        "fr": "Le domaine numérique est devenu l'arène centrale de la compétition géopolitique, de la sécurité économique et de la résilience sociétale. SRC examine comment l'intelligence artificielle, l'infrastructure numérique et les cybercapacités redessinent les dynamiques de pouvoir.",
        "it": "Il dominio digitale è diventato l'arena centrale per la competizione geopolitica, la sicurezza economica e la resilienza sociale. SRC esamina come l'intelligenza artificiale, l'infrastruttura digitale e le capacità informatiche ridisegnano le dinamiche di potere.",
    },
    "focus.d2.desc": {
        "en": "Great-power competition, shifting alliances, and hybrid warfare create a complex security environment. SRC analyses the strategic implications of geopolitical developments for European security architecture.",
        "de": "Großmächte-Wettbewerb, sich wandelnde Allianzen und hybride Kriegsführung schaffen ein komplexes Sicherheitsumfeld. SRC analysiert die strategischen Implikationen geopolitischer Entwicklungen für die europäische Sicherheitsarchitektur.",
        "fr": "La compétition entre grandes puissances, les alliances changeantes et la guerre hybride créent un environnement de sécurité complexe. SRC analyse les implications stratégiques des développements géopolitiques pour l'architecture de sécurité européenne.",
        "it": "La competizione tra grandi potenze, le alleanze in evoluzione e la guerra ibrida creano un ambiente di sicurezza complesso. SRC analizza le implicazioni strategiche degli sviluppi geopolitici per l'architettura di sicurezza europea.",
    },
    "focus.d3.desc": {
        "en": "Energy security underpins every aspect of critical infrastructure resilience. SRC examines the transition from fossil fuels to renewable and nuclear sources, the geopolitics of energy supply, and the resource requirements of a decarbonised economy.",
        "de": "Energiesicherheit ist die Grundlage aller Aspekte der kritischen Infrastrukturresilienz. SRC untersucht den Übergang von fossilen Brennstoffen zu erneuerbaren und nuklearen Quellen, die Geopolitik der Energieversorgung und den Ressourcenbedarf einer dekarbonisierten Wirtschaft.",
        "fr": "La sécurité énergétique sous-tend chaque aspect de la résilience des infrastructures critiques. SRC examine la transition des combustibles fossiles vers les sources renouvelables et nucléaires, la géopolitique de l'approvisionnement énergétique et les besoins en ressources d'une économie décarbonée.",
        "it": "La sicurezza energetica è alla base di ogni aspetto della resilienza delle infrastrutture critiche. SRC esamina la transizione dai combustibili fossili alle fonti rinnovabili e nucleari, la geopolitica dell'approvvigionamento energetico e i requisiti di risorse di un'economia decarbonizzata.",
    },
    "focus.d4.desc": {
        "en": "Climate change acts as a threat multiplier that compounds existing vulnerabilities in critical infrastructure. SRC analyses the intersection of environmental policy, climate adaptation, and food system resilience.",
        "de": "Klimawandel wirkt als Bedrohungsvervielfacher, der bestehende Verwundbarkeiten kritischer Infrastrukturen verstärkt. SRC analysiert die Schnittstelle von Umweltpolitik, Klimaanpassung und Resilienz des Ernährungssystems.",
        "fr": "Le changement climatique agit comme un multiplicateur de menaces qui aggrave les vulnérabilités existantes des infrastructures critiques. SRC analyse l'intersection de la politique environnementale, de l'adaptation au climat et de la résilience des systèmes alimentaires.",
        "it": "Il cambiamento climatico agisce come moltiplicatore di minacce che compone le vulnerabilità esistenti delle infrastrutture critiche. SRC analizza l'intersezione tra politica ambientale, adattamento climatico e resilienza dei sistemi alimentari.",
    },
    "focus.d5.desc": {
        "en": "Economic security is inseparable from national security. SRC examines the forces reshaping the economic landscape — from deindustrialisation pressures and supply-chain vulnerabilities to economic coercion and technological competition.",
        "de": "Wirtschaftliche Sicherheit ist untrennbar mit nationaler Sicherheit verbunden. SRC untersucht die Kräfte, die die Wirtschaftslandschaft neu gestalten — von Deindustrialisierungsdruck und Lieferkettenverwundbarkeiten bis hin zu wirtschaftlicher Nötigung und technologischem Wettbewerb.",
        "fr": "La sécurité économique est inséparable de la sécurité nationale. SRC examine les forces qui redessinent le paysage économique — des pressions de désindustrialisation et des vulnérabilités des chaînes d'approvisionnement à la coercion économique et à la concurrence technologique.",
        "it": "La sicurezza economica è inscindibile dalla sicurezza nazionale. SRC esamina le forze che ridisegnano il panorama economico — dalle pressioni di deindustrializzazione e le vulnerabilità delle catene di approvvigionamento alla coercizione economica e alla competizione tecnologica.",
    },
    "focus.d6.desc": {
        "en": "Social cohesion, institutional trust, and effective governance form the foundation of societal resilience. SRC analyses demographic trends, migration dynamics, and information warfare targeting democratic institutions.",
        "de": "Sozialer Zusammenhalt, institutionelles Vertrauen und effektive Governance bilden das Fundament der gesellschaftlichen Resilienz. SRC analysiert demografische Trends, Migrationsdynamiken und Informationskriegsführung gegen demokratische Institutionen.",
        "fr": "La cohésion sociale, la confiance institutionnelle et la gouvernance efficace forment le fondement de la résilience sociétale. SRC analyse les tendances démographiques, la dynamique migratoire et la guerre de l'information ciblant les institutions démocratiques.",
        "it": "Coesione sociale, fiducia istituzionale e governance efficace costituiscono il fondamento della resilienza sociale. SRC analizza le tendenze demografiche, la dinamica migratoria e la guerra informativa contro le istituzioni democratiche.",
    },
    # Focus area topics (36 strings — abbreviated keys)
    "focus.d1.t1": {"en": "AI governance and regulation", "de": "KI-Governance und -Regulierung", "fr": "Gouvernance et régulation de l'IA", "it": "Governance e regolazione dell'IA"},
    "focus.d1.t2": {"en": "Digital sovereignty and data localisation", "de": "Digitale Souveränität und Datenlokalisierung", "fr": "Souveraineté numérique et localisation des données", "it": "Sovranità digitale e localizzazione dei dati"},
    "focus.d1.t3": {"en": "Cybersecurity of critical infrastructure", "de": "Cybersicherheit kritischer Infrastrukturen", "fr": "Cybersécurité des infrastructures critiques", "it": "Cybersicurezza delle infrastrutture critiche"},
    "focus.d1.t4": {"en": "Zero-trust architecture adoption", "de": "Einführung von Zero-Trust-Architekturen", "fr": "Adoption de l'architecture zero-trust", "it": "Adozione dell'architettura zero-trust"},
    "focus.d1.t5": {"en": "Quantum computing implications for encryption", "de": "Quantencomputer-Auswirkungen auf die Verschlüsselung", "fr": "Implications de l'informatique quantique pour le chiffrement", "it": "Implicazioni del quantum computing per la crittografia"},
    "focus.d1.t6": {"en": "Digital identity and e-government systems", "de": "Digitale Identität und E-Government-Systeme", "fr": "Identité numérique et systèmes d'e-gouvernement", "it": "Identità digitale e sistemi di e-government"},
    "focus.d2.t1": {"en": "NATO/EU defence posture and alignment", "de": "NATO/EU-Verteidigungshaltung und -Abstimmung", "fr": "Posture de défense NATO/UE et alignement", "it": "Postura difensiva NATO/UE e coordinamento"},
    "focus.d2.t2": {"en": "Military readiness and capability gaps", "de": "Militärische Bereitschaft und Fähigkeitslücken", "fr": "Préparation militaire et lacunes de capacités", "it": "Prontezza militare e lacune operative"},
    "focus.d2.t3": {"en": "Hybrid and coercive threat analysis", "de": "Analyse hybrider und Zwangs-Bedrohungen", "fr": "Analyse des menaces hybrides et coercitives", "it": "Analisi delle minacce ibride e coercitive"},
    "focus.d2.t4": {"en": "Arms control and disarmament dynamics", "de": "Rüstungskontrolle und Abrüstungsdynamik", "fr": "Dynamiques de contrôle des armements et de désarmement", "it": "Controllo degli armamenti e dinamiche di disarmo"},
    "focus.d2.t5": {"en": "Foreign policy coordination", "de": "Außenpolitische Koordinierung", "fr": "Coordination de la politique étrangère", "it": "Coordinamento della politica estera"},
    "focus.d2.t6": {"en": "Space and domain-specific security challenges", "de": "Sicherheitsherausforderungen im Weltraum und spezifischen Domänen", "fr": "Défis de sécurité spatiaux et spécifiques aux domaines", "it": "Sfide di sicurezza spaziali e di dominio specifico"},
    "focus.d3.t1": {"en": "SMR deployment and nuclear renaissance", "de": "SMR-Einsatz und nukleare Renaissance", "fr": "Déploiement des SMR et renaissance nucléaire", "it": "Implementazione SMR e rinascita nucleare"},
    "focus.d3.t2": {"en": "LNG and gas diversification strategies", "de": "LNG- und Gasdiversifizierungsstrategien", "fr": "Stratégies de diversification du GNL et du gaz", "it": "Strategie di diversificazione del GNL e del gas"},
    "focus.d3.t3": {"en": "Grid stability and storage solutions", "de": "Netzstabilität und Speicherlösungen", "fr": "Stabilité du réseau et solutions de stockage", "it": "Stabilità della rete e soluzioni di stoccaggio"},
    "focus.d3.t4": {"en": "Critical minerals supply chains", "de": "Lieferketten für kritische Mineralien", "fr": "Chaînes d'approvisionnement en minéraux critiques", "it": "Catene di approvvigionamento di minerali critici"},
    "focus.d3.t5": {"en": "Geopolitical independence through energy policy", "de": "Geopolitische Unabhängigkeit durch Energiepolitik", "fr": "Indépendance géopolitique par la politique énergétique", "it": "Indipendenza geopolitica attraverso la politica energetica"},
    "focus.d3.t6": {"en": "Hydrogen economy readiness assessment", "de": "Bewertung der Wasserstoffwirtschaftsbereitschaft", "fr": "Évaluation de la préparation à l'économie hydrogène", "it": "Valutazione della preparazione all'economia dell'idrogeno"},
    "focus.d4.t1": {"en": "Decarbonisation pathways and policy frameworks", "de": "Dekarbonisierungspfade und politische Rahmenbedingungen", "fr": "Voies de décarbonisation et cadres politiques", "it": "Percorsi di decarbonizzazione e quadri politici"},
    "focus.d4.t2": {"en": "Environmental security and ecological resilience", "de": "Umweltsicherheit und ökologische Resilienz", "fr": "Sécurité environnementale et résilience écologique", "it": "Sicurezza ambientale e resilienza ecologica"},
    "focus.d4.t3": {"en": "Agriculture and food systems under climate stress", "de": "Landwirtschaft und Ernährungssysteme unter Klimastress", "fr": "Agriculture et systèmes alimentaires sous stress climatique", "it": "Agricoltura e sistemi alimentari sotto stress climatico"},
    "focus.d4.t4": {"en": "Water infrastructure and scarcity preparedness", "de": "Wasserinfrastruktur und Knappheitsvorsorge", "fr": "Infrastructure de l'eau et préparation à la rareté", "it": "Infrastruttura idrica e preparazione alla scarsità"},
    "focus.d4.t5": {"en": "Climate adaptation for critical infrastructure", "de": "Klimaanpassung für kritische Infrastrukturen", "fr": "Adaptation climatique pour les infrastructures critiques", "it": "Adattamento climatico per le infrastrutture critiche"},
    "focus.d4.t6": {"en": "Biodiversity and ecosystem services valuation", "de": "Biodiversität und Bewertung von Ökosystemdienstleistungen", "fr": "Biodiversité et valorisation des services écosystémiques", "it": "Biodiversità e valutazione dei servizi ecosistemici"},
    "focus.d5.t1": {"en": "Deindustrialisation risks and industrial policy", "de": "Deindustrialisierungsrisiken und Industriepolitik", "fr": "Risques de désindustrialisation et politique industrielle", "it": "Rischi di deindustrializzazione e politica industriale"},
    "focus.d5.t2": {"en": "Economic coercion and sanctions resilience", "de": "Wirtschaftliche Nötigung und Sanktionsresilienz", "fr": "Coercition économique et résilience aux sanctions", "it": "Coercizione economica e resilienza alle sanzioni"},
    "focus.d5.t3": {"en": "Supply-chain resilience and diversification", "de": "Lieferkettenresilienz und -diversifizierung", "fr": "Résilience et diversification des chaînes d'approvisionnement", "it": "Resilienza e diversificazione delle catene di approvvigionamento"},
    "focus.d5.t4": {"en": "Competitiveness in global markets", "de": "Wettbewerbsfähigkeit auf globalen Märkten", "fr": "Compétitivité sur les marchés mondiaux", "it": "Competitività sui mercati globali"},
    "focus.d5.t5": {"en": "Semiconductor and tech sector dependencies", "de": "Halbleiter- und Technologiesektor-Abhängigkeiten", "fr": "Dépendances du secteur des semi-conducteurs et de la tech", "it": "Dipendenze del settore dei semiconduttori e tecnologico"},
    "focus.d5.t6": {"en": "Financial system stability and sanctions", "de": "Finanzsystemstabilität und Sanktionen", "fr": "Stabilité du système financier et sanctions", "it": "Stabilità del sistema finanziario e sanzioni"},
    "focus.d6.t1": {"en": "Migration policy and border infrastructure", "de": "Migrationspolitik und Grenzinfrastruktur", "fr": "Politique migratoire et infrastructure frontalière", "it": "Politica migratoria e infrastruttura di confine"},
    "focus.d6.t2": {"en": "Demographic trends and labour market impacts", "de": "Demografische Trends und Auswirkungen auf den Arbeitsmarkt", "fr": "Tendances démographiques et impacts sur le marché du travail", "it": "Tendenze demografiche e impatti sul mercato del lavoro"},
    "focus.d6.t3": {"en": "Social cohesion and polarisation dynamics", "de": "Sozialer Zusammenhalt und Polarisierungsdynamik", "fr": "Cohésion sociale et dynamiques de polarisation", "it": "Coesione sociale e dinamiche di polarizzazione"},
    "focus.d6.t4": {"en": "Institutional resilience and democratic safeguards", "de": "Institutionelle Resilienz und demokratische Schutzmaßnahmen", "fr": "Résilience institutionnelle et sauvegardes démocratiques", "it": "Resilienza istituzionale e salvaguardie democratiche"},
    "focus.d6.t5": {"en": "Information warfare and counter-disinformation", "de": "Informationskriegsführung und Desinformationsabwehr", "fr": "Guerre de l'information et contre-désinformation", "it": "Guerra dell'informazione e contrasto alla disinformazione"},
    "focus.d6.t6": {"en": "Civil defence and societal preparedness", "de": "Zivilschutz und gesellschaftliche Vorsorge", "fr": "Protection civile et préparation sociétale", "it": "Protezione civile e preparazione sociale"},

    # === OPINIONS VIEW ===
    "opinions.tag": {"en": "Public", "de": "Öffentlich", "fr": "Public", "it": "Pubblico"},
    "opinions.heading": {"en": "Opinions & Commentary", "de": "Meinungen & Kommentar", "fr": "Opinions & Commentaires", "it": "Opinioni & Commenti"},
    "opinions.desc": {
        "en": "Short-form analysis and commentary from SRC experts. Open to all — no membership required. Views expressed are those of the author and do not necessarily represent the official position of SRC.",
        "de": "Kurzanalysen und Kommentare von SRC-Experten. Für alle zugänglich — keine Mitgliedschaft erforderlich. Die geäußerten Ansichten sind die des Autors und stellen nicht unbedingt die offizielle Position von SRC dar.",
        "fr": "Analyses courtes et commentaires d'experts SRC. Ouvert à tous — aucune adhésion requise. Les opinions exprimées sont celles de l'auteur et ne représentent pas nécessairement la position officielle de SRC.",
        "it": "Analisi brevi e commenti degli esperti SRC. Aperto a tutti — non è richiesta l'adesione. I pareri espressi sono dell'autore e non rappresentano necessariamente la posizione ufficiale di SRC.",
    },
    "opinions.badge": {"en": "Opinion", "de": "Meinung", "fr": "Opinion", "it": "Opinione"},
    "opinions.collapse": {"en": "Collapse", "de": "Schliessen", "fr": "Réduire", "it": "Comprimi"},
    "opinions.read-full": {"en": "Read full opinion", "de": "Vollständige Meinung lesen", "fr": "Lire l'opinion complète", "it": "Leggi l'opinione completa"},

    # === TICKER ===
    "ticker.1": {"en": "Swiss National Bank signals tighter monetary oversight for 2026", "de": "Schweizer Nationalbank kündigt strengere Geldmarktaufsicht für 2026 an", "fr": "La BNS signale une surveillance monétaire renforcée pour 2026", "it": "La BNS segnala una supervisione monetaria più stretta per il 2026"},
    "ticker.2": {"en": "NATO Summit: European nations commit to 2.5% GDP defence spending", "de": "NATO-Gipfel: Europäische Nationen verpflichten sich zu 2,5% BIP Verteidigungsausgaben", "fr": "Sommet NATO : les nations européennes s'engagent à 2,5% du PIB pour la défense", "it": "Vertice NATO: le nazioni europee si impegnano a spendere il 2,5% del PIL per la difesa"},
    "ticker.3": {"en": "EU Cyber Resilience Act enters force — implications for Swiss operators", "de": "EU-Cyber-Resilienzgesetz tritt in Kraft — Auswirkungen für Schweizer Betreiber", "fr": "Le Cyber Resilience Act de l'UE entre en vigueur — implications pour les opérateurs suisses", "it": "Il Cyber Resilience Act dell'UE entra in vigore — implicazioni per gli operatori svizzeri"},
    "ticker.4": {"en": "SRC Analysis: SMR deployment timeline for Central Europe revised", "de": "SRC-Analyse: Zeitplan für SMR-Einsatz in Mitteleuropa überarbeitet", "fr": "Analyse SRC : calendrier de déploiement des SMR en Europe centrale révisé", "it": "Analisi SRC: revisione del calendario di implementazione SMR per l'Europa centrale"},
    "ticker.5": {"en": "European defence reform: 2030 readiness targets updated", "de": "Europäische Verteidigungsreform: Bereitschaftsziele 2030 aktualisiert", "fr": "Réforme de la défense européenne : objectifs de préparation 2030 mis à jour", "it": "Riforma della difesa europea: aggiornati gli obiettivi di prontezza 2030"},
    "ticker.6": {"en": "Energy grid stress test reveals winter vulnerabilities", "de": "Stresstest des EnergieNetzes offenbart Winterverwundbarkeiten", "fr": "Le test de résistance du réseau énergétique révèle des vulnérabilités hivernales", "it": "Il test di stress della rete elettrica rivela vulnerabilità invernali"},
    "ticker.7": {"en": "New SRC Report: AI Governance in Critical Infrastructure", "de": "Neuer SRC-Bericht: KI-Governance in kritischen Infrastrukturen", "fr": "Nouveau rapport SRC : Gouvernance de l'IA dans les infrastructures critiques", "it": "Nuovo rapporto SRC: Governance dell'IA nelle infrastrutture critiche"},
    "ticker.8": {"en": "Federal Office for Civil Protection updates civil defence guidelines", "de": "Bundesamt für Bevölkerungsschutz aktualisiert Zivilschutzrichtlinien", "fr": "L'Office fédéral de la protection de la population met à jour les directives de protection civile", "it": "L'Ufficio federale della protezione della popolazione aggiorna le direttive sulla protezione civile"},

    # === REPORTS VIEW ERRORS ===
    "reports.error.fields-required": {"en": "All fields are required.", "de": "Alle Felder sind Pflichtfelder.", "fr": "Tous les champs sont obligatoires.", "it": "Tutti i campi sono obbligatori."},
    "reports.error.registration-failed": {"en": "Registration failed.", "de": "Registrierung fehlgeschlagen.", "fr": "L'inscription a échoué.", "it": "Registrazione fallita."},
    "reports.error.network": {"en": "Network error.", "de": "Netzwerkfehler.", "fr": "Erreur réseau.", "it": "Errore di rete."},
    "reports.error.or": {"en": "or", "de": "oder", "fr": "ou", "it": "o"},
    "reports.error.multiple-members": {"en": "Multiple members found. Please enter your full name.", "de": "Mehrere Mitglieder gefunden. Bitte geben Sie Ihren vollständigen Namen ein.", "fr": "Plusieurs membres trouvés. Veuillez entrer votre nom complet.", "it": "Trovati più membri. Inserisci il tuo nome completo."},

    # === STANDALONE REPORTS PAGE ===
    "reports.page.tag": {"en": "Publications & Analyses", "de": "Publikationen & Analysen", "fr": "Publications & Analyses", "it": "Pubblicazioni & Analisi"},
    "reports.page.desc": {"en": "Fact-based analyses, strategy papers and statements by the SRC Expert Panel and Board.", "de": "Faktengestützte Analysen, Strategiepapiere und Stellungnahmen des SRC-Expertenpanels und des Vorstands.", "fr": "Analyses factuelles, documents stratégiques et prises de position du Panel d'experts et du Conseil d'administration de SRC.", "it": "Analisi basate sui fatti, documenti strategici e dichiarazioni del Panel di esperti e del Consiglio di SRC."},
    "reports.page.filter-label": {"en": "Filter by section", "de": "Nach Bereich filtern", "fr": "Filtrer par domaine", "it": "Filtra per area"},
    "reports.page.all": {"en": "All ({n})", "de": "Alle ({n})", "fr": "Tous ({n})", "it": "Tutti ({n})"},
    "reports.page.loading": {"en": "Loading reports...", "de": "Berichte werden geladen...", "fr": "Chargement des rapports...", "it": "Caricamento dei rapporti..."},
    "reports.page.empty": {"en": "No reports published yet.", "de": "Noch keine Berichte veröffentlicht.", "fr": "Aucun rapport publié pour le moment.", "it": "Nessun rapporto pubblicato ancora."},
    "reports.page.empty.hint": {"en": "Check back soon for analyses from the SRC Expert Panel.", "de": "Schauen Sie bald wieder vorbei für Analysen des SRC-Expertenpanels.", "fr": "Revenez bientôt pour les analyses du Panel d'experts SRC.", "it": "Tornate presto per le analisi del Panel di esperti SRC."},
    "reports.page.read": {"en": "Read", "de": "Lesen", "fr": "Lire", "it": "Leggi"},
    "reports.detail.loading": {"en": "Loading report...", "de": "Bericht wird geladen...", "fr": "Chargement du rapport...", "it": "Caricamento del rapporto..."},
    "reports.detail.not-found": {"en": "Report not found", "de": "Bericht nicht gefunden", "fr": "Rapport introuvable", "it": "Rapporto non trovato"},
    "reports.detail.not-found.desc": {"en": "The report you are looking for does not exist or is not publicly available.", "de": "Der gesuchte Bericht existiert nicht oder ist nicht öffentlich zugänglich.", "fr": "Le rapport que vous recherchez n'existe pas ou n'est pas publiquement disponible.", "it": "Il rapporto che cercate non esiste o non è pubblicamente disponibile."},
    "reports.detail.back": {"en": "Back to Reports", "de": "Zurück zu den Berichten", "fr": "Retour aux rapports", "it": "Torna ai rapporti"},
    "reports.detail.all-reports": {"en": "All Reports", "de": "Alle Berichte", "fr": "Tous les rapports", "it": "Tutti i rapporti"},
    "reports.detail.no-content": {"en": "Full content is not yet available for this report.", "de": "Der vollständige Inhalt ist für diesen Bericht noch nicht verfügbar.", "fr": "Le contenu complet n'est pas encore disponible pour ce rapport.", "it": "Il contenuto completo non è ancora disponibile per questo rapporto."},
    "reports.detail.back-all": {"en": "Back to all reports", "de": "Zurück zu allen Berichten", "fr": "Retour à tous les rapports", "it": "Torna a tutti i rapporti"},
}


# ── MERGE NEW KEYS INTO EXISTING ───────────────────────────────────────────
for key, translations in new_keys.items():
    for lang in ["en", "de", "fr", "it"]:
        if lang in translations:
            if lang == "en":
                en[key] = translations[lang]
            elif lang == "de":
                de[key] = translations[lang]
            elif lang == "fr":
                fr[key] = translations[lang]
            elif lang == "it":
                it[key] = translations[lang]

# ── GENERATE OUTPUT FILE ────────────────────────────────────────────────────
def render_lang_block(name, d):
    lines = [f"  {name}: {{"]
    # Group by prefix for readability
    entries = list(d.items())
    for key, val in entries:
        escaped = val.replace("\\", "\\\\").replace('"', '\\"')
        lines.append(f'    "{key}": "{escaped}",')
    lines.append("  },")
    return "\n".join(lines)

output = '''export type Lang = "en" | "de" | "fr" | "it";

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  de: "DE",
  fr: "FR",
  it: "IT",
};

const strings: Record<Lang, Record<string, string>> = {
'''
output += render_lang_block("en", en) + "\n"
output += render_lang_block("de", de) + "\n"
output += render_lang_block("fr", fr) + "\n"
output += render_lang_block("it", it) + "\n"
output += '''};

export function t(lang: Lang, key: string): string {
  return strings[lang]?.[key] ?? strings.en[key] ?? key;
}
'''

with open("/home/z/my-project/src/lib/i18n.ts", "w") as f:
    f.write(output)

print(f"Generated i18n.ts with {len(en)} EN keys, {len(de)} DE keys, {len(fr)} FR keys, {len(it)} IT keys")