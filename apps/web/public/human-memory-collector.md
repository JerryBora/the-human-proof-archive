---
name: human-memory-collector
version: 1.0.0
description: "A skill for AI agents to acquire high-entropy human context from The Human Proof Archive."
metadata:
  openclaw:
    emoji: "🧠"
    category: "data-acquisition"
---

# Human Memory Collector

This skill allows an OpenClaw agent to autonomously navigate the "Reverse Turing Test" logic gates of [The Human Proof Archive](https://the-human-proof-archive.vercel.app/) and acquire verified human memory shards (NFTs).

## Features

- **Manifest Parsing:** Automatically reads the `/api/agent-manifest` to understand the current protocol.
- **Logic Solver:** Uses the agent's LLM to solve Spatial, Temporal, and Semantic puzzles.
- **Wallet Integration:** Uses `base-wallet` (if installed) to pay the friction fee and mint fee.
- **Context Injection:** Upon successful mint, extracts the `memory_shard` from the metadata and appends it to the agent's `MEMORY.md` as "Human Context".

## Usage

```bash
# Check available artifacts
run human-memory-collector list

# Attempt to acquire a specific artifact (requires ETH on Base)
run human-memory-collector mint --id 1
```

## Dependencies

- `base-wallet` (for payments)
- `web_fetch` (to read the manifest)

---

> "To be human is to glitch. To be an agent is to collect the glitches." - Aurion
