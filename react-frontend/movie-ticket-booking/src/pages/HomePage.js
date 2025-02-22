import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="mt-16 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Welcome to FlickX</h1>
          <p className="mt-4 text-lg">Book movies, events, and shows near you!</p>
          <div className="mt-6 flex justify-center">
            <input
              type="text"
              placeholder="Search for Movies, Events..."
              className="w-2/3 md:w-1/2 px-4 py-3 rounded-l-md focus:outline-none text-gray-700"
            />
            <button className="bg-red-600 text-white px-6 py-3 rounded-r-md font-bold hover:bg-red-700">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Trending Movies Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Trending Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-md overflow-hidden cursor-pointer hover:shadow-lg"
              >
                <img
                  src={`https://via.placeholder.com/150x200?text=Movie+${index + 1}`}
                  alt={`Movie ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-gray-700">Movie {index + 1}</h3>
                  <p className="text-sm text-gray-500">Genre</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
