import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import {
  FiBookOpen,
  FiChevronRight,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiLayers,
  FiX,
  FiSave,
} from "react-icons/fi";


import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import RichEditor from "../../components/RichEditor";
import { agency_url } from "../../components/utlis";

/* =====================================================
   API
===================================================== */

const API = {
  subjects: `${agency_url}/crm/subject/get`,
  modules: (subjectId) =>
    `${agency_url}/crm/subject/modules/get/${subjectId}`,
  create: `${agency_url}/crm/subject/modules/create`,
  update: (id) => `${agency_url}/crm/subject/modules/update/${id}`,
  remove: (id) => `${agency_url}/crm/subject/modules/delete/${id}`,

  reorder: `${agency_url}/crm/subject/modules/reorder`,
};

/* =====================================================
   CONSTANTS / HELPERS
===================================================== */

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  assignteacher:"",
  status: "PUBLISHED",
  level:1
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#153497] focus:ring-4 focus:ring-[#153497]/10";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* =====================================================
   COMPONENT
===================================================== */

const ChapterPages = () => {
  
  const { token } = useSelector((state) => state.token);

 

  const [loading, setLoading] = useState(false);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [allSubject, setAllSubject] = useState([]);
  const [selectSubject, setSelectSubject] = useState("");
  const [allModules, setAllModules] = useState([]);
  const [allteachers, setAllTeachers] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  // Controls whether the create / edit form is visible
  const [createAdd, setCreateAdd] = useState(false);

const [draggedModuleId, setDraggedModuleId] = useState(null);
const [savingOrder, setSavingOrder] = useState(false);


  const formRef = useRef(null);
  const requestIdRef = useRef(0); // guards against stale module responses

  const isEditing = Boolean(editingId);

  /* =====================================================
     FORM HELPERS
  ===================================================== */

  // The values the form started with (empty for create, module values for edit)
  const initialFormRef = useRef(EMPTY_FORM);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialFormRef.current),
    [form]
  );

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  /** Fully close the form and clear everything */
  const closeForm = useCallback(() => {
    setForm(EMPTY_FORM);
    initialFormRef.current = EMPTY_FORM;
    setEditingId(null);
    setCreateAdd(false);
  }, []);

  /** Ask for confirmation only when there are unsaved changes */
  const confirmDiscard = async () => {
    if (!isDirty) return true;

    const result = await Swal.fire({
      icon: "question",
      title: "Discard changes?",
      text: "Your unsaved changes will be lost.",
      showCancelButton: true,
      confirmButtonText: "Yes, discard",
      cancelButtonText: "Keep editing",
      confirmButtonColor: "#153497",
    });

    return result.isConfirmed;
  };

  /** Open the form in CREATE mode */
  const openCreate = async () => {
    // Already open in create mode -> just focus it
    if (createAdd && !isEditing) {
      scrollToForm();
      return;
    }

    // Switching from edit -> create: confirm if there are changes
    if (createAdd && !(await confirmDiscard())) return;

    setForm(EMPTY_FORM);
    initialFormRef.current = EMPTY_FORM;
    setEditingId(null);
    setCreateAdd(true);
    scrollToForm();
  };

  /** Open the form in EDIT mode */
  const handleEditClick = async (module) => {
    // Editing a different item while the form has changes
    if (createAdd && editingId !== module._id && !(await confirmDiscard()))
      return;

    const values = {
      title: module.title || "",
      description: module.description || "",
      content: module.content || "",
      status: module.status || "PUBLISHED",
      assignteacher: module.assignteacher || "",
      level: module.level || "",
    };

    setForm(values);
    initialFormRef.current = values;
    setEditingId(module._id);
    setCreateAdd(true);
    scrollToForm();
  };

  /** Cancel button (works for both create and edit) */
  const handleCancel = async () => {
    if (!(await confirmDiscard())) return;
    closeForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* =====================================================
     FETCH SUBJECTS
  ===================================================== */

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API.subjects,{
            headers: {
      Authorization: `Bearer ${token}`,
    }});
      setAllSubject(data.success ? data.subjects || [] : []);
    } catch (error) {
      console.error("Fetch subjects error:", error);
      setAllSubject([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error, "Unable to fetch subjects"),
      });
    } finally {
      setLoading(false);
    }
  };
  
 const fetchTeacher= async()=>{
    try {
      const response = await axios.get(`${agency_url}/crm/teacher/get-all`,{
            headers: {
      Authorization: `Bearer ${token}`,
    }})
      const data = await response.data;

setAllTeachers(data.teachers)
    } catch (error) {
    toast.error("")
    }
  }


  /* =====================================================
     FETCH MODULES
  ===================================================== */

  const fetchModules = async (subjectId = selectSubject) => {
    if (!subjectId) return;

    const requestId = ++requestIdRef.current;

    try {
      setModuleLoading(true);
      const { data } = await axios.get(API.modules(subjectId),{
            headers: {
      Authorization: `Bearer ${token}`,
    }});

      // Ignore the response if the user switched subject meanwhile
      if (requestId !== requestIdRef.current) return;

      setAllModules(data.success ? data.modules || [] : []);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      console.error("Fetch modules error:", error);
      setAllModules([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error, "Unable to fetch chapters"),
      });
    } finally {
      if (requestId === requestIdRef.current) setModuleLoading(false);
    }
  };


  useEffect(() => {
    fetchSubjects();
    fetchTeacher()
  }, []);

 const handleModuleDrop = async (targetModuleId) => {
  if (
    !draggedModuleId ||
    draggedModuleId === targetModuleId ||
    savingOrder
  ) {
    setDraggedModuleId(null);
    return;
  }

  const previousModules = [...allModules];

  const reordered = [...sortedModules];

  const fromIndex = reordered.findIndex(
    (item) => item._id === draggedModuleId
  );

  const toIndex = reordered.findIndex(
    (item) => item._id === targetModuleId
  );

  if (fromIndex === -1 || toIndex === -1) {
    setDraggedModuleId(null);
    return;
  }

  const [movedModule] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, movedModule);

  const updatedModules = reordered.map((module, index) => ({
    ...module,
    order: index,
  }));

  


  setAllModules(updatedModules);
  setDraggedModuleId(null);

  try {
    setSavingOrder(true);

    const { data } = await axios.put(API.reorder, {
      subjectId: selectSubject,
      modules:updatedModules.map((module) => module._id),
    },{
            headers: {
      Authorization: `Bearer ${token}`,
    }});

    if (!data.success) {
      throw new Error(data.message || "Unable to save module order");
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Module order saved",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (error) {
    // Restore the previous order if the API fails
    setAllModules(previousModules);

    Swal.fire({
      icon: "error",
      title: "Order not saved",
      text: getErrorMessage(error, "Unable to save module order"),
    });
  } finally {
    setSavingOrder(false);
  }
};

  useEffect(() => {
    closeForm(); // resets form, editingId AND createAdd

    if (!selectSubject) {
      requestIdRef.current++;
      setAllModules([]);
      return;
    }

    fetchModules(selectSubject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectSubject]);

  const handleSelectSubject = async (subjectId) => {
    if (subjectId === selectSubject) return;
    if (createAdd && !(await confirmDiscard())) return;
    setSelectSubject(subjectId);
  };

  /* =====================================================
     DERIVED DATA
  ===================================================== */

  const sortedModules = useMemo(
    () => [...allModules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allModules]
  );

  /* =====================================================
     SUBMIT (CREATE / UPDATE)
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectSubject) {
      Swal.fire({
        icon: "warning",
        title: "Select subject",
        text: "Please select a subject first",
      });
      return;
    }

    if (!form.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Chapter name required",
        text: "Please enter chapter name",
      });
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    };

    try {
      setSubmitLoading(true);

      if (isEditing) {
        const { data } = await axios.put(API.update(editingId), {
          ...payload,
          subjectId: selectSubject,
        },{
            headers: {
      Authorization: `Bearer ${token}`,
    }});

        if (!data.success) throw new Error(data.message || "Update failed");

        setAllModules((prev) =>
          prev.map((module) =>
            module._id === editingId
              ? { ...module, ...payload, ...(data.module || {}) }
              : module
          )
        );

        closeForm();

        Swal.fire({
          icon: "success",
          title: "Chapter updated",
          text: "Your changes have been saved",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        const { data } = await axios.post(API.create, {
          ...payload,
          subjectId: selectSubject,
        },{
            headers: {
      Authorization: `Bearer ${token}`,
    }});

        if (!data.success) throw new Error(data.message || "Create failed");

        setAllModules((prev) => [...prev, data.module]);

        closeForm();

        Swal.fire({
          icon: "success",
          title: "Chapter created",
          text: "New chapter has been added successfully",
          timer: 1600,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Save module error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: getErrorMessage(
          error,
          error.message ||
            (isEditing
              ? "Unable to update chapter"
              : "Unable to create chapter")
        ),
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (module) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete chapter?",
      html: `<b>${escapeHtml(
        module.title
      )}</b> will be permanently deleted.<br/>This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
      focusCancel: true,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async () => {
        try {
          const { data } = await axios.delete(API.remove(module._id),{
            headers: {
      Authorization: `Bearer ${token}`,
    }});
          if (!data.success) throw new Error(data.message || "Delete failed");
          return true;
        } catch (error) {
          Swal.showValidationMessage(
            getErrorMessage(error, error.message || "Unable to delete chapter")
          );
          return false;
        }
      },
    });

    if (!result.isConfirmed) return;

    setAllModules((prev) => prev.filter((item) => item._id !== module._id));

    // If the deleted chapter was being edited, close the form
    if (editingId === module._id) closeForm();

    Swal.fire({
      icon: "success",
      title: "Deleted",
      text: "Chapter has been deleted",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  /* =====================================================
     PERMISSION CHECK (after all hooks)
  ===================================================== */




  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className=" overflow-auto bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto">
      
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Admin</span>
              <FiChevronRight size={14} />
              <span>Subjects</span>
              <FiChevronRight size={14} />
              <span className="text-slate-700">Modules</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Module Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage chapters for your subjects.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchModules()}
            disabled={!selectSubject || moduleLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              size={16}
              className={moduleLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div>
          {/* ---------- Subjects list ---------- */}
          <aside className="h-fit">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FiLayers size={16} className="text-[#153497]" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Subjects
                  </h2>
                </div>

               
                  <button
                    type="button"
                    onClick={openCreate}
                    disabled={submitLoading}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#06c7b770] px-3 py-1 text-xs font-semibold text-[#073f41] transition hover:bg-[#06c7b7a0] disabled:opacity-50"
                  >
                    <FiPlus size={13} />
                    Create
                  </button>
             
              </div>

              <div className="flex overflow-y-auto overscroll-contain lg:max-h-[calc(100vh-10rem)]">
                {loading ? (
                  <div className="space-y-1.5 p-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-9 animate-pulse rounded-lg bg-slate-100"
                      />
                    ))}
                  </div>
                ) : allSubject.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <FiBookOpen
                      size={24}
                      className="mx-auto mb-2 text-slate-300"
                    />
                    <p className="text-sm text-slate-500">No subjects found</p>
                  </div>
                ) : (
                  allSubject.map((subject) => {
                    const isSelected = selectSubject === subject._id;

                    return (
                      <button
                        key={subject._id}
                        type="button"
                        onClick={() => handleSelectSubject(subject._id)}
                        aria-current={isSelected ? "true" : undefined}
                        className={`flex shrink-0 items-center gap-2.5 border-l-2 px-4 py-2.5 text-left transition focus:outline-none focus-visible:bg-slate-50 ${
                          isSelected
                            ? "border-[#120453] bg-[#153497]/10"
                            : "border-transparent hover:bg-slate-50"
                        }`}
                      >
                        <FiBookOpen
                          size={15}
                          className={`shrink-0 ${
                            isSelected ? "text-[#120453]" : "text-slate-400"
                          }`}
                        />

                        <span
                          className={`min-w-0 flex-1 truncate text-sm ${
                            isSelected
                              ? "font-semibold text-[#120453]"
                              : "font-medium text-slate-700"
                          }`}
                          title={subject.title}
                        >
                          {subject.title}
                        </span>

                        <FiChevronRight
                          size={14}
                          className={`shrink-0 duration-200 ${
                            isSelected
                              ? "rotate-90 text-[#120453]"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* ---------- Main ---------- */}
          <main className="mt-10 min-w-0">
            {!selectSubject ? (
              <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                <div className="max-w-sm px-6 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#153497]/10 text-[#153497]">
                    <FiBookOpen size={30} />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Select a subject
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose a subject from the list above to view and manage
                    chapters.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ---------- Create / Edit form ---------- */}
               
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                      isEditing ? "border-amber-300" : "border-slate-200"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between border-b px-5 py-4 md:px-6 ${
                        isEditing
                          ? "border-amber-100 bg-amber-50/60"
                          : "border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            isEditing
                              ? "bg-amber-100 text-amber-600"
                              : "bg-[#153497]/10 text-[#153497]"
                          }`}
                        >
                          {isEditing ? (
                            <FiEdit3 size={19} />
                          ) : (
                            <FiPlus size={19} />
                          )}
                        </div>

                        <div>
                          <h2 className="font-bold text-slate-900">
                            {isEditing ? "Edit Module" : "Add New Module"}
                          </h2>

                          <p className="text-xs text-slate-400">
                            {isEditing
                              ? "Update the details and save your changes."
                              : "Add learning content to this subject."}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={submitLoading}
                        aria-label="Close form"
                        className={`inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                          isEditing
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <FiX size={14} />
                        {isEditing ? "Cancel edit" : "Close"}
                      </button>
                    </div>

                    <div className="space-y-5 p-5 md:p-6">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_180px]">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Module Name
                            <span className="ml-1 text-red-500">*</span>
                          </label>

                          <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Introduction to CSSD"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Status
                          </label>

                          <select
                            name="status"
                            value={form.status}
                            onChange={handleInputChange}
                            className={`${inputClass} font-medium`}
                          >
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Description
                        </label>

                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Write a short description..."
                          className={`${inputClass} resize-none leading-6`}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Module Content
                        </label>

                        <RichEditor
                          key={editingId || "new-chapter"}
                          content={form.content}
                          setContent={(value) =>
                            setForm((prev) => ({ ...prev, content: value }))
                          }
                          placeholder="Write chapter content here..."
                          minHeight="320px"
                        />
                      </div>

                      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    

                       <select value={form.assignteacher}  className={`rounded-xl capitalize border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#153497] focus:ring-4 focus:ring-[#153497]/10 font-medium `} name="assignteacher" onChange={handleInputChange}>
                        <option  value={""} disabled >---Select Teacher ---</option>
{allteachers?.map((item)=><option value={item._id}  key={item._id} >

{item?.fullname}
</option>)}

                       </select>


 <select value={form.level}  className={`rounded-xl capitalize border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#153497] focus:ring-4 focus:ring-[#153497]/10 font-medium `} name="level" onChange={handleInputChange}>
                       
{[1,2,3,4,5]?.map((item)=><option value={item}  key={item} >

{item}
</option>)}

                       </select>


                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={submitLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={submitLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#153497] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102875] disabled:opacity-60"
                        >
                          {submitLoading ? (
                            <>
                              <FiRefreshCw size={16} className="animate-spin" />
                              {isEditing ? "Saving..." : "Creating..."}
                            </>
                          ) : isEditing ? (
                            <>
                              <FiSave size={17} />
                              Save Changes
                            </>
                          ) : (
                            <>
                              <FiPlus size={17} />
                              Add Module
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
            

                {/* ---------- Modules list ---------- */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
                    <div>
                      <h2 className="font-bold text-slate-900">Modules</h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        All Modules for this subject
                      </p>
                    </div>

                    <span className="rounded-full bg-[#153497]/10 px-3 py-1 text-xs font-bold text-[#153497]">
                      {allModules.length}{" "}
                      {allModules.length === 1 ? "Chapter" : "Chapters"}
                    </span>
                  </div>

                  <div className="p-4 md:p-6">
                    {moduleLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="h-24 animate-pulse rounded-xl bg-slate-100"
                          />
                        ))}
                      </div>
                    ) : sortedModules.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <FiFileText size={25} />
                        </div>

                        <h3 className="font-semibold text-slate-700">
                          No chapters yet
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          No chapters have been added to this subject.
                        </p>

                 
                          <button
                            type="button"
                            onClick={openCreate}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#153497] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#102875]"
                          >
                            <FiPlus size={16} />
                            Create chapter
                          </button>
                     
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedModules.map((module, index) => {
                          const beingEdited = editingId === module._id;

                          return (
                            <div
                               key={module._id}
  draggable={!savingOrder}
  onDragStart={(e) => {
   

    setDraggedModuleId(module._id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", module._id);
  }}
  onDragOver={(e) => {
    if (!draggedModuleId) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }}
  onDrop={(e) => {
    e.preventDefault();

    const sourceId =
      e.dataTransfer.getData("text/plain") || draggedModuleId;

    if (sourceId) {
      setDraggedModuleId(sourceId);
      handleModuleDrop(module._id);
    }
  }}
  onDragEnd={() => setDraggedModuleId(null)}
  className={`min-w-0 rounded-xl border bg-white p-4 transition cursor-grab active:cursor-grabbing${
    draggedModuleId === module._id
      ? "border-[#153497] opacity-40"
      : beingEdited
        ? "border-amber-300 bg-amber-50/40"
        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
  }`}
                            >
                              {/* Header */}
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#153497]/10 text-sm font-bold text-[#153497]">
                                  {String(index + 1).padStart(2, "0")}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h3 className="break-words font-serif text-xl font-semibold capitalize leading-snug text-slate-800">
                                    {module.title}
                                  </h3>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    {module.status === "PUBLISHED" ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                                        <FiCheckCircle size={12} />
                                        Published
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
                                        <FiClock size={12} />
                                        Draft
                                      </span>
                                    )}

                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                      Order: {(module.order ?? index) + 1}
                                    </span>
{/* 
                                    <Link
                                      to={`/admin/question/${module._id}`}
                                      className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-600 transition hover:bg-blue-200"
                                    >
                                      Q&A
                                    </Link> */}


  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                      Assign to : {allteachers?.find((itm)=>itm._id==module?.assignteacher)?.fullname}
                                    </span>
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                                        
                                        Level : {module?.level}
                                      </span>
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5">
                                
                                    <button
                                      type="button"
                                      title="Edit chapter"
                                      aria-label="Edit chapter"
                                      onClick={() => handleEditClick(module)}
                                      disabled={submitLoading}
                                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#153497]/20 hover:bg-[#153497]/5 hover:text-[#153497] disabled:opacity-50"
                                    >
                                      <FiEdit3 size={15} />
                                    </button>
                          
                                  <div className="flex items-center gap-2">

    <span
      title="Drag to reorder module"
      className="cursor-grab touch-none text-slate-400 active:cursor-grabbing"
    >
      <FiLayers size={18} />
    </span>


  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#153497]/10 text-sm font-bold text-[#153497]">
    {String(index + 1).padStart(2, "0")}
  </div>
</div>

                              
                                    <button
                                      type="button"
                                      title="Delete chapter"
                                      aria-label="Delete chapter"
                                      onClick={() => handleDelete(module)}
                                      disabled={submitLoading}
                                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                    >
                                      <FiTrash2 size={15} />
                                    </button>
                            
                                </div>
                              </div>

                              {/* Description */}
                              {module.description && (
                                <p className="mt-3 break-words text-sm text-slate-500">
                                  {module.description}
                                </p>
                              )}

                              {/* HTML content */}
                              <div className="mt-4 min-w-0 border-t border-slate-100 pt-4">
                                <div
                                  className="
                                    module-content
                                    min-w-0 max-w-full
                                    break-words [overflow-wrap:anywhere]
                                    text-[15px] leading-7 text-slate-700

                                    [&_*]:max-w-full

                                    [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900
                                    [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900
                                    [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900
                                    [&_h1:first-child]:mt-0 [&_h2:first-child]:mt-0 [&_h3:first-child]:mt-0

                                    [&_p]:mb-4 [&_p:last-child]:mb-0

                                    [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6
                                    [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6
                                    [&_li]:mb-1

                                    [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#153497]
                                    [&_blockquote]:bg-slate-50 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic

                                    [&_a]:break-all [&_a]:text-[#153497] [&_a]:underline

                                    [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl
                                    [&_iframe]:max-w-full [&_video]:max-w-full

                                    [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:rounded-lg
                                    [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-slate-100
                                    [&_code]:break-words [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:text-[13px]
                                    [&_pre_code]:bg-transparent [&_pre_code]:p-0

                                    [&_table]:my-4 [&_table]:block [&_table]:overflow-x-auto
                                    [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left
                                    [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2
                                  "
                                  dangerouslySetInnerHTML={{
                                    __html: (
                                      module.content ||
                                      "<p>No content available.</p>"
                                    ).replace(/&nbsp;/g, " "),
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default ChapterPages;