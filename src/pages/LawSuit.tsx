import {
  FileText,
  Folder,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function LawSuit() {
  const [theme, setTheme] = useState("light")
  const [expanded, setExpanded] = useState<string | null>("Sarah Thompson")

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
  }, [theme])

  const toggleExpand = (name: string) => {
    setExpanded(expanded === name ? null : name)
  }

  const clients = [
    {
      name: "Sarah Thompson",
      processes: ["Contract Dispute", "Personal Injury"],
    },
    { name: "John Smith", processes: [] },
    { name: "Emily Johnson", processes: [] },
    { name: "Michael Williams", processes: [] },
    { name: "Emma Davis", processes: [] },
  ]

  const messages = [
    {
      name: "Sarah Thompson",
      avatar: "https://i.pravatar.cc/40?img=1",
      time: "10:30 AM",
      message: "I’ve reviewed the documents. Let me know if you need changes.",
      fromUser: false,
    },
    {
      name: "Você",
      time: "10:31 AM",
      message: "Thank you! I’ll take a look.",
      fromUser: true,
    },
    {
      name: "Associate",
      avatar: "https://i.pravatar.cc/40?img=2",
      time: "10:32 AM",
      message: "That works for me. Thank you.",
      fromUser: false,
    },
  ]

  return (
    <div className="flex h-screen text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-zinc-900">
      {/* Sidebar principal */}
      <aside className="w-64 bg-zinc-50 dark:bg-zinc-800 border-r dark:border-zinc-700 p-4 overflow-y-auto">
        <header className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Clients</h2>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>

        <ul className="space-y-1">
          {clients.map((client) => (
            <li key={client.name}>
              <div
                className="flex items-center gap-1 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 px-2 py-1 rounded"
                onClick={() => toggleExpand(client.name)}
              >
                {expanded === client.name ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Folder className="text-yellow-500" size={16} />
                <span>{client.name}</span>
              </div>
              {expanded === client.name && client.processes.length > 0 && (
                <ul className="pl-6 mt-1">
                  {client.processes.map((p) => (
                    <li
                      key={p}
                      className="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-100 px-2 py-1 rounded cursor-pointer"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Área de chat */}
      <main className="flex-1 flex flex-col border-r dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <header className="border-b dark:border-zinc-700 px-4 py-2 font-semibold">Contract Dispute</header>
        <ScrollArea className="flex-1 p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.fromUser && "justify-end")}>
              {!msg.fromUser && <img src={msg.avatar} className="rounded-full w-8 h-8" />}
              <div>
                <p className="font-medium text-xs text-gray-400 dark:text-gray-500">
                  {msg.name} {msg.time && <span className="ml-1">{msg.time}</span>}
                </p>
                <div
                  className={cn(
                    "p-2 rounded mt-1 max-w-md",
                    msg.fromUser
                      ? "bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100"
                      : "bg-zinc-100 dark:bg-zinc-700"
                  )}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        <footer className="p-4 border-t dark:border-zinc-700 flex gap-2">
          <Input placeholder="Type a message" className="dark:bg-zinc-800 dark:border-zinc-600" />
          <Button>Send</Button>
        </footer>
      </main>

      {/* Explorer */}
      <aside className="w-80 bg-white dark:bg-zinc-900 p-4 space-y-4 border-l dark:border-zinc-700">
        <div>
          <h2 className="font-semibold mb-2">File Explorer</h2>
          <ul className="space-y-1 text-blue-700 dark:text-blue-300">
            <li className="flex items-center gap-1"><Folder className="text-yellow-500" size={16} /> Documents</li>
            <li className="pl-4 flex items-center gap-1"><FileText size={14} /> Contract.pdf</li>
            <li className="pl-4 flex items-center gap-1"><FileText size={14} /> Evidence.docx</li>
            <li className="pl-4 flex items-center gap-1"><FileText size={14} /> Image.jpg</li>
            <li className="pl-4 flex items-center gap-1"><FileText size={14} /> Letter.pdf</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Preview</h3>
          <div className="border rounded p-4 text-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 h-40">
            CONTRACT<br />—<br />File preview here
          </div>
        </div>
      </aside>
    </div>
  )
}
