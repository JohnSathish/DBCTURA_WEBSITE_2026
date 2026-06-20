"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { COURSE_CATALOG, CourseCode } from "@/lib/courseCatalog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

const formSchema = z.object({
  studentName: z.string().min(2, "Full Name is required"),
  mobile: z.string().min(10, "Mobile is required"),
  email: z.string().email("Valid email required"),
  courseCode: z.enum(["CAFA", "BCCS", "ELPC", "BCCH", "BCTE"]),
  batchNo: z.enum(["1", "2", "3"]),
  department: z.string().optional(),
  mode: z.enum(["online", "offline"]),
  message: z.string().optional(),
})

type FormData = z.input<typeof formSchema>

export default function CourseApplyForm({ initialCourseCode }: { initialCourseCode: CourseCode | null }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [successNo, setSuccessNo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const defaultCourse = (initialCourseCode || "BCCS") as FormData["courseCode"]
  const currentYear = new Date().getFullYear()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      studentName: "",
      mobile: "",
      email: "",
      courseCode: defaultCourse,
      batchNo: "1",
      department: "",
      mode: "online",
      message: "",
    },
  })

  const courseCode = watch("courseCode")
  const courseName = useMemo(() => COURSE_CATALOG[courseCode], [courseCode])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/course-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: data.studentName,
          mobile: data.mobile,
          email: data.email,
          course_code: data.courseCode,
          course_name: COURSE_CATALOG[data.courseCode],
          batchYear: currentYear,
          batchNo: Number(data.batchNo),
          department: data.department || null,
          mode: data.mode,
          message: data.message || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to submit application")
      setSuccessNo(String(json?.applicationNo || ""))
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  if (successNo) {
    return (
      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Application submitted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">
            Thank you. Your application number is{" "}
            <span className="font-semibold text-slate-900">{successNo}</span>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button className="rounded-xl" onClick={() => window.location.reload()}>
              Submit another
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="rounded-3xl border-slate-200 shadow-sm shadow-slate-900/5">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Apply / Enquire</CardTitle>
            <Link href="/">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Course</div>
            <div className="mt-1 text-base font-bold text-slate-900">{courseName}</div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="studentName">Full Name *</Label>
              <Input id="studentName" {...register("studentName")} className="rounded-xl" />
              {errors.studentName ? <p className="text-sm text-red-600">{errors.studentName.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input id="mobile" {...register("mobile")} className="rounded-xl" />
              {errors.mobile ? <p className="text-sm text-red-600">{errors.mobile.message}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...register("email")} className="rounded-xl" />
              {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Course Name *</Label>
              <Select value={courseCode} onValueChange={(v) => setValue("courseCode", v as any, { shouldValidate: true })}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(COURSE_CATALOG) as Array<FormData["courseCode"]>).map((code) => (
                    <SelectItem key={code} value={code}>
                      {COURSE_CATALOG[code]} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Batch Year</Label>
              <Input value={currentYear} readOnly className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Batch *</Label>
              <Select value={watch("batchNo")} onValueChange={(v) => setValue("batchNo", v as any, { shouldValidate: true })}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Batch 1</SelectItem>
                  <SelectItem value="2">Batch 2</SelectItem>
                  <SelectItem value="3">Batch 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Department (optional)</Label>
              <Select
                value={watch("department") || ""}
                onValueChange={(v) => setValue("department", v === "__none" ? "" : v)}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Not specified</SelectItem>
                  <SelectItem value="ECONOMICS">ECONOMICS</SelectItem>
                  <SelectItem value="BOTANY">BOTANY</SelectItem>
                  <SelectItem value="CHEMISTRY">CHEMISTRY</SelectItem>
                  <SelectItem value="COMMERCE">COMMERCE</SelectItem>
                  <SelectItem value="GEOGRAPHY">GEOGRAPHY</SelectItem>
                  <SelectItem value="ENGLISH">ENGLISH</SelectItem>
                  <SelectItem value="GARO">GARO</SelectItem>
                  <SelectItem value="EDUCATION">EDUCATION</SelectItem>
                  <SelectItem value="ZOOLOGY">ZOOLOGY</SelectItem>
                  <SelectItem value="HISTORY">HISTORY</SelectItem>
                  <SelectItem value="MATHEMATICS">MATHEMATICS</SelectItem>
                  <SelectItem value="PHILOSOPHY">PHILOSOPHY</SelectItem>
                  <SelectItem value="PHYSICS">PHYSICS</SelectItem>
                  <SelectItem value="POLITICAL SCIENCE">POLITICAL SCIENCE</SelectItem>
                  <SelectItem value="SOCIOLOGY">SOCIOLOGY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mode *</Label>
            <Select value={watch("mode")} onValueChange={(v) => setValue("mode", v as any, { shouldValidate: true })}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {watch("mode") === "online" ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Students must have a laptop or PC to opt for online mode.
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" rows={4} {...register("message")} className="rounded-xl" />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-xl bg-brand-navy hover:bg-brand-navy-deep" disabled={!isValid || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit"
              )}
            </Button>
            <Link href="/short-term-courses" className="inline-flex">
              <Button type="button" variant="outline" className="rounded-xl">
                View all courses
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

