"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminCellActions, adminCellClamp, adminCellWrap } from "@/components/admin/admin-table-classes"
import {
  Database,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react"

type ExOfficioRow = { name: string; role: string; displayOrder?: number }
type MemberRow = { slNo?: number | null; name: string; role?: string | null; displayOrder?: number }

type CommitteeRecord = {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
  published: boolean
  members: Array<{
    id: string
    slNo: number | null
    name: string
    role: string | null
    displayOrder: number
  }>
}

type MetaState = {
  academicYear: string
  published: boolean
  exOfficio: ExOfficioRow[]
}

const emptyMember = (): MemberRow => ({ slNo: null, name: "", role: "" })

export default function CommitteeManager() {
  const [loading, setLoading] = useState(true)
  const [savingMeta, setSavingMeta] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [committees, setCommittees] = useState<CommitteeRecord[]>([])
  const [meta, setMeta] = useState<MetaState>({
    academicYear: "2026 – 2027",
    published: true,
    exOfficio: [],
  })
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    published: true,
    displayOrder: 0,
    members: [] as MemberRow[],
  })
  const [savingEdit, setSavingEdit] = useState(false)

  const notify = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 4000)
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [listRes, metaRes] = await Promise.all([
        fetch("/api/committees?includeDrafts=1"),
        fetch("/api/committees/meta"),
      ])
      if (!listRes.ok) throw new Error("Failed to load committees")
      if (!metaRes.ok) throw new Error("Failed to load settings")

      const listData = await listRes.json()
      const metaData = await metaRes.json()

      setCommittees(listData.committees || [])
      setMeta({
        academicYear: metaData.meta?.academicYear || "2026 – 2027",
        published: metaData.meta?.published ?? true,
        exOfficio: (metaData.exOfficio || []).map(
          (m: { name: string; role: string; displayOrder: number }) => ({
            name: m.name,
            role: m.role,
            displayOrder: m.displayOrder,
          })
        ),
      })
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return committees
    return committees.filter((c) => c.name.toLowerCase().includes(q))
  }, [committees, search])

  const stats = useMemo(
    () => ({
      total: committees.length,
      published: committees.filter((c) => c.published).length,
      members: committees.reduce((n, c) => n + c.members.length, 0),
    }),
    [committees]
  )

  const saveMeta = async () => {
    setSavingMeta(true)
    try {
      const res = await fetch("/api/committees/meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Save failed")
      notify("Page settings saved")
      await loadAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSavingMeta(false)
    }
  }

  const runSeed = async (replace: boolean) => {
    if (
      replace &&
      !confirm("This will delete all existing committees and re-import the default list. Continue?")
    ) {
      return
    }
    setSeeding(true)
    try {
      const res = await fetch("/api/committees/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replace }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Seed failed")
      notify(data.message || "Seed completed")
      await loadAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to seed committees")
    } finally {
      setSeeding(false)
    }
  }

  const openCreate = () => {
    setEditId(null)
    setEditForm({
      name: "",
      description: "",
      published: true,
      displayOrder: committees.length,
      members: [emptyMember()],
    })
    setEditOpen(true)
  }

  const openEdit = (c: CommitteeRecord) => {
    setEditId(c.id)
    setEditForm({
      name: c.name,
      description: c.description || "",
      published: c.published,
      displayOrder: c.displayOrder,
      members: c.members.map((m) => ({
        slNo: m.slNo,
        name: m.name,
        role: m.role || "",
        displayOrder: m.displayOrder,
      })),
    })
    setEditOpen(true)
  }

  const saveCommittee = async () => {
    if (!editForm.name.trim()) {
      setError("Committee name is required")
      return
    }
    const members = editForm.members.filter((m) => m.name.trim())
    setSavingEdit(true)
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        published: editForm.published,
        displayOrder: editForm.displayOrder,
        members: members.map((m, idx) => ({
          slNo: m.slNo ?? idx + 1,
          name: m.name.trim(),
          role: m.role?.trim() || null,
          displayOrder: idx,
        })),
      }
      const res = await fetch(editId ? `/api/committees/${editId}` : "/api/committees", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Save failed")
      notify(editId ? "Committee updated" : "Committee created")
      setEditOpen(false)
      await loadAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save committee")
    } finally {
      setSavingEdit(false)
    }
  }

  const deleteCommittee = async (id: string, name: string) => {
    if (!confirm(`Delete committee "${name}"?`)) return
    try {
      const res = await fetch(`/api/committees/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      notify("Committee deleted")
      await loadAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const togglePublished = async (c: CommitteeRecord) => {
    try {
      const res = await fetch(`/api/committees/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: c.name,
          description: c.description,
          published: !c.published,
          displayOrder: c.displayOrder,
          members: c.members.map((m, idx) => ({
            slNo: m.slNo,
            name: m.name,
            role: m.role,
            displayOrder: idx,
          })),
        }),
      })
      if (!res.ok) throw new Error("Update failed")
      await loadAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  const updateMember = (idx: number, field: keyof MemberRow, value: string | number | null) => {
    setEditForm((prev) => {
      const members = [...prev.members]
      members[idx] = { ...members[idx], [field]: value }
      return { ...prev, members }
    })
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total committees</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Published</p>
            <p className="text-2xl font-bold text-green-700">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total members listed</p>
            <p className="text-2xl font-bold">{stats.members}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="committees">
        <TabsList>
          <TabsTrigger value="committees">Committees</TabsTrigger>
          <TabsTrigger value="settings">Page Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Committees Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={meta.academicYear}
                    onChange={(e) => setMeta((m) => ({ ...m, academicYear: e.target.value }))}
                    placeholder="2026 – 2027"
                  />
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <Switch
                    id="pagePublished"
                    checked={meta.published}
                    onCheckedChange={(v) => setMeta((m) => ({ ...m, published: v }))}
                  />
                  <Label htmlFor="pagePublished">Publish committees page publicly</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Ex-officio Members
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMeta((m) => ({
                        ...m,
                        exOfficio: [...m.exOfficio, { name: "", role: "" }],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
                {meta.exOfficio.map((row, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <Input
                      value={row.name}
                      onChange={(e) =>
                        setMeta((m) => {
                          const exOfficio = [...m.exOfficio]
                          exOfficio[idx] = { ...exOfficio[idx], name: e.target.value }
                          return { ...m, exOfficio }
                        })
                      }
                      placeholder="Name"
                    />
                    <Input
                      value={row.role}
                      onChange={(e) =>
                        setMeta((m) => {
                          const exOfficio = [...m.exOfficio]
                          exOfficio[idx] = { ...exOfficio[idx], role: e.target.value }
                          return { ...m, exOfficio }
                        })
                      }
                      placeholder="Role / Designation"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setMeta((m) => ({
                          ...m,
                          exOfficio: m.exOfficio.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={saveMeta} disabled={savingMeta}>
                  {savingMeta ? "Saving..." : "Save Settings"}
                </Button>
                <Button type="button" variant="outline" onClick={() => runSeed(false)} disabled={seeding}>
                  <Database className="mr-2 h-4 w-4" />
                  Import Default Data
                </Button>
                <Button type="button" variant="outline" onClick={() => runSeed(true)} disabled={seeding}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset & Re-import
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="committees" className="space-y-4 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search committees..."
              className="max-w-sm"
            />
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Committee
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Committee</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                          No committees yet. Use Import Default Data in Page Settings.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-slate-500">{c.displayOrder + 1}</TableCell>
                          <TableCell className={`font-medium ${adminCellWrap}`}>
                            <span className={adminCellClamp}>{c.name}</span>
                          </TableCell>
                          <TableCell>{c.members.length}</TableCell>
                          <TableCell>
                            <Badge variant={c.published ? "default" : "secondary"}>
                              {c.published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right ${adminCellActions}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePublished(c)}
                              title="Toggle publish"
                            >
                              {c.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteCommittee(c.id, c.name)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Committee" : "Add Committee"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Committee Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editForm.displayOrder}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, displayOrder: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <Switch
                  checked={editForm.published}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, published: v }))}
                />
                <Label>Published</Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Members</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditForm((f) => ({
                      ...f,
                      members: [...f.members, emptyMember()],
                    }))
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Member
                </Button>
              </div>
              {editForm.members.map((member, idx) => (
                <div key={idx} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[64px_1fr_1fr_auto]">
                  <Input
                    type="number"
                    placeholder="Sl."
                    value={member.slNo ?? ""}
                    onChange={(e) =>
                      updateMember(idx, "slNo", e.target.value ? Number(e.target.value) : null)
                    }
                  />
                  <Input
                    value={member.name}
                    onChange={(e) => updateMember(idx, "name", e.target.value)}
                    placeholder="Name"
                  />
                  <Input
                    value={member.role || ""}
                    onChange={(e) => updateMember(idx, "role", e.target.value)}
                    placeholder="Role"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setEditForm((f) => ({
                        ...f,
                        members: f.members.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCommittee} disabled={savingEdit}>
              {savingEdit ? "Saving..." : "Save Committee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
