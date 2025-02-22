import React from "react";
import logo from "../assets/FlickX.png";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-10">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Location */}
        <div className="flex items-center">
          <img src={logo} alt="FlickX Logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-red-600 ml-2">FlickX</span>
          <div className="ml-6 text-gray-700 flex items-center gap-2">
            <span className="material-icons">location_on</span>
            <select className="border-none bg-transparent focus:outline-none cursor-pointer">
              <option>Kochi</option>
              <option>Chennai</option>
              <option>Mumbai</option>
              <option>Delhi</option>
            </select>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="flex gap-6 text-gray-700">
          <li className="hover:text-red-600 cursor-pointer">
            <Link to="/">Home</Link>
          </li>
          <li className="hover:text-red-600 cursor-pointer">Movies</li>
          <li className="hover:text-red-600 cursor-pointer">Events</li>
          <li className="hover:text-red-600 cursor-pointer">Offers</li>
          <li className="hover:text-red-600 cursor-pointer">Contact Us</li>
        </ul>

        {/* Sign-In Button */}
        <Link to="/login">
          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            Login/SignUp
          </button>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
