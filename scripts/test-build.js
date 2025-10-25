#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configurations for different LLM providers
const testConfigs = [
  {
    name: 'OpenAI GPT-3.5',
    description: 'Standard OpenAI configuration',
    env: {
      LLM_API_KEY: 'sk-test-key-for-build-validation',
      LLM_MODEL: 'gpt-3.5-turbo',
      LLM_BASE_URL: 'https://api.openai.com/v1',
      NEXT_PUBLIC_SITE_URL: 'https://example.com'
    }
  },
  {
    name: 'Local Ollama',
    description: 'Local LLM configuration',
    env: {
      LLM_API_KEY: 'not-required',
      LLM_MODEL: 'llama2',
      LLM_BASE_URL: 'http://localhost:11434/v1',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
    }
  },
  {
    name: 'No LLM (Portfolio Only)',
    description: 'Portfolio-only mode without chat',
    env: {
      NEXT_PUBLIC_SITE_URL: 'https://example.com'
    }
  }
];

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'pipe',
      ...options
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}\nStdout: ${stdout}\nStderr: ${stderr}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function testBuildWithConfig(config) {
  console.log(`\n🧪 Testing build with ${config.name}`);
  console.log(`   Description: ${config.description}`);
  
  const env = { ...process.env, ...config.env };
  
  try {
    // Test TypeScript compilation
    console.log('   ✓ Checking TypeScript compilation...');
    await runCommand('npx', ['tsc', '--noEmit'], { env });
    
    // Test Next.js build
    console.log('   ✓ Testing Next.js build...');
    const buildResult = await runCommand('npm', ['run', 'build'], { env });
    
    // Check for build warnings
    if (buildResult.stdout.includes('Warning:') || buildResult.stderr.includes('Warning:')) {
      console.log('   ⚠️  Build completed with warnings');
      const warnings = (buildResult.stdout + buildResult.stderr)
        .split('\n')
        .filter(line => line.includes('Warning:'))
        .slice(0, 3); // Show first 3 warnings
      warnings.forEach(warning => console.log(`      ${warning.trim()}`));
    } else {
      console.log('   ✅ Build completed successfully');
    }
    
    return { success: true, config: config.name };
    
  } catch (error) {
    console.log(`   ❌ Build failed: ${error.message}`);
    return { success: false, config: config.name, error: error.message };
  }
}

async function validatePortfolioData() {
  console.log('\n📊 Validating portfolio data...');
  
  try {
    const dataPath = path.join(process.cwd(), 'data.json');
    
    if (!fs.existsSync(dataPath)) {
      throw new Error('data.json file not found');
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Validate required fields
    const requiredFields = [
      'profile.name',
      'profile.email',
      'profile.title',
      'profile.bio',
      'skills',
      'experiences',
      'projects',
      'achievements',
      'education'
    ];
    
    const missingFields = [];
    
    for (const field of requiredFields) {
      const keys = field.split('.');
      let current = data;
      
      for (const key of keys) {
        if (!current || !current.hasOwnProperty(key)) {
          missingFields.push(field);
          break;
        }
        current = current[key];
      }
    }
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate data quality
    const warnings = [];
    
    if (!data.profile.name || data.profile.name.trim().length === 0) {
      warnings.push('Profile name is empty');
    }
    
    if (!data.experiences || data.experiences.length === 0) {
      warnings.push('No work experiences defined');
    }
    
    if (!data.projects || data.projects.length === 0) {
      warnings.push('No projects defined');
    }
    
    if (warnings.length > 0) {
      console.log('   ⚠️  Data validation warnings:');
      warnings.forEach(warning => console.log(`      - ${warning}`));
    } else {
      console.log('   ✅ Portfolio data is valid');
    }
    
    return { success: true, warnings };
    
  } catch (error) {
    console.log(`   ❌ Portfolio data validation failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkDependencies() {
  console.log('\n📦 Checking dependencies...');
  
  try {
    // Check if package.json exists
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      throw new Error('package.json not found');
    }
    
    // Check if node_modules exists
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('   📥 Installing dependencies...');
      await runCommand('npm', ['install']);
    }
    
    // Check for security vulnerabilities
    console.log('   🔍 Checking for security vulnerabilities...');
    try {
      await runCommand('npm', ['audit', '--audit-level', 'high']);
      console.log('   ✅ No high-severity vulnerabilities found');
    } catch (auditError) {
      console.log('   ⚠️  Security vulnerabilities detected - run "npm audit fix" to resolve');
    }
    
    console.log('   ✅ Dependencies check completed');
    return { success: true };
    
  } catch (error) {
    console.log(`   ❌ Dependencies check failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive build validation...\n');
  
  const results = {
    dependencies: null,
    portfolioData: null,
    builds: []
  };
  
  // Check dependencies
  results.dependencies = await checkDependencies();
  if (!results.dependencies.success) {
    console.log('\n❌ Dependency check failed. Cannot continue with build tests.');
    return results;
  }
  
  // Validate portfolio data
  results.portfolioData = await validatePortfolioData();
  
  // Test builds with different configurations
  for (const config of testConfigs) {
    const result = await testBuildWithConfig(config);
    results.builds.push(result);
  }
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  console.log(`Dependencies: ${results.dependencies.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Portfolio Data: ${results.portfolioData.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const successfulBuilds = results.builds.filter(b => b.success).length;
  const totalBuilds = results.builds.length;
  console.log(`Build Tests: ${successfulBuilds}/${totalBuilds} passed`);
  
  results.builds.forEach(build => {
    console.log(`  ${build.config}: ${build.success ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const overallSuccess = results.dependencies.success && 
                        results.portfolioData.success && 
                        successfulBuilds === totalBuilds;
  
  console.log(`\nOverall Result: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!overallSuccess) {
    console.log('\n🔧 Recommendations:');
    if (!results.dependencies.success) {
      console.log('  - Fix dependency issues before deployment');
    }
    if (!results.portfolioData.success) {
      console.log('  - Update data.json with valid portfolio information');
    }
    if (successfulBuilds < totalBuilds) {
      console.log('  - Review build configuration and environment variables');
    }
  }
  
  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      const success = results.dependencies?.success && 
                     results.portfolioData?.success && 
                     results.builds.every(b => b.success);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testBuildWithConfig, validatePortfolioData, checkDependencies };