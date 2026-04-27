# Text Summarizer

**Offline extractive summarization without an LLM.** Text Summarizer uses TF-IDF-style scoring to pull the most important sentences from long text.

**Related demo:** [Research Intake Layer](https://christopherhammer.dev/assets/videos/narrated/project-demos/research-intake-layer-narrated.mp4)

## Who Uses It

- High-volume workflows where LLM calls are too expensive
- Offline preprocessing jobs
- Research intake pipelines
- Agents that need cheap first-pass document reduction
- Students, analysts, and builders summarizing text locally

## Core Features

- Extractive summarization
- TF-IDF-style scoring
- Position and signal-word weighting
- Text, bullets, and JSON output modes
- Configurable sentence and word limits
- No API key required

## Example

```bash
summarize article.txt --max-sentences 5
summarize article.txt --format bullets --max-words 200
cat long-doc.txt | summarize --max-sentences 3
```

## Quick Start

```bash
npm install
npm run build
npm test
```

## Portfolio Context

Text Summarizer shows a practical instinct: not every AI workflow needs an expensive model call. Sometimes a fast local algorithm is the right first layer.

---

Built by **Christopher L. Hammer** - self-taught AI/product builder shipping local-first tools, demos, and real product surfaces.

- Portfolio: [christopherhammer.dev](https://christopherhammer.dev)
- Proof demos: [https://christopherhammer.dev#proof](https://christopherhammer.dev#proof)
- GitHub: [christopherlhammer11-ai](https://github.com/christopherlhammer11-ai)

