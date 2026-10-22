import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

import {
  FiUser,
  FiMail,
  FiBookOpen,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiHome,
  FiBriefcase,
  FiAward,
} from "react-icons/fi";


import { agency_url } from "../../components/utlis";
import { useSelector } from "react-redux";

const ATTENDANCE_STATUS = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "HALF_DAY",
  "LEAVE",
];

const statusConfig = {
  PRESENT: {
    label: "Present",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: <FiCheckCircle />,
  },

  ABSENT: {
    label: "Absent",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: <FiXCircle />,
  },

  LATE: {
    label: "Late",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    icon: <FiClock />,
  },

  HALF_DAY: {
    label: "Half Day",
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    icon: <FiAlertCircle />,
  },

  LEAVE: {
    label: "Leave",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    icon: <FiHome />,
  },
};

const SingleTeacherPage = () => {
  const { id } = useParams();

const { token } = useSelector((state) => state.token);


  const [teacher, setTeacher] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
  });

  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [todayStatus, setTodayStatus] = useState("PRESENT");

  const [savingAttendance, setSavingAttendance] = useState(false);

  // ---------------------------------------
  // Fetch Teacher
  // ---------------------------------------

  const fetchTeacherData = async () => {
    try {
      setLoading(true);

      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      let url = `${agency_url}/crm/teacher/get/${id}?month=${month}&year=${year}`;

      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }

      const response = await axios.get(url,
        {
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      const data = response.data;

      setTeacher(data.teacher);
      setAttendance(data.attendance || []);
      setSummary(
        data.summary || {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          leave: 0,
        }
      );
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to load teacher data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTeacherData();
    }
  }, [id, currentDate, statusFilter]);




  const isSameDate = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const today = new Date();

  const isToday = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    return isSameDate(date, today);
  };



  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();

    const totalDays = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const days = [];

    // Empty spaces before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    return days;
  }, [currentDate]);



  const getAttendanceForDate = (day) => {
    if (!day) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return attendance.find((item) => {
      const attendanceDate = new Date(item.date);

      return (
        attendanceDate.getFullYear() === year &&
        attendanceDate.getMonth() === month &&
        attendanceDate.getDate() === day
      );
    });
  };



  const previousMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setStatusFilter("ALL");
  };



  const createTodayAttendance = async () => {
    try {
      setSavingAttendance(true);

      const todayDate = new Date();

      const year = todayDate.getFullYear();

      const month = String(
        todayDate.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        todayDate.getDate()
      ).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      await axios.post(
        `${agency_url}/crm/teacher/attendance`,
        {
          teacherId: id,
          date: formattedDate,
          status: todayStatus,
          remarks: "",
        },
        {
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      await Swal.fire({
        icon: "success",
        title: "Attendance Saved",
        text: "Today's attendance has been marked.",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchTeacherData();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Attendance Error",
        text:
          error?.response?.data?.message ||
          "Unable to save attendance",
      });
    } finally {
      setSavingAttendance(false);
    }
  };



  if (loading && !teacher) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-500">
            Loading teacher...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-slate-50 p-4 md:p-6">

      <div className="max-w-7x mx-auto">



        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-center gap-4">

              {/* Profile */}

              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">

                {teacher?.profileImage ? (
                  <img
                    src={teacher.profileImage}
                    alt={teacher.fullname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="text-white text-2xl" />
                )}

              </div>

              <div>

                <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                  {teacher?.fullname}
                </h1>

                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">

                  <span className="flex items-center gap-1.5">
                    <FiMail />
                    {teacher?.email}
                  </span>

                  {teacher?.designation && (
                    <span className="flex items-center gap-1.5">
                      <FiBriefcase />
                      {teacher.designation}
                    </span>
                  )}

                </div>

              </div>

            </div>

            <button
              onClick={goToToday}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              <FiCalendar />
              Today
            </button>

          </div>

        </div>


        

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

          <SummaryCard
            title="Total"
            value={summary.total}
            icon={<FiCalendar />}
            color="slate"
          />

          <SummaryCard
            title="Present"
            value={summary.present}
            icon={<FiCheckCircle />}
            color="green"
          />

          <SummaryCard
            title="Absent"
            value={summary.absent}
            icon={<FiXCircle />}
            color="red"
          />

          <SummaryCard
            title="Late"
            value={summary.late}
            icon={<FiClock />}
            color="yellow"
          />

          <SummaryCard
            title="Leave"
            value={summary.leave}
            icon={<FiHome />}
            color="blue"
          />

        </div>


        {/*  */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Today's Attendance
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Mark attendance for {teacher?.fullname}
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <select
                value={todayStatus}
                onChange={(e) =>
                  setTodayStatus(e.target.value)
                }
                className="border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
              >
                {ATTENDANCE_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {statusConfig[status].label}
                  </option>
                ))}
              </select>

              <button
                disabled={savingAttendance}
                onClick={createTodayAttendance}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {savingAttendance
                  ? "Saving..."
                  : "Mark Attendance"}
              </button>

            </div>

          </div>

        </div>


        {/*  */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Calendar Header */}

          <div className="p-5 border-b border-slate-200">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Attendance Calendar
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {currentDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>

              </div>


              <div className="flex items-center gap-2">

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="ALL">
                    All Status
                  </option>

                  {ATTENDANCE_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {statusConfig[status].label}
                    </option>
                  ))}
                </select>


                <button
                  onClick={previousMonth}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100"
                >
                  <FiChevronLeft />
                </button>

                <button
                  onClick={nextMonth}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100"
                >
                  <FiChevronRight />
                </button>

              </div>

            </div>

          </div>


          {/*  */}

          <div className="p-4 md:p-6">

            {/*  */}

            <div className="grid grid-cols-7 mb-2">

              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs md:text-sm font-semibold text-slate-500 py-3"
                >
                  {day}
                </div>
              ))}

            </div>


            {/*  */}

            <div className="grid grid-cols-7 gap-1 md:gap-2">

              {calendarDays.map((day, index) => {

                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[75px] md:min-h-[100px]"
                    />
                  );
                }

                const item = getAttendanceForDate(day);

                const config =
                  item &&
                  statusConfig[item.status];

                const today = isToday(day);

                return (
                  <div
                    key={day}
                    className={`
                      min-h-[75px]
                      md:min-h-[100px]
                      rounded-xl
                      border
                      p-2
                      md:p-3
                      transition
                      ${
                        today
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-100 bg-white"
                      }
                    `}
                  >

                    <div className="flex items-start justify-between">

                      <span
                        className={`
                          w-7
                          h-7
                          flex
                          items-center
                          justify-center
                          rounded-full
                          text-sm
                          font-semibold
                          ${
                            today
                              ? "bg-slate-900 text-white"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {day}
                      </span>

                      {today && (
                        <span className="text-[10px] font-medium text-slate-500">
                          Today
                        </span>
                      )}

                    </div>


                    {item && config ? (
                      <div className="mt-3">

                        <div
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            px-2
                            py-1
                            rounded-lg
                            text-[10px]
                            md:text-xs
                            font-medium
                            ${config.bg}
                            ${config.text}
                          `}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
                          />

                          {config.label}
                        </div>

                      </div>
                    ) : (
                      <div className="mt-3 text-[10px] md:text-xs text-slate-300">
                        No attendance
                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          </div>


          {/*  */}

          <div className="px-5 py-4 border-t border-slate-200 flex flex-wrap gap-4">

            {ATTENDANCE_STATUS.map((status) => {

              const config =
                statusConfig[status];

              return (
                <div
                  key={status}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${config.dot}`}
                  />

                  {config.label}
                </div>
              );
            })}

          </div>

        </div>

      </div>

    </div>
  );
};



const SummaryCard = ({
  title,
  value,
  icon,
  color,
}) => {

  const colors = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs md:text-sm text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </p>

        </div>

        <div
          className={`
            w-10
            h-10
            rounded-xl
            flex
            items-center
            justify-center
            ${colors[color]}
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

export default SingleTeacherPage;