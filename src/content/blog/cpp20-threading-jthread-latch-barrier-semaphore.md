---
slug: cpp20-threading-jthread-latch-barrier-semaphore
title: "C++20 Threading Primitives: jthread, Latch, Barrier, and Semaphore"
excerpt: "Modern C++20 threading with cooperative cancellation, one-shot latches, phased barriers, and semaphore-based resource limiting."
coverGradient: "linear-gradient(135deg, #0a1628 0%, #0f2b3d 50%, #0a1628 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2026-01-30"
tags: ["C++", "Performance"]
published: true
---

C++11 gave us `std::thread`, `std::mutex`, and `std::condition_variable`. They work, but they leave gaps: threads that leak if you forget to join, no built-in cancellation, and no high-level synchronization primitives beyond mutexes. C++20 fills every one of these gaps with `std::jthread`, cooperative cancellation via stop tokens, `std::latch`, `std::barrier`, and `std::counting_semaphore`.

## `std::jthread` — RAII Threads

`std::thread` calls `std::terminate` if destroyed while joinable. This means every code path — including exception paths — must call `join()` or `detach()`. `std::jthread` fixes this by automatically requesting a stop and joining in its destructor:

```cpp
#include <thread>

void process_data() {
    std::jthread worker([] {
        heavy_computation();
    });

    if (should_abort()) return;
}
```

When `process_data` returns — whether normally or via exception — the `jthread` destructor requests a stop, waits for the thread to finish, and cleans up. No manual `join()` needed.

| Feature | `std::thread` | `std::jthread` |
| ------- | ------------- | -------------- |
| Auto-join on destruction | No (`std::terminate`) | Yes |
| Cooperative cancellation | No | Built-in stop tokens |
| Move semantics | Yes | Yes |
| Detach support | Yes | Yes |

## Cooperative Cancellation

`std::jthread` introduces a cancellation protocol built on three types:

- **`std::stop_source`** — Issues stop requests
- **`std::stop_token`** — Checks whether a stop has been requested
- **`std::stop_callback`** — Invokes a callable when a stop is requested

If a thread function's first parameter is `std::stop_token`, `jthread` automatically passes one connected to its internal stop source:

```cpp
void worker(std::stop_token token) {
    while (!token.stop_requested()) {
        auto batch = fetch_next_batch();
        process(batch);
    }
}

std::jthread t(worker);
std::this_thread::sleep_for(std::chrono::seconds(5));
t.request_stop();
```

The `request_stop()` call is thread-safe, atomic, and irreversible. The worker checks `stop_requested()` at each iteration and exits gracefully.

### Stop Callbacks

`std::stop_callback` registers a function that runs synchronously when a stop is requested — useful for waking blocked operations:

```cpp
void interruptible_wait(std::stop_token token) {
    std::mutex mtx;
    std::condition_variable_any cv;
    std::unique_lock lock(mtx);

    std::stop_callback on_stop(token, [&cv] { cv.notify_all(); });
    cv.wait(lock, [&token] { return token.stop_requested(); });
}
```

The callback executes in the thread that calls `request_stop()`. If a stop was already requested before the callback is registered, it executes immediately in the registering thread. Exceptions from callbacks call `std::terminate`.

## `std::latch` — One-Shot Countdown

A latch is a single-use countdown synchronization primitive. You initialize it with a count, threads decrement it, and any thread can block until the count reaches zero:

```cpp
#include <latch>
#include <thread>
#include <vector>

void parallel_init(std::vector<Subsystem>& systems) {
    std::latch ready(systems.size());

    std::vector<std::jthread> threads;
    for (auto& sys : systems) {
        threads.emplace_back([&sys, &ready] {
            sys.initialize();
            ready.count_down();
        });
    }

    ready.wait();
}
```

Key characteristics:

- `count_down(n)` decrements by `n` (default 1)
- `wait()` blocks until the count reaches zero
- `arrive_and_wait()` combines both operations
- `try_wait()` checks without blocking
- Single-use — once the count hits zero, the latch cannot be reset

Latches solve the "wait for N things to finish" pattern without the boilerplate of a mutex, a counter, and a condition variable.

## `std::barrier` — Reusable Phase Synchronization

A barrier is a latch that resets automatically after each phase. It synchronizes a fixed group of threads across multiple rounds, optionally running a completion function between phases:

```cpp
#include <barrier>

void phased_simulation(int num_threads, int num_steps) {
    auto on_phase_complete = []() noexcept {
        swap_buffers();
    };

    std::barrier sync(num_threads, on_phase_complete);

    auto simulate = [&](int thread_id) {
        for (int step = 0; step < num_steps; ++step) {
            compute_partial(thread_id);
            sync.arrive_and_wait();
        }
    };

    std::vector<std::jthread> threads;
    for (int i = 0; i < num_threads; ++i) {
        threads.emplace_back(simulate, i);
    }
}
```

Each phase:

1. Threads call `arrive()` or `arrive_and_wait()`, decrementing the expected count
2. When the count reaches zero, the completion function runs
3. All waiting threads unblock
4. The count resets for the next phase

The `arrive_and_drop()` method lets a thread leave the group permanently, reducing the expected count for all future phases.

| Method | Behavior |
| ------ | -------- |
| `arrive()` | Decrement count, return arrival token |
| `wait(token)` | Block until phase completes |
| `arrive_and_wait()` | Combine arrive + wait |
| `arrive_and_drop()` | Arrive and leave the group |

## `std::counting_semaphore` and `std::binary_semaphore`

Semaphores control concurrent access to a shared resource by maintaining an internal counter. `acquire()` decrements the counter (blocking if zero), and `release()` increments it:

```cpp
#include <semaphore>

std::counting_semaphore<4> pool(4);

void limited_access() {
    pool.acquire();
    use_resource();
    pool.release();
}
```

This limits concurrent access to 4 threads. `std::binary_semaphore` is an alias for `std::counting_semaphore<1>`, useful for signaling between threads:

```cpp
std::binary_semaphore signal(0);

std::jthread producer([&] {
    auto data = generate();
    buffer = data;
    signal.release();
});

signal.acquire();
consume(buffer);
```

Unlike mutexes, semaphores have no ownership — any thread can release. This makes them suitable for producer-consumer signaling where the thread that acquires is different from the thread that releases.

| Type | Max Count | Use Case |
| ---- | --------- | -------- |
| `counting_semaphore<N>` | N | Resource pool, connection limiting |
| `binary_semaphore` | 1 | Thread signaling, event notification |

## Parallel Pipeline Example

Combining these primitives into a practical pattern — a producer-consumer pipeline with bounded buffering and graceful shutdown:

```cpp
template <typename T, int Capacity>
struct BoundedChannel {
    std::array<T, Capacity> buffer_{};
    int head_ = 0, tail_ = 0;
    std::mutex mtx_;
    std::counting_semaphore<Capacity> empty_{Capacity};
    std::counting_semaphore<Capacity> full_{0};

    void send(T item) {
        empty_.acquire();
        {
            std::lock_guard lock(mtx_);
            buffer_[tail_ % Capacity] = std::move(item);
            ++tail_;
        }
        full_.release();
    }

    T recv() {
        full_.acquire();
        T item;
        {
            std::lock_guard lock(mtx_);
            item = std::move(buffer_[head_ % Capacity]);
            ++head_;
        }
        empty_.release();
        return item;
    }
};
```

The empty semaphore blocks producers when the buffer is full; the full semaphore blocks consumers when the buffer is empty. No condition variables, no spurious wakeups.

## Choosing the Right Primitive

| Need | Primitive |
| ---- | --------- |
| Thread that cleans up automatically | `jthread` |
| Graceful shutdown signaling | `stop_token` / `stop_source` |
| Wait for N tasks to complete once | `latch` |
| Synchronize threads across repeated phases | `barrier` |
| Limit concurrent access to a resource | `counting_semaphore` |
| Signal between two threads | `binary_semaphore` |
| Mutual exclusion with ownership | `mutex` (still the right tool) |

These primitives are available in all three major compilers (GCC 11+, Clang 14+, MSVC 19.28+) under `-std=c++20`. They replace a substantial amount of hand-rolled synchronization code with tested, standardized building blocks.
