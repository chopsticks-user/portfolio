---
slug: compiler-garbage-collection-algorithms
title: "Compiler and Runtime Garbage Collection Algorithms"
excerpt: "Comparing mark-sweep, copying, generational, and concurrent garbage collection strategies in managed runtimes."
coverGradient: "linear-gradient(135deg, hsl(302, 60%, 27%) 0%, hsl(2, 48%, 24%) 100%)"
author: Frost
date: "2025-11-14"
tags: ["Compilers", "System"]
published: true
---

Garbage collection reclaims memory that the program has allocated but no longer references. The choice of GC algorithm affects application latency, throughput, and memory footprint. Modern runtimes use sophisticated combinations of algorithms to balance these concerns.

## Mark and Sweep

The fundamental algorithm: starting from root references (stack variables, global state), mark every reachable object. Then sweep through the heap and reclaim unmarked objects. Mark-sweep is simple and doesn't move objects, but it causes fragmentation and requires pausing all application threads during collection.

## Copying Collection

Instead of sweeping, copy all live objects from one memory region to another. The old region is then entirely free. This eliminates fragmentation (objects are compacted during copying) and the cost is proportional to live data, not total heap size. The downside is that half the heap is always empty, waiting to be the copy destination.

## Generational Hypothesis

Most objects die young. Generational collectors exploit this by dividing the heap into generations. New objects go in the young generation, which is collected frequently with a cheap copying collector. Objects that survive multiple collections are promoted to the old generation, which is collected less frequently with a more expensive algorithm. This concentrates collection effort where the most garbage is found.
