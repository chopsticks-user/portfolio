---
slug: compiler-optimization-constant-folding-propagation
title: "Compiler Optimization: Constant Folding and Propagation"
excerpt: "How compilers evaluate expressions at compile time and propagate known values through the program to eliminate runtime work."
coverGradient: "linear-gradient(135deg, hsl(27, 50%, 21%) 0%, hsl(87, 40%, 20%) 100%)"
author: Frost
date: "2025-11-16"
tags: ["Compilers"]
published: true
---

Constant folding and constant propagation are among the most fundamental compiler optimizations. They're simple in concept — evaluate what you can at compile time — but their interaction with other optimization passes makes them surprisingly powerful in practice.

## Constant Folding

Constant folding evaluates expressions whose operands are all known at compile time. The expression `3 * 4 + 2` becomes `14` in the compiled output. This extends beyond arithmetic: string concatenation of literals, boolean logic with known operands, and even some function calls with constant arguments can be folded.

## Constant Propagation

Constant propagation extends folding by tracking variable assignments. If a variable is assigned a constant value and never reassigned before its use, the compiler replaces the variable reference with the constant. This often enables further folding: if `x = 5` and later `y = x * 3`, propagation replaces `x` with `5`, and folding reduces `5 * 3` to `15`.

## The Cascade Effect

These optimizations rarely work in isolation. Constant propagation enables constant folding, which may simplify a conditional branch, which enables dead code elimination, which exposes new propagation opportunities. Modern compilers run these passes iteratively until no further improvements are found. This cascading effect means that small, local optimizations accumulate into significant performance gains.
