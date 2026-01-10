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
      desc:
        "웹/소프트웨어 엔지니어링 중심으로 학습하며 서비스 구조 설계와 구현 역량을 확장했습니다.",
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
      desc:
        "웹 주력 개발과 XR 서브 경험을 바탕으로 서비스 구조와 UX를 동시에 고려한 개발을 수행.",
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
   
  projects: [
    {
      image: require("./assets/images/saayaHealthLogo.webp"),
      projectName: "득근득근 (MuscleUp)",
      projectDesc:
        "React + Spring Boot 기반 Full-Stack 웹. AWS 배포/HTTPS·CORS 이슈 해결, Refresh Token Rotation 적용.",
      recommendation:
        "운영을 전제로 인증·보안·배포까지 설계한 피트니스 커뮤니티 풀스택 서비스",
      tags: ["#FullStack", "#JWT", "#AWS", "#Security"],
      footerLink: [],
      details: {
        overview: {
          title: "득근득근 - 프로젝트 개요",
          subtitle: "AI 피트니스 커뮤니티 실서비스 풀스택 개발",
          image: require("./assets/images/saayaHealthLogo.webp"),
          caption: "득근득근 서비스 메인 화면",
          role:
            "기획, UI 설계, 백엔드 API 개발, 인증/권한 구현, 배포 담당 (개인 개발)",
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
              url:
                "https://www.youtube.com/watch?v=y6pbAoxveQM&feature=youtu.be"
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
      projectName: "Ajou Campus Foodmap",
      projectDesc:
        "세션 기반 OAuth 로그인 + 맛집 등록 워크플로우를 포함한 Full-Stack 서비스",
      recommendation:
        "세션 기반 OAuth 로그인과 맛집 등록 플로우를 구현한 캠퍼스 지도 서비스",
      tags: ["#FullStack", "#OAuth", "#Workflow"],
      footerLink: [
        {name: "GitHub Client", url: "https://github.com/toadsam/pwd-week6-client"},
        {name: "GitHub Server", url: "https://github.com/toadsam/pwd-week6-server"}
      ],
      details: {
        overview: {
          title: "Ajou Campus Foodmap",
          subtitle:
            "React(Vite) + Express + MongoDB 기반 맛집 지도/등록 서비스 (Local/OAuth 로그인, 운영 배포 포함)",
          image: require("./assets/images/nextuLogo.webp"),
          caption: "서비스 메인/맛집 목록/등록 흐름(대표 화면)",
          role: "Full-Stack 개발",
          period: "2024.10 - 2024.12",
          techStack: [
            "Frontend: React(Vite) / React Query / Axios",
            "Backend: Express / Passport / Session / Mongoose",
            "Database: MongoDB Atlas",
            "Infra: Vercel + Render"
          ]
        },
        intro: {
          headline: "What is Ajou Campus Foodmap?",
          highlight:
            "맛집 등록/승인 흐름과 인증을 통합한 캠퍼스 맛집 지도 서비스",
          problem:
            "맛집 정보가 흩어져 있고, 사용자 참여형 등록/승인 흐름이 없으면 데이터 품질 관리가 어려움",
          solution:
            "맛집 등록 → 승인(pending/approved/rejected) 워크플로우를 스키마/권한 기반으로 설계",
          outcome:
            "배포 환경에서도 로그인 유지/등록 흐름이 안정적으로 동작하고, 운영 관점까지 포함한 실서비스 구조 완성",
          caption: "서비스 메인/맛집 목록/등록 흐름(대표 화면)",
          images: [
            require("./assets/images/nextuLogo.webp"),
            require("./assets/images/saayaHealthLogo.webp")
          ]
        },
        quickSummary: [
          {
            icon: "🌍",
            title: "배포 환경 분기",
            desc: "로컬/운영 URL·DB 설정 충돌을 환경변수 기반으로 분리"
          },
          {
            icon: "🍪",
            title: "교차 도메인 세션 유지",
            desc: "withCredentials + CORS allowlist/credentials로 로그인 유지"
          },
          {
            icon: "🗃️",
            title: "Session DB 저장",
            desc: "MongoStore로 세션을 저장해 재시작/HTTPS에서도 지속"
          },
          {
            icon: "🔐",
            title: "인증(Local + OAuth)",
            desc: "Passport Local + Google/Naver OAuth를 단일 흐름으로 통합"
          },
          {
            icon: "🛡️",
            title: "운영/관리 + 권한",
            desc: "관리자 권한 분리 + 초기 계정 시드로 운영 효율 확보"
          }
        ],
        coreDesign: [
          {
            title: "배포 환경 분기 — URL/DB 설정 분리 운영",
            oneLiner: "운영/로컬 환경 차이로 생기는 URL·DB 연결 오류를 환경변수 분기로 차단",
            how:
              "How: Client 환경별 API URL 분기 + Server mongoose 옵션/운영 DB 분리 + 배포 환경변수 매핑",
            result: "Result: 배포 환경에서도 설정 충돌/연결 불안정 감소, 운영 안정성 확보",
            proofCaption: "환경변수/DB 커넥션/배포 설정 캡처",
            proofImage: require("./assets/images/pwaLogo.webp")
          },
          {
            title: "교차 도메인 세션 유지 (SPA + API 분리)",
            oneLiner: "서버/클라이언트 분리 환경에서도 쿠키 기반 로그인 세션이 끊기지 않게 유지",
            how:
              "How: axios withCredentials + CORS allowlist/credentials=true 적용",
            result: "Result: 운영에서도 로그인 상태 유지/세션 기반 기능 안정화",
            proofCaption: "withCredentials 코드 + CORS 설정 캡처",
            proofImage: require("./assets/images/nextuLogo.webp")
          },
          {
            title: "Session + MongoStore — 세션 DB 저장",
            oneLiner: "세션을 메모리가 아닌 DB에 저장해 서버 재시작/HTTPS에서도 로그인 지속",
            how:
              "How: session store를 MongoStore로 구성 + credentials/origin 정책 적용",
            result: "Result: 배포/재시작 환경에서도 세션 유지, 운영 이슈 감소",
            proofCaption: "MongoStore 코드 + DB 저장 확인 캡처",
            proofImage: require("./assets/images/saayaHealthLogo.webp")
          },
          {
            title: "Passport Local + bcrypt — 기본 로그인 보안",
            oneLiner: "Passport Local 인증 + bcrypt 해시로 비밀번호 저장/검증을 표준화",
            how:
              "How: serialize/deserialize + UserSchema pre-save bcrypt 적용",
            result: "Result: 보안/인증 흐름 명확화, 세션 기반 UX 안정화",
            proofCaption: "serialize/deserialize + bcrypt 코드 캡처",
            proofImage: require("./assets/images/googleAssistantLogo.webp")
          },
          {
            title: "OAuth(Google/Naver) + 운영/권한(관리자)",
            oneLiner: "OAuth 로그인과 관리자 권한 제어를 붙여 ‘운영 가능한 서비스’로 완성",
            how:
              "How: Passport Strategy + req.login() 세션 생성 + 관리자 미들웨어/시드 스크립트",
            result: "Result: 운영 측면(관리자 기능 보안/계정 관리)까지 포함한 실서비스 구조",
            proofCaption: "권한 미들웨어 코드 + admin seed 캡처",
            proofImage: require("./assets/images/saayaHealthLogo.webp")
          }
        ],
        ops: {
          oneLiner: "Issue: 배포 환경에서 URL/DB 불일치, 교차 도메인 세션 쿠키 미전달",
          how: "Fix: 환경변수 분리 + CORS allowlist/credentials + MongoStore 세션 저장",
          result: "Result: 운영에서도 로그인/세션/DB 연결이 안정적으로 동작"
        },
        links: [
          {name: "GitHub (Client)", url: "https://github.com/toadsam/pwd-week6-client"},
          {name: "GitHub (Server)", url: "https://github.com/toadsam/pwd-week6-server"}
        ]
      }
    },

    {
      image: require("./assets/images/saayaHealthLogo.webp"),
      projectName: "ajouchong",
      projectDesc: "총학생회 운영형 홍보·정보 제공 웹 + 유입/행동 분석",
      recommendation:
        "실사용 조직 운영을 위한 정보 제공·홍보 흐름 중심 웹 서비스",
      tags: ["#WebService", "#Operations", "#UX"],
      footerLink: [
        {name: "aClub", url: "https://ajouclub.co.kr"},
        {name: "ajouchong", url: "https://ajouchong.com"}
      ],
      details: {
        overview: {
          title: "ajouchong - 프로젝트 개요",
          subtitle: "총학생회 운영형 홍보·정보 제공 웹 + 유입/행동 분석",
          image: require("./assets/images/saayaHealthLogo.webp"),
          caption: "서비스 메인/공지/자료/상세 화면",
          role: "Frontend 개발, 운영 구조 설계 및 분석 연계",
          period: "2025.03 - 2025.08",
          techStack: [
            "Frontend: React, Vite, Axios",
            "Analytics: GA4, Google Search Console",
            "Deploy: Vercel, Cloudflare",
            "Tooling: Notion, Figma"
          ]
        },
        intro: {
          headline: "What is ajouchong?",
          highlight: "총학생회 운영 정보를 사용자 흐름 기준으로 재구성한 운영형 웹",
          problem:
            "유입 이후 ‘무엇을 어디서 해야 하는지’가 분산되어 문의/이탈이 반복됨",
          solution:
            "공지·신청·안내를 사용자 흐름 기준으로 재구성 + 외부 채널 유입 연결",
          outcome:
            "정보 탐색 시간이 줄고, 참여 동선이 명확해져 운영 효율이 개선됨",
          caption: "서비스 메인/공지/자료/상세 화면",
          images: [
            require("./assets/images/saayaHealthLogo.webp"),
            require("./assets/images/nextuLogo.webp")
          ]
        },
        quickSummary: [
          {
            icon: "📣",
            title: "운영형 홍보",
            desc: "공지/이벤트/지원 정보를 ‘탐색→확인→참여’ 흐름으로 정리"
          },
          {
            icon: "🔍",
            title: "정보 구조·UX",
            desc: "메뉴/카테고리 구조를 단순화해 필요한 정보를 빠르게 찾게 설계"
          },
          {
            icon: "📈",
            title: "유입·행동 분석",
            desc: "GA4/GSC로 유입·클릭·체류 데이터를 수집해 개선 포인트 도출"
          },
          {
            icon: "🤝",
            title: "채널 연동 운영",
            desc: "Everytime·카카오톡 등 외부 채널과 연결해 실사용 유입을 설계"
          },
          {
            icon: "⚙️",
            title: "Ops · Deploy",
            desc: "배포/운영 관점에서 안정적으로 유지·개선 가능한 구조로 관리"
          }
        ],
        coreDesign: [
          {
            title: "정보 구조·탐색 UX",
            oneLiner: "공지/지원 정보를 사용 흐름 기준으로 재구성",
            how: "How: 메뉴/카테고리/CTA 동선을 ‘찾기→확인→신청’으로 정리",
            result: "Result: 반복 문의 감소 + 필요한 정보 도달 속도 향상",
            proofCaption: "메인 화면/메뉴 구조/CTA 영역 캡처",
            proofImage: require("./assets/images/saayaHealthLogo.webp")
          },
          {
            title: "유입·행동 분석(운영 개선 루프)",
            oneLiner: "데이터로 개선 포인트를 확인하는 운영 구조",
            how: "How: GA4로 페이지뷰/체류/이벤트, GSC로 검색 유입/CTR 확인",
            result: "Result: 콘텐츠/동선 개선의 근거 확보",
            proofCaption: "GA4/GSC 화면 또는 지표 캡처",
            proofImage: require("./assets/images/nextuLogo.webp")
          },
          {
            title: "홍보 채널 연동 운영",
            oneLiner: "외부 채널 유입을 서비스 참여로 연결",
            how: "How: Everytime/카카오톡에서 들어온 사용자가 바로 행동할 수 있게 링크/CTA 설계",
            result: "Result: 홍보→유입→참여 전환 흐름 강화",
            proofCaption: "채널 홍보/링크 구조/랜딩 캡처",
            proofImage: require("./assets/images/pwaLogo.webp")
          }
        ],
        links: [
          {name: "aClub", url: "https://ajouclub.co.kr"},
          {name: "ajouchong", url: "https://ajouchong.com"}
        ]
      }
    },

    {
      image: require("./assets/images/nextuLogo.webp"),
      projectName: "TSEROF",
      projectDesc: "출시/배포까지 완료한 3D 액션 플랫폼 게임",
      recommendation: "출시·배포까지 완주한 3D 액션 플랫폼 게임 프로젝트",
      tags: ["#Unity", "#GameDev", "#3D"],
      footerLink: [],
      details: {
        overview: {
          title: "TSEROF — 프로젝트 개요",
          subtitle: "출시/배포까지 완료한 3D 액션 플랫폼 게임",
          image: require("./assets/images/nextuLogo.webp"),
          caption: "게임 플레이/스테이지 선택 화면",
          role: "게임 시스템/플레이 로직 구현",
          period: "2024.09 - 2025.02",
          techStack: [
            "Engine: Unity",
            "Language: C#",
            "Tools/Etc: Unity Profiler, Addressables"
          ]
        },
        intro: {
          headline: "What is TSEROF?",
          highlight: "출시/배포까지 완료한 3D 액션 플랫폼 게임",
          problem:
            "플랫폼 게임에서 반복 실패가 잦으면 이탈이 빨라지고, 저장/성능 문제가 있으면 완성도가 급락한다.",
          solution:
            "스테이지 선택 + 진행 저장으로 반복 도전을 유도하고, 충돌/레이캐스트/오브젝트 생성 비용을 최적화해 플레이 흐름을 안정화했다.",
          outcome:
            "출시/배포까지 완료된 3D 액션 플랫폼 게임을 구현하고, 저장 안정성(XOR)과 성능(충돌/레이캐스트/풀링)을 개선해 완성도를 확보했다.",
          caption: "플레이 화면/스테이지 선택 화면",
          images: [
            require("./assets/images/nextuLogo.webp"),
            require("./assets/images/pwaLogo.webp")
          ]
        },
        quickSummary: [
          {
            icon: "🎮",
            title: "Steam 출시/배포 완료",
            desc: "스토어 공개 및 외부 사용자 플레이 가능 상태"
          },
          {
            icon: "🧭",
            title: "스테이지 선택 + 진행 저장",
            desc: "반복 도전 구조로 이탈 방지"
          },
          {
            icon: "⚡",
            title: "충돌/콜라이더 최적화",
            desc: "불필요 충돌 체크 제거로 프레임 안정화"
          },
          {
            icon: "🎯",
            title: "Raycast 최적화",
            desc: "RaycastAll → NonAlloc + LayerMask로 비용 절감"
          },
          {
            icon: "🔐",
            title: "저장 데이터 XOR 암호화",
            desc: "세이브 변조/삭제 리스크 완화"
          },
          {
            icon: "🧺",
            title: "Object Pooling + Caching",
            desc: "반복 생성/GC 부담 감소"
          }
        ],
        coreDesign: [
          {
            title: "플레이 흐름 — 이탈 방지",
            oneLiner: "세이브/스테이지 선택으로 “처음부터 다시” 스트레스를 제거",
            how: "How: 스테이지 선택/진행 저장 구조로 반복 도전 UX 구성",
            result: "Result: 플레이 지속성 확보 + 난이도 구간에서 이탈 완화",
            proofCaption: "스테이지 선택 화면 / 진행 저장 UI",
            proofImage: require("./assets/images/nextuLogo.webp")
          },
          {
            title: "레벨/장애물 — 학습 곡선 설계",
            oneLiner: "관찰 → 학습 → 응용의 난이도 곡선으로 재미 유지",
            how: "How: 장애물 패턴을 단계적으로 복잡하게 설계",
            result: "Result: 단순 조작에서도 ‘판단하는 재미’ 강화",
            proofCaption: "스테이지/장애물 플레이 캡처",
            proofImage: require("./assets/images/saayaHealthLogo.webp")
          },
          {
            title: "충돌 최적화 (Collision Optimization)",
            oneLiner: "Collider 단순화 + 불필요 충돌 체크 제거로 성능 회복",
            how: "How: Collider 구조 정리 / ignore 조건으로 충돌 체크 최소화",
            result: "Result: 프레임 안정화 + 입력/조작감 개선",
            proofCaption: "Collision 최적화 관련 코드 캡처",
            proofImage: require("./assets/images/pwaLogo.webp")
          },
          {
            title: "Object Pooling + Caching",
            oneLiner: "반복 생성 대신 재사용으로 GC/CPU 부담 감소",
            how: "How: Object Pooling 적용 + WaitForSeconds 등 코루틴 객체 캐싱",
            result: "Result: 끊김 감소 + 장시간 플레이 안정화",
            proofCaption: "풀링/캐싱 구조 설명 캡처",
            proofImage: require("./assets/images/googleAssistantLogo.webp")
          },
          {
            title: "Raycast 최적화",
            oneLiner: "RaycastAll 비용 제거 → NonAlloc + LayerMask로 최적화",
            how: "How: RaycastNonAlloc 사용 + 필요한 Layer만 감지",
            result: "Result: 메모리 할당 감소 + CPU 비용 절감",
            proofCaption: "Raycast 개선 전/후 코드 캡처",
            proofImage: require("./assets/images/nextuLogo.webp")
          },
          {
            title: "XOR 저장 데이터 보호",
            oneLiner: "세이브 데이터 변조/삭제 리스크를 낮추는 XOR 암호화",
            how: "How: JSON 저장 시 XOR 암호화 적용",
            result: "Result: 데이터 변경 가능성을 시각적으로/구조적으로 낮춤",
            proofCaption: "XOR 저장 로직 캡처",
            proofImage: require("./assets/images/saayaHealthLogo.webp")
          }
        ],
        ops: {
          oneLiner: "Optimization & Stability",
          how: "How: 충돌/풀링/레이캐스트 최적화 및 저장 안정화 적용",
          result: "Result: 프레임 안정화와 장시간 플레이 안정성을 확보"
        },
        links: [
          {
            name: "Steam",
            url: "https://store.steampowered.com/app/2743860/TSEROF/?l=koreana"
          },
          {name: "GitHub", url: "https://github.com/KimEoJin24/TSEROF"},
          {
            name: "YouTube",
            url: "https://www.youtube.com/watch?v=1Lm-lpVsmq8"
          }
        ]
      }
    },

    {
      image: require("./assets/images/nextuLogo.webp"),
      projectName: "아주대탐험 (Ajou Indie Game)",
      projectDesc:
        "대학 캠퍼스를 배경으로 한 캐주얼 액션 어드벤처: Player·Skill·AI·Event 시스템을 Unity로 통합 구현",
      recommendation:
        "스킬·AI·이벤트 시스템을 통합 구현한 캐주얼 액션 어드벤처 게임",
      tags: ["#Unity", "#AI", "#GameSystem"],
      footerLink: [
        {name: "GitHub", url: "https://github.com/toadsam/Ajou_IndiGame"},
        {
          name: "Demo Video",
          url: "https://www.youtube.com/watch?v=mtIiIWmrSdg&feature=youtu.be"
        }
      ],
      details: {
        overview: {
          title: "아주대탐험 (Ajou Indie Game)",
          subtitle:
            "대학 캠퍼스를 배경으로 한 캐주얼 액션 어드벤처: Player·Skill·AI·Event 시스템을 Unity로 통합 구현",
          image: require("./assets/images/nextuLogo.webp"),
          caption: "플레이 화면 기반 결과물(인게임 UI·전투·이벤트 흐름)",
          role: "Player/Skill/UI/AI/Event 구현",
          period: "2024.08 - 2024.12",
          techStack: [
            "Engine: Unity",
            "Language: C#",
            "Key Features: NavMesh, UI System, Event System, Skill System"
          ]
        },
        intro: {
          headline: "What is Ajou Indie Game?",
          highlight:
            "캠퍼스 탐험형 액션/성장 게임의 코어 루프를 통합 설계한 인디 프로젝트",
          problem:
            "캠퍼스 탐험형 액션/성장 게임에서 “플레이 흐름(이동-전투-성장-진행)”이 끊기지 않게 시스템을 연결해야 했다.",
          solution:
            "Core Loop를 기준으로 Player/Skill/UI/AI/Event를 모듈화하고, 서로 연결되는 지점을 명확히 설계했다.",
          outcome:
            "플레이어 조작·성장·전투·이벤트가 하나의 루프로 자연스럽게 이어지는 구조를 완성했다.",
          caption: "플레이 화면 기반 결과물(인게임 UI·전투·이벤트 흐름)",
          images: [require("./assets/images/nextuLogo.webp")]
        },
        quickSummary: [
          {
            icon: "🎮",
            title: "Player Mode Switching",
            desc: "1인칭/3인칭 전환을 안정적으로 연결해 조작 일관성 유지"
          },
          {
            icon: "🧭",
            title: "Level-Up & Random Skill",
            desc: "랜덤 3스킬 선택 + 일시정지로 성장 순간을 명확히 분리"
          },
          {
            icon: "🤖",
            title: "Enemy AI + Boss Pattern",
            desc: "NavMesh 기반 추적과 패턴 설계로 전투 밀도 강화"
          },
          {
            icon: "🧩",
            title: "UI ↔ Game World",
            desc: "상태/퀘스트/상호작용 UI가 월드 진행과 동기화"
          },
          {
            icon: "✨",
            title: "Event Systems",
            desc: "Special Quest/Portal/Summon Skill 이벤트로 루프 확장"
          }
        ],
        coreDesign: [
          {
            title: "Player Mode Switching (1인칭/3인칭)",
            oneLiner: "모드 충돌 없는 컨트롤 전환으로 조작 일관성 확보",
            how:
              "How: 컨트롤러 enable/disable, 카메라 parent 기준 정리, enum/switch로 상태 전환",
            result: "Result: 전환 시 입력 꼬임 없이 동일한 UX 유지",
            proofCaption: "Mode Switching 구조 증명",
            proofImage: require("./assets/images/saayaHealthLogo.webp")
          },
          {
            title: "Level-Up & Random Skill Selection",
            oneLiner: "레벨업 순간 ‘정지-선택-재개’ 루프로 성장 경험 강화",
            how:
              "How: 랜덤 3개 스킬 제시, UI 슬롯 세팅, Time.timeScale=0으로 일시정지 처리",
            result: "Result: 전투 흐름은 유지하면서 선택 UX는 명확하게 분리",
            proofCaption: "Random Skill UI 증명",
            proofImage: require("./assets/images/pwaLogo.webp")
          },
          {
            title: "Enemy AI (NavMesh + Boss Pattern)",
            oneLiner: "NavMesh 기반 추적 + 보스 패턴으로 전투 밀도 설계",
            how: "How: detectRange/attackRange로 상태 분기, AI 상태(추적/공격 등) 구성",
            result: "Result: 일반 몬스터/보스 모두 예측 가능한 규칙 위에서 난이도 조절",
            proofCaption: "NavMesh AI / Boss Pattern 증명",
            proofImage: require("./assets/images/nextuLogo.webp")
          },
          {
            title: "UI ↔ Game World",
            oneLiner: "UI가 ‘정보 표시’가 아니라 ‘게임 진행의 일부’가 되게 설계",
            how: "How: 퀘스트/상태/상호작용 UI가 월드 오브젝트/진행 상태와 동기화",
            result: "Result: 플레이 중 ‘다음 행동’이 UI로 자연스럽게 안내됨",
            proofCaption: "UI-월드 동기화 증명",
            proofImage: require("./assets/images/googleAssistantLogo.webp")
          }
        ],
        links: [
          {name: "GitHub", url: "https://github.com/toadsam/Ajou_IndiGame"},
          {
            name: "Demo Video",
            url: "https://www.youtube.com/watch?v=mtIiIWmrSdg&feature=youtu.be"
          }
        ]
      }
    },

    {
      image: require("./assets/images/googleAssistantLogo.webp"),
      projectName: "The Other Side (VR Horror Game)",
      projectDesc: "XR Interaction Toolkit 기반 VR 공포 퍼즐 탈출 게임",
      recommendation: "XR Interaction Toolkit 기반 VR 공포 퍼즐 탈출 게임",
      tags: ["#VR", "#XR", "#Unity"],
      footerLink: [],
      details: {
        overview: {
          title: "The Other Side",
          subtitle:
            "Unity XR 기반 1인칭 VR 공포 퍼즐 게임 (상태 기반 AI, 인터랙션 중심 설계)",
          image: require("./assets/images/googleAssistantLogo.webp"),
          caption: "VR 플레이 화면 및 퍼즐/추적 장면",
          role: "VR 인터랙션/AI 설계",
          period: "2024.07 - 2024.10",
          techStack: [
            "Engine: Unity",
            "VR: XR Interaction Toolkit",
            "AI: NavMesh, State Machine",
            "Platform: PC VR (Meta / SteamVR)"
          ]
        },
        intro: {
          headline: "What is The Other Side?",
          highlight: "상호작용과 추적 패턴을 중심으로 설계한 VR 공포 퍼즐 게임",
          problem:
            "VR 공포 게임에서 단순 점프 스케어 위주의 연출은 몰입도가 빠르게 떨어짐",
          solution:
            "XR Interaction Toolkit 기반 자연스러운 오브젝트 상호작용 설계 + 상태 머신 AI + 퍼즐 연계 레벨 흐름 구성",
          outcome:
            "VR 환경에서도 조작 부담이 적은 퍼즐 중심 공포 게임 구현 및 몰입형 플레이 경험 제공",
          caption: "VR 플레이 화면 및 퍼즐/추적 장면",
          images: [
            require("./assets/images/googleAssistantLogo.webp"),
            require("./assets/images/saayaHealthLogo.webp")
          ]
        },
        quickSummary: [
          {
            icon: "🕶️",
            title: "VR 상호작용 중심 설계",
            desc: "Grab/Ray/Socket 기반 퍼즐 인터랙션 구현"
          },
          {
            icon: "👾",
            title: "상태 기반 몬스터 AI",
            desc: "거리·시야 조건으로 대기/추적/공격 상태 전환"
          },
          {
            icon: "🧩",
            title: "퍼즐 연계 월드 구조",
            desc: "오브젝트 조합·트리거로 이어지는 퍼즐 흐름"
          },
          {
            icon: "🎢",
            title: "VR UX 최적화",
            desc: "시점 흔들림 최소화 + 상호작용 피드백 강화"
          },
          {
            icon: "🧱",
            title: "확장 가능한 구조",
            desc: "스테이지/퍼즐/AI 로직 확장에 유리한 설계"
          }
        ],
        coreDesign: [
          {
            title: "XR Interaction Toolkit 기반 상호작용",
            oneLiner:
              "VR 환경에 맞춘 Grab / Ray / Socket 상호작용으로 퍼즐 조작을 직관화",
            how:
              "How: XR Grab Interactable로 집기 + Ray Interactor로 원거리 선택 + Socket 조합 설계",
            result: "Result: VR 초보자도 이해하기 쉬운 상호작용 UX 완성",
            proofCaption: "XR Interactor 설정 화면 및 퍼즐 오브젝트 캡처",
            proofImage: require("./assets/images/nextuLogo.webp")
          },
          {
            title: "상태 기반 몬스터 AI",
            oneLiner:
              "플레이어 조건에 따라 행동이 달라지는 상태 머신 기반 AI 구현",
            how:
              "How: Idle/Chase/Attack 상태 분리 + 거리/시야 조건 전환 + NavMesh 추적 이동",
            result: "Result: 예측 불가능한 추적 패턴으로 공포 몰입도 상승",
            proofCaption: "몬스터 AI 스크립트 및 추적 장면 캡처",
            proofImage: require("./assets/images/pwaLogo.webp")
          },
          {
            title: "퍼즐 중심 레벨 구조",
            oneLiner:
              "단서 수집과 환경 상호작용으로 진행되는 퍼즐 기반 스테이지 설계",
            how:
              "How: 트리거 이벤트로 단계 관리 + 조건 충족 시 공간 개방 + 실패 시 긴장 요소 연계",
            result: "Result: 단순 이동이 아닌 사고를 요구하는 VR 플레이 경험 제공",
            proofCaption: "퍼즐 오브젝트 및 이벤트 흐름 캡처",
            proofImage: require("./assets/images/saayaHealthLogo.webp")
          },
          {
            title: "VR UX 안정화 설계",
            oneLiner: "VR 멀미를 줄이기 위한 시점·이동·인터랙션 설계",
            how:
              "How: 카메라 이동 최소화 + 즉각 피드백 제공 + 순간 이동/안전 거리 유지",
            result: "Result: 장시간 플레이에도 부담이 적은 VR UX 확보",
            proofCaption: "플레이 시점 설정 및 이동 방식 캡처",
            proofImage: require("./assets/images/googleAssistantLogo.webp")
          }
        ],
        links: []
      }
    },

    {
      image: require("./assets/images/pwaLogo.webp"),
      projectName: "AR Monster Shooter",
      projectDesc:
        "AR Plane Scan 기반 전투 공간 자동 생성 + 웨이브/보스 트리거 슈터",
      recommendation: "AR Plane 스캔 기반 전투 공간 생성 슈터 데모 프로젝트",
      tags: ["#AR", "#Unity", "#Shooter"],
      footerLink: [],
      details: {
        overview: {
          title: "AR Monster Shooter",
          subtitle:
            "Unity AR Foundation 기반 AR 전투 게임 — Plane Scan으로 공간 고정 후 웨이브/보스 전투 진행",
          image: require("./assets/images/pwaLogo.webp"),
          caption: "AR Plane Scan 기반 전투 공간 생성 및 전투 진행 화면",
          role: "AR 전투 로직/스폰/무기 시스템 구현",
          period: "2024.06 - 2024.08",
          techStack: ["Engine: Unity", "Platform: AR (AR Foundation)", "Language: C#"]
        },
        intro: {
          headline: "What is AR Monster Shooter?",
          highlight: "AR Plane Scan 기반 전투 공간을 자동 생성하는 슈터 게임",
          problem:
            "AR 환경에서 전투를 진행하려면 현실 공간 기준의 전투 영역 고정이 필요함",
          solution:
            "Plane Detection으로 전투 공간을 스캔하고, boundary 기반 바닥/벽 자동 생성 + 웨이브/보스 트리거를 적용",
          outcome:
            "현실 공간 크기에 맞춰 전투 맵이 자동 생성되어 몰입도가 높아지고, 웨이브→보스 전환 구조가 안정화됨",
          caption: "AR Plane Scan 기반 전투 공간 생성 및 전투 진행 화면",
          images: [
            require("./assets/images/pwaLogo.webp"),
            require("./assets/images/saayaHealthLogo.webp")
          ]
        },
        quickSummary: [
          {
            icon: "🧭",
            title: "Plane Scan 전투 공간 고정",
            desc: "Plane Detection으로 전투 영역을 고정하고 전투 진행"
          },
          {
            icon: "🧱",
            title: "boundary 기반 바닥/벽 자동 생성",
            desc: "boundary를 월드 좌표로 변환해 바닥 스케일 + 4방향 벽 생성"
          },
          {
            icon: "📍",
            title: "스폰 포인트 자동 생성 + 스포너 이동",
            desc: "floorCorners 기반 스폰 포인트 배열 생성 + 랜덤 스포너 이동"
          },
          {
            icon: "🌊",
            title: "웨이브 스폰 + 보스 트리거",
            desc: "spawnInterval 웨이브 진행 + counterBoss 조건에서 보스 전환"
          },
          {
            icon: "🎮",
            title: "무기 발사 + 잠금/쿨타임",
            desc: "조이스틱 발사 + isUnlocked/nextFire로 전투 템포 제어"
          }
        ],
        coreDesign: [
          {
            title: "Plane Scan → 전투 공간 고정",
            oneLiner:
              "Plane Detection으로 전투 공간을 ‘고정’하고 이후 전투를 해당 영역 기준으로 진행",
            how:
              "How: 평면 탐지 ON/OFF 토글 + boundary 월드 좌표 변환 + 스캔 종료 시 탐지/시각화 비활성화",
            result:
              "Result: 스캔 이후 전투 영역이 흔들리지 않고 현실 공간 기준으로 안정적인 전투 진행",
            proofCaption: "Plane Scan 코드 캡처 + AR 스캔 전/후 화면",
            proofImage: require("./assets/images/pwaLogo.webp")
          },
          {
            title: "boundary 기반 바닥/벽 생성 로직",
            oneLiner:
              "boundary를 수집해 min/max 범위를 계산하고 바닥 스케일링 + 4방향 벽 생성",
            how:
              "How: allWorldPoints 수집 + min/max 계산 + 바닥 스케일 조정 + CreateWall 로직",
            result:
              "Result: 사용자 공간 크기에 맞는 전투 맵이 자동 구성되어 플레이 일관성 향상",
            proofCaption: "boundary 기반 맵 확장 코드 캡처 + 바닥/벽 결과",
            proofImage: require("./assets/images/nextuLogo.webp")
          },
          {
            title: "스폰 포인트 자동 생성 + 스포너 이동",
            oneLiner:
              "바닥 꼭짓점(floorCorners) 기반으로 스폰 포인트를 만들고 스포너를 랜덤 이동",
            how:
              "How: floorCorners 기반 스폰 배열 생성 + isGameStart 이후 랜덤 위치 갱신",
            result:
              "Result: AR 공간 변화에도 스폰이 분산되고 전투 리듬이 단조롭지 않게 진행",
            proofCaption: "스포너 이동/랜덤 스폰 코드 캡처 + 스폰 장면",
            proofImage: require("./assets/images/saayaHealthLogo.webp")
          },
          {
            title: "웨이브 스폰 + 보스 트리거",
            oneLiner:
              "spawnInterval로 웨이브를 진행하고 counterBoss 조건 달성 시 보스 소환",
            how:
              "How: 일반 몬스터 스폰 + 처치 카운트 누적 → bossOn 트리거",
            result:
              "Result: 스폰→처치 누적→보스 등장 흐름이 명확해져 게임 구조가 선명해짐",
            proofCaption: "웨이브/보스 트리거 코드 캡처 + 보스 등장 화면",
            proofImage: require("./assets/images/pwaLogo.webp")
          },
          {
            title: "무기 발사(조이스틱) + 잠금/쿨타임 제어",
            oneLiner:
              "조이스틱 입력 기반 발사에 잠금/쿨타임을 붙여 조작감과 전략적 깊이 향상",
            how:
              "How: 입력 방향 감지 + nextFire 쿨타임 + isUnlocked 잠금 + 카메라 기준 조준",
            result:
              "Result: 무기별 전투 템포가 살아나고 상황에 맞는 전략 운용 가능",
            proofCaption:
              "WeaponShooterWithJoystick 코드 캡처 + 무기(활/칼/마법/총) UI/플레이",
            proofImage: require("./assets/images/googleAssistantLogo.webp")
          }
        ],
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








