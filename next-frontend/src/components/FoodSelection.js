"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function FoodSelection({
  foodItems,
  selectedFood,
  setSelectedFood,
  setFoodItems // Add this prop
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Handle food search
  const handleFoodSearch = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/booking/food?query=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("Failed to search food items.");
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle adding food item
  const handleAddFood = (foodItem) => {
    setSelectedFood(prev => [...prev, {...foodItem, id: Date.now() + Math.random()}]);
  };

  return (
    <div className="bg-[#2a2a3a] rounded-lg p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Grab a Bite!</h2>
      <p className="text-gray-400 mb-4">Now get your favorite snack at a discounted price!</p>

      {/* Food Search */}
      <div className="flex mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for food..."
          className="flex-1 bg-[#3a3a4e] text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          onClick={handleFoodSearch}
          className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-4 py-2 rounded-r-lg hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </div>

      {/* Food Categories */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {['ALL', 'POPCORN', 'SNACKS', 'BEVERAGES', 'COMBOS'].map((cat) => (
          <button
            key={cat}
            className="px-3 py-1 bg-[#3a3a4e] rounded-full text-sm whitespace-nowrap hover:bg-[#4a4a5e] transition-colors"
            onClick={() => setSearchQuery(cat === 'ALL' ? '' : cat.toLowerCase())}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Items */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {foodItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#3a3a4e] rounded-lg p-4 flex gap-4 items-start"
          >
            {/* Food Image */}
            <div className="w-20 h-20 bg-[#1e1e2e] rounded-md overflow-hidden flex-shrink-0">
              {item.image ? (
                <img
                  src={item.image.startsWith('/')
                    ? `http://localhost:8080${item.image}`
                    : item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
              <p className="text-sm text-gray-400 mt-1">
                {item.calories} Kcal | Allergens: {item.allergens}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-semibold">{item.price} Rs</span>
              <button
                onClick={() => handleAddFood(item)}
                className="mt-2 px-3 py-1 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-md text-sm hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}