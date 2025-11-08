"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Copy, Check, Folder, File, Image as ImageIcon, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FileInfo {
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
  folder: string
}

export default function FileManager() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>("")
  const [folders, setFolders] = useState<string[]>([])
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load folders on mount
  const loadFolders = useCallback(async () => {
    try {
      const response = await fetch("/api/file-manager")
      const data = await response.json()
      setFolders(data.folders || [])
      if (data.folders && data.folders.length > 0 && !selectedFolder) {
        setSelectedFolder(data.folders[0])
      }
    } catch (error) {
      console.error("Error loading folders:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedFolder])

  // Load files when folder changes
  const loadFiles = useCallback(async (folder: string) => {
    if (!folder) return
    
    try {
      const response = await fetch(`/api/file-manager?folder=${folder}`)
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error("Error loading files:", error)
    }
  }, [])

  useEffect(() => {
    loadFolders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedFolder) {
      loadFiles(selectedFolder)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setUploadedFile(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/file-manager/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      setUploadedFile(data.file)
      setUploadProgress(100)
      
      // Reload files for current month
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const currentFolder = `${year}-${month}`
      if (selectedFolder === currentFolder || !selectedFolder) {
        await loadFiles(currentFolder)
      }
      if (!folders.includes(currentFolder)) {
        await loadFolders()
      }
    } catch (error: any) {
      alert(error.message || "Failed to upload file")
    } finally {
      setUploading(false)
      setTimeout(() => {
        setUploadProgress(0)
        setUploadedFile(null)
      }, 5000)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${url}`)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      alert("Failed to copy URL")
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    }
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">File Manager</h1>
          <p className="text-gray-600 mt-2">Upload and manage files</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              className="flex-1"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Select File"}
            </Button>
          </div>

          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {uploadedFile && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                File uploaded successfully!
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={`${window.location.origin}${uploadedFile.url}`}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(uploadedFile.url)}
                >
                  {copiedUrl === uploadedFile.url ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Supported formats: Images (JPG, PNG, GIF, WEBP), PDF, DOC, DOCX, XLS, XLSX, TXT. Max size: 10MB
          </p>
        </CardContent>
      </Card>

      {/* File List Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Files</CardTitle>
            <Select value={selectedFolder} onValueChange={(value) => {
              setSelectedFolder(value)
              loadFiles(value)
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      {folder}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedFolder ? "No files in this folder" : "Select a folder to view files"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.url}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-1">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.size} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={`${window.location.origin}${file.url}`}
                          readOnly
                          className="flex-1 font-mono text-xs h-8"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(file.url)}
                        >
                          {copiedUrl === file.url ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

