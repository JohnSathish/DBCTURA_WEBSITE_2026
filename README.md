# Don Bosco College, Tura - Website with CMS

A modern, fully-featured college website with an integrated content management system built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## Features

- **Public Website**
  - Responsive design matching Kristu Jayanti style
  - Dynamic pages (About, Administration, Academics, Campus, AQAR, Student Services, Clubs)
  - News system with articles and categories
  - Image gallery with categories
  - Downloads section
  - Mobile-friendly navigation

- **Integrated Admin Panel**
  - Fully integrated CMS (no external services required)
  - Mobile-responsive admin interface
  - Pages management with rich text editor
  - News management with featured articles
  - Gallery management
  - Downloads management
  - Secure authentication

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: Next-Auth
- **Rich Text Editor**: TipTap
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd donbosco
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production-min-32-chars"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./public/uploads"
```

4. Generate Prisma Client and push database schema:
```bash
npm run db:push
```

5. Seed the database with initial admin user:
```bash
npm run db:seed
```

The default admin credentials are:
- Email: `admin@donboscocollege.ac.in`
- Password: `admin123` (or set `ADMIN_PASSWORD` when seeding)

**⚠️ Important**: Change the default password immediately after first login!

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

- Admin Login: `/admin/login`
- Admin Dashboard: `/admin/dashboard`

## Project Structure

```
donbosco/
├── app/
│   ├── (public)/          # Public website pages
│   ├── admin/             # Admin panel (protected)
│   ├── api/               # API routes
│   └── [slug]/           # Dynamic pages
├── components/
│   ├── admin/            # Admin components
│   ├── layout/           # Header, Footer
│   └── ui/               # Shadcn UI components
├── lib/                  # Utilities, Prisma client, Auth
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with initial data

## Features Implemented

✅ Project setup with Next.js 14, TypeScript, Tailwind CSS
✅ Database schema with Prisma (User, Page, News, GalleryImage, Download, Setting)
✅ Authentication system with Next-Auth
✅ Admin panel with mobile-responsive design
✅ Pages management (CRUD operations)
✅ News management (CRUD operations)
✅ Rich text editor for content creation
✅ Public website with responsive layout
✅ Dynamic page routing
✅ News listing and detail pages
✅ Gallery and Downloads pages
✅ Homepage with hero section and quick links

## Next Steps / Enhancements

- [ ] File upload functionality for images and downloads
- [ ] Image optimization and processing
- [ ] Advanced gallery with drag-and-drop reordering
- [ ] Search functionality
- [ ] Email notifications
- [ ] Analytics integration
- [ ] Sitemap generation
- [ ] RSS feed for news

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

For production, update:
- `DATABASE_URL` to PostgreSQL connection string
- `NEXTAUTH_SECRET` to a secure random string
- `NEXTAUTH_URL` to your production URL

### Database Migration

For production, switch to PostgreSQL:
1. Update `DATABASE_URL` in `.env`
2. Update `prisma/schema.prisma` datasource provider to `postgresql`
3. Run `npx prisma migrate deploy`

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
