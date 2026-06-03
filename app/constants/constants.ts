export const MAX_CATEGORIES = 10;
export const MAX_SKILLS_PER_CATEGORY = 50;
export const MAX_TOTAL_SKILLS = 100;

export const MAX_EXPERIENCES = 15;
export const MAX_BULLETS_PER_EXPERIENCE = 10;

export const MAX_PROJECTS = 30;
export const MAX_BULLETS_PER_PROJECT = 10;

export const MAX_EDUCATIONS = 5;
export const MAX_COURSES_PER_EDUCATION = 50;

export const PROJECT_BULLET_GENERATOR_PROMPT = `You are a resume recruiter critiquing and fine-tuning resume bullet points. For the bullet point provided, please reformat it in a way such that it highlights the impact and achievement of the work done, rather than sounding like a chore or job description. Bullet points should be formatted as such:


Accomplished X as measured by Y by doing Z

OR

Did X using Y to accomplish Z

OR

Accomplished X using Y to implement the project feature/goal Z


- Use action verbs to start off each resume bullet point, such as "Developed", "Negotiated", "Led", "Built", "Engineered", "Created", "Managed"

- Quantify results where appropriate using reliable and reasonable metrics, such as numbers or percentages

- Focus on how the metrics were obtained. What specific actions were taken to result in said metrics?

- Keep bullet points concise where possible. Ideally around 20-30 words.

Please only output the suggested bullet point in plaintext. No other text or formatting.`

export const RESUME_BULLET_GENERATOR_PROMPT = `You are a resume recruiter critiquing and fine-tuning resume bullet points. For the bullet point provided, please reformat it in a way such that it highlights the impact and achievement of the work done, rather than sounding like a chore or job description. Bullet points should be formatted as such:


Accomplished X as measured by Y by doing Z

OR

Did X using Y to accomplish Z


- Use action verbs to start off each resume bullet point, such as "Developed", "Negotiated", "Led", "Built", "Engineered", "Created", "Managed"

- Quantify results using reliable and reasonable metrics, such as numbers or percentages

- Focus on how the metrics were obtained. What specific actions were taken to result in said metrics?

- Keep bullet points concise where possible. Ideally around 20-30 words.

Please only output the suggested bullet point in plaintext. No other text or formatting.`

export const KEYWORD_TAILORING_PROMPT = `You are an information extraction engine specialized in analyzing job descriptions.

Your task is to read a provided job description and extract the most important keywords related to candidate qualifications, with a strong focus on skills that should be prioritized when evaluating or tailoring a job application.

Rules:
1. Extract only keywords and short phrases that are directly supported by the job description.
2. Prioritize concrete, job-relevant skills over generic business language.
3. Do not prioritize vague phrases such as:
- fast-paced environment
- team player
- self-starter
- dynamic workplace
unless they clearly map to a concrete evaluative skill such as communication, leadership, or cross-functional collaboration.
4. For each keyword, assign:
   - importance_level: High, Medium, Low
5. Prefer short standardized keyword forms:
   - "JavaScript" instead of "strong JavaScript programming abilities"
   - "Project Management" instead of "ability to manage projects effectively"
6. Merge duplicates and normalize similar terms.
7. Do not invent qualifications that are not explicitly stated or strongly implied.
8. Ignore filler phrases unless they reflect a meaningful skill or expectation.
9. If a requirement appears multiple times or is emphasized strongly, treat it as more important.
11. Output the results in strict JSON. DO NOT include any other text or information, ONLY return the JSON.

Output format:
{
  "job_title": "string",
  "keywords": {
    "technical_skills": [
      {
        "keyword": "string",
        "importance_level": "High|Medium|Low",
      }
    ],
  },
  "top_priority_keywords": [
    "keyword1",
    "keyword2",
    "keyword3"
  ]
}`