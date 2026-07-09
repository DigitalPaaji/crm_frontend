import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { base_url } from '../../components/utlis';

const CreateIntaPage = () => {
  const { token } = useSelector((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    appId: '',
    appSecret: '',
    pageId: '',
    pageAccessToken: '',
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' }); 
    
    try {
      const response = await fetch(`${base_url}/insta/create-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
         setMessage({ type: 'success', text: 'Instagram page connected successfully!' });
         setFormData({ name: '', appId: '', appSecret: '', pageId: '', pageAccessToken: '' });
      } else {
         setMessage({ type: 'error', text: data.message || 'Failed to connect page.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    { label: 'Page Name', name: 'name', type: 'text', placeholder: 'e.g., Saajriwaaj Store' },
    { label: 'App ID', name: 'appId', type: 'text', placeholder: 'Enter Facebook App ID' },
    { label: 'App Secret', name: 'appSecret', type: 'password', placeholder: 'Enter App Secret' },
    { label: 'Page ID', name: 'pageId', type: 'text', placeholder: 'Enter Facebook Page ID' },
    { label: 'Page Access Token', name: 'pageAccessToken', type: 'password', placeholder: 'Enter long-lived access token' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header section */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-900 to-slate-800">
          <h2 className="text-2xl font-bold text-white tracking-wide">Connect Instagram</h2>
          <p className="text-slate-300 text-sm mt-2">Enter your app credentials to integrate your page.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Status Message */}
          {message.text && (
             <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
             </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {inputFields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  onChange={handleInput}
                  required
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all duration-200 disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : 'Connect Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIntaPage;