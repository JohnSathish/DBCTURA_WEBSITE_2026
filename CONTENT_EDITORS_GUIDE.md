# Content Editors Architecture Guide

## Overview

This guide explains how content editors work in the Don Bosco College website, covering the complete flow from editing to rendering.

## Content Editor Types

### 1. **Pages Editor** (`/admin/pages`)
- Rich text content with TipTap
- SEO metadata (meta title, description)
- Publish/draft status
- Auto-generated slugs from titles

**Database Model**: `Page` (stored in `prisma/schema.prisma`)
```prisma
model Page {
  id             String   @id @default(cuid())
  title          String
  slug           String   @unique
  content        String   @default("")    // HTML from TipTap
  metaTitle      String?
  metaDescription String?
  published      Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### 2. **News Editor** (`/admin/news`)
- Rich text article content (TipTap)
- Featured image upload
- Excerpt (plain text summary)
- Featured flag & publish date
- Auto-generated slug from title

**Database Model**: `News`
```prisma
model News {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique           // Auto-generated
  content     String   @default("")      // HTML from TipTap
  excerpt     String?
  image       String?                    // URL to featured image
  publishedAt DateTime?
  featured    Boolean  @default(false)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3. **Other Content Types** (minimal editors)
- **Gallery**: Image uploads with albums/hierarchy
- **Downloads**: File uploads with metadata
- **Flash News**: Simple title + image
- **Testimonials**: Name, designation, testimonial text
- **Hero Slides**: Title + image + CTA link
- **Notice Board**: Year-based file organization
- **Short-Term Courses**: Title + description
- **Question Bank**: Year + department + PDF files

---

## Data Flow: Edit → Store → Render

### Step 1: Client-Side Editing

**Location**: Form component (e.g., `components/admin/pages/PageForm.tsx`)

```tsx
// React Hook Form with Zod validation
const { register, handleSubmit, watch, setValue } = useForm<PageFormData>({
  resolver: zodResolver(pageSchema),
  defaultValues: page ? { ...page } : { title: "", content: "", ... }
})

// Watch content field
const content = watch("content")

// Render TipTap editor
<RichTextEditor 
  content={content}
  onChange={(html) => setValue("content", html)}  // Update form state
/>
```

**Key Points**:
- `watch("content")` retrieves current HTML string from form state
- `setValue("content", html)` updates form state when editor changes
- TipTap fires `onUpdate` callback on every keystroke → onChange fires → setValue updates React Hook Form state
- Form validation via Zod happens on submit

### Step 2: Submit to API

**Location**: Form's `onSubmit` handler

```tsx
const onSubmit = async (data: PageFormData) => {
  const url = page ? `/api/pages/${page.id}` : "/api/pages"
  const method = page ? "PUT" : "POST"

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)  // Includes content: "<h1>...</h1>"
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error)
  }

  // Redirect on success
  router.push("/admin/pages")
  router.refresh()
}
```

**What Gets Sent**:
```json
{
  "title": "About Us",
  "slug": "about-us",
  "content": "<h1>Welcome</h1><p>This is our story...</p>",
  "metaTitle": "About Our College",
  "metaDescription": "Learn about our college's mission...",
  "published": true
}
```

### Step 3: API Validates & Stores

**Location**: `app/api/pages/route.ts` (POST) or `app/api/pages/[id]/route.ts` (PUT)

```typescript
export async function POST(request: NextRequest) {
  // 1. Check authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 2. Parse request body
    const data = await request.json()
    const { title, slug, content, metaTitle, metaDescription, published } = data

    // 3. Validate
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // 4. Store in database
    const page = await prisma.page.create({
      data: {
        title: title.trim(),
        slug,
        content,  // HTML string stored as-is
        metaTitle,
        metaDescription,
        published
      }
    })

    // 5. Return created resource
    return NextResponse.json(page)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create page" },
      { status: 400 }
    )
  }
}
```

**Important Notes**:
- `content` is **HTML string**, NOT JSON
- Stored directly in database as `content` column
- No sanitization on write (apply on read if needed)
- All API routes require `getServerSession()` check

### Step 4: Retrieve from Database

**Location**: `app/api/pages/[id]/route.ts` (GET)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const page = await prisma.page.findUnique({
      where: { id }
    })

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Returns full page object including content HTML
    return NextResponse.json(page)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
  }
}
```

**Returned Data** (loaded into form for editing):
```json
{
  "id": "abc123",
  "title": "About Us",
  "slug": "about-us",
  "content": "<h1>Welcome</h1><p>This is our story...</p>",
  "metaTitle": "About Our College",
  "metaDescription": "Learn about our college...",
  "published": true,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-30T14:22:00Z"
}
```

The form's `defaultValues` receives this data, TipTap editor loads the HTML content.

### Step 5: Render in Public Pages

**Location**: `app/[slug]/page.tsx`

```tsx
export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  // 1. Fetch published page only
  const page = await prisma.page.findUnique({
    where: { slug, published: true }
  })

  if (!page) {
    notFound()  // 404
  }

  // 2. Render HTML content
  return (
    <article>
      <h1>{page.title}</h1>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  )
}
```

**Key Points**:
- Only published pages are visible (`where: { slug, published: true }`)
- HTML from database rendered directly via `dangerouslySetInnerHTML`
- Tailwind `prose` classes style the rendered HTML
- SEO metadata generated server-side via `generateMetadata()`

---

## TipTap Integration Details

### How TipTap Connects to React Hook Form

```tsx
// 1. Initialize form with React Hook Form
const { watch, setValue } = useForm<PageFormData>({
  defaultValues: { content: "", ... }
})

// 2. Watch the content field
const content = watch("content")  // Get current value

// 3. Pass to TipTap with onChange callback
<RichTextEditor 
  content={content}
  onChange={(html) => setValue("content", html)}
/>
```

**Flow**:
1. User types in TipTap editor
2. TipTap fires `onUpdate` callback with new HTML
3. Component's `onChange` prop calls `setValue("content", html)`
4. React Hook Form updates internal state
5. Form validation runs if configured
6. On submit, new HTML is sent to API

### Content Storage Format

| Field | Format | Example |
|-------|--------|---------|
| `title` | Plain text | `"About Us"` |
| `content` | HTML string | `"<h1>Title</h1><p>Paragraph</p>"` |
| `excerpt` | Plain text | `"A brief summary..."` |
| `slug` | URL-safe | `"about-us"` |

**No JSON encoding** - content is raw HTML.

### Image Upload in Rich Text

```tsx
// User clicks image button in TipTap toolbar
const handleImageUpload = () => {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "image/*"
  
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    
    // 1. Upload to /api/uploads/news-images
    const formData = new FormData()
    formData.append("file", file)
    
    const response = await fetch("/api/uploads/news-images", {
      method: "POST",
      body: formData
    })
    
    const data = await response.json()  // { url: "/uploads/news-images/..." }
    
    // 2. Insert into editor
    editor?.chain().focus().setImage({ src: data.url }).run()
  }
  
  input.click()
}
```

**Result**: Image URL inserted into HTML as `<img src="/uploads/news-images/..." />`

---

## Common Patterns

### 1. Auto-Generating Slugs

**News slug generation** (`app/api/news/route.ts`):
```typescript
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.news.findUnique({ where: { slug } })
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug
    }
    slug = `${baseSlug}-${counter++}`  // Append number if collision
  }
}
```

Used when creating/updating: `const slug = await generateUniqueSlug(title.trim())`

### 2. Publishing Logic

**Pages**: Boolean `published` flag
```tsx
const page = await prisma.page.findUnique({
  where: { slug, published: true }  // Only show published
})
```

**News**: `publishedAt` timestamp (null = draft)
```typescript
const news = await prisma.news.findMany({
  where: { publishedAt: { not: null } },  // Only published
  orderBy: { publishedAt: "desc" }
})
```

### 3. Edit vs. Create

**Forms detect if editing**:
```tsx
export default function PageForm({ page }: { page?: Page }) {
  const onSubmit = async (data: PageFormData) => {
    const url = page ? `/api/pages/${page.id}` : "/api/pages"
    const method = page ? "PUT" : "POST"
    // ...
  }
}
```

**API endpoints handle both**:
- POST `/api/pages` - create new
- PUT `/api/pages/[id]` - update existing
- GET `/api/pages/[id]` - fetch for editing
- DELETE `/api/pages/[id]` - remove

---

## Security Considerations

### Authentication
- All **write operations** (POST, PUT, DELETE) require `getServerSession()` check
- All **admin routes** protected by middleware (`middleware.ts`)

### Input Validation
- Zod schema validation on form submit
- Additional validation in API routes
- File uploads check type and size (10MB max)

### HTML Content
- Stored as-is (no sanitization on write)
- Consider sanitizing on render if user content could be malicious
- Currently rendered with `dangerouslySetInnerHTML` and Tailwind prose styling

---

## Adding a New Content Editor

### Steps:

1. **Add Prisma model** (`prisma/schema.prisma`):
   ```prisma
   model MyContent {
     id        String   @id @default(cuid())
     title     String
     content   String   @default("")    // For TipTap
     published Boolean  @default(false)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Run migrations**:
   ```bash
   npm run db:push
   npx prisma generate
   ```

3. **Create API routes** (`app/api/my-content/`):
   - `route.ts` - GET (list) & POST (create)
   - `[id]/route.ts` - GET, PUT, DELETE (edit/delete)

4. **Create form component** (`components/admin/my-content/MyContentForm.tsx`):
   - Use React Hook Form + Zod
   - Import `RichTextEditor` for rich text
   - POST/PUT to `/api/my-content`

5. **Create admin page** (`app/admin/my-content/page.tsx`):
   - List all entries
   - Link to edit pages

6. **Create public page** (optional):
   - Render with `dangerouslySetInnerHTML` for HTML content
   - Use `generateMetadata()` for SEO

7. **Add menu item** (`components/admin/AdminLayout.tsx`):
   ```tsx
   const adminMenuItems = [
     // ...
     { href: "/admin/my-content", label: "My Content", icon: FileText },
   ]
   ```

---

## Debugging Content Issues

### "Content not saving"
- Check form validation errors in UI
- Check API response in browser DevTools Network tab
- Verify `getServerSession()` returns valid session
- Check `prisma/schema.prisma` - model may be missing

### "Images not appearing in editor"
- Verify `/api/uploads/news-images` endpoint exists
- Check file upload permissions (`public/uploads/news-images/` directory)
- Ensure API returns `{ url: "..." }` JSON response
- Check image URL is accessible in browser

### "Content HTML looks broken"
- TipTap outputs valid HTML - check if rendering logic is correct
- Verify `dangerouslySetInnerHTML` is used properly
- Check Tailwind prose classes are loaded
- Ensure CSS is not stripping HTML elements

### "Old content appears after editing"
- Verify form `defaultValues` are set from fetched data
- Check that `watch()` and `setValue()` are wired correctly
- Ensure `router.refresh()` is called after API success
- Check browser cache (clear or use incognito mode)

---

## Performance Tips

1. **For list pages**: Use `select()` to fetch only needed columns
   ```typescript
   const pages = await prisma.page.findMany({
     select: { id: true, title: true, slug: true, published: true, updatedAt: true }
   })
   ```

2. **For published content**: Cache with `revalidateTag()` or `revalidatePath()`
   ```typescript
   revalidatePath(`/${slug}`)  // Revalidate public page after edit
   ```

3. **For TipTap**: Use `immediatelyRender: false` to avoid hydration issues

4. **For images**: Optimize with Next.js Image component for public rendering

---

## File Structure Summary

```
components/admin/
├── RichTextEditor.tsx          # Shared TipTap editor
├── pages/
│   └── PageForm.tsx            # Pages editor form
└── news/
    └── NewsForm.tsx            # News editor form

app/
├── [slug]/
│   └── page.tsx                # Public page rendering
├── api/
│   ├── pages/
│   │   ├── route.ts            # GET (list), POST (create)
│   │   └── [id]/route.ts       # GET, PUT, DELETE
│   ├── news/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── uploads/
│       └── news-images/route.ts  # Image upload handler
└── admin/
    ├── pages/
    │   ├── page.tsx            # Pages list
    │   ├── new/page.tsx        # Create page
    │   └── [id]/page.tsx       # Edit page
    └── news/
        ├── page.tsx
        ├── new/page.tsx
        └── [id]/page.tsx

prisma/
└── schema.prisma               # Data models
```
