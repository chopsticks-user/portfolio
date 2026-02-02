---
slug: nextjs-graphql-apollo-fragment-colocation
title: "Next.js GraphQL with Apollo Client and Fragment Colocation"
excerpt: "Integrating @apollo/client-integration-nextjs with fragment colocation, fragment masking, and PreloadQuery for type-safe streaming SSR in the App Router."
coverGradient: "linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d0d1a 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2026-01-31"
tags: ["Next.js", "GraphQL"]
published: true
---

Apollo Client and Next.js App Router have historically been a friction point. The App Router's server-first model clashes with Apollo's client-side cache assumptions. The `@apollo/client-integration-nextjs` package resolves this with RSC-aware data fetching, streaming SSR via `useSuspenseQuery`, and a `PreloadQuery` component that starts fetching in server components and streams results to client components.

## Setup

Install the integration package alongside Apollo Client:

```bash
npm install @apollo/client @apollo/client-integration-nextjs
```

Create the Apollo provider as a client component:

```tsx
"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  InMemoryCache,
  ApolloClient,
  SSRMultipartLink,
} from "@apollo/client-integration-nextjs";

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    fetchOptions: { cache: "no-store" },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            new SSRMultipartLink({ stripDefer: true }),
            httpLink,
          ])
        : httpLink,
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
```

`SSRMultipartLink` handles `@defer` directives during SSR by stripping deferred fragments and accumulating multipart responses. On the client, the standard `HttpLink` handles everything.

Wrap your root layout:

```tsx
import { ApolloWrapper } from "@/lib/apollo-wrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
```

## RSC vs Client Components

The integration distinguishes between two data-fetching patterns:

**Server Components** use `PreloadQuery` to start a fetch during server rendering. The query begins executing on the server, and the result streams to the client as it becomes available — no waterfall.

**Client Components** use `useSuspenseQuery` with React Suspense boundaries. The hook throws a promise that Suspense catches, rendering a fallback until data arrives.

```tsx
import { PreloadQuery } from "@apollo/client-integration-nextjs";
import { Suspense } from "react";
import { UserProfile } from "./user-profile";
import { USER_QUERY } from "./queries";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <PreloadQuery query={USER_QUERY} variables={{ id: params.id }}>
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile id={params.id} />
      </Suspense>
    </PreloadQuery>
  );
}
```

```tsx
"use client";

import { useSuspenseQuery } from "@apollo/client";
import { USER_QUERY } from "./queries";

export function UserProfile({ id }: { id: string }) {
  const { data } = useSuspenseQuery(USER_QUERY, { variables: { id } });
  return <h1>{data.user.name}</h1>;
}
```

`PreloadQuery` initiates the network request during server rendering. By the time the client component mounts and `useSuspenseQuery` runs, the data is already in the cache — zero client-side wait.

## Fragment Colocation with `client-preset`

Fragment colocation means each component declares exactly the data it needs as a GraphQL fragment, colocated with the component file. The `@graphql-codegen/client-preset` generates typed helpers that enforce this pattern:

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/client-preset
```

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "schema.graphql",
  documents: ["src/**/*.tsx"],
  generates: {
    "./src/gql/": {
      preset: "client",
    },
  },
};

export default config;
```

Define a fragment alongside its component:

```tsx
import { graphql, FragmentType, useFragment } from "@/gql";

const AvatarFragment = graphql(`
  fragment Avatar_User on User {
    avatarUrl
    displayName
  }
`);

type AvatarProps = {
  user: FragmentType<typeof AvatarFragment>;
};

export function Avatar({ user: userRef }: AvatarProps) {
  const user = useFragment(AvatarFragment, userRef);
  return <img src={user.avatarUrl} alt={user.displayName} />;
}
```

## Fragment Masking

The `FragmentType` wrapper is the key to fragment masking. When a parent component fetches data that includes the `Avatar_User` fragment, the returned type is opaque — the parent cannot access `avatarUrl` or `displayName` directly. Only the `Avatar` component, by calling `useFragment`, can unmask the data.

This enforces component encapsulation at the type level. If `Avatar` needs a new field, you add it to `AvatarFragment`. The parent query automatically includes it because the fragment is spread in the query. No prop drilling, no manual type updates.

Note that `useFragment` is not a React hook — it's a pure function that narrows a type. You can rename it to `getFragmentData` via the codegen config if the naming conflicts with ESLint's hook rules:

```ts
presetConfig: {
  fragmentMasking: {
    unmaskFunctionName: "getFragmentData",
  },
},
```

## Cache Management

The App Router creates a new Apollo Client instance per request on the server (via `makeClient`). On the client, a single instance persists across navigations. This means:

- Server-rendered data is serialized and sent to the client, where it hydrates the cache
- Subsequent client-side navigations use the client cache
- `fetchPolicy: "cache-and-network"` is a good default for client components that need fresh data

For mutations, `useMutation` works as expected in client components. Cache updates propagate to all components reading the affected data.

## Error Handling

Apollo's `ErrorBoundary` and React's error boundaries work together. `useSuspenseQuery` throws on network errors by default, which error boundaries catch:

```tsx
"use client";

import { ErrorBoundary } from "react-error-boundary";

export function UserSection({ id }: { id: string }) {
  return (
    <ErrorBoundary fallback={<p>Failed to load user</p>}>
      <Suspense fallback={<Skeleton />}>
        <UserProfile id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

For partial errors (some fields resolve, some fail), configure `errorPolicy: "all"` on the query to receive both data and errors.

## When to Use tRPC Instead

If your API is colocated in the same Next.js monorepo and you control both client and server, tRPC provides end-to-end type safety without a schema language, code generation, or a separate GraphQL server. Apollo with fragment colocation shines when you consume a shared GraphQL API used by multiple clients (web, mobile, third-party), where the schema serves as a contract. The choice is about your API boundary, not the quality of either tool.
