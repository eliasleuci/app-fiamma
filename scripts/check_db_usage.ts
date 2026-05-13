import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
console.log('Reading .env from:', envPath);
if (!fs.existsSync(envPath)) {
    console.error('.env file not found!');
    process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf-8');
console.log('Env content length:', envContent.length);

const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach(line => {
    const cleanLine = line.trim();
    console.log('Processing line:', cleanLine);
    const match = cleanLine.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].trim();
        console.log('Found key:', match[1]);
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('Url found:', !!supabaseUrl);
console.log('Key found:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
    'services',
    'app_config',
    'professional_blocks',
    'time_blocks',
    'faqs',
    'team',
    'bookings',
    'reviews',
    'clinical_records',
    'gallery',
    'expense_categories',
    'expenses'
];

async function checkUsage() {
    console.log('Checking database usage...');
    console.log('--------------------------------');

    let totalRows = 0;

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`Error checking ${table}:`, error.message);
        } else {
            console.log(`${table}: ${count} rows`);
            if (count) totalRows += count;
        }
    }

    console.log('--------------------------------');
    console.log(`Total Rows: ${totalRows}`);
    console.log('--------------------------------');
    console.log('Estimate:');
    // Rough estimate: 2KB per row usually (generous average for text data)
    // 500 MB = 500,000 KB. 
    // Max rows approx = 500,000 / 2 = 250,000 rows.
    const estSizeKB = totalRows * 2;
    console.log(`Estimated Data Size: ~${estSizeKB} KB`);
    console.log(`Free Plan Limit: 500 MB (512,000 KB)`);
    console.log(`Usage: ~${(estSizeKB / 512000 * 100).toFixed(4)}%`);
}

checkUsage();
