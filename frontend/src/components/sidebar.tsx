"use client"

import React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Search,
  Library,
  ImageIcon,
  PenTool,
  FileSearch,
  FileText,
  LayoutGrid,
  Users,
  Store,
  Bell,
  MessageSquare,
  ChevronLeft,
  ChevronDown,
  Globe,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavItem {
  icon: React.ReactNode
  label: string
  active?: boolean
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [{ icon: <Sparkles className="h-5 w-5" />, label: "AI Ask" }],
  },
  {
    title: "KNOWLEDGE BASE",
    items: [
      { icon: <Search className="h-5 w-5" />, label: "AI Explore" },
      { icon: <Library className="h-5 w-5" />, label: "My Library" },
    ],
  },
  {
    title: "AI TEAMS",
    items: [
      { icon: <ImageIcon className="h-5 w-5" />, label: "AI Image" },
      { icon: <PenTool className="h-5 w-5" />, label: "AI Writing" },
      { icon: <FileSearch className="h-5 w-5" />, label: "AI Research", active: true },
      { icon: <FileText className="h-5 w-5" />, label: "AI Reports" },
      { icon: <LayoutGrid className="h-5 w-5" />, label: "AI Decision" },
      { icon: <Users className="h-5 w-5" />, label: "My Teams" },
    ],
  },
  {
    title: "AI TOOLS",
    items: [
      { icon: <Store className="h-5 w-5" />, label: "AI Store" },
      { icon: <Bell className="h-5 w-5" />, label: "Notifications" },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
          <Globe className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">AI Teams</span>
            <span className="rounded bg-orange-400 px-1 py-0.5 text-[10px] font-medium text-white">
              Beta
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-4">
            {section.title && !collapsed && (
              <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      item.active
                        ? "bg-blue-50 text-blue-600"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            collapsed && "rotate-180"
          )}
        />
      </button>

      {/* User section */}
      <div className="border-t border-border px-2 py-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-amber-100 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="text-sm font-medium text-foreground">Stellven Yuan</span>
          )}
        </div>

        {!collapsed && (
          <>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
              <Globe className="h-5 w-5" />
              <span>English</span>
              <ChevronDown className="ml-auto h-4 w-4" />
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
              <MessageSquare className="h-5 w-5" />
              <span>Feedback</span>
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
