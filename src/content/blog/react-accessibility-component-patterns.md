---
slug: react-accessibility-component-patterns
title: "React Accessibility Component Patterns"
excerpt: "Building accessible modals, dropdowns, and tab panels with ARIA attributes, focus management, and keyboard navigation."
coverGradient: "linear-gradient(135deg, hsl(249, 70%, 18%) 0%, hsl(309, 40%, 20%) 100%)"
author: Frost
date: "2025-11-08"
tags: ["React"]
published: true
---

Accessibility in React components goes beyond adding aria-label attributes. Interactive components need managed focus, keyboard navigation, proper ARIA roles, and screen reader announcements. Getting these patterns right makes your application usable for everyone.

## Modal Accessibility

A modal must trap focus within itself when open. Tab should cycle through focusable elements inside the modal, never escaping to the content behind it. Escape should close the modal. The modal needs role="dialog", aria-modal="true", and aria-labelledby pointing to the title. When the modal opens, focus moves to the first focusable element. When it closes, focus returns to the trigger element.

## Dropdown Accessibility

Dropdowns combine a trigger button with a listbox or menu. The trigger uses aria-haspopup and aria-expanded. Arrow keys navigate options, Enter/Space selects, Escape closes. Each option needs an id, and the trigger's aria-activedescendant updates to reflect the currently focused option. This pattern allows keyboard users and screen readers to operate the dropdown without seeing the visual UI.

## Tab Panel Accessibility

Tabs use role="tablist" on the container, role="tab" on each tab, and role="tabpanel" on each panel. aria-selected marks the active tab, and aria-controls/aria-labelledby connect tabs to panels. Arrow keys move between tabs (not Tab, which moves to the panel content). The inactive panels are hidden with hidden or aria-hidden to prevent screen readers from reading all panels.
