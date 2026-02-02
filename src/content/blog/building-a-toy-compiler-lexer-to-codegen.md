---
slug: building-a-toy-compiler-lexer-to-codegen
title: "Building a Toy Compiler: Lexer to Codegen"
excerpt: "A walkthrough of implementing a complete compiler pipeline for a small expression language, from tokenization to x86 output."
coverGradient: "linear-gradient(135deg, hsl(80, 70%, 15%) 0%, hsl(140, 48%, 24%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-12-30"
tags: ["Compilers"]
published: true
---

Writing a compiler from scratch is one of the most effective ways to understand how programming languages work. Even a toy compiler — one that handles arithmetic expressions and variables — exercises every stage of the pipeline: lexing, parsing, semantic analysis, and code generation.

## The Lexer

The lexer converts a stream of characters into a stream of tokens. Each token has a type (number, identifier, operator, keyword) and a value. The implementation is typically a state machine that consumes characters one at a time, accumulating them into tokens based on pattern rules.

## Parsing into an AST

The parser consumes tokens and produces an Abstract Syntax Tree. For expressions, a recursive descent parser handles operator precedence naturally by structuring grammar rules hierarchically. Addition and subtraction bind less tightly than multiplication and division, which is expressed as separate grammar productions that call into each other.

## Code Generation

The final stage walks the AST and emits target code. For x86, this means mapping operations to instructions: loads become `mov`, arithmetic becomes `add`/`sub`/`imul`, and the result ends up in `rax`. Register allocation in a toy compiler can use a simple stack-based approach, pushing results and popping operands as needed.
