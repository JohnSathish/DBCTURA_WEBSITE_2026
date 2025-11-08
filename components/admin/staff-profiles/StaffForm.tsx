"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

const STREAMS = {
  Arts: ["Education", "Economics", "English", "Garo", "Geography", "Environment", "History", "Philosophy"],
  Science: ["Botany", "Chemistry", "Mathematics", "Physics", "Zoology"],
  Commerce: ["Commerce"],
}

const CATEGORY_OPTIONS = [
  { value: "teaching", label: "Teaching Staff" },
  { value: "non-teaching", label: "Non-Teaching Staff" },
]

const NON_TEACHING_SUGGESTIONS = [
  "Administrative Office",
  "Accounts Section",
  "Library Staff",
  "Laboratory Assistant",
  "Technical Support",
  "Maintenance & Support",
  "Security",
]

interface StaffFormProps {
  initialData?: {
    id: string
    name: string
    designation: string
    department: string
    stream: string | null
    category: string
    photo: string | null
  }
}

export default function StaffForm({ initialData }: StaffFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    designation: initialData?.designation || "",
    department: initialData?.department || "",
    stream: initialData?.stream || "",
    category: initialData?.category || "teaching",
    photo: initialData?.photo || "",
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isTeaching = formData.category === "teaching"

  const handleStreamChange = (stream: string) => {
    setFormData((prev) => ({
      ...prev,
      stream,
      department: "",
    }))
  }

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
      stream: category === "teaching" ? prev.stream : "",
      department: category === "teaching" ? "" : prev.department,
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/uploads/staff", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setFormData((prev) => ({ ...prev, photo: data.url }))
      setPhotoPreview(data.url)
    } catch (error) {
      alert("Failed to upload photo")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.name.trim()) {
      alert("Please enter staff name")
      return
    }

    if (!formData.designation || !formData.designation.trim()) {
      alert("Please enter designation")
      return
    }

    if (isTeaching) {
      if (!formData.stream) {
        alert("Please select a stream")
        return
      }
      if (!formData.department) {
        alert("Please select a department")
        return
      }
    } else if (!formData.department || !formData.department.trim()) {
      alert("Please enter a department or unit")
      return
    }

    setLoading(true)

    try {
      const url = initialData ? `/api/staff-profiles/${initialData.id}` : "/api/staff-profiles"
      const method = initialData ? "PUT" : "POST"

      const payload = {
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        stream: isTeaching ? formData.stream : null,
        category: formData.category,
        photo: formData.photo || null,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save")
      }

      router.push("/admin/staff-profiles")
    } catch (error: any) {
      alert(error.message || "Failed to save staff profile")
    } finally {
      setLoading(false)
    }
  }

  const availableDepartments = formData.stream
    ? STREAMS[formData.stream as keyof typeof STREAMS] || []
    : []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {initialData ? "Edit Staff Profile" : "Add Staff Profile"}
          </h1>
          <p className="text-gray-600 mt-2">
            {initialData ? "Update staff information" : "Create a new staff profile"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Staff Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Professor, Office Assistant, Lab Technician"
                  required
                />
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
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
                <Label htmlFor="stream">Stream {isTeaching ? "*" : "(Teaching only)"}</Label>
                <Select
                  value={formData.stream}
                  onValueChange={handleStreamChange}
                  disabled={!isTeaching}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isTeaching ? "Select stream" : "Not required"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STREAMS).map((stream) => (
                      <SelectItem key={stream} value={stream}>
                        {stream}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">{isTeaching ? "Department *" : "Department / Unit *"}</Label>
                {isTeaching ? (
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    disabled={!formData.stream}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g., Administrative Office, Accounts Section"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested units: {NON_TEACHING_SUGGESTIONS.join(", ")}
                    </p>
                  </>
                )}
                {isTeaching && !formData.stream && (
                  <p className="text-sm text-gray-500 mt-1">Please select a stream first</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Staff Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {photoPreview ? (
                <div className="relative">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={photoPreview}
                      alt="Staff photo preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => {
                      setPhotoPreview(null)
                      setFormData((prev) => ({ ...prev, photo: "" }))
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">No photo uploaded</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {!photoPreview && (
                <p className="text-xs text-gray-500 text-center">
                  Recommended: Square image, max 5MB
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Staff Profile"
          )}
        </Button>
      </div>
    </form>
  )
}

