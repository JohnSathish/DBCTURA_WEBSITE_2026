"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const tabs = [
  {
    id: "home",
    label: "Home",
    content: (
      <div className="space-y-4">
        <p>
          The college library has a collection of <strong>26,558 volumes</strong> and <strong>15 journals</strong>.
          The reading room of 1300 sq. ft., with its atmosphere of peace and quiet, is an invitation to staff and
          students to enrich themselves by seeking information, knowledge and wisdom. The library offers additional
          services like Photostat, Internet, Question and Answer Banks.
        </p>
        <p>
          The library remains open from <strong>9.00 a.m. to 3.00 p.m.</strong> on all working days. Library usage is compulsory.
          Library footfall is regularly monitored and the individual student record of library usage will be monitored
          by the library staff. Library books are issued on production of identity and library cards. Before leaving the
          library students are advised to verify the issue and return records on their library cards.
        </p>
        <p>
          Great care should be taken not to delay the return of books beyond the due date. Fines are levied for delayed
          return of books. Library has awards for Best Library User.
        </p>
      </div>
    ),
  },
  { id: "about", label: "About Us", content: <Placeholder title="About Us" /> },
  { id: "rules", label: "Rules", content: <Placeholder title="Rules" /> },
  { id: "policy", label: "Policy", content: <Placeholder title="Policy" /> },
  { id: "resources", label: "Resources", content: <Placeholder title="Resources" /> },
  {
    id: "old-question-papers",
    label: "Old Question Papers",
    content: <QuestionPaperTiles />,
  },
  { id: "staff", label: "Staff", content: <Placeholder title="Staff" /> },
  { id: "committee", label: "Committee Members", content: <Placeholder title="Committee Members" /> },
  { id: "books-catalogue", label: "Books Catalogue", content: <Placeholder title="Books Catalogue" /> },
]

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-8 bg-white/60 border border-dashed border-indigo-200 rounded-xl text-center text-indigo-700 font-medium">
      {title} content will be added here.
    </div>
  )
}

function QuestionPaperTiles() {
  const cards = [
    {
      id: "question-papers",
      label: "Question Papers",
      color: "from-teal-500 to-cyan-600",
      accent: "bg-cyan-700/70",
      icon: "📄",
      cta: "Show All",
    },
    {
      id: "syllabus",
      label: "Syllabus",
      color: "from-emerald-500 to-green-600",
      accent: "bg-emerald-700/70",
      icon: "📚",
      cta: "Show All",
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {cards.map((card) => (
        <button
          key={card.id}
          className="group text-left"
          type="button"
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl shadow-lg transition-transform duration-200 group-hover:-translate-y-1",
              "text-white"
            )}
          >
            <div className={cn("p-6 md:p-8 bg-gradient-to-r", card.color)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="mt-2 text-xl font-bold uppercase tracking-wide">
                    {card.label}
                  </p>
                </div>
                <div className="text-5xl opacity-30" aria-hidden>
                  {card.icon}
                </div>
              </div>
            </div>
            <div className={cn("px-6 md:px-8 py-3 flex items-center justify-between text-sm font-semibold", card.accent)}>
              <span>{card.cta}</span>
              <span className="transition-transform group-hover:translate-x-1">➜</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("home")

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-indigo-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <aside className="bg-gradient-to-b from-indigo-600 to-purple-700 text-white p-6 lg:p-8">
              <h1 className="text-3xl font-semibold mb-6">Library</h1>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-white text-indigo-700 font-semibold shadow"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            <main className="lg:col-span-4 p-6 lg:p-10 space-y-6">
              <h2 className="text-2xl font-semibold text-indigo-900 capitalize">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <div className="prose prose-indigo max-w-none text-slate-700">
                {activeContent}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

