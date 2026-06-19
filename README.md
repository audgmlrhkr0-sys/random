# 감상법 제비뽑기

미술관/전시 관람 활동용 팀별 감상법 제비뽑기 웹 앱입니다.

**하나의 링크**로 여러 기기(휴대폰·태블릿)가 함께 접속해, 각 팀이 감상법을 제출하고 추첨 결과를 실시간으로 볼 수 있습니다.

## Supabase 설정 (필수)

여러 기기 동기화를 위해 [Supabase](https://supabase.com) 무료 계정이 필요합니다.

1. Supabase에서 새 프로젝트 생성
2. **SQL Editor**에서 `supabase/schema.sql` 내용 실행
3. **Table Editor** → `rooms`, `submissions` 테이블 → **Realtime** 켜기
4. **Settings → API**에서 Project URL, anon public key 복사
5. 프로젝트 루트에 `.env` 파일 생성:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

(`.env.example` 참고)

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 → **새 활동 시작하기** → 생성된 링크를 팀원에게 공유

### 배포

Vercel, Netlify 등에 배포할 때도 환경 변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 설정하세요.

## 사용 흐름

1. 진행자가 **새 활동 시작** → `/r/abc123` 형태의 공유 링크 생성
2. 팀원들이 같은 링크로 접속 → 각자 팀 선택 → 감상법 작성·제출
3. 진행자가 **추첨** → 모든 기기에서 결과 실시간 확인

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 시작 — 새 방 만들기 / 방 코드로 참여 |
| `/r/:roomId` | 메인 — 공유 링크, 팀 선택 |
| `/r/:roomId/team/:teamId` | 팀 활동 — 감상법 작성/제출 |
| `/r/:roomId/draw` | 추첨 (진행자용) |
| `/r/:roomId/result` | 추첨 결과 |

## 설정 변경

`src/config.js`에서 다음 항목을 수정할 수 있습니다.

- `TEAM_NAMES` — 팀 이름
- `TEAM_COUNT` — 팀 수
- `DRAW_COUNT_PER_TEAM` — 팀당 배정 개수
- `SHOW_AUTHOR_TEAM` — 결과 화면 작성 팀 기본 표시 여부

## standalone 버전

`standalone/` 폴더는 기기별 localStorage만 사용하는 오프라인용입니다. **여러 기기 연동**은 React + Supabase 버전을 사용하세요.
