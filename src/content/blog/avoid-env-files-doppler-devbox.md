---
slug: avoid-env-files-doppler-devbox
title: "Avoid .env Files with Doppler and Devbox"
excerpt: "Replace scattered .env files with centralized secret management via Doppler and reproducible developer environments via Devbox and Nix."
coverGradient: "linear-gradient(135deg, #1a120a 0%, #0a1a1a 50%, #1a120a 100%)"
author: Frost
authorLink: "https://github.com/chopsticks-user"
date: "2026-02-01"
tags: ["DevOps"]
published: true
---

Every project starts the same way: copy `.env.example` to `.env`, fill in the blanks, and hope everyone on the team keeps theirs in sync. Then staging needs different values, production needs different values, and someone Slacks a database password in plaintext because the new hire can't find the right `.env`. The file that was supposed to simplify configuration becomes a liability.

## What's Wrong with `.env` Files

The problems compound as a team scales:

- **No access control.** Anyone with the file has every secret in it. There is no per-secret or per-environment permission model.
- **No audit trail.** You cannot determine who accessed a secret, when, or from where.
- **No rotation.** Changing a secret means manually updating every developer's `.env`, every CI pipeline, and every deployment. Secrets accumulate rotation debt.
- **No sync mechanism.** Adding a new secret requires notifying the team through a side channel. Developers discover missing variables via runtime errors.
- **Accidental commits.** Despite `.gitignore`, `.env` files end up in version control regularly enough to sustain an entire category of security scanning tools.

## Doppler: Centralized Secrets

Doppler is a secrets management platform that replaces `.env` files with a centralized, access-controlled, audited store. Secrets are organized by project and config (environment):

```
my-app/
├── dev        (development secrets)
├── stg        (staging secrets)
└── prd        (production secrets)
```

### CLI Setup

```bash
brew install dopplerhq/cli/doppler
doppler login
doppler setup
```

`doppler setup` walks through selecting a project and config, scoping the selection to the current directory.

### Injecting Secrets

The `doppler run` command fetches secrets and injects them as environment variables into a child process:

```bash
doppler run -- npm run dev
doppler run -- python manage.py runserver
doppler run -- docker compose up
```

Your application reads `process.env.DATABASE_URL` as usual. No `.env` file exists on disk. Secrets are fetched at runtime, encrypted in transit, and never written to the filesystem.

### Managing Secrets

```bash
doppler secrets
doppler secrets set API_KEY sk-new-value
doppler secrets delete OLD_VARIABLE
doppler secrets download --no-file --format env
```

The dashboard provides a web UI for the same operations, plus diff views between environments, secret referencing (one secret's value derived from another), and change history.

### Service Tokens for CI/CD

Local development uses the interactive `doppler login` flow. CI/CD environments use service tokens — scoped, revocable credentials restricted to a single project and config:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Doppler CLI
        uses: dopplerhq/cli-action@v3
      - name: Deploy
        run: doppler run -- ./deploy.sh
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
```

The token is stored as a GitHub Actions secret — the only secret that lives outside Doppler. Every other secret is fetched at runtime through the CLI.

## Devbox: Reproducible Environments

Doppler handles secrets. Devbox handles everything else in the developer environment — language runtimes, CLI tools, system libraries — using Nix packages without requiring Nix knowledge.

```bash
curl -fsSL https://get.jetify.com/devbox | bash
devbox init
```

### Defining the Environment

`devbox.json` declares the tools your project needs:

```json
{
  "packages": [
    "nodejs@22",
    "bun@latest",
    "doppler@latest",
    "postgresql_16@latest"
  ],
  "shell": {
    "init_hook": [
      "echo 'Environment ready'"
    ],
    "scripts": {
      "dev": "doppler run -- bun dev",
      "test": "doppler run -- bun test",
      "db:migrate": "doppler run -- bun run migrate"
    }
  }
}
```

Running `devbox shell` drops you into an isolated environment with exactly those versions installed. No global installations, no version conflicts between projects, no "works on my machine."

### How It Works

Devbox uses Nix under the hood. Each package is downloaded from Nixpkgs — a repository of over 100,000 packages — and installed into a project-local profile. The `$PATH` is scoped so that only declared packages are available inside the shell. Outside the shell, your system is unchanged.

This is not containerization. There is no Docker daemon, no image builds, no volume mounts. It's a modified shell environment backed by Nix's hermetic package management.

## Integration: Devbox + Doppler

The combination is straightforward: Devbox manages the tools (including the Doppler CLI itself), and Doppler manages the secrets. The `init_hook` in `devbox.json` can authenticate Doppler automatically:

```json
{
  "packages": [
    "nodejs@22",
    "doppler@latest"
  ],
  "env": {
    "DOPPLER_PROJECT": "my-app"
  },
  "shell": {
    "init_hook": [
      "doppler setup --no-interactive --config dev 2>/dev/null || true"
    ],
    "scripts": {
      "dev": "doppler run -- npm run dev",
      "build": "doppler run -- npm run build"
    }
  }
}
```

New team members clone the repo, run `devbox shell`, and have the correct Node version, the Doppler CLI, and pre-configured project access. `devbox run dev` starts the application with secrets injected.

## CI/CD Pipeline

In CI, Devbox ensures the build environment matches development exactly. Combined with Doppler's service tokens:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Devbox
        uses: jetify-com/devbox-install-action@v0.11.0

      - name: Build
        run: devbox run build
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN_STG }}

      - name: Test
        run: devbox run test
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN_STG }}
```

The CI runner uses the same package versions as every developer's machine. Secrets come from Doppler, scoped to the staging config. No `.env` files are copied, committed, or cached.

## Team Adoption

Rolling this out incrementally is the practical approach:

1. **Add Devbox first.** It's non-invasive — `devbox.json` sits in the repo root, and developers who don't use it aren't affected. Those who do get deterministic environments immediately.
2. **Set up Doppler for one project.** Migrate secrets from `.env` to Doppler. Keep `.env.example` as documentation of required variables, but stop distributing actual `.env` files.
3. **Update CI pipelines.** Replace `.env` file copying with `doppler run`. This is usually a one-line change per job.
4. **Remove `.env` from developer workflows.** Once the team is comfortable, stop maintaining `.env` files entirely. If someone needs to see what variables exist, `doppler secrets` lists them.

The result is a development environment where tools are version-pinned, secrets are centralized, and the gap between "clone the repo" and "run the app" is one command.
