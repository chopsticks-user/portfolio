---
slug: graphql-federation-at-scale-dotnet-spring
title: "GraphQL Federation at Scale with .NET and Spring"
excerpt: "Running a federated supergraph across .NET and Spring services exposes interesting challenges around schema composition, error propagation, and query planning. Here's what we learned operating one in production."
coverGradient: "linear-gradient(135deg, #1a0a1a 0%, #3a1a3a 50%, #1a0a1a 100%)"
author: Frost
date: "2026-01-05"
tags: ["GraphQL", ".NET", "Spring"]
published: true
---

GraphQL Federation lets you compose multiple GraphQL services into a single supergraph. In theory, this means each team owns their slice of the schema and clients query everything through one endpoint. In practice — especially across heterogeneous stacks — the details get interesting.

We operate a federated supergraph where some subgraphs run on .NET (Hot Chocolate) and others on Spring Boot (DGS Framework). This post covers what we learned.

## The Architecture

```
                    ┌─────────────┐
                    │   Gateway   │
                    │  (Router)   │
                    └──────┬──────┘
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴────┐ ┌────┴─────┐
        │  Users     │ │ Orders │ │ Products │
        │  (.NET)    │ │ (Spring)│ │ (.NET)   │
        └───────────┘ └────────┘ └──────────┘
```

The gateway (Apollo Router) handles query planning — breaking a client query into sub-queries routed to the appropriate subgraphs, then stitching results together.

## Schema Composition Across Stacks

Federation's `@key` directive defines how entities are referenced across services. A `User` defined in the .NET service can be extended by the Spring service:

```graphql
# Users subgraph (.NET / Hot Chocolate)
type User @key(fields: "id") {
  id: ID!
  name: String!
  email: String!
}
```

```graphql
# Orders subgraph (Spring / DGS)
type User @key(fields: "id") {
  id: ID!
  orders: [Order!]!
}

type Order {
  id: ID!
  total: Float!
  createdAt: DateTime!
}
```

The router composes these into a unified `User` type. When a client queries `user { name orders { total } }`, the router fetches `name` from the .NET service and `orders` from Spring — stitching the result.

### Where It Gets Tricky

**DateTime handling.** .NET serializes `DateTime` as ISO 8601 with timezone offset by default. Spring's DGS uses `OffsetDateTime` which serializes similarly, but subtle formatting differences (e.g., `Z` vs `+00:00`) can break client-side parsing if you're not careful with custom scalars.

**Nullability conventions.** Hot Chocolate defaults to non-null for reference types (following C# nullable reference types). DGS defaults to nullable. Without explicit coordination, your composed schema can have inconsistent nullability that confuses clients.

**Error format.** Both frameworks implement the GraphQL spec's error format, but extensions differ. Hot Chocolate includes `code` in error extensions. DGS uses `errorType`. Clients consuming federated errors need to handle both.

## Query Planning Performance

The router's query plan determines how sub-queries are executed. For a query touching three subgraphs:

```graphql
query {
  user(id: "123") {
    name # → Users (.NET)
    orders {
      # → Orders (Spring)
      total
      product {
        # → Products (.NET)
        name
      }
    }
  }
}
```

The router generates a plan:

1. Fetch `user.name` from Users service
2. Fetch `user.orders` from Orders service (requires `user.id` from step 1)
3. For each order, fetch `product` from Products service (requires `order.productId` from step 2)

Steps 1 and 2 can parallelize if the router is smart about it. Step 3 is sequential and potentially expensive — it's an N+1 at the federation layer.

### Mitigations

- **`@requires` directive** lets you declare data dependencies explicitly so the router can batch requests
- **Entity batching** — both Hot Chocolate and DGS support batched entity resolution (`_entities` query) to avoid per-item round trips
- **Query plan caching** — the router caches plans for repeated query shapes, amortizing planning cost

## Error Propagation

A federated error from a single subgraph can surface in different ways depending on nullability:

```json
{
  "data": {
    "user": {
      "name": "Frost",
      "orders": null
    }
  },
  "errors": [
    {
      "message": "Connection refused",
      "path": ["user", "orders"],
      "extensions": {
        "code": "SERVICE_UNAVAILABLE",
        "serviceName": "orders"
      }
    }
  ]
}
```

If `orders` is non-null in the schema, the null propagates upward — potentially nullifying the entire `user` object. This is the **null propagation problem** in GraphQL, and it's amplified in federation because a single subgraph failure can cascade.

Our approach: make federated fields nullable at the boundary. A subgraph going down shouldn't null out the entire response. Use `@inaccessible` for truly internal fields that shouldn't appear in the composed schema.

## Observability

Distributed tracing is non-negotiable. Each subgraph request needs a trace context propagated from the gateway. We use OpenTelemetry across both stacks:

- **.NET:** `OpenTelemetry.Extensions.Hosting` with the Hot Chocolate instrumentation package
- **Spring:** Spring Boot Actuator + Micrometer with OTLP exporter

The gateway adds its own spans for query planning and response assembly. The resulting trace shows exactly where time is spent — in the plan, in transit, or in subgraph execution.

## Lessons Learned

1. **Schema governance matters early.** Without conventions for naming, nullability, and custom scalars, composition issues multiply as you add subgraphs.
2. **Federation adds latency.** The gateway hop, query planning, and multiple sub-requests add overhead. Measure it and optimize the critical paths.
3. **Versioning is hard.** Subgraph schema changes must be backward-compatible. We run composition checks in CI — a breaking change blocks the deploy.
4. **Mixed stacks work, but need coordination.** The frameworks have different defaults and conventions. Document the delta and enforce consistency through shared schema linting.
5. **Test the composed graph, not just subgraphs.** Integration tests that run queries against the composed supergraph catch issues that unit-testing individual subgraphs misses.

Federation isn't simple, and running it across .NET and Spring adds friction that a single-stack setup avoids. But for organizations where teams own their data domains and choose their own technology, it provides a coherent API layer that would be difficult to achieve otherwise.
