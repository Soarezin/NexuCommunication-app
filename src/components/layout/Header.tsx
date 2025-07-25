export default function Header() {
  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <header className="w-full bg-white shadow p-4 flex justify-between items-center border-b">
      <h1 className="text-xl font-bold">Advogado SaaS</h1>
      <button
        onClick={handleLogout}
        className="text-red-500 font-semibold hover:underline"
      >
        Logout
      </button>
    </header>
  )
}
