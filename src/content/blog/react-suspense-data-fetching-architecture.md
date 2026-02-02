---
slug: react-suspense-data-fetching-architecture
title: "React Suspense Data Fetching Architecture"
excerpt: "Designing data fetching layers that work with Suspense boundaries for streaming SSR and parallel data loading."
coverGradient: "linear-gradient(135deg, hsl(87, 60%, 24%) 0%, hsl(147, 48%, 24%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-11-10"
tags: ["React", "Performance"]
published: true
---

Suspense changes the data fetching paradigm in React from "fetch then render" to "render while fetch." This shift requires rethinking how data loading is structured — both on the server for streaming SSR and on the client for navigations.

## The Fetch-Then-Render Problem

Traditional React data fetching follows a waterfall: a component mounts, triggers a fetch in useEffect, shows a loading state, then renders with data. Nested components create sequential waterfalls where each level waits for its parent to finish loading before starting its own fetch. The total loading time is the sum of all waterfall stages.

## Render-As-You-Fetch

With Suspense, data fetching starts before the component renders. A parent component (or the router) initiates all data requests upfront. Components that need data "suspend" — they throw a promise that Suspense catches. When the data resolves, React retries rendering. Since all fetches started simultaneously, the total time is the maximum of the individual fetches, not the sum.

## Streaming SSR Integration

On the server, Suspense enables streaming. The server sends the shell of the page immediately, with Suspense fallbacks in place of unresolved components. As each data promise resolves, the server streams the rendered HTML along with a script that swaps the fallback for real content. The user sees progressive disclosure of content without waiting for the slowest data source.
