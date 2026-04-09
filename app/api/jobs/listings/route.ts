import { NextResponse } from "next/server";

const JOB_LISTINGS = [
  {
    id: "listing-1",
    company: "Macrohard",
    jobTitle: "Software Engineer, Frontend",
    location: "Mountain View, CA",
    description: `About the job
We're looking for a Software Engineer to join our Frontend team and help build something that can rival Microsoft using only AI agents.

Responsibilities:
• Design and implement user-facing features using modern web technologies
• Collaborate with UX designers and product managers to deliver polished experiences
• Write clean, well-tested, and performant JavaScript/TypeScript code
• Participate in code reviews and contribute to engineering best practices
• Optimize applications for speed and scalability

Qualifications:
• Bachelor's degree in Computer Science or equivalent practical experience
• 2+ years of experience with JavaScript/TypeScript and modern frameworks (React, Angular, or Vue)
• Strong understanding of HTML, CSS, and responsive design
• Experience with RESTful APIs and state management libraries
• Familiarity with testing frameworks (Jest, Cypress, or similar)

Preferred qualifications:
• Experience with Next.js or server-side rendering
• Knowledge of web performance optimization techniques
• Contributions to open-source projects`,
    applyUrl: "https://x.com",
    postedDate: "2026-04-01",
  },
  {
    id: "listing-2",
    company: "Nutanix",
    jobTitle: "Full Stack Developer",
    location: "Vancouver, BC",
    description: `About the role
In this role, you will report to the Manager of Hybrid Cloud Infrastructure. Our work setup is hybrid, requiring you to be on-site three days a week while giving you the flexibility to work remotely for the remaining days. Travel commitments are very minimal, as they are not a primary aspect of the role and will only occasionally arise as needed for collaboration or specific events.
Your Role

    Ensure the 24/7 availability and reliability of Nutanix's cloud services and infrastructure.
    Respond promptly to alerts and support tickets, troubleshooting and resolving issues effectively.
    Collaborate with QA, Development, and Infrastructure teams to design and implement robust monitoring solutions.
    Manage deployment of software patches, upgrades, and administrative tools to maintain system integrity.
    Participate in on-call rotation to provide after-hours support and maintain service level agreements (SLAs).
    Develop and enhance automation scripts using languages like Python or Bash for operational efficiency.
    Document processes and procedures for knowledge sharing and continuous improvement within the team.
    Achieve first-year objectives by streamlining incident response processes and enhancing system monitoring capabilities.

What You Will Bring

    Proficiency in Linux/UNIX system administration with advanced troubleshooting skills.
    Strong scripting capabilities in languages such as Python and Bash.
    Experience in a 24/7 NOC environment, preferably with a cloud service provider.
    Solid understanding of cloud infrastructure components (firewalls, load balancers, DNS, etc.).
    Knowledge of cloud technologies and architectures, especially in SaaS environments.
    3-5 years of hands-on experience with Nutanix AOS, AHV, and Prism Central, OR VMware/Proxmox/KVM.
    Excellent problem-solving abilities and strong communication skills.
    A relevant degree in Computer Science, Information Technology, or a related field is preferred.`,
    applyUrl: "https://careers.nutanix.com",
    postedDate: "2026-03-28",
  },
  {
    id: "listing-3",
    company: "VMWare",
    jobTitle: "Backend Engineer, Payments",
    location: "Vancouver, BC",
    description: `About VMWare
VMWare is a leading provider of virtualization software and solutions. We are looking for a Backend Engineer to help build the next generation of virtualization software.

Who you are:
• 3+ years of backend engineering experience
• Strong proficiency in Ruby, Java, Go, or Python
• Experience designing and operating distributed systems
• Understanding of database internals and query optimization
• Passion for building reliable, well-documented APIs

Bonus points:
• Experience in the payments or fintech industry
• Knowledge of PCI compliance and security best practices
• Experience with event-driven architectures`,
    applyUrl: "https://www.vmware.com/careers.html",
    postedDate: "2026-04-03",
  },
  {
    id: "listing-4",
    company: "Netflix",
    jobTitle: "Senior UI Engineer",
    location: "Los Gatos, CA (Remote)",
    description: `The Opportunity
Netflix is looking for a Senior UI Engineer to help shape the future of entertainment. You'll work on the streaming experience used by 250M+ members worldwide.

Responsibilities:
• Build high-performance UI components for the Netflix web player and browse experience
• Develop A/B testing frameworks for UI experiments at scale
• Collaborate with designers to implement pixel-perfect, accessible interfaces
• Optimize rendering performance and reduce time-to-interactive
• Contribute to Netflix's open-source UI libraries

Requirements:
• 5+ years of experience in frontend/UI engineering
• Expert-level knowledge of React and modern JavaScript
• Deep understanding of browser rendering, layout, and performance
• Experience with server-side rendering and streaming architectures
• Track record of shipping high-quality products to millions of users

We'd love it if you also have:
• Experience with WebGL, Canvas, or animation libraries
• Knowledge of video streaming technologies (HLS, DASH)
• Background in accessibility (WCAG) and internationalization`,
    applyUrl: "https://jobs.netflix.com",
    postedDate: "2026-04-05",
  },
  {
    id: "listing-5",
    company: "Shopify",
    jobTitle: "Developer, React Native",
    location: "Toronto, Canada (Remote)",
    description: `About the role
Shopify powers over 2 million businesses worldwide. We're looking for a React Native developer to help build the mobile commerce experiences that empower entrepreneurs.

What you'll work on:
• Build and maintain the Shopify mobile app used by millions of merchants
• Develop shared components and libraries across iOS and Android
• Integrate native platform features with React Native bridges
• Implement offline-first patterns for reliable mobile experiences
• Collaborate with product, design, and backend teams

What you bring:
• 2+ years of experience with React Native
• Strong JavaScript/TypeScript fundamentals
• Experience with mobile development patterns and lifecycle
• Understanding of native build tools (Xcode, Android Studio)
• Familiarity with mobile CI/CD and app store deployment

Great to have:
• Experience with native iOS (Swift) or Android (Kotlin) development
• Knowledge of GraphQL and Apollo Client
• Contributions to the React Native ecosystem`,
    applyUrl: "https://www.shopify.com/careers",
    postedDate: "2026-03-25",
  },
  {
    id: "listing-6",
    company: "Datadog",
    jobTitle: "Software Engineer, Observability",
    location: "New York, NY",
    description: `About Datadog
Datadog is the monitoring and analytics platform for cloud-scale infrastructure and applications.

The role:
Join our Observability team to build the tools that help engineering teams understand and debug their systems at scale.

What you'll do:
• Design and build data ingestion pipelines processing trillions of events per day
• Develop query engines for real-time analytics across massive datasets
• Create intuitive dashboards and visualization tools
• Work on distributed tracing and log management systems
• Optimize storage and retrieval of time-series data

Requirements:
• BS/MS in Computer Science or equivalent experience
• 2+ years of experience building backend systems
• Proficiency in Go, Python, or Java
• Experience with large-scale data processing systems
• Understanding of distributed systems concepts

Preferred:
• Experience with time-series databases or columnar storage
• Knowledge of Kubernetes and container orchestration
• Familiarity with open standards (OpenTelemetry, Prometheus)`,
    applyUrl: "https://careers.datadoghq.com",
    postedDate: "2026-04-02",
  },
  {
    id: "listing-7",
    company: "Airbnb",
    jobTitle: "Software Engineer, Search & Discovery",
    location: "San Francisco, CA",
    description: `About the role
Airbnb is building the world's most loved travel platform. Join the Search & Discovery team to help millions of guests find their perfect stay.

What you'll do:
• Build and optimize search ranking algorithms and recommendation systems
• Develop real-time personalization features using machine learning
• Design APIs that power search across web and mobile
• Collaborate with data scientists to iterate on relevance models
• Improve search latency and infrastructure scalability

Qualifications:
• 3+ years of software engineering experience
• Proficiency in Java, Python, or Scala
• Experience with search engines (Elasticsearch, Solr) or recommendation systems
• Strong understanding of data structures and algorithms
• Familiarity with A/B testing and experimentation frameworks

Nice to have:
• Experience with ML frameworks (TensorFlow, PyTorch)
• Knowledge of distributed computing (Spark, Flink)
• Background in information retrieval or NLP`,
    applyUrl: "https://careers.airbnb.com",
    postedDate: "2026-04-04",
  },
  {
    id: "listing-8",
    company: "Figma",
    jobTitle: "Product Engineer",
    location: "San Francisco, CA (Hybrid)",
    description: `About Figma
Figma is the leading collaborative design platform. We're looking for Product Engineers who love building tools that empower creators.

Responsibilities:
• Own features end-to-end, from ideation through shipping
• Build interactive canvas experiences using WebGL and TypeScript
• Design and implement real-time collaboration features
• Work closely with designers and PMs to define product direction
• Improve performance of complex rendering pipelines

Requirements:
• 2+ years of product engineering experience
• Strong TypeScript and React skills
• Interest in graphics programming, WebGL, or Canvas APIs
• Experience building real-time collaborative applications
• Eye for design and attention to user experience details

Bonus:
• Experience with C++ or Rust for performance-critical code
• Knowledge of CRDTs or operational transforms
• Contributions to design tools or creative software`,
    applyUrl: "https://www.figma.com/careers",
    postedDate: "2026-03-30",
  },
  {
    id: "listing-9",
    company: "Coinbase",
    jobTitle: "Blockchain Engineer",
    location: "Remote (US)",
    description: `About the role
Coinbase is building the future of finance. As a Blockchain Engineer, you'll work on the core infrastructure that powers our crypto exchange and wallet services.

What you'll do:
• Build and maintain blockchain node infrastructure for multiple chains
• Develop smart contract integration and indexing services
• Design high-throughput transaction processing pipelines
• Implement security best practices for key management and custody
• Monitor chain health and automate incident response

Requirements:
• 3+ years of backend engineering experience
• Familiarity with blockchain protocols (Ethereum, Bitcoin, Solana)
• Proficiency in Go, Rust, or Python
• Experience with distributed systems and consensus algorithms
• Understanding of cryptographic primitives

Preferred:
• Smart contract development experience (Solidity, Rust)
• Knowledge of DeFi protocols and token standards
• Experience with cloud infrastructure (AWS, GCP)`,
    applyUrl: "https://www.coinbase.com/careers",
    postedDate: "2026-04-06",
  },
  {
    id: "listing-10",
    company: "Spotify",
    jobTitle: "Data Engineer, Personalization",
    location: "Stockholm, Sweden (Remote)",
    description: `About this role
Spotify's mission is to unlock the potential of human creativity. Join the Personalization team to build the data systems behind music recommendations for 600M+ users.

What you'll do:
• Build scalable data pipelines for real-time and batch processing
• Design event-driven architectures for user interaction data
• Develop feature stores and ML data infrastructure
• Optimize data models for low-latency serving
• Collaborate with ML engineers on recommendation systems

Requirements:
• 2+ years of data engineering experience
• Proficiency in Python, Scala, or Java
• Experience with Apache Spark, Kafka, or Flink
• Strong SQL skills and data modeling knowledge
• Familiarity with cloud platforms (GCP preferred)

Nice to have:
• Experience with feature stores or ML platforms
• Knowledge of streaming architectures
• Background in music or audio technology`,
    applyUrl: "https://www.lifeatspotify.com",
    postedDate: "2026-03-27",
  },
  {
    id: "listing-11",
    company: "Vercel",
    jobTitle: "Developer Experience Engineer",
    location: "Remote (Global)",
    description: `About Vercel
Vercel is the platform for frontend developers. We build Next.js and the infrastructure that powers the modern web.

The role:
As a Developer Experience Engineer, you'll make building on Vercel delightful for millions of developers.

What you'll do:
• Build and maintain developer tools, CLIs, and SDKs
• Write technical documentation, tutorials, and example projects
• Develop starter templates and integration guides
• Gather developer feedback and translate it into product improvements
• Contribute to Next.js and open-source tooling

Requirements:
• 3+ years of frontend or full-stack development experience
• Deep knowledge of Next.js, React, and the JavaScript ecosystem
• Excellent technical writing skills
• Experience building CLI tools or developer SDKs
• Passion for developer experience and open source

Bonus:
• Experience with serverless or edge computing
• Knowledge of build tools (Webpack, Turbopack, Vite)
• Active presence in developer communities`,
    applyUrl: "https://vercel.com/careers",
    postedDate: "2026-04-07",
  },
  {
    id: "listing-12",
    company: "Palantir",
    jobTitle: "Forward Deployed Engineer",
    location: "Washington, DC",
    description: `About the role
Palantir builds software that empowers organizations to use data effectively. Forward Deployed Engineers work directly with customers to solve their hardest problems.

Responsibilities:
• Partner with customers to understand complex data challenges
• Build custom applications and integrations on the Palantir platform
• Design data models and workflows for mission-critical systems
• Lead technical workshops and product demonstrations
• Travel to customer sites for on-site collaboration

Requirements:
• Bachelor's or Master's in Computer Science or Engineering
• Strong programming skills in Java, Python, or TypeScript
• Ability to quickly learn new technologies and domains
• Excellent communication and problem-solving skills
• Willingness to travel up to 30% of the time
• US citizenship required for security clearance

Preferred:
• Experience with data analysis or business intelligence
• Knowledge of SQL and relational databases
• Background in government or defense technology`,
    applyUrl: "https://www.palantir.com/careers",
    postedDate: "2026-03-29",
  },
  {
    id: "listing-13",
    company: "Cloudflare",
    jobTitle: "Systems Engineer, Edge Network",
    location: "Austin, TX",
    description: `About Cloudflare
Cloudflare helps build a better Internet. Our network spans 300+ cities and handles millions of requests per second.

The role:
Join the Edge Network team to build the infrastructure that makes the internet faster, safer, and more reliable.

What you'll do:
• Design and implement high-performance network services in Rust and C
• Build distributed systems that operate at massive scale
• Optimize packet processing and network protocol implementations
• Develop tools for traffic analysis and anomaly detection
• Collaborate on open standards and internet protocols

Requirements:
• 3+ years of systems programming experience
• Proficiency in Rust, C, or C++
• Deep understanding of TCP/IP, DNS, HTTP, and TLS
• Experience with Linux networking stack and kernel programming
• Knowledge of performance profiling and optimization

Nice to have:
• Experience with eBPF or XDP programming
• Contributions to networking open-source projects
• Knowledge of anycast routing and CDN architectures`,
    applyUrl: "https://www.cloudflare.com/careers",
    postedDate: "2026-04-01",
  },
  {
    id: "listing-14",
    company: "Notion",
    jobTitle: "Full Stack Engineer, AI",
    location: "New York, NY (Hybrid)",
    description: `About Notion
Notion is the connected workspace where teams create docs, manage projects, and organize knowledge — all in one place.

The role:
We're looking for a Full Stack Engineer to work on AI-powered features that make Notion smarter and more helpful.

What you'll do:
• Build AI-powered writing, editing, and summarization features
• Design and implement LLM integration pipelines
• Develop prompt engineering frameworks and evaluation systems
• Create intuitive UIs for AI interactions within the editor
• Optimize inference latency and cost at scale

Requirements:
• 3+ years of full-stack engineering experience
• Strong TypeScript and React skills
• Experience integrating LLMs or AI APIs into products
• Understanding of prompt engineering and RAG architectures
• Familiarity with vector databases (Pinecone, Weaviate, pgvector)

Preferred:
• Experience with Python and ML frameworks
• Knowledge of real-time collaborative editing
• Background in NLP or information extraction`,
    applyUrl: "https://www.notion.so/careers",
    postedDate: "2026-04-03",
  },
  {
    id: "listing-15",
    company: "Databricks",
    jobTitle: "Software Engineer, Platform",
    location: "San Francisco, CA",
    description: `About Databricks
Databricks is the Data + AI company. We help organizations unify their data, analytics, and AI on a single platform.

The role:
Join the Platform team to build the infrastructure that powers lakehouse architectures for thousands of enterprises worldwide.

What you'll do:
• Build and scale the Databricks control plane and workspace services
• Design multi-tenant infrastructure for compute orchestration
• Implement security and compliance features (encryption, access control)
• Optimize resource scheduling and cluster management
• Develop APIs and SDKs for platform integration

Requirements:
• 3+ years of software engineering experience
• Proficiency in Scala, Java, Go, or Python
• Experience building cloud-native services on AWS, Azure, or GCP
• Strong understanding of distributed systems and microservices
• Knowledge of container orchestration (Kubernetes)

Preferred:
• Experience with Apache Spark or data processing frameworks
• Background in database systems or storage engines
• Knowledge of Terraform or infrastructure-as-code`,
    applyUrl: "https://www.databricks.com/company/careers",
    postedDate: "2026-03-31",
  },
  {
    id: "listing-16",
    company: "Canva",
    jobTitle: "Frontend Engineer, Editor",
    location: "Sydney, Australia (Remote)",
    description: `About Canva
Canva empowers everyone in the world to design. With over 170 million monthly active users, we're one of the fastest-growing SaaS companies globally.

The role:
Join the Editor team to build the core design experience that makes Canva magical for millions of users.

What you'll do:
• Build and optimize the Canva editor using TypeScript and React
• Implement rendering features using Canvas API and WebGL
• Develop undo/redo, snapping, and alignment systems
• Optimize performance for complex designs with thousands of elements
• Collaborate with designers to ship delightful interactions

Requirements:
• 3+ years of frontend engineering experience
• Expert-level TypeScript and React skills
• Experience with Canvas, SVG, or WebGL rendering
• Strong understanding of browser performance optimization
• Eye for design and pixel-perfect implementation

Nice to have:
• Experience building design or creative tools
• Knowledge of color science, typography, or layout algorithms
• Background in graphics programming or game development`,
    applyUrl: "https://www.canva.com/careers",
    postedDate: "2026-04-02",
  },
];

export async function GET() {
  return NextResponse.json(JOB_LISTINGS);
}
