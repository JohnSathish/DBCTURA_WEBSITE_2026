export type CommitteeMemberSeed = {
  slNo?: number | null
  name: string
  role?: string | null
}

export type CommitteeSeed = {
  name: string
  description: string
  members: CommitteeMemberSeed[]
}

export function slugifyCommitteeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
}
