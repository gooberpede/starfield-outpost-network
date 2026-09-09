import { parseArgs } from 'node:util'
import {
  createHistoryBenchmarkController,
  type HistoryBenchmarkResult,
  type HistoryBenchmarkWorkload,
  type HistoryMemorySampler,
} from '../src/dev/historyBenchmark.ts'

const { values } = parseArgs({
  options: {
    workload: { type: 'string', default: 'representative' },
    checkpoints: { type: 'string' },
    depth: { type: 'string' },
  },
})
const workload = values.workload as HistoryBenchmarkWorkload
if (workload !== 'representative' && workload !== 'replacement') {
  throw new Error('--workload must be representative or replacement.')
}
const checkpoints = (values.checkpoints ?? values.depth ??
  (workload === 'representative' ? '250,500,1000,2000,5000,10000' : '100,250,500'))
  .split(',').map(Number).sort((left, right) => left - right)
if (checkpoints.some((depth) => !Number.isInteger(depth) || depth < 0)) {
  throw new Error('Checkpoints must be comma-separated non-negative integers.')
}

const runtime = globalThis as typeof globalThis & {
  gc?: () => void
}
const memorySampler: HistoryMemorySampler = {
  sample() {
    runtime.gc?.()
    const memory = process.memoryUsage()
    return {
      heapUsedBytes: memory.heapUsed,
      heapTotalBytes: memory.heapTotal,
      externalBytes: memory.external,
      rssBytes: memory.rss,
      explicitGc: typeof runtime.gc === 'function',
    }
  },
}
const controller = createHistoryBenchmarkController(workload, memorySampler)
const results = checkpoints.map((checkpoint) => controller.runTo(checkpoint))
const sample = (result: HistoryBenchmarkResult, direction: 'undo' | 'redo') =>
  result[direction].at(-1)?.medianPerStepMs.toFixed(4) ?? 'n/a'
console.table(results.map((result) => ({
  depth: result.historyDepth,
  buildMs: result.elapsedMs.toFixed(2),
  blockMs: result.incrementalElapsedMs.toFixed(2),
  undoMedianMs: sample(result, 'undo'),
  redoMedianMs: sample(result, 'redo'),
  heapUsedMiB: result.memory?.heapUsedBytes
    ? (result.memory.heapUsedBytes / 1024 / 1024).toFixed(2) : 'n/a',
})))
console.log(JSON.stringify(results, null, 2))
