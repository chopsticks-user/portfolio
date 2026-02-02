---
slug: linux-signals-process-communication
title: "Linux Signals and Process Communication"
excerpt: "How signals work as an inter-process communication mechanism, from delivery semantics to signal-safe function constraints."
coverGradient: "linear-gradient(135deg, hsl(182, 50%, 18%) 0%, hsl(242, 64%, 32%) 100%)"
author: Frost
date: "2025-09-15"
tags: ["Linux", "System"]
published: true
---

Signals are software interrupts delivered to processes. They handle events ranging from terminal input (SIGINT from Ctrl+C) to hardware faults (SIGSEGV for memory violations) to user-defined communication (SIGUSR1, SIGUSR2). Understanding signal delivery semantics is essential for writing robust daemon processes.

## Signal Delivery

When a signal is sent (via kill(), raise(), or the kernel), it's marked as pending for the target process. If the signal isn't blocked, the kernel interrupts the process and executes the signal handler. If the signal is blocked, it remains pending until unblocked. Standard signals aren't queued — if the same signal is sent twice before being delivered, it's delivered once. Real-time signals (SIGRTMIN to SIGRTMAX) are queued.

## Signal Handlers and Safety

Signal handlers execute in the context of the interrupted code. This means the handler might interrupt malloc, printf, or any other function mid-execution. Calling those functions from the handler can cause deadlocks or corruption. Only async-signal-safe functions (write, \_exit, signal, etc.) are safe to call from handlers. The practical approach: set a flag in the handler and check it in the main loop.

## Signals in Multi-Threaded Programs

In multi-threaded programs, the signal is delivered to one arbitrary thread that hasn't blocked it. This non-determinism is often problematic. The common pattern is to block signals in all threads except a dedicated signal-handling thread that waits with sigwait(). This centralizes signal handling and avoids the complexities of handlers executing in arbitrary thread contexts.
