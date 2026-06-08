# 핵심 규칙

> 상세 규칙은 `development/` 디렉토리 참조. 이 파일은 프로젝트 수준의 결정 사항만 포함.

## 필수 사항

- className 병합은 `cn()` 사용 -- 문자열 연결, 템플릿 리터럴 금지
- 아이콘은 `@/components/icons`에서만 임포트 -- `Icons.name` 사용
- `bun tsc --noEmit` + `bun run build` 반드시 통과

## 규칙 참조

| 규칙 | 파일 |
|------|------|
| React 컴포넌트 | [react.md](../development/react.md) |
| TypeScript | [typescript.md](../development/typescript.md) |
| 스타일링 | [styling.md](../development/styling.md) |
| 네이밍 | [naming.md](../development/naming.md) |
| 데이터 계층 | [data-layer.md](../development/data-layer.md) |
| 폼 | [forms.md](../development/forms.md) |
| Prisma | [prisma.md](../development/prisma.md) |
| 아키텍처 | [architecture.md](architecture.md) |
| AI 행동 원칙 | [behavior.md](behavior.md) |
