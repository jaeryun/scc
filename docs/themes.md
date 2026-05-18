# 새 테마 추가하기

이 가이드는 애플리케이션에 새 테마를 추가하는 방법을 설명합니다. 테마 시스템은 CSS custom properties와 `[data-theme]` 셀렉터를 사용하여 손쉬운 테마 전환을 지원합니다.

## 전체 과정: 새 테마 추가하기

새 테마를 추가할 때는 다음 과정을 따르세요:

1. **테마 CSS 파일 생성** → `src/styles/themes/your-theme-name.css` 파일에 `[data-theme='your-theme-name']` 정의
2. **테마 임포트** → `src/styles/theme.css`에 `@import` 추가
3. **테마 등록** → `src/components/themes/theme.config.ts`의 `THEMES` 배열에 추가
4. **폰트 추가 (필요한 경우)** → 커스텀 Google Fonts를 사용하는 경우 `src/components/themes/font.config.ts`에서 폰트 임포트
5. **기본값으로 설정 (선택 사항)** → `src/components/themes/active-theme.tsx`의 `DEFAULT_THEME` 업데이트

자세한 안내는 아래 **단계별 가이드** 섹션을 참고하세요.

## 빠른 시작: 테마를 기본값으로 설정하기

새 테마를 기본값으로 만들려면 (테마 스위처 없이 자동으로 로드되도록):

1. `src/components/themes/active-theme.tsx` 파일 열기
2. 12번째 줄 변경: `const DEFAULT_THEME = 'your-theme-name';`
3. 저장하고 개발 서버 재시작

이게 전부입니다! 이제 모든 신규 사용자에게 기본 테마로 적용됩니다.

> **참고:** 테마를 기본값으로 설정하기 전에 위의 1-3단계를 완료했는지 확인하세요.

## 테마 구조

모든 테마는 `src/styles/themes/` 디렉토리에 위치합니다. 각 테마는 light 모드와 dark 모드의 모든 디자인 토큰을 정의하는 완전하고 독립적인 CSS 파일입니다.

## 파일 형식

각 테마 파일은 다음 구조를 따라야 합니다:

```css
/* Light mode tokens */
[data-theme='your-theme-name'] {
  /* Color tokens */
  --background: oklch(...);
  --foreground: oklch(...);
  --card: oklch(...);
  --card-foreground: oklch(...);
  --popover: oklch(...);
  --popover-foreground: oklch(...);
  --primary: oklch(...);
  --primary-foreground: oklch(...);
  --secondary: oklch(...);
  --secondary-foreground: oklch(...);
  --muted: oklch(...);
  --muted-foreground: oklch(...);
  --accent: oklch(...);
  --accent-foreground: oklch(...);
  --destructive: oklch(...);
  --destructive-foreground: oklch(...);
  --border: oklch(...);
  --input: oklch(...);
  --ring: oklch(...);

  /* Chart colors */
  --chart-1: oklch(...);
  --chart-2: oklch(...);
  --chart-3: oklch(...);
  --chart-4: oklch(...);
  --chart-5: oklch(...);

  /* Sidebar colors */
  --sidebar: oklch(...);
  --sidebar-foreground: oklch(...);
  --sidebar-primary: oklch(...);
  --sidebar-primary-foreground: oklch(...);
  --sidebar-accent: oklch(...);
  --sidebar-accent-foreground: oklch(...);
  --sidebar-border: oklch(...);
  --sidebar-ring: oklch(...);

  /* Typography */
  /* Option 1: next/font/google의 폰트 사용 (권장) */
  --font-sans: 'Font Name', sans-serif; /* 폰트의 display name 사용 */
  --font-serif: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  --font-mono: 'Mono Font Name', monospace;

  /* Option 2: 시스템 폰트 사용 */
  /* --font-sans: ui-sans-serif, system-ui, -apple-system, sans-serif; */

  /* Spacing & Layout */
  --radius: 0.5rem;
  --spacing: 0.25rem;

  /* Shadows (선택 사항) */
  --shadow-x: 0px;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.17;
  --shadow-color: #000000;
  --shadow-2xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.09);
  --shadow-xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.09);
  --shadow-sm: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17);
  --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17);
  --shadow-md: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 2px 4px -1px hsl(0 0% 0% / 0.17);
  --shadow-lg: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 4px 6px -1px hsl(0 0% 0% / 0.17);
  --shadow-xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 8px 10px -1px hsl(0 0% 0% / 0.17);
  --shadow-2xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.43);

  /* Letter spacing (선택 사항) */
  --tracking-normal: 0em;
}

/* Dark mode tokens */
[data-theme='your-theme-name'].dark {
  /* 위와 동일한 토큰, dark mode 값으로 대체 */
  --background: oklch(...);
  --foreground: oklch(...);
  /* ... 다른 모든 토큰을 dark mode 값으로 정의 */
}

/* Theme inline mappings */
[data-theme='your-theme-name'] {
  @theme inline {
    /* Color mappings */
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-destructive-foreground: var(--destructive-foreground);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --color-chart-1: var(--chart-1);
    --color-chart-2: var(--chart-2);
    --color-chart-3: var(--chart-3);
    --color-chart-4: var(--chart-4);
    --color-chart-5: var(--chart-5);
    --color-sidebar: var(--sidebar);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-ring: var(--sidebar-ring);

    /* Font mappings */
    --font-sans: var(--font-sans);
    --font-mono: var(--font-mono);
    --font-serif: var(--font-serif);

    /* Radius variants */
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);

    /* Shadow mappings (shadows가 정의된 경우) */
    --shadow-2xs: var(--shadow-2xs);
    --shadow-xs: var(--shadow-xs);
    --shadow-sm: var(--shadow-sm);
    --shadow: var(--shadow);
    --shadow-md: var(--shadow-md);
    --shadow-lg: var(--shadow-lg);
    --shadow-xl: var(--shadow-xl);
    --shadow-2xl: var(--shadow-2xl);

    /* Tracking variants (tracking-normal이 정의된 경우) */
    --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
    --tracking-tight: calc(var(--tracking-normal) - 0.025em);
    --tracking-normal: var(--tracking-normal);
    --tracking-wide: calc(var(--tracking-normal) + 0.025em);
    --tracking-wider: calc(var(--tracking-normal) + 0.05em);
    --tracking-widest: calc(var(--tracking-normal) + 0.1em);
  }
}
```

## 단계별 가이드: 새 테마 추가하기

아래 단계를 순서대로 따라 애플리케이션에 새 테마를 추가하세요.

### Step 1: 테마 CSS 파일 생성

`src/styles/themes/`에 설명적인 이름으로 새 파일을 생성합니다 (kebab-case 사용):

```bash
src/styles/themes/your-theme-name.css
```

**중요:** 파일명은 CSS에서 사용할 `data-theme` 속성 값과 일치해야 합니다.

### Step 2: `[data-theme]` 속성으로 테마 정의하기

위의 "파일 형식" 섹션에서 구조를 복사하고 색상 값을 채워 넣으세요. 더 나은 색상 일관성을 위해 OKLCH 색상 형식을 사용하세요:

```css
/* Light mode tokens */
[data-theme='your-theme-name'] {
  --background: oklch(1 0 0); /* 흰색 */
  --foreground: oklch(0.145 0 0); /* 진한 회색 */
  --card: oklch(...);
  /* ... 다른 모든 토큰 */
}

/* Dark mode tokens */
[data-theme='your-theme-name'].dark {
  --background: oklch(0.145 0 0); /* 어두운 색 */
  --foreground: oklch(0.985 0 0); /* 밝은 색 */
  /* ... 다른 모든 토큰을 dark mode 값으로 정의 */
}

/* Tailwind를 위한 Theme inline mappings */
[data-theme='your-theme-name'] {
  @theme inline {
    /* "파일 형식" 섹션에 표시된 모든 매핑 */
  }
}
```

**색상 형식:**

- `oklch()` 형식 사용: `oklch(lightness chroma hue)`
- 예시: `oklch(0.852 0.199 91.936)` = 밝은 초록-파랑
- Lightness: 0-1 (0 = 검정, 1 = 흰색)
- Chroma: 0+ (0 = 무채색, 높을수록 채도가 높음)
- Hue: 0-360 (색상환 상의 위치)

**핵심 사항:**

- `[data-theme='your-theme-name']` 셀렉터가 테마를 작동시키는 요소입니다
- `'your-theme-name'` 값은 모든 곳(CSS 파일, 설정 파일 등)에서 정확히 일치해야 합니다
- 항상 light 모드와 dark 모드 변형을 모두 포함하세요
- Tailwind CSS 통합을 위한 `@theme inline` 블록을 포함하세요

### Step 3: theme.css에서 테마 임포트

`src/styles/theme.css`에 테마 임포트를 추가하세요:

```css
@import './themes/your-theme-name.css';
```

이렇게 하면 애플리케이션에서 테마를 사용할 수 있게 됩니다.

### Step 4: theme.config.ts에 테마 추가

`src/components/themes/theme.config.ts`의 `THEMES` 배열에 테마를 추가하세요:

```typescript
export const THEMES = [
  // ... 기존 테마
  {
    name: 'Your Theme Name', // UI에 표시될 이름
    value: 'your-theme-name' // CSS의 [data-theme] 값과 정확히 일치해야 함
  }
];
```

**중요:** `value` 필드는 CSS 파일의 `data-theme` 속성 값과 정확히 일치해야 합니다.

### Step 5: 커스텀 폰트 추가 (필요한 경우)

**이 단계는 아직 로드되지 않은 커스텀 Google Font가 테마에 필요한 경우에만 수행하세요.**

테마에 Google Font를 사용하려는 경우:

**파일:** `src/components/themes/font.config.ts`

1. `next/font/google`에서 **폰트 임포트**:

```typescript
import { Your_Font_Name } from 'next/font/google';
```

2. CSS 변수로 **폰트 설정**:

```typescript
const fontYourName = Your_Font_Name({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // 필요에 따라 weight 조정
  variable: '--font-your-name' // 선택 사항: 커스텀 변수 이름
});
```

3. `fontVariables` export에 **추가**:

```typescript
export const fontVariables = cn(
  // ... 기존 폰트
  fontYourName.variable
);
```

4. 테마 CSS에서 display name으로 **폰트 사용** (CSS 변수가 아님):

```css
[data-theme='your-theme-name'] {
  --font-sans: 'Your Font Name', sans-serif; /* 실제 폰트 이름 사용 */
  --font-mono: 'Your Mono Font', monospace;
}
```

**중요 참고 사항:**

- CSS에서는 폰트의 **display name**을 사용하세요 (예: `'Geist'`, `'Architects Daughter'`). CSS 변수가 아닙니다.
- Next.js가 폰트를 로드하려면 `font.config.ts`에서 폰트를 임포트해야 합니다.
- `font.config.ts`의 폰트 변수는 `layout.tsx`를 통해 body에 자동으로 적용됩니다.
- `next/font/google`에서 사용 가능한 모든 Google Font를 사용할 수 있습니다.
- 새 폰트를 추가하기 전에 `font.config.ts`에 기존 폰트가 있는지 확인하세요. 재사용할 수 있을 수도 있습니다.

**예시:** `notebook` 테마는 `Architects Daughter`를 사용합니다:

- `font.config.ts`에서 `Architects_Daughter`로 임포트
- `notebook.css`에서 `'Architects Daughter'`로 사용 (따옴표와 공백 포함)

### Step 6: 기본 테마로 설정 (선택 사항)

사용자가 처음 애플리케이션을 방문할 때 (테마 스위처 없이) 로드되는 기본 테마로 설정하려면, 기본 테마 상수를 업데이트하세요:

**파일:** `src/components/themes/theme.config.ts`

```typescript
/**
 * 사용자 설정이 없을 때 로드되는 기본 테마
 * 다른 기본 테마로 설정하려면 이 값을 변경하세요
 */
export const DEFAULT_THEME = 'your-theme-name'; // 'vercel'에서 변경
```

**참고:**

- 이는 기본 테마의 **단일 진실 공급원(SSOT)** 입니다. 서버 사이드 렌더링과 클라이언트 사이드 코드 모두에서 자동으로 사용됩니다.
- **서버 사이드**: HTML `data-theme` 속성에 즉시 적용 (깜빡임 없음)
- **클라이언트 사이드**: 쿠키에 저장된 설정이 없을 때의 fallback으로 사용
- **사용자 설정**: 저장된 사용자 설정은 여전히 존중됩니다 (쿠키에 저장됨)
- **자동**: 여러 파일을 수정할 필요가 없습니다. 한 번만 변경하면 모든 곳에 적용됩니다.

**이 접근 방식의 장점:**

✅ 코드 중복 없음 - 한 번 정의하고 모든 곳에서 사용
✅ Type-safe - TypeScript가 일관성을 보장
✅ 변경이 쉬움 - 한 파일의 한 줄만 수정
✅ 문서화가 잘 되어 있음 - 명확한 주석으로 목적 설명
✅ 즉시 적용 - 스타일이 지정되지 않은 콘텐츠의 깜빡임 없음

### Step 7: 테마 테스트

1. 개발 서버 시작하기
2. UI에서 테마 선택기 열기
3. 새 테마 선택하기
4. light 모드와 dark 모드 모두에서 작동하는지 확인하기
5. "Your Theme Name (Scaled)"를 선택하여 scaled 변형 테스트하기
6. 기본값으로 설정한 경우, 브라우저 쿠키를 지우고 새로고침하여 자동으로 로드되는지 확인하기

## 빠른 참조: 파일 위치

새 테마를 추가할 때 다음 순서로 이 파일들을 작업하게 됩니다:

1. ✅ `src/styles/themes/your-theme-name.css` - `[data-theme]` 속성으로 테마 파일 생성
2. ✅ `src/styles/theme.css` - 테마 파일 임포트
3. ✅ `src/components/themes/theme.config.ts` - `THEMES` 배열에 테마 추가
4. ⚠️ `src/components/themes/font.config.ts` - 필요한 경우에만 폰트 추가
5. ⚠️ `src/components/themes/active-theme.tsx` - 원하는 경우에만 기본값으로 설정

## 필수 토큰

### 최소 필수

최소한 테마는 다음 토큰을 정의해야 합니다:

- `--background`
- `--foreground`
- `--card` & `--card-foreground`
- `--popover` & `--popover-foreground`
- `--primary` & `--primary-foreground`
- `--secondary` & `--secondary-foreground`
- `--muted` & `--muted-foreground`
- `--accent` & `--accent-foreground`
- `--destructive` & `--destructive-foreground`
- `--border`
- `--input`
- `--ring`
- `--radius`

### 선택 토큰

다음은 필요하지 않은 경우 생략할 수 있습니다:

- `--chart-1` ~ `--chart-5` (primary 색상으로 기본 설정됨)
- `--sidebar-*` 토큰 (card 색상으로 기본 설정됨)
- `--font-*` 토큰 (시스템 기본값 사용)
- `--shadow-*` 토큰 (생략 시 그림자 없음)
- `--tracking-normal` (생략 시 자간 없음)
- `--spacing` (기본값 사용)

## 예시: 완전한 테마

모든 토큰이 정의된 완전한 예시는 `src/styles/themes/claude.css`를 참조하세요.

## 예시: 최소 테마

최소한의 테마를 만들려면 기존 테마를 복사하고 변경하려는 색상만 수정하면 됩니다. 누락된 토큰에 대해서는 시스템이 기본값으로 대체합니다.

## 색상 형식 참조

### OKLCH 형식

```
oklch(lightness chroma hue)
```

- **Lightness**: 0-1 (0 = 검정, 1 = 흰색)
- **Chroma**: 0+ (0 = 무채색, 0.2+ = 선명한 색상)
- **Hue**: 0-360도
  - 0/360 = 빨강
  - 60 = 노랑
  - 120 = 초록
  - 180 = 시안
  - 240 = 파랑
  - 300 = 자홍

### 예시

```css
/* 순수 흰색 */
--background: oklch(1 0 0);

/* 순수 검정 */
--foreground: oklch(0 0 0);

/* 밝은 파랑 */
--primary: oklch(0.7 0.2 240);

/* 차분한 회색 */
--muted: oklch(0.5 0 0);
```

## Scaled 변형

모든 테마는 자동으로 scaled 변형을 지원합니다. 사용자가 "Theme Name (Scaled)"를 선택하면 `.theme-scaled` 클래스가 적용되어 간격과 텍스트 크기가 조정됩니다. 테마 파일에 추가 CSS가 필요하지 않습니다.

## 모범 사례

1. **설명적인 테마 이름 사용**: kebab-case 사용 (예: `ocean-blue`, `forest-green`)
2. **light 모드와 dark 모드 모두 제공**: 항상 두 변형을 모두 정의하세요
3. **접근성 테스트**: foreground와 background 간의 충분한 대비를 확인하세요
4. **일관된 토큰 유지**: 관련 색상에 비슷한 lightness/chroma 값 사용
5. **특수 기능 문서화**: 테마에 고유한 특성(그림자 없음, 커스텀 폰트 등)이 있는 경우 주석을 추가하세요

## 문제 해결

### 테마가 나타나지 않음

- `src/styles/theme.css`에 파일이 임포트되었는지 확인하세요
- 테마 이름이 CSS 파일과 theme-selector.tsx에서 일치하는지 확인하세요
- 파일이 저장되었고 개발 서버가 리로드되었는지 확인하세요

### 색상이 적용되지 않음

- 모든 필수 토큰이 정의되었는지 확인하세요
- `@theme inline` 블록에 모든 색상 매핑이 포함되었는지 확인하세요
- OKLCH 형식이 올바른지 확인하세요 (오타 없음)

### Dark Mode가 작동하지 않음

- `.dark` 셀렉터가 올바른지 확인: `[data-theme='name'].dark`
- dark mode 토큰이 정의되었는지 확인하세요
- `next-themes`가 올바르게 설정되었는지 확인하세요

## 기본 테마 설정

기본적으로 애플리케이션은 `vercel` 테마를 사용합니다. 신규 사용자에게 로드되는 기본 테마를 변경하려면:

### 기본 테마 상수 변경

`src/components/themes/theme.config.ts`를 편집하고 `DEFAULT_THEME` 상수를 업데이트하세요:

```typescript
/**
 * 사용자 설정이 없을 때 로드되는 기본 테마
 * 다른 기본 테마로 설정하려면 이 값을 변경하세요
 */
export const DEFAULT_THEME = 'your-theme-name'; // 이 값을 변경하세요
```

**작동 방식:**

- **단일 진실 공급원(SSOT)**: `DEFAULT_THEME`는 `theme.config.ts`에 정의되며 필요한 모든 곳에서 임포트됩니다.
- **서버 사이드**: HTML `data-theme` 속성에 즉시 적용 (깜빡임 없음)
- **클라이언트 사이드**: 쿠키에 저장된 설정이 없을 때의 fallback으로 사용
- **사용자 설정**: 저장된 사용자 설정(쿠키에 저장됨)은 여전히 존중됨
- **자동**: 여러 파일을 업데이트할 필요가 없음 - 한 번만 변경하면 모든 곳에서 작동

**이 접근 방식의 장점:**

✅ 코드 중복 없음 - 한 번 정의하고 모든 곳에서 사용
✅ Type-safe - TypeScript가 일관성을 보장
✅ 변경이 쉬움 - 한 파일의 한 줄만 수정
✅ 문서화가 잘 되어 있음 - 명확한 주석으로 목적 설명
✅ 즉시 적용 - 스타일이 지정되지 않은 콘텐츠의 깜빡임 없음

## 테마에서 Google Fonts 사용하기

> **참고:** 이 섹션은 폰트에 대한 추가 세부 정보를 제공합니다. 전체 단계별 과정은 위의 "단계별 가이드"에서 **Step 5**를 참조하세요.

### 폰트를 추가해야 하는 경우

다음 경우에만 `font.config.ts`에 폰트를 추가하면 됩니다:

- 아직 임포트되지 않은 Google Font를 테마에서 사용하는 경우
- 로딩이 필요한 커스텀 폰트를 사용하려는 경우

**팁:** 먼저 `src/components/themes/font.config.ts`를 확인하세요 - 이미 많은 폰트를 사용할 수 있습니다!

### 폰트 로딩 과정

1. `src/components/themes/font.config.ts`에서 **폰트 임포트**:

```typescript
import { Roboto, Roboto_Mono } from 'next/font/google';
```

2. CSS 변수로 **폰트 설정**:

```typescript
const fontRoboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto'
});
```

3. `fontVariables` export에 **추가**:

```typescript
export const fontVariables = cn(
  // ... 기존 폰트
  fontRoboto.variable
);
```

4. 테마 CSS에서 폰트의 display name으로 **사용**:

```css
[data-theme='your-theme'] {
  --font-sans: 'Roboto', sans-serif; /* CSS 변수가 아닌 display name 사용 */
  --font-mono: 'Roboto Mono', monospace;
}
```

### 중요 참고 사항

- **폰트 이름**: CSS에서는 폰트의 display name을 사용하세요 (예: `'Roboto'`, `'Open Sans'`). CSS 변수 이름이 아닙니다.
- **폰트 로딩**: Next.js가 폰트를 로드하려면 `font.config.ts`에서 폰트를 임포트해야 합니다.
- **자동 적용**: 폰트 변수는 `layout.tsx`를 통해 body 요소에 자동으로 적용됩니다.
- **사용 가능한 폰트**: 사용 가능한 Google Fonts는 [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)을 확인하세요.

### 예시: Notebook 테마

`notebook` 테마는 `Architects Daughter`를 사용합니다:

**`font.config.ts`에서:**

```typescript
import { Architects_Daughter } from 'next/font/google';

const fontArchitectsDaughter = Architects_Daughter({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-architects-daughter'
});

export const fontVariables = cn(
  // ... 다른 폰트
  fontArchitectsDaughter.variable
);
```

**`notebook.css`에서:**

```css
[data-theme='notebook'] {
  --font-sans: 'Architects Daughter', sans-serif;
}
```

## 참조 파일

- **완전한 테마 예시**: `src/styles/themes/claude.css`
- **테마 통합 파일**: `src/styles/theme.css`
- **테마 선택기 컴포넌트**: `src/components/themes/theme-selector.tsx`
- **테마 제공자**: `src/components/themes/active-theme.tsx`
- **테마 설정** (기본 테마 포함): `src/components/themes/theme.config.ts`
- **폰트 설정**: `src/components/themes/font.config.ts`
