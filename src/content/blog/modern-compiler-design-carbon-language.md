---
slug: modern-compiler-design-carbon-language
title: "Modern Compiler Design: A Carbon Language Case Study"
excerpt: "How Carbon's compiler pipeline uses data-oriented design, SemIR, and Salsa-style incremental computation for fast compilation and rich tooling."
coverGradient: "linear-gradient(135deg, #0a1a14 0%, #0f1a2a 50%, #0a1a14 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2026-02-02"
tags: ["Compilers"]
published: true
---

Most compiler architectures in use today trace their lineage back to designs from the 1970s: pointer-heavy ASTs, recursive visitor passes, and batch-mode compilation where changing one line recompiles an entire translation unit. Carbon — Google's experimental successor to C++ — takes a different approach. Its toolchain is built around data-oriented design, dense array storage, a semantic IR that replaces the traditional AST for analysis, and an architecture designed from day one for incremental computation. Even if Carbon never achieves widespread adoption, its compiler design is worth studying.

## Pipeline Overview

Carbon's compilation pipeline is a four-stage process:

```
Source → Lex → Parse → Check → Lower → LLVM IR
```

**Lex** tokenizes source text into a flat token stream. Tokens are stored in contiguous arrays with indices rather than heap-allocated token objects.

**Parse** constructs a parse tree (concrete syntax tree) from the token stream. This tree preserves every syntactic detail — whitespace grouping, parenthesization, operator precedence — and is used for formatting, tooling, and diagnostics. Unlike a traditional AST, it is not the primary data structure for semantic analysis.

**Check** performs name resolution, type checking, and generic resolution, producing SemIR (Semantic IR). This is the core of the compiler — the stage where Carbon's design diverges most from conventional compilers.

**Lower** translates SemIR into LLVM IR for optimization and machine code generation.

## Data-Oriented Design

Traditional compilers represent their IR as a tree (or graph) of heap-allocated nodes connected by pointers. Traversal chases pointers across fragmented memory. Carbon inverts this: data is stored in flat, densely packed arrays, and references between elements are integer indices into those arrays.

The pattern is similar to what game engines call an Entity Component System or what database engines call columnar storage. The key properties:

- **Cache locality.** Sequential iteration over an array of instruction records hits contiguous memory. Pointer-chasing ASTs have unpredictable access patterns.
- **Compact references.** A 32-bit index is half the size of a 64-bit pointer. In a compiler that may have millions of nodes, this halves the memory footprint of cross-references.
- **Trivial serialization.** An array of records can be memcpy'd or memory-mapped. Pointer-based trees require custom serialization.
- **Parallelism.** Multiple threads can process disjoint index ranges without synchronization, and the lack of pointer aliasing simplifies reasoning about data dependencies.

In Carbon's codebase, you'll see types like `InstId`, `TypeId`, and `NameId` — all thin wrappers around integer indices into their respective storage arrays. A function that operates on an instruction takes an `InstId` and indexes into the instruction array, rather than receiving a pointer to a heap object.

## Parse Tree vs AST

Carbon explicitly separates the concrete parse tree from the semantic representation. The parse tree is a flattened representation of the source syntax, useful for:

- Round-trip formatting (the tree can reproduce the original source layout)
- IDE features like syntax highlighting and structural navigation
- Precise diagnostic locations

The parse tree is not traversed recursively by the type checker. Instead, the Check phase reads the parse tree and produces SemIR, a flat, typed IR that discards syntactic sugar and resolves all names and types.

## SemIR Deep Dive

SemIR is Carbon's primary intermediate representation for semantic analysis. Each SemIR instruction is a tagged union stored in a flat array. An instruction might represent a function call, a variable binding, an integer literal, or a type conversion. The key design decisions:

- **Instructions reference other instructions by `InstId`.** No pointers, no tree structure. An `Add` instruction stores two `InstId` operands that index into the same instruction array.
- **Types are interned.** Each unique type gets a `TypeId`. Two occurrences of `i32` share the same `TypeId`, enabling O(1) type equality checks.
- **Blocks are ranges.** A basic block is a contiguous range of `InstId` values, stored as a start index and length. No linked list of instructions.
- **Names are interned strings.** `NameId` indexes into a string table. Name resolution produces `NameId` values that can be compared by integer equality.

This structure means the entire semantic state of a compilation unit is a handful of flat arrays: instructions, types, names, constants. Random access is O(1). Iteration is sequential memory access.

## Name Lookup and Generics

Carbon's name lookup is scope-based, with scopes represented as arrays of name-to-declaration mappings. Generic resolution is integrated into the Check phase rather than being a separate pass. When the checker encounters a generic function call, it instantiates the generic inline, producing new SemIR instructions that reference the concrete types.

This is architecturally different from C++ template instantiation, which creates entirely new AST subtrees. Carbon's approach produces SemIR that shares instruction storage with the rest of the compilation unit.

## Incremental Computation

The design of SemIR as flat, ID-indexed arrays is a precondition for incremental computation. The concept follows the Salsa pattern, pioneered by the Rust ecosystem (particularly `rust-analyzer`):

1. Compilation is modeled as a set of queries: "What is the type of this expression?" "What are the members of this struct?"
2. Each query has well-defined inputs and outputs, both expressed as IDs.
3. Query results are memoized. Re-running a query with the same inputs returns the cached result.
4. When a source file changes, the system invalidates only the queries whose inputs changed, recomputing the minimal set of dependent results.

In a pointer-based AST, determining "what changed" is expensive because identity is tied to memory addresses that shift on every edit. With ID-indexed arrays, identity is stable — `InstId(42)` is always instruction 42, regardless of what other instructions were inserted or removed.

Carbon's toolchain is designed so that the same SemIR infrastructure powers both batch compilation and the language server. An IDE edit triggers incremental re-checking of the affected scope, not a full recompilation.

## Lowering to LLVM IR

The Lower phase translates SemIR instructions to LLVM IR. Because SemIR already has fully resolved types and flattened control flow, lowering is largely mechanical:

- Arithmetic instructions map to LLVM arithmetic instructions
- Function calls map to LLVM call instructions
- Type conversions map to LLVM casts
- Memory operations map to LLVM alloca/load/store

The lowering phase does not perform optimization — that is LLVM's job. Carbon's compiler focuses on producing correct, well-typed LLVM IR as quickly as possible.

## Comparison with Other Compilers

| Aspect | Carbon | Rust (`rustc`) | Swift | Go |
| ------ | ------ | --------------- | ----- | --- |
| Primary IR | SemIR (flat arrays) | HIR → MIR (pointer-based) | AST → SIL | AST → SSA |
| Incremental model | Salsa-style queries (planned) | Query-based (via `rustc`'s query system) | Module-level | Package-level |
| Generics | Checked, inline in SemIR | Monomorphized from MIR | Witness tables (SIL) | Runtime dictionaries |
| Data layout | ID-indexed arrays | Arenas + pointers | Arenas + pointers | Arenas + pointers |
| Backend | LLVM | LLVM | LLVM + custom | Custom SSA → machine code |

The most distinctive aspect of Carbon's design is the commitment to flat, ID-indexed storage throughout the pipeline. Rust's `rustc` uses arenas (which improve allocation performance but still involve pointers), and `rust-analyzer` uses Salsa for incrementality. Carbon aims to combine both approaches in a single toolchain.

## What This Means for Tooling

The architectural choices in Carbon's compiler are driven by a specific goal: the same compiler infrastructure should power batch builds, IDE language servers, formatters, linters, and code generators. Flat storage and incremental computation make this feasible — an IDE can re-check a single function after an edit without rebuilding the entire file, and the parse tree can round-trip source formatting without information loss.

This is the direction compiler design is moving. Rust's `rust-analyzer` demonstrated that IDE-quality tooling requires fundamentally different data structures than batch compilers. Carbon's bet is that you should build the batch compiler with those data structures from the start, rather than maintaining two separate implementations.
