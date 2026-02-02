---
slug: compiler-instruction-selection-patterns
title: "Compiler Instruction Selection Patterns"
excerpt: "How compilers translate IR operations into target machine instructions using tree pattern matching and tiling."
coverGradient: "linear-gradient(135deg, hsl(222, 50%, 27%) 0%, hsl(282, 56%, 28%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2026-01-05"
tags: ["Compilers"]
published: true
---

Instruction selection is the compiler phase that maps abstract operations in the IR to concrete machine instructions. The challenge is that a single IR operation might correspond to multiple machine instructions, and conversely, a single machine instruction might implement multiple IR operations.

## Tree Pattern Matching

Modern instruction selectors view the IR as a forest of expression trees and match subtrees against patterns that correspond to machine instructions. Each pattern has a cost (typically execution cycles), and the selector finds the minimum-cost covering of the tree. This is the tiling problem: cover every node with instruction tiles, minimizing total cost.

## CISC vs RISC Complexity

On CISC architectures (x86), instruction selection is more complex because the ISA has instructions that combine multiple operations. A single LEA instruction can perform addition, shift, and indexing simultaneously. The instruction selector must recognize these patterns in the IR to emit efficient code. On RISC architectures, the mapping is more straightforward because instructions are simpler and more orthogonal.

## Addressing Mode Selection

A significant part of instruction selection on x86 is choosing addressing modes. Loading a value from an array involves a base address, an index, a scale factor, and possibly an offset. The instruction selector must recognize these patterns in the IR's address computation and combine them into a single addressing mode operand, rather than computing the address with separate arithmetic instructions.
