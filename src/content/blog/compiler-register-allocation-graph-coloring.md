---
slug: compiler-register-allocation-graph-coloring
title: "Compiler Register Allocation via Graph Coloring"
excerpt: "How compilers map an unbounded number of variables to a finite set of CPU registers using graph coloring algorithms."
coverGradient: "linear-gradient(135deg, hsl(274, 70%, 21%) 0%, hsl(334, 48%, 24%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-10-15"
tags: ["Compilers"]
published: true
---

Register allocation is one of the most consequential compiler optimizations. The difference between a value living in a register versus being spilled to memory can be an order of magnitude in access time. Graph coloring provides an elegant framework for solving this problem.

## The Interference Graph

The compiler builds a graph where each node is a virtual register (a variable or temporary value in the intermediate representation) and edges connect variables whose live ranges overlap — they're both needed at the same time and therefore can't share a physical register. The goal is to color this graph with K colors (where K is the number of available physical registers) such that no two adjacent nodes share a color.

## Chaitin's Algorithm

Chaitin's algorithm approaches graph coloring through simplification. Repeatedly remove nodes with fewer than K edges (they can always be colored). When no more nodes can be removed, pick a node to spill (store in memory instead of a register), remove it, and continue. After the graph is reduced, assign colors in reverse order. Each removed node gets the lowest available color not used by its neighbors.

## Spilling Decisions

When spilling is necessary, the compiler must choose which variable to spill. Heuristics consider how frequently the variable is used, whether it's inside a loop, and the cost of the load/store instructions that spilling introduces. A poor spilling decision in a hot loop can dominate execution time, so compilers invest significant effort in this analysis.
