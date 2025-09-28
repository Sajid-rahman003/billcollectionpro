# Deployment Guide

This guide explains how to deploy the BillCollect Pro application to the cloud with real email authentication and a PostgreSQL database.

## Prerequisites

1. A cloud platform account (Vercel, Render, Railway, or similar)
2. A PostgreSQL database service (Neon, Supabase, or similar)
3. A domain name (optional but recommended)

## Database Setup

### Option 1: Neon Database (Recommended)

1. Go to [Neon.tech](https://neon.tech) and create a free account
2. Create a new PostgreSQL database
3. Copy the connection string (DATABASE_URL) from the dashboard

### Option 2: Supabase

1. Go to [Supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Navigate to Project Settings > Database to get the connection string

### Option 3: Railway

1. Go to [Railway.app](https://railway.app) and create a free account
2. Create a new PostgreSQL database
3. Copy the DATABASE_URL from the environment variables

## Environment Variables

Set the following environment variables in your deployment platform:

```env
# Database connection
DATABASE_URL=your_postgresql_connection_string

# Session secret (generate a random string)
SESSION_SECRET=your_random_session_secret

# Node environment
NODE_ENV=production

# For Replit Auth (if still needed)
REPLIT_DOMAINS=yourdomain.com
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc
```

## Deployment Options

### Option 1: Vercel

1. Fork the repository to GitHub
2. Go to [Vercel.com](https://vercel.com) and create a free account
3. Import your repository
4. Set the environment variables in the project settings
5. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option 2: Render

1. Fork the repository to GitHub
2. Go to [Render.com](https://render.com) and create a free account
3. Create a new Web Service
4. Connect your GitHub repository
5. Set the environment variables
6. Configure the build settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`

### Option 3: Railway

1. Fork the repository to GitHub
2. Go to [Railway.app](https://railway.app) and create a free account
3. Create a new project
4. Connect your GitHub repository
5. Set the environment variables
6. Railway will automatically detect the build settings

## Database Migration

After deploying, you need to run the database migration to create the tables:

1. Connect to your database using a tool like psql or the web interface
2. Run the following SQL commands to create the sessions table (if not auto-created):

```sql
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
```

3. The application will automatically create other tables on first run

## Authentication Setup

The application now supports both Replit authentication (for development) and email/password authentication (for production).

### Email Authentication

1. Users can register at `/auth` or the root path when not authenticated
2. Passwords are securely hashed using bcrypt
3. Sessions are stored in the PostgreSQL database

### Replit Authentication (Optional)

If you want to keep Replit authentication:
1. Set the REPLIT_DOMAINS environment variable
2. Set the REPL_ID environment variable
3. Set the ISSUER_URL environment variable

## Customization

### Branding

1. Update the application name in `client/src/pages/landing.tsx`
2. Update the favicon in `client/public/`
3. Update the logo in `client/src/components/layout/header.tsx`

### Email Templates

To customize email templates for registration/notifications:
1. Add email sending functionality using a service like SendGrid or Nodemailer
2. Create email templates in the `server/` directory

## Monitoring and Maintenance

### Logs

Most deployment platforms provide log viewing:
- Vercel: Dashboard > Logs
- Render: Dashboard > Logs
- Railway: Dashboard > Logs

### Backups

Set up regular database backups:
- Neon: Automatic backups included
- Supabase: Automatic backups included
- Railway: Configure through the dashboard

### Updates

To update the application:
1. Push changes to your GitHub repository
2. Most platforms will automatically redeploy
3. For manual deployment, trigger a new deployment in the dashboard

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Check your DATABASE_URL environment variable
2. **Session Errors**: Ensure SESSION_SECRET is set and is sufficiently random
3. **Build Failures**: Check that all dependencies are correctly installed

### Support

For issues with the application:
1. Check the logs for error messages
2. Verify all environment variables are correctly set
3. Ensure the database is accessible and the connection string is correct

## Scaling

### Database

- Neon and Supabase offer auto-scaling
- For high-traffic applications, consider upgrading to paid tiers

### Application

- Most platforms automatically scale based on traffic
- For Vercel, consider upgrading for more build minutes
- For Render, consider upgrading for more resources

## Security Considerations

1. Always use HTTPS in production
2. Keep your SESSION_SECRET secure and random
3. Regularly update dependencies
4. Use strong passwords for admin accounts
5. Consider adding rate limiting for authentication endpoints