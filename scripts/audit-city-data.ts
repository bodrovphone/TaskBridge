/**
 * City Data Audit Script
 *
 * Analyzes current city values in tasks and users tables
 * to prepare for slug normalization migration
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CityCount {
  city: string
  count: number
}

async function auditCityData() {
  console.log('🔍 City Data Audit Report')
  console.log('=' .repeat(60))
  console.log()

  // Audit tasks table
  console.log('📋 Tasks Table - City Distribution:')
  console.log('-'.repeat(60))

  const { data: tasksCities, error: tasksError } = await supabase
    .from('tasks')
    .select('city')
    .not('city', 'is', null)

  if (tasksError) {
    console.error('❌ Error querying tasks:', tasksError.message)
  } else {
    const cityCounts = tasksCities.reduce((acc, task) => {
      const city = task.city || 'NULL'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([city, count]) => ({ city, count }))

    console.log(`Total tasks with city: ${tasksCities.length}`)
    console.log()
    console.log('City Value                              | Count')
    console.log('-'.repeat(60))
    sorted.forEach(({ city, count }) => {
      console.log(`${city.padEnd(40)} | ${count}`)
    })
    console.log()

    // Analyze normalization needs
    console.log('🔧 Normalization Analysis:')
    console.log('-'.repeat(60))

    const needsNormalization = sorted.filter(
      ({ city }) => !['sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven'].includes(city)
    )

    if (needsNormalization.length === 0) {
      console.log('✅ All city values are already normalized slugs!')
    } else {
      console.log(`⚠️  Found ${needsNormalization.length} city values that need normalization:`)
      needsNormalization.forEach(({ city, count }) => {
        const suggestedSlug = detectCitySlug(city)
        console.log(`   "${city}" (${count} tasks) → suggested: "${suggestedSlug}"`)
      })
    }
    console.log()
  }

  // Audit users table
  console.log('👤 Users Table - City Distribution:')
  console.log('-'.repeat(60))

  const { data: usersCities, error: usersError } = await supabase
    .from('users')
    .select('city')
    .not('city', 'is', null)

  if (usersError) {
    console.error('❌ Error querying users:', usersError.message)
  } else {
    const cityCounts = usersCities.reduce((acc, user) => {
      const city = user.city || 'NULL'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([city, count]) => ({ city, count }))

    console.log(`Total users with city: ${usersCities.length}`)
    console.log()
    console.log('City Value                              | Count')
    console.log('-'.repeat(60))
    sorted.forEach(({ city, count }) => {
      console.log(`${city.padEnd(40)} | ${count}`)
    })
    console.log()

    // Analyze normalization needs
    console.log('🔧 Normalization Analysis:')
    console.log('-'.repeat(60))

    const needsNormalization = sorted.filter(
      ({ city }) => !['sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven'].includes(city)
    )

    if (needsNormalization.length === 0) {
      console.log('✅ All city values are already normalized slugs!')
    } else {
      console.log(`⚠️  Found ${needsNormalization.length} city values that need normalization:`)
      needsNormalization.forEach(({ city, count }) => {
        const suggestedSlug = detectCitySlug(city)
        console.log(`   "${city}" (${count} users) → suggested: "${suggestedSlug}"`)
      })
    }
    console.log()
  }

  console.log('=' .repeat(60))
  console.log('✅ Audit Complete')
  console.log()
  console.log('Next Steps:')
  console.log('1. Review normalization suggestions above')
  console.log('2. Create migration script with UPDATE statements')
  console.log('3. Test on development database')
  console.log('4. Run on production with backup')
}

/**
 * Detect which slug a city value should map to
 */
function detectCitySlug(cityValue: string): string {
  const lower = cityValue.toLowerCase().trim()

  // Sofia variations
  if (lower.includes('sofia') || lower.includes('софия')) {
    return 'sofia'
  }

  // Plovdiv variations
  if (lower.includes('plovdiv') || lower.includes('пловдив')) {
    return 'plovdiv'
  }

  // Varna variations
  if (lower.includes('varna') || lower.includes('варна')) {
    return 'varna'
  }

  // Burgas variations
  if (lower.includes('burgas') || lower.includes('бургас') || lower.includes('bourgas')) {
    return 'burgas'
  }

  // Ruse variations
  if (lower.includes('ruse') || lower.includes('русе') || lower.includes('rousse')) {
    return 'ruse'
  }

  // Stara Zagora variations
  if (lower.includes('stara') || lower.includes('zagora') || lower.includes('стара') || lower.includes('загора')) {
    return 'stara-zagora'
  }

  // Pleven variations
  if (lower.includes('pleven') || lower.includes('плевен')) {
    return 'pleven'
  }

  // Sliven variations
  if (lower.includes('sliven') || lower.includes('сливен')) {
    return 'sliven'
  }

  return 'UNKNOWN'
}

// Run audit
auditCityData().catch((error) => {
  console.error('❌ Audit failed:', error)
  process.exit(1)
})
