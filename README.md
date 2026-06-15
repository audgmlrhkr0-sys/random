# 감상법 제비뽑기

미술관/전시 관람 활동용 팀별 감상법 제비뽑기 웹 앱입니다.

## 실행 방법

### 방법 1 — 바로 열기 (추천)

`standalone` 폴더 안의 **`index.html`** 을 더블클릭하세요.

```
제비뽑기/standalone/index.html
```

Node.js 설치 없이 바로 사용할 수 있습니다.

### 방법 2 — 개발 서버 (React 버전)

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

> 루트 폴더의 `index.html`은 Vite용이라 더블클릭하면 빈 화면이 나옵니다.  
> **반드시 `standalone/index.html`을 열거나**, `npm run dev`로 실행하세요.

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 메인 — 팀 선택 |
| `/team/:teamId` | 팀 활동 — 감상법 작성/제출 |
| `/draw` | 추첨 (진행자용) |
| `/result` | 추첨 결과 |

## 설정 변경

`src/config.js`에서 다음 항목을 수정할 수 있습니다.

- `TEAM_NAMES` — 팀 이름
- `TEAM_COUNT` — 팀 수
- `DRAW_COUNT_PER_TEAM` — 팀당 배정 개수
- `EXCLUDE_OWN_TEAM` — 자기 팀 감상법 제외 여부
- `SHOW_AUTHOR_TEAM` — 결과 화면 작성 팀 기본 표시 여부

## 데이터 저장

브라우저 `localStorage`에 저장됩니다. 추첨 화면의 **데이터 초기화** 버튼으로 다음 회차를 준비할 수 있습니다.
