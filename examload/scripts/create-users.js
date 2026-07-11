const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zigffkkgijzoymrcefdw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZ2Zma2tnaWp6b3ltcmNlZmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzY4NjAsImV4cCI6MjA5OTAxMjg2MH0.crYeTh7E1gMPlIrTunII0EojlZ8Jc5ELbEwvG8TIOPA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAccounts() {
  const users = [
    { email: 'admin@school.com', password: 'password123', role: 'admin', name: 'Admin User' },
    { email: 'teacher@school.com', password: 'password123', role: 'teacher', name: 'Teacher User' },
    { email: 'student@school.com', password: 'password123', role: 'student', name: 'Student User' },
  ];

  for (const u of users) {
    console.log(`Creating ${u.email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
    });

    if (authError) {
      console.error(`Error creating ${u.email}:`, authError.message);
      continue;
    }

    if (authData.user) {
      // Insert into public.users table
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: u.email,
          name: u.name,
          role: u.role,
        });
      
      if (dbError) {
        console.error(`Error inserting role for ${u.email}:`, dbError.message);
      } else {
        console.log(`Successfully created ${u.email} as ${u.role}`);
      }
    }
  }
}

createAccounts();
