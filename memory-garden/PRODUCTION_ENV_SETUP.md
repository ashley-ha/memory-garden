# Production Environment Setup Guide

## 🔐 Environment Variables for Production

### 1. Generate Production Secrets

#### NEXTAUTH_SECRET
Generate a secure secret for NextAuth:
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

### 2. Vercel Environment Variables

Go to your Vercel project settings → Environment Variables and add:

#### Authentication Variables
- `NEXTAUTH_URL`: Your production URL (e.g., `https://yourdomain.com`)
- `NEXTAUTH_SECRET`: The secret you generated above
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

#### Supabase Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to "APIs & Services" → "Credentials"
4. Update your OAuth 2.0 Client ID:
   - Add Authorized JavaScript origins:
     - `https://yourdomain.com`
     - `https://www.yourdomain.com` (if using www)
   - Add Authorized redirect URIs:
     - `https://yourdomain.com/api/auth/callback/google`
     - `https://www.yourdomain.com/api/auth/callback/google` (if using www)

### 4. Supabase Production Setup

1. Go to your Supabase project dashboard
2. Ensure your database has all migrations applied
3. Update RLS policies if needed
4. Set up database backups (in Supabase dashboard → Settings → Backups)

### 5. Deployment Command

Once all environment variables are set in Vercel:

```bash
# Deploy to production
vercel --prod
```

Or push to your main branch if you have automatic deployments enabled.

## 🔍 Verification Checklist

After deployment, verify:
- [ ] Can access the homepage without errors
- [ ] Google OAuth login works
- [ ] Can create topics and cards
- [ ] Study mode functions properly
- [ ] Legal pages are accessible
- [ ] No console errors in production

## 🚨 Common Issues

### "Invalid NEXTAUTH_URL" Error
- Ensure NEXTAUTH_URL matches your exact production URL
- Don't include trailing slashes

### Google OAuth Error
- Double-check redirect URIs in Google Console
- Ensure client ID and secret are correct
- Wait a few minutes after updating Google settings

### Database Connection Issues
- Verify Supabase URL and anon key
- Check if RLS policies are too restrictive
- Ensure migrations have been applied

## 📝 Post-Launch

1. Monitor error logs in Vercel dashboard
2. Set up alerts for downtime
3. Regular database backups
4. Monitor usage and performance