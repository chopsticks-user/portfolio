---
slug: dotnet-hot-reload-architecture
title: ".NET Hot Reload Architecture"
excerpt: "Understanding how .NET hot reload modifies running applications by patching IL metadata and method bodies at runtime."
coverGradient: "linear-gradient(135deg, hsl(69, 50%, 15%) 0%, hsl(129, 40%, 20%) 100%)"
author: Frost
date: "2025-08-10"
tags: [".NET"]
published: true
---

Hot reload in .NET allows modifying code while the application is running, without restarting. Understanding its architecture — metadata delta application, method body replacement, and the constraints that define what can and can't be changed — helps set realistic expectations for when it will work and when a restart is needed.

## How Hot Reload Works

When you save a file, the Roslyn compiler computes the difference (delta) between the old and new compilation. This delta consists of metadata changes (new types, modified type members) and IL changes (updated method bodies). The runtime's EnC (Edit and Continue) engine applies these deltas to the running application, replacing method bodies and updating type metadata in place.

## What Can Be Changed

Hot reload supports most common edits: changing method bodies, adding new methods, modifying lambda expressions, adding static fields and properties. These changes are applied without losing application state. The running objects maintain their field values, and the next time a modified method is called, it executes the new code.

## Limitations

Hot reload cannot change the shape of existing objects — adding instance fields to an existing class requires a restart because existing instances don't have storage for the new fields. Similarly, changing base classes, modifying generic type parameters, or altering assembly-level attributes are unsupported. When an unsupported edit is detected, the tooling warns you and a restart is needed.
