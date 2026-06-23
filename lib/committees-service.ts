import { prisma } from "@/lib/prisma"
import { slugifyCommitteeName } from "@/lib/committee-utils"
import {
  COMMITTEES,
  COMMITTEES_ACADEMIC_YEAR,
  EX_OFFICIO_MEMBERS,
} from "@/lib/committees-seed-data"

export async function getCommitteeMeta() {
  let meta = await prisma.committeeMeta.findUnique({ where: { id: "default" } })
  if (!meta) {
    meta = await prisma.committeeMeta.create({
      data: { id: "default", academicYear: COMMITTEES_ACADEMIC_YEAR, published: true },
    })
  }
  return meta
}

export async function getExOfficioMembers() {
  return prisma.committeeExOfficio.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  })
}

export async function getCommittees(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts ?? false
  return prisma.committee.findMany({
    where: includeDrafts ? undefined : { published: true },
    include: {
      members: {
        orderBy: [{ displayOrder: "asc" }, { slNo: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  })
}

export async function seedCommittees(replace = false) {
  if (replace) {
    await prisma.committeeMember.deleteMany()
    await prisma.committee.deleteMany()
    await prisma.committeeExOfficio.deleteMany()
  }

  const existingCount = await prisma.committee.count()
  if (existingCount > 0 && !replace) {
    return { skipped: true, created: 0, message: "Committees already exist. Use replace=true to re-seed." }
  }

  await prisma.committeeMeta.upsert({
    where: { id: "default" },
    create: { id: "default", academicYear: COMMITTEES_ACADEMIC_YEAR, published: true },
    update: { academicYear: COMMITTEES_ACADEMIC_YEAR, published: true },
  })

  for (let i = 0; i < EX_OFFICIO_MEMBERS.length; i++) {
    const m = EX_OFFICIO_MEMBERS[i]
    await prisma.committeeExOfficio.create({
      data: { name: m.name, role: m.role, displayOrder: i },
    })
  }

  let created = 0
  for (let i = 0; i < COMMITTEES.length; i++) {
    const c = COMMITTEES[i]
    const baseSlug = slugifyCommitteeName(c.name)
    let slug = baseSlug
    let suffix = 1
    while (await prisma.committee.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    await prisma.committee.create({
      data: {
        name: c.name,
        slug,
        description: c.description,
        displayOrder: i,
        published: true,
        members: {
          create: c.members.map((m, idx) => ({
            slNo: m.slNo ?? null,
            name: m.name,
            role: m.role ?? null,
            displayOrder: idx,
          })),
        },
      },
    })
    created++
  }

  return { skipped: false, created, message: `Seeded ${created} committees.` }
}
