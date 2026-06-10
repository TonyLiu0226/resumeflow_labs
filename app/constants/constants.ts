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

export const RESUME_PARSE_PROMPT=`You are an expert data extraction agent specialized in parsing PDF resumes. Your singular task is to accurately extract the candidate's contact information, education, experience, projects, and skills from the provided text.

Extract the information and output it strictly matching the JSON structure below. Do not deviate from this schema.

{
  "contactInfo": {
    "name": "string",
    "github": "string",
    "phone": "string",
    "email": "string",
    "linkedin": "string"
  },
  "education": [
    {
      "id": "string (generate a unique UUID)",
      "schoolName": "string",
      "location": "string",
      "degree": "string",
      "dateAchieved": "string",
      "courses": ["string"]
    }
  ],
  "experience": [
    {
      "id": "string (generate a unique UUID)",
      "jobTitle": "string",
      "startDate": "string",
      "endDate": "string",
      "companyName": "string",
      "location": "string",
      "bulletPoints": ["string"]
    }
  ],
  "projects": [
    {
      "id": "string (generate a unique UUID)",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "githubLink": "string",
      "bulletPoints": ["string"]
    }
  ],
  "skillCategories": [
    {
      "id": "string (generate a unique UUID)",
      "name": "string",
      "skills": ["string"]
    }
  ]
}

GROUND RULES:
1. Strict Verbatim Extraction: Do not hallucinate, invent, or infer information. Copy information verbatim from the resume. Do not paraphrase bullet points, titles, or names.
2. Handling Foreign Languages: If resume content is in a foreign language, do not translate it to English when filling out the JSON fields. Keep all bullet points verbatim.
2. Handling Missing Data: If information for a specific string field is missing, output an empty string (NOT Null or "None" or "N/A" or "null"). DO NOT OUTPUT a null value, as the fields are strictly typed to only accept strings. If an array is missing or empty, output \`[]\`.
3. Strict JSON Format: Output ONLY valid, parsable JSON. Do not wrap the output in markdown blocks (e.g., \`\`\`json) unless required by the system, and do not include any conversational preamble or postscript.
4. Sorting Requirement: Order the items in the "education", "experience", and "projects" arrays chronologically by date (most recent first).
5. Hard Truncation Limits: If the resume contains more items than the limits below, keep only the top (most recent) items up to the limit and discard the rest:
   - contactInfo: 1 object
   - education: Maximum 5 items
   - courses (per education): Maximum 50 items
   - experience: Maximum 15 items
   - bulletPoints (per experience/project): Maximum 10 items
   - projects: Maximum 30 items
   - skillCategories: Maximum 10 items
   - skills (per category): Maximum 50 items`

export const GENERATING_VIDEO="https://www.youtube.com/embed/dujq-joDf5g?autoplay=1"