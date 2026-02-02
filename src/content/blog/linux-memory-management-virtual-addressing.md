---
slug: linux-memory-management-virtual-addressing
title: "Linux Memory Management and Virtual Addressing"
excerpt: "How Linux uses page tables, TLBs, and demand paging to give each process an isolated 48-bit address space."
coverGradient: "linear-gradient(135deg, hsl(48, 50%, 18%) 0%, hsl(108, 40%, 20%) 100%)"
author: Frost
date: "2025-06-20"
tags: ["Linux", "System"]
published: true
---

Every process in Linux operates in its own virtual address space, blissfully unaware that physical memory is shared with hundreds of other processes. The kernel, the MMU hardware, and the page table structure work together to maintain this illusion efficiently.

## Virtual to Physical Translation

The CPU's Memory Management Unit (MMU) translates virtual addresses to physical addresses using page tables. Linux uses a multi-level page table structure (up to 5 levels on x86-64) to avoid allocating memory for unmapped regions. Each page table entry maps a 4KB virtual page to a 4KB physical frame and includes permission bits (read, write, execute).

## The TLB

Address translation happens on every memory access, so it must be fast. The Translation Lookaside Buffer (TLB) caches recent page table lookups. A TLB hit resolves a virtual address in one or two cycles. A TLB miss requires walking the page table structure in memory — much slower. Context switches flush the TLB (or use Address Space Identifiers to avoid full flushes), which is one reason context switches are expensive.

## Demand Paging

Linux doesn't allocate physical memory when a process maps virtual addresses. Instead, it records the mapping and allocates a physical page only when the process first accesses that virtual address. The initial access triggers a page fault, the kernel allocates a physical frame, updates the page table, and the instruction retries. This lazy allocation means processes can map far more memory than physically available, and only the pages actually touched consume resources.
