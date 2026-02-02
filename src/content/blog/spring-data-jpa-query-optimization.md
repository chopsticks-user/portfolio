---
slug: spring-data-jpa-query-optimization
title: "Spring Data JPA Query Optimization"
excerpt: "Identifying and fixing common JPA performance problems: eager loading, cartesian products, and projection strategies."
coverGradient: "linear-gradient(135deg, hsl(154, 60%, 27%) 0%, hsl(214, 64%, 32%) 100%)"
author: Frost
date: "2025-10-02"
tags: ["Spring", "Performance"]
published: true
---

Spring Data JPA makes database access convenient, but convenience often masks performance problems. The default behaviors — eager fetching of relationships, loading full entities when only a few fields are needed, and implicit query generation — can produce workloads that are orders of magnitude heavier than necessary.

## The Eager Loading Trap

JPA entities with @ManyToOne relationships default to FetchType.EAGER, which means accessing any field on the parent entity also loads the related entity. In a list query, this creates additional SELECT statements per row. Switch relationships to FetchType.LAZY and use JOIN FETCH in JPQL queries where you explicitly need the related data.

## Cartesian Product Explosions

Fetching multiple collection relationships in a single query produces a cartesian product. An entity with two @OneToMany relationships (10 items each) generates 100 rows in the result set. Hibernate deduplicates in memory, but the database still processes and transmits the bloated result. The fix is to fetch collections separately or use @BatchSize annotations.

## Projections for Read Operations

Loading full entities when you only need a few fields wastes memory and bandwidth. Spring Data JPA supports interface-based projections that generate optimized SELECT statements. Define an interface with getter methods matching the fields you need, and Spring generates a query that only fetches those columns. For complex aggregations, use class-based (DTO) projections with constructor expressions.
