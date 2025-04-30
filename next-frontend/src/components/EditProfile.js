'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAlertTriangle } from 'react-icons/fi';

const EditProfile = ({ userData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    phoneNumber: userData.phoneNumber,
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(userData.photoPath ?
    `http://localhost:8080/user/photo?path=${encodeURIComponent(userData.photoPath)}` : null
  );
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDirty, setIsDirty] = useState(false);

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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);

      if (formData.phoneNumber !== userData.phoneNumber) {
        formDataToSend.append('phoneNumber', formData.phoneNumber);
        if (!verificationSent) {
          await axios.post('http://localhost:8080/user/send-verification', {}, { withCredentials: true });
          setVerificationSent(true);
          setSuccess('Verification code sent to your email');
          return;
        }
        formDataToSend.append('verificationCode', verificationCode);
      }

      if (formData.photo) {
        formDataToSend.append('userPhotoPath', formData.photo);
      }

      const response = await axios.put('http://localhost:8080/user/update', formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          });

      setSuccess('Profile updated successfully');
          onSave();
        } catch (err) {
          const errorMessage = err.response?.data?.error || 'Update failed';
          setError(errorMessage);

          // Handle specific error cases
          if (errorMessage.includes('Phone number already in use')) {
            setError('This phone number is already registered. Please use a different number.');
          }
        }
  };


  return (
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

      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border-l-4 border-green-500 text-green-300 p-4 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex space-x-4 pt-2">
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all shadow"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditProfile;