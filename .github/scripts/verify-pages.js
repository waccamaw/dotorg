#!/usr/bin/env node

/**
 * Verify Pages Script
 * Validates that all pages configured in pages-config.json are accessible
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const configPath = path.join(__dirname, '..', 'agents', 'pages-config.json');
const pagesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const baseURL = 'http://localhost:1313';

async function checkPage(page) {
  return new Promise((resolve) => {
    const url = `${baseURL}${page.path}`;
    
    http.get(url, (res) => {
      const success = res.statusCode === 200;
      resolve({
        page: page.name,
        path: page.path,
        status: res.statusCode,
        success: success,
        optional: page.optional || false
      });
    }).on('error', (err) => {
      resolve({
        page: page.name,
        path: page.path,
        status: 'error',
        success: false,
        optional: page.optional || false,
        error: err.message
      });
    });
  });
}

async function main() {
  console.log('Verifying all configured pages...\n');
  
  const results = await Promise.all(
    pagesConfig.pages.map(page => checkPage(page))
  );
  
  console.log('Results:');
  console.log('========\n');
  
  let allPassed = true;
  
  results.forEach(result => {
    const status = result.success ? '✓' : (result.optional ? '⚠' : '✗');
    const statusText = result.success ? 'OK' : (result.optional ? 'OPTIONAL (missing)' : 'FAILED');
    
    console.log(`${status} ${result.page.padEnd(20)} ${result.path.padEnd(30)} [${statusText}]`);
    
    if (!result.success && !result.optional) {
      allPassed = false;
    }
  });
  
  console.log('\n========');
  
  if (allPassed) {
    console.log('✓ All required pages are accessible!');
    process.exit(0);
  } else {
    console.log('✗ Some required pages are not accessible!');
    process.exit(1);
  }
}

main();
