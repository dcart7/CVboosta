export type BlogSection = {
  title: string;
  body: string;
};

export type BlogPost = {
  slug: string;
  publishAt: string; // YYYY-MM-DD
  title: string;
  excerpt: string;
  lead: string;
  tags: string[];
  sections: BlogSection[];
  takeawayTitle: string;
  takeawayBody: string;
  translationArticleKey?: "tailor" | "mistakes" | "score";
  translationPostKey?: "tailor" | "mistakes" | "score";
};

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "tailor-resume-to-job-description",
    publishAt: "2026-04-21",
    title: "How to Tailor Resume to Job Description",
    excerpt:
      "A practical step-by-step method to adapt your resume for each role without keyword stuffing.",
    lead: "Tailoring your resume is about relevance, not rewriting everything from scratch.",
    tags: ["ATS", "CV"],
    translationArticleKey: "tailor",
    translationPostKey: "tailor",
    sections: [
      {
        title: "1) Extract the role priorities",
        body: "Read the job description and list repeated skills, tools, and outcomes. These repeated signals are what ATS and recruiters focus on first.",
      },
      {
        title: "2) Align your strongest evidence",
        body: "For each priority, map a real example from your experience. Update summary, skills, and bullet points so the match is obvious in the first scan.",
      },
      {
        title: "3) Keep wording clear and truthful",
        body: "Use the employer's terminology where accurate, but avoid copying whole sentences. Your goal is precise alignment, not artificial keyword stuffing.",
      },
    ],
    takeawayTitle: "Key takeaway",
    takeawayBody:
      "A tailored resume wins by showing direct role fit with credible evidence and clear wording.",
  },
  {
    slug: "ats-resume-mistakes",
    publishAt: "2026-04-21",
    title: "Top ATS Resume Mistakes to Avoid",
    excerpt:
      "The most common formatting and content mistakes that cause ATS rejection or low match scores.",
    lead: "Most ATS failures come from avoidable structure and wording issues.",
    tags: ["ATS", "CV"],
    translationArticleKey: "mistakes",
    translationPostKey: "mistakes",
    sections: [
      {
        title: "1) Overdesigned layouts",
        body: "Complex columns, tables, and visual-heavy templates can hide important text from ATS parsing. Keep structure simple and readable.",
      },
      {
        title: "2) Weak keyword alignment",
        body: "If your resume does not reflect the core terms from the job description, your match score drops even when experience is relevant.",
      },
      {
        title: "3) Vague bullet points",
        body: "Bullets like 'responsible for' do not show impact. Use action verbs, measurable outcomes, and role-relevant language.",
      },
    ],
    takeawayTitle: "Key takeaway",
    takeawayBody:
      "Use a clean format, role-specific keywords, and quantified achievements to avoid ATS rejection.",
  },
  {
    slug: "improve-ats-resume-score",
    publishAt: "2026-04-21",
    title: "How to Improve ATS Resume Score",
    excerpt:
      "Use this checklist to increase ATS alignment with stronger keywords, structure, and impact bullets.",
    lead: "Improving ATS score is a process you can systematize in every application.",
    tags: ["ATS", "Optimization"],
    translationArticleKey: "score",
    translationPostKey: "score",
    sections: [
      {
        title: "1) Match keywords by section",
        body: "Place critical role keywords in summary, skills, and recent experience. This helps ATS confirm relevance quickly.",
      },
      {
        title: "2) Strengthen impact bullets",
        body: "Each bullet should show action + context + result. Numbers and scope increase both ATS confidence and recruiter trust.",
      },
      {
        title: "3) Run a final relevance pass",
        body: "Before submitting, compare your resume against role requirements one more time and close the biggest gaps first.",
      },
    ],
    takeawayTitle: "Key takeaway",
    takeawayBody:
      "Higher ATS score comes from clear role alignment, measurable impact, and disciplined final review.",
  },
  {
    slug: "resume-summary-for-career-switch",
    publishAt: "2026-04-23",
    title: "Resume Summary for Career Switch: A Fast Formula",
    excerpt:
      "How to write a transition-friendly summary that keeps your strengths while aligning to a new role.",
    lead: "Career switch resumes win when they frame transferability before job titles.",
    tags: ["Career", "Tips"],
    sections: [
      {
        title: "1) Start with target-role language",
        body: "Name the role you are moving into and list 2-3 relevant capabilities. This helps ATS and recruiters instantly understand your direction.",
      },
      {
        title: "2) Add proof from your previous field",
        body: "Use one line with a measurable result from your prior experience that maps to your new target role.",
      },
      {
        title: "3) Use CVboosta to tighten wording",
        body: "Paste your summary draft, run analysis, and refine missing role terms in one pass to improve alignment score.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "A good career-switch summary is specific, role-focused, and evidence-based.",
  },
  {
    slug: "quantify-achievements-resume",
    publishAt: "2026-04-26",
    title: "How to Quantify Achievements on Your Resume",
    excerpt:
      "A practical framework for turning generic bullets into quantified impact statements.",
    lead: "Numbers make your experience easier to trust and easier to compare.",
    tags: ["Metrics", "Tips"],
    sections: [
      {
        title: "1) Add a baseline and outcome",
        body: "Whenever possible, show where things started and where they ended after your contribution.",
      },
      {
        title: "2) Use range when exact numbers are confidential",
        body: "You can still be credible with ranges like 15-20% or 30k-40k monthly users.",
      },
      {
        title: "3) Recheck relevance in CVboosta",
        body: "After adding metrics, rerun optimization to make sure impact bullets also include keywords from the vacancy.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Strong bullets combine action, context, and measurable outcome.",
  },
  {
    slug: "cvboosta-keyword-extractor-workflow",
    publishAt: "2026-04-28",
    title: "CVboosta Workflow: Keyword Extraction in 5 Minutes",
    excerpt:
      "A repeatable mini-routine to extract and prioritize keywords before rewriting your CV.",
    lead: "Keyword extraction should be fast, focused, and tied to role priorities.",
    tags: ["CVboosta", "How-to"],
    sections: [
      {
        title: "1) Paste the full vacancy text",
        body: "Short summaries miss important terms. Use full descriptions so the model can detect repeated skills and requirements.",
      },
      {
        title: "2) Group terms by priority",
        body: "Split keywords into must-have, nice-to-have, and domain terms. This keeps edits strategic.",
      },
      {
        title: "3) Update CV sections in order",
        body: "Start from summary, then skills, then recent experience. This order usually brings the largest score gain first.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Prioritized keywords beat random keyword stuffing every time.",
  },
  {
    slug: "how-to-write-strong-bullets-fast",
    publishAt: "2026-05-01",
    title: "How to Write Strong Resume Bullets Fast",
    excerpt:
      "Use a simple template to produce high-quality bullets in minutes, not hours.",
    lead: "Speed matters when you apply to multiple roles each week.",
    tags: ["Productivity", "Tips"],
    sections: [
      {
        title: "1) Use the A-C-R model",
        body: "Write each bullet as Action + Context + Result. This keeps writing concise and high signal.",
      },
      {
        title: "2) Keep one idea per bullet",
        body: "If a bullet has multiple outcomes, split it. ATS and recruiters parse shorter units better.",
      },
      {
        title: "3) Use CVboosta as final editor",
        body: "Generate a draft quickly, then let CVboosta tighten phrasing and align it to the job description terms.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "A repeatable bullet template removes writing friction and improves clarity.",
  },
  {
    slug: "ats-friendly-resume-format-checklist",
    publishAt: "2026-05-03",
    title: "ATS-Friendly Resume Format Checklist",
    excerpt:
      "A formatting checklist to avoid parsing issues and improve ATS readability.",
    lead: "Formatting mistakes can hide your best experience from automated systems.",
    tags: ["ATS", "Checklist"],
    sections: [
      {
        title: "1) Keep layout single-column",
        body: "Use a clean one-column layout with clear headings and consistent spacing.",
      },
      {
        title: "2) Avoid text in images",
        body: "ATS cannot reliably parse text embedded in graphics, icons, or fancy visual blocks.",
      },
      {
        title: "3) Export and test",
        body: "Upload your final file to CVboosta and verify that sections, skills, and bullets are parsed correctly.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Readable structure is the foundation of every high-scoring resume.",
  },
  {
    slug: "cvboosta-score-to-interview-plan",
    publishAt: "2026-05-06",
    title: "From CVboosta Score to Interview Plan",
    excerpt:
      "How to use optimization results to prepare smarter interview answers.",
    lead: "Your resume gaps can become your interview preparation roadmap.",
    tags: ["Interview", "CVboosta"],
    sections: [
      {
        title: "1) Review missing keyword clusters",
        body: "These clusters show where recruiters might challenge your fit. Turn each one into an interview story.",
      },
      {
        title: "2) Use recommendations as prep prompts",
        body: "Each recommendation can become a STAR answer outline with action and measurable impact.",
      },
      {
        title: "3) Generate interview questions",
        body: "Use the Interview Prep feature after optimization to train on role-specific weak points.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Resume optimization is not only for ATS, it also sharpens interview readiness.",
  },
  {
    slug: "no-experience-resume-ats-tips",
    publishAt: "2026-05-08",
    title: "No Experience Resume: ATS Tips That Actually Work",
    excerpt:
      "How students and juniors can increase relevance without exaggerating experience.",
    lead: "You can be competitive without years of professional history.",
    tags: ["Junior", "ATS"],
    sections: [
      {
        title: "1) Convert projects into role evidence",
        body: "Describe personal, academic, and freelance work with clear tools, tasks, and outcomes.",
      },
      {
        title: "2) Use skills with context",
        body: "List tools and add one short proof line of where and how you used each skill.",
      },
      {
        title: "3) Optimize per vacancy",
        body: "Upload each role description to CVboosta and tune your summary and projects to match priority terms.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Relevance beats seniority when your evidence is specific and aligned.",
  },
  {
    slug: "resume-skills-section-that-gets-matches",
    publishAt: "2026-05-11",
    title: "Build a Skills Section That Gets More Matches",
    excerpt:
      "A practical way to structure skills so ATS systems and recruiters can scan quickly.",
    lead: "Random skill lists lower clarity and miss role intent.",
    tags: ["Skills", "ATS"],
    sections: [
      {
        title: "1) Group by capability, not alphabet",
        body: "Use groups like Analytics, Product, Design, and Communication to improve signal density.",
      },
      {
        title: "2) Mirror job description language",
        body: "When accurate, use the same wording found in the vacancy for stronger match confidence.",
      },
      {
        title: "3) Keep only supported skills",
        body: "If you cannot prove a skill in experience bullets, remove it or lower its priority.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "A focused, evidence-backed skills section improves both ATS and human review.",
  },
  {
    slug: "cvboosta-before-after-review-method",
    publishAt: "2026-05-13",
    title: "CVboosta Before/After Review Method",
    excerpt:
      "Use a structured comparison approach to evaluate if optimization really improved your CV.",
    lead: "Good optimization is measurable and visible in each section.",
    tags: ["CVboosta", "Workflow"],
    sections: [
      {
        title: "1) Compare summary first",
        body: "Check if your summary now states target role, domain context, and strongest outcomes more clearly.",
      },
      {
        title: "2) Compare top 5 bullets",
        body: "Verify that the rewritten bullets include stronger verbs, better metrics, and role terms.",
      },
      {
        title: "3) Track score and confidence",
        body: "Save results to history and monitor whether repeated edits improve overall fit and missing keyword count.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Before/after review prevents cosmetic edits and keeps optimization outcome-driven.",
  },
  {
    slug: "cover-letter-from-cvboosta-results",
    publishAt: "2026-05-16",
    title: "Generate Better Cover Letters from CVboosta Results",
    excerpt:
      "Turn your optimized CV insights into targeted cover letters with less effort.",
    lead: "A strong cover letter should echo the same role priorities as your resume.",
    tags: ["Cover Letter", "CVboosta"],
    sections: [
      {
        title: "1) Start from optimized highlights",
        body: "Use your best 2-3 impact bullets from the optimized CV as proof paragraphs in the letter.",
      },
      {
        title: "2) Align with job priorities",
        body: "Address the top requirements from the vacancy, not generic motivation text.",
      },
      {
        title: "3) Keep it concise and specific",
        body: "Aim for clear role fit in under one page and avoid repeating your full resume.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "When resume and cover letter share the same evidence, your application feels coherent.",
  },
  {
    slug: "optimize-resume-for-remote-jobs",
    publishAt: "2026-05-18",
    title: "How to Optimize a Resume for Remote Jobs",
    excerpt:
      "Highlight async communication, ownership, and delivery habits that remote teams value.",
    lead: "Remote hiring often prioritizes collaboration quality as much as technical skills.",
    tags: ["Remote", "Tips"],
    sections: [
      {
        title: "1) Show async collaboration examples",
        body: "Mention tools and workflows that prove you can move work forward without constant meetings.",
      },
      {
        title: "2) Add ownership outcomes",
        body: "Use bullets that show independent decision-making, execution, and measurable delivery.",
      },
      {
        title: "3) Tailor to remote-friendly keywords",
        body: "Use CVboosta to align your wording with remote role language such as distributed teams and async execution.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Remote-fit resumes combine delivery metrics with collaboration evidence.",
  },
  {
    slug: "avoid-rejection-with-final-qa-pass",
    publishAt: "2026-05-21",
    title: "Final QA Pass: Avoid Resume Rejection Before Submit",
    excerpt:
      "A 10-minute quality check to catch mistakes that hurt ATS score and recruiter trust.",
    lead: "Small final checks can protect hours of work and increase response rate.",
    tags: ["Checklist", "QA"],
    sections: [
      {
        title: "1) Validate formatting and headings",
        body: "Check section names, spacing, and consistency so ATS parsing remains stable.",
      },
      {
        title: "2) Verify facts and dates",
        body: "Ensure timeline, roles, and metrics are accurate. Credibility issues quickly reduce trust.",
      },
      {
        title: "3) Re-run CVboosta score check",
        body: "After final edits, run one more analysis to confirm you did not remove important role keywords.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Final QA protects both relevance and credibility right before submission.",
  },
  {
    slug: "cvboosta-multi-role-versioning",
    publishAt: "2026-05-23",
    title: "Multi-Role Resume Versioning with CVboosta",
    excerpt:
      "How to maintain different resume versions for different job families without chaos.",
    lead: "One universal resume usually underperforms across distinct role types.",
    tags: ["CVboosta", "Workflow"],
    sections: [
      {
        title: "1) Define your core role clusters",
        body: "For example: Product Manager, Operations Manager, and Growth. Create one base version for each cluster.",
      },
      {
        title: "2) Save optimized outputs per cluster",
        body: "Use history to keep track of versions and avoid mixing unrelated keyword strategies.",
      },
      {
        title: "3) Do light per-vacancy tailoring",
        body: "Keep 80% stable and adapt the top 20%: summary, skills order, and first bullets.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Versioning gives speed and relevance at the same time.",
  },
  {
    slug: "resume-metrics-cheat-sheet",
    publishAt: "2026-05-26",
    title: "Resume Metrics Cheat Sheet by Role Type",
    excerpt:
      "A quick guide to choosing metrics that make your bullets more persuasive.",
    lead: "Not all metrics are equal; relevance depends on role context.",
    tags: ["Metrics", "Cheat Sheet"],
    sections: [
      {
        title: "1) Product roles",
        body: "Use adoption, retention, conversion, activation, and delivery cycle metrics.",
      },
      {
        title: "2) Marketing roles",
        body: "Show CAC, ROAS, CTR, revenue growth, and funnel conversion outcomes.",
      },
      {
        title: "3) Operations roles",
        body: "Highlight cost savings, process time reduction, SLA improvement, and error-rate reduction.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Pick metrics that hiring managers in your target role already care about.",
  },
  {
    slug: "improve-linkedin-using-cvboosta-output",
    publishAt: "2026-05-28",
    title: "Improve LinkedIn Profile Using CVboosta Output",
    excerpt:
      "Repurpose optimized CV content into a stronger LinkedIn headline and about section.",
    lead: "Your LinkedIn and resume should reinforce each other with consistent positioning.",
    tags: ["LinkedIn", "CVboosta"],
    sections: [
      {
        title: "1) Use summary as profile foundation",
        body: "Adapt your optimized resume summary into a concise LinkedIn About block with role keywords.",
      },
      {
        title: "2) Transfer top impact bullets",
        body: "Select 3-5 strongest bullets and adapt them to profile experience entries.",
      },
      {
        title: "3) Keep language consistent",
        body: "If your CV says one role story and LinkedIn says another, trust drops. Keep core narrative aligned.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Consistent cross-channel positioning strengthens your professional brand.",
  },
  {
    slug: "tailor-resume-for-product-manager-role",
    publishAt: "2026-05-31",
    title: "Tailor a Resume for Product Manager Roles",
    excerpt:
      "What PM hiring teams look for and how to reflect it in ATS-friendly language.",
    lead: "PM resumes perform better when they balance product thinking and execution evidence.",
    tags: ["Product", "ATS"],
    sections: [
      {
        title: "1) Show business + user impact",
        body: "Include outcomes tied to both customer value and business KPIs.",
      },
      {
        title: "2) Show cross-functional leadership",
        body: "Demonstrate collaboration with design, engineering, analytics, and stakeholders.",
      },
      {
        title: "3) Map to role keywords",
        body: "Use vacancy-specific PM terms through CVboosta optimization before each application.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Strong PM resumes connect strategy, execution, and measurable outcomes.",
  },
  {
    slug: "weekly-resume-routine-with-cvboosta",
    publishAt: "2026-06-02",
    title: "Weekly Resume Routine with CVboosta",
    excerpt:
      "A lightweight weekly system for people applying to multiple jobs consistently.",
    lead: "Consistency compounds, especially in competitive job markets.",
    tags: ["Routine", "CVboosta"],
    sections: [
      {
        title: "1) Monday: pick target roles",
        body: "Collect 3-5 vacancies and extract priorities with CVboosta in one focused session.",
      },
      {
        title: "2) Wednesday: tailor and QA",
        body: "Adapt your main version for each role and run a quick quality pass.",
      },
      {
        title: "3) Friday: review outcomes",
        body: "Track response quality and update your base version with the best-performing edits.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "A simple weekly loop creates better applications with less stress.",
  },
  {
    slug: "resume-keywords-without-stuffing",
    publishAt: "2026-06-05",
    title: "Use Resume Keywords Without Keyword Stuffing",
    excerpt:
      "How to keep ATS alignment high while preserving natural, human-readable language.",
    lead: "Keyword quality beats keyword quantity when recruiters read your CV.",
    tags: ["Keywords", "ATS"],
    sections: [
      {
        title: "1) Place terms where they naturally fit",
        body: "Use role terms in summary, skills, and impact bullets only when supported by your experience.",
      },
      {
        title: "2) Prefer semantic variety",
        body: "Related terms and context-rich phrasing can reinforce relevance without repetition.",
      },
      {
        title: "3) Validate readability",
        body: "After optimization in CVboosta, read the resume out loud and remove awkward repeated phrasing.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Natural language plus relevant terms is the best ATS/human balance.",
  },
  {
    slug: "how-to-prioritize-job-applications",
    publishAt: "2026-06-07",
    title: "How to Prioritize Job Applications for Better Results",
    excerpt:
      "A scoring method to decide where to invest deep tailoring effort each week.",
    lead: "Not every vacancy deserves the same time investment.",
    tags: ["Strategy", "Tips"],
    sections: [
      {
        title: "1) Score fit in three dimensions",
        body: "Rate each role for skill match, domain familiarity, and motivation level on a 1-5 scale.",
      },
      {
        title: "2) Deep-tailor top opportunities",
        body: "Spend full optimization effort on roles with highest combined score.",
      },
      {
        title: "3) Use lighter versions for lower-fit roles",
        body: "Apply with a stable base version and only minimal edits to maintain volume.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "Prioritization improves both conversion rate and energy management.",
  },
  {
    slug: "cvboosta-history-for-continuous-improvement",
    publishAt: "2026-06-10",
    title: "Use CVboosta History for Continuous Improvement",
    excerpt:
      "Turn your saved optimization history into a data-driven improvement system.",
    lead: "History is valuable only when you review and act on patterns.",
    tags: ["CVboosta", "Data"],
    sections: [
      {
        title: "1) Track what changes improved score",
        body: "Look for repeated edits that reliably increase fit, especially in summary and top experience bullets.",
      },
      {
        title: "2) Build your personal edit playbook",
        body: "Document 5-7 edits that work best for your profile and reuse them each week.",
      },
      {
        title: "3) Retire low-impact edits",
        body: "If an edit never affects fit or readability, remove it from your routine and focus on high-yield work.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "History review turns random iteration into a strategic process.",
  },
  {
    slug: "application-checklist-before-click-submit",
    publishAt: "2026-06-12",
    title: "Application Checklist Before You Click Submit",
    excerpt:
      "A final checklist to improve application quality and reduce avoidable mistakes.",
    lead: "A calm final check can improve outcomes more than another rewrite.",
    tags: ["Checklist", "Tips"],
    sections: [
      {
        title: "1) Confirm role-title consistency",
        body: "Ensure your summary, CV filename, and application fields point to the same target role.",
      },
      {
        title: "2) Confirm links and contact info",
        body: "Test LinkedIn, portfolio, and email data on mobile and desktop.",
      },
      {
        title: "3) Confirm final ATS alignment",
        body: "Run one last CVboosta analysis to check missing keywords and make only essential updates.",
      },
    ],
    takeawayTitle: "Tip",
    takeawayBody:
      "A reliable submit checklist protects your conversion from small errors.",
  },
];

function getCurrentDateKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function isPostPublished(post: BlogPost, now: Date = new Date()): boolean {
  return post.publishAt <= getCurrentDateKey(now);
}

export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishAt.localeCompare(a.publishAt));
}

export function getPublishedBlogPosts(now: Date = new Date()): BlogPost[] {
  return getAllBlogPosts().filter((post) => isPostPublished(post, now));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
