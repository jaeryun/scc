# 빌드 & 배포

## Docker 이미지

### Node.js (`Dockerfile`)

- `output: 'standalone'` 모드 (next.config.ts에 설정)
- ARG 정의 없음 — 빌드 시점 `NEXT_PUBLIC_*` 주입 불가
- `COPY --from=builder /app/.next/standalone ./`
- `ENV NODE_ENV=production`

### Bun (`Dockerfile.bun`)

- `--build-arg`로 `NEXT_PUBLIC_*` 전달 가능
- `docker run -e`로 런타임 시크릿 주입
- `ENV BUILD_STANDALONE=true` 명시
- `USER bun` 비루트 실행

### 빌드 명령

```bash
# Node.js
docker build -t scc-app .

# Bun
docker build -f Dockerfile.bun -t scc-app:bun .
```

## Docker Compose

`docker-compose.yml`: PostgreSQL 16 + Next.js

```bash
docker compose up -d
```

- PostgreSQL: `postgresql://scc:SCC@db:5432/scc`
- 애플리케이션: `http://localhost:3000`
- `docker compose` 상에서는 `DATABASE_URL`이 컨테이너 내부 DB 주소를 가리켜야 함

## 환경변수

```bash
cp .env.example .env.local
```

| 변수               | 용도                                           |
| ------------------ | ---------------------------------------------- |
| `DATABASE_URL`     | PostgreSQL 연결 문자열 (필수)                  |
| `BUILD_STANDALONE` | standalone 출력 활성화 (Docker 배포 시 `true`) |

- 폐쇄망, 외부 CDN 불가 — `images.unoptimized: true`
- `NEXT_PUBLIC_*` 변수: 빌드 시점 포함, 런타임 시크릿은 `-e`로 Docker 주입

## Prisma 워크플로

```bash
# 1. 스키마 변경
bunx prisma migrate dev --name YYMMDD_설명

# 2. 클라이언트 생성 (빌드 전 필수)
bunx prisma generate

# 3. 빌드
bun run build
```

## 마이그레이션 무결성

`scripts/check-migrations.sh` — schema.prisma와 마이그레이션 일치 여부 검사.

- CI 또는 `bun run build` 전 자동 실행
- 드리프트 발견 시 `bunx prisma migrate dev`로 마이그레이션 생성 필요

## 배포 체크리스트

- [ ] `check-migrations.sh` 통과
- [ ] `bun run build` 성공
- [ ] `DATABASE_URL` 환경변수 설정
- [ ] `BUILD_STANDALONE=true` (Docker 배포 시)
- [ ] 이미지 최적화 비활성화 확인 (폐쇄망)

## CI 러너 이미지

GitLab CI는 사전 빌드된 단일 이미지를 사용. 정의는 `Dockerfile.ci-runner`, 사내 레지스트리에 푸시 후 `.gitlab-ci.yml`의 `image:`에서 참조.

### 베이스 선택

- `oven/bun:1.2.10-debian` — Bun 공식 debian 베이스. Alpine은 musl libc로 Playwright 비호출
- `playwright@1.60.0 install --with-deps chromium` — Chromium + 시스템 의존성 한 번에 설치
- Firefox/WebKit 제외 — 사내 e2e는 Chromium만 사용
- `psql` 미포함 — CI는 Prisma로만 DB 접근 (별도 `services:` Postgres 컨테이너 사용)

### 빌드/푸시 절차

```bash
# 1. 빌드
docker build -f Dockerfile.ci-runner -t registry.scc.local/ci-runner:1.0.0 .

# 2. 사내 레지스트리에 푸시
docker push registry.scc.local/ci-runner:1.0.0

# 3. .gitlab-ci.yml의 image: 라인을 실제 푸시한 태그로 교체
```

- 버전 태그 권장 형식: `1.0.0` (Playwright 또는 Bun 메이저 업 시 bump)
- Playwright 버전 핀은 `Dockerfile.ci-runner`에서 (`playwright@1.60.0`)

### GitLab 러너 요구사항

- k8s 기반, `image:` 자유 지정 가능
- DinD 불필요
- 러너 태그 `scc-runner` — `.gitlab-ci.yml`의 `tags:`에 매칭
- 통합/E2E 잡은 GitLab CI 표준 `services:`로 `postgres:16` 별도 기동
