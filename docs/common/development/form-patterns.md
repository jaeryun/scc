# 폼 패턴 (인덱스)

<!-- 관련 Skills: 해당 없음 (프로젝트 폼 추상화는 forms.md 참조)
     이 문서는 폼 패턴 파일들의 인덱스입니다.
     각 패턴 파일은 복사용 예제 + 권장 접근법. -->

[TanStack Form](https://tanstack.com/form) + shadcn/ui 기반의 타입 세이프 폼 처리 시스템 패턴 모음입니다. 2026-06-14에 단일 `form-patterns.md` (1043 라인)에서 4개 주제별 파일로 분할되었습니다.

> 폼 **규칙**(필수, 위반 시 리뷰 거절)은 [forms.md](forms.md) 참조.
> 이 디렉터리의 `*-patterns.md` 파일들은 **권장 패턴 + 복사용 예제**.

## 패턴 파일

| 파일 | 주제 |
|------|------|
| [form-setup-patterns.md](form-setup-patterns.md) | useAppForm 설정, 필드 어댑터, 컨텍스트 프로바이더 |
| [form-validation-patterns.md](form-validation-patterns.md) | Zod 스키마, onBlur/onChange/onSubmit 전략, 서버 중복 검사 |
| [form-submission-patterns.md](form-submission-patterns.md) | mutation 연동, 토스트, 리다이렉트, 에러 처리 |
| [form-sheet-dialog-patterns.md](form-sheet-dialog-patterns.md) | Sheet/Dialog 내 폼, 외부 제출 버튼 |

## 새 폼 작성 흐름

1. [forms.md](forms.md) 의 규칙 확인 (필수 도구, 필드 타입, 검증 단계)
2. 이 인덱스에서 해당 주제의 패턴 파일 열기
3. 예제 코드를 프로젝트 상황에 맞게 복사·수정

## 빠른 매핑 (찾고 있는 것 → 파일)

| 찾고 있는 것 | 열어야 할 파일 |
|--------------|---------------|
| `useAppForm` 사용법, 3가지 필드 패턴, 새 필드 추가 | [form-setup-patterns.md](form-setup-patterns.md) |
| Zod 검증, 비동기 서버 확인, `onChangeListenTo` | [form-validation-patterns.md](form-validation-patterns.md) |
| `onSubmit` 핸들러, `FormErrors`, `scrollToFirstError` | [form-submission-patterns.md](form-submission-patterns.md) |
| Sheet/Dialog 안 폼, 외부 제출 버튼 | [form-sheet-dialog-patterns.md](form-sheet-dialog-patterns.md) |

## 분할 기준

원본 `form-patterns.md`를 4개 카테고리로 매핑했습니다:

| 원본 섹션 | 새 위치 |
|----------|--------|
| 아키텍처, 파일 구조, 빠른 시작, 사용 패턴, 필드 컴포넌트, 새 필드 추가, 타입/익스포트 참조 | [form-setup-patterns.md](form-setup-patterns.md) |
| 유효성 검사 전략, 리스너, 비밀번호 확인 | [form-validation-patterns.md](form-validation-patterns.md) |
| 프로덕션 유틸리티, 간단한 CRUD 폼, 입사 지원 폼 예제 | [form-submission-patterns.md](form-submission-patterns.md) |
| 시트/다이얼로그 내 폼 | [form-sheet-dialog-patterns.md](form-sheet-dialog-patterns.md) |

## 패턴 추가 절차

- 새 폼 패턴 발견 시 적절한 `*-patterns.md` 파일에 추가
- 새로운 큰 주제 발생 시 새 `form-<topic>-patterns.md` 생성 + 이 인덱스에 등록
