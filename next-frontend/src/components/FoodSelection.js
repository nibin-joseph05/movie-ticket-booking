"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FoodSelection({
  selectedFood,
  setSelectedFood,
  foodItems,
  setFoodItems
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("best-foods");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://movie-ticket-booking-583u.onrender.com/api/food/categories');
        const data = await response.json();
        const uniqueCategories = ['best-foods', ...data.filter(cat => cat !== 'best-foods')];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(['best-foods', 'burgers', 'pizzas', 'drinks', 'ice-cream']);
      }
    };
    fetchCategories();
  }, []);

  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      let url = `https://movie-ticket-booking-583u.onrender.com/api/food/items?category=${activeCategory}`;
      if (searchQuery.trim()) {
        url = `https://movie-ticket-booking-583u.onrender.com/api/food/search?query=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      console.error("Error fetching food items:", error);
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoodItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFoodItems();
  };

  const handleAddFood = (foodItem) => {
    setSelectedFood(prev => {
      const existingItem = prev.find(item => item.id === foodItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === foodItem.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
            : item
        );
      }
      return [...prev, { ...foodItem, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id, change) => {
    setSelectedFood(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1 || newQuantity > 10) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id) => {
    setSelectedFood(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-[#1a1a24]/80 rounded-xl p-6 h-full border border-[#2a2a3a]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500">
          Concession Stand
        </h2>
        <p className="text-gray-400">Enhance your movie experience with our delicious snacks</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for food or drinks..."
          className="flex-1 bg-[#2a2a3a]/50 text-white rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 border border-[#3a3a4e] placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className={`px-5 py-3 rounded-r-xl flex items-center justify-center transition-all ${
            !searchQuery.trim()
              ? 'bg-[#3a3a4e] cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
      </form>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
                : 'bg-[#2a2a3a] text-gray-300 hover:bg-[#3a3a4e]'
            }`}
            onClick={() => {
              setActiveCategory(cat);
              setSearchQuery("");
            }}
          >
            {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#3a3a4e] scrollbar-track-[#1a1a24]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-transparent border-t-red-500 border-r-red-500 rounded-full"
            />
          </div>
        ) : foodItems.length > 0 ? (
          foodItems.map((item) => {
            const isSelected = selectedFood.some(selected => selected.id === item.id);
            const quantity = isSelected
              ? selectedFood.find(selected => selected.id === item.id)?.quantity || 1
              : 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#2a2a3a]/70 rounded-xl p-4 flex gap-4 items-start border ${
                  isSelected ? 'border-red-500/50' : 'border-[#3a3a4e]'
                } hover:border-red-400/50 transition-all`}
              >
                <div className="w-24 h-24 bg-[#1a1a24] rounded-lg overflow-hidden flex-shrink-0 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-[#1a1a24]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                      {quantity}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs bg-[#2a2a3a] px-2 py-1 rounded text-gray-300">
                      {item.calories} Kcal
                    </span>
                    {item.allergens && (
                      <span className="text-xs bg-[#2a2a3a] px-2 py-1 rounded text-gray-300">
                        Allergens: {item.allergens}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-bold text-lg text-red-400">{item.price.toFixed(2)} Rs</span>
                  {isSelected ? (
                    <div className="flex items-center space-x-2 mt-3">
                      <motion.button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-8 h-8 bg-[#3a3a4e] rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                        </svg>
                      </motion.button>

                      <span className="text-sm font-medium w-6 text-center">{quantity}</span>

                      <motion.button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-8 h-8 bg-[#3a3a4e] rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                      </motion.button>

                      <motion.button
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center hover:bg-red-600/40 transition-colors ml-2"
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handleAddFood(item)}
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center space-x-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Add</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-400">No items found</h3>
            <p className="text-gray-500 mt-1">Try a different search or category</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Important Notes:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>1. Images are for representation purposes only.</li>
          <li>2. Prices inclusive of taxes.</li>
          <li>3. All nutritional information is indicative, values are per serve as shared by the Cinema and may vary depending on the ingredients and portion size.</li>
          <li>4. An average active adult requires 2000 kcal energy per day, however, calorie needs may vary.</li>
        </ul>
      </div>
    </div>
  );
}