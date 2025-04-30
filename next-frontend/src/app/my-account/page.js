'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';
import EditProfile from '@/components/EditProfile';

export default function AccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showEnlargedPhoto, setShowEnlargedPhoto] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/user/details', {
          withCredentials: true
        });
        if (response.data) {
          setUserData(response.data);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data. Please login again.');
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8080/user/details', {
        withCredentials: true
      });
      setUserData(response.data);
      setError('');
      setPasswordSuccess('Profile updated successfully');


      setTimeout(() => {
        setPasswordSuccess('');
        setEditMode(false);
      }, 5000);

    } catch (err) {
      console.error('Error refreshing user data:', err);
      setEditMode(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };


  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/user/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { withCredentials: true }
      );

      setPasswordSuccess('Password changed successfully');
      // Reset form fields
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // Close password form after success
      setTimeout(() => setShowPasswordForm(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/auth/logout', {}, {
        withCredentials: true
      });
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setIsLoggedIn(false);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000]">
        <Header onLogout={handleLogout} />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-[#1e1e2e]/80 backdrop-blur-sm p-8 rounded-xl border border-red-900/50 max-w-md w-full">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Authentication Required</h2>
            <p className="text-gray-300 mb-6">{error || 'You need to be logged in to view this page'}</p>
            <Link
              href="/login"
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95 inline-block"
            >
              Login to Continue
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
        <Header onLogout={handleLogout} />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-[#1e1e2e]/80 backdrop-blur-sm p-8 rounded-xl border border-red-900/50 max-w-md w-full">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Profile</h2>
            <p className="text-gray-300 mb-6">{error || 'Failed to load user data'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95 inline-block"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      <Header onLogout={handleLogout} />

      {isLoggedIn && userData.firstName && (
        <div className="text-center py-3 text-lg font-bold bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg rounded-b-lg">
          🎉 Welcome back, <span className="text-yellow-300">{userData.firstName}!</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 sm:p-6 py-12">
        <h1 className="text-3xl font-extrabold text-red-500 mb-8 border-b-4 border-red-600 pb-2">
          My Account Settings
        </h1>


        <div className="bg-[#1e1e2e]/80 backdrop-blur-sm shadow-xl rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
                Profile Information
              </span>
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <EditProfile
              userData={userData}
              onSave={handleSaveProfile}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                {userData.photoPath && !imageError ? (
                  <img
                    src={`http://localhost:8080/user/photo?path=${encodeURIComponent(userData.photoPath)}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-500/50 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onError={() => setImageError(true)}
                    onClick={() => setShowEnlargedPhoto(true)}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-pink-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg">
                    {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <p className="text-sm text-gray-400">First Name</p>
                    <p className="text-white font-bold text-lg">{userData.firstName}</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <p className="text-sm text-gray-400">Last Name</p>
                    <p className="text-white font-bold text-lg">{userData.lastName}</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-bold text-lg truncate" title={userData.email}>
                      {userData.email}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white font-bold text-lg">{userData.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1e1e2e]/80 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
                Password Settings
              </span>
            </h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {passwordError && (
                <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-lg">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg shadow"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showEnlargedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEnlargedPhoto(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={`http://localhost:8080/user/photo?path=${encodeURIComponent(userData.photoPath)}`}
              alt="Enlarged Profile"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-7 flex items-center justify-center text-2xl shadow-lg transition-all"
              onClick={() => setShowEnlargedPhoto(false)}
              aria-label="Close enlarged photo"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}