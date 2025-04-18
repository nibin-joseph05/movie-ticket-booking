'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';

export default function AccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showEnlargedPhoto, setShowEnlargedPhoto] = useState(false);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');


  useEffect(() => {
      if (success) {
        const timer = setTimeout(() => {
          setSuccess('');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [success]);

    useEffect(() => {
      if (passwordSuccess) {
        const timer = setTimeout(() => {
          setPasswordSuccess('');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [passwordSuccess]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/user/details', { withCredentials: true });
        if (response.data) {
          setUserData(response.data);
          setIsLoggedIn(true);
          setFormData({
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            phoneNumber: response.data.phoneNumber,
            photo: null
          });
          if (response.data.photoPath) {
            setPhotoPreview(`http://localhost:8080/user/photo?path=${encodeURIComponent(response.data.photoPath)}`);
          }
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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const validateFields = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName = 'Only letters are allowed';
    }

    if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = 'Only letters are allowed';
    }

    if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number (10 digits required)';
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, photo: file }));
      setIsDirty(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors).join(', '));
      return;
    }

    if (!window.confirm('Are you sure you want to update your profile? This action cannot be undone.')) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      if (formData.photo) formDataToSend.append('userPhotoPath', formData.photo);

      if (formData.phoneNumber !== userData.phoneNumber) {
        if (!verificationSent) {
          await axios.post('http://localhost:8080/user/send-verification', {}, { withCredentials: true });
          setVerificationSent(true);
          setSuccess('Verification code sent to your phone');
          return;
        }

        if (!verificationCode) {
          setError('Verification code is required');
          return;
        }
        formDataToSend.append('verificationCode', verificationCode);
      }

      const response = await axios.put('http://localhost:8080/user/update', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      setSuccess(response.data.message || 'Profile updated successfully');
      setEditMode(false);
      setIsDirty(false);

      const userResponse = await axios.get('http://localhost:8080/user/details', { withCredentials: true });
      setUserData(userResponse.data);
      setVerificationSent(false);
      setVerificationCode('');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const sendVerificationCode = async () => {
    try {
      await axios.post('http://localhost:8080/user/send-verification', {}, { withCredentials: true });
      setVerificationSent(true);
      setPasswordSuccess('Verification code sent to your email');
      setPasswordError('');
    } catch (err) {
      console.error('Error sending verification code:', err);
      setPasswordError(err.response?.data?.error || 'Failed to send verification code. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!verificationSent) {
      setPasswordError('Please verify your identity first');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        verificationCode
      }, { withCredentials: true });

      setPasswordSuccess(response.data.message || 'Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setVerificationCode('');
      setVerificationSent(false);
      setShowPasswordForm(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.response?.data?.error || 'Failed to change password. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/auth/logout', {}, { withCredentials: true });
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
        <div className="text-center py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg rounded-b-lg">
          🎉 Welcome back, <span className="text-yellow-300">{userData.firstName}!</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 sm:p-6 py-12">
        <h1 className="text-3xl font-extrabold text-red-500 mb-8 border-b-4 border-red-600 pb-2">
          My Account Settings
        </h1>

        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 mb-6 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border-l-4 border-green-500 text-green-300 p-4 mb-6 rounded-lg">
            {success}
          </div>
        )}

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-6">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-500/50 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-pink-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg">
                    {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all shadow">
                    Change Photo
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    pattern="[A-Za-z]+"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    pattern="[A-Za-z]+"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                    {formData.phoneNumber !== userData.phoneNumber && (
                      <span className="text-yellow-500 ml-2 text-sm">
                        (Requires verification)
                      </span>
                    )}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    pattern="\d{10}"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    required
                  />
                </div>

                {formData.phoneNumber !== userData.phoneNumber && verificationSent && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                      placeholder="Enter verification code"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setError('');
                    if (userData) {
                      setFormData({
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        phoneNumber: userData.phoneNumber,
                        photo: null
                      });
                      setPhotoPreview(userData.photoPath ?
                        `http://localhost:8080/user/photo?path=${encodeURIComponent(userData.photoPath)}` : null
                      );
                    }
                    setIsDirty(false);
                    setVerificationSent(false);
                    setVerificationCode('');
                  }}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all shadow"
                >
                  Cancel
                </button>
              </div>
            </form>
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

              {passwordSuccess && (
                <div className="bg-green-900/50 border-l-4 border-green-500 text-green-300 p-4 rounded-lg">
                  {passwordSuccess}
                </div>
              )}

              {!verificationSent ? (
                <div className="space-y-4">
                  <p className="text-gray-300">For security reasons, we need to verify your identity before changing your password.</p>
                  <button
                    type="button"
                    onClick={sendVerificationCode}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                  >
                    Send Verification Code
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="Enter the code sent to your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setVerificationSent(false);
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all shadow"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
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