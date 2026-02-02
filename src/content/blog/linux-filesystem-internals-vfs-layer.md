---
slug: linux-filesystem-internals-vfs-layer
title: "Linux Filesystem Internals: The VFS Layer"
excerpt: "How the Virtual File System abstraction enables Linux to support dozens of filesystem types through a single interface."
coverGradient: "linear-gradient(135deg, hsl(201, 50%, 15%) 0%, hsl(261, 56%, 28%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-07-25"
tags: ["Linux"]
published: true
---

The Virtual File System (VFS) is one of Linux's most elegant abstractions. It provides a uniform interface for file operations regardless of the underlying filesystem type. Whether the data lives on ext4, XFS, NFS, or procfs, userspace code uses the same open/read/write/close syscalls.

## The VFS Object Model

VFS defines four primary objects: the superblock (filesystem metadata), the inode (file metadata), the dentry (directory entry, mapping names to inodes), and the file (an open file instance). Each filesystem type provides its own implementations of these objects' operations. When you call read() on a file, VFS dispatches to the specific filesystem's read implementation through function pointers.

## Dentry Cache

The dentry cache (dcache) is critical for performance. Pathname resolution — converting "/home/user/file.txt" into an inode — requires looking up each component in the path. The dcache stores recent lookups, so subsequent accesses to the same path avoid hitting the filesystem. The dcache is a hash table keyed by (parent dentry, name) pairs and is one of the most heavily accessed data structures in the kernel.

## Page Cache Integration

VFS integrates with the page cache to buffer file data in memory. When you read a file, the data is loaded into the page cache and subsequent reads are served from memory. Writes go to the page cache and are flushed to disk asynchronously (or synchronously with fsync). This caching layer is transparent to both userspace and the filesystem implementation.
