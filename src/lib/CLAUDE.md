# 유틸리티 컨벤션

@index.md

@../../docs/common/foundation/conventions.md

## 원칙

- 유틸 함수는 순수 함수 유지, 부수 효과 금지
- 모든 유틸은 `@/lib/*` 경로로 임포트
- 에러는 throw, 반환값으로 에러 전달 금지
- 상세 사용법은 각 소스 파일의 JSDoc 참조

## 새 유틸 추가 시

1. `src/lib/<name>.ts` 생성 — 순수 함수만 export
2. JSDoc으로 사용법, 파라미터, 반환값 문서화
3. `index.md` 디렉터리 구조 테이블에 한 줄 추가
4. `conventions.md`에 규칙화가 필요한 경우 해당 섹션에 추가
