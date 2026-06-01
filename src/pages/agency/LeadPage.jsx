import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { base_url } from '../../components/utlis';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Tag, Globe, FileText, Calendar, Save, X, Loader2, AlertCircle, 
  Delete,AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';

const LeadPage = () => {
  const { leadid } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.token);
  const {info} = useSelector((state)=>state.user)
  const [followUpNote,setFollowUpNote]=useState("")


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFollowupDate, setNewFollowupDate] = useState("");
   const [deleteID,setDeleteID]=useState(null)
 
  const [leadMeta, setLeadMeta] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    mother: "",
    father: "",
    address: "",
    designation: "",
    education: "",
    status: "",
    source: "",
    notes: "",
  });

  const fetchLead = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${base_url}/leads/get-lead/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,  
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead data');
      }

      const data = await response.json();
      
      if (data.success) {
        const fetchedLead = data.lead;
        
        
        setLeadMeta({
          _id: fetchedLead._id,
          createdby: fetchedLead.createdby,
          createdAt: fetchedLead.createdAt,
          followup: fetchedLead.followup || []
        });

        // Initialize form data, ensuring no nulls to prevent uncontrolled input warnings
        setFormData({
          name: fetchedLead.name || "",
          email: fetchedLead.email || "",
          phone: fetchedLead.phone || "",
          // Format Date to YYYY-MM-DD for the HTML date input
          dob: fetchedLead.dob ? new Date(fetchedLead.dob).toISOString().split('T')[0] : "",
          mother: fetchedLead.mother || "",
          father: fetchedLead.father || "",
          address: fetchedLead.address || "",
          designation: fetchedLead.designation || "",
          education: fetchedLead.education || "",
          status: fetchedLead.status || "",
          source: fetchedLead.source || "",
          notes: fetchedLead.notes || "",
        });
      } else {
        throw new Error(data.message || 'Error loading lead');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadid) {
      fetchLead(leadid);
    }
  }, [leadid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const updatePayload = {
      ...formData
    };

    
    try {
      const response = await fetch(`${base_url}/leads/update-lead/${leadid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });
     const data = await response.json();
if(data.success){
  toast.success(data.message)
  navigate(-1)
}else{
  toast.error(data.message)
  
}
    
    } catch(err) { 
    
     }
  };
  const handelFollowUp = async () => {

    


    
    try {
      const response = await fetch(`${base_url}/leads/update-followup/${leadid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({date:new Date(Date.now()),note:followUpNote})
      });
     const data = await response.json();
  
if(data.success){
  toast.success(data.message)
  // navigate(-1)
  setFormData(data.data)
  setLeadMeta({
          _id: data.data._id,
          createdby: data.data.createdby,
          createdAt: data.data.createdAt,
          followup: data.data.followup || []
        });
        setFollowUpNote("")
}else{
  toast.error(data.message)
  
}
    
    } catch(err) { 
    
     }
  };

  const handelDeleteFollowUp= async(followUpId)=>{
    try {

            const response = await fetch(`${base_url}/leads/delete-followup/${leadid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({followUpId})
      });
     const data = await response.json();
    
if(data.success){
  toast.success(data.message)
  // navigate(-1)
  setFormData(data.data)
  setLeadMeta({
          _id: data.data._id,
          createdby: data.data.createdby,
          createdAt: data.data.createdAt,
          followup: data.data.followup || []
        });
}else{
  toast.error(data.message)
  
}
    } catch (error) {
      
    }
  }

  
  const handleConfirmDelete= async()=>{
    try {
      
      const response = await fetch(`${base_url}/leads/temp-delete/${deleteID}`,{
        method:"DELETE",
        headers:{
          Authorization: `Bearer ${token}`
        }



      })
      const data = await response.json();
      if(data.success){
toast.success(data.message)
navigate(-1)
}else{
        toast.error(data.message)
 setDeleteID(null)
      }
    } catch (error) {
      
    }
  }



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-2 text-gray-500">Loading lead details...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="text-lg font-semibold">Oops! Something went wrong.</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => fetchLead(leadid)}
          className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }


if(deleteID){
  return<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
      
      {/* Modal Box */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        {/* Close Button (Top Right) */}
        <div className="flex justify-end pt-4 pr-4">
          <button 
            onClick={() => setDeleteID(null)} // Replace with your state clearer
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-4">
            <AlertTriangle size={32} className="text-rose-600" />
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Delete Lead?
          </h3>
          
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">
            Are you sure you want to delete this lead? All of their data will be permanently removed. <br className="hidden sm:block"/>
            <strong className="text-slate-700">This action cannot be undone.</strong>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setDeleteID(null)} // Cancel Action
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              No, cancel
            </button>
            <button
              onClick={() => {
                handleConfirmDelete(deleteID);
              }} 
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              Yes, delete
            </button>
          </div>
        </div>

      </div>
    </div>
}

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-5xl mx-auto my-6">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Edit Lead Details</h2>
          <p className="text-sm text-gray-500">ID: {leadMeta?._id}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column - Personal & Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., John Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                    <input type="text" name="father" value={formData.father} onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                    <input type="text" name="mother" value={formData.mother} onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                      </div>
                       <select name="education" value={formData.education} onChange={handleChange}
                        className="pl-10 capitalize w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white">
                    
                     <option  value={null}   className='capitalize'>---select---</option>
                      { ["school" , "college" ,"graduate" , "postgraduate" , "other" ].map((item,ind)=>
                      <option value={item} key={ind} className='capitalize'>{item}</option>) }
                      
                      </select>
                      {/* <input type="text" name="education" value={formData.education} onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. B.Tech" /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4">
                Contact Details
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input type="text" name="address" value={formData.address} onChange={handleChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Street, City, Zip" />
                  </div>
                </div>
                 <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-4 w-4 text-gray-400" />
                      </div>
                      <select name="status" value={formData.status} onChange={handleChange}
                        className="pl-10 capitalize w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white">
                      { ["new", "contacted", "interested", "converted", "rejected"].map((item,ind)=>
                      <option value={item} key={ind} className='capitalize'>{item}</option>) }
                      
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" name="source" value={formData.source} onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm capitalize" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation / Role</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                    </div>
                    <input type="text" name="designation" value={formData.designation} onChange={handleChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                      className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Add any relevant details here..."></textarea>
                  </div>
                </div>
                <div className='flex justify-end'>
                  <button type='button' onClick={()=>setDeleteID(leadid)} className='bg-red-700 text-white px-4 py-1 rounded-lg font-medium cursor-pointer text-sm'>Delete Lead</button>
            
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Right Column - Lead Tracking & Followups */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4">
                Lead Tracking
              </h3>
             
            </div>

            {/* Follow Up Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" /> Follow-up Schedule
              </h3>
              
              {leadMeta?.followup && leadMeta.followup.length > 0 ? (
                <div className="mb-4 space-y-2 h-full overflow-y-auto">
                  {leadMeta.followup.map((f, index) => (
                    <div key={index}>
                    <div  className="flex justify-between items-center bg-white p-2 rounded border border-blue-100 text-sm">
                      <span className="text-gray-700">{new Date(f.date).toLocaleTimeString()} {new Date(f.date).toLocaleDateString()}</span>
                    {info?._id === f.by._id ? <Delete onClick={()=>handelDeleteFollowUp(f._id)} size={30} className='cursor-pointer text-red-600 bg-gray-100 px-2 py-1 rounded' /> :  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{ f.by.name}</span>
}



</div>
{f?.note &&
<div >
<span className='text-red-600 text-sm font-medium '>NOTE:</span>

<p className='ps-5 text-gray-600 capitalize'>
  {f.note}
</p>
  </div>
}

</div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4 italic">No previous follow-ups recorded.</p>
              )}

              <div className='flex  gap-3 items-end'>
                <textarea name="" onChange={(e)=>setFollowUpNote(e.target.value)} value={followUpNote} id="" className='w-full border p-2 border-gray-600/40 ' rows={4}  placeholder='Note....'></textarea>
                  <button 
              type="button" 
              onClick={() =>handelFollowUp()}
              className=" text-nowrap px-4 py-2 bg-purple-600 cursor-pointer text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm h-fit"
            >
              Follow up
            </button>
              </div>

            
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Created by <span className="font-semibold text-gray-700 capitalize">{leadMeta?.createdby?.name || 'Unknown'}</span> 
            {leadMeta?.createdAt && ` on ${new Date(leadMeta.createdAt).toLocaleDateString()}`}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>

           
          </div>     
        </div>
      </form>
    </div>
  );
};

export default LeadPage;  