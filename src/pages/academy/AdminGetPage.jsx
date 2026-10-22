import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiShield,
  FiUsers,
  FiAlertCircle,
} from 'react-icons/fi'

import { toast } from 'react-toastify'
import { agency_url } from '../../components/utlis'
import { useSelector } from 'react-redux'

// Readable labels for the access values stored in the database
const accessLabels = {
  getteacher: 'View teachers',
  createteacher: 'Create teachers',
  deleteteacher: 'Delete teachers',
  getstudent: 'View students',
  createstudent: 'Create students',
  deletestudent: 'Delete students',
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const AdminGetPage = () => {
      const { token } = useSelector((state) => state.token);
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${agency_url}/crm/auth/admin/get`,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
      const data = response.data
      if (data.success) {
        setAdmins(data.admin || [])
      } else {
        setError(data.message || 'Could not load admins.')
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return admins
    return admins.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
    )
  }, [admins, search])

const handelDeleteAdmin = async(adminid)=>{
  try {
    const response = await axios.delete(`${agency_url}/crm/auth/admin/delete/${adminid}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    const data = await response.data;
    if(data.success){
      fetchAdmins()
      toast.success(data.message)
    }else{
      toast.error(data.message)
    }
    
  } catch (error) {
    toast.error(error?.response?.data?.message)
  
  }
}




  return (
    <div className="h-screen overflow-auto bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-600">
              <FiUsers />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Admins</h1>
              <p className="text-sm text-gray-500">
                {loading
                  ? 'Loading...'
                  : `${admins.length} admin${admins.length === 1 ? '' : 's'} in total`}
              </p>
            </div>
          </div>

          <Link
            to="/admin/academy/admins/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <FiPlus /> Create admin
          </Link>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              type="button"
              onClick={fetchAdmins}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex animate-pulse items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/3 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <FiAlertCircle className="text-3xl text-red-500" />
              <p className="text-sm text-gray-700">{error}</p>
              <button
                type="button"
                onClick={fetchAdmins}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredAdmins.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <FiUsers className="text-3xl text-gray-300" />
              <p className="text-sm text-gray-600">
                {search ? 'No admins match your search.' : 'No admins yet.'}
              </p>
              {!search && (
                <Link
                  to="/admin/academy/admins/create"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Create the first admin
                </Link>
              )}
            </div>
          )}

          {/* List */}
          {!loading && !error && filteredAdmins.length > 0 && (
            <>
              {/* Table on larger screens */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3">Permissions</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={admin.name} />
                            <div>
                              <p className="font-medium text-gray-900">{admin.name}</p>
                              <p className="flex items-center gap-1 text-gray-500">
                                <FiMail className="text-xs" /> {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <AccessBadges access={admin.access} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                          {formatDate(admin.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-500 space-x-2">
                          <Link to={`${admin._id}`} className='p-0.5 border px-2 cursor-pointer rounded-sm border-green-500 text-green-700   '>Edit</Link>
                          <button onClick={()=>handelDeleteAdmin(admin._id)} className='p-0.5 border px-2 cursor-pointer rounded-sm border-red-500 text-red-700   '>Delete</button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards on mobile */}
              <ul className="divide-y divide-gray-100 md:hidden">
                {filteredAdmins.map((admin) => (
                  <li key={admin._id} className="space-y-3 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={admin.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{admin.name}</p>
                        <p className="truncate text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                    <AccessBadges access={admin.access} />
                    <p className="text-xs text-gray-400">
                      Created {formatDate(admin.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const Avatar = ({ name = '' }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
    {name.trim().charAt(0).toUpperCase() || '?'}
  </span>
)

const AccessBadges = ({ access = [] }) => {
  if (!access.length) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
        <FiShield /> No permissions
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {access.map((a) => (
        <span
          key={a}
          className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
        >
          {accessLabels[a] || a}
        </span>
      ))}
    </div>
  )
}

export default AdminGetPage