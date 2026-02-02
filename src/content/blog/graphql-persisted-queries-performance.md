---
slug: graphql-persisted-queries-performance
title: "GraphQL Persisted Queries for Performance"
excerpt: "Eliminating query parsing overhead and reducing payload sizes with persisted query strategies in GraphQL APIs."
coverGradient: "linear-gradient(135deg, hsl(168, 70%, 15%) 0%, hsl(228, 64%, 32%) 100%)"
author: Frost
date: "2025-06-28"
tags: ["GraphQL", "Performance"]
published: true
---

Persisted queries address two performance concerns in GraphQL: the overhead of parsing and validating query strings on every request, and the payload size of sending full query documents over the network. By pre-registering queries with the server, both concerns are eliminated.

## Automatic Persisted Queries (APQ)

APQ is a protocol where the client sends a hash of the query instead of the full query string. On the first request, the server doesn't recognize the hash and asks the client to retry with the full query. The server caches the query by its hash, and subsequent requests only need the hash. This is transparent to the client after initial setup and requires no build-time coordination.

## Compiled Persisted Queries

For maximum security and performance, compile all queries at build time and register them with the server. The server only accepts registered queries, rejecting arbitrary GraphQL strings. This eliminates the entire parsing/validation step and prevents clients from sending expensive or malicious queries. Tools like Relay and GraphQL Code Generator support extracting queries at build time.

## Cache Integration

Persisted queries pair naturally with CDN caching. Since the query is identified by a stable hash, GET requests with the hash as a parameter can be cached at the CDN level. This turns GraphQL queries into cacheable resources, combining GraphQL's flexibility with REST's cacheability.
