---
slug: spring-cloud-gateway-api-patterns
title: "Spring Cloud Gateway API Patterns"
excerpt: "Building API gateways with Spring Cloud Gateway for routing, rate limiting, circuit breaking, and request transformation."
coverGradient: "linear-gradient(135deg, hsl(9, 60%, 24%) 0%, hsl(69, 56%, 28%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-09-10"
tags: ["Spring"]
published: true
---

Spring Cloud Gateway provides a non-blocking, reactive API gateway built on Spring WebFlux. It handles cross-cutting concerns — routing, rate limiting, authentication, transformation — that individual microservices shouldn't implement independently.

## Route Configuration

Routes are the fundamental building block. Each route has a predicate (matching condition) and a set of filters (request/response transformations). Predicates match on path, host, headers, or query parameters. Filters rewrite paths, add headers, modify request bodies, or implement custom logic. Routes can be defined in YAML configuration or programmatically in Java.

## Rate Limiting

The built-in RequestRateLimiter filter uses Redis to enforce rate limits across gateway instances. Configure limits per route with a key resolver that determines how to group requests — by IP address, by authenticated user, by API key. The token bucket algorithm allows bursts up to a configured limit while maintaining a sustained rate over time.

## Circuit Breaking

Integrating with Resilience4j, the gateway can circuit-break routes to downstream services. When error rates exceed a threshold, the circuit opens and the gateway returns fallback responses instead of forwarding requests to a failing service. This prevents cascading failures and gives the downstream service time to recover without being overwhelmed by retry storms.
