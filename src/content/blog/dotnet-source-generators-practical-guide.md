---
slug: dotnet-source-generators-practical-guide
title: ".NET Source Generators Practical Guide"
excerpt: "Building custom Roslyn source generators to eliminate boilerplate and enforce patterns at compile time."
coverGradient: "linear-gradient(135deg, hsl(214, 60%, 18%) 0%, hsl(274, 40%, 20%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-10-22"
tags: [".NET"]
published: true
---

Source generators are a C# compiler feature that runs your code during compilation to produce additional source files. They eliminate boilerplate that developers would otherwise write by hand — serialization code, mapper implementations, validation logic, and more — while providing compile-time safety.

## How Source Generators Work

A source generator is a .NET Standard 2.0 assembly that implements the IIncrementalGenerator interface. During compilation, Roslyn invokes the generator, passing a representation of the compilation (syntax trees, semantic model). The generator analyzes this input and produces new source files that become part of the compilation. The generated code is visible, debuggable, and type-checked.

## Common Use Cases

The most impactful generators target repetitive patterns. JSON serialization (System.Text.Json), logging (Microsoft.Extensions.Logging), and dependency injection registration all benefit from compile-time generation. Instead of reflection-based discovery at runtime, the generator emits explicit code that's faster, AOT-friendly, and catchable by static analysis.

## Building Your Own

Start with the IIncrementalGenerator interface and a syntax provider that identifies the code you want to enhance. Use attribute markers to opt classes into generation. Emit well-formatted source using raw string literals or a StringBuilder. Test by creating a compilation in memory and verifying the generated output. The incremental pipeline ensures the generator only re-runs when its inputs change, keeping build times fast.
