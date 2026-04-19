# EventSnap — Admin Account Setup

## Prerequisites
- A Supabase project at https://fbesqscxkxklqyjwpupk.supabase.co

## Steps

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select the EventSnap project

2. **Create the Admin User**
   - Go to **Authentication** → **Users**
   - Click **Add user** → **Create new user**
   - Email: `junsangsingh@gmail.com`
   - Password: Choose a strong password (min 8 characters)
   - Check **Auto Confirm User** (skip email verification)
   - Click **Create user**

3. **Verify**
   - The user should appear in the users list with status "Confirmed"
   - This is the only admin account — there is no public signup
   - All `/admin/*` routes are protected by Supabase Auth

## Security Notes
- This is a **single-admin** system — only one account exists
- The admin email/password is managed entirely through Supabase Auth
- Password changes can be done from the admin Settings page (once built)
- If locked out, reset via Supabase Dashboard → Authentication → Users

## Important
- Do NOT create additional users unless co-admin support is added (v2 feature)
- Guest users do NOT have Supabase Auth accounts — they use localStorage session tokens
