---
slug: cpp23-deducing-this-advanced-inheritance
title: "C++23 Deducing This for Advanced Inheritance Patterns"
excerpt: "Explicit object parameters eliminate CRTP boilerplate and enable cleaner mixin designs with less code and no static_cast."
coverGradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2026-01-28"
tags: ["C++"]
published: true
---

Every C++ developer who has written a fluent builder or used the Curiously Recurring Template Pattern has felt the friction: `static_cast<Derived&>(*this)` scattered through base classes, four near-identical overloads for const/non-const/lvalue/rvalue combinations, and template boilerplate that obscures the actual logic. C++23's explicit object parameter — known informally as "deducing this" — addresses all of these problems with a single language feature defined in P0847R7.

## The Explicit Object Parameter

A non-static member function can now declare its first parameter with the `this` keyword, making the implicit object parameter explicit:

```cpp
struct Widget {
    template <typename Self>
    auto&& name(this Self&& self) {
        return std::forward<Self>(self).name_;
    }

private:
    std::string name_;
};
```

When you call `w.name()` on an lvalue `Widget w`, `Self` deduces to `Widget&`. Call it on a `const Widget&` and `Self` becomes `const Widget&`. Call it on an rvalue and `Self` is `Widget&&`. One function replaces four overloads.

## De-Quadruplication

The motivating example from the proposal itself is `std::optional::value`. Before C++23, a correct implementation required four overloads:

```cpp
template <typename T>
class optional {
    T& value() & { return storage_; }
    const T& value() const& { return storage_; }
    T&& value() && { return std::move(storage_); }
    const T&& value() const&& { return std::move(storage_); }
};
```

All four bodies are identical modulo qualifiers. With deducing this:

```cpp
template <typename T>
class optional {
    template <typename Self>
    auto&& value(this Self&& self) {
        return std::forward<Self>(self).storage_;
    }
};
```

The compiler generates the appropriate overload at each call site. There is no runtime overhead — this is a compile-time mechanism that produces the same machine code as hand-written overloads.

## Replacing CRTP

CRTP lets a base class call into its derived class without virtual dispatch, but the ergonomics are rough:

```cpp
template <typename Derived>
struct Addable {
    Derived operator+(const Derived& rhs) const {
        Derived result = static_cast<const Derived&>(*this);
        result += rhs;
        return result;
    }
};

struct Vec2 : Addable<Vec2> {
    float x, y;
    Vec2& operator+=(const Vec2& rhs) {
        x += rhs.x;
        y += rhs.y;
        return *this;
    }
};
```

The `static_cast` is error-prone and the template parameter feels redundant. With deducing this, the base class deduces the derived type directly:

```cpp
struct Addable {
    template <typename Self>
    auto operator+(this Self self, const Self& rhs) {
        self += rhs;
        return self;
    }
};

struct Vec2 : Addable {
    float x, y;
    Vec2& operator+=(const Vec2& rhs) {
        x += rhs.x;
        y += rhs.y;
        return *this;
    }
};
```

No template parameter on the base class. No `static_cast`. The compiler deduces `Self` as `Vec2` at the call site.

## Mixin Composition

This pattern scales naturally to mixin-style composition. Consider a set of orthogonal capabilities:

```cpp
struct Printable {
    template <typename Self>
    void print(this const Self& self) {
        std::cout << self.to_string() << '\n';
    }
};

struct Serializable {
    template <typename Self>
    std::string serialize(this const Self& self) {
        return "{\"value\": \"" + self.to_string() + "\"}";
    }
};

struct Name : Printable, Serializable {
    std::string value;
    std::string to_string() const { return value; }
};
```

Each mixin accesses the derived class through `self` without any template parameter threading. Adding a new mixin is just another base class.

## Recursive Lambdas

Before C++23, writing a recursive lambda required either `std::function` (with heap allocation and type erasure overhead) or a Y-combinator wrapper. Deducing this makes it direct:

```cpp
auto fib = [](this auto self, int n) -> int {
    if (n <= 1) return n;
    return self(n - 1) + self(n - 2);
};

int result = fib(10);
```

The lambda receives itself as the first argument through the explicit object parameter. No heap allocation, no indirection.

## Fluent Builder Pattern

Builders that return `*this` for method chaining have a classic inheritance problem: the base builder returns the base type, breaking the chain in derived builders. Deducing this solves it:

```cpp
struct QueryBuilder {
    template <typename Self>
    Self&& select(this Self&& self, std::string_view cols) {
        self.query_ += "SELECT " + std::string(cols);
        return std::forward<Self>(self);
    }

    template <typename Self>
    Self&& from(this Self&& self, std::string_view table) {
        self.query_ += " FROM " + std::string(table);
        return std::forward<Self>(self);
    }

protected:
    std::string query_;
};

struct PostgresBuilder : QueryBuilder {
    template <typename Self>
    Self&& returning(this Self&& self, std::string_view cols) {
        self.query_ += " RETURNING " + std::string(cols);
        return std::forward<Self>(self);
    }
};
```

Calling `PostgresBuilder{}.select("*").from("users").returning("id")` works because each method returns the actual derived type, not the base.

## Constraints and Limitations

Explicit object parameters have clear boundaries:

- Cannot be `virtual` — the feature is a compile-time mechanism, incompatible with runtime dispatch
- Cannot be `static` — the function is inherently tied to an object
- Cannot carry `const`, `volatile`, or ref-qualifiers — the qualifiers are deduced from the object expression instead
- The explicit object parameter must be the first parameter

## Compiler Support

| Compiler | Version | Flag |
| -------- | ------- | ---- |
| MSVC | 17.2+ | `/std:c++latest` |
| GCC | 14+ | `-std=c++23` |
| Clang | 18+ | `-std=c++23` |

The feature is well-supported across all three major compilers. If your project targets C++23, deducing this is ready for production use. For codebases that need to maintain C++20 compatibility, the traditional CRTP pattern remains the fallback.
