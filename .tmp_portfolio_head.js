/* Change this file to get your personal Portfolio */

// To change portfolio colors globally go to the  _globalColor.scss file

import emoji from "react-easy-emoji";
import splashAnimation from "./assets/lottie/splashAnimation"; // Rename to your file name for custom animation

// Splash Screen

const splashScreen = {
  enabled: true, // set false to disable splash screen
  animation: splashAnimation,
  duration: 2000 // Set animation duration as per your animation
};

// Summary And Greeting Section

const illustration = {
  animated: true // Set to false to use static SVG
};

const greeting = {
  username: "정재훈",
  title: "웹을 주력으로, 운영 문제까지 해결하는 개발자 정재훈",
  subTitle: emoji(
    "React · Spring Boot 기반 Full-Stack(Web) 개발 | 인증·보안(Refresh Rotation)과 운영 이슈(HTTPS·CORS) 해결 경험 | Unity XR·게임 개발 경험 보유"
  ),
  resumeLink: "", // Set to empty to hide the button
  displayGreeting: true // Set false to hide this section, defaults to true
};

// Social Media Links

const socialMediaLinks = {
  github: "https://github.com/toadsam",
  linkedin: "",
  gmail: "toadsam@naver.com",
  gitlab: "",
  facebook: "",
  medium: "",
  stackoverflow: "",
  // Instagram, Twitter and Kaggle are also supported in the links!
  // To customize icons and social links, tweak src/components/SocialMedia
  display: true // Set true to display this section, defaults to false
};

// Skills Section

const skillsSection = {
  title: "Skills",
  subTitle: "웹 주력 + 운영 이슈 해결 중심",
  skills: [
    emoji("Frontend: React/TypeScript 기반 SPA 설계 및 구현"),
    emoji("컴포넌트 구조화, 상태 흐름 설계, API 연동"),
    emoji("Backend: Spring Boot + JPA로 REST API 설계/구현"),
    emoji("Auth: JWT 인증/인가 + Refresh Token Rotation"),
    emoji("Infra: AWS 배포 및 HTTPS/Mixed Content/CORS 해결"),
    emoji("Unity XR/AR: 인터랙션 및 상태/AI 제어 경험")
  ],

  /* Make Sure to include correct Font Awesome Classname to view your icon
https://fontawesome.com/icons?d=gallery */

  softwareSkills: [
    {
      skillName: "HTML5",
      fontAwesomeClassname: "fab fa-html5"
    },
    {
      skillName: "CSS3",
      fontAwesomeClassname: "fab fa-css3-alt"
    },
    {
      skillName: "JavaScript",
      fontAwesomeClassname: "fab fa-js"
    },
    {
      skillName: "React",
      fontAwesomeClassname: "fab fa-react"
    },
    {
      skillName: "Node.js",
      fontAwesomeClassname: "fab fa-node"
    },
    {
      skillName: "Database",
      fontAwesomeClassname: "fas fa-database"
    },
    {
      skillName: "AWS",
      fontAwesomeClassname: "fab fa-aws"
    }
  ],
  display: true // Set false to hide this section, defaults to true
};

// Education Section

const educationInfo = {
  display: true, // Set false to hide this section, defaults to true
  schools: [
    {
      schoolName: "아주대학교",
      logo: require("./assets/images/harvardLogo.png"),
      subHeader: "디지털미디어학과 (전공)",
      duration: "2021.03 ~ 2026.02 (예정)",
      desc: "웹/소프트웨어 엔지니어링 중심으로 학습하며 서비스 구조 설계와 구현 역량을 확장했습니다.",
      descBullets: [
        "웹(React/Spring Boot) 중심 프로젝트 경험",
        "Unity XR/AR 프로젝트로 인터랙션 경험 확장"
      ]
    },
    {
      schoolName: "아주대학교",
      logo: require("./assets/images/stanfordLogo.png"),
      subHeader: "인공지능 융합학과 (복수전공)",
      duration: "2021.03 ~ 2026.02 (예정)",
      desc: "AI/데이터 기반 개발 역량을 함께 확장하고 있습니다.",
      descBullets: ["웹 개발과의 융합 관점으로 프로젝트 경험"]
    }
  ]
};

// Your top 3 proficient stacks/tech experience

const techStack = {
  viewSkillBars: true, //Set it to true to show Proficiency Section
  experience: [
    {
      Stack: "Web (Frontend)",
      progressPercentage: "90%"
    },
    {
      Stack: "Web (Backend)",
      progressPercentage: "80%"
    },
    {
      Stack: "Game/XR",
      progressPercentage: "60%"
    }
  ],
  displayCodersrank: false // Set true to display codersrank badges section need to changes your username in src/containers/skillProgress/skillProgress.js:17:62, defaults to false
};

// Work experience section

const workExperiences = {
  display: true, //Set it to true to show workExperiences Section
  experience: [
    {
      role: "개인/팀 프로젝트",
      company: "웹 · 게임 · XR",
      companylogo: require("./assets/images/facebookLogo.png"),
      date: "재학 중",
      desc: "웹 주력 개발과 XR 서브 경험을 바탕으로 서비스 구조와 UX를 동시에 고려한 개발을 수행.",
      descBullets: [
        "다수의 개인·팀 프로젝트 경험",
        "기획 → 개발 → 배포 → 운영 전 과정 수행"
      ]
    }
  ]
};

/* Your Open Source Section to View Your Github Pinned Projects
To know how to get github key look at readme.md */

const openSource = {
  showGithubProfile: "true", // Set true or false to show Contact profile using Github, defaults to true
  display: true // Set false to hide this section, defaults to true
};

// Some big projects you have worked on

const bigProjects = {
  title: "Main Projects",
  subtitle: "프로젝트 요약 (한 줄씩)",
  projects: [
    {
      image: require("./assets/images/saayaHealthLogo.webp"),
      projectName: "득근득근 (MuscleUp)",
      projectDesc:
        "React + Spring Boot 기반 Full-Stack 웹. AWS 배포/HTTPS·CORS 이슈 해결, Refresh Token Rotation 적용.",
      footerLink: [],
      details: {
        overview: {
          title: "득근득근 - 프로젝트 개요",
          subtitle: "AI 피트니스 커뮤니티 실서비스 풀스택 개발",
          image: require("./assets/images/saayaHealthLogo.webp"),
          caption: "득근득근 서비스 메인 화면",
          role: "기획, UI 설계, 백엔드 API 개발, 인증/권한 구현, 배포 담당 (개인 개발)",
          period: "2025.09 - (진행중)",
          coreValue:
            "운동 기록-커뮤니티-AI 코치를 하나의 실서비스 흐름으로 통합한 풀스택 시스템 구현",
          techStack: [
            "Frontend: React, Vite, Axios",
            "Backend: Spring Boot, Spring Security, JWT",
            "Database: MySQL, JPA",
            "Infrastructure: AWS (S3, CloudFront, Route53, ACM, RDS)",
            "AI: OpenAI GPT API"
          ],
          links: [
            {name: "배포 주소 (Deployment)", url: "https://muscle-up.click"},
            {
              name: "GitHub",
              url: "https://github.com/toadsam/Ajou_MuscleUp"
            },
            {
              name: "시연 영상 (Demo Video)",
              url: "https://www.youtube.com/watch?v=y6pbAoxveQM&feature=youtu.be"
            }
          ]
        },
        problemSolution: {
          problem: [
            "운동 루틴/식단/기록이 흩어져 '오늘 뭐 하지?'에서 멈춤",
            "혼자 하면 지속률이 낮아 성과 공유/피드백이 필요"
          ],
          solution:
            "AI 분석 → 4주 루틴 생성 → 대화 히스토리 저장, 커뮤니티 자랑글/댓글/좋아요 강화",
          outcome:
            "인증·보안·배포·운영까지 고려한 실사용 가능한 풀스택 서비스 완성"
        },
        strategySteps: [
          {
            step: "1",
            title: "AI 기반 개인 맞춤 운동 루틴 제공",
            description:
              "사용자의 운동 수준, 목표, 신체 데이터를 분석해 최적화된 루틴을 제공하여 운동 효과를 극대화",
            image: require("./assets/images/saayaHealthLogo.webp"),
            caption: "AI 상담 화면"
          },
          {
            step: "2",
            title: "운동 성과 공유 중심 커뮤니티 설계",
            description:
              "기록 공유, 챌린지 참여, 소셜 인터랙션을 통해 사용자 간 동기 부여와 지속적인 습관 형성",
            image: require("./assets/images/nextuLogo.webp"),
            caption: "자랑방 화면"
          },
          {
            step: "3",
            title: "초보자 기준 UX로 정보 과부하 최소화",
            description:
              "직관적인 인터페이스와 쉬운 가이드라인으로 운동 초보자도 쉽게 참여할 수 있도록 설계",
            image: require("./assets/images/googleAssistantLogo.webp"),
            caption: "소개 화면"
          }
        ],
        coreFeatureShots: [
          {
            title: "JWT 이중 쿠키 + Refresh Token 로테이션",
            bullets: [
              "Threat: 로컬스토리지 토큰은 XSS에 취약",
              "Design: Access/Refresh 수명 분리 + DB 저장",
              "Control: 재발급 시 기존 Refresh 폐기",
              "Hardening: HttpOnly 쿠키 + Role 기반 보호"
            ],
            image: require("./assets/images/pwaLogo.webp"),
            caption: "JWT 보안 인증 및 DB 설계 코드"
          },
          {
            title: "소셜/이메일 인증",
            bullets: [
              "SMTP 연동을 통한 이메일 인증 플로우",
              "구글 소셜 로그인 OAuth2 연동",
              "회원가입/로그인 UX 일관성 유지"
            ],
            image: require("./assets/images/saayaHealthLogo.webp"),
            caption: "인증 화면"
          }
        ],
        summary:
          "JWT 인증 + AI 코치 + 커뮤니티 운영까지 완성한 피트니스 서비스.",
        role: "기획, 프론트엔드, 백엔드, 배포/운영 전 과정",
        highlights: [
          "JWT + Refresh Token Rotation 적용",
          "AI 코치 루틴 생성 + 대화 히스토리 저장",
          "커뮤니티 CRUD/댓글/좋아요/권한 체크",
          "AWS 배포 환경 문제 재현-해결-검증"
        ],
        stack:
          "React, TypeScript, Spring Boot, Spring Security, JPA, MySQL, AWS, Nginx",
        problemGoal: [
          "운동 기록/인증/커뮤니티가 분산되어 지속 동기 유지가 어려움",
          "로그인/갱신 불안정은 서비스 신뢰 하락으로 직결",
          "배포 후 HTTPS/CORS 문제로 오류가 반복 발생",
          "안정적인 인증을 기준으로 설계하고 운영 체크리스트화"
        ],
        architecture: [
          "React SPA → Spring Boot REST API → MySQL(RDS)",
          "Access/Refresh 수명 분리 + HttpOnly Cookie 기반 인증",
          "Refresh Rotation으로 탈취 토큰 재사용 차단",
          "파일 업로드는 UUID/경로 검증으로 안전 처리"
        ],
        authSecurity: [
          "Access 만료 시 401 처리",
          "Refresh 쿠키로 재발급",
          "Rotation으로 기존 Refresh 폐기 + 신규 저장",
          "Role 기반 접근 제어 및 표준화된 에러 처리"
        ],
        coreFeatures: [
          "AI 코치: 분석 → 4주 루틴 생성 → 히스토리 저장",
          "커뮤니티: 자랑글 CRUD + 댓글/좋아요 + 권한 체크",
          "파일: 업로드/목록/삭제, UUID/경로 검증"
        ],
        deployment: [
          "EC2 + RDS(MySQL) 운영 환경 구축",
          "S3/CloudFront 정적 리소스 구성",
          "HTTPS 통일 및 Mixed Content 방지",
          "CORS allowlist + credentials 설정"
        ],
        links: []
      }
    },
    {
      image: require("./assets/images/nextuLogo.webp"),
      projectName: "TSEROF",
      projectDesc: "Unity 게임 프로젝트 (스팀 출시 경험 포함).",
      footerLink: [],
      details: {
        summary: "Unity 기반 게임 프로젝트로 스팀 출시 경험이 포함됩니다.",
        role: "게임 시스템/로직 구현",
        highlights: ["Unity/C# 기반 구현", "Steam 출시 경험 포함"],
        stack: "Unity, C#",
        links: []
      }
    },
    {
      image: require("./assets/images/saayaHealthLogo.webp"),
      projectName: "A club",
      projectDesc: "React 프론트엔드 프로젝트.",
      footerLink: [],
      details: {
        summary:
          "운영형 프론트엔드 프로젝트로 화면 구성과 사용자 흐름 개선에 집중했습니다.",
        role: "프론트엔드 개발",
        highlights: ["React 기반 화면 구성", "운영 관점의 UX 개선"],
        stack: "React, React Router, Styled Components, Axios",
        links: []
      }
    },
    {
      image: require("./assets/images/pwaLogo.webp"),
      projectName: "INTO MONSTER POINT",
      projectDesc: "Unity AR Foundation 기반 AR 프로젝트.",
      footerLink: [],
      details: {
        summary:
          "AR Foundation 기반 AR 프로젝트로 공간 인식과 인터랙션을 구현했습니다.",
        role: "AR 기능 구현",
        highlights: ["Plane Scan", "Boundary 처리", "AR 인터랙션 설계"],
        stack: "Unity, AR Foundation",
        links: []
      }
    },
    {
      image: require("./assets/images/nextuLogo.webp"),
      projectName: "Ajou Campus Foodmap",
      projectDesc:
        "React(Vite) + Express + MongoDB + Passport(Session) 풀스택, Vercel/Render/Atlas 배포.",
      footerLink: [],
      details: {
        summary:
          "React(Vite) + Express + MongoDB 기반 풀스택 서비스로 세션 인증과 배포까지 경험했습니다.",
        role: "풀스택 개발",
        highlights: [
          "Passport(Session) 기반 인증 흐름 구성",
          "CORS + withCredentials로 세션 유지 문제 해결",
          "Vercel/Render/Atlas 배포"
        ],
        stack: "React(Vite), Express, MongoDB, Passport, Mongoose",
        links: []
      }
    },
    {
      image: require("./assets/images/saayaHealthLogo.webp"),
      projectName: "aClub / ajouchong",
      projectDesc:
        "React 프론트 + GA4/GSC 분석 운영형 사이트 (배포/깃헙 링크 포함).",
      footerLink: [
        {name: "aClub", url: "https://ajouclub.co.kr"},
        {name: "ajouchong", url: "https://ajouchong.com"}
      ],
      details: {
        summary:
          "운영형 프론트 프로젝트로 유입/행동 데이터를 분석하며 개선 경험을 쌓았습니다.",
        role: "프론트엔드 개발 및 운영",
        highlights: ["GA4/GSC 연동 및 지표 기반 개선", "배포 운영 경험"],
        stack: "React, GA4, GSC",
        links: [
          {name: "aClub", url: "https://ajouclub.co.kr"},
          {name: "ajouchong", url: "https://ajouchong.com"}
        ]
      }
    },
    {
      image: require("./assets/images/nextuLogo.webp"),
      projectName: "Ajou Game Project",
      projectDesc: "게임 프로젝트.",
      footerLink: [],
      details: {
        summary: "아주대 관련 게임 프로젝트입니다.",
        role: "게임 시스템/로직 구현",
        highlights: ["Unity 기반 게임 시스템 구현"],
        stack: "Unity, C#",
        links: []
      }
    },
    {
      image: require("./assets/images/googleAssistantLogo.webp"),
      projectName: "The Other Side (Unity VR Game)",
      projectDesc: "Unity XR Interaction Toolkit 기반 VR 프로젝트.",
      footerLink: [],
      details: {
        summary:
          "Unity XR Interaction Toolkit 기반 VR 프로젝트로 AI 및 인터랙션 설계를 경험했습니다.",
        role: "VR 인터랙션/AI 설계",
        highlights: ["NavMesh 기반 AI", "VR 인터랙션 구성"],
        stack: "Unity, XR Interaction Toolkit",
        links: []
      }
    }
  ],
  display: true // Set false to hide this section, defaults to true
};

// Achievement Section
// Include certificates, talks etc

const achievementSection = {
  title: emoji("Sub Projects (Game / XR)"),
  subtitle: "프로젝트 요약 (한 줄씩)",

  achievementsCards: [
    {
      title: "TSEROF",
      subtitle: "Unity 게임 프로젝트 (스팀 출시 경험 포함).",
      image: require("./assets/images/codeInLogo.webp"),
      imageAlt: "TSEROF",
      footerLink: []
    },
    {
      title: "The Other Side (VR)",
      subtitle:
        "Unity XR Interaction Toolkit 기반 VR 게임, NavMesh 기반 AI/상태 설계.",
      image: require("./assets/images/googleAssistantLogo.webp"),
      imageAlt: "The Other Side VR",
      footerLink: []
    },
    {
      title: "AR Monster Shooter / INTO MONSTER POINT",
      subtitle:
        "Unity AR Foundation 기반 AR 프로젝트 (Plane Scan, boundary 등).",
      image: require("./assets/images/pwaLogo.webp"),
      imageAlt: "AR Monster Shooter",
      footerLink: []
    }
  ],
  display: true // Set false to hide this section, defaults to true
};

// Blogs Section

const blogSection = {
  title: "Development Principles",
  subtitle: "개발 철학",
  displayMediumBlogs: "false", // Set true to display fetched medium blogs instead of hardcoded ones
  blogs: [
    {
      url: "",
      title: "기능보다 구조를 먼저 설계",
      description: "확장성과 유지보수를 고려한 아키텍처를 우선합니다."
    },
    {
      url: "",
      title: "역할 분리와 유지보수 가능한 코드",
      description: "비즈니스 로직과 표현 계층을 분리해 변경에 강합니다."
    },
    {
      url: "",
      title: "설계 의사결정을 설명할 수 있는 코드",
      description: "왜 이 구조가 필요한지 근거를 남깁니다."
    },
    {
      url: "",
      title: "사용자 흐름 기반 UX",
      description: "동선을 기준으로 인터페이스를 설계합니다."
    }
  ],
  display: true // Set false to hide this section, defaults to true
};

// Talks Sections

const talkSection = {
  title: "Experience & Activities",
  subtitle: "학업 및 활동",

  talks: [
    {
      title: "디지털미디어학과 전공",
      subtitle: "웹/소프트웨어 엔지니어링 중심 학습",
      slides_url: "",
      event_url: ""
    },
    {
      title: "인공지능 융합학과 복수전공",
      subtitle: "AI·데이터 기반 개발 경험",
      slides_url: "",
      event_url: ""
    },
    {
      title: "다수의 개인·팀 프로젝트 수행",
      subtitle: "웹/게임/XR 융합적 개발 경험",
      slides_url: "",
      event_url: ""
    }
  ],
  display: true // Set false to hide this section, defaults to true
};

// Podcast Section

const podcastSection = {
  title: "About Me",
  subtitle:
    "React·TypeScript와 Spring Boot를 중심으로 서비스 설계부터 배포/운영까지 책임져온 Full-Stack(Web) 개발자입니다. HTTPS/Mixed Content, CORS, 인증 갱신 등 운영 이슈를 직접 해결하며 원인 분석 → 재현 → 수정 → 검증 흐름을 체득했습니다. 웹을 주력으로 하되 Unity XR/AR 경험을 통해 인터랙션과 실시간 시스템 감각도 함께 키우고 있습니다.",

  // Please Provide with Your Podcast embeded Link
  podcast: [],
  display: true // Set false to hide this section, defaults to true
};

// Resume Section
const resumeSection = {
  title: "Resume",
  subtitle: "Feel free to download my resume",

  // Please Provide with Your Podcast embeded Link
  display: false // Set false to hide this section, defaults to true
};

const contactInfo = {
  title: emoji("Contact"),
  subtitle:
    "협업/인턴/프로젝트 제안 모두 환영합니다. 가장 빠른 연락은 이메일로 부탁드립니다.",
  number: "010-6428-6247",
  email_address: "toadsam@naver.com"
};

// Twitter Section

const twitterDetails = {
  userName: "", //Replace "twitter" with your twitter username without @
  display: false // Set true to display this section, defaults to false
};

const isHireable = false; // Set false if you are not looking for a job. Also isHireable will be display as Open for opportunities: Yes/No in the GitHub footer

export {
  illustration,
  greeting,
  socialMediaLinks,
  splashScreen,
  skillsSection,
  educationInfo,
  techStack,
  workExperiences,
  openSource,
  bigProjects,
  achievementSection,
  blogSection,
  talkSection,
  podcastSection,
  contactInfo,
  twitterDetails,
  isHireable,
  resumeSection
};
