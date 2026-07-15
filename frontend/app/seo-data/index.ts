export type SeoCluster =
  | "resume-job-description"
  | "tailor-resume"
  | "resume-bullet-points"
  | "resume-summary"
  | "resume-skills"
  | "resume-achievements";

export type SeoPageType =
  | "role"
  | "industry"
  | "experience-level"
  | "career-situation"
  | "problem"
  | "how-to"
  | "example"
  | "tool"
  | "country"
  | "ats"
  | "comparison";

export type PriorityTier = 1 | 2 | 3;

export type SeoLink = {
  href: string;
  label: string;
};

export type SeoSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type SeoTable = {
  title: string;
  description?: string;
  columns: string[];
  rows: string[][];
};

export type SeoBeforeAfter = {
  label: string;
  before: string;
  after: string;
  explanation: string;
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoPage = {
  cluster: SeoCluster;
  slug: string;
  pageType: SeoPageType;
  priorityTier: PriorityTier;
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  quickAnswer: string;
  audience: string;
  painPoint: string;
  desiredOutcome: string;
  sections: SeoSection[];
  dataTables: SeoTable[];
  beforeAfterExamples: SeoBeforeAfter[];
  checklist: string[];
  mistakes: string[];
  recommendations: string[];
  faq: SeoFaq[];
  relatedSlugs: string[];
  crossClusterLinks: SeoLink[];
  resourceLinks: SeoLink[];
  primaryCta: SeoLink;
  secondaryCta: SeoLink;
};

type TopicBlueprint = {
  suffix: string;
  label: string;
  pageType: SeoPageType;
  collection: string;
  keywords: string[];
  angle: string;
  evidence: string;
  before: string;
  after: string;
  why: string;
};

type ClusterCopy = {
  label: string;
  keyword: string;
  verb: string;
  audience: string;
  pain: string;
  outcome: string;
  tableColumns: string[];
  resourceLinks: SeoLink[];
};

const CLUSTER_COPY: Record<SeoCluster, ClusterCopy> = {
  "resume-job-description": {
    label: "Resume and job description match",
    keyword: "resume job description match",
    verb: "compare",
    audience: "people who already have a resume and a specific vacancy",
    pain: "the resume may be relevant, but the match is difficult to verify quickly",
    outcome: "a role-specific application with clearer keywords, evidence, and priorities",
    tableColumns: ["Job signal", "Resume evidence to show", "Editing priority"],
    resourceLinks: [
      { href: "/resume-keywords", label: "Browse resume keywords" },
      { href: "/resume-examples", label: "Review resume examples" },
      { href: "/job-description", label: "Analyze job descriptions" },
    ],
  },
  "tailor-resume": {
    label: "Tailor your resume",
    keyword: "tailor resume to job description",
    verb: "tailor",
    audience: "candidates adapting one truthful resume for a target application",
    pain: "generic wording makes the right experience look less relevant than it is",
    outcome: "a focused version that emphasizes the right evidence without rewriting everything",
    tableColumns: ["Resume section", "What to tailor", "What to avoid"],
    resourceLinks: [
      { href: "/cv-optimizer", label: "See the CV optimizer workflow" },
      { href: "/resume-keywords", label: "Map job keywords" },
      { href: "/free-ats-resume-checker", label: "Run a free ATS check" },
    ],
  },
  "resume-bullet-points": {
    label: "Resume bullet points",
    keyword: "resume bullet points",
    verb: "rewrite",
    audience: "candidates improving specific experience bullets",
    pain: "duties-only lines force recruiters to infer contribution and impact",
    outcome: "concise bullets that connect action, scope, relevant skills, and honest proof",
    tableColumns: ["Weak pattern", "Better pattern", "Why it helps"],
    resourceLinks: [
      { href: "/resume-bullets", label: "Open the bullet examples hub" },
      { href: "/resume-keywords", label: "Check role keywords" },
      { href: "/resume-examples", label: "Compare role examples" },
    ],
  },
  "resume-summary": {
    label: "Resume summary",
    keyword: "resume summary",
    verb: "rewrite",
    audience: "candidates improving the top third of a resume",
    pain: "generic introductions hide role direction, specialization, and credible proof",
    outcome: "a concise summary that makes the target role and relevant evidence obvious",
    tableColumns: ["Summary element", "Include", "Avoid"],
    resourceLinks: [
      { href: "/resume-summary", label: "Use the summary hub" },
      { href: "/resume-keywords", label: "Find supported keywords" },
      { href: "/free-ats-resume-checker", label: "Check ATS alignment" },
    ],
  },
  "resume-skills": {
    label: "Resume skills",
    keyword: "resume skills",
    verb: "prioritize",
    audience: "candidates choosing and proving the skills shown on a resume",
    pain: "long skill lists create noise when the experience section does not support them",
    outcome: "a focused skills section connected to real projects, tools, and responsibilities",
    tableColumns: ["Skill signal", "Evidence to include", "Best placement"],
    resourceLinks: [
      { href: "/resume-keywords", label: "Browse keyword guidance" },
      { href: "/ats", label: "Review ATS guidance" },
      { href: "/resume-examples", label: "See skills in context" },
    ],
  },
  "resume-achievements": {
    label: "Resume achievements",
    keyword: "resume achievements",
    verb: "turn duties into results",
    audience: "candidates replacing responsibility statements with evidence",
    pain: "the resume lists activity but does not show what changed because of the work",
    outcome: "credible achievement framing with scope, decision, quality, or measurable result",
    tableColumns: ["Responsibility", "Achievement framing", "Evidence"],
    resourceLinks: [
      { href: "/resume-bullets", label: "Strengthen the bullet" },
      { href: "/resume-keywords", label: "Check achievement keywords" },
      { href: "/cases", label: "Review optimization cases" },
    ],
  },
};

const ROLE_SUFFIXES = [
  "software-engineer", "frontend-developer", "backend-developer", "full-stack-developer",
  "data-analyst", "data-scientist", "product-manager", "project-manager", "business-analyst",
  "financial-analyst", "marketing-manager", "digital-marketing", "sales-manager", "customer-success",
  "customer-service", "accountant", "hr-manager", "recruiter", "ux-designer", "graphic-designer",
  "devops-engineer", "cybersecurity", "qa-engineer", "scrum-master", "operations-manager",
  "executive-assistant", "administrative-assistant", "nurse", "teacher", "hospitality-manager",
  "machine-learning-engineer", "program-manager", "content-marketing", "seo-specialist", "account-executive",
  "account-manager", "finance-manager", "talent-acquisition", "ui-designer", "web-developer",
  "mobile-developer", "cloud-engineer", "security-analyst", "test-engineer", "agile-coach",
  "supply-chain-manager", "retail-manager", "healthcare-administrator", "consultant", "solutions-architect",
  "product-designer", "research-scientist", "database-administrator", "systems-administrator", "network-engineer",
  "compliance-analyst", "procurement-manager", "nonprofit-program-manager", "social-media-manager",
  "sales-development-representative",
] as const;

const JOB_TASK_SUFFIXES = [
  "match-checker", "keyword-matcher", "skills-match", "experience-match", "resume-score", "ats-score",
  "compare-resume", "find-missing-keywords", "check-before-applying", "improve-match-score",
  "rewrite-for-vacancy", "analyze-job-posting", "extract-keywords", "match-percentage", "free-checker",
  "compare-to-job-description", "resume-fit-check", "job-match-analysis", "resume-gap-analysis",
  "job-description-scanner", "vacancy-match-tool", "resume-ranking-check", "required-skills-check",
  "application-readiness", "target-role-match", "resume-job-fit", "job-keyword-gap", "resume-relevance-check",
  "tailor-to-vacancy", "match-my-resume",
] as const;

const SITUATION_SUFFIXES = [
  "student", "no-experience", "entry-level", "internship", "graduate", "career-change", "career-gap",
  "remote-job", "international-job", "visa-sponsorship", "senior-role", "executive-role", "senior-position",
  "management-role", "first-job", "promotion", "senior-professional", "manager", "executive", "return-to-work",
  "junior-role", "freelance", "contractor", "unemployed", "overqualified",
] as const;

const ATS_SUFFIXES = [
  "workday", "greenhouse", "lever", "taleo", "icims", "bamboohr", "smartrecruiters", "sap-successfactors",
  "oracle", "jobvite", "ashby", "workable", "ukg-pro", "adp-recruiting", "avature", "bullhorn",
  "teamtailor", "recruitee", "personio", "clearcompany",
] as const;

const JOB_PROBLEM_SUFFIXES = [
  "resume-does-not-match-job", "low-match-score", "missing-job-keywords", "irrelevant-experience",
  "not-getting-interviews", "resume-rejected", "too-many-missing-skills", "resume-too-generic", "not-tailored",
  "wrong-job-title", "weak-summary", "weak-bullets", "unclear-career-change", "ats-cannot-read-resume",
  "resume-too-long", "resume-too-short", "no-relevant-experience", "skills-not-proven", "job-description-overwhelming",
  "score-is-low", "duplicate-keywords", "resume-lacks-impact", "unclear-seniority", "no-call-backs", "inconsistent-format",
] as const;

const TAILOR_HOW_TO_SUFFIXES = [
  "to-job-description", "for-each-job", "with-keywords", "without-lying", "without-rewriting-everything", "quickly",
  "for-ats", "step-by-step", "examples", "checklist", "use-match-score", "prioritize-skills", "choose-right-bullets",
  "keep-original-voice", "tailor-summary", "tailor-skills", "tailor-experience", "compare-two-versions",
  "tailor-after-career-change", "tailor-a-pdf", "tailor-a-docx", "tailor-on-mobile", "tailor-for-recruiter",
  "tailor-for-keywords", "tailor-before-applying",
] as const;

const TAILOR_PROBLEM_SUFFIXES = [
  "resume-too-generic", "resume-not-getting-interviews", "low-ats-score", "missing-keywords", "irrelevant-experience",
  "too-much-experience", "not-enough-experience", "no-time-to-tailor", "unsure-what-to-change", "job-title-mismatch",
  "weak-summary", "weak-skills", "weak-bullets", "career-change-resume", "resume-does-not-match", "repetitive-resume",
  "unclear-target-role", "overqualified-resume", "outdated-resume", "multiple-job-types",
] as const;

const MARKET_SUFFIXES = [
  "us-jobs", "uk-jobs", "canada-jobs", "europe-jobs", "australia-jobs", "germany-jobs", "remote-jobs",
  "tech-jobs", "startup-jobs", "corporate-jobs",
] as const;

const BULLET_TASK_SUFFIXES = [
  "with-metrics", "without-metrics", "action-verbs", "achievements", "leadership", "projects", "teamwork",
  "problem-solving", "customer-impact", "revenue-impact", "cost-savings", "process-improvement", "time-saved",
  "quality-improvement", "efficiency", "stakeholder-management", "technical-ownership", "cross-functional",
  "incident-response", "data-driven", "launch", "onboarding", "retention", "forecasting", "reporting",
] as const;

const BULLET_HOW_TO_SUFFIXES = [
  "how-to-write", "how-many", "how-long", "too-generic", "no-results", "no-numbers", "responsibilities-vs-achievements",
  "rewrite", "checker", "generator", "one-line", "bullets-for-ats", "bullets-for-job-description",
  "bullets-for-career-change", "bullets-for-student", "bullets-for-manager", "bullets-for-remote-work",
  "bullets-for-projects", "bullets-for-promotion", "bullets-for-resume-gap",
] as const;

const BULLET_CAREER_SUFFIXES = [
  "student", "no-experience", "internship", "entry-level", "junior", "senior", "manager", "executive",
  "career-change", "freelancer",
] as const;

const SUMMARY_HOW_TO_SUFFIXES = [
  "how-to-write", "examples", "checker", "generator", "length", "keywords", "ats", "too-generic",
  "with-metrics", "without-experience", "for-job-description", "for-career-change", "for-students", "for-executives",
  "summary-rewrite",
] as const;

const SKILL_TYPE_SUFFIXES = [
  "hard-skills", "soft-skills", "technical-skills", "leadership", "communication", "problem-solving", "teamwork",
  "analytical", "management", "digital", "data-analysis", "project-management", "customer-service-skills", "organizational",
  "attention-to-detail", "negotiation", "creativity", "adaptability", "time-management", "interpersonal",
] as const;

const SKILL_HOW_TO_SUFFIXES = [
  "how-many", "where-to-put", "how-to-match-job", "missing-skills", "checker", "job-description", "ats", "examples",
  "without-experience", "remove-irrelevant-skills", "skills-summary", "skill-levels", "transferable-skills",
  "skills-section", "skills-for-career-change",
] as const;

const ACHIEVEMENT_TASK_SUFFIXES = [
  "examples", "how-to-write", "how-to-quantify", "without-numbers", "with-metrics", "responsibilities-vs-achievements",
  "generator", "checker", "student", "no-experience", "leadership", "cost-savings", "revenue", "process-improvement",
  "efficiency", "customer-impact", "quality-improvement", "project-delivery", "team-management", "career-change",
] as const;

const SKILLS_ROLE_SUFFIXES = [
  "software-engineer", "data-analyst", "product-manager", "project-manager", "marketing", "sales", "customer-service",
  "customer-success", "business-analyst", "financial-analyst", "accountant", "hr", "recruiter", "ux-designer", "devops",
  "full-stack-developer", "backend-developer", "frontend-developer", "data-scientist", "business-development-manager",
  "account-executive", "account-manager", "operations-manager", "project-coordinator", "scrum-master", "qa-engineer",
  "cybersecurity", "cloud-engineer", "web-developer", "graphic-designer", "content-marketing", "seo-specialist",
  "product-designer", "sales-development-representative", "finance-manager", "compliance-analyst", "procurement-manager",
  "executive-assistant", "administrative-assistant", "nurse", "teacher", "hospitality-manager", "retail-manager",
  "consultant", "healthcare-administrator",
] as const;

const ACHIEVEMENT_ROLE_SUFFIXES = [
  "software-engineer", "data-analyst", "product-manager", "project-manager", "marketing", "sales", "customer-service",
  "business-analyst", "financial-analyst", "accountant", "operations-manager", "hr", "recruiter", "ux-designer",
  "devops", "qa-engineer", "teacher", "nurse", "consultant", "executive-assistant",
] as const;

const ROLE_DETAILS: Record<string, { keywords: string[]; angle: string; evidence: string; before: string; after: string; why: string }> = {
  "software-engineer": { keywords: ["APIs", "cloud", "databases", "system design", "testing", "reliability"], angle: "show technical ownership without turning the resume into a tool inventory", evidence: "Connect a technical decision to reliability, performance, delivery, or a user-facing result.", before: "Responsible for building services and fixing bugs.", after: "Designed and shipped a service workflow, added tests and validation, and documented API ownership for the team.", why: "It names the system boundary and engineering decisions instead of a generic responsibility." },
  "frontend-developer": { keywords: ["React", "TypeScript", "CSS", "accessibility", "responsive UI", "component libraries"], angle: "make interface ownership and browser quality easy to scan", evidence: "Show the interface surface, the implementation choice, and how accessibility or edge cases were handled.", before: "Worked on the frontend and fixed UI issues.", after: "Built reusable React and TypeScript components for a responsive account flow and resolved accessibility issues before release.", why: "The revision connects the stack to shipped interface work and quality checks." },
  "backend-developer": { keywords: ["APIs", "Python", "Java", "PostgreSQL", "microservices", "observability"], angle: "make service boundaries, data integrity, and operational ownership clear", evidence: "State the service or data problem, the implementation decision, and the reliability or quality practice behind it.", before: "Developed backend features and maintained the database.", after: "Implemented versioned APIs and PostgreSQL queries, added validation and tests, and documented failure cases for service ownership.", why: "The after version makes the work inspectable without inventing traffic or latency figures." },
  "full-stack-developer": { keywords: ["React", "Node.js", "APIs", "databases", "deployment", "testing"], angle: "show end-to-end delivery while keeping the system boundaries readable", evidence: "Separate the user-facing surface, service layer, and delivery responsibility so breadth does not become vagueness.", before: "Built full-stack features for the product.", after: "Delivered a customer workflow across React, Node.js, and PostgreSQL, documented API contracts, and added tests across the main user path.", why: "The rewrite proves breadth through a concrete workflow instead of listing every tool." },
  "data-analyst": { keywords: ["SQL", "Excel", "Power BI", "dashboards", "data cleaning", "stakeholder reporting"], angle: "make the question, method, and decision behind analysis visible", evidence: "Show what question was answered, how the data was prepared, and which stakeholder used the result.", before: "Created reports and analyzed data for the business.", after: "Built SQL models and Power BI dashboards for retention reviews, giving customer-success leads a consistent view of cohort movement and renewal risk.", why: "It makes the analysis useful to both a technical screener and the business stakeholder." },
  "data-scientist": { keywords: ["Python", "statistics", "machine learning", "experimentation", "feature engineering", "model evaluation"], angle: "connect modeling choices to a business or scientific question", evidence: "Name the dataset or problem, method, evaluation approach, and how a decision used the result.", before: "Built machine-learning models to solve business problems.", after: "Prepared behavioral features in Python, compared model performance with a held-out set, and translated findings into a decision memo for product stakeholders.", why: "The after version distinguishes modeling work from an unsupported claim of business impact." },
  "product-manager": { keywords: ["roadmap", "discovery", "prioritization", "experimentation", "product analytics", "launches"], angle: "balance discovery, trade-offs, delivery, and product outcomes", evidence: "Show the customer problem, prioritization decision, cross-functional work, and product signal that followed.", before: "Managed the product roadmap and worked with engineering.", after: "Prioritized an onboarding experiment with design and engineering, clarified acceptance criteria, and used activation data to guide the next roadmap decision.", why: "It describes product judgment rather than treating coordination as the whole job." },
  "project-manager": { keywords: ["project planning", "risk management", "budgets", "dependencies", "status reporting", "delivery"], angle: "show scope, constraints, risk decisions, and stakeholder alignment", evidence: "Name the scope, constraint, intervention, and delivery result or handoff.", before: "Managed projects and communicated with stakeholders.", after: "Coordinated a platform migration across product, engineering, and support, tracked dependency risks, and kept launch decisions visible through weekly reporting.", why: "The revision gives the reader a delivery story with scope and control points." },
  "business-analyst": { keywords: ["requirements gathering", "process mapping", "SQL", "stakeholder analysis", "acceptance criteria", "business cases"], angle: "show how analysis became a requirement, decision, or process change", evidence: "Connect the business question to the analysis method, stakeholder decision, and handoff to delivery.", before: "Gathered requirements and supported business projects.", after: "Mapped the current order workflow, clarified requirements with operations stakeholders, and documented acceptance criteria for the delivery team.", why: "It shows analysis as a bridge between a business problem and an implementable change." },
  "marketing-manager": { keywords: ["acquisition", "conversion", "lifecycle", "SEO", "paid media", "attribution"], angle: "connect campaigns to funnel stages and commercial decisions", evidence: "Separate the channel, audience, intervention, and meaningful outcome or learning.", before: "Responsible for marketing campaigns and social media.", after: "Planned SEO and lifecycle campaigns for a B2B audience, coordinated content and paid-search briefs, and reported channel performance against qualified-lead goals.", why: "It gives marketing work a channel and measurement frame without an unsupported result." },
  "digital-marketing": { keywords: ["SEO", "paid media", "ROAS", "CAC", "email lifecycle", "attribution"], angle: "make channel ownership, funnel stage, and measurement visible", evidence: "Name the channel, audience, campaign decision, and verified performance or learning you can substantiate.", before: "Managed digital marketing activities across several channels.", after: "Coordinated SEO content, paid-search briefs, and lifecycle email tests, keeping channel assumptions and campaign learnings in one reporting workflow.", why: "The rewrite separates channels and shows an optimization loop without borrowing a fabricated conversion rate." },
  "sales-manager": { keywords: ["coaching", "forecasting", "pipeline coverage", "territory planning", "CRM governance", "sales leadership"], angle: "prove coaching, forecast discipline, and team-level commercial ownership", evidence: "Show how the manager improved the operating rhythm around a team, not only the team target.", before: "Managed a sales team and helped hit goals.", after: "Coached a mid-market sales team through pipeline reviews, standardized opportunity stages in the CRM, and used forecast exceptions to focus deal support.", why: "It separates people leadership, operating cadence, and forecast quality." },
  "customer-service": { keywords: ["ticket volume", "CSAT", "response time", "resolution rate", "CRM", "escalations"], angle: "turn service volume and communication into evidence of resolution quality", evidence: "Show the environment, customer problem, and balance between speed, accuracy, and communication.", before: "Answered customer questions and resolved issues.", after: "Handled a high-volume support queue, documented recurring account issues, and escalated product defects with clear reproduction notes.", why: "It shows frontline execution and information quality without inventing a metric." },
  "customer-success": { keywords: ["onboarding", "adoption", "renewals", "retention", "QBRs", "customer health"], angle: "show adoption, retention, account health, and proactive customer work", evidence: "Make the lifecycle stage and customer outcome clear while separating owned accounts from team-wide results.", before: "Managed customer accounts and helped with renewals.", after: "Led onboarding and business reviews for SaaS customers, used health signals to prioritize outreach, and coordinated renewal risks with account executives.", why: "It shows a lifecycle and decision process instead of a vague relationship claim." },
  "financial-analyst": { keywords: ["forecasting", "budgeting", "variance analysis", "financial modeling", "Excel", "reporting"], angle: "make planning, variance analysis, modeling, and decision support concrete", evidence: "Show the planning cycle, analysis performed, and stakeholder decision that followed.", before: "Prepared financial reports and helped with budgeting.", after: "Maintained monthly forecast models in Excel, investigated plan-versus-actual variances, and prepared commentary for department spending decisions.", why: "It includes the finance cycle and decision context without a fictional result." },
  accountant: { keywords: ["month-end close", "reconciliations", "GAAP", "accounts payable", "internal controls", "audit support"], angle: "show close, controls, reconciliation, and reporting accuracy", evidence: "State the process owned, records or controls involved, and how accuracy or timeliness was protected.", before: "Responsible for accounts and preparing reports.", after: "Completed month-end reconciliations, investigated unusual balances, and prepared support for financial reporting and audit requests.", why: "It uses recognizable accounting workflows and leaves space for verified scale." },
  "ux-designer": { keywords: ["user research", "interaction design", "wireframes", "prototyping", "usability testing", "design systems"], angle: "connect research, interaction design, prototyping, and validated user outcomes", evidence: "Name the user problem, design decision, and evidence used to refine the solution.", before: "Designed user-friendly interfaces for the product.", after: "Synthesized interview and usability findings into a new onboarding flow, prototyped alternatives in Figma, and partnered with engineering on handoff.", why: "It puts the design process and collaboration around a user problem into one story." },
  "graphic-designer": { keywords: ["Adobe Creative Suite", "Figma", "brand systems", "layout", "typography", "art direction"], angle: "show the brief, design system, production workflow, and review process", evidence: "Name the audience or campaign, the design medium, and how feedback or production constraints shaped the work.", before: "Created graphics and marketing materials for the company.", after: "Created campaign layouts and social assets in Figma and Adobe tools, applied brand guidelines, and prepared production-ready files from stakeholder briefs.", why: "It makes visual work legible to a non-designing recruiter without reducing it to software names." },
  "devops-engineer": { keywords: ["CI/CD", "cloud infrastructure", "Kubernetes", "Terraform", "monitoring", "incident response"], angle: "show delivery automation, infrastructure decisions, observability, and operational ownership", evidence: "Connect an infrastructure or delivery change to repeatability, recovery, reliability, or developer feedback.", before: "Managed cloud infrastructure and deployment pipelines.", after: "Maintained Terraform-managed environments and CI/CD workflows, improved deployment checks, and documented rollback steps for owned services.", why: "It names the operating surface and a reliability practice without unsupported uptime claims." },
  cybersecurity: { keywords: ["threat modeling", "vulnerability management", "SIEM", "incident response", "IAM", "security controls"], angle: "show controls, threat context, incident work, and risk communication", evidence: "Identify the asset or risk, the control or investigation, and how findings were remediated.", before: "Monitored systems for security issues and helped with incidents.", after: "Reviewed SIEM alerts, documented triage decisions, and partnered with infrastructure owners to track vulnerability remediation.", why: "It shows a defensible security process without exposing sensitive details." },
  "qa-engineer": { keywords: ["test automation", "regression testing", "API testing", "test plans", "defect triage", "CI pipelines"], angle: "show risk-based testing, defect communication, automation, and release confidence", evidence: "Explain what was tested, how risk was prioritized, and what evidence supported release decisions.", before: "Tested software and reported bugs.", after: "Designed regression coverage for web and API workflows, documented reproducible defects, and partnered with developers to verify fixes before release.", why: "It describes quality work as a decision-support process." },
  "scrum-master": { keywords: ["sprint planning", "facilitation", "backlog refinement", "impediment removal", "retrospectives", "flow metrics"], angle: "show how facilitation improved team flow and delivery visibility", evidence: "Describe the team context, the impediment or coordination problem, and the practice used to support delivery.", before: "Facilitated Scrum ceremonies and supported the agile team.", after: "Facilitated planning, refinement, and retrospectives for a cross-functional team, surfaced delivery blockers, and kept follow-up actions visible.", why: "It shows servant leadership and operating rhythm rather than listing ceremonies alone." },
  "operations-manager": { keywords: ["process improvement", "SOPs", "capacity planning", "SLA", "vendor management", "quality control"], angle: "connect operational ownership with process, capacity, service, and quality decisions", evidence: "Name the workflow, constraint, control, or stakeholder handoff that you managed.", before: "Managed daily operations and improved processes.", after: "Coordinated daily operations, documented SOP updates, and reviewed recurring service issues with team leads to prioritize process fixes.", why: "The revision makes operational scope and improvement work reviewable without inventing efficiency gains." },
  "executive-assistant": { keywords: ["executive calendar", "meeting briefs", "travel coordination", "confidentiality", "stakeholder communication", "expense reporting"], angle: "show trusted coordination, prioritization, confidentiality, and executive support", evidence: "Explain the executive context, competing priorities, and systems used to keep decisions and follow-ups organized.", before: "Supported executives with calendars and administrative tasks.", after: "Managed complex calendars, prepared meeting briefs, coordinated travel changes, and tracked confidential follow-ups across internal and external stakeholders.", why: "It demonstrates judgment and coordination rather than presenting assistance as a list of errands." },
  "administrative-assistant": { keywords: ["scheduling", "records management", "office operations", "invoicing", "customer communication", "Microsoft Office"], angle: "show organization, accuracy, communication, and dependable office workflows", evidence: "Name the process, records, stakeholders, or recurring handoff that you kept accurate and on time.", before: "Handled administrative tasks and answered emails.", after: "Coordinated schedules, maintained shared records, and responded to customer and supplier requests while keeping follow-ups organized for the team.", why: "It gives administrative work a clear workflow and quality signal." },
  "hr-manager": { keywords: ["employee relations", "performance management", "HRIS", "policy", "recruiting", "people analytics"], angle: "show people-program ownership, policy judgment, and trusted stakeholder communication", evidence: "Describe the employee or business context, the process you managed, and how confidentiality and consistency were protected.", before: "Managed HR activities and supported employees.", after: "Managed employee-relations cases, coordinated performance-review cycles in the HRIS, and partnered with managers on consistent policy communication.", why: "It shows a defined people process without exposing confidential employee information." },
  recruiter: { keywords: ["sourcing", "candidate screening", "ATS", "pipeline management", "interview coordination", "hiring-manager partnership"], angle: "make sourcing strategy, screening judgment, pipeline quality, and stakeholder partnership visible", evidence: "Name the role family, sourcing method, screening signal, and handoff that you owned.", before: "Recruited candidates and scheduled interviews.", after: "Sourced candidates for technical roles, documented screening criteria in the ATS, and coordinated structured interview feedback with hiring managers.", why: "It shows recruiting as a repeatable evaluation and coordination process." },
  "hospitality-manager": { keywords: ["guest satisfaction", "occupancy", "reservations", "service recovery", "upselling", "staff coordination"], angle: "connect guest experience with service standards and operational control", evidence: "Show the service environment, the guest or capacity problem, the intervention, and the operational result.", before: "Managed hotel operations and provided excellent guest service.", after: "Coordinated reservations, shift handoffs, and service recovery during high-occupancy periods while keeping guest requests visible to the next team.", why: "The revision makes hospitality management observable without inventing an occupancy or satisfaction rate." },
  nurse: { keywords: ["patient care", "clinical documentation", "medication administration", "care planning", "patient education", "teamwork"], angle: "show patient-care scope, clinical judgment, documentation, and communication", evidence: "State the care setting and responsibility level while protecting patient privacy and team-based outcomes.", before: "Provided care to patients and worked with the nursing team.", after: "Provided patient care in a clinical setting, documented observations and care plans accurately, and communicated changes to the interdisciplinary team.", why: "It gives context without exposing protected information." },
  teacher: { keywords: ["lesson planning", "classroom management", "differentiation", "assessment", "student engagement", "family communication"], angle: "show lesson design, classroom practice, differentiation, and collaboration", evidence: "Make the learning context and instructional decision visible without reducing students to unsupported statistics.", before: "Taught students and prepared lessons.", after: "Planned differentiated lessons, used formative assessment to adjust instruction, and communicated progress with families and grade-level colleagues.", why: "It names pedagogical practice and collaboration that can be substantiated." },
};

const HUB_CONFIGS: Record<SeoCluster, { title: string; description: string; h1: string; subtitle: string }> = {
  "resume-job-description": { title: "Resume Job Description Match: Compare Your CV | CVboosta", description: "Compare a resume with a real job description, find missing keywords, and review ATS and recruiter fit before applying with CVboosta.", h1: "Compare Your Resume With a Job Description", subtitle: "Find the gaps between the resume you have and the vacancy you want, then make the most relevant evidence easier to verify." },
  "tailor-resume": { title: "Tailor Resume to a Job Description: Practical Guide | CVboosta", description: "Tailor your resume to a real job description without keyword stuffing. Prioritize skills, summary, and evidence with CVboosta.", h1: "Tailor Your Resume to the Job You Want", subtitle: "Keep your experience truthful while changing the emphasis, wording, and proof that matter for one specific application." },
  "resume-bullet-points": { title: "Resume Bullet Points: Examples, Fixes and ATS Tips | CVboosta", description: "Improve resume bullet points with stronger verbs, scope, keywords, and honest proof. Explore role-specific examples with CVboosta.", h1: "Write Resume Bullet Points Recruiters Can Trust", subtitle: "Turn duties into clear action, scope, and evidence without making up metrics or repeating the same generic formula." },
  "resume-summary": { title: "Resume Summary Examples and ATS Tips | CVboosta", description: "Write a concise resume summary for a target role. Find examples, keywords, and ATS-safe guidance with CVboosta.", h1: "Build a Resume Summary That Shows Role Fit", subtitle: "Use the top third of your resume to make your professional direction, specialization, and strongest proof obvious." },
  "resume-skills": { title: "Resume Skills by Role: Keywords and Proof | CVboosta", description: "Choose relevant resume skills, connect them to evidence, and avoid keyword stuffing with role-specific guidance from CVboosta.", h1: "Choose Resume Skills You Can Prove", subtitle: "Prioritize the skills a vacancy needs, then connect each one to a project, tool, decision, or responsibility in your experience." },
  "resume-achievements": { title: "Resume Achievements: Turn Duties Into Results | CVboosta", description: "Turn resume responsibilities into credible achievements with scope, outcomes, and proof. Explore role-specific examples with CVboosta.", h1: "Turn Resume Duties Into Credible Achievements", subtitle: "Make the change, decision, quality signal, or measurable outcome behind your work easier to see." },
};

const COMMON_PRODUCT_LINKS: SeoLink[] = [
  { href: "/app", label: "Open CVBoosta" },
  { href: "/free-ats-resume-checker", label: "Run a free ATS check" },
  { href: "/cv-optimizer", label: "See the CV optimizer" },
  { href: "/pricing", label: "Review pricing" },
  { href: "/register", label: "Create a CVBoosta account" },
];

const COMMON_FOCUS: Record<string, string[]> = {
  role: ["role identity", "relevant responsibilities", "tools and methods", "scope", "outcomes"],
  "career-situation": ["career context", "transferable evidence", "current readiness", "target role", "clear timeline"],
  problem: ["the failure signal", "the likely cause", "the first repair", "supporting evidence", "application readiness"],
  "how-to": ["the starting file", "the target vacancy", "the highest-value edit", "a verification step", "a final review"],
  ats: ["text extraction", "section headings", "file instructions", "keyword relevance", "human review"],
  industry: ["industry language", "operating context", "stakeholder needs", "role evidence", "credible outcomes"],
  country: ["local convention", "employer instructions", "language clarity", "work authorization", "role evidence"],
  tool: ["diagnostic signal", "role context", "evidence quality", "review step", "next action"],
  comparison: ["shared requirement", "meaningful difference", "evidence location", "risk", "next step"],
  example: ["context", "action", "method", "proof", "truth check"],
};

function humanize(value: string) {
  return value
    .split("-")
    .map((part) => {
      const upper = part.toUpperCase();
      if (["ats", "seo", "hr", "qa", "ux", "ui", "pdf", "docx", "api", "sql"].includes(part)) return upper;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function truncateWords(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return `${shortened}...`;
}

function fallbackDetails(suffix: string, pageType: SeoPageType) {
  const label = humanize(suffix);
  const key = label.toLowerCase() || "role";
  return {
    keywords: [label, `${key} workflow`, "job description analysis", "recruiter review", "supported keywords", "evidence"],
    angle: `make ${label.toLowerCase()} evidence more specific without overstating the work`,
    evidence: `Connect ${label.toLowerCase()} to a real responsibility, method, deliverable, scope, or decision that a recruiter can verify.`,
    before: `Worked on ${label.toLowerCase()} responsibilities and supported the team.`,
    after: `Handled ${label.toLowerCase()} work within a defined workflow, documented the key decisions, and made the relevant handoff or outcome easier to verify.`,
    why: `The revision adds context and a reviewable contribution instead of relying on a broad label or an unsupported claim.`,
    pageType,
  };
}

function makeBlueprints(
  suffixes: readonly string[],
  pageType: SeoPageType,
  collection: string,
  cluster: SeoCluster,
): TopicBlueprint[] {
  return suffixes.map((suffix) => {
    const roleDetail = ROLE_DETAILS[suffix];
    const fallback = fallbackDetails(suffix, pageType);
    const detail = roleDetail || fallback;
    return {
      suffix,
      label: humanize(suffix),
      pageType,
      collection,
      keywords: detail.keywords,
      angle: detail.angle,
      evidence: detail.evidence,
      before: detail.before,
      after: detail.after,
      why: `${detail.why} The ${cluster} workflow keeps this edit tied to one search intent and one real application.`,
    };
  });
}

const CLUSTER_BLUEPRINTS: Record<SeoCluster, TopicBlueprint[]> = {
  "resume-job-description": [
    ...makeBlueprints(ROLE_SUFFIXES, "role", "professions", "resume-job-description"),
    ...makeBlueprints(JOB_TASK_SUFFIXES, "tool", "match tasks", "resume-job-description"),
    ...makeBlueprints(SITUATION_SUFFIXES, "career-situation", "career situations", "resume-job-description"),
    ...makeBlueprints(ATS_SUFFIXES, "ats", "ATS workflows", "resume-job-description"),
    ...makeBlueprints(JOB_PROBLEM_SUFFIXES, "problem", "match problems", "resume-job-description"),
  ],
  "tailor-resume": [
    ...makeBlueprints(ROLE_SUFFIXES.slice(0, 50), "role", "professions", "tailor-resume"),
    ...makeBlueprints(SITUATION_SUFFIXES, "career-situation", "career situations", "tailor-resume"),
    ...makeBlueprints(TAILOR_HOW_TO_SUFFIXES, "how-to", "how-to workflows", "tailor-resume"),
    ...makeBlueprints(TAILOR_PROBLEM_SUFFIXES, "problem", "tailoring problems", "tailor-resume"),
    ...makeBlueprints(MARKET_SUFFIXES, "country", "markets", "tailor-resume"),
  ],
  "resume-bullet-points": [
    ...makeBlueprints(ROLE_SUFFIXES.slice(0, 55), "role", "professions", "resume-bullet-points"),
    ...makeBlueprints(BULLET_TASK_SUFFIXES, "example", "bullet tasks", "resume-bullet-points"),
    ...makeBlueprints(BULLET_HOW_TO_SUFFIXES, "how-to", "bullet workflows", "resume-bullet-points"),
    ...makeBlueprints(BULLET_CAREER_SUFFIXES, "career-situation", "career levels", "resume-bullet-points"),
  ],
  "resume-summary": [
    ...makeBlueprints(ROLE_SUFFIXES.slice(0, 45), "role", "professions", "resume-summary"),
    ...makeBlueprints(SITUATION_SUFFIXES.slice(0, 20), "career-situation", "career situations", "resume-summary"),
    ...makeBlueprints(SUMMARY_HOW_TO_SUFFIXES, "how-to", "summary workflows", "resume-summary"),
  ],
  "resume-skills": [
    ...makeBlueprints(SKILLS_ROLE_SUFFIXES, "role", "professions", "resume-skills"),
    ...makeBlueprints(SKILL_TYPE_SUFFIXES, "industry", "skill types", "resume-skills"),
    ...makeBlueprints(SKILL_HOW_TO_SUFFIXES, "how-to", "skill workflows", "resume-skills"),
  ],
  "resume-achievements": [
    ...makeBlueprints(ACHIEVEMENT_ROLE_SUFFIXES, "role", "professions", "resume-achievements"),
    ...makeBlueprints(ACHIEVEMENT_TASK_SUFFIXES, "example", "achievement tasks", "resume-achievements"),
  ],
};

export const ENABLED_SEO_TIERS: readonly PriorityTier[] = [1, 2, 3];

function clusterKeyword(cluster: SeoCluster, blueprint: TopicBlueprint) {
  const raw = blueprint.pageType === "role"
    ? `${blueprint.label} ${CLUSTER_COPY[cluster].keyword}`
    : `${CLUSTER_COPY[cluster].keyword} ${blueprint.label.toLowerCase()}`;
  return raw.replace(/\b(\w+)(?:\s+\1\b)+/gi, "$1");
}

function getPageTitle(cluster: SeoCluster, blueprint: TopicBlueprint) {
  const label = blueprint.label;
  const compactLabel = truncateWords(label, 28);
  switch (cluster) {
    case "resume-job-description":
      return blueprint.pageType === "role"
        ? `${label} Resume Match to a Job | CVboosta`
        : `Resume Match: ${compactLabel} | CVboosta`;
    case "tailor-resume":
      return blueprint.pageType === "role"
        ? `Tailor ${label} Resume to a Job | CVboosta`
        : `Tailor Resume: ${compactLabel} | CVboosta`;
    case "resume-bullet-points":
      return blueprint.pageType === "role"
        ? `${label} Resume Bullets: Examples | CVboosta`
        : `Resume Bullets: ${compactLabel} | CVboosta`;
    case "resume-summary":
      return blueprint.pageType === "role"
        ? `${label} Resume Summary: ATS Tips | CVboosta`
        : `Resume Summary: ${compactLabel} | CVboosta`;
    case "resume-skills":
      return blueprint.pageType === "role"
        ? `${truncateWords(label, 28)} Resume Skills: Keywords | CVboosta`
        : `Resume Skills: ${compactLabel} | CVboosta`;
    case "resume-achievements":
      return blueprint.pageType === "role"
        ? `${label} Resume Achievements: Results | CVboosta`
        : `Resume Achievements: ${compactLabel} | CVboosta`;
  }
}

function getPageH1(cluster: SeoCluster, blueprint: TopicBlueprint) {
  const label = blueprint.label.toLowerCase();
  switch (cluster) {
    case "resume-job-description":
      return `Compare your ${label} resume with a job description`;
    case "tailor-resume":
      return `Tailor your ${label} resume to a job description`;
    case "resume-bullet-points":
      return `Rewrite your ${label} resume bullet points`;
    case "resume-summary":
      return `Rewrite your ${label} resume summary`;
    case "resume-skills":
      return `Prioritize your ${label} resume skills`;
    case "resume-achievements":
      return `Turn ${label} resume duties into achievements`;
  }
}

function getCtas(cluster: SeoCluster, blueprint: TopicBlueprint, index: number) {
  const label = blueprint.label.toLowerCase();
  const pairs: Array<{ primary: SeoLink; secondary: SeoLink }> = [
    { primary: { href: "/app", label: cluster === "resume-bullet-points" ? "Improve my bullet points" : "Open CVBoosta" }, secondary: { href: "/free-ats-resume-checker", label: "Run a free ATS check" } },
    { primary: { href: "/app", label: cluster === "resume-summary" ? "Rewrite my resume summary" : "Start with my current resume" }, secondary: { href: "/cv-optimizer", label: "See the optimizer workflow" } },
    { primary: { href: "/free-ats-resume-checker", label: cluster === "resume-skills" ? "Check my resume skills" : "Check my resume match" }, secondary: { href: "/app", label: "Tailor my resume" } },
    { primary: { href: "/app", label: cluster === "resume-achievements" ? "Turn duties into achievements" : `Fix my ${label} resume` }, secondary: { href: "/register", label: "Create a CVBoosta account" } },
  ];
  return pairs[index % pairs.length];
}

function getResourceLinks(cluster: SeoCluster) {
  const links = [
    ...CLUSTER_COPY[cluster].resourceLinks,
    { href: "/resume-keywords", label: "Review resume keyword guidance" },
    { href: "/resume-examples", label: "Browse resume examples" },
  ];
  return Array.from(new Map(links.map((link) => [link.href, link])).values());
}

function getCollectionPools(cluster: SeoCluster) {
  const pages = CLUSTER_BLUEPRINTS[cluster];
  return new Map<string, string[]>(
    Array.from(new Set(pages.map((page) => page.collection))).map((collection) => [
      collection,
      pages.filter((page) => page.collection === collection).map((page) => page.suffix),
    ]),
  );
}

function relatedFromPool(pool: string[], suffix: string) {
  const start = pool.indexOf(suffix);
  const related: string[] = [];
  for (let offset = 1; related.length < Math.min(5, pool.length - 1); offset += 1) {
    const candidate = pool[(start + offset) % pool.length];
    if (candidate && candidate !== suffix && !related.includes(candidate)) related.push(candidate);
  }
  return related;
}

function buildTable(cluster: SeoCluster, blueprint: TopicBlueprint): SeoTable {
  const copy = CLUSTER_COPY[cluster];
  const terms = blueprint.keywords;
  const rows = [
    [terms[0], `Show ${blueprint.evidence.toLowerCase()}`, "High"],
    [terms[1], `Name the setting, method, or responsibility behind ${terms[1]}`, "High"],
    [terms[2], `Place it beside a concrete project, bullet, or outcome`, "Medium"],
  ];
  if (cluster === "resume-bullet-points") {
    return { title: `${blueprint.label} bullet editing map`, description: "Use the table to move from a duty-only line to evidence a recruiter can scan.", columns: copy.tableColumns, rows: [["Responsible for " + terms[0], `Used ${terms[0]} in a defined workflow`, "Adds ownership"], ["Helped with " + terms[1], `Handled ${terms[1]} while documenting scope`, "Adds context"], ["Worked on " + terms[2], `Improved or delivered a ${terms[2]} process`, "Adds proof"]] };
  }
  return { title: `${blueprint.label} evidence map`, description: `A practical way to connect ${terms.slice(0, 3).join(", ")} to the target application.`, columns: copy.tableColumns, rows };
}

function buildFaq(cluster: SeoCluster, blueprint: TopicBlueprint): SeoFaq[] {
  const copy = CLUSTER_COPY[cluster];
  const first = blueprint.keywords[0];
  return [
    { question: `What should I improve first for ${blueprint.label.toLowerCase()}?`, answer: `Start with ${blueprint.angle}. ${blueprint.evidence} Then compare the change with one real vacancy instead of optimizing for a generic score.` },
    { question: `Which ${blueprint.label.toLowerCase()} resume keywords matter?`, answer: `Use terms that appear in the target job description and that your experience supports. Useful starting points include ${blueprint.keywords.slice(0, 4).join(", ")}; place them beside evidence, not in a detached keyword block.` },
    { question: `How do I show ${first} without exaggerating?`, answer: `Name the responsibility, method, scope, or decision you actually handled. ${blueprint.evidence} A verified metric is useful, but a concrete deliverable or quality check is also valid proof.` },
    { question: `Can CVBoosta compare my resume with a real job?`, answer: `Yes. Start with the resume you already have and paste one real job description. CVBoosta can surface parsing, keyword, and clarity signals; review every suggestion and keep only edits that describe your work truthfully.` },
    { question: `What should I avoid on this ${copy.label.toLowerCase()} page?`, answer: `Avoid keyword stuffing, unsupported metrics, and claims that are larger than your responsibility. The useful outcome is ${copy.outcome}, not a promise of an interview or a private employer ranking.` },
  ];
}

function buildPage(cluster: SeoCluster, blueprint: TopicBlueprint, globalIndex: number): SeoPage {
  const copy = CLUSTER_COPY[cluster];
  const primaryKeyword = clusterKeyword(cluster, blueprint);
  const secondaryKeywords = Array.from(new Set([...
    blueprint.keywords,
    `${blueprint.label.toLowerCase()} resume examples`,
    `${copy.keyword} tool`,
    "ATS resume check",
  ])).slice(0, 8);
  const title = getPageTitle(cluster, blueprint);
  const descriptionPrefix = `${truncateWords(primaryKeyword, 62)}: `;
  const descriptionSuffix = " Use CVboosta to check ATS gaps and improve evidence before applying.";
  const descriptionBudget = Math.max(42, 154 - descriptionPrefix.length - descriptionSuffix.length);
  const descriptionAngle = truncateWords(blueprint.angle, descriptionBudget);
  const description = `${descriptionPrefix}${descriptionAngle}${descriptionAngle.endsWith("...") ? "" : "."}${descriptionSuffix}`;
  const h1 = getPageH1(cluster, blueprint);
  const intro = `${blueprint.label} applications often become difficult to review when ${copy.pain}. This page focuses on one intent: ${blueprint.angle}. ${blueprint.evidence}`;
  const quickAnswer = `${primaryKeyword} means using one real resume and one target vacancy to decide what deserves clearer wording, stronger evidence, or a better position on the page. For ${blueprint.label.toLowerCase()}, prioritize ${blueprint.keywords.slice(0, 3).join(", ")} and keep every claim tied to work you can explain.`;
  const ctas = getCtas(cluster, blueprint, globalIndex);
  const pools = getCollectionPools(cluster);
  const relatedSlugs = relatedFromPool(pools.get(blueprint.collection) || [blueprint.suffix], blueprint.suffix);
  const focus = COMMON_FOCUS[blueprint.pageType] || COMMON_FOCUS.role;
  const mistakes = [
    `Listing ${blueprint.keywords[0]} without showing where it was used`,
    `Repeating ${blueprint.keywords[1]} instead of connecting it to evidence`,
    `Using a claim about ${blueprint.keywords[2]} that is broader than the actual responsibility`,
  ];
  const recommendations = [
    `Put ${blueprint.keywords[0]} near the most relevant experience rather than hiding it in a long list`,
    `Use ${blueprint.keywords[1]} only where the underlying work is true and explain the context`,
    `Make ${blueprint.keywords[2]} visible through a deliverable, decision, scope, or honest metric`,
    "Review every automated suggestion before using it in an application",
  ];
  return {
    cluster,
    slug: blueprint.suffix,
    pageType: blueprint.pageType,
    priorityTier: globalIndex < 100 ? 1 : globalIndex < 300 ? 2 : 3,
    searchIntent: `${copy.verb} a resume for ${blueprint.label.toLowerCase()} search intent`,
    primaryKeyword,
    secondaryKeywords,
    metaTitle: title,
    metaDescription: description,
    h1,
    intro,
    quickAnswer,
    audience: copy.audience,
    painPoint: copy.pain,
    desiredOutcome: copy.outcome,
    sections: [
      { id: "direct-answer", heading: `What to improve for ${blueprint.label}`, paragraphs: [quickAnswer, `${blueprint.evidence} The first edit should make the strongest relevant signal easier to find, not make the resume longer for its own sake.`], bullets: focus },
      { id: "role-or-task-criteria", heading: `${blueprint.label} criteria recruiters can verify`, paragraphs: [`A useful reviewer should be able to identify the target role, the work you actually performed, and the evidence that makes the claim believable. For this page, start with ${blueprint.keywords.slice(0, 3).join(", ")}.`, `If the job description uses different wording, map synonyms carefully. A related phrase can improve retrieval, but it should not change your seniority, tool experience, or ownership.`], bullets: blueprint.keywords.slice(0, 5) },
      { id: "keywords-and-proof", heading: "Keywords and proof", paragraphs: [`Read the vacancy in three passes: responsibilities, required or preferred skills, and outcomes. Then compare those groups with the summary, skills, and recent experience already on your resume.`, `Keep only terminology you can defend. A score or keyword match is a diagnostic, not a hiring probability, and no public page reproduces an employer's private ATS ranking rules.`], bullets: recommendations.slice(0, 3) },
      { id: "workflow", heading: `A practical ${copy.verb} workflow`, paragraphs: [`Start with the current file, add one real vacancy, check the document's reading order, and make the smallest set of changes that improves role fit. Use the product to organize the comparison, then review every suggestion yourself.`, `The final version should still sound like your experience. If a phrase adds a skill, metric, title, or outcome you cannot substantiate, remove it even if it appears in the vacancy.`], bullets: ["Start with the resume you already use", "Separate must-have requirements from optional language", "Improve the most relevant recent evidence first", "Review the final file before applying"] },
      { id: "common-mistakes", heading: `Common mistakes on a ${blueprint.label.toLowerCase()} resume`, paragraphs: [`Most weak applications make the recruiter infer too much. Fix the highest-cost problem first: unclear target, weak proof, unreadable structure, or a mismatch between the claim and the actual work.`], bullets: mistakes },
      { id: "final-checklist", heading: "Final application checklist", paragraphs: [`Before applying, verify the file, the content, and the truthfulness of every suggestion. The checklist below is deliberately practical so the page leads to an action rather than a generic reading experience.`], bullets: ["The target role is clear near the top", `I can point to real evidence for ${blueprint.keywords[0]}`, `The wording supports ${blueprint.keywords[1]} without repetition`, "The document follows the employer's file instructions", "I reviewed the result on a smaller screen and in normal text order"] },
    ],
    dataTables: [buildTable(cluster, blueprint)],
    beforeAfterExamples: [{ label: "Example analysis", before: blueprint.before, after: blueprint.after, explanation: `${blueprint.why} Use only real facts and replace demonstration metrics with your own verified data.` }],
    checklist: [`The ${copy.label.toLowerCase()} review for ${blueprint.label.toLowerCase()} is tied to a target role`, `Relevant ${blueprint.keywords[0]} evidence is easy to find`, "No unsupported skills, metrics, titles, or outcomes were added", "ATS-readable structure and requested file format were checked", "Every suggestion was reviewed before applying"],
    mistakes,
    recommendations,
    faq: buildFaq(cluster, blueprint),
    relatedSlugs,
    crossClusterLinks: [],
    resourceLinks: getResourceLinks(cluster),
    primaryCta: ctas.primary,
    secondaryCta: ctas.secondary,
  };
}

const ALL_BLUEPRINTS = (Object.keys(CLUSTER_BLUEPRINTS) as SeoCluster[]).flatMap((cluster) =>
  CLUSTER_BLUEPRINTS[cluster].map((blueprint) => ({ cluster, blueprint })),
);

export const ALL_SEO_PAGES: SeoPage[] = ALL_BLUEPRINTS.map(({ cluster, blueprint }, index) => buildPage(cluster, blueprint, index));

function buildCrossClusterLinks(page: SeoPage) {
  const links: SeoLink[] = [];
  const sameSlugPages = ALL_SEO_PAGES.filter((candidate) => candidate.slug === page.slug && candidate.cluster !== page.cluster);
  for (const candidate of sameSlugPages) {
    if (links.length >= 4) break;
    links.push({ href: `/${candidate.cluster}/${candidate.slug}`, label: `${candidate.cluster} guide for ${candidate.slug.replace(/-/g, " ")}` });
  }
  const relatedClusters = (Object.keys(HUB_CONFIGS) as SeoCluster[]).filter((cluster) => cluster !== page.cluster);
  for (const cluster of relatedClusters) {
    if (links.length >= 4) break;
    const firstPage = ALL_SEO_PAGES.find((candidate) => candidate.cluster === cluster && candidate.pageType === page.pageType);
    const href = firstPage ? `/${cluster}/${firstPage.slug}` : `/${cluster}`;
    if (!links.some((link) => link.href === href)) {
      links.push({ href, label: firstPage ? `Related ${CLUSTER_COPY[cluster].label.toLowerCase()} guide` : `Explore the ${CLUSTER_COPY[cluster].label.toLowerCase()} hub` });
    }
  }
  return links.slice(0, 4);
}

for (const page of ALL_SEO_PAGES) {
  page.crossClusterLinks = buildCrossClusterLinks(page);
}

export const SEO_CLUSTERS = Object.keys(CLUSTER_COPY) as SeoCluster[];

export function getSeoPages(cluster?: SeoCluster) {
  return cluster ? ALL_SEO_PAGES.filter((page) => page.cluster === cluster) : ALL_SEO_PAGES;
}

export function getEnabledSeoPages(cluster?: SeoCluster) {
  const enabled = new Set(ENABLED_SEO_TIERS);
  return getSeoPages(cluster).filter((page) => enabled.has(page.priorityTier));
}

export function getSeoPage(cluster: SeoCluster, slug: string) {
  return ALL_SEO_PAGES.find((page) => page.cluster === cluster && page.slug === slug);
}

export function getSeoHubConfig(cluster: SeoCluster) {
  return HUB_CONFIGS[cluster];
}

export function getSeoHubFaq(cluster: SeoCluster): SeoFaq[] {
  const copy = CLUSTER_COPY[cluster];
  return [
    { question: `What is a ${copy.keyword}?`, answer: `It is a focused review of one resume element or application decision. The aim is ${copy.outcome}, not a promise of an interview.` },
    { question: `Can I use CVBoosta with my current resume?`, answer: "Yes. Start with the file you already have, add a real target role when relevant, and review every suggestion before applying." },
    { question: "Will optimization add skills or results I do not have?", answer: "It should not. Keep only wording, skills, titles, and metrics that describe facts you can explain and verify." },
    { question: "Should I optimize for an ATS score alone?", answer: "No. ATS signals are useful diagnostics, but a clear document, relevant evidence, and honest role fit still matter to human reviewers." },
    { question: "Where should I start?", answer: `Choose the guide closest to your immediate task, then use CVBoosta to review ${copy.keyword} signals against the application you are preparing.` },
  ];
}

export function getSeoSitemapRoutes() {
  return SEO_CLUSTERS.flatMap((cluster) => [
    `/${cluster}`,
    ...getEnabledSeoPages(cluster).map((page) => `/${cluster}/${page.slug}`),
  ]);
}

export function validateSeoPages(pages: SeoPage[] = ALL_SEO_PAGES) {
  const expected: Record<SeoCluster, number> = {
    "resume-job-description": 160,
    "tailor-resume": 130,
    "resume-bullet-points": 110,
    "resume-summary": 80,
    "resume-skills": 80,
    "resume-achievements": 40,
  };
  if (pages.length !== 600) throw new Error(`SEO validation failed: expected 600 pages, found ${pages.length}.`);
  const assertUnique = (field: keyof Pick<SeoPage, "metaTitle" | "metaDescription" | "h1" | "intro">) => {
    const values = new Map<string, string>();
    for (const page of pages) {
      const previous = values.get(page[field]);
      if (previous) throw new Error(`SEO validation failed: duplicate ${field} on ${previous} and ${page.cluster}/${page.slug}.`);
      values.set(page[field], `${page.cluster}/${page.slug}`);
    }
  };
  assertUnique("metaTitle");
  assertUnique("metaDescription");
  assertUnique("h1");
  assertUnique("intro");
  const pagePaths = new Set([
    ...pages.map((page) => `/${page.cluster}/${page.slug}`),
    ...SEO_CLUSTERS.map((cluster) => `/${cluster}`),
  ]);
  for (const [cluster, count] of Object.entries(expected) as Array<[SeoCluster, number]>) {
    const actual = pages.filter((page) => page.cluster === cluster).length;
    if (actual !== count) throw new Error(`SEO validation failed: ${cluster} expected ${count}, found ${actual}.`);
  }
  const faqSignatures = new Map<string, string>();
  const checklistSignatures = new Map<string, string>();
  for (const page of pages) {
    if (page.sections.length < 5) throw new Error(`SEO validation failed: ${page.cluster}/${page.slug} has fewer than 5 sections.`);
    if (page.dataTables.length < 1) throw new Error(`SEO validation failed: ${page.cluster}/${page.slug} has no table.`);
    if (page.beforeAfterExamples.length < 1) throw new Error(`SEO validation failed: ${page.cluster}/${page.slug} has no before/after.`);
    if (page.checklist.length < 5) throw new Error(`SEO validation failed: ${page.cluster}/${page.slug} has fewer than 5 checklist items.`);
    if (page.faq.length < 5) throw new Error(`SEO validation failed: ${page.cluster}/${page.slug} has fewer than 5 FAQ items.`);
    if (page.relatedSlugs.length < 3 || page.relatedSlugs.length > 6) throw new Error(`SEO validation failed: ${page.cluster}/${page.slug} must have 3–6 related slugs.`);
    if (page.relatedSlugs.includes(page.slug)) throw new Error(`SEO validation failed: self-link in ${page.cluster}/${page.slug}.`);
    if (page.crossClusterLinks.length < 2 || page.crossClusterLinks.length > 4) throw new Error(`SEO validation failed: ${page.cluster}/${page.slug} must have 2–4 cross-cluster links.`);
    for (const slug of page.relatedSlugs) if (!pagePaths.has(`/${page.cluster}/${slug}`)) throw new Error(`SEO validation failed: missing related page ${page.cluster}/${slug}.`);
    for (const link of page.crossClusterLinks) if (!pagePaths.has(link.href)) throw new Error(`SEO validation failed: invalid cross-cluster link ${link.href}.`);
    for (const cta of [page.primaryCta, page.secondaryCta]) if (!COMMON_PRODUCT_LINKS.some((link) => link.href === cta.href)) throw new Error(`SEO validation failed: invalid CTA ${cta.href}.`);
    const faqSignature = JSON.stringify(page.faq);
    if (faqSignatures.has(faqSignature)) throw new Error(`SEO validation failed: duplicate FAQ set on ${faqSignatures.get(faqSignature)} and ${page.cluster}/${page.slug}.`);
    faqSignatures.set(faqSignature, `${page.cluster}/${page.slug}`);
    const checklistSignature = JSON.stringify(page.checklist);
    if (checklistSignatures.has(checklistSignature)) throw new Error(`SEO validation failed: duplicate checklist on ${checklistSignatures.get(checklistSignature)} and ${page.cluster}/${page.slug}.`);
    checklistSignatures.set(checklistSignature, `${page.cluster}/${page.slug}`);
    const tableSignature = JSON.stringify(page.dataTables);
    const exampleSignature = JSON.stringify(page.beforeAfterExamples);
    if (pages.filter((other) => JSON.stringify(other.dataTables) === tableSignature).length > 1) throw new Error(`SEO validation failed: duplicate table on ${page.cluster}/${page.slug}.`);
    if (pages.filter((other) => JSON.stringify(other.beforeAfterExamples) === exampleSignature).length > 1) throw new Error(`SEO validation failed: duplicate before/after on ${page.cluster}/${page.slug}.`);
  }
  for (const cluster of SEO_CLUSTERS) {
    const seen = new Set<string>();
    for (const page of pages.filter((item) => item.cluster === cluster)) {
      if (seen.has(page.slug)) throw new Error(`SEO validation failed: duplicate slug ${cluster}/${page.slug}.`);
      seen.add(page.slug);
    }
  }
}

validateSeoPages();
