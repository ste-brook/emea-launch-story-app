const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  iterations: 5,
  warmupIterations: 2,
  endpoints: [
    '/',
    '/api/leaderboard',
    '/api/enhance-story',
    '/api/submit-story'
  ]
};

// Utility functions
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return null;
  }
}

function measureResponseTime(endpoint) {
  const start = Date.now();
  runCommand(`curl -s http://localhost:3000${endpoint} > /dev/null`);
  return Date.now() - start;
}

function calculateStats(times) {
  const sum = times.reduce((a, b) => a + b, 0);
  const mean = sum / times.length;
  const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean,
    stdDev,
    min: Math.min(...times),
    max: Math.max(...times)
  };
}

// Main benchmark function
async function runBenchmark() {
  console.log('Starting benchmark...\n');

  // Ensure the dev server is running
  console.log('Starting development server...');
  const devProcess = runCommand('npm run dev &');
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  const results = {};

  for (const endpoint of CONFIG.endpoints) {
    console.log(`\nBenchmarking ${endpoint}...`);
    
    // Warmup
    for (let i = 0; i < CONFIG.warmupIterations; i++) {
      measureResponseTime(endpoint);
    }

    // Actual measurements
    const times = [];
    for (let i = 0; i < CONFIG.iterations; i++) {
      const time = measureResponseTime(endpoint);
      times.push(time);
      console.log(`  Iteration ${i + 1}: ${time}ms`);
    }

    results[endpoint] = calculateStats(times);
  }

  // Kill the dev server
  runCommand('pkill -f "next dev"');

  // Print results
  console.log('\nBenchmark Results:');
  console.log('==================\n');
  
  for (const [endpoint, stats] of Object.entries(results)) {
    console.log(`${endpoint}:`);
    console.log(`  Mean: ${stats.mean.toFixed(2)}ms`);
    console.log(`  Std Dev: ${stats.stdDev.toFixed(2)}ms`);
    console.log(`  Min: ${stats.min}ms`);
    console.log(`  Max: ${stats.max}ms\n`);
  }
}

// Run the benchmark
runBenchmark().catch(console.error); 