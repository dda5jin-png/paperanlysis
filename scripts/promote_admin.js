
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

// .env.local 직접 파싱
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = dotenv.parse(envContent);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function promoteToAdmin() {
  const emailPattern = '%dda5.jin%';
  console.log('>>> [Admin Promotion] Targeting email:', emailPattern);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .ilike('email', emailPattern)
    .select();

  if (error) {
    console.error('>>> [Error] Promotion failed:', error);
  } else if (data && data.length > 0) {
    console.log('>>> [Success] User promoted to Admin:', data[0].email);
  } else {
    console.log('>>> [Info] Profile not found, trying Auth users list...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email.includes('dda5.jin'));
    
    if (user) {
      console.log('>>> [Action] Creating new Admin profile for:', user.email);
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'admin',
          credits: 50,
          is_active: true
        })
        .select();
      if (profileError) console.error('>>> [Error] Profile creation failed:', profileError);
      else console.log('>>> [Success] Admin profile created.');
    } else {
      console.log('>>> [Error] User not found in database.');
    }
  }
}

promoteToAdmin();
