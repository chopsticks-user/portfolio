---
slug: cpp20-23-ranges-views-replacing-loops
title: "Removing Loops with C++20/23 Ranges and Views"
excerpt: "Lazy composable views and the pipe operator replace manual loops with declarative data pipelines covering filter, transform, zip, enumerate, chunk, and ranges::to."
coverGradient: "linear-gradient(135deg, #0c1222 0%, #1a1040 50%, #0c1222 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2026-01-29"
tags: ["C++"]
published: true
---

Most C++ code that processes collections is still written as index-based `for` loops or iterator pairs passed to `<algorithm>` functions. The ranges library introduced in C++20 and extended in C++23 replaces both patterns with composable, lazy data pipelines that read left-to-right and avoid intermediate allocations.

## Ranges vs Iterators

A traditional algorithm call requires passing two iterators and often a separate output:

```cpp
std::vector<int> src = {1, 2, 3, 4, 5, 6, 7, 8};
std::vector<int> dst;
std::copy_if(src.begin(), src.end(), std::back_inserter(dst),
             [](int x) { return x % 2 == 0; });
std::transform(dst.begin(), dst.end(), dst.begin(),
               [](int x) { return x * x; });
```

A range is any type that provides `begin()` and `end()`. Range-based algorithms accept the range directly, and views let you compose operations without materializing intermediate results:

```cpp
auto result = src
    | std::views::filter([](int x) { return x % 2 == 0; })
    | std::views::transform([](int x) { return x * x; });
```

At this point `result` holds no data — it is a lazy view that computes values on demand as you iterate.

## Core C++20 Views

The `<ranges>` header provides a set of view adaptors, each producing a lazy view from an input range:

| Adaptor | Effect |
| ------- | ------ |
| `views::filter(pred)` | Yields elements where `pred` returns true |
| `views::transform(fn)` | Applies `fn` to each element |
| `views::take(n)` | Yields the first `n` elements |
| `views::drop(n)` | Skips the first `n` elements |
| `views::reverse` | Iterates in reverse (requires bidirectional range) |
| `views::elements<N>` | Extracts the Nth element from tuple-like types |
| `views::keys` / `views::values` | Shorthand for `elements<0>` / `elements<1>` |
| `views::split(delim)` | Splits a range on a delimiter |
| `views::join` | Flattens a range of ranges |

## The Pipe Operator

The pipe `|` is syntactic sugar for function composition. `R | C` is equivalent to `C(R)`, but reads left-to-right, matching the data flow:

```cpp
auto pipeline = std::views::filter([](int x) { return x > 0; })
              | std::views::transform([](int x) { return x * 2; })
              | std::views::take(5);

for (int val : data | pipeline) {
    process(val);
}
```

Pipelines are first-class values. You can store them, pass them to functions, and apply them to different ranges.

## Replacing Index Loops

A typical index-based loop that collects transformed elements:

```cpp
std::vector<std::string> names;
for (size_t i = 0; i < users.size(); ++i) {
    if (users[i].active) {
        names.push_back(users[i].name);
    }
}
```

The ranges equivalent:

```cpp
auto names = users
    | std::views::filter(&User::active)
    | std::views::transform(&User::name)
    | std::ranges::to<std::vector>();
```

The intent is visible at a glance: filter, transform, collect. No manual index management, no push_back.

## C++23 Additions

C++23 fills several gaps in the ranges library:

### `views::zip`

Combines multiple ranges into a range of tuples, stopping at the shortest:

```cpp
std::vector<std::string> names = {"Alice", "Bob", "Carol"};
std::vector<int> scores = {95, 87, 92};

for (auto [name, score] : std::views::zip(names, scores)) {
    std::println("{}: {}", name, score);
}
```

### `views::enumerate`

Pairs each element with its zero-based index — the ranges equivalent of Python's `enumerate()`:

```cpp
for (auto [idx, val] : std::views::enumerate(data)) {
    std::println("[{}] = {}", idx, val);
}
```

### `views::chunk` and `views::stride`

`chunk(n)` groups elements into sub-ranges of size `n`. `stride(n)` takes every nth element:

```cpp
std::vector<int> pixels = {/* RGBRGBRGB... */};

for (auto pixel : pixels | std::views::chunk(3)) {
    auto r = pixel[0], g = pixel[1], b = pixel[2];
}

for (int red : pixels | std::views::stride(3)) {
    process_red_channel(red);
}
```

### `views::zip_transform`

Combines zip and transform into a single step:

```cpp
auto sums = std::views::zip_transform(std::plus{}, xs, ys);
```

### `views::adjacent` and `views::slide`

`adjacent<N>` yields tuples of N consecutive elements. `slide(n)` yields sub-ranges of size n as a sliding window:

```cpp
for (auto [a, b] : data | std::views::adjacent<2>) {
    if (a > b) std::println("decrease at {}", b);
}
```

## `ranges::to` — Materializing Views

C++20 views are lazy — they don't own data. When you need a concrete container, C++23 provides `ranges::to`:

```cpp
auto evens = numbers
    | std::views::filter([](int x) { return x % 2 == 0; })
    | std::ranges::to<std::vector>();

auto word_set = text
    | std::views::split(' ')
    | std::views::transform([](auto r) {
        return std::string(r.begin(), r.end());
    })
    | std::ranges::to<std::set>();
```

The container's element type is deduced via CTAD. You can also specify it explicitly: `std::ranges::to<std::vector<int>>()`.

## Performance

Views introduce no heap allocations. Each view adaptor stores a reference to the upstream range and its predicate or function object. Iteration compiles down to the same machine code as a hand-written loop — the optimizer sees through the abstraction layers.

Benchmarks show ranges performing on par with equivalent `<algorithm>` calls and raw loops for filter/transform pipelines. Where ranges can underperform is in operations that lose iterator category — `views::filter` downgrades a random-access range to bidirectional, for example, which prevents certain algorithm optimizations. In practice, the difference is negligible for the vast majority of workloads.

The real performance benefit is indirect: declarative pipelines are easier to reason about, which makes it easier to identify algorithmic improvements. A `views::take(10)` short-circuits the entire upstream pipeline, something that is easy to forget in a manual loop.

## Practical Patterns

Keep data in a view as long as you're only reading it. Materialize with `ranges::to` when you need stable storage, random access, or will traverse the result multiple times. Store pipelines as variables when you apply the same transformation to different ranges. Use projections in range algorithms instead of wrapping elements in lambdas — `std::ranges::sort(users, {}, &User::name)` is cleaner than writing a comparator.

Ranges are a default tool for everyday C++ in 2026. They eliminate an entire class of off-by-one errors, make intent explicit, and compose naturally.
