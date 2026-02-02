---
slug: spring-security-oauth2-resource-server
title: "Spring Security OAuth2 Resource Server"
excerpt: "Configuring Spring Boot as an OAuth2 resource server with JWT validation, scope-based authorization, and token introspection."
coverGradient: "linear-gradient(135deg, hsl(101, 70%, 27%) 0%, hsl(161, 48%, 24%) 100%)"
author: Frost
date: "2025-08-02"
tags: ["Spring"]
published: true
---

Setting up Spring Boot as an OAuth2 resource server involves configuring how JWTs are validated, how scopes map to authorities, and how to handle token errors. The framework provides sensible defaults, but production deployments need explicit configuration for security and clarity.

## JWT Validation Configuration

Spring Security validates JWTs by verifying the signature against the issuer's public keys, checking the expiration time, and optionally validating claims like audience and issuer. Configure the issuer URI, and Spring automatically fetches the JWK set for signature verification. For offline validation or custom key management, provide a JwtDecoder bean directly.

## Scope-Based Authorization

OAuth2 scopes in the JWT map to Spring Security authorities with a SCOPE\_ prefix. A token with scope "read write" gives authorities SCOPE_read and SCOPE_write. Use @PreAuthorize annotations or SecurityFilterChain configuration to require specific scopes for endpoints. This provides fine-grained access control without coupling your application to the authorization server's internal logic.

## Token Introspection

For opaque tokens (not JWTs), Spring Security supports token introspection — sending the token to the authorization server to validate it. This is more secure (tokens can be revoked immediately) but adds a network call per request. The choice between JWT validation and introspection depends on your requirements for revocation immediacy versus latency.
