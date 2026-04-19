import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: node scripts/provision-admin.mjs <email> <password>')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'colliers-flex'

const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
if (listError) {
  console.error('Could not list users:', listError.message)
  process.exit(1)
}

const existingUser = listData.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())

if (existingUser) {
  const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...(existingUser.user_metadata || {}),
      role: 'admin',
    },
  })

  if (error) {
    console.error('Could not update admin user:', error.message)
    process.exit(1)
  }

  console.log('Admin user updated.')
} else {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
    },
  })

  if (error) {
    console.error('Could not create admin user:', error.message)
    process.exit(1)
  }

  console.log('Admin user created.')
}

const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
if (bucketsError) {
  console.error('Could not list storage buckets:', bucketsError.message)
  process.exit(1)
}

if (!buckets.find((bucket) => bucket.name === bucketName)) {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  })

  if (error) {
    console.error('Could not create storage bucket:', error.message)
    process.exit(1)
  }

  console.log(`Storage bucket "${bucketName}" created.`)
} else {
  console.log(`Storage bucket "${bucketName}" already exists.`)
}
