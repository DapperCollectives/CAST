# CAST Frontend

## Prerequisites

- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

- [GoLang 1.16+](https://golang.org/doc/install)
- [Node/NPM v16](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Flow CLI v0.37.5](https://docs.onflow.org/flow-cli/install/)

## Installation

```bash
yarn install
```

Installing Node via [NVM](https://github.com/nvm-sh/nvm#installation-and-update)
```bash
nvm install v16.13.0
nvm use 16
node -v
```

## Development

#### Client

```bash
yarn start
```

You should now be able to see the client app at `localhost:3000`.

#### Blockchain

To start a local blockchain & dev-wallet, follow the instructions in the `/backend` folder.

## Testing

First, disable the storage limit for the Flow emulator

```bash
export FLOW_STORAGELIMITENABLED=false
```

Then, run the test suite

```bash
cd test
npm run test
```

## Typescript Styleguide

### Functional Components
```typescript
interface MyComponentProps {
    prop1: boolean;
    prop2: number;
    prop3: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({prop1, prop2}) => {

}

export default MyComponent;
```

### Hooks
```typescript
export interface MyHookProps {
    prop1: number;
}

export interface MyHookReturn {
    prop1: () => void;
}

export const myHook = (prop1) => {}
```

### Refs
```typescript
cont ref = useRef<HTMLElement> = useRef(null);
```

### Event Handler
```typescript
// onChange
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
<input onChange={handleChange}>

// onClick
const handleClick = (e: HTMLElement) => {}
<div onClick={handleChange}>
```

### Context
```typescript
interface AppContextInterface {
  name: string;
  author: string;
  url: string;
}

const AppCtx = createContext<AppContextInterface | null>(null);

// Provider in your app

const sampleAppContext: AppContextInterface = {
  name: "Using React Context in a Typescript App",
  author: "thehappybug",
  url: "http://www.example.com",
};

export const App = () => (
  <AppCtx.Provider value={sampleAppContext}>...</AppCtx.Provider>
);

// Consume in your app
import { useContext } from "react";

export const PostInfo = () => {
  const appContext = useContext(AppCtx);
  return (
    <div>
      Name: {appContext.name}, Author: {appContext.author}, Url:{" "}
      {appContext.url}
    </div>
  );
};
```