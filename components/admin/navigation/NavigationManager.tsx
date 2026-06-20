 "use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus } from "lucide-react"
import { type NavigationItem } from "@/lib/navigation"
import { NAV_NO_PARENT } from "@/lib/navigation-admin"

type NavigationTreeItem = NavigationItem & {
  id: string
  order: number
  isVisible: boolean
  parentId: string | null
  children?: NavigationTreeItem[]
}

type FlatNavigationItem = NavigationTreeItem & { depth: number }

interface NavigationFormState {
  title: string
  href: string
  parentId: string | null
  order: number
  isVisible: boolean
}

const initialFormState: NavigationFormState = {
  title: "",
  href: "",
  parentId: null,
  order: 0,
  isVisible: true,
}

const convertDefaultNavigation = (
  items: NavigationItem[],
  parentId: string | null = null,
  prefix = "default"
): NavigationTreeItem[] => {
  return items.map((item, index) => {
    const id = item.id ?? `${prefix}-${index}-${item.label.replace(/\s+/g, "-").toLowerCase()}`
    return {
      id,
      label: item.label,
      href: item.href ?? null,
      order: item.order ?? index,
      isVisible: item.isVisible ?? true,
      parentId,
      children: item.children ? convertDefaultNavigation(item.children, id, `${id}`) : [],
    }
  })
}

export default function NavigationManager() {
  const [navigation, setNavigation] = useState<NavigationTreeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<NavigationFormState>(initialFormState)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationTreeItem | null>(null)
  const [editingState, setEditingState] = useState<NavigationFormState | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const flatNavigation: FlatNavigationItem[] = useMemo(() => {
    return (function flatten(items: NavigationTreeItem[], depth = 0): FlatNavigationItem[] {
      const result: FlatNavigationItem[] = []
      items.forEach((item) => {
        result.push({ ...item, depth })
        if (item.children && item.children.length > 0) {
          result.push(...flatten(item.children, depth + 1))
        }
      })
      return result
    })(navigation)
  }, [navigation])

  const parentOptions = useMemo(() => {
    const seen = new Set<string>()
    return flatNavigation
      .map((item) => ({
        value: item.id,
        label: `${"— ".repeat(item.depth)}${item.label}`,
      }))
      .filter((option) => {
        if (seen.has(option.value)) return false
        seen.add(option.value)
        return true
      })
  }, [flatNavigation])

  const getDescendantIds = (item: NavigationTreeItem | null) => {
    const ids = new Set<string>()
    if (!item || !item.children) return ids
    const stack = [...item.children]
    while (stack.length) {
      const current = stack.pop()!
      ids.add(current.id)
      if (current.children && current.children.length > 0) {
        stack.push(...current.children)
      }
    }
    return ids
  }

  const loadNavigation = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/navigation?includeHidden=true", { cache: "no-store" })
      const data = await response.json()
      if (response.ok && Array.isArray(data.items)) {
        // API returns real DB ids (includeHidden=true). Do not use defaultNavigation here — it has no ids
        // and convertDefaultNavigation would invent "db-0-*" keys, breaking PUT /api/navigation/:id.
        setNavigation(
          data.items.length
            ? convertDefaultNavigation(data.items as NavigationItem[], null, "db")
            : []
        )
      } else {
        throw new Error(data?.error || "Failed to load navigation menus")
      }
    } catch (err: any) {
      console.error("Failed to load navigation menus:", err)
      setError(err?.message || "Failed to load navigation menus")
      setNavigation([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNavigation()
  }, [])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formState.title.trim()) {
      setError("Menu title is required")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const validIds = new Set(flatNavigation.map((n) => n.id))
      let parentId: string | null = formState.parentId
      if (!parentId || parentId === "none" || parentId === NAV_NO_PARENT) {
        parentId = null
      } else if (!validIds.has(parentId)) {
        parentId = null
      }

      const response = await fetch("/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formState.title,
          href: formState.href || null,
          parentId,
          order: Number.isInteger(formState.order) ? formState.order : 0,
          isVisible: formState.isVisible,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Failed to create menu")
      }
      setFormState(initialFormState)
      await loadNavigation()
    } catch (err: any) {
      console.error("Failed to create navigation menu:", err)
      setError(err?.message || "Failed to create menu")
    } finally {
      setSaving(false)
    }
  }

  const handleEditOpen = (item: NavigationTreeItem) => {
    const validIds = new Set(flatNavigation.map((n) => n.id))
    let parentId: string | null = item.parentId || null
    if (parentId && !validIds.has(parentId)) {
      parentId = null
    }
    setEditingItem(item)
    setEditingState({
      title: item.label,
      href: item.href || "",
      parentId,
      order: item.order ?? 0,
      isVisible: item.isVisible ?? true,
    })
  }

  const handleUpdate = async () => {
    if (!editingItem || !editingState) return
    if (!editingState.title.trim()) {
      setError("Menu title is required")
      return
    }
    setEditSaving(true)
    setError(null)
    try {
      const validIds = new Set(flatNavigation.map((n) => n.id))
      let parentId: string | null = editingState.parentId
      if (!parentId || parentId === "none" || parentId === NAV_NO_PARENT) {
        parentId = null
      } else if (!validIds.has(parentId)) {
        parentId = null
      }

      const response = await fetch(`/api/navigation/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingState.title,
          href: editingState.href || null,
          parentId,
          order: Number.isInteger(editingState.order) ? editingState.order : 0,
          isVisible: editingState.isVisible,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update menu")
      }
      setEditingItem(null)
      setEditingState(null)
      await loadNavigation()
    } catch (err: any) {
      console.error("Failed to update navigation menu:", err)
      setError(err?.message || "Failed to update menu")
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (item: NavigationTreeItem) => {
    const confirmed = confirm(
      `Delete "${item.label}"${item.children && item.children.length > 0 ? " and all sub-menus" : ""}?`
    )
    if (!confirmed) return

    try {
      const response = await fetch(`/api/navigation/${item.id}`, {
        method: "DELETE",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete menu")
      }
      await loadNavigation()
    } catch (err: any) {
      console.error("Failed to delete navigation menu:", err)
      setError(err?.message || "Failed to delete menu")
    }
  }

  const handleSeedDefault = async () => {
    if (!confirm("Import the full default site menu into the database? You can edit or remove items afterward.")) {
      return
    }
    setSeeding(true)
    setError(null)
    try {
      const response = await fetch("/api/navigation/seed-default", { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Import failed")
      }
      await loadNavigation()
    } catch (err: any) {
      console.error("Seed default navigation:", err)
      setError(err?.message || "Failed to import default navigation")
    } finally {
      setSeeding(false)
    }
  }

  const handleToggleVisibility = async (item: NavigationTreeItem) => {
    try {
      const response = await fetch(`/api/navigation/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isVisible: !(item.isVisible ?? true),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update visibility")
      }
      await loadNavigation()
    } catch (err: any) {
      console.error("Failed to toggle visibility:", err)
      setError(err?.message || "Failed to update visibility")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Navigation Manager</h1>
          <p className="text-gray-600 mt-2">
            Create, update, or reorder the main navigation menus and sub-menus for the website.
          </p>
        </div>
      </div>

      {!loading && navigation.length === 0 ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-950 shadow-sm">
          <p className="font-semibold">No navigation rows in the database yet</p>
          <p className="mt-1.5 text-blue-900/90">
            This screen only lists <span className="font-medium">saved</span> menu items. Until you import or add them
            here, the table stays empty — the live site may still show the built-in menu from code.
          </p>
          <Button type="button" className="mt-4" onClick={handleSeedDefault} disabled={seeding}>
            {seeding ? "Importing…" : "Import default navigation"}
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Add New Menu Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Menu Title *</Label>
              <Input
                id="title"
                value={formState.title}
                onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Menu title"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="href">URL / Path</Label>
              <Input
                id="href"
                value={formState.href}
                onChange={(e) => setFormState((prev) => ({ ...prev, href: e.target.value }))}
                placeholder="/some-page"
              />
            </div>
            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formState.order}
                onChange={(e) => setFormState((prev) => ({ ...prev, order: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Parent Menu</Label>
              <Select
                value={formState.parentId ?? NAV_NO_PARENT}
                onValueChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    parentId: value === NAV_NO_PARENT ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Top-level (no parent)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NAV_NO_PARENT}>Top-level (no parent)</SelectItem>
                  {parentOptions.map((option, index) => (
                    <SelectItem key={`${option.value}-${index}`} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Choose a parent to create a sub-menu. Leave blank for top-level menu items.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formState.isVisible}
                onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isVisible: checked }))}
                id="is-visible"
              />
              <Label htmlFor="is-visible">Visible</Label>
            </div>
            <div className="md:col-span-5 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Menu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading navigation menus...</div>
          ) : navigation.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No rows yet. Use <span className="font-medium text-gray-700">Import default navigation</span> above, or
              add a menu item with the form.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>URL / Path</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatNavigation.map((item, index) => (
                    <TableRow key={`${item.id}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.depth > 0 && (
                            <span className="text-gray-300">
                              {"—".repeat(item.depth)}
                            </span>
                          )}
                          <span className="font-medium text-gray-900">{item.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.href ? (
                          <Badge variant="outline">{item.href}</Badge>
                        ) : (
                          <span className="text-xs text-gray-400">No link</span>
                        )}
                      </TableCell>
                      <TableCell>{item.order ?? 0}</TableCell>
                      <TableCell>
                        {item.parentId
                          ? flatNavigation.find((parent) => parent.id === item.parentId)?.label || "—"
                          : "Top-level"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.isVisible ?? true}
                          onCheckedChange={() => handleToggleVisibility(item)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={editingItem?.id === item.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingItem(null)
                                setEditingState(null)
                              } else {
                                handleEditOpen(item)
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Menu</DialogTitle>
                              </DialogHeader>
                              {editingState && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-title">Menu Title *</Label>
                                    <Input
                                      id="edit-title"
                                      value={editingState.title}
                                      onChange={(e) =>
                                        setEditingState((prev) =>
                                          prev ? { ...prev, title: e.target.value } : prev
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-href">URL / Path</Label>
                                    <Input
                                      id="edit-href"
                                      value={editingState.href}
                                      onChange={(e) =>
                                        setEditingState((prev) =>
                                          prev ? { ...prev, href: e.target.value } : prev
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-order">Display Order</Label>
                                    <Input
                                      id="edit-order"
                                      type="number"
                                      value={editingState.order}
                                      onChange={(e) =>
                                        setEditingState((prev) =>
                                          prev ? { ...prev, order: Number(e.target.value) } : prev
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label>Parent Menu</Label>
                                    {(() => {
                                      const excluded = getDescendantIds(item)
                                      excluded.add(item.id)
                                      return (
                                        <Select
                                          value={editingState.parentId ?? NAV_NO_PARENT}
                                          onValueChange={(value) =>
                                            setEditingState((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    parentId: value === NAV_NO_PARENT ? null : value,
                                                  }
                                                : prev
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Top-level (no parent)" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value={NAV_NO_PARENT}>Top-level (no parent)</SelectItem>
                                            {parentOptions
                                              .filter((option) => !excluded.has(option.value))
                                              .map((option, index) => (
                                                <SelectItem key={`${option.value}-${index}`} value={option.value}>
                                                  {option.label}
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      )
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Switch
                                      checked={editingState.isVisible}
                                      onCheckedChange={(checked) =>
                                        setEditingState((prev) => (prev ? { ...prev, isVisible: checked } : prev))
                                      }
                                      id="edit-visible"
                                    />
                                    <Label htmlFor="edit-visible">Visible</Label>
                                  </div>
                                </div>
                              )}
                              <DialogFooter className="mt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingItem(null)
                                    setEditingState(null)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button type="button" onClick={handleUpdate} disabled={editSaving}>
                                  {editSaving ? "Saving..." : "Save Changes"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

