"use client"

import { useEffect, useMemo, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Eye, EyeOff, HelpCircle, Loader2, Lock, Mail, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

function makeChallenge() {
  const a = Math.floor(Math.random() * 9) + 1 // 1..9
  const b = Math.floor(Math.random() * 9) + 1 // 1..9
  return { a, b, answer: a + b }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // Important: don't generate random values during SSR render (hydration mismatch).
  // We'll set a stable default and randomize after mount.
  const [challenge, setChallenge] = useState(() => ({ a: 1, b: 1, answer: 2 }))
  const [challengeInput, setChallengeInput] = useState("")
  const [humanChecked, setHumanChecked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    setChallenge(makeChallenge())
    try {
      const savedEmail = localStorage.getItem("dbc_admin_email")
      const savedRemember = localStorage.getItem("dbc_admin_remember_me")
      if (savedRemember === "0") setRememberMe(false)
      if (savedRemember !== "0" && savedEmail) setEmail(savedEmail)
    } catch {
      // ignore
    }
  }, [])

  const isEmailValid = useMemo(() => !!email && email.includes("@"), [email])
  const isPasswordValid = useMemo(() => password.length >= 1, [password])
  const isChallengeValid = useMemo(() => Number(challengeInput) === challenge.answer, [challengeInput, challenge.answer])
  const canSubmit = isEmailValid && isPasswordValid && humanChecked && isChallengeValid && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!humanChecked || !isChallengeValid) {
      setError("Please verify you're human to continue.")
      setChallenge(makeChallenge())
      setChallengeInput("")
      setHumanChecked(false)
      return
    }

    setLoading(true)

    try {
      try {
        localStorage.setItem("dbc_admin_remember_me", rememberMe ? "1" : "0")
        if (rememberMe) localStorage.setItem("dbc_admin_email", email)
        else localStorage.removeItem("dbc_admin_email")
      } catch {
        // ignore
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setChallenge(makeChallenge())
        setChallengeInput("")
        setHumanChecked(false)
      } else {
        router.push("/admin/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setChallenge(makeChallenge())
      setChallengeInput("")
      setHumanChecked(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left: Branding */}
        <div className="relative hidden lg:block">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(59,130,246,0.30),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(30,58,138,0.35),transparent_60%),radial-gradient(900px_circle_at_40%_90%,rgba(14,116,144,0.25),transparent_55%)] opacity-80"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.70),rgba(2,6,23,0.92))]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] [background-size:22px_22px]"
          />

          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <Image
                  src="/logo.png"
                  alt="Don Bosco College logo"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain p-1"
                  priority
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-white">Don Bosco College, Tura</div>
                <div className="truncate text-sm font-semibold text-amber-300 tracking-wide">Pursuit of Excellence</div>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                <ShieldCheck className="h-4 w-4" />
                Secure ERP / Admin Access
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                Sign in to your dashboard
              </h1>
              <p className="mt-3 text-base leading-relaxed text-white/75">
                Access administrative tools securely. Activity is monitored and protected by enhanced verification.
              </p>
            </div>

            <div className="text-xs text-white/55">
              Secured by enhanced verification and session protection.
            </div>
          </div>
        </div>

        {/* Right: Login */}
        <div className="relative flex items-center justify-center px-4 py-10 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_30%_0%,rgba(59,130,246,0.22),transparent_55%),radial-gradient(700px_circle_at_90%_30%,rgba(30,58,138,0.26),transparent_60%)]"
          />

          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-white/10 bg-white/7 backdrop-blur-xl shadow-2xl shadow-black/40">
              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-white/85 ring-1 ring-white/12">
                    <Lock className="h-4 w-4" />
                    Secure Admin Access
                  </div>
                  <Link href="/" className="text-xs font-medium text-white/70 hover:text-white underline underline-offset-4">
                    Back to website
                  </Link>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">Admin Login</CardTitle>
                <CardDescription className="text-white/65">Don Bosco College, Tura</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email (floating) */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55" />
                      <Input
                        id="email"
                        type="email"
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        autoFocus
                        className={cn(
                          "peer h-12 rounded-xl border-white/12 bg-white/5 pl-10 text-white placeholder:text-transparent",
                          "focus-visible:ring-2 focus-visible:ring-blue-400/30 focus-visible:border-blue-400/25"
                        )}
                      />
                      <Label
                        htmlFor="email"
                        className={cn(
                          "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-white/60 transition-all",
                          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/55",
                          "peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-white/70",
                          email ? "top-2 -translate-y-0 text-xs text-white/70" : ""
                        )}
                      >
                        Email Address
                      </Label>
                    </div>
                    {process.env.NODE_ENV === "development" ? (
                      <p className="text-xs text-white/45">
                        Use:{" "}
                        <span className="font-semibold text-white/65">admin@donboscocollege.ac.in</span>
                      </p>
                    ) : null}
                  </div>

                  {/* Password (floating + toggle) */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className={cn(
                          "peer h-12 rounded-xl border-white/12 bg-white/5 pl-10 pr-11 text-white placeholder:text-transparent",
                          "focus-visible:ring-2 focus-visible:ring-blue-400/30 focus-visible:border-blue-400/25"
                        )}
                      />
                      <Label
                        htmlFor="password"
                        className={cn(
                          "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-white/60 transition-all",
                          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/55",
                          "peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-white/70",
                          password ? "top-2 -translate-y-0 text-xs text-white/70" : ""
                        )}
                      >
                        Password
                      </Label>
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/8 transition-colors"
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={loading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember / Help */}
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-white/75">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 accent-blue-500"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      Remember me
                    </label>
                    <a
                      href="mailto:helpdesk@donboscocollege.ac.in?subject=Admin%20Login%20Help"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white underline underline-offset-4"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Helpdesk
                    </a>
                  </div>

                  {/* Human verification (captcha-style) */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setHumanChecked((v) => !v)
                            setError("")
                            setChallenge(makeChallenge())
                            setChallengeInput("")
                          }}
                          disabled={loading}
                          className={cn(
                            "grid h-6 w-6 place-items-center rounded-md border transition-colors",
                            humanChecked
                              ? "border-blue-400/40 bg-blue-500/15 text-blue-200"
                              : "border-white/15 bg-white/5 text-transparent hover:bg-white/8"
                          )}
                          aria-label="Verify you're human"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">Verify you’re human</div>
                          <div className="text-xs text-white/55">Security verification required</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-medium text-white/65 hover:text-white underline underline-offset-4"
                        onClick={() => {
                          setChallenge(makeChallenge())
                          setChallengeInput("")
                          setError("")
                          setHumanChecked(false)
                        }}
                        disabled={loading}
                      >
                        New
                      </button>
                    </div>

                    <div className={cn("mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_160px] sm:items-end", !humanChecked && "opacity-50")}>
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/80">
                        {challenge.a} + {challenge.b} = ?
                      </div>
                      <Input
                        id="safety"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Answer"
                        value={challengeInput}
                        onChange={(e) => setChallengeInput(e.target.value.replace(/[^\d]/g, ""))}
                        required
                        disabled={loading || !humanChecked}
                        className="h-11 rounded-xl border-white/12 bg-white/5 text-white placeholder:text-white/35"
                      />
                    </div>

                    {!isChallengeValid && challengeInput.length > 0 ? (
                      <p className="mt-2 text-xs text-white/60">Please enter the correct sum to continue.</p>
                    ) : null}
                  </div>

                  {error ? (
                    <div className="text-sm text-rose-200 bg-rose-500/10 border border-rose-300/15 p-3 rounded-xl">
                      {error}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className={cn(
                      "w-full h-12 rounded-xl font-semibold text-white shadow-lg shadow-blue-900/20",
                      "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-600/95 hover:to-indigo-700/95",
                      "transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    )}
                    disabled={!canSubmit}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in…
                      </span>
                    ) : (
                      "Sign In to Dashboard"
                    )}
                  </Button>

                  <div className="flex items-center justify-between gap-3 text-xs text-white/55">
                    <span>Protected by enhanced verification</span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-white/55" /> Secure
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

