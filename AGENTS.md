# AGENTS.md

## Product Intent

이 앱은 일반적인 목록 관리 앱이 아니라 **개인 디지털 술장**이다.

가장 중요한 경험:
- 앱을 열면 실제 술장을 보는 느낌
- 카드 UI보다 병 자체가 먼저 보임
- 마신 술도 삭제하지 않고 빈 병으로 남김
- 카메라 등록이 핵심 액션
- 페어링 추천은 기본적으로 사용자가 현재 보유한 술 안에서 수행

## Design Rules

- Mobile first: 360~430px 우선
- Dark / Premium / Warm
- Dark walnut, charcoal, amber, ivory 계열
- 과도한 admin/dashboard 스타일 금지
- 큰 카드 박스 남발 금지
- 병 실루엣과 선반 연출 우선
- 터치 영역 최소 44px
- 애니메이션은 절제
- 한국어 UI 우선
- 접근성 기본 준수

## Engineering Rules

- React + TypeScript + Vite
- 기능 단위로 컴포넌트 분리
- Mock data와 UI 분리
- API/DB는 초기 Prototype에서 구현하지 않음
- 외부 이미지가 없어도 깨지지 않는 fallback 제공
- 새로운 기능 추가 전 DESIGN.md의 제품 방향과 충돌 여부 확인

## Current Task

UI Prototype을 완성한다.

필수 화면:
1. Cabinet
2. History / Empty Bottles
3. Bottle Detail
4. Add Bottle / Camera Mock
5. Pairing Mock

기능 구현보다 사용감과 시각 완성도를 우선한다.
