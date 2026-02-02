---
slug: compiler-intermediate-representations-compared
title: "Compiler Intermediate Representations Compared"
excerpt: "Comparing SSA, CPS, A-Normal Form, and sea-of-nodes as intermediate representations in modern compilers."
coverGradient: "linear-gradient(135deg, hsl(194, 60%, 21%) 0%, hsl(254, 56%, 28%) 100%)"
author: Frost
date: "2025-09-14"
tags: ["Compilers"]
published: true
---

The choice of intermediate representation (IR) shapes every optimization pass in a compiler. Each IR makes certain transformations easy and others awkward. Understanding the trade-offs helps explain why different compilers make different choices.

## Static Single Assignment (SSA)

SSA requires that every variable is assigned exactly once. When a variable would be reassigned, a new version is created. At control flow merge points, phi functions select the correct version. SSA makes def-use chains explicit, which simplifies constant propagation, dead code elimination, and many other optimizations. LLVM's IR is SSA-based, and it's the most widely used form in production compilers.

## Continuation-Passing Style (CPS)

CPS transforms every function call into a tail call by making continuations explicit. Instead of a function returning a value, it calls a continuation with the result. This makes control flow explicit in the IR, which simplifies certain transformations like closure conversion and exception handling. CPS is common in functional language compilers.

## Sea of Nodes

The sea-of-nodes IR, used by the JVM's C2 compiler and V8's TurboFan, represents a program as a graph where nodes are operations and edges are data dependencies. There's no explicit ordering of operations beyond what data dependencies require. This gives the compiler maximum freedom to reorder and optimize, at the cost of a more complex representation.
