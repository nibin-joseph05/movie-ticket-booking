export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Brand Name */}
        <div className="text-white font-bold text-2xl">🎬 MovieFlix</div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-md mt-4 md:mt-0">
          <a href="#" className="hover:text-white">About Us</a>
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-6 text-md mt-4 md:mt-0">
          <a href="#" className="hover:text-white">Facebook</a>
          <a href="#" className="hover:text-white">Twitter</a>
          <a href="#" className="hover:text-white">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
