---
slug: nextjs-server-actions-form-patterns
title: "Next.js Server Actions Form Patterns"
excerpt: "Building type-safe, progressively enhanced forms with Server Actions, useFormState, and Zod validation."
coverGradient: "linear-gradient(135deg, hsl(147, 70%, 18%) 0%, hsl(207, 64%, 32%) 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2025-11-22"
tags: ["Next.js", "React"]
published: true
---

Server Actions in Next.js bring form handling back to the server while maintaining the interactive experience users expect. Combined with useFormState for progressive enhancement and Zod for validation, they provide a robust pattern for building forms that work with or without JavaScript.

## The Server Action Pattern

A Server Action is an async function marked with "use server" that runs exclusively on the server. When attached to a form's action prop, the browser submits the form data directly to the server function — no API route needed. The function receives FormData, processes it, and can return a response that the client uses to update the UI.

## Progressive Enhancement with useFormState

useFormState wraps a Server Action and manages the form's state across submissions. The form works without JavaScript (standard form submission), and when JavaScript is available, it enhances to provide inline feedback without a full page reload. This layered approach means forms are functional immediately, before any client-side code loads.

## Validation with Zod

Parsing form data with Zod provides runtime type safety and descriptive error messages. Define a schema that matches your form fields, parse the FormData in the Server Action, and return structured errors when validation fails. The client displays field-level errors from the server response, creating a feedback loop that doesn't require client-side validation code to duplicate the server rules.
