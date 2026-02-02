---
slug: nextjs-turbopack-migration-guide
title: "Next.js Turbopack Migration Guide"
excerpt: "Migrating from Webpack to Turbopack in Next.js for faster development builds and HMR."
coverGradient: "linear-gradient(135deg, hsl(189, 70%, 27%) 0%, hsl(249, 64%, 32%) 100%)"
author: Frost
date: "2025-06-22"
tags: ["Next.js"]
published: true
---

Turbopack is the Rust-based successor to Webpack in Next.js. It provides significantly faster development builds and hot module replacement by leveraging incremental computation and persistent caching. Migrating from Webpack requires understanding what's compatible, what needs changes, and what's not yet supported.

## Enabling Turbopack

Turbopack is enabled with the --turbopack flag on next dev. In Next.js 15+, it's the default for new projects. The migration is primarily about ensuring your configuration and dependencies are compatible — Turbopack handles the same source code that Webpack does, but some Webpack-specific configurations need translation.

## Configuration Differences

Webpack loaders configured in next.config.js need equivalent Turbopack configuration. Many common loaders (CSS modules, PostCSS, image imports) work out of the box. Custom Webpack configurations in the webpack key are ignored by Turbopack — move them to the turbopack configuration section. Some Webpack plugins have no Turbopack equivalent yet; check the compatibility table.

## Performance Expectations

Development startup is where Turbopack shines most. Initial compilation is typically 3-10x faster than Webpack, and HMR updates are near-instant regardless of project size because Turbopack only recompiles what changed. Production builds may see less dramatic improvements because Webpack's production pipeline is already heavily optimized with caching.
