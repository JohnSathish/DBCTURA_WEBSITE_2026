# Copilot Instructions for Don Bosco College Website

## Project Overview
Don Bosco College website is a Next.js 16 + TypeScript full-stack application combining a public college website with an integrated admin CMS. Single database (SQLite dev/PostgreSQL prod) with no external CMS services.

## Architecture Fundamentals

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth v4 (credentials provider, JWT sessions)
- **UI**: Tailwind CSS + Shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Content**: TipTap rich text editor, file uploads to `/public/uploads`

### Route Structure
- **Public pages**: `app/[slug]/page.tsx`, `app/(public)/about/`, etc.
- **Admin routes**: `app/admin/*` (protected by middleware)
- **APIs**: `app/api/*` (all require session check via `getServerSession`)
- **Dynamic routes**: Nested via `[...slug]` or `[slug]` patterns

## Critical Patterns

### Authentication & Authorization
1. All admin API routes check session first:
   ```typescript
   const session = await getServerSession(authOptions)
   if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
   ```
2. Admin UI routes protected by middleware (`middleware.ts`) redirecting to `/admin/login`
3. JWT stored in token with user `id` and `role` fields
4. Default admin: `admin@donbosco.edu.in` (set via seed script)

### API Response Patterns
- Success: `NextResponse.json(data)`
- Errors: `NextResponse.json({ error: "message" }, { status: code })`
- Common status codes: 401 (unauthorized), 400 (validation), 503 (model not initialized), 500 (server errors)
- **Critical**: When Prisma models not found, return 503 with instruction to run `npx prisma generate`

### Data Validation
- Use inline validator functions in API routes (e.g., `validateTitle()`, `validateOrder()` in navigation endpoints)
- Schema constants in routes: `const YEARS = Array.from(...); const departments = [...]`
- Validate both existence and type before processing

### File Uploads
- Handler pattern in `app/api/uploads/*` routes
- Check `session`, validate file type/size, create directories, generate timestamped filenames
- Organize by upload type: `public/uploads/news/`, `public/uploads/flash-news/`, etc.
- Max file size: 10MB (configurable via `MAX_FILE_SIZE`)

### Prisma Model Status
- Models dynamically check with `(prisma as any).modelName` before use
- If model not in schema yet, return helpful 503 error instructing `npx prisma generate`
- All new models must be added to `prisma/schema.prisma` and client regenerated

## Developer Workflows

### Setup
```bash
npm install
npm run db:push          # Push schema to database
npm run db:seed          # Create initial admin user
npm run dev              # Start dev server (localhost:3000)
```

### Database
- Seed file: `prisma/seed.ts` (run via `npm run db:seed`)
- Schema: `prisma/schema.prisma` (20+ models: User, Page, News, Gallery, Download, etc.)
- **After schema changes**: `npm run db:push && npx prisma generate`

### Development & Testing
- `npm run lint` - ESLint checks
- `npm run test` - Vitest (config in `vitest.config.ts`)
- `npm run build` - Production build
- Dev server uses hot reload; restart if Prisma changes

### Debugging
- Check `.next/types` for generated types
- Prisma client output: `lib/prisma-generated/` (auto-generated, don't edit)
- Admin routes redirect to login if session missing
- API logs: check `console.error()` statements for Prisma/file operation failures

## File Locations & Key Files
- **Auth config**: [lib/auth.ts](lib/auth.ts)
- **Middleware**: [middleware.ts](middleware.ts) (admin route protection)
- **Admin layout**: [components/admin/AdminLayout.tsx](components/admin/AdminLayout.tsx) (menu + session check)
- **Prisma schema**: [prisma/schema.prisma](prisma/schema.prisma)
- **API examples**: `app/api/pages/`, `app/api/news/`, `app/api/navigation/`
- **Validation**: [lib/validation/blood-donor.ts](lib/validation/blood-donor.ts) (Zod schemas)

## Common Tasks

### Adding a New Admin Feature
1. Add model to [prisma/schema.prisma](prisma/schema.prisma)
2. Run `npm run db:push && npx prisma generate`
3. Create API routes in `app/api/new-feature/` (GET, POST, PUT, DELETE)
4. Create admin page in `app/admin/new-feature/page.tsx`
5. Add menu item to `adminMenuItems` array in [components/admin/AdminLayout.tsx](components/admin/AdminLayout.tsx#L32)

### Uploading Files
- Use existing `/api/uploads/{type}` pattern as template
- Validate session, file type, size
- Create upload directory if missing
- Return `{ path: "/uploads/..." }` on success

### Form Handling
- Use React Hook Form + Zod for client forms
- Server actions or API route handlers for submission
- TipTap for rich text (used in Pages, News editors)

## TipTap Rich Text Editor

### Overview
[components/admin/RichTextEditor.tsx](components/admin/RichTextEditor.tsx) is the centralized rich text editor used in Pages, News, and content-heavy admin forms. It outputs HTML stored directly in database fields (`content` column in Page, News models).

### Features & Toolbar
- **Headings**: Paragraph, H1–H6 (via dropdown selector)
- **Text Formatting**: Bold, Italic, strikethrough (via StarterKit)
- **Alignment**: Left, Center, Right, Justify (TextAlign extension)
- **Lists**: Bullet and numbered lists
- **Links**: Insert/edit URLs via prompt dialog
- **Images**: Upload via `/api/uploads/news-images` endpoint (returns JSON with `url` field)
- **Prose Styling**: Uses Tailwind prose classes for default styling

### Implementation Pattern

**Component Props:**
```typescript
interface RichTextEditorProps {
  content: string         // HTML content to edit
  onChange: (content: string) => void  // Called on every edit with new HTML
}
```

**Usage in Forms** (e.g., [components/admin/pages/PageForm.tsx](components/admin/pages/PageForm.tsx)):
```typescript
const content = watch("content")  // Watch form state
<RichTextEditor content={content} onChange={(html) => setValue("content", html)} />
```

### Extensions Loaded
1. **StarterKit**: Paragraph, headings, lists, code, blockquote, hr, bold, italic, code mark, history
2. **Link**: Configurable links (openOnClick: false prevents unwanted interactions)
3. **Image**: Inline images, no Base64 (external URLs only)
4. **TextAlign**: Apply to headings and paragraphs

### Image Upload Flow
1. User clicks image button → native file input appears
2. File uploaded to `/api/uploads/news-images` via FormData
3. API validates file type (images only), checks size (10MB max)
4. Server generates timestamped filename, returns `{ url: "/uploads/news-images/..." }`
5. Editor inserts image: `editor.chain().focus().setImage({ src: data.url }).run()`

### Content Storage & Output
- Editor state is **HTML string** (not JSON); stored as-is in database
- Retrieved and rendered in public pages via `dangerouslySetInnerHTML` (sanitized at display time)
- When editing existing content, HTML is passed back to editor's `content` prop
- `onUpdate` callback fires on every keystroke; connect to form's `setValue()` for React Hook Form integration

### Common Customizations
- **Add more extensions**: Import from `@tiptap/extension-*`, add to `extensions` array
- **Change image upload endpoint**: Modify fetch URL and response handling in `handleImageUpload()`
- **Limit content height**: Adjust `min-h-[300px]` class on `EditorContent`
- **Customize toolbar**: Add/remove buttons in JSX toolbar section, chain editor commands as needed

## Codebase Conventions
- Path alias `@/*` maps to root (use `@/components`, `@/lib`, etc.)
- TypeScript strict mode enabled
- Component naming: PascalCase for React components
- API functions export named exports (GET, POST, PUT, DELETE)
- Dynamic route params are Promises: `const { id } = await params`
