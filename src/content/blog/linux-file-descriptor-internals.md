---
slug: linux-file-descriptor-internals
title: "Linux File Descriptor Internals"
excerpt: "Understanding the three-layer file descriptor architecture: fd table, file description table, and inode table."
coverGradient: "linear-gradient(135deg, hsl(275, 70%, 21%) 0%, hsl(335, 64%, 32%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2026-01-12"
tags: ["Linux"]
published: true
---

File descriptors are the fundamental abstraction for I/O in Linux. They represent open files, sockets, pipes, and devices through a simple integer handle. Understanding the kernel data structures behind file descriptors explains behaviors that otherwise seem inconsistent.

## The Three-Layer Architecture

When a process opens a file, the kernel creates entries in three structures. The per-process file descriptor table maps integers (0, 1, 2, ...) to entries in the system-wide open file description table. Each open file description contains the current offset, access mode, and a pointer to the inode. The inode represents the actual file — its size, permissions, data block locations, and metadata.

## Shared File Descriptions

Fork creates a child process that shares file descriptions with the parent. Both processes' fd 1 might point to the same open file description, meaning they share the file offset. A write from either process advances the shared offset. This is why output from parent and child processes doesn't overwrite each other when writing to the same inherited file descriptor.

## File Descriptor Limits

The per-process fd table has a soft limit (ulimit -n, typically 1024) and a hard limit. The system-wide limit (/proc/sys/fs/file-max) caps total open file descriptions. For servers handling thousands of connections (each needing a socket fd), raising these limits is essential. Running out of file descriptors produces "too many open files" errors that can cascade through the application.
