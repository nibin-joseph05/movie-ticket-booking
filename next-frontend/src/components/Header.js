import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white py-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src="/logo.webp" alt="Logo" width={50} height={50} />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg tracking-wide">
            MovieFlix
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 mx-6 max-w-lg hidden sm:block">
          <input
            type="text"
            placeholder="🔍 Search for Movies, Events, Plays..."
            className="w-full px-4 py-3 text-black bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md text-md"
          />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6 text-lg">
          <a href="/" className="hover:text-red-500">Home</a>
          <a href="#" className="hover:text-red-500">Movies</a>
          <a href="#" className="hover:text-red-500">Stream</a>
          <a href="#" className="hover:text-red-500">Events</a>
          <a href="#" className="hover:text-red-500">Plays</a>
          <a href="#" className="hover:text-red-500">Sports</a>
          <a href="#" className="hover:text-red-500">Activities</a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Sign In Button with Link */}
          <Link href="/login">
            <button className="hidden md:block bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 rounded-full text-lg font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:scale-105">
              Sign In
            </button>
          </Link>

          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
