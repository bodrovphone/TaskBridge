/**
 * Profanity Filter Test Script
 *
 * Tests the profanity filter with various inputs in different languages.
 * Run with: npx tsx scripts/test-profanity-filter.ts
 */

import { checkTextForProfanity, validateProfanity, batchCheckProfanity } from '../src/lib/services/profanity-filter'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logTest(testName: string) {
  log(`\n${colors.bright}${colors.cyan}━━━ ${testName} ━━━${colors.reset}`)
}

function logResult(passed: boolean, message: string) {
  const icon = passed ? '✓' : '✗'
  const color = passed ? colors.green : colors.red
  log(`${icon} ${message}`, color)
}

// Test cases for different languages
const testCases = {
  english: {
    clean: [
      'I need help fixing my roof',
      'Professional house cleaning needed',
      'Website design for small business',
      'Plumbing repair for bathroom sink',
    ],
    profane: [
      'This is some bullshit work',
      'Fix my damn sink',
      'Need help with this fucking project',
    ],
  },
  bulgarian: {
    clean: [
      'Нуждая се от помощ за ремонт на покрива',
      'Професионално почистване на дома',
      'Дизайн на уебсайт за малък бизнес',
    ],
    profane: [
      'Тази работа е пълна глупост',
      'Трябва ми помощ за тази мръсна работа',
      'Нуждая се от майстор, не от идиот',
    ],
  },
  russian: {
    clean: [
      'Нужна помощь с ремонтом крыши',
      'Профессиональная уборка квартиры',
      'Дизайн сайта для малого бизнеса',
    ],
    profane: [
      'Эта работа полная фигня',
      'Нужна помощь с этой дерьмовой задачей',
      'Мне нужен мастер, а не идиот',
    ],
  },
  ukrainian: {
    clean: [
      'Потрібна допомога з ремонтом даху',
      'Професійне прибирання квартири',
      'Дизайн сайту для малого бізнесу',
    ],
    profane: [
      'Ця робота повна фігня',
      'Потрібна допомога з цим лайном',
      'Мені потрібен майстер, а не ідіот',
    ],
  },
}

// Test obfuscation detection
const obfuscationTests = {
  english: [
    'This is some bulls**t',
    'What the f*ck',
    'This is cr@p',
  ],
  cyrillic: [
    'Това е пълна глуп0ст', // Bulgarian with 0 instead of о
    'Ця робота пов1е фігня', // Ukrainian with 1 instead of і
    'Эта работа дерьм0вая', // Russian with 0 instead of о
  ],
}

async function runTests() {
  log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}`)
  log(`${colors.bright}${colors.blue}   Profanity Filter Test Suite${colors.reset}`)
  log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`)

  let totalTests = 0
  let passedTests = 0

  // Test 1: English clean text
  logTest('Test 1: English Clean Text')
  for (const text of testCases.english.clean) {
    totalTests++
    const result = checkTextForProfanity(text, 'en')
    const passed = !result.hasProfanity
    passedTests += passed ? 1 : 0
    logResult(passed, `"${text}" - ${passed ? 'CLEAN' : 'FLAGGED'}`)
    if (!passed) {
      log(`  Severity: ${result.severity}, Detected: ${result.detectedWords.join(', ')}`, colors.yellow)
    }
  }

  // Test 2: English profane text
  logTest('Test 2: English Profane Text')
  for (const text of testCases.english.profane) {
    totalTests++
    const result = checkTextForProfanity(text, 'en')
    const passed = result.hasProfanity
    passedTests += passed ? 1 : 0
    logResult(passed, `"${text}" - ${passed ? 'DETECTED' : 'MISSED'}`)
    if (passed) {
      log(`  Severity: ${result.severity}`, colors.yellow)
    }
  }

  // Test 3: Bulgarian clean text
  logTest('Test 3: Bulgarian Clean Text')
  for (const text of testCases.bulgarian.clean) {
    totalTests++
    const result = checkTextForProfanity(text, 'bg')
    const passed = !result.hasProfanity
    passedTests += passed ? 1 : 0
    logResult(passed, `"${text}" - ${passed ? 'CLEAN' : 'FLAGGED'}`)
  }

  // Test 4: Bulgarian profane text
  logTest('Test 4: Bulgarian Profane Text')
  for (const text of testCases.bulgarian.profane) {
    totalTests++
    const result = checkTextForProfanity(text, 'bg')
    const passed = result.hasProfanity
    passedTests += passed ? 1 : 0
    logResult(passed, `"${text}" - ${passed ? 'DETECTED' : 'MISSED'}`)
    if (passed) {
      log(`  Severity: ${result.severity}`, colors.yellow)
    }
  }

  // Test 5: Russian clean text
  logTest('Test 5: Russian Clean Text')
  for (const text of testCases.russian.clean) {
    totalTests++
    const result = checkTextForProfanity(text, 'ru')
    const passed = !result.hasProfanity
    passedTests += passed ? 1 : 0
    logResult(passed, `"${text}" - ${passed ? 'CLEAN' : 'FLAGGED'}`)
  }

  // Test 6: Russian profane text
  logTest('Test 6: Russian Profane Text')
  for (const text of testCases.russian.profane) {
    totalTests++
    const result = checkTextForProfanity(text, 'ru')
    const passed = result.hasProfanity
    passedTests += passed ? 1 : 0
    logResult(passed, `"${text}" - ${passed ? 'DETECTED' : 'MISSED'}`)
    if (passed) {
      log(`  Severity: ${result.severity}`, colors.yellow)
    }
  }

  // Test 7: Ukrainian clean text
  logTest('Test 7: Ukrainian Clean Text')
  for (const text of testCases.ukrainian.clean) {
    totalTests++
    const result = checkTextForProfanity(text, 'uk')
    const passed = !result.hasProfanity
    passedTests += passed ? 1 : 0
    logResult(passed, `"${text}" - ${passed ? 'CLEAN' : 'FLAGGED'}`)
  }

  // Test 8: Ukrainian profane text
  logTest('Test 8: Ukrainian Profane Text')
  for (const text of testCases.ukrainian.profane) {
    totalTests++
    const result = checkTextForProfanity(text, 'uk')
    const passed = result.hasProfanity
    passedTests += passed ? 1 : 0
    logResult(passed, `"${text}" - ${passed ? 'DETECTED' : 'MISSED'}`)
    if (passed) {
      log(`  Severity: ${result.severity}`, colors.yellow)
    }
  }

  // Test 9: Validation function
  logTest('Test 9: Validation Function')
  totalTests++
  const validationClean = validateProfanity('I need help with my project', 'en')
  const validationPassed = validationClean.valid
  passedTests += validationPassed ? 1 : 0
  logResult(validationPassed, 'Clean text validation - PASSED')

  totalTests++
  const validationProfane = validateProfanity('This is bullshit', 'en')
  const validationFailed = !validationProfane.valid
  passedTests += validationFailed ? 1 : 0
  logResult(validationFailed, 'Profane text validation - BLOCKED')

  // Test 10: Batch checking
  logTest('Test 10: Batch Profanity Check')
  totalTests++
  const batchTexts = [
    'Clean text here',
    'Some profane word',
    'Another clean sentence',
  ]
  const batchResults = batchCheckProfanity(batchTexts, 'en')
  const batchPassed = batchResults.length === 3
  passedTests += batchPassed ? 1 : 0
  logResult(batchPassed, `Batch check returned ${batchResults.length} results`)

  // Test 11: Empty and edge cases
  logTest('Test 11: Edge Cases')
  totalTests++
  const emptyResult = checkTextForProfanity('', 'en')
  const emptyPassed = !emptyResult.hasProfanity
  passedTests += emptyPassed ? 1 : 0
  logResult(emptyPassed, 'Empty string - CLEAN')

  totalTests++
  const shortResult = checkTextForProfanity('ok', 'en')
  const shortPassed = !shortResult.hasProfanity
  passedTests += shortPassed ? 1 : 0
  logResult(shortPassed, 'Short text - CLEAN')

  // Final summary
  log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}`)
  log(`${colors.bright}${colors.blue}   Test Summary${colors.reset}`)
  log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`)

  const successRate = ((passedTests / totalTests) * 100).toFixed(1)
  const summaryColor = passedTests === totalTests ? colors.green : colors.yellow

  log(`Total Tests: ${totalTests}`, colors.bright)
  log(`Passed: ${passedTests}`, colors.green)
  log(`Failed: ${totalTests - passedTests}`, colors.red)
  log(`Success Rate: ${successRate}%`, summaryColor)

  if (passedTests === totalTests) {
    log(`\n${colors.bright}${colors.green}✓ All tests passed!${colors.reset}\n`)
  } else {
    log(`\n${colors.bright}${colors.yellow}⚠ Some tests failed. Review the output above.${colors.reset}\n`)
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test execution failed:', error)
  process.exit(1)
})
