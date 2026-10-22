import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  FiUser,
  FiMail,
  FiArrowLeft,
  FiCheck,
  FiSave,
  FiEdit,
  FiLoader,
} from 'react-icons/fi'
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaLayerGroup } from 'react-icons/fa'
import { MdLeaderboard } from 'react-icons/md'
import { agency_url } from '../../components/utlis'
import { useSelector } from 'react-redux'

const accessGroups = [
  {
    title: 'Teachers',
    icon: FaChalkboardTeacher,
    items: [
      { key: 'Get Teachers', value: 'getteacher' },
      { key: 'Create Teachers', value: 'createteacher' },
      { key: 'Delete Teachers', value: 'deleteteacher' },
      { key: 'Attendance Teachers', value: 'attendanceteacher' },
    ],
  },
  {
    title: 'Students',
    icon: FaUserGraduate,
    items: [
      { key: 'Get Students', value: 'getstudent' },
      { key: 'Create Students', value: 'createstudent' },
      { key: 'Edit Students', value: 'editstudent' },
      { key: 'Delete Students', value: 'deletestudent' },
    ],
  },
  {
    title: 'Subjects',
    icon: FaBook,
    items: [
      { key: 'Get Subjects', value: 'getsubject' },
      { key: 'Create Subjects', value: 'createsubject' },
      { key: 'Edit Subjects', value: 'editsubject' },
      { key: 'Delete Subjects', value: 'deletesubject' },
    ],
  },
  {
    title: 'Modules',
    icon: FaLayerGroup,
    items: [
      { key: 'Get Modules', value: 'getmodule' },
      { key: 'Create Modules', value: 'createmodule' },
      { key: 'Edit Modules', value: 'editmodule' },
      { key: 'Delete Modules', value: 'deletemodule' },
    ],
  },
]



const leadAccess = [
  {
    title: 'Lead',
    icon: MdLeaderboard,
    items: [
      { key: 'Create Lead', value: 'createlead' },
      { key: 'New Lead', value: 'NEW' },
      { key: 'Counseling Lead', value: 'COUNSELING' },
      { key: 'Demo Lead', value: 'DEMO' },
      { key: 'Demo Done Lead', value: 'DEMODONE' },
      { key: 'Active Lead', value: 'ACTIVE' },
      { key: 'InActive Lead', value: 'INACTIVE' },
      { key: 'Converted Lead', value: 'CONVERTED' },
      { key: 'Not Interested Lead', value: 'NOT_INTERESTED' },
       
    ],
  },
]



const allValues = [...new Set(accessGroups.flatMap((g) => g.items.map((i) => i.value)))]

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100'

const EditAdmin = () => {
  const navigation = useNavigate()
   const { token } = useSelector((state) => state.token);
  const { id } = useParams()
  const [admin, setAdmin] = useState({
    name: '',
    email: '',
    access: [],
    leadaccess:[],
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setAdmin((prev) => ({ ...prev, [name]: value }))
  }

  const toggleAccess = (value) => {
    setAdmin((prev) => ({
      ...prev,
      access: prev.access.includes(value)
        ? prev.access.filter((a) => a !== value)
        : [...prev.access, value],
    }))
  }

  const toggleGroup = (group) => {
    const values = group.items.map((i) => i.value)
    const groupSelected = values.every((v) => admin.access.includes(v))
    setAdmin((prev) => ({
      ...prev,
      access: groupSelected
        ? prev.access.filter((a) => !values.includes(a))
        : [...new Set([...prev.access, ...values])],
    }))
  }
   const toggleLeadAccess = (value) => {
    setAdmin((prev) => ({
      ...prev,
      leadaccess: prev.leadaccess.includes(value)
        ? prev.leadaccess.filter((a) => a !== value)
        : [...prev.leadaccess, value],
    }))
  }

  const toggleLeadGroup = (group) => {
    const values = group.items.map((i) => i.value)
    const allSelected = values.every((v) => admin.leadaccess.includes(v))
    setAdmin((prev) => ({
      ...prev,
      leadaccess: allSelected
        ? prev.leadaccess.filter((a) => !values.includes(a))
        : [...new Set([...prev.leadaccess, ...values])],
    }))
  }

  const allSelected = allValues.every((v) => admin.access.includes(v))

  const toggleAll = () => {
    setAdmin((prev) => ({ ...prev, access: allSelected ? [] : allValues }))
  }

  const validate = () => {
    if (!admin.name.trim()) return 'Please enter the admin name.'
    if (admin.access.length === 0) return 'Select at least one permission.'
    return null
  }

  const SubmitAdmin = async (e) => {
    e.preventDefault()

    const error = validate()
    if (error) {
      Swal.fire({ icon: 'warning', title: 'Check the form', text: error })
      return
    }

    try {
      setLoading(true)
      const response = await axios.patch(
        `${agency_url}/crm/auth/admin/edit/${id}`,
        { name: admin.name, email: admin.email, access: admin.access ,leadaccess:admin.leadaccess},
        {
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      )
      const data = response.data

      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Admin updated',
          text: `${admin.name} has been updated.`,
          timer: 1800,
          showConfirmButton: false,
        })
        navigation('/admin/academy/admins')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Could not update admin',
          text: data.message || 'Something went wrong.',
        })
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Could not update admin',
        text: err?.response?.data?.message || 'Server error. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmin = async () => {
    try {
      const response = await axios.get(`${agency_url}/crm/auth/admin/get/${id}`,{
            headers: {
      Authorization: `Bearer ${token}`,
    }})
      const data = response.data
      if (data.success) {
        setAdmin({
          name: data.admin?.name || '',
          email: data.admin?.email || '',
          access: data.admin?.access || [],
          leadaccess:data.admin?.leadaccess || [],
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchAdmin()
  }, [id])

  return (
    // No h-screen / overflow-auto here -> only ONE scrollbar (from the parent layout)
    <div className="  bg-gray-50  ">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigation(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"
        >
          <FiArrowLeft /> Back to admins
        </button>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-600">
              <FiEdit />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Edit admin</h1>
              <p className="text-sm text-gray-500">
                Update the admin details and permissions.
              </p>
            </div>
          </div>

          <form onSubmit={SubmitAdmin} className="space-y-6 p-6">
            <section className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <div className="relative">
                  <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={admin.name}
                    onChange={handleChange}
                    placeholder="e.g. Harpreet Singh"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    disabled
                    value={admin.email}
                    className={`${inputClass} cursor-not-allowed`}
                    autoComplete="off"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Permissions</h2>
                  <p className="text-xs text-gray-500">
                    {admin.access.length} of {allValues.length} selected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {allSelected ? 'Clear all' : 'Select all'}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {accessGroups.map((group) => {
                  const Icon = group.icon
                  const groupAllSelected = group.items.every((i) =>
                    admin.access.includes(i.value)
                  )
                  return (
                    <div key={group.title} className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <Icon className="text-indigo-500" /> {group.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGroup(group)}
                          className="text-xs font-medium text-gray-500 hover:text-indigo-600"
                        >
                          {groupAllSelected ? 'Clear' : 'Select all'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {group.items.map((item) => {
                          const checked = admin.access.includes(item.value)
                          return (
                            <label
                              key={item.value}
                              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                                checked
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAccess(item.value)}
                          hidden
                              />
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                                  checked
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-gray-300 bg-white text-transparent'
                                }`}
                              >
                                <FiCheck />
                              </span>
                              {item.key}
                            </label>
                          )
                        })}
                        
                      </div>
                    </div>
                  )
                })}
                 {leadAccess.map((group) => {
                                          const Icon = group.icon
                                          const groupAllSelected = group.items.every((i) =>
                                            admin?.leadaccess?.includes(i.value)
                                          )
                                          return (
                                            <div
                                              key={group.title}
                                              className="rounded-xl border border-gray-200 p-4"
                                            >
                                              <div className="mb-3 flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                                  <Icon className="text-indigo-500" /> {group.title}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => toggleLeadGroup(group)}
                                                  className="text-xs font-medium text-gray-500 hover:text-indigo-600"
                                                >
                                                  {groupAllSelected ? 'Clear' : 'Select all'}
                                                </button>
                                              </div>
                        
                                              <div className="space-y-2">
                                                {group.items.map((item) => {
                                                  const checked = admin.leadaccess.includes(item.value)
                                                  return (
                                                    <label
                                                      key={item.value}
                                                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                                                        checked
                                                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                                      }`}
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleLeadAccess(item.value)}
                                                        hidden
                                                       
                        
                                                      />
                                                      <span
                                                        className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                                                          checked
                                                            ? 'border-indigo-600 bg-indigo-600 text-white'
                                                            : 'border-gray-300 bg-white text-transparent'
                                                        }`}
                                                      >
                                                        <FiCheck />
                                                      </span>
                                                      {item.key}
                                                    </label>
                                                  )
                                                })}
                                              </div>
                                            </div>
                                          )
                                        })}
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigation('/admin/academy/admins')}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <FiSave /> Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditAdmin