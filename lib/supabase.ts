import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback for build-time safety
export const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder'))
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: (table: string) => {
            if (typeof window !== 'undefined') {
                console.warn(`Supabase: Intentando acceder a '${table}' pero falta configuración de URL/Key.`);
            }
            return {
                select: () => ({
                    order: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }),
                    then: (fn: any) => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }).then(fn)
                }) as any,
                insert: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }),
                update: () => ({ eq: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }) }),
                delete: () => ({
                    not: () => ({ eq: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }) }),
                    eq: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }),
                    not_null: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } })
                }),
                upsert: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } })
            };
        }
    } as any;
