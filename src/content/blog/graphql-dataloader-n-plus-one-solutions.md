---
slug: graphql-dataloader-n-plus-one-solutions
title: "GraphQL DataLoader and N+1 Solutions"
excerpt: "Implementing batched data loading to eliminate the N+1 query problem inherent in naive GraphQL resolvers."
coverGradient: "linear-gradient(135deg, hsl(247, 50%, 15%) 0%, hsl(307, 64%, 32%) 100%)"
author: Frost
date: "2025-10-28"
tags: ["GraphQL", "Performance"]
published: true
---

The N+1 problem is GraphQL's most common performance pitfall. A query that fetches a list of users and their posts can generate one query for the user list and one query per user for their posts. DataLoader solves this by batching and deduplicating database requests within a single execution cycle.

## Why N+1 Happens in GraphQL

GraphQL resolvers execute independently. The users resolver returns a list, then the posts resolver runs once per user in that list. Each resolver invocation doesn't know about the others, so each one issues its own database query. With 100 users, that's 101 queries for what should logically be two.

## DataLoader's Batching Strategy

DataLoader collects all keys requested within a single tick of the event loop, then calls a batch function once with all keys. Instead of 100 individual `SELECT * FROM posts WHERE user_id = ?` queries, you get one `SELECT * FROM posts WHERE user_id IN (...)` query. The results are mapped back to the requesting resolvers automatically.

## Per-Request Scoping

DataLoader instances should be created per request, not shared across requests. Each instance maintains its own cache, which prevents data leaking between users and ensures the batch function sees only the keys from the current request. In Express-based servers, this typically means creating DataLoader instances in the context function.
