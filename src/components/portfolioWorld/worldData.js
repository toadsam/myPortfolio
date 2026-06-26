export const zoneOrder = ["about", "skills", "projects", "backend", "game", "growth", "contact"];

export const zones = [
  {
    id: "about",
    label: "Core Zone",
    shortLabel: "About",
    title: "Jaehoon's Portfolio World",
    subtitle: "Frontend / Full-stack developer building interactive web products.",
    description:
      "I design user-facing interfaces, connect real service flows, and keep improving the product until it feels clear, stable, and usable.",
    position: [0, 0.55, 0],
    accent: "#38BDF8"
  },
  {
    id: "skills",
    label: "Web Lab",
    shortLabel: "Skills",
    title: "Frontend and product UI skills",
    subtitle: "React, JavaScript, HTML, CSS, SCSS, interaction design.",
    description:
      "A glass lab for interface work: component structure, responsive layout, visual feedback, and data-driven UI states.",
    position: [-2.15, 0.38, 0.25],
    accent: "#22D3EE"
  },
  {
    id: "projects",
    label: "Project Gallery",
    shortLabel: "Projects",
    title: "Main project showcase",
    subtitle: "Representative web projects with role, stack, and problem solving.",
    description:
      "A gallery of main projects. Each project opens a detailed case study focused on my contribution and implementation decisions.",
    position: [2.15, 0.42, 0.15],
    accent: "#8B5CF6"
  },
  {
    id: "backend",
    label: "Backend Tower",
    shortLabel: "Backend",
    title: "Backend and system experience",
    subtitle: "Spring Boot, REST API, JWT, DB, deployment, CORS, HTTPS.",
    description:
      "A system tower for API design, authentication flow, database connection, deployment issues, and operational debugging.",
    position: [1.45, 0.48, -1.75],
    accent: "#00B4D8"
  },
  {
    id: "game",
    label: "Game / XR Zone",
    shortLabel: "Game/XR",
    title: "Unity, VR, AR interaction work",
    subtitle: "Playable systems, portals, XR prototypes, and interaction loops.",
    description:
      "A portal zone for Unity projects, VR/AR experiments, player interaction, and game-system thinking.",
    position: [-1.55, 0.42, -1.65],
    accent: "#A855F7"
  },
  {
    id: "growth",
    label: "Growth Road",
    shortLabel: "Growth",
    title: "Experience and growth timeline",
    subtitle: "Learning, team projects, deployment, backend integration, and 3D portfolio evolution.",
    description:
      "A road of milestones showing how web, backend, deployment, and XR experience have connected over time.",
    position: [0, 0.24, 2.05],
    accent: "#34D399"
  },
  {
    id: "contact",
    label: "Contact Beacon",
    shortLabel: "Contact",
    title: "Contact and links",
    subtitle: "Email, GitHub, resume, and contact CTA.",
    description:
      "A signal beacon for reaching out, checking code, or opening the resume.",
    position: [0.05, 0.82, -2.45],
    accent: "#E0F2FE"
  }
];

export const zoneMap = zones.reduce(function buildZoneMap(result, zone) {
  result[zone.id] = zone;
  return result;
}, {});

export const skillGroups = [
  {
    title: "Frontend",
    summary: "Builds responsive interfaces and clear user flows.",
    stack: ["React", "JavaScript", "HTML", "CSS", "SCSS"],
    proof: ["Component UI", "Responsive layout", "Interactive states", "Project gallery UI"]
  },
  {
    title: "Backend Connection",
    summary: "Connects UI to real APIs and service data.",
    stack: ["REST API", "JWT", "Postman", "GitHub"],
    proof: ["API request flow", "Auth state handling", "Error states", "Data rendering"]
  },
  {
    title: "Product Detail",
    summary: "Focuses on readability, feedback, and practical UX.",
    stack: ["UI/UX", "SCSS", "Deployment", "Debugging"],
    proof: ["Polished panels", "Motion feedback", "CORS/HTTPS issue handling", "Submission-ready structure"]
  }
];

export const backendItems = [
  {
    title: "Spring Boot API",
    text: "Controller, service, DTO, and REST endpoint structure for team projects."
  },
  {
    title: "JWT Authentication",
    text: "Login/session flow, authorization checks, and frontend auth-state connection."
  },
  {
    title: "Database Integration",
    text: "MySQL/PostgreSQL schema connection, query flow, and server-side data handling."
  },
  {
    title: "Deployment Issues",
    text: "CORS, HTTPS, environment configuration, and production debugging experience."
  }
];

export const mainProjects = [
  {
    id: "muscleup",
    name: "득근득근 (MuscleUp)",
    oneLine: "Fitness service project focused on workout records and user motivation.",
    category: "Web / Full-stack",
    tech: ["React", "Spring Boot", "Java", "MySQL", "JWT"],
    overview:
      "A team web service that helps users manage workout routines, track activity, and stay motivated through a structured product flow.",
    role:
      "Implemented user-facing screens, connected API data to UI states, refined interaction feedback, and handled feature-level integration details.",
    features: ["Workout record flow", "User state UI", "API-connected pages", "Responsive dashboard"],
    problem:
      "The main challenge was making service data feel reliable in the UI. I focused on loading/error/empty states and consistent page structure.",
    result:
      "Learned how frontend decisions affect trust in a real service and how to coordinate UI implementation with backend API contracts.",
    github: "#",
    demo: "#"
  },
  {
    id: "foodmap",
    name: "Ajou Campus Foodmap",
    oneLine: "Campus food discovery map for Ajou University users.",
    category: "Web",
    tech: ["React", "JavaScript", "Map UI", "REST API"],
    overview:
      "A location-centered service that organizes campus food information into a clearer discovery experience.",
    role:
      "Worked on UI layout, information hierarchy, map-based interaction, and frontend data rendering.",
    features: ["Map-based browsing", "Food-place cards", "Filtering UI", "Detail information"],
    problem:
      "Food information can become scattered quickly, so I focused on visible hierarchy and predictable navigation.",
    result:
      "Improved my ability to turn location data into a practical interface users can scan quickly.",
    github: "#",
    demo: "#"
  },
  {
    id: "ajouchong",
    name: "ajouchong",
    oneLine: "Community-style service project for campus information and interaction.",
    category: "Web / Team",
    tech: ["React", "Spring Boot", "REST API", "PostgreSQL"],
    overview:
      "A campus community project that connects posts, users, and information flows into a service-like structure.",
    role:
      "Implemented frontend screens, API-connected UI, reusable components, and interaction states for team delivery.",
    features: ["Post list/detail", "User interaction", "API data binding", "Team project workflow"],
    problem:
      "Team projects require interface consistency across features. I worked on reusable patterns and clearer page behavior.",
    result:
      "Built stronger habits around collaboration, API contracts, and consistent component implementation.",
    github: "#",
    demo: "#"
  },
  {
    id: "tserof",
    name: "TSEROF",
    oneLine: "Interactive service project with structured UI and system-oriented thinking.",
    category: "Web / Product",
    tech: ["React", "SCSS", "JavaScript", "Deployment"],
    overview:
      "A project focused on presenting information and interaction as a polished product experience.",
    role:
      "Designed and implemented core UI sections, page interaction, responsive behavior, and visual consistency.",
    features: ["Landing flow", "Reusable UI sections", "Interactive cards", "Responsive polish"],
    problem:
      "The product needed to look credible quickly. I focused on hierarchy, spacing, and motion that supports comprehension.",
    result:
      "Learned how visual polish, information structure, and implementation detail work together in portfolio-grade UI.",
    github: "#",
    demo: "#"
  }
];

export const gameProjects = [
  {
    name: "아주대탐험",
    type: "Unity / Exploration",
    text: "Campus exploration concept with playable interaction and spatial movement."
  },
  {
    name: "The Other Side",
    type: "VR / Unity",
    text: "Immersive VR interaction project focused on atmosphere, navigation, and player response."
  },
  {
    name: "AR Monster Shooter",
    type: "AR / Game",
    text: "AR shooter prototype using real-world interaction and simple combat loops."
  }
];

export const growthSteps = [
  ["01", "Started web development", "Learned HTML, CSS, JavaScript and basic programming flow."],
  ["02", "Built React interfaces", "Practiced component structure, state, responsive layout, and data rendering."],
  ["03", "Worked in team projects", "Experienced collaboration, API contracts, feature ownership, and project delivery."],
  ["04", "Connected backend APIs", "Integrated Spring Boot APIs, auth state, REST responses, and database-driven UI."],
  ["05", "Solved deployment issues", "Handled CORS, HTTPS, environment settings, and production debugging."],
  ["06", "Expanded into Unity / XR", "Applied interaction thinking to game, VR, and AR prototypes."],
  ["07", "Built 3D interactive portfolio", "Evolved the portfolio into an exploratory 3D world with practical information panels."]
];

export const contactLinks = [
  {label: "Email", value: "jaehoon.dev@gmail.com", href: "mailto:jaehoon.dev@gmail.com"},
  {label: "GitHub", value: "github.com/toadsam", href: "https://github.com/toadsam"},
  {label: "Resume", value: "Download resume", href: "#"},
  {label: "Contact", value: "Open to collaboration", href: "mailto:jaehoon.dev@gmail.com"}
];
