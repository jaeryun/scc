# public/ — 구조와 파일 목록

```
public/
├── robots.txt              # 크롤러 차단 (User-agent: *, Disallow: /)
├── fonts/
│   └── PretendardVariable.woff2
├── api-specs/
│   └── internal/
│       └── latest.json     # generate-api-spec.ts 생성, gitignore
└── index.md
```

- [robots.txt](./robots.txt) — 폐쇄망 크롤러 차단. `src/app/(main)/layout.tsx`의 `metadata.robots`와 중복 방어
- [fonts/](./fonts/) — `next/font/google`이 지원하지 않는 폰트를 woff2로 직접 서빙
- [api-specs/internal/](./api-specs/internal/) — `scripts/generate-api-spec.ts`가 prebuild 시 생성. `.gitignore` L83에 등록됨
