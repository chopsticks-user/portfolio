---
slug: linux-networking-stack-packet-journey
title: "Linux Networking Stack: A Packet's Journey"
excerpt: "Tracing a network packet from NIC hardware interrupt through the kernel networking stack to the application socket."
coverGradient: "linear-gradient(135deg, hsl(295, 70%, 18%) 0%, hsl(355, 48%, 24%) 100%)"
author: Frost
date: "2025-12-01"
tags: ["Linux", "System"]
published: true
---

Understanding how a packet travels through the Linux networking stack helps explain network performance characteristics and informs tuning decisions. The journey involves hardware interrupts, soft IRQs, protocol processing, and socket buffers — each step adding latency and consuming CPU.

## NIC to Kernel

When a packet arrives at the NIC, the hardware writes it to a ring buffer in DMA-accessible memory and triggers a hardware interrupt. The interrupt handler schedules a soft IRQ for packet processing (NAPI). The soft IRQ handler polls the ring buffer, moving packets from DMA memory into socket buffers (sk_buffs) — the kernel's standard packet representation.

## Protocol Processing

The packet passes through the network protocol stack: the link layer checks the MAC address, the IP layer validates the header and makes routing decisions, and the transport layer (TCP or UDP) delivers the payload to the appropriate socket. Each layer strips its header and passes the remainder up. TCP adds connection state management, flow control, and congestion control.

## Socket to Application

The processed data lands in the socket's receive queue. When the application calls recv() or read(), it copies data from the kernel receive buffer to userspace. If no data is available, the call blocks (or returns EAGAIN for non-blocking sockets). For high-performance applications, io_uring and zero-copy mechanisms reduce the copying overhead.
