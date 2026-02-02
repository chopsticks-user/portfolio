---
slug: nextjs-parallel-intercepting-routes
title: "Next.js Parallel and Intercepting Routes"
excerpt: "Building modal patterns, split views, and conditional layouts with parallel routes and route interception."
coverGradient: "linear-gradient(135deg, hsl(261, 60%, 18%) 0%, hsl(321, 64%, 32%) 100%)"
author: Frost
date: "2025-07-18"
tags: ["Next.js", "React"]
published: true
---

Parallel routes and intercepting routes are advanced Next.js App Router features that enable UI patterns like modals, split views, and conditional rendering based on navigation context. They solve problems that previously required complex client-side state management.

## Parallel Routes

Parallel routes render multiple page components simultaneously in the same layout. Defined with the @folder convention, each parallel route has its own loading and error states. A dashboard layout might render @analytics and @activity as parallel slots, each independently fetching their data and handling their loading states.

## Intercepting Routes

Route interception catches navigation to a route and renders it in a different context. The classic example is a photo modal: clicking a photo in a grid shows it in a modal (intercepted route), while navigating directly to the photo URL shows it as a full page. The (..) convention defines interception relative to the route structure.

## Combining Both Patterns

The most powerful pattern combines parallel and intercepting routes. A layout with a @modal parallel slot intercepts certain routes to render them as modals. The modal slot shows the intercepted content, while the main slot continues showing the page behind it. Closing the modal or navigating directly shows the full page version. This creates a seamless experience where the same content adapts to its navigation context.
