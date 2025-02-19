import React from "react";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-10">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/" className="flex items-center">
          <img src={logo} alt="Flickx Logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-red-600 ml-2">FlickX</span>
        </a>
        <ul className="flex gap-6 text-gray-700">
          <li className="hover:text-red-600 cursor-pointer">Movies</li>
          <li className="hover:text-red-600 cursor-pointer">Events</li>
          <li className="hover:text-red-600 cursor-pointer">Offers</li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
