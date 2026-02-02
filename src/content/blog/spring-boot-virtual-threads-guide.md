---
slug: spring-boot-virtual-threads-guide
title: "Spring Boot Virtual Threads Guide"
excerpt: "Adopting Project Loom virtual threads in Spring Boot applications for high-concurrency workloads."
coverGradient: "linear-gradient(135deg, hsl(240, 60%, 21%) 0%, hsl(300, 64%, 32%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-12-18"
tags: ["Spring"]
published: true
---

Java's virtual threads, introduced as a preview in JDK 19 and finalized in JDK 21, fundamentally change how Spring Boot handles concurrency. Instead of mapping each request to a platform thread (which maps to an OS thread), virtual threads are lightweight constructs managed by the JVM that can scale to millions of concurrent tasks.

## Enabling Virtual Threads in Spring Boot

Spring Boot 3.2+ supports virtual threads with a single configuration property. When enabled, the embedded Tomcat server creates a virtual thread for each incoming request instead of pulling from a thread pool. This means blocking I/O — database queries, HTTP calls, file reads — no longer ties up a limited pool of platform threads.

## When They Shine

Virtual threads excel in I/O-bound workloads. An API that calls three downstream services sequentially, each taking 100ms, blocks for 300ms per request. With platform threads and a pool of 200, you max out at roughly 666 requests per second. With virtual threads, the limit shifts to the downstream services' capacity, not your thread pool size.

## Watch for Pinning

Virtual threads can be "pinned" to carrier threads in certain situations — notably when holding a synchronized monitor during a blocking operation. This negates the scalability benefit. The fix is straightforward: replace synchronized blocks with ReentrantLock in code paths that block. The JVM flag `-Djdk.tracePinnedThreads=short` helps identify pinning at runtime.
