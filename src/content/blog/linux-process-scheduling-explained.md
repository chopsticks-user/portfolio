---
slug: linux-process-scheduling-explained
title: "Linux Process Scheduling Explained"
excerpt: "Understanding the Completely Fair Scheduler, nice values, and real-time scheduling policies in the Linux kernel."
coverGradient: "linear-gradient(135deg, hsl(20, 60%, 27%) 0%, hsl(80, 40%, 20%) 100%)"
author: Frost
date: "2026-01-03"
tags: ["Linux", "System"]
published: true
---

The Linux kernel's process scheduler determines which thread runs on which CPU core and for how long. For most workloads, the default Completely Fair Scheduler (CFS) makes intelligent decisions without any tuning. But understanding how it works helps explain behavior that otherwise seems random.

## CFS and Virtual Runtime

CFS maintains a red-black tree of runnable tasks, sorted by virtual runtime — a measure of how much CPU time a task has consumed relative to its weight. Tasks with lower virtual runtime get scheduled first. This creates an approximation of ideal fair scheduling where every task gets an equal share of the CPU.

## Nice Values and Weights

The nice value (-20 to 19) adjusts a task's weight in the CFS algorithm. Lower nice values (higher priority) give a task a larger weight, meaning it accumulates virtual runtime more slowly and gets scheduled more frequently. The relationship isn't linear — each nice level represents roughly a 10% change in CPU share, compounding across the range.
