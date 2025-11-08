"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
const STREAMS = {
  Arts: ["Education", "Economics", "English", "Garo", "Geography", "Environment", "History", "Philosophy"],
  Science: ["Botany", "Chemistry", "Mathematics", "Physics", "Zoology"],
  Commerce: ["Commerce"],
}

const CATEGORY_OPTIONS = [
  { value: "teaching", label: "Teaching Staff" },
  { value: "non-teaching", label: "Non-Teaching Staff" },
  { value: "all", label: "All Categories" },
]

interface StaffProfile {
  id: string
  name: string
  designation: string
  department: string
  stream: string | null
  category: string
  photo: string | null
  createdAt: string
}

export default function StaffList() {
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStream, setFilterStream] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("teaching")

  const loadStaff = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (filterStream && filterStream !== "all") {
        params.append("stream", filterStream)
      }
      if (filterDepartment && filterDepartment !== "all") {
        params.append("department", filterDepartment)
      }
      if (filterCategory && filterCategory !== "all") {
        params.append("category", filterCategory)
      }

      const response = await fetch(`/api/staff-profiles?${params.toString()}`)
      const data = await response.json()
      setStaff(data.staff || [])
    } catch (error) {
      console.error("Error loading staff:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStream, filterDepartment, filterCategory])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff profile?")) return

    try {
      const response = await fetch(`/api/staff-profiles/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadStaff()
      } else {
        alert("Failed to delete staff profile")
      }
    } catch (error) {
      alert("Error deleting staff profile")
    }
  }

  const allDepartments = Object.values(STREAMS).flat()
  const disableStreamFilters = filterCategory === "non-teaching"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Profiles</h1>
          <p className="text-gray-600 mt-2">Manage teaching and non-teaching staff profiles</p>
        </div>
        <Link href="/admin/staff-profiles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Name or designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={filterCategory}
                onValueChange={(value) => {
                  setFilterCategory(value)
                  if (value === "non-teaching") {
                    setFilterStream("all")
                    setFilterDepartment("all")
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stream</Label>
              <Select
                value={filterStream}
                onValueChange={setFilterStream}
                disabled={disableStreamFilters}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All streams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All streams</SelectItem>
                  {Object.keys(STREAMS).map((stream) => (
                    <SelectItem key={stream} value={stream}>
                      {stream}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select
                value={filterDepartment}
                onValueChange={setFilterDepartment}
                disabled={disableStreamFilters}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {allDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              {(search ||
                (filterStream && filterStream !== "all") ||
                (filterDepartment && filterDepartment !== "all") ||
                (filterCategory && filterCategory !== "teaching")) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    setFilterStream("all")
                    setFilterDepartment("all")
                    setFilterCategory("teaching")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No staff profiles found. Create your first one!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department / Unit</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      {member.photo ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={member.photo}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No photo</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.designation}</TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>
                      {member.stream ? <Badge variant="outline">{member.stream}</Badge> : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.category === "teaching" ? "outline" : "secondary"}>
                        {member.category === "teaching" ? "Teaching" : "Non-Teaching"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/staff-profiles/${member.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

