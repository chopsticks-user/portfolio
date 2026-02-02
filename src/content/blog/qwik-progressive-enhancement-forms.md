---
slug: qwik-progressive-enhancement-forms
title: "Qwik Progressive Enhancement for Forms"
excerpt: "Building forms that work without JavaScript using routeAction$ and enhancing them with client-side validation."
coverGradient: "linear-gradient(135deg, hsl(108, 60%, 21%) 0%, hsl(168, 48%, 24%) 100%)"
author: Frost
date: "2025-06-14"
tags: ["Qwik"]
published: true
---

Progressive enhancement means building features that work at the baseline (HTML, no JavaScript) and layering improvements when JavaScript is available. Qwik City's form handling is designed for this pattern, making it the default rather than an afterthought.

## routeAction$ for Server Handling

A routeAction$ defines a server-side form handler that receives FormData, validates it, processes the submission, and returns a result. When attached to a Form component, submission works as a standard HTML form POST — no JavaScript required. The server processes the request, and the page re-renders with the result.

## Client-Side Enhancement

When JavaScript loads (which, with Qwik's resumability, may only happen when the user interacts), the form submission is intercepted and handled asynchronously. The page doesn't fully reload — only the affected parts update. Validation feedback appears inline without a round trip. This layering happens automatically; the same component code handles both cases.

## Zod Integration

Pairing routeAction$ with zod$ provides schema-based validation. Define the expected shape of the form data with a Zod schema, and Qwik City validates the submission before your handler runs. Invalid submissions get descriptive error objects that you can display next to form fields. The validation runs on the server regardless of JavaScript availability, ensuring data integrity.
