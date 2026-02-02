---
slug: dotnet-dependency-injection-lifetime-pitfalls
title: ".NET Dependency Injection Lifetime Pitfalls"
excerpt: "Avoiding captive dependencies, scope validation, and service resolution issues in ASP.NET Core DI."
coverGradient: "linear-gradient(135deg, hsl(254, 70%, 24%) 0%, hsl(314, 64%, 32%) 100%)"
author: Frost
date: "2025-09-07"
tags: [".NET"]
published: true
---

ASP.NET Core's built-in dependency injection container is simple by design, but its lifetime management has subtle behaviors that lead to bugs in production. Understanding scoped, transient, and singleton lifetimes — and their interactions — prevents a class of issues that are difficult to debug.

## The Captive Dependency Problem

A captive dependency occurs when a longer-lived service captures a shorter-lived service. A singleton that injects a scoped service holds a reference to that scoped instance forever, even after the scope ends. The scoped service's resources (database connections, etc.) may become invalid, but the singleton keeps using them.

## Scope Validation

In development, ASP.NET Core validates scopes by default. Resolving a scoped service from the root provider throws an exception. This catches many captive dependency issues early. However, scope validation is disabled in production for performance, so issues that slip past development testing surface as intermittent production bugs.

## Transient Within Singleton

A transient service injected into a singleton behaves like a singleton because the singleton holds a reference to the specific instance it received. The transient service is created once when the singleton is created and never replaced. If the transient service holds mutable state or disposable resources, this mismatch between expected and actual lifetime causes problems.
