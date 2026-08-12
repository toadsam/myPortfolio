const fs=require('fs');const p=require('path');
const inp=JSON.parse(fs.readFileSync(p.join(process.cwd(),'.ua/tmp/ua-arch-input.json'),'utf8'));
const L=[
 {id:'layer:app-shell',name:'앱 셸 & 라우팅',description:'Next.js App Router 진입점(page/layout/admin/api)과 viewMode(village·interior·project-interior·resume)를 소유한 AIPortfolioVillage 상태 머신 · 전역 Provider가 앱 전체 흐름을 조립하는 레이어.'},
 {id:'layer:village-3d',name:'3D 마을 · 실내 씬',description:'React Three Fiber로 마을 지형·건물·NPC·계절 앰비언스와 프로젝트/아카이브 실내 공간을 렌더링하는 3D 씬 레이어(전부 ssr:false 클라이언트 컴포넌트).'},
 {id:'layer:ui',name:'UI 오버레이 & HUD',description:'3D 씬 위에 겹쳐지는 헤더·인포 패널·NPC 대화창·인트로/전환 오버레이와 이력서 모드 등 2D 인터페이스 레이어.'},
 {id:'layer:project-showcase',name:'프로젝트 전시 레이어',description:'ProjectViewer가 카테고리별로 분기하는 4종 뷰어와 aclub·darklab·sueo 전용 전시관, richContent SIGNATURE 데모·앰비언트/사운드 연출을 담은 프로젝트 프레젠테이션 레이어.'},
 {id:'layer:frontend-domain',name:'프론트엔드 도메인 데이터 · 라이브러리',description:'villageBuildings 좌표와 지형·충돌·팔레트·사운드 헬퍼(src/lib), 프로젝트·이력서·NPC 로스터 등 정적 데이터와 생성된 레이아웃 JSON, 공유 타입 유니온을 제공하는 프론트엔드 기반 레이어.'},
 {id:'layer:backend-api',name:'백엔드 API & 데이터 모델',description:'모든 라우트를 선언하는 FastAPI main.py와 SQLAlchemy 모델·Pydantic 스키마·DB 세션·설정·NPC 관계 정규화(relations.py)를 담당하는 백엔드 인터페이스 레이어.'},
 {id:'layer:backend-service',name:'백엔드 도메인 서비스 · 테스트',description:'일일 활동 로그를 건물 조명 점수와 NPC 감정으로 변환하는 village_service를 비롯해 채팅·NPC 자율 행동·관계·GitHub 동기화 로직과 이를 검증하는 pytest 스위트.'},
 {id:'layer:build-tooling',name:'빌드타임 에셋 · 레이아웃 생성 스크립트',description:'GLB 최적화·임포스터 베이킹·지면/장식 배치 JSON 생성 등 런타임이 아닌 오프라인 단계에서 src/data와 public/models 자산을 만들어 내는 Node/Python 도구 모음.'},
 {id:'layer:documentation',name:'문서',description:'프로젝트 전체 해설(PROJECT_DOCUMENTATION), 11개 프로젝트별 스펙(portfolio-specs), Meshy 에셋 프롬프트 가이드, 이력서 원문과 카피 문안을 담은 문서 레이어.'},
 {id:'layer:infrastructure',name:'인프라 & 설정',description:'Dockerfile·GitHub Pages 워크플로·이슈 템플릿과 Next.js/Tailwind/PostCSS/TypeScript 빌드 설정, 백엔드 의존성·환경 예시, public 정적 자산 설정을 묶은 레이어.'},
];
const map=Object.fromEntries(L.map(l=>[l.id,[]]));
const pick=(fp)=>{
 const md=/\.(md|rst)$/.test(fp);
 if(fp.startsWith('backend/tests/')||fp.startsWith('backend/app/services/'))return 'layer:backend-service';
 if(fp.startsWith('backend/app/'))return 'layer:backend-api';
 if(fp.startsWith('backend/'))return md?'layer:documentation':'layer:infrastructure';
 if(fp.startsWith('scripts/'))return 'layer:build-tooling';
 if(fp.startsWith('src/components/ui/project-viewers/'))return 'layer:project-showcase';
 if(fp.startsWith('src/components/ui/'))return 'layer:ui';
 if(fp.startsWith('src/components/village/')||fp.startsWith('src/components/interior/'))return 'layer:village-3d';
 if(fp.startsWith('src/components/'))return 'layer:app-shell';
 if(fp.startsWith('src/app/'))return 'layer:app-shell';
 if(fp.startsWith('src/lib/')||fp.startsWith('src/data/')||fp.startsWith('src/types/'))return 'layer:frontend-domain';
 if(fp.startsWith('src/'))return md?'layer:documentation':'layer:frontend-domain';
 if(fp.startsWith('portfolio-specs/')||fp.startsWith('docs/')||fp.startsWith('resume/'))return 'layer:documentation';
 if(fp.startsWith('.github/'))return 'layer:infrastructure';
 if(fp.startsWith('public/'))return md?'layer:documentation':'layer:infrastructure';
 return md?'layer:documentation':'layer:infrastructure';
};
inp.fileNodes.forEach(n=>{const fp=String(n.filePath).split(String.fromCharCode(92)).join('/');map[pick(fp)].push(n.id);});
const out=L.map(l=>Object.assign({},l,{nodeIds:map[l.id]}));
const total=out.reduce((s,l)=>s+l.nodeIds.length,0);
const seen=new Set();let dup=0;out.forEach(l=>l.nodeIds.forEach(i=>{if(seen.has(i))dup++;seen.add(i);}));
const missing=inp.fileNodes.filter(n=>!seen.has(n.id));
console.log('total',total,'input',inp.fileNodes.length,'dups',dup,'missing',missing.length,'empty',out.filter(l=>!l.nodeIds.length).map(l=>l.id));
console.log(out.map(l=>l.id+' = '+l.nodeIds.length).join('\n'));
fs.mkdirSync(p.join(process.cwd(),'.ua/intermediate'),{recursive:true});
fs.writeFileSync(p.join(process.cwd(),'.ua/intermediate/layers.json'),JSON.stringify(out,null,2),'utf8');
