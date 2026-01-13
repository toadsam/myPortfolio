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
  title: "웹을 주력으로,\n운영 문제까지 해결하는\n개발자 정재훈",
  subTitle: emoji(`React · Spring Boot 기반 Full-Stack(Web) 개발
인증·보안(Refresh Rotation)과 운영 이슈(HTTPS·CORS) 해결 경험
Unity XR·게임 개발 경험 보유`),
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
      logo: require("./assets/images/아주대로고.png"),
      subHeader: "디지털미디어학과 (전공)",
      duration: "2021.03 ~ 2026.02 (예정)",
      desc: "웹/소프트웨어 엔지니어링 중심으로 학습하며 서비스 구조 설계와 구현 역량을 확장했습니다.",
      descBullets: [
        "웹(React/Spring Boot) 중심 프로젝트 경험",
        "Unity XR/AR 프로젝트로 인터랙션 경험 확장"
      ]
    },
    {
      schoolName: "코드잇",
      logo: require("./assets/images/코드잇.png"),
      subHeader: "대학생코딩캠프",
      duration: "2021.03 ~ 2021.04",
      desc: "프로그래밍에 대한 기초 이해와 웹 개발 전반에 대한 감각을 익혔습니다.",
      descBullets: ["프로그래밍에 대한 기초 이해 확장"]
    },
    {
      schoolName: "구름",
      logo: require("./assets/images/구름.png"),
      subHeader: "군장병 AI/SW 역량강화",
      duration: "2023.3 ~ 2023.12",
      desc: "HTML, CSS, JavaScript대한 기초 감각을 익혔습니다.",
      descBullets: ["프론트엔드 기초 감각 확장"]
    },
    
    {
      schoolName: "스파르타 내일 배움 캠프",
      logo: require("./assets/images/스파르타.png"),
      subHeader: "Unity 게임개발자 양성과정",
      duration: "2023.09 ~ 2024.02",
      desc: "Unity 기반 게임 개발 역량을 확장했습니다.",
      descBullets: ["Unity 기반 게임 개발 프로젝트 경험"]
    },
    {
      schoolName: "아주대학교",
      logo: require("./assets/images/아주대로고.png"),
      subHeader: "인공지능 융합학과 (복수전공)",
      duration: "2021.03 ~ 2026.02 (예정)",
      desc: "AI/데이터 기반 개발 역량을 함께 확장하고 있습니다.",
      descBullets: ["웹 개발과의 융합 관점으로 프로젝트 경험"]
    },
    {
      schoolName: "아주대학교",
      logo: require("./assets/images/아주대로고.png"),
      subHeader: "메타버스기획마이크로전공 (부전공)",
      duration: "2021.03 ~ 2026.02 (예정)",
      desc: "메타버스 플랫폼에서 상호작용 콘텐츠를 제작했습니다.",
      descBullets: ["메타버스 플랫폼 콘텐츠 제작 경험"]
    }
  ]
};

// Your top 3 proficient stacks/tech experience

const techStack = {
  viewSkillBars: true, //Set it to true to show Proficiency Section
  experience: [
    {
      Stack: "Web (Frontend)",
      progressPercentage: "60%"
    },
    {
      Stack: "Web (Backend)",
      progressPercentage: "80%"
    },
    {
      Stack: "Game/XR",
      progressPercentage: "80%"
    }
  ],
  displayCodersrank: false // Set true to display codersrank badges section need to changes your username in src/containers/skillProgress/skillProgress.js:17:62, defaults to false
};

// Work experience section

const workExperiences = {
  display: false, //Set it to true to show workExperiences Section
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

  projects: [
    {
      image: require("./assets/images/득근득근/득근득근로고.png"),
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
          image: require("./assets/images/득근득근/득근득근메인화면.png"),
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
      }
    },

    {
      image: require("./assets/images/AjouCampusFood/ACF로고.png"),
      projectName: "Ajou Campus Foodmap",
      projectDesc:
        "세션 기반 OAuth 로그인 + 맛집 등록 워크플로우를 포함한 Full-Stack 서비스",
      recommendation:
        "세션 기반 OAuth 로그인과 맛집 등록 플로우를 구현한 캠퍼스 지도 서비스",
      tags: ["#FullStack", "#OAuth", "#Workflow"],
      footerLink: [
        {
          name: "GitHub Client",
          url: "https://github.com/toadsam/pwd-week6-client"
        },
        {
          name: "GitHub Server",
          url: "https://github.com/toadsam/pwd-week6-server"
        }
      ],
      details: {
        overview: {
          title: "Ajou Campus Foodmap",
          subtitle:
            "React(Vite) + Express + MongoDB 기반 맛집 지도/등록 서비스 (Local/OAuth 로그인, 운영 배포 포함)",
          image: require("./assets/images/AjouCampusFood/ACF메인화면.png"),
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
          images: [require("./assets/images/AjouCampusFood/ACF수락화면.png")]
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
            oneLiner:
              "운영/로컬 환경 차이로 생기는 URL·DB 연결 오류를 환경변수 분기로 차단",
            how: "How: Client 환경별 API URL 분기 + Server mongoose 옵션/운영 DB 분리 + 배포 환경변수 매핑",
            result:
              "Result: 배포 환경에서도 설정 충돌/연결 불안정 감소, 운영 안정성 확보",
            proofCaption: "환경변수/DB 커넥션/배포 설정 캡처",
            proofImage: require("./assets/images/AjouCampusFood/ACF환경분리코드.png")
          },
          {
            title: "교차 도메인 세션 유지 (SPA + API 분리)",
            oneLiner:
              "서버/클라이언트 분리 환경에서도 쿠키 기반 로그인 세션이 끊기지 않게 유지",
            how: "How: axios withCredentials + CORS allowlist/credentials=true 적용",
            result: "Result: 운영에서도 로그인 상태 유지/세션 기반 기능 안정화",
            proofCaption: "withCredentials 코드 + CORS 설정 캡처",
            proofImage: require("./assets/images/AjouCampusFood/ACF교차도메인코드.png")
          },
          {
            title: "Session + MongoStore — 세션 DB 저장",
            oneLiner:
              "세션을 메모리가 아닌 DB에 저장해 서버 재시작/HTTPS에서도 로그인 지속",
            how: "How: session store를 MongoStore로 구성 + credentials/origin 정책 적용",
            result: "Result: 배포/재시작 환경에서도 세션 유지, 운영 이슈 감소",
            proofCaption: "MongoStore 코드 + DB 저장 확인 캡처",
            proofImage: require("./assets/images/AjouCampusFood/ACF 서버 재시작 대응.png")
          },
          {
            title: "Passport Local + bcrypt — 기본 로그인 보안",
            oneLiner:
              "Passport Local 인증 + bcrypt 해시로 비밀번호 저장/검증을 표준화",
            how: "How: serialize/deserialize + UserSchema pre-save bcrypt 적용",
            result: "Result: 보안/인증 흐름 명확화, 세션 기반 UX 안정화",
            proofCaption: "serialize/deserialize + bcrypt 코드 캡처",
            proofImage: require("./assets/images/AjouCampusFood/ACF 비밀번호 보호코드.png")
          },
          {
            title: "OAuth(Google/Naver) + 운영/권한(관리자)",
            oneLiner:
              "OAuth 로그인과 관리자 권한 제어를 붙여 ‘운영 가능한 서비스’로 완성",
            how: "How: Passport Strategy + req.login() 세션 생성 + 관리자 미들웨어/시드 스크립트",
            result:
              "Result: 운영 측면(관리자 기능 보안/계정 관리)까지 포함한 실서비스 구조",
            proofCaption: "권한 미들웨어 코드 + admin seed 캡처",
            proofImage: require("./assets/images/AjouCampusFood/ACF 소셜로그인코드.png")
          }
        ],
        ops: {
          oneLiner:
            "Issue: 서버 기반 인증·권한 검증을 통한 관리자 기능 접근 제어",
          how: "초기 관리자 계정 생성을 위한 운영 스크립트 제공으로 권한 관리 단순화",
          result: "권한 검증이 서버 중심으로 일관되게 적용되어 관리자 기능의 보안 안정성 ",
          proofCaption: "관리자 권한 코드 캡처",
          proofImage: require("./assets/images/AjouCampusFood/ACF관리자코드.png")
        },
        links: [
          {
            name: "GitHub (Client)",
            url: "https://github.com/toadsam/pwd-week6-client"
          },
          {
            name: "GitHub (Server)",
            url: "https://github.com/toadsam/pwd-week6-server"
          }
        ]
      }
    },

    {
      image: require("./assets/images/aclub로고.png"),
      projectName: "aClub",
      projectDesc:
        "동아리/소모임 운영형 홍보·정보 제공 웹 + 유입/행동 분석 기반 개선",
      recommendation:
        "실사용 운영에서 ‘문의 감소·참여 동선 명확화’를 목표로 만든 운영형 웹 서비스",
      tags: ["#WebService", "#Operations", "#UX", "#Analytics"],
      footerLink: [{name: "aClub", url: "https://ajouclub.co.kr"}],
      details: {
        overview: {
          title: "aClub - 프로젝트 개요",
          subtitle:
            "동아리 공지·모집·행사·자료 정보를 한 곳에 정리하고, 데이터/피드백으로 반복 개선한 운영형 웹",
          image: require("./assets/images/aclub/동아리홈페이지 메인.jpg"),
          caption: "메인 / 모집 / 공지 / 상세(신청·문의) 화면",
          role: "Frontend 개발 + 운영 구조 설계 + 분석(GA4/GSC) 기반 개선",
          period: "2025.01 - 2025.04 - 리메이크 중",
          techStack: [
            "Frontend: React, Vite, Axios",
            "Analytics: GA4, Google Search Console",
            "Deploy: Vercel, Cloudflare",
            "Tooling: Notion, Figma"
          ]
        },
        intro: {
          headline: "What is aClub?",
          highlight:
            "동아리 정보를 ‘탐색→확인→참여’ 흐름으로 설계하고 운영 개선까지 연결한 웹",
          problem:
            "동아리 정보가 흩어져 있어 유입 후 ‘어디서 확인하고 어떻게 참여하는지’가 불명확했고, 같은 문의가 반복됨",
          solution:
            "모집/공지/행사/자료 구조를 사용자 흐름 기준으로 재구성 + CTA(신청/문의/링크) 배치 최적화 + GA4/GSC로 이탈/클릭 구간을 확인하며 지속 수정",
          outcome:
            "정보 도달 시간이 줄고 참여 동선이 단순해져, 운영자가 반복 안내하던 문의를 줄이며 운영 효율을 개선",
          caption: "메인→상세→참여 CTA 흐름 / 개선 전후 비교 캡처",
          images: [
            require("./assets/images/aclub/동아리 세부 저장.jpg")
          ]
        },
        quickSummary: [
          {
            icon: "🧩",
            title: "기능 개발",
            desc:
              "모집/공지/행사/자료 페이지와 상세 화면을 컴포넌트 기반으로 구현하고, 사용자 동선 중심 라우팅 구조 설계"
          },
          {
            icon: "🧭",
            title: "정보 구조·UX",
            desc:
              "메뉴/카테고리를 단순화하고, 핵심 행동(신청·문의) CTA를 ‘바로 보이는 위치’로 재배치"
          },
          {
            icon: "📈",
            title: "데이터 기반 개선",
            desc:
              "GA4로 페이지 흐름/체류/이벤트를, GSC로 검색 유입/CTR을 확인해 개선 포인트를 근거로 확정"
          },
          {
            icon: "🛠️",
            title: "운영 피드백 반영",
            desc:
              "배포 후 반복 문의/혼선이 생기는 구간을 수집해 문구·배치·링크 구조를 빠르게 개선"
          },
          {
            icon: "🚀",
            title: "배포·운영",
            desc:
              "운영 사이트를 안정적으로 배포하고, 변경 사항을 빠르게 반영할 수 있는 운영 프로세스 유지"
          }
        ],
        coreDesign: [
          {
            title: "동아리 참여 동선 설계(UX)",
            oneLiner: "유입 후 ‘참여’까지 막히지 않도록 동선을 짧게 설계",
            how:
              "How: 메인에서 모집/행사 진입 → 상세에서 핵심 정보 요약 → 하단 고정 CTA(신청/문의/링크)로 행동 유도",
            result:
              "Result: ‘어디서 신청해요?’ 같은 반복 문의 감소 + 참여 전환 흐름 강화",
            proofCaption: "메인/상세/CTA 위치 전후 비교 캡처",
            proofImage: require("./assets/images/aclub/동아리 소확회 저장.jpg")
          },
          {
            title: "운영 피드백 반영(실사용 개선)",
            oneLiner: "Everytime/카카오톡 유입을 ‘바로 행동’으로 연결",
            how:
              "How: 홍보 글/공지 링크를 메인·모집 상세로 연결하고, 상세 상단에 신청/문의 CTA를 고정 배치해 진입 즉시 행동 가능하게 설계",
            result:
              "Result: Result: 홍보→유입→참여 흐름이 명확해져 전환 동선 강화",
            proofCaption: "Everytime 홍보글/카톡 공지 + 랜딩 화면(CTA 위치) 캡처",
            proofImage: require("./assets/images/aclub/동아리에타카톡.png")
          },
          {
            title: "GA4/GSC 기반 개선 루프",
            oneLiner: "감이 아닌 지표로 운영 개선 우선순위를 결정",
            how:
              "How: GA4 홈 지표(조회수/사용자/참여시간)로 운영 성과를 추적하고, (추가로) 페이지·이벤트 리포트와 GSC 성과를 함께 보며 개선안을 도출",
            result:
              "Result: 운영 개선을 ‘측정→수정→검증’ 루프로 반복 가능하게 정착",
            proofCaption: "GA4 핵심 지표(조회수/사용자/참여시간) 캡처",
            proofImage: require("./assets/images/aclub/동아리분석.png")
          },
          {
            title: "토큰 기반 인증(자동 재발급)",
            oneLiner: "Access Token 만료 상황을 사용자에게 노출하지 않는 인증 흐름 구현",
            how: "How: Access Token 만료(401) 시 HttpOnly Refresh Token 쿠키로 재발급 요청을 보내고, 새 토큰으로 기존 API 요청을 자동 재시도하도록 구성",
            result: "Result: 로그인 유지 경험 개선 + 운영 중 인증 오류/재로그인 요구 감소",
            proofCaption: "401 발생 시 Refresh Token 기반 Access Token 자동 재발급 및 재요청 처리 코드",
            proofImage: require('./assets/images/aclub/동아리토큰코드.png')
          }
        ],
        links: [{name: "aClub", url: "https://ajouclub.co.kr"}]
      }
    },

    {
      image: require("./assets/images/아주총/총학홈페이지.jpg"),
      projectName: "ajouchong",
      projectDesc:
        "총학생회 운영형 홍보·정보 제공 웹 + 운영 피드백·데이터 기반 개선",
      recommendation:
        "실사용 운영에서 반복 문의를 줄이고 ‘공지→확인→신청’ 동선을 명확히 만든 운영형 웹 서비스",
      tags: ["#WebService", "#Operations", "#UX", "#Analytics"],
      footerLink: [{name: "ajouchong", url: "https://ajouchong.com"}],
      details: {
        overview: {
          title: "ajouchong - 프로젝트 개요",
          subtitle:
            "총학생회 공지·행사·지원·자료·신청 정보를 한 곳에 정리하고, 운영 피드백과 분석 지표로 지속 개선",
          image: require("./assets/images/ajouchong_main.webp"),
          caption: "메인 / 공지 / 자료 / 상세(신청) 화면",
          role: "Frontend 개발 + 운영 구조 설계 + GA4/GSC 분석 기반 개선",
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
          highlight:
            "총학생회 운영 정보를 사용자 흐름 기준으로 재구성하고, 배포 후 피드백·데이터로 개선한 운영형 웹",
          problem:
            "유입 이후 필요한 정보(공지/지원/신청/자료)가 분산되어 ‘어디서 무엇을 해야 하는지’ 혼선이 생기고 문의/이탈이 반복됨",
          solution:
            "정보 구조(메뉴·카테고리·상세)를 ‘탐색→확인→신청’ 흐름으로 재설계 + CTA/문구/링크를 운영 피드백과 지표 기반으로 반복 개선",
          outcome:
            "정보 도달 시간이 줄고 참여 동선이 명확해져 반복 문의가 감소하고 운영 효율이 개선됨",
          caption: "메인→상세→참여(신청/문의) CTA 흐름 및 개선 포인트",
          images: [
            require("./assets/images/ajouchong_flow.webp"),
            require("./assets/images/ajouchong_analytics.webp")
          ]
        },
        quickSummary: [
          {
            icon: "🧩",
            title: "프론트 기능 구현",
            desc:
              "공지/행사/지원/자료/신청 흐름을 페이지 단위로 구성하고 라우팅 기반 탐색 구조를 설계"
          },
          {
            icon: "🔍",
            title: "정보 구조·UX",
            desc:
              "메뉴/카테고리를 단순화하고 사용자가 빠르게 ‘필요한 정보→행동’까지 가도록 동선 최적화"
          },
          {
            icon: "📣",
            title: "운영형 홍보",
            desc:
              "공지/안내 콘텐츠를 운영 목적에 맞게 구조화하고 핵심 CTA로 참여를 유도"
          },
          {
            icon: "📈",
            title: "유입·행동 분석",
            desc:
              "GA4/GSC로 유입·CTR·체류·이벤트를 확인해 개선 우선순위를 결정"
          },
          {
            icon: "🛠️",
            title: "피드백 반영 개선",
            desc:
              "배포 후 반복 문의가 생기는 지점을 수집해 문구·배치·링크 구조를 빠르게 수정"
          }
        ],
        coreDesign: [
          {
            title: "정보 구조·탐색 UX",
            oneLiner: "공지/지원/신청을 ‘찾기→확인→신청’ 흐름으로 재구성",
            how:
              "How: 메뉴/카테고리 구조를 정리하고, 상세 화면에 핵심 정보 요약 + CTA(신청/문의/링크)를 명확한 위치에 배치",
            result:
              "Result: ‘어디서 신청하나요?’ 같은 반복 문의 감소 + 필요한 정보 도달 속도 향상",
            proofCaption: "메인/메뉴 구조/상세 CTA 영역 캡처(전후 비교 추천)",
            proofImage: require("./assets/images/ajouchong_ux.webp")
          },
          {
            title: "운영 피드백 반영(실사용 개선)",
            oneLiner:
              "운영 중 발생한 혼선 구간을 빠르게 수정하는 개선 루프 구축",
            how:
              "How: 자주 들어오는 질문/혼선 포인트를 기준으로 안내 문구를 짧고 명확하게 수정하고, 버튼 라벨·배치·링크 위치를 행동 중심으로 개선",
            result:
              "Result: 운영자 안내 부담 감소 + 사용자 self-serve(스스로 해결) 비율 증가",
            proofCaption: "문구/버튼/배치 수정 캡처(피드백 반영 사례)",
            proofImage: require("./assets/images/ajouchong_feedback.webp")
          },
          {
            title: "유입·행동 분석(운영 개선 루프)",
            oneLiner: "감이 아닌 지표로 개선 포인트를 확정",
            how:
              "How: GA4로 페이지 흐름/체류/이벤트를 확인하고, GSC로 검색 유입/CTR을 확인해 콘텐츠/랜딩 구조 개선 근거를 확보",
            result:
              "Result: 개선의 우선순위와 효과를 설명 가능한 형태로 축적",
            proofCaption: "GA4/GSC 화면 또는 핵심 지표 캡처",
            proofImage: require("./assets/images/ajouchong_ga4gsc.webp")
          }
        ],
        links: [{name: "ajouchong", url: "https://ajouchong.com"}]
      }
    },

    {
      image: require("./assets/images/트세로프/트세로프로고.png"),
      projectName: "TSEROF",
      projectDesc: "출시/배포까지 완료한 3D 액션 플랫폼 게임",
      recommendation: "출시·배포까지 완주한 3D 액션 플랫폼 게임 프로젝트",
      tags: ["#Unity", "#GameDev", "#3D"],
      footerLink: [],
      details: {
        overview: {
          title: "TSEROF — 프로젝트 개요",
          subtitle: "출시/배포까지 완료한 3D 액션 플랫폼 게임",
          image: require("./assets/images/트세로프/트세로프로고.png"),
          caption: "게임 플레이/스테이지 선택 화면",
          role: "게임 시스템/플레이 로직 구현",
          period: "2023.11 - 2024.02",
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
            require("./assets/images/트세로프/트세로프난이도선택.png")
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
            oneLiner:
              "세이브/스테이지 선택으로 “처음부터 다시” 스트레스를 제거",
            how: "How: 스테이지 선택/진행 저장 구조로 반복 도전 UX 구성",
            result: "Result: 플레이 지속성 확보 + 난이도 구간에서 이탈 완화",
            proofCaption: "스테이지 선택 화면 / 진행 저장 UI",
            proofImage: require("./assets/images/트세로프/트세로프 저장.png")
          },
          {
            title: "레벨/장애물 — 학습 곡선 설계",
            oneLiner: "관찰 → 학습 → 응용의 난이도 곡선으로 재미 유지",
            how: "How: 장애물 패턴을 단계적으로 복잡하게 설계",
            result: "Result: 단순 조작에서도 ‘판단하는 재미’ 강화",
            proofCaption: "스테이지/장애물 플레이 캡처",
            proofImage: require("./assets/images/트세로프/트세로프난이도.png")
          },
          {
            title: "충돌 최적화 (Collision Optimization)",
            oneLiner: "Collider 단순화 + 불필요 충돌 체크 제거로 성능 회복",
            how: "How: Collider 구조 정리 / ignore 조건으로 충돌 체크 최소화",
            result: "Result: 프레임 안정화 + 입력/조작감 개선",
            proofCaption: "Collision 최적화 관련 코드 캡처",
            proofImage: require("./assets/images/트세로프/트세로프충돌개선코드.png")
          },
          {
            title: "Object Pooling + Caching",
            oneLiner: "반복 생성 대신 재사용으로 GC/CPU 부담 감소",
            how: "How: Object Pooling 적용 + WaitForSeconds 등 코루틴 객체 캐싱",
            result: "Result: 끊김 감소 + 장시간 플레이 안정화",
            proofCaption: "풀링/캐싱 구조 설명 캡처",
            proofImage: require("./assets/images/트세로프/트세로프고드름코드.png")
          },
          {
            title: "Raycast 최적화",
            oneLiner: "RaycastAll 비용 제거 → NonAlloc + LayerMask로 최적화",
            how: "How: RaycastNonAlloc 사용 + 필요한 Layer만 감지",
            result: "Result: 메모리 할당 감소 + CPU 비용 절감",
            proofCaption: "Raycast 개선 전/후 코드 캡처",
            proofImage: require("./assets/images/트세로프/트세로프레이케이스코드.png")
          }
        ],
        ops: {
          oneLiner: "User Test–Driven UX Improvement",
          how: "How: 실제 플레이어 대상 단계별 유저테스트를 진행하고, 플레이 로그·피드백 기반으로 난이도·UX를 반복 개선",
          result: "Result: 조작 이해도 향상과 초반 이탈 감소, 플레이 흐름 안정화",
          proofImage: require("./assets/images/트세로프/트세로프유저피드백.png"),
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
      image: require("./assets/images/아주대탐험/아주대탐험로고.png"),
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
          image: require("./assets/images/아주대탐험/인게임화면.png"),
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
          images: [require("./assets/images/아주대탐험/치토.png")]
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
            how: "How: 컨트롤러 enable/disable, 카메라 parent 기준 정리, enum/switch로 상태 전환",
            result: "Result: 전환 시 입력 꼬임 없이 동일한 UX 유지",
            proofCaption: "Mode Switching 구조 증명",
            proofImage: require("./assets/images/아주대탐험/아주대탐험1인칭코드.png")
          },
          {
            title: "Level-Up & Random Skill Selection",
            oneLiner: "레벨업 순간 ‘정지-선택-재개’ 루프로 성장 경험 강화",
            how: "How: 랜덤 3개 스킬 제시, UI 슬롯 세팅, Time.timeScale=0으로 일시정지 처리",
            result: "Result: 전투 흐름은 유지하면서 선택 UX는 명확하게 분리",
            proofCaption: "Random Skill UI 증명",
            proofImage: require("./assets/images/아주대탐험/레벨업 ui.png")
          },
          {
            title: "Enemy AI (NavMesh + Boss Pattern)",
            oneLiner: "NavMesh 기반 추적 + 보스 패턴으로 전투 밀도 설계",
            how: "How: detectRange/attackRange로 상태 분기, AI 상태(추적/공격 등) 구성",
            result:
              "Result: 일반 몬스터/보스 모두 예측 가능한 규칙 위에서 난이도 조절",
            proofCaption: "NavMesh AI / Boss Pattern 증명",
            proofImage: require("./assets/images/아주대탐험/아주대탐험몬스터상태분기코드.png")
          },
          {
            title: "UI ↔ Game World",
            oneLiner:
              "UI가 ‘정보 표시’가 아니라 ‘게임 진행의 일부’가 되게 설계",
            how: "How: 퀘스트/상태/상호작용 UI가 월드 오브젝트/진행 상태와 동기화",
            result: "Result: 플레이 중 ‘다음 행동’이 UI로 자연스럽게 안내됨",
            proofCaption: "UI-월드 동기화 증명",
            proofImage: require("./assets/images/아주대탐험/아주대탐험UI활성화비활성화.png")
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
      image: require("./assets/images/VR/VR로고.png"),
      projectName: "The Other Side(VR)",
      projectDesc: "XR Interaction Toolkit 기반 VR 공포 퍼즐 탈출 게임",
      recommendation: "XR Interaction Toolkit 기반 VR 공포 퍼즐 탈출 게임",
      tags: ["#VR", "#XR", "#Unity"],
      footerLink: [],
      details: {
        overview: {
          title: "The Other Side",
          subtitle:
            "Unity XR 기반 1인칭 VR 공포 퍼즐 게임 (상태 기반 AI, 인터랙션 중심 설계)",
          image: require("./assets/images/VR/메인제목.png"),
          caption: "VR 플레이 화면 및 퍼즐/추적 장면",
          role: "VR 인터랙션/AI 설계",
          period: "2025.04 - 2024.6",
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
            require("./assets/images/VR/따라오는 몬스터.png")
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
            how: "How: XR Grab Interactable로 집기 + Ray Interactor로 원거리 선택 + Socket 조합 설계",
            result: "Result: VR 초보자도 이해하기 쉬운 상호작용 UX 완성",
            proofCaption: "XR Interactor 설정 화면 및 퍼즐 오브젝트 캡처",
            proofImage: require("./assets/images/VR/특수한 카메라.png")
          },
          {
            title: "상태 기반 몬스터 AI",
            oneLiner:
              "플레이어 조건에 따라 행동이 달라지는 상태 머신 기반 AI 구현",
            how: "How: Idle/Chase/Attack 상태 분리 + 거리/시야 조건 전환 + NavMesh 추적 이동",
            result: "Result: 예측 불가능한 추적 패턴으로 공포 몰입도 상승",
            proofCaption: "몬스터 AI 스크립트 및 추적 장면 캡처",
            proofImage: require("./assets/images/VR/VR몬스터상태전환코드.png")
          },
          {
            title: "퍼즐 중심 레벨 구조",
            oneLiner:
              "단서 수집과 환경 상호작용으로 진행되는 퍼즐 기반 스테이지 설계",
            how: "How: 트리거 이벤트로 단계 관리 + 조건 충족 시 공간 개방 + 실패 시 긴장 요소 연계",
            result:
              "Result: 단순 이동이 아닌 사고를 요구하는 VR 플레이 경험 제공",
            proofCaption: "퍼즐 오브젝트 및 이벤트 흐름 캡처",
            proofImage: require("./assets/images/VR/VR단서스룹동기화코드.png")
          },
          {
            title: "중앙 제어 구조 설계",
            oneLiner: "AI 중앙 제어 아키텍처",
            how: "How: 감지 로직과 AI 행동 로직을 분리하고, GameManager에서 추적·공격 상태를 일괄 제어",
            result: "Result: 유지보수성 향상 및 조건 기반 AI 제어 확장 가능",
            proofCaption: "플레이 시점 설정 및 이동 방식 캡처",
            proofImage: require("./assets/images/VR/VR중앙제어코드.png")
          }
        ],
        links: []
      }
    },

    {
      image: require("./assets/images/AR/AR로고.png"),
      projectName: "INTO MONSTER POINT(AR)",  
      projectDesc:
        "AR Plane Scan 기반 전투 공간 자동 생성 + 웨이브/보스 트리거 슈터",
      recommendation: "AR Plane 스캔 기반 전투 공간 생성 슈터 데모 프로젝트",
      tags: ["#AR", "#Unity", "#Shooter"],
      footerLink: [],
      details: {
        overview: {
          title: "INTO MONSTER POINT",
          subtitle:
            "Unity AR Foundation 기반 AR 전투 게임 — Plane Scan으로 공간 고정 후 웨이브/보스 전투 진행",
          image: require("./assets/images/AR/게임시작화면.png"),
          caption: "AR Plane Scan 기반 전투 공간 생성 및 전투 진행 화면",
          role: "AR 전투 로직/스폰/무기 시스템 구현",
          period: "2024.06 - 2024.08",
          techStack: [
            "Engine: Unity",
            "Platform: AR (AR Foundation)",
            "Language: C#"
          ]
        },
        intro: {
          headline: "What is INTO MONSTER POINT?",
          highlight: "AR Plane Scan 기반 전투 공간을 자동 생성하는 슈터 게임",
          problem:
            "AR 환경에서 전투를 진행하려면 현실 공간 기준의 전투 영역 고정이 필요함",
          solution:
            "Plane Detection으로 전투 공간을 스캔하고, boundary 기반 바닥/벽 자동 생성 + 웨이브/보스 트리거를 적용",
          outcome:
            "현실 공간 크기에 맞춰 전투 맵이 자동 생성되어 몰입도가 높아지고, 웨이브→보스 전환 구조가 안정화됨",
          caption: "AR Plane Scan 기반 전투 공간 생성 및 전투 진행 화면",
          images: [
            require("./assets/images/AR/보스몬스터 사진.png")
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
            how: "How: 평면 탐지 ON/OFF 토글 + boundary 월드 좌표 변환 + 스캔 종료 시 탐지/시각화 비활성화",
            result:
              "Result: 스캔 이후 전투 영역이 흔들리지 않고 현실 공간 기준으로 안정적인 전투 진행",
            proofCaption: "Plane Scan 코드 캡처 + AR 스캔 전/후 화면",
            proofImage: require("./assets/images/AR/ARplane고정코드.png")
          },
          {
            title: "boundary 기반 바닥/벽 생성 로직",
            oneLiner:
              "boundary를 수집해 min/max 범위를 계산하고 바닥 스케일링 + 4방향 벽 생성",
            how: "How: allWorldPoints 수집 + min/max 계산 + 바닥 스케일 조정 + CreateWall 로직",
            result:
              "Result: 사용자 공간 크기에 맞는 전투 맵이 자동 구성되어 플레이 일관성 향상",
            proofCaption: "boundary 기반 맵 확장 코드 캡처 + 바닥/벽 결과",
            proofImage: require("./assets/images/AR/AR바닥생성코드.png")
          },
          {
            title: "스폰 포인트 자동 생성 + 스포너 이동",
            oneLiner:
              "바닥 꼭짓점(floorCorners) 기반으로 스폰 포인트를 만들고 스포너를 랜덤 이동",
            how: "How: floorCorners 기반 스폰 배열 생성 + isGameStart 이후 랜덤 위치 갱신",
            result:
              "Result: AR 공간 변화에도 스폰이 분산되고 전투 리듬이 단조롭지 않게 진행",
            proofCaption: "스포너 이동/랜덤 스폰 코드 캡처 + 스폰 장면",
            proofImage: require("./assets/images/AR/AR스포너기반몬스터생성코드.png")
          },
          {
            title: "웨이브 스폰 + 보스 트리거",
            oneLiner:
              "spawnInterval로 웨이브를 진행하고 counterBoss 조건 달성 시 보스 소환",
            how: "How: 일반 몬스터 스폰 + 처치 카운트 누적 → bossOn 트리거",
            result:
              "Result: 스폰→처치 누적→보스 등장 흐름이 명확해져 게임 구조가 선명해짐",
            proofCaption: "웨이브/보스 트리거 코드 캡처 + 보스 등장 화면",
            proofImage: require("./assets/images/AR/AR웨이브보스트러거코드.png")
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
  title: emoji("Sub Projects"),
  subtitle: "프로젝트 요약 (한 줄씩)",

  achievementsCards: [
    {
      title: "고양이로부터 지켜라",
      subtitle: "타워 디펜스 게임 1인 개발",
      image: require("./assets/images/서브 프로젝트/고양이로부터 지켜라.png"),
      imageAlt: "고양이로부터 지켜라",
      footerLink: [
          
        ]
    },
    {
      title: "루탄의 카드 게임",
      subtitle:
        "덱 빌딩 카드 게임 개발",
      image: require("./assets/images/서브 프로젝트/르탄게임.png"),
      imageAlt: "덱 빌딩 카드 게임 개발",
      footerLink: [
          {name: "GitHub", url: "https://github.com/KimDaeMins/CardGame"},
          {
            name: "Demo Video",
            url: "https://www.youtube.com/watch?v=fsbsZMmkxDE"
          }
        ]
    },
    {
      title: "내 꿈이 현실의 버그에 침식당하기 시작해서 위험해",
      subtitle:
        "잠든 개발자가 꿈속 코드 세계에서 버그를 해결하는 게임",
      image: require("./assets/images/서브 프로젝트/개발자게임.png"),
      imageAlt: "내 꿈이 현실의 버그에 침식당하기 시작해서 위험해",
      footerLink: [
          {name: "GitHub", url: "https://github.com/phw97123/B10_DreamsComeTrue"},
          {
            name: "Demo Video",
            url: "https://www.youtube.com/watch?v=3ZMRb3Ro87o"

          },
          {
            name: "Notion",
            url: "https://teamsparta.notion.site/10-75e0e926db5b44e7a07f009b57ee577a"

          }
        ]
    },
    {
      title: "스파르타 던전 배틀 (Text 게임)",
      subtitle:
        "나만의 캐릭터를 생성하고, 그 캐릭터를 활용한 텍스트 게임",
      image: require("./assets/images/서브 프로젝트/스파르터 던전 배틀.png"),
      imageAlt: "스파르타 던전 배틀 (Text 게임)",
      footerLink: [
          {name: "GitHub", url: "https://github.com/toadsam/2-1teamproject?tab=readme-ov-file##-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%86%8C%EA%B0%9C"},
          {
            name: "Demo Video",
            url: "https://www.youtube.com/watch?v=akilbeG1NyY"
          },
          {
            name: "Notion",
            url: "https://teamsparta.notion.site/02-BE-077931748646472e87afa346c1c84063"
          }
        
        ]
    },
    {
      title: "Fossil Runner",
      subtitle:
        "섬에서 자원을 모아 성장하고, 용을 처치해 현실로 돌아가는 게임",
      image: require("./assets/images/서브 프로젝트/파슬러너.png"),
      imageAlt: "Fossil Runner",
      footerLink: [
          {name: "GitHub", url: "https://github.com/KimEoJin24/Fossil_Runner"},
          {
            name: "Demo Video",
            url: "https://www.youtube.com/watch?v=Le8jc3p3Z68"
          }
        ]
    },
    {
      title: "MOVYDICK",
      subtitle:
        "이더리옴 고래 활동 추적 및 매매 시점 예측 시스템 개발",
      image: require("./assets/images/서브 프로젝트/MOVYDICK.png"),
      imageAlt: "MOVYDICK",
      footerLink: [
          
          {
            name: "Demo Video",
            url: "https://youtu.be/Ul-gFH8Dd8U"
          },
          {
            name: "Notion",
            url: "https://www.notion.so/1350657d60d380a2bc93cf97bf660b53"
          }
        ]
    },
    {
      title: "NovelKub",
      subtitle:
        "NPC 단서 수집 기반 살인사건 추리 게임",
      image: require("./assets/images/서브 프로젝트/노벨.png"),
      imageAlt: "NovelKub",
      footerLink: [
          {name: "GitHub", url: "https://github.com/jwonp9127/Novelkub"},
          {
            name: "Demo Video",
            url: "https://www.youtube.com/watch?v=Xkv1aamogcA"
          },
          {
            name: "Notion",
            url: "https://teamsparta.notion.site/03-Rumikub-d735d92158cb45b296e8b3b79bd68da0"
          }
        ]
    },
    {
      title: "time rewinder",
      subtitle:
        "Godot 기반 퍼즐 게발",
      image: require("./assets/images/time rewinder2.png"),
      imageAlt: "Time 게임",
      footerLink: [
          {
            name: "Demo Video",
            url: "https://youtu.be/HkcLSAoo6bE"
          }
        ]
    },
    {
      title: "불빛아래",
      subtitle:
        "AI 디자인 적용 3D 공포 게임",
      image: require("./assets/images/서브 프로젝트/불빛아래.png"),
      imageAlt: "AR Monster Shooter",
      footerLink: [
          {name: "GitHub", url: "https://github.com/toadsam/GameEnginePrograming"},
          {
            name: "Demo Video",
            url: "https://www.youtube.com/watch?v=EswL1T42w-w"
          }
        ]
    },
    {
      title: "경복궁을 지켜라",
      subtitle:
        "로블록스 기반으로 제작된 경복궁을 복원하는 게임",
      image: require("./assets/images/경복궁을 지켜라.png"),
      imageAlt: "경복궁을 지켜라",
      footerLink: [
          
          {
            name: "Demo Video",
            url: "https://youtu.be/bhqtLzMQlz0"
          }
        ]
    },
    {
      title: "페스트러너",
      subtitle:
        "곤충을 피해 도망하가는 ar기반 러너 게임",
      image: require("./assets/images/페스트러너.png"),
      imageAlt: "AR Monster Shooter",
      footerLink: [
          {name: "GitHub", url: "https://github.com/HyunmoSeomoon/MetaverseProgramming"},
          {
            name: "Demo Video",
            url: "https://www.youtube.com/watch?v=48f_wfQ1NO4"
          }
        ]
    }
  ],
  display: true // Set false to hide this section, defaults to true
};

// Blogs Section

const blogSection = {
  title: "Development Records",
  subtitle: "개발 기록",
  displayMediumBlogs: "false", // Set true to display fetched medium blogs instead of hardcoded ones
  blogs: [
    {
      url: "https://simple-club-a2b.notion.site/f4211dd073904c08bb779f4504ffa716?v=8b02760b1a944b7592694ffd13e06166&source=copy_link",
      title: "개발하며 기억에 남은 하루의 기록",
      description: "개발 중 인상 깊었던 문제와 배운 점, 그날의 고민을 짧게 정리합니다."
    },
    {
      url: "",
      title: "개발 개념과 구조 학습 정리",
      description: "핵심 개념과 구조를 중심으로 학습 내용을 정리합니다."
    },
    {
      url: "https://simple-club-a2b.notion.site/13a6894d4ed349c983db120db7e3f4c4?v=673a55f82ff1425fb58b291d97917157&p=a44e8eb59dce482ea3960c09bf983e13&pm=s",
      title: "코딩 테스트 문제 풀이 기록",
      description: "문제 풀이 과정과 접근 방식을 정리합니다."
    },
  ],
  display: true // Set false to hide this section, defaults to true
};

// Talks Sections

const talkSection = {
  title: "Values I Believe In",
  subtitle: "개발을 대하는 나만의 기준과 태도",
  values: [
    {
      key: "소통",
      summary: "생각과 상황을 공유하며 방향을 맞춥니다.",
      description: [
        "문제를 혼자 해결하기보다,",
        "상황과 생각을 공유하며 함께 방향을 맞추는 것을 중요하게 생각합니다.",
        "의도를 말로 정리하고 피드백을 주고받는 과정에서",
        "팀의 이해와 결과가 더 좋아진다고 믿습니다."
      ],
      images: [
        require("./assets/images/득근득근/득근득근메인화면.png"),
        require("./assets/images/AjouCampusFood/ACF메인화면.png"),
        require("./assets/images/아주대로고.png"),
        require("./assets/images/saayaHealthLogo.webp")
      ]
    },
    {
      key: "협력",
      summary: "역할을 존중하며 함께 더 나은 결과를 만듭니다.",
      description: [
        "각자의 역할을 존중하며 협업하는 환경을 지향합니다.",
        "혼자 잘하는 것보다,",
        "함께 더 나은 결과를 만드는 과정에 가치를 둡니다."
      ],
      images: [
        require("./assets/images/aclub로고.png"),
        require("./assets/images/AjouCampusFood/ACF환경분리코드.png"),
        require("./assets/images/아주대탐험 제목.png"),
        require("./assets/images/saayaHealthLogo.webp")
      ]
    },
    {
      key: "성실",
      summary: "작은 기록과 반복을 통해 꾸준히 성장합니다.",
      description: [
        "매일 완벽하지 않아도 기록하고 돌아보는 습관을 지켜왔습니다.",
        "작은 공부와 반복이 쌓여",
        "결국 실력이 된다고 믿으며 꾸준함을 중요하게 생각합니다."
      ],
      images: [
        require("./assets/images/트세로프/트세로프로고.png"),
        require("./assets/images/아주대로고.png"),
        require("./assets/images/saayaHealthLogo.webp"),
        require("./assets/images/득근득근/득근득근토큰페기코드.png")
      ]
    },
    {
      key: "도전",
      summary: "익숙함에 머무르지 않고 새로운 시도를 선택합니다.",
      description: [
        "익숙한 방식에 안주하기보다",
        "이해가 필요한 새로운 기술과 구조에 도전하려 합니다.",
        "모르는 것을 마주하는 경험을 성장의 기회로 삼습니다."
      ],
      images: [
        require("./assets/images/ar로고.png"),
        require("./assets/images/득근득근/득근ERD.png"),
        require("./assets/images/AjouCampusFood/ACF수락화면.png"),
        require("./assets/images/아주대탐험 제목.png")
      ]
    }
  ],
  display: true // Set false to hide this section, defaults to true
};

// Podcast Section

const podcastSection = {
  title: "About Me",
  subtitle: `작은 기능도 끝까지 다듬어 ‘운영 가능한 상태’로 만듭니다.
배포 후 생기는 HTTPS·CORS 같은 문제를 로그/설정/네트워크까지 파고들어 해결해왔습니다.
저는 운영과 사용자 소통까지 이어져야 비로소 ‘완성된 개발’이라고 생각합니다.
웹이 주력이지만, Unity XR 경험으로 인터랙션 영역도 다룰 수 있습니다.`,

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
