---
slug: compiler-type-inference-hindley-milner
title: "Compiler Type Inference: Hindley-Milner"
excerpt: "Understanding Algorithm W and how compilers infer types without explicit annotations in ML-family languages."
coverGradient: "linear-gradient(135deg, hsl(228, 70%, 21%) 0%, hsl(288, 40%, 20%) 100%)"
author: Frost
date: "2025-07-12"
tags: ["Compilers"]
published: true
---

Hindley-Milner type inference is the foundation for type systems in ML, Haskell, OCaml, and influences many modern languages. It determines the types of expressions without requiring the programmer to annotate them, while guaranteeing type safety — a remarkable combination.

## The Core Idea

Every expression generates type constraints. A function application f(x) constrains f to be a function type whose argument matches x's type. An if-expression constrains both branches to have the same type. The compiler collects these constraints and solves them simultaneously using unification.

## Algorithm W

Algorithm W processes expressions left to right, generating constraints and solving them incrementally. For each expression, it produces a substitution — a mapping from type variables to concrete types. These substitutions compose: the substitution from analyzing the condition of an if-expression is applied before analyzing the branches, so type information flows through the analysis.

## Let Polymorphism

The key feature that distinguishes Hindley-Milner from simpler type systems is let polymorphism. A function defined with let can be used at multiple types. The identity function let id = fn x -> x can be applied to both integers and strings. The type system generalizes id's type to 'a -> 'a (forall a, a -> a) at the let binding and instantiates it fresh at each use site.
