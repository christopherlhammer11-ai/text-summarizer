# Text Summarizer

CLI tool for extractive summarization using TF-IDF scoring without requiring an LLM.

<!-- badges -->

## What It Does

Text Summarizer (`summarize`) distills long text into concise summaries using TF-IDF, positional weighting, and signal-word scoring. Pure NLP algorithms—no API calls, no wait time.

## Features

- **Extractive Summarization**: Pulls key sentences directly from source
- **TF-IDF Scoring**: Identifies important terms and concepts
- **Configurable Output**: Text, bullets, or JSON format
- **Position Awareness**: Favors sentences from introduction and conclusion
- **Signal Words**: Recognizes "important", "critical", "note" markers
- **Flexible Limits**: Set maxSentences and maxWords for any use case

## Quick Start

```bash
npm install -g text-summarizer
summarize "input.txt" --max-sentences 5
```

## Usage

```bash
# Extract top sentences
summarize article.txt --max-sentences 5

# Output as bullet points
summarize article.txt --format bullets --max-words 200

# JSON output with scores
summarize article.txt --format json

# Pipe input
cat long-doc.txt | summarize --max-sentences 3
```

## Tech Stack

- Commander.js (CLI framework)
- TF-IDF algorithm (scoring)
- TypeScript (pure implementation)

## Part of Genesis Marketplace

Powers the summarization skill in the Genesis agent marketplace.

## Author

Christopher L. Hammer  
GitHub: [christopherlhammer11-ai](https://github.com/christopherlhammer11-ai)  
Sites: [hammercg.com](https://hammercg.com) | [hammerlockai.com](https://hammerlockai.com)
