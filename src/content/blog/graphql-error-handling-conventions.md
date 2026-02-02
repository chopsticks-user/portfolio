---
slug: graphql-error-handling-conventions
title: "GraphQL Error Handling Conventions"
excerpt: "Designing error responses with typed error unions, error codes, and partial success patterns for robust GraphQL APIs."
coverGradient: "linear-gradient(135deg, hsl(282, 60%, 15%) 0%, hsl(342, 64%, 32%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-12-20"
tags: ["GraphQL"]
published: true
---

GraphQL's default error handling — an errors array in the response — lacks type safety and makes it difficult for clients to handle specific error conditions. Designing explicit error types in your schema gives clients the same structured error handling they'd have with a well-designed REST API.

## The Errors Array Problem

GraphQL's specification-defined errors array is untyped. Errors have a message string and optional extensions object, but clients can't pattern-match on error types reliably. A "user not found" error and a "database timeout" error require the client to parse message strings or rely on unstable extension fields.

## Typed Error Unions

Model errors as part of the schema using union types. A createUser mutation returns CreateUserResult, which is a union of CreateUserSuccess and CreateUserError (with variants like EmailAlreadyExists, InvalidPassword, etc.). Clients use fragment spreads to handle each case explicitly, and the type system ensures they don't miss a variant.

## Partial Success

Some operations can partially succeed — a batch update might succeed for some items and fail for others. Model this explicitly with a results array where each element is a success/failure union. This is more useful than either throwing an error (losing the successful results) or returning success (hiding the failures). The client can process successful items and retry or report failed ones.
