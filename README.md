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

- Browse Pokémon retrieved from the PokéAPI GraphQL API
- Search Pokémon by name with debounced input
- Filter Pokémon by type
- Sort Pokémon by individual stats and total base stats
- Client-side pagination with 10, 25 and 50 items per page
- Pokémon detail side panel
- Ability information
- Animated radar chart for Pokémon stats
- Loading, empty, error and success states
- Retry support for failed requests

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

```bash
git clone https://github.com/bgachip/mini-pokedex
cd mini-pokedex
npm install
```

## Running the Mock GraphQL Server

The Team Builder uses a local GraphQL mock server.

Start it from the project root:

```bash
npx json-graphql-server db.js --port 4000
```

The GraphQL server will be available at:

```text
http://localhost:4000
```

Keep the mock server running while using the Team Builder.

## Running the Application

Open another terminal and run:

```bash
npm start
```

or:

```bash
ng serve
```

Then open:

```text
http://localhost:4200
```

## Running Tests

Run the test suite with:

```bash
npm test
```

The tests cover:

- optimistic store rollback
- Pokémon selector logic
- async unique team name validation
- basic application rendering

## Production Build

Create a production build with:

```bash
ng build
```

## Architecture

The application follows a feature-based structure, with the Pokédex and Team Builder implemented as separate feature areas.

```text
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

The `pokedex` feature contains Pokémon browsing, searching, filtering, sorting, client-side pagination, detail display and Pokémon-related state management.

The `teams` feature contains team listing, team creation and deletion, Pokémon selection, validation and team-related state management.

### State Management

The application uses lightweight custom stores based on RxJS `BehaviorSubject`.

The Pokémon store caches fetched Pokémon data and exposes it as observable state. Team state is managed in a separate store.

Derived Pokémon data such as filtering, sorting and pagination is handled through RxJS selector functions rather than modifying the source state.

Angular Signals are used for local UI state and derived UI values.

`toSignal()` is used to bridge observable store and selector state into Angular Signals where appropriate.

### RxJS

RxJS is used for asynchronous and derived data flows including:

- debounced Pokémon search using `debounceTime`, `distinctUntilChanged` and `switchMap`
- Pokémon autocomplete
- derived filtering, sorting and pagination
- combining state with `combineLatest`
- shared derived streams with `shareReplay`
- API requests
- optimistic updates and rollback

Subscriptions that require explicit lifecycle handling use Angular's `takeUntilDestroyed()` integration.

### Angular Signals

Angular Signals are used for local UI state such as the selected Pokémon, Pokémon detail state and selected team.

`computed()` is used for derived UI state.

`effect()` is used to persist the selected team to `localStorage`.

`toSignal()` is used where observable state needs to be consumed as Signals in components.

### Pokédex Data Flow

Pokémon data is fetched through the PokéAPI GraphQL API and cached in the Pokémon store.

The displayed table data is derived client-side:

```text
PokéAPI
   ↓
PokemonStore
   ↓
Search / Type Filter
   ↓
Filtering
   ↓
Sorting
   ↓
Pagination
   ↓
Pokédex Table
```

Changing the search term or type filter resets the table to the first page.

Pokémon detail data uses the selected Pokémon from the cached list, while ability information is loaded separately when the detail panel is opened.

### Optimistic Updates

Team creation and deletion use optimistic updates.

The local state is updated immediately while the API request is running. If the request fails, the previous state is restored and error feedback is displayed to the user.

## APIs

Pokémon data is retrieved from the PokéAPI GraphQL endpoint:

```text
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
