import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {  User, Mail, AtSign } from 'lucide-react';
import { base_url } from '../../components/utlis';
import { Link } from 'react-router-dom';

const AllInstaAcc = () => {
  const { token } = useSelector((state) => state.token);
  // Initialized with an empty array to prevent undefined map errors
  const [AccData, setAccData] = useState([]); 
  const [loading, setLoading] = useState(true);

  const fetchAllAccount = async () => {
    try {
      const response = await fetch(`${base_url}/insta/getall-account`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const data = await response.json();

      if (data.success) {
        setAccData(data.data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAccount();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-2 rounded-xl text-white shadow-md">
          {/* <className="w-6 h-6" /> */}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Connected Accounts</h1>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      ) : AccData.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No accounts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AccData.map((account) => (
            <div 
              key={account._id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Card Top / Account Info */}
              <div className="p-5 border-b border-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {account.name}
                </h2>
                <div className="flex items-center text-gray-500 text-sm">
                  <AtSign className="w-3.5 h-3.5 mr-1" />
                  <span className="truncate">{account.username}</span>
                </div>
              </div>

              {/* Card Bottom / Creator Info */}
              <div className="p-5 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Added By
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate font-medium text-gray-700">
                      {account.createdBy.name}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{account.createdBy.email}</span>
                  </div>
                  <Link to={`/emp/insta/page/${account._id}`}>
                    View Profile
                    </Link>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllInstaAcc;