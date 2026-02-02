---
slug: graphql-schema-stitching-federation-compared
title: "GraphQL Schema Stitching vs Federation"
excerpt: "A practical comparison of schema composition approaches for microservice architectures using GraphQL."
coverGradient: "linear-gradient(135deg, hsl(320, 70%, 21%) 0%, hsl(20, 56%, 28%) 100%)"
author: Frost
date: "2026-01-15"
tags: ["GraphQL"]
published: true
---

As GraphQL APIs grow beyond a single service, you need a strategy for composing schemas. The two dominant approaches — schema stitching and Apollo Federation — solve the same problem in fundamentally different ways, and the choice has long-term architectural consequences.

## Schema Stitching: Gateway-Centric

Schema stitching merges multiple GraphQL schemas at the gateway level. The gateway fetches schemas from downstream services, resolves conflicts, and presents a unified API to clients. This approach gives the gateway team significant control over the public schema, but it also makes the gateway a coordination bottleneck.

## Federation: Service-Centric

Apollo Federation inverts the ownership model. Each service defines its own slice of the graph, including how its types relate to types owned by other services. The gateway composes these subgraphs automatically using directives like `@key` and `@external`. This distributes ownership to service teams but requires discipline in schema design to avoid conflicts and circular dependencies.
