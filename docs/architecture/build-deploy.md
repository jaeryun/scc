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

- PostgreSQL: `postgresql://app:app@db:5432/coredb`
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

- **Phase 1**: 폐쇄망, 외부 CDN 불가 — `images.unoptimized: true`
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
