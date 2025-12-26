import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase'

interface AddDatabaseRequest {
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
  database_url: string;
  service_role_key?: string;
}

export async function POST(request: Request) {
  try {
    const body: AddDatabaseRequest = await request.json();
    const { name, supabase_url, supabase_anon_key, database_url, service_role_key } = body;

    // Validate required fields
    if (!name || !supabase_url || !supabase_anon_key || !database_url) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Use service mode to bypass RLS
    const supabase = await getSupabaseClient({ mode: 'service' });

    // Check for duplicate name
    const { data: existing, error: checkError } = await supabase
      .from('database_connections')
      .select('id')
      .eq('connection_name', name)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Database name already exists' },
        { status: 409 }
      );
    }

    // Insert new database
    const { data, error } = await supabase
      .from('database_connections')
      .insert({
        connection_name: name,
        supabase_url,
        supabase_anon_key,
        database_url,
        supabase_service_role_key: service_role_key || null,
        is_default: false,
        is_active: true,
        connection_status: 'disconnected',
        last_tested_at: null,
        created_by: null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Database added successfully',
      database: data
    });

  } catch (err: any) {
    console.error('Add database error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to add database', details: err },
      { status: 500 }
    );
  }
}