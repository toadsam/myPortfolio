import resumePdf from "../containers/greeting/resume.pdf";
import {
  bigProjects,
  contactInfo,
  skillsSection,
  socialMediaLinks,
  techStack
} from "../portfolio";

const sourceProjects = bigProjects.projects || [];

const navItems = [
  {label: "About", to: "/about"},
  {label: "Work", to: "/work"},
  {label: "Stack", to: "/stack"},
  {label: "Notes", to: "/notes"},
  {label: "Contact", to: "/contact"}
];

function asArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function joinText() {
  return Array.prototype.slice
    .call(arguments)
    .flatMap(asArray)
    .filter(Boolean)
    .map(function toText(value) {
      return String(value).trim();
    })
    .filter(Boolean)
    .join("\n");
}

function toPreview(value, maxLength) {
  const text = joinText(value).replace(/\s+/g, " ").trim();

  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3).trim() + "...";
}

function unique(items) {
  return items.filter(function filterUnique(item, index) {
    return item && items.indexOf(item) === index;
  });
}

function normalizeSlug(value, fallback) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function getProjectSlug(project, index) {
  const name = project.projectName || "";

  if (name.indexOf("득근") >= 0 || name.indexOf("MuscleUp") >= 0) {
    return "muscle-up";
  }

  if (name.indexOf("Ajou Campus Foodmap") >= 0) {
    return "ajou-campus-foodmap";
  }

  if (name.indexOf("aClub") >= 0) {
    return "aclub";
  }

  if (name.indexOf("총학생회") >= 0) {
    return "ajou-student-council";
  }

  if (name.indexOf("TSEROF") >= 0) {
    return "tserof";
  }

  if (name.indexOf("아주대탐험") >= 0) {
    return "ajou-exploration";
  }

  if (name.indexOf("VR") >= 0 || name.indexOf("The Other Side") >= 0) {
    return "the-other-side-vr";
  }

  if (name.indexOf("AR") >= 0 || name.indexOf("INTO MONSTER POINT") >= 0) {
    return "into-monster-point-ar";
  }

  return normalizeSlug(name, "project-" + (index + 1));
}

function getStack(project) {
  const details = project.details || {};
  const overview = details.overview || {};
  const tags = asArray(project.tags).map(function cleanTag(tag) {
    return String(tag).replace(/^#/, "").trim();
  });
  const stackFromOverview = asArray(overview.techStack).flatMap(
    function parseStack(item) {
      const text = String(item);
      const stackText =
        text.indexOf(":") >= 0 ? text.split(":").slice(1).join(":") : text;

      return stackText.split(",").map(function trimStack(stack) {
        return stack.trim();
      });
    }
  );

  const stack = unique(tags.concat(stackFromOverview)).filter(Boolean);

  if (stack.length) {
    return stack.slice(0, 8);
  }

  return asArray(skillsSection.softwareSkills)
    .map(function mapSkill(skill) {
      return skill.skillName;
    })
    .slice(0, 6);
}

function getCategory(project) {
  const stackText = getStack(project).join(" ");
  const searchable = [
    project.projectName,
    project.projectDesc,
    project.recommendation,
    stackText
  ].join(" ");

  if (/Unity|XR|VR|AR|3D|게임|슈터|플랫폼/i.test(searchable)) {
    return "Game / XR";
  }

  if (/Spring|Backend|JWT|AWS|Full-Stack|RDS|Security/i.test(searchable)) {
    return "Full-stack Web";
  }

  return "Web / Product";
}

function getLiveUrl(project) {
  const links = asArray(project.footerLink);
  const liveLink = links.find(function findLink(link) {
    return link && link.url && link.url.indexOf("github.com") < 0;
  });

  return liveLink ? liveLink.url : "";
}

function getCodeUrl(project) {
  const links = asArray(project.footerLink);
  const codeLink = links.find(function findLink(link) {
    return link && link.url && link.url.indexOf("github.com") >= 0;
  });

  return codeLink ? codeLink.url : "";
}

function getMetrics(project) {
  const details = project.details || {};
  const overview = details.overview || {};
  const quickSummary = asArray(details.quickSummary).map(function mapSummary(
    item
  ) {
    return {
      value: item.title,
      label: item.desc
    };
  });

  if (quickSummary.length) {
    return quickSummary.slice(0, 4);
  }

  return [
    {
      value: project.status === "live" ? "LIVE" : "CASE",
      label: "프로젝트 상태"
    },
    {value: getStack(project)[0] || "React", label: "대표 기술"},
    {value: overview.period || "Portfolio", label: "기간 / 유형"}
  ];
}

function getProblem(project) {
  const details = project.details || {};
  const problemSolution = details.problemSolution || {};
  const intro = details.intro || {};
  const items = asArray(problemSolution.problem)
    .concat(asArray(details.problemGoal))
    .concat(asArray(intro.problem));

  if (items.length) {
    return items
      .map(function mapProblem(item) {
        return joinText(item);
      })
      .slice(0, 4);
  }

  return [joinText(project.projectDesc)];
}

function getSolution(project) {
  const details = project.details || {};
  const problemSolution = details.problemSolution || {};
  const intro = details.intro || {};
  const overview = details.overview || {};
  const items = asArray(problemSolution.solution)
    .concat(asArray(problemSolution.outcome))
    .concat(asArray(intro.solution))
    .concat(asArray(intro.outcome))
    .concat(asArray(overview.coreValue));

  if (items.length) {
    return items
      .map(function mapSolution(item) {
        return joinText(item);
      })
      .slice(0, 4);
  }

  return [project.recommendation || project.projectDesc];
}

function getRolePoints(project) {
  const details = project.details || {};
  const overview = details.overview || {};
  const roleText = joinText(
    overview.role || details.role || "기획, 구현, 테스트, 배포"
  );

  return roleText
    .split(/,|\/|·|ㆍ|\n/)
    .map(function cleanRole(role) {
      return role.trim();
    })
    .filter(Boolean)
    .slice(0, 6);
}

function getFeatureImage(project, fallback) {
  const details = project.details || {};
  const overview = details.overview || {};
  const intro = details.intro || {};

  return (
    fallback ||
    overview.image ||
    asArray(intro.images)[0] ||
    project.image ||
    (sourceProjects[0] && sourceProjects[0].image) ||
    null
  );
}

function createFeature(project, item, image, body) {
  return {
    title: item.title || item.step || item.oneLiner || project.projectName,
    body:
      body ||
      joinText(
        item.oneLiner,
        item.description,
        item.how,
        item.result,
        item.bullets
      ),
    caption: item.caption || item.proofCaption || "",
    image: image || getFeatureImage(project)
  };
}

function getFeatures(project) {
  const details = project.details || {};
  const intro = details.intro || {};
  const features = [];

  asArray(details.coreDesign).forEach(function addCoreDesign(item) {
    features.push(
      createFeature(
        project,
        item,
        item.proofImage,
        joinText(item.oneLiner, item.how, item.result)
      )
    );
  });

  asArray(details.coreFeatureShots).forEach(function addCoreFeature(item) {
    features.push(
      createFeature(
        project,
        item,
        item.image || item.proofImage,
        joinText(item.bullets)
      )
    );
  });

  asArray(details.strategySteps).forEach(function addStrategy(item) {
    features.push(createFeature(project, item, item.image, item.description));
  });

  if (details.ops) {
    features.push(
      createFeature(
        project,
        Object.assign({title: "운영 / 검증"}, details.ops),
        details.ops.proofImage,
        joinText(details.ops.oneLiner, details.ops.how, details.ops.result)
      )
    );
  }

  if (!features.length && intro.images) {
    features.push({
      title: intro.headline || project.projectName,
      body: joinText(
        intro.highlight,
        intro.problem,
        intro.solution,
        intro.outcome
      ),
      caption: intro.caption || "",
      image: asArray(intro.images)[0] || project.image
    });
  }

  if (!features.length) {
    return getMetrics(project).map(function mapMetric(metric) {
      return {
        title: metric.value,
        body: metric.label,
        caption: project.projectName,
        image: getFeatureImage(project)
      };
    });
  }

  return features.slice(0, 8);
}

function addGalleryItem(items, seen, project, image, caption, body) {
  if (!image) {
    return;
  }

  const key = String(image);

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  items.push({
    image: image,
    caption: caption || "실제 프로젝트 화면",
    body: body || project.projectName
  });
}

function getGallery(project) {
  const details = project.details || {};
  const overview = details.overview || {};
  const intro = details.intro || {};
  const items = [];
  const seen = new Set();

  addGalleryItem(
    items,
    seen,
    project,
    project.image,
    project.projectName,
    project.recommendation
  );
  addGalleryItem(
    items,
    seen,
    project,
    overview.image,
    overview.caption,
    overview.coreValue
  );

  asArray(intro.images).forEach(function addIntroImage(image, index) {
    const caption =
      index === 0
        ? intro.caption || "프로젝트 대표 화면"
        : intro.caption
        ? intro.caption + " " + (index + 1)
        : "프로젝트 화면 " + (index + 1);

    addGalleryItem(
      items,
      seen,
      project,
      image,
      caption,
      joinText(intro.highlight, intro.solution, intro.outcome)
    );
  });

  asArray(details.strategySteps).forEach(function addStrategyImage(item) {
    addGalleryItem(
      items,
      seen,
      project,
      item.image,
      item.caption || item.title,
      item.description
    );
  });

  asArray(details.coreDesign).forEach(function addCoreDesignImage(item) {
    addGalleryItem(
      items,
      seen,
      project,
      item.proofImage,
      item.proofCaption || item.title,
      joinText(item.oneLiner, item.how, item.result)
    );
  });

  asArray(details.coreFeatureShots).forEach(function addCoreFeatureImage(item) {
    addGalleryItem(
      items,
      seen,
      project,
      item.image || item.proofImage,
      item.caption || item.proofCaption || item.title,
      joinText(item.bullets)
    );
  });

  if (details.ops) {
    addGalleryItem(
      items,
      seen,
      project,
      details.ops.proofImage,
      details.ops.proofCaption || "운영 / 검증 자료",
      joinText(details.ops.oneLiner, details.ops.how, details.ops.result)
    );
  }

  const fallbackImage =
    (sourceProjects[0] && sourceProjects[0].image) || project.image;
  return items.length
    ? items
    : [
        {
          image: fallbackImage,
          caption: project.projectName,
          body: project.projectDesc
        }
      ];
}

function getFlow(project) {
  const details = project.details || {};
  const steps = asArray(details.strategySteps)
    .map(function mapStep(step) {
      return step.title;
    })
    .concat(
      asArray(details.coreDesign).map(function mapDesign(item) {
        return item.title;
      })
    )
    .concat(
      asArray(details.quickSummary).map(function mapSummary(item) {
        return item.title;
      })
    );

  return unique(steps).filter(Boolean).slice(0, 6);
}

function getLearnings(project) {
  const details = project.details || {};
  const overview = details.overview || {};
  const intro = details.intro || {};
  const direct = asArray(details.learnings)
    .concat(asArray(details.learning))
    .concat(asArray(details.whatILearned))
    .concat(asArray(details.takeaways));

  if (direct.length) {
    return direct
      .map(function mapLearning(item) {
        return joinText(item);
      })
      .slice(0, 4);
  }

  return unique([
    overview.coreValue,
    intro.outcome,
    (details.problemSolution || {}).outcome,
    project.recommendation
  ])
    .filter(Boolean)
    .map(function mapFallback(item) {
      return joinText(item);
    })
    .slice(0, 4);
}

function normalizeProject(project, index) {
  const details = project.details || {};
  const overview = details.overview || {};
  const intro = details.intro || {};
  const stack = getStack(project);

  return {
    slug: getProjectSlug(project, index),
    title: project.projectName,
    label: project.status === "live" ? "Live project" : "Case study",
    category: getCategory(project),
    year: overview.period || "",
    role: overview.role || "Developer",
    description: toPreview(project.projectDesc || project.recommendation, 130),
    shortDescription: toPreview(
      project.recommendation || overview.coreValue || project.projectDesc,
      170
    ),
    stack: stack,
    heroImage: overview.image || asArray(intro.images)[0] || project.image,
    gallery: getGallery(project),
    liveUrl: getLiveUrl(project),
    codeUrl: getCodeUrl(project),
    metrics: getMetrics(project),
    overview: joinText(overview.coreValue, project.projectDesc),
    problem: getProblem(project),
    solution: getSolution(project),
    rolePoints: getRolePoints(project),
    features: getFeatures(project),
    flow: getFlow(project),
    learnings: getLearnings(project)
  };
}

const projects = sourceProjects.map(normalizeProject);

const contactEmail =
  contactInfo.email_address || socialMediaLinks.gmail || "toadsam@naver.com";
const githubUrl = socialMediaLinks.github || "https://github.com/toadsam";
const linkedinUrl = socialMediaLinks.linkedin || "";

const contactLinks = [
  {label: "Email", value: contactEmail, href: "mailto:" + contactEmail},
  {
    label: "GitHub",
    value: githubUrl.replace(/^https?:\/\//, ""),
    href: githubUrl
  },
  {label: "Resume", value: "resume.pdf", href: resumePdf}
].concat(
  linkedinUrl
    ? [
        {
          label: "LinkedIn",
          value: linkedinUrl.replace(/^https?:\/\//, ""),
          href: linkedinUrl
        }
      ]
    : []
);

const skillNames = asArray(skillsSection.softwareSkills).map(function mapSkill(
  skill
) {
  return skill.skillName;
});

function getSkillBlurb(name) {
  const blurbs = {
    React: "컴포넌트 기반 SPA와 인터랙티브 UI 구현",
    TypeScript: "타입 안정성을 고려한 프론트엔드 설계",
    "Spring Boot": "REST API, 인증, 권한, 서버 로직 구현",
    Database: "MySQL/JPA 기반 데이터 모델링과 연동",
    AWS: "S3, CloudFront, Route53, ACM, RDS 배포 경험",
    Unity: "게임/XR 인터랙션과 상태 기반 플레이 구현",
    "C#": "Unity 게임 로직과 상호작용 스크립트 구현",
    "Game Dev": "출시/플레이 테스트까지 고려한 게임 제작",
    "3D": "3D 공간, 카메라, 충돌, 오브젝트 제어"
  };

  return blurbs[name] || "기존 포트폴리오에 등록된 주요 기술입니다.";
}

const stackCards = skillNames.map(function mapStackCard(name) {
  return {
    name: name,
    blurb: getSkillBlurb(name),
    version: "Project-ready"
  };
});

const experienceItems = asArray(techStack.experience);
const skillChunkSize = experienceItems.length
  ? Math.ceil(skillNames.length / experienceItems.length)
  : 4;
const skillGroups = experienceItems.map(function mapSkillGroup(item, index) {
  const start = index * skillChunkSize;
  const tags = skillNames.slice(start, start + skillChunkSize);

  return {
    title: item.Stack,
    body: item.Stack + " 중심 프로젝트 경험 " + item.progressPercentage,
    tags: tags.length ? tags : skillNames.slice(0, 4)
  };
});

const trustedBy = unique(
  ["React", "Spring Boot", "AWS", "Unity"].concat(skillNames.slice(0, 5))
).slice(0, 8);

const socialProof = [
  {value: projects.length + "+", label: "Main projects"},
  {value: "Live", label: "배포/운영 경험"},
  {value: "Web + XR", label: "React, Spring Boot, Unity"},
  {value: contactEmail, label: "Contact"}
];

const philosophyPoints = [
  {
    title: "문제를 먼저 정의",
    body: "기능을 나열하기보다 사용자가 막히는 지점과 운영 리스크를 먼저 정리합니다."
  },
  {
    title: "실제 화면과 코드로 증명",
    body: "프로젝트 상세는 기존 캡처, 코드 스니펫, 운영 자료를 함께 보여주도록 구성했습니다."
  },
  {
    title: "배포까지 고려",
    body: "인증, CORS, HTTPS, 환경 분리처럼 출시 후 문제가 되는 영역까지 확인합니다."
  }
];

const processSteps = [
  {step: "01", title: "Discover", body: "문제, 사용자, 운영 제약을 먼저 파악"},
  {step: "02", title: "Define", body: "핵심 흐름과 기술 범위를 정리"},
  {step: "03", title: "Build", body: "화면, API, 상태 흐름을 구현"},
  {step: "04", title: "Verify", body: "캡처, 테스트, 배포 환경에서 검증"},
  {step: "05", title: "Refine", body: "피드백과 운영 이슈를 반영"}
];

const notesArticles = projects.slice(0, 4).map(function mapNote(project) {
  return {
    category: project.category,
    readTime: "case note",
    title: project.title,
    summary: project.shortDescription
  };
});

const uiExperiments = projects
  .flatMap(function mapExperiments(project) {
    return project.features.slice(0, 1).map(function mapFeature(feature) {
      return {
        title: feature.title,
        body: feature.body || project.shortDescription
      };
    });
  })
  .slice(0, 5);

const scheduleCard = {
  month: "June 2026",
  prompt: "프로젝트나 협업 이야기를 나눠볼까요?",
  description:
    "메일로 간단히 남겨주시면 프로젝트 맥락에 맞춰 답변드리겠습니다.",
  cta: "메일 보내기"
};

const contactFormDefaults = {
  subject: "Portfolio contact"
};

const homeHighlights = ["interfaces", "solve problems", "intention"];

const featuredProjectSlug = projects[0] ? projects[0].slug : "project-1";

export {
  contactFormDefaults,
  contactLinks,
  featuredProjectSlug,
  homeHighlights,
  navItems,
  notesArticles,
  philosophyPoints,
  processSteps,
  projects,
  scheduleCard,
  skillGroups,
  socialProof,
  stackCards,
  trustedBy,
  uiExperiments
};
