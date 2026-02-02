---
slug: dotnet-async-await-task-parallel-patterns
title: ".NET Async/Await and Task Parallel Patterns"
excerpt: "Mastering async/await, Task combinators, and avoiding common pitfalls like sync-over-async and ConfigureAwait issues."
coverGradient: "linear-gradient(135deg, hsl(122, 70%, 24%) 0%, hsl(182, 48%, 24%) 100%)"
author: Frost
date: "2025-07-08"
tags: [".NET"]
published: true
---

Asynchronous programming in .NET is built on Tasks and the async/await syntax. While the language makes async code look sequential, understanding the underlying mechanics prevents subtle bugs that manifest as deadlocks, thread pool starvation, and poor performance.

## How Async/Await Works

When execution hits an await on an incomplete Task, the method returns to the caller, and the continuation is scheduled to run when the Task completes. The continuation runs on the captured SynchronizationContext (in ASP.NET, this is the request context; in console apps, it's a thread pool thread). This context capture is the source of most async/await pitfalls.

## Common Pitfalls

Sync-over-async — calling .Result or .Wait() on an async method — deadlocks when there's a single-threaded SynchronizationContext. The calling thread is blocked waiting for the Task, but the Task's continuation needs that same thread to run. The fix: async all the way down, from controller to repository.

## Task Combinators

Task.WhenAll runs multiple independent async operations concurrently. Task.WhenAny returns when the first task completes — useful for timeouts and competitive requests. These combinators are essential for performance: three sequential await calls that each take 100ms total 300ms, while Task.WhenAll completes in 100ms. Structure your code to identify independent operations and execute them concurrently.
