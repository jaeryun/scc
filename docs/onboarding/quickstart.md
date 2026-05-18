# 빠른 시작

## 5분 만에 개발 서버 띄우기

```bash
bun install
cp .env.example .env.local
# .env.local에 DATABASE_URL=postgresql://... 설정
bun run dev
```

http://localhost:3000 으로 접속.

## Docker Compose

```bash
docker compose up -d
```

PostgreSQL + Next.js 동시 실행 (DB 자동 구성).

## 주요 명령어
| 명령어 | 용도 |
|--------|------|
| `bun run dev` | 개발 서버 (:3000) |
| `bun run build` | 프로덕션 빌드 |
| `bun run lint` | ESLint |
| `bun run lint:fix` | ESLint 자동 수정 |
| `bun run format` | Prettier |
| `bun run format:check` | 포매팅 검사 |
| `bunx prisma generate` | Prisma 클라이언트 생성 |
| `bunx prisma db push` | 스키마를 DB에 직접 반영 (프로토타입 전용) |
