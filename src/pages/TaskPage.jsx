import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  Type, 
  AlignLeft, 
  Activity, 
  AlertCircle, 
  CalendarDays, 
  Palette, 
  Save,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Tag
} from 'lucide-react';
import { base_url } from '../components/utlis';
import { toast } from 'react-toastify';

const TaskPage = () => {
  const { token } = useSelector((state) => state.token);
  
  // State Management
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [allTodo, setAllTodo] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'in_progress', 'completed'

  const initialFormState = {
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    color: "#6366f1", // Default indigo color
  };

  const [formData, setFormData] = useState(initialFormState);

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const getRelativeDueDate = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return null;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return <AlertTriangle size={14} />;
      case 'medium': return <TrendingUp size={14} />;
      case 'low': return <CheckCircle2 size={14} />;
      default: return <Circle size={14} />;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle2 size={14} />;
      case 'in_progress': return <Activity size={14} />;
      case 'pending': return <Clock size={14} />;
      default: return <Circle size={14} />;
    }
  };

  // Filter tasks
  const getFilteredTodos = () => {
    if (filter === 'all') return allTodo;
    return allTodo.filter(todo => todo.status === filter);
  };

  const filteredTodos = getFilteredTodos();

  // Handle Input Changes
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form and close form view
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  // Open create form
  const openCreateForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(true);
  };

  // Fetch all Tasks
  const getTodo = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${base_url}/todo/gettodo`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (data.success) {
        setAllTodo(data.todo || []);
      } else {
        toast.error(data.message || "Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Create or Update Task
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate title
    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    
    const url = editingId 
      ? `${base_url}/todo/update/${editingId}` 
      : `${base_url}/todo/create`;
    const method = editingId ? "PUT" : "POST";

    setIsSubmitting(true);
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || `Task ${editingId ? 'updated' : 'created'} successfully`);
        resetForm();
        await getTodo(); // Refresh the list
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error(error?.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${base_url}/todo/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Task deleted successfully");
        setAllTodo((prev) => prev.filter(todo => todo._id !== id));
      } else {
        toast.error(data.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Edit Task
  const handleEdit = (todo) => {
    setFormData({
      title: todo.title,
      description: todo.description || "",
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : "",
      color: todo.color || "#6366f1",
    });
    setEditingId(todo._id);
    setShowForm(true);
  };

  // Toggle task status (quick update)
  const handleStatusToggle = async (todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    const updatedTodo = { ...todo, status: newStatus };
    
    try {
      const response = await fetch(`${base_url}/todo/update/${todo._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedTodo)
      });

      const data = await response.json();
      
      if (data.success) {
        setAllTodo(prev => prev.map(t => t._id === todo._id ? { ...t, status: newStatus } : t));
        toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update task status");
    }
  };

  useEffect(() => {
    if (token) {
      getTodo();
    }
  }, [token, getTodo]);

  // Empty State Component
  const EmptyState = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle2 size={48} className="text-indigo-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">No tasks yet</h2>
        <p className="text-gray-600 mb-8">
          Get started by creating your first task. Track your progress and stay organized!
        </p>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
        >
          <Plus size={20} />
          Create Your First Task
        </button>
      </div>
    </div>
  );

  // Loading State
  if (isLoading && allTodo.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* FORM VIEW */}
      {showForm && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 flex justify-center items-start">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 animate-fade-in">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {editingId ? "Edit Task" : "Create New Task"}
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                  {editingId ? "Update your task details below." : "Fill in the details to track your upcoming work."}
                </p>
              </div>
              
              {/* Cancel Button */}
              {(allTodo.length > 0 || editingId) && (
                <button 
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title */}
              <div>
                <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Type size={16} className="text-indigo-500" />
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  id="title" 
                  value={formData.title}
                  onChange={handleInput}
                  required
                  placeholder="e.g., Update landing page copy"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <AlignLeft size={16} className="text-indigo-500" />
                  Description
                </label>
                <textarea 
                  name="description" 
                  id="description" 
                  value={formData.description}
                  onChange={handleInput}
                  rows="4"
                  placeholder="Provide more context about this task..."
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
                  disabled={isSubmitting}
                ></textarea>
              </div>

              {/* 2-Column Grid for Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="status" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Activity size={16} className="text-indigo-500" />
                    Status
                  </label>
                  <select 
                    name="status" 
                    id="status" 
                    value={formData.status}
                    onChange={handleInput}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all capitalize cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {["pending", "in_progress", "completed"].map((item) => (
                      <option className="capitalize" value={item} key={item}>
                        {item.split("_").join(" ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <AlertCircle size={16} className="text-indigo-500" />
                    Priority
                  </label>
                  <select 
                    name="priority" 
                    id="priority" 
                    value={formData.priority}
                    onChange={handleInput}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all capitalize cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {["low", "medium", "high"].map((item) => (
                      <option className="capitalize" value={item} key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2-Column Grid for Date & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dueDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <CalendarDays size={16} className="text-indigo-500" />
                    Due Date
                  </label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    value={formData.dueDate}
                    onChange={handleInput}
                    id="dueDate" 
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="color" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Palette size={16} className="text-indigo-500" />
                    Label Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      name="color" 
                      id="color" 
                      value={formData.color}
                      onChange={handleInput}
                      className="h-12 w-12 rounded-xl cursor-pointer border-2 border-gray-200 hover:border-indigo-500 transition-all"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-500">Choose a color for your task tag</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                {(allTodo.length > 0 || editingId) && (
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {editingId ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingId ? "Update Task" : "Save Task"}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {!showForm && allTodo.length > 0 && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          
          {/* Header with Stats and Filters */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  My Tasks
                </h1>
                <p className="text-gray-500 mt-1">
                  {allTodo.length} task{allTodo.length !== 1 ? 's' : ''} total • 
                  {allTodo.filter(t => t.status === 'completed').length} completed
                </p>
              </div>
              <button 
                onClick={openCreateForm}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus size={18} />
                Add New Task
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-4">
              {[
                { value: 'all', label: 'All Tasks', icon: <Tag size={16} /> },
                { value: 'pending', label: 'Pending', icon: <Clock size={16} /> },
                { value: 'in_progress', label: 'In Progress', icon: <Activity size={16} /> },
                { value: 'completed', label: 'Completed', icon: <CheckCircle2 size={16} /> }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === tab.value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout for Tasks */}
          <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTodos.map((todo) => {
              const dueDateObj = formatDate(todo.dueDate);
              const relativeDate = getRelativeDueDate(todo.dueDate);
              
              return (
                <div 
                  key={todo._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in"
                  style={{ 
                    borderTop: `4px solid ${todo.color || '#6366f1'}`,
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors">
                          {todo.title}
                        </h2>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(todo)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(todo._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Task"
                          disabled={deletingId === todo._id}
                        >
                          {deletingId === todo._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {todo.description && (
                      <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                        {todo.description}
                      </p>
                    )}

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => handleStatusToggle(todo)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all hover:scale-105 ${getStatusColor(todo.status)}`}
                      >
                        {getStatusIcon(todo.status)}
                        {todo.status.replace('_', ' ')}
                      </button>
                      
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${getPriorityColor(todo.priority)}`}>
                        {getPriorityIcon(todo.priority)}
                        {todo.priority}
                      </span>
                    </div>

                    {/* Due Date & Color Tag */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {dueDateObj ? (
                          <span className="text-xs font-medium text-gray-600">
                            {dueDateObj.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {relativeDate && (
                              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs font-semibold ${
                                relativeDate === 'Overdue' ? 'bg-red-100 text-red-700' :
                                relativeDate === 'Today' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {relativeDate}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No due date</span>
                        )}
                      </div>
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: todo.color || '#6366f1' }}
                        title="Task color"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results Message */}
          {filteredTodos.length === 0 && filter !== 'all' && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks with status "{filter.replace('_', ' ')}"</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!showForm && allTodo.length === 0 && <EmptyState />}
    </>
  );
};

export default TaskPage;