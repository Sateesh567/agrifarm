import { config } from '../config/config.js';

/**
 * Runs a load test with specified concurrency and duration.
 * @param {number} durationSeconds - Duration of the test in seconds
 * @param {number} virtualUsers - Number of concurrent virtual users
 * @returns {Promise<object>} Results of the load test
 */
export async function runLoadTest(durationSeconds = 60, virtualUsers = 100) {
  const durationMs = durationSeconds * 1000;
  const startTime = Date.now();
  const endTime = startTime + durationMs;
  const latencies = [];
  let successCount = 0;
  let failCount = 0;

  console.log(`\n[LOAD TEST] Starting load test with ${virtualUsers} virtual users for ${durationSeconds} seconds...`);

  // Define workers
  const runWorker = async () => {
    while (Date.now() < endTime) {
      const start = Date.now();
      try {
        // Use a standard HTTP fetch call
        const res = await fetch(`${config.baseUrl}/api/products`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        const duration = Date.now() - start;
        latencies.push(duration);

        if (res.status === 200) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        const duration = Date.now() - start;
        latencies.push(duration);
        failCount++;
      }

      // Add a tiny micro-sleep (e.g. 2ms) to prevent socket exhaustion/CPU lock
      await new Promise(resolve => setTimeout(resolve, 2));
    }
  };

  // Run all virtual users concurrently
  const workers = Array.from({ length: virtualUsers }, runWorker);
  await Promise.all(workers);

  const actualDurationMs = Date.now() - startTime;
  const actualDurationSeconds = actualDurationMs / 1000;
  const totalRequests = successCount + failCount;
  const rps = totalRequests / actualDurationSeconds;

  // Sorting latencies for statistics and percentiles
  latencies.sort((a, b) => a - b);
  const min = latencies.length > 0 ? latencies[0] : 0;
  const max = latencies.length > 0 ? latencies[latencies.length - 1] : 0;
  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = latencies.length > 0 ? sum / latencies.length : 0;

  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.9)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

  const results = {
    totalRequests,
    successCount,
    failCount,
    rps,
    min,
    max,
    avg,
    p50,
    p90,
    p95,
    p99,
    successRate: totalRequests > 0 ? (successCount / totalRequests) * 100 : 0,
    durationSeconds: actualDurationSeconds
  };

  console.log(`[LOAD TEST] Load test completed successfully!`);

  console.log(`
================================================
LOAD TEST RESULTS (100 VUs, 1 min)
================================================
Requests per second (RPS)
${Math.round(rps)} req/sec
Meaning your API is handling about ${Math.round(rps)} requests every second.
________________________________________
Response Time
Average: ${Math.round(avg)}ms
Min: ${min}ms
Max: ${max}ms
Meaning:
• Fastest response = ${min}ms
• Average = ${Math.round(avg)}ms
• Slowest = ${max}ms
================================================
`);

  return results;
}
