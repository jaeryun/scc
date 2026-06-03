# rules/ -- SCC 고유 코딩 규칙

업계 표준 규칙은 `vercel-react-best-practices` 및 `next-best-practices` 스킬이 담당합니다.
이 디렉토리에는 **SCC 프로젝트에 고유한 결정사항**만 포함됩니다. 각 규칙은 `[필수]`/`[권장]` 태그가 붙습니다.

- `react.md`        -- 함수 선언문 컴포넌트, Props 인터페이스, 'use client', HydrationBoundary+Suspense
- `typescript.md`   -- any 금지 (+@reason 예외), interface 우선, 환경 변수
- `styling.md`      -- cn() 필수, 정적 색상 금지, CSS 변수 토큰 매핑
- `naming.md`       -- kebab-case 파일, PascalCase 컴포넌트, use-접두사 훅
- `data-layer.md`   -- types->service->queries->hooks 계층, mutationOptions 패턴, 쿼리 키 팩토리
- `forms.md`        -- useAppForm + useFormFields<T>(), AppField render props
- `prisma.md`       -- migrate dev만 사용, db push 금지
