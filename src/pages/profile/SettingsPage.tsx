// src/pages/SettingsPage.tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SettingsPage() {
  const [officeName, setOfficeName] = useState("Thompson Legal")
  const [themeDefault, setThemeDefault] = useState("dark")
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Office Settings</h1>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="office">Office Name</Label>
          <Input
            id="office"
            value={officeName}
            onChange={(e) => setOfficeName(e.target.value)}
            className="dark:bg-zinc-800 dark:border-zinc-700"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="theme">Default Theme</Label>
          <select
            id="theme"
            value={themeDefault}
            onChange={(e) => setThemeDefault(e.target.value)}
            className="w-full rounded border p-2 dark:bg-zinc-800 dark:border-zinc-700"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Enable Notifications</Label>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <Button className="mt-4">Save Settings</Button>
      </div>
    </div>
  )
}
