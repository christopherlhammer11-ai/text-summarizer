#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import { summarize } from './summarizer';

const program = new Command();
program.name('summarize').description('Extractive text summarization').version('0.1.0');

program
  .command('text')
  .description('Summarize a text file or stdin')
  .argument('[file]', 'Input file')
  .option('-n, --sentences <n>', 'Max sentences', '3')
  .option('-w, --words <n>', 'Max words', '150')
  .option('-f, --format <type>', 'Output: text, bullets, json', 'text')
  .action(async (file: string | undefined, opts: Record<string, string>) => {
    const input = file ? fs.readFileSync(file, 'utf-8') : await readStdin();
    const result = summarize(input, {
      maxSentences: parseInt(opts['sentences'], 10),
      maxWords: parseInt(opts['words'], 10),
      format: opts['format'] as 'text' | 'bullets' | 'json',
    });
    console.log(result.summary);
    process.stderr.write(`\n[${result.stats.originalWords}→${result.stats.summaryWords} words | ${result.stats.compressionPct}% compression | ${result.stats.selectedCount}/${result.stats.sentenceCount} sentences]\n`);
  });

program.parse();

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
    setTimeout(() => { if (!data) reject(new Error('No stdin')); }, 5000);
  });
}
