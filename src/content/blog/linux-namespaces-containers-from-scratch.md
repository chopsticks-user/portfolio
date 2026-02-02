---
slug: linux-namespaces-containers-from-scratch
title: "Linux Namespaces: Containers from Scratch"
excerpt: "Understanding how Linux namespaces provide the isolation primitives that make containers possible."
coverGradient: "linear-gradient(135deg, hsl(207, 70%, 24%) 0%, hsl(267, 40%, 20%) 100%)"
author: Frost
date: "2025-12-12"
tags: ["Linux", "System"]
published: true
---

Containers feel like lightweight virtual machines, but the underlying mechanism is fundamentally different. Instead of virtualizing hardware, containers use Linux kernel namespaces to isolate what a process can see and access. Understanding namespaces demystifies Docker, Podman, and every other container runtime.

## The Namespace Types

Linux provides several namespace types, each isolating a different system resource. PID namespaces give a process its own view of the process table — PID 1 inside a container isn't the system's init. Mount namespaces provide isolated filesystem trees. Network namespaces create independent network stacks with their own interfaces, routing tables, and iptables rules. User namespaces map UIDs inside the namespace to different UIDs outside, enabling rootless containers.

## Building a Container Step by Step

You can create a minimal container with just the `clone` system call and the right namespace flags. Create a new PID and mount namespace, pivot_root into a prepared filesystem, mount /proc, and you have a process that thinks it's running on its own machine. Add a network namespace with a veth pair and you have network isolation. This is essentially what container runtimes do, with additional features like cgroups for resource limits and seccomp for syscall filtering.
