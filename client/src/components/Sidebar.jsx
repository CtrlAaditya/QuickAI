import { useClerk, useUser } from '@clerk/clerk-react'
import { Eraser, FileText, Hash, House, Scissors, SquarePen, Users, Image } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/community', label: 'Community', Icon: Users },
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded) {
    return (
      <div className="w-60 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex flex-col max-sm:absolute top-14 bottom-0 left-0 
        ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="my-5 text-center font-bold text-lg">
        Quick.ai
      </div>

      {/* Navigation */}
      <div className="w-full space-y-1 px-2">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/ai'}
            onClick={() => setSidebar(false)}
            className={({ isActive }) =>
              `px-3.5 py-2.5 flex items-center gap-3 rounded ${
                isActive
                  ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Profile Section at Bottom */}
      {user && (
        <div className="mt-auto mb-5 text-center">
          <img
            src={user.imageUrl}
            alt="User Avatar"
            className="w-14 h-14 rounded-full mx-auto"
          />
          <h1 className="mt-1">{user.fullName}</h1>
          <button
            onClick={() => signOut()}
            className="mt-3 px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar
