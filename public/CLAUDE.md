# public/ — 정적 에셋

Next.js가 빌드 시 그대로 서빙하는 정적 파일 디렉토리. 컴포넌트에서 `import` 하거나 `src/` 하위에 둬야 하는 리소스는 여기 넣지 않는다.

@index.md

## 규칙

### 추가해도 되는 것

- 폰트 파일 (woff2, woff)
- robots.txt, sitemap.xml 등 웹 표준 메타파일
- 파비콘, OG 이미지, 매니페스트
- 빌드 스크립트가 생성하는 정적 JSON 아티팩트

### 추가하면 안 되는 것

- 소스코드, React 컴포넌트 → `src/`
- 문서 → `docs/`
- Prisma 관련 파일 → `prisma/`
- 개발 스크립트 → `scripts/`
- 크리덴셜, `.env` → 절대 금지 (public/ 은 외부에 노출됨)

### 빌드 아티팩트

- 빌드 시 생성되는 파일은 반드시 `.gitignore`에 등록
- 생성 로직은 `scripts/` 에, 소비 코드는 `src/` 에서 절대 경로(`/api-specs/...`)로 참조
