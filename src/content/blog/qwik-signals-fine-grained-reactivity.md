---
slug: qwik-signals-fine-grained-reactivity
title: "Qwik Signals and Fine-Grained Reactivity"
excerpt: "Understanding how Qwik's signal system tracks dependencies and updates the DOM with surgical precision."
coverGradient: "linear-gradient(135deg, hsl(334, 50%, 24%) 0%, hsl(34, 56%, 28%) 100%)"
author: Frost
date: "2025-10-08"
tags: ["Qwik", "Performance"]
published: true
---

Qwik's reactivity model is built on signals — observable values that automatically track which parts of the UI depend on them. When a signal's value changes, only the specific DOM nodes or computations that reference it are updated. No virtual DOM diffing, no component re-rendering.

## How Signals Track Dependencies

When a component renders and accesses signal.value, Qwik records that the specific DOM text node or attribute is a subscriber of that signal. This subscription is serialized into the HTML, so it survives across server-to-client transitions. On the client, changing the signal's value triggers updates to exactly those subscribers — nothing more.

## Signals vs Virtual DOM Diffing

In a virtual DOM framework, changing one piece of state triggers a re-render of the component that owns it (and potentially child components). The framework then diffs the old and new virtual trees to find what changed in the DOM. With signals, there's no re-render and no diff — the framework knows exactly which DOM node needs updating because the dependency was recorded at render time.

## Derived Signals and Computed Values

Computed values (derived from other signals) create a dependency graph. When a source signal changes, computed signals that depend on it re-evaluate, and the DOM nodes subscribed to those computed signals update. This is lazy evaluation — computed signals don't recalculate until something reads their value. The combination of lazy evaluation and precise subscriptions keeps update costs proportional to what actually changed.
