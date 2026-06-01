import React, { useState } from 'react';
import { 
  User, Mail, Phone, Calendar, Users, 
  MapPin, Briefcase, GraduationCap, Link2, 
  FileText, Save ,Plus, Eye, X, 
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';

import { useSelector } from 'react-redux';
import { base_url } from '../../components/utlis';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const CreateLeads = () => {
     const { token } = useSelector(state => state.token);
     const [showPopUp,setShowPopUp]=useState(false)
     const [uploadXl,setUploadXl] =useState(false)
     const [selectedFile, setSelectedFile] = useState(null);
    
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    mother: '',
    father: '',
    address: '',
    designation: '',
    education: null,
    source: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
   try {
    const response = await fetch(`${base_url}/leads/create`,{
        method:"POST",
        headers:{
             Authorization: `Bearer ${token}`,
             "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    const data = await response.json();
  
    if(data.success){
toast.success(data.message)
setShowPopUp(true)
setFormData({
    name: '',
    email: '',
    phone: '',
    dob: '',
    mother: '',
    father: '',
    address: '',
    designation: '',
    education: null,
    source: '',
    notes: ''
  })
    }else{
toast.error(data.message)
    }
   } catch (error) {
    toast.error("Somthing was wrong")
   }
  };





  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async() => {
    if (!selectedFile) return;
   
  try {
    const newformData  = new FormData()
      newformData.append("file",selectedFile)
     
      const resposne = await fetch(`${base_url}/leads/create/xl`,{
        method:"POST",
  headers:{
    Authorization: `Bearer ${token}`,
  },
  body:newformData

      })
    
      const data = await resposne.json();

      

if(data.success){
  toast.success(data.message)
  setShowPopUp(true)
  setUploadXl(false); 
  setSelectedFile(null)
}
else{
  toast.error(data.message)
}




} catch (error) {
    toast.error(error.response.data.message)
  
  }



  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      {showPopUp && <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full p-4 bg-gray-900/50 backdrop-blur-sm">
    
    {/* Popup Container */}
    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
      
      {/* Close Button (Optional) */}
      <button 
        onClick={() => setShowPopUp(false)}
        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Manage Leads
        </h3>
        <p className="text-sm text-gray-500 mb-8">
          What would you like to do next? Do you want to view existing leads or create a new one?
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link 
            to={"/agency/my-leads"}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Show Leads
          </Link>
          
          <button 
        onClick={()=>setShowPopUp(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Lead
          </button>
        </div>
      </div>
      
    </div>
  </div>}

 {uploadXl && 
 <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full p-4 bg-gray-900/50 backdrop-blur-sm">
      {/* Popup Container */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => setUploadXl(false)}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Upload Excel File
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Please upload your .xlsx or .csv file below.
          </p>

          {/* Upload Area */}
          <div className="mb-6">
            <label
              htmlFor="xl"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                {selectedFile ? (
                  <p className="text-sm font-medium text-blue-600 truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                ) : (
                  <>
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">XLSX, XLS, or CSV</p>
                  </>
                )}
              </div>
              <input
                id="xl"
                type="file"
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setUploadXl(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                selectedFile
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
 
 }






      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        <div className="mb-8 border-b border-gray-100 pb-5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Create New Lead</h2>
          <p className="text-sm text-gray-500 mt-1">Enter the details below to add a new lead to the system.</p>
          </div>
<div>
  <button onClick={()=>setUploadXl(true)} className='bg-blue-700/90 cursor-pointer text-white font-medium px-3 py-2 rounded-2xl'>Upload xlsheet</button>
</div>

        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 2-Column Grid for standard inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="John Doe"
                  
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Mother's Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="mother"
                  value={formData.mother}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Mother's Full Name"
                />
              </div>
            </div>

            {/* Father's Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="father"
                  value={formData.father}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Father's Full Name"
                />
              </div>
            </div>

            {/* Designation */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Software Engineer"
                />
              </div>
            </div>

            {/* Education (Dropdown) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="" disabled>Select Education Level</option>
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="graduate">Graduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Source */}
            <div className="relative md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. LinkedIn, Referral, Website"
                />
              </div>
            </div>
          </div>

          {/* Full Width Fields */}
          <div className="space-y-6 mt-6">
            {/* Address */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Enter complete residential address"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Any extra information about this lead..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-5 w-5" />
              Save Lead
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default CreateLeads;