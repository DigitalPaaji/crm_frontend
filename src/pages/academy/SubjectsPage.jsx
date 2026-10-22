
import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiSearch,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { agency_url } from "../../components/utlis";
import { useSelector } from "react-redux";


  const SubjectsPage = () => {

  const { token } = useSelector((state) => state.token);


  const [subjectTitle, setSubjectTitle] = useState("");
  const [allSubject, setAllSubject] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // GET ALL SUBJECTS
  // --------------------------------------------------
  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${agency_url}/crm/subject/get`, {
            headers: {
      Authorization: `Bearer ${token}`,
     }}
      );

      const data = response.data;

      if (data.success) {
        setAllSubject(data.subjects || []);
      } else {
        setAllSubject([]);
      }
    } catch (error) {
      console.error("Fetch subjects error:", error);

      setAllSubject([]);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to fetch subjects",
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CREATE SUBJECT
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    if (e.key !== "Enter") {
      return;
    }

    const title = subjectTitle.trim();

    if (!title) {
      return;
    }

    try {
      setSaving(true);

      const response = await axios.post(
        `${agency_url}/crm/subject/create`,
        {
          subject: title,
        }, {
      headers: {
      Authorization: `Bearer ${token}`,
    }});

      const data = response.data;

      if (data.success) {
        setAllSubject((prev) => [data.subject, ...prev]);
        setSubjectTitle("");
        Swal.fire({
          icon: "success",
          title: "Subject Added",
          text: "Subject has been created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

    } catch (error) {
      
      console.error("Create subject error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Add",
        text:
          error?.response?.data?.message ||
          "Something went wrong while creating subject.",
      });
    } finally {
      setSaving(false);
    }
  };





  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Subject?",
      text: "This subject will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `${agency_url}/crm/subject/delete/${id}`, {
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      const data = response.data;

      if (data.success) {
        setAllSubject((prev) =>
          prev.filter((subject) => subject._id !== id)
        );

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Subject deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Delete subject error:", error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text:
          error?.response?.data?.message ||
          "Unable to delete subject.",
      });
    }
  };

  // --------------------------------------------------
  // START EDIT
  // --------------------------------------------------
  const handleEdit = (subject) => {
    setEditingId(subject._id);
    setEditTitle(subject.title);
  };

  // --------------------------------------------------
  // CANCEL EDIT
  // --------------------------------------------------
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // --------------------------------------------------
  // UPDATE SUBJECT
  // --------------------------------------------------
  const handleUpdate = async (id) => {
    const title = editTitle.trim();

    if (!title) {
      Swal.fire({
        icon: "warning",
        title: "Subject Required",
        text: "Please enter subject name.",
      });

      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(
        `${agency_url}/crm/subject/update/${id}`,
        {
          subject: title,
        }, {
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      const data = response.data;

      if (data.success) {
        setAllSubject((prev) =>
          prev.map((subject) =>
            subject._id === id
              ? {
                  ...subject,
                  title: data.subject?.title || title,
                }
              : subject
          )
        );

        setEditingId(null);
        setEditTitle("");

        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Subject updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Update subject error:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error?.response?.data?.message ||
          "Unable to update subject.",
      });
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // EDIT ON ENTER
  // --------------------------------------------------
  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleUpdate(id);
    }

    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // --------------------------------------------------
  // FILTER SUBJECTS
  // --------------------------------------------------
  const filteredSubjects = allSubject.filter((subject) =>
    subject.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // --------------------------------------------------
  // FETCH ON PAGE LOAD
  // --------------------------------------------------
  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* */}
      <div className="mx-auto max-w-6xl">

        {/*  */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#153497] text-white shadow-sm">
                <FiBookOpen size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Subjects
                </h1>

                <p className="text-sm text-slate-500">
                  Manage your subjects
                </p>
              </div>
            </div>
          </div>

          {/*    */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Subjects
            </p>

            <p className="mt-1 text-xl font-bold text-[#153497]">
              {allSubject.length}
            </p>
          </div>
        </div>

        {/* -----------------------------------------
            ADD SUBJECT
        ------------------------------------------ */}
   <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-800">
              Add New Subject
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Type the subject name and press Enter.
            </p>
          </div>

          <div className="relative">
            <FiBookOpen
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />

            <input
              type="text"
              value={subjectTitle}
              placeholder="Enter subject name..."
              disabled={saving}
              onChange={(e) =>
                setSubjectTitle(e.target.value)
              }
              onKeyDown={handleSubmit}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                py-3.5
                pl-12
                pr-12
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#153497]
                focus:bg-white
                focus:ring-4
                focus:ring-[#153497]/10
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {saving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#153497]" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#153497] text-white">
                  <FiPlus size={17} />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* -----------------------------------------
            SEARCH
        ------------------------------------------ */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <h2 className="text-lg font-bold text-slate-800">
            All Subjects
          </h2>

          <div className="relative w-full sm:w-72">
            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                py-2.5
                pl-10
                pr-4
                text-sm
                outline-none
                focus:border-[#153497]
                focus:ring-4
                focus:ring-[#153497]/10
              "
            />
          </div>
        </div>

        {/* -----------------------------------------
            SUBJECT LIST
        ------------------------------------------ */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}
          <div className="hidden grid-cols-12 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">

            <div className="col-span-1">
              #
            </div>

            <div className="col-span-6">
              Subject
            </div>

            <div className="col-span-3">
              Created By
            </div>

            <div className="col-span-2 text-right">
              Actions
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#153497]" />
            </div>
          )}

          {/* Empty */}
          {!loading && filteredSubjects.length === 0 && (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FiBookOpen size={28} />
              </div>

              <h3 className="text-base font-semibold text-slate-700">
                No subjects found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Add your first subject above.
              </p>
            </div>
          )}

          {/* Subjects */}
          {!loading &&
            filteredSubjects.map((subject, index) => (
              <div
                key={subject._id}
                className="
                  border-b
                  border-slate-100
                  px-5
                  py-4
                  transition
                  last:border-b-0
                  hover:bg-slate-50/70
                "
              >

                {/* Desktop */}
                <div className="hidden grid-cols-12 items-center md:grid">

                  {/* Number */}
                  <div className="col-span-1">
                    <span className="text-sm font-semibold text-slate-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="col-span-6">

                    {editingId === subject._id ? (
                      <div className="flex max-w-md items-center gap-2">

                        <input
                          autoFocus
                          type="text"
                          value={editTitle}
                          onChange={(e) =>
                            setEditTitle(e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleEditKeyDown(e, subject._id)
                          }
                          className="
                            w-full
                            rounded-lg
                            border
                            border-[#153497]
                            bg-white
                            px-3
                            py-2
                            text-sm
                            outline-none
                            ring-4
                            ring-[#153497]/10
                          "
                        />

                        <button
                          onClick={() =>
                            handleUpdate(subject._id)
                          }
                          disabled={saving}
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-emerald-500
                            text-white
                            transition
                            hover:bg-emerald-600
                            disabled:opacity-50
                          "
                          title="Save"
                        >
                          <FiCheck size={17} />
                        </button>

                        <button
                          onClick={handleCancelEdit}
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-200
                            text-slate-600
                            transition
                            hover:bg-slate-300
                          "
                          title="Cancel"
                        >
                          <FiX size={17} />
                        </button>

                      </div>
                    ) : (
                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#153497]/10 text-[#153497]">
                          <FiBookOpen size={17} />
                        </div>

                        <span className="font-medium text-slate-700">
                          {subject.title}
                        </span>

                      </div>
                    )}
                  </div>

                  {/* Created By */}
                  <div className="col-span-3">

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">
                        {subject.createBy?.email || "—"}
                      </span>

                      <span className="text-xs text-slate-400">
                        {subject.createByModel || "Admin"}
                      </span>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2">

                 <button
                      onClick={() => handleEdit(subject)}
                      disabled={editingId === subject._id}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        transition
                        hover:border-blue-200
                        hover:bg-blue-50
                        hover:text-blue-600
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                      title="Edit Subject"
                    >
                      <FiEdit2 size={16} />
                    </button>

              <button
                      onClick={() =>
                        handleDelete(subject._id)
                      }
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        transition
                        hover:border-red-200
                        hover:bg-red-50
                        hover:text-red-600
                      "
                      title="Delete Subject"
                    >
                      <FiTrash2 size={16} />
                    </button>

                  </div>
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-4 md:hidden">

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#153497]/10 text-[#153497]">
                        <FiBookOpen size={18} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-medium text-slate-400">
                          Subject #{index + 1}
                        </p>

                        {editingId === subject._id ? (
                          <input
                            autoFocus
                            type="text"
                            value={editTitle}
                            onChange={(e) =>
                              setEditTitle(e.target.value)
                            }
                            onKeyDown={(e) =>
                              handleEditKeyDown(
                                e,
                                subject._id
                              )
                            }
                            className="
                              mt-1
                              w-full
                              rounded-lg
                              border
                              border-[#153497]
                              px-3
                              py-2
                              text-sm
                              outline-none
                            "
                          />
                        ) : (
                          <p className="truncate font-semibold text-slate-700">
                            {subject.title}
                          </p>
                        )}

                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">

                      {editingId === subject._id ? (
                        <>
                          <button
                            onClick={() =>
                              handleUpdate(subject._id)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white"
                          >
                            <FiCheck size={16} />
                          </button>

                          <button
                            onClick={handleCancelEdit}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-600"
                          >
                            <FiX size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleEdit(subject)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
                          >
                            <FiEdit2 size={16} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(subject._id)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}

                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 px-3 py-2">

                    <p className="text-xs text-slate-400">
                      Created By
                    </p>

                    <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
                      {subject.createBy?.email || "—"}
                    </p>

                  </div>

                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;

