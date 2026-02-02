---
slug: linux-cgroups-resource-management
title: "Linux Cgroups Resource Management"
excerpt: "Controlling CPU, memory, and I/O allocation with cgroups v2 for containerized and bare-metal workloads."
coverGradient: "linear-gradient(135deg, hsl(34, 70%, 15%) 0%, hsl(94, 40%, 20%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-09-27"
tags: ["Linux"]
published: true
---

Control groups (cgroups) are the Linux kernel mechanism for limiting, accounting, and isolating resource usage of process groups. Cgroups v2 unifies the hierarchy and provides a cleaner interface than v1, making resource management more predictable and composable.

## The Unified Hierarchy

Cgroups v2 uses a single hierarchy at /sys/fs/cgroup. Each directory in the hierarchy is a cgroup, and processes belong to exactly one cgroup. Resource controllers (cpu, memory, io, pids) are enabled per-cgroup by writing to the cgroup.subtree_control file. This unified model eliminates the confusion of v1 where different controllers could have different hierarchies.

## Memory Controls

The memory controller provides hard and soft limits. memory.max sets an absolute ceiling — processes that exceed it are OOM-killed. memory.high is a soft limit that triggers aggressive reclaim, slowing the process without killing it. memory.low provides guaranteed memory: the kernel won't reclaim below this threshold unless the entire system is under pressure.

## CPU Controls

The cpu controller offers two mechanisms: cpu.weight for proportional sharing and cpu.max for hard bandwidth limits. Weight-based sharing divides available CPU proportionally when there's contention but allows a cgroup to use idle CPU freely. Hard limits via cpu.max enforce an absolute ceiling expressed as a quota within a period — useful for preventing a single workload from monopolizing cores.
