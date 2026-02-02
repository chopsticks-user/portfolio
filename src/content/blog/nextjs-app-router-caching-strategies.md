---
slug: nextjs-app-router-caching-strategies
title: "Next.js App Router Caching Strategies"
excerpt: "Navigating the four layers of caching in the App Router and knowing when to opt out of each one."
coverGradient: "linear-gradient(135deg, hsl(260, 60%, 18%) 0%, hsl(320, 48%, 24%) 100%)"
author: Frost
date: "2026-01-22"
tags: ["Next.js", "Performance"]
published: true
---

The Next.js App Router introduced a multi-layered caching system that defaults to aggressive caching at every level. Understanding these layers — and knowing when to opt out — is critical for building applications where data freshness matters.

## The Four Cache Layers

Next.js caches at the request level (Request Memoization), the data level (Data Cache), the route level (Full Route Cache), and the client level (Router Cache). Each layer serves a different purpose, and each has its own invalidation strategy. The defaults are designed for mostly-static content, which means dynamic applications often need explicit configuration.

## When Static Isn't Enough

For dashboards, real-time feeds, or any page where stale data causes confusion, you need to understand revalidation. Time-based revalidation with `revalidate` works for content that changes on a known schedule. On-demand revalidation with `revalidateTag` and `revalidatePath` handles content that changes in response to user actions. Choosing the wrong strategy — or forgetting to configure one — leads to the kind of bugs where "it works after a hard refresh" becomes a recurring theme.
