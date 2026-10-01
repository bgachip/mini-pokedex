# Mini Pokédex

A small Angular application for browsing Pokémon and building custom Pokémon teams.

The application uses the PokéAPI GraphQL API for Pokémon data and a local GraphQL mock server for team management.

## Tech Stack

- Angular 21
- TypeScript
- Angular Material
- RxJS
- Angular Signals
- Reactive Forms
- GraphQL
- Vitest

## Features

### Pokédex

- Displays the first 151 Pokémon
- Search by Pokémon name
- Filter by Pokémon type
- Sort by stats and total base stats
- Pagination with 10, 25 and 50 items per page
- Pokémon detail side panel
- Ability information
- Animated radar chart for Pokémon stats
- Loading, empty and error states with retry support

### Team Builder

- View existing teams
- Create new teams
- Delete teams with confirmation
- Select and persist the selected team
- Pokémon autocomplete
- Add between 1 and 6 Pokémon to a team
- Unique team name validation
- Optimistic create and delete operations with rollback on API failure
- Success and error feedback

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm

### Installation

Clone the repository and install the dependencies:

```bash id="yynp8f"
git clone https://github.com/bgachip/mini-pokedex
cd mini-pokedex
npm install
```

## Running the Mock GraphQL Server

The Team Builder uses a local GraphQL mock server.

Start it from the project root:

```bash id="ipkw0f"
npx json-graphql-server db.js --port 4000
```

The GraphQL server will be available at:

```text id="xtwm71"
http://localhost:4000
```

Keep the mock server running while using the Team Builder.

## Running the Application

Open another terminal and run:

```bash id="8q69l9"
npm start
```

or:

```bash id="h02kq4"
ng serve
```

Then open:

```text id="yl2i37"
http://localhost:4200
```

## Running Tests

Run the test suite with:

```bash id="6amoj7"
npm test
```

The tests cover:

- optimistic store rollback
- Pokémon selector logic
- async unique team name validation
- basic application rendering

## Production Build

Create a production build with:

```bash id="9mp19n"
ng build
```

## Architecture

The application uses a feature-based structure, with the Pokédex and Team Builder implemented as separate feature areas.

```text id="7pfj0w"
src/
├── app/
│   ├── pokedex/
│   │   ├── components/
│   │   ├── models/
│   │   ├── pokedex-page/
│   │   ├── services/
│   │   ├── state/
│   │   └── utils/
│   │
│   ├── teams/
│   │   ├── components/
│   │   ├── models/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── state/
│   │   ├── utils/
│   │   └── validators/
│   │
│   ├── app.config.ts
│   ├── app.html
│   ├── app.routes.ts
│   ├── app.scss
│   ├── app.spec.ts
│   └── app.ts
│
├── index.html
├── main.ts
└── styles.scss
```

### Feature Organization

The `pokedex` feature contains Pokémon browsing, searching, filtering, sorting, pagination, detail display and Pokémon-related state management.

The `teams` feature contains team listing, team creation and deletion, Pokémon selection, validation and team-related state management.

### State Management

The application uses lightweight custom stores based on RxJS `BehaviorSubject`.

Pokémon and team data are exposed as observable streams. Angular Signals are used for local UI state and derived values.

`toSignal()` is used to bridge observable store state into Angular Signals where appropriate.

### RxJS

RxJS is used for asynchronous data flows including:

- debounced Pokémon search
- Pokémon autocomplete
- derived store selectors
- API requests
- optimistic updates and rollback

### Angular Signals

Angular Signals are used for local UI state such as the selected Pokémon and selected team.

`computed()` is used for derived UI state.

`effect()` is used to persist the selected team to `localStorage`.

### Optimistic Updates

Team creation and deletion use optimistic updates.

The local state is updated immediately while the API request is running. If the request fails, the previous state is restored and error feedback is displayed to the user.

## APIs

Pokémon data is retrieved from the PokéAPI GraphQL endpoint:

```text id="7j9uxk"
https://beta.pokeapi.co/graphql/v1beta
```

Team data is managed through the local GraphQL mock server running on port `4000`.

## Possible Improvements

Given more development time, possible improvements would include:

- additional component and integration tests
- end-to-end tests for the main user flows
- improved accessibility and keyboard navigation
- more advanced Pokémon filtering
- stronger API error handling
- improved responsive layouts for smaller screens
- additional reusable UI components
