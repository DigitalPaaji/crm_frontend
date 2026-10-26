import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { agency_url, base_url } from '../../components/utlis'

// npm i chart.js react-chartjs-2
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
)

/* ---------- helpers ---------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const AGENCY_COLORS = ['#3b5bdb', '#0ca678', '#f59f00', '#e8590c', '#7048e8', '#1098ad', '#c2255c', '#868e96', '#74b816']
const ACADEMY_COLORS = ['#0b7285', '#2f9e44', '#f08c00', '#d6336c', '#5f3dc4', '#1c7ed6', '#868e96', '#e03131']

const num = (v) => (Number(v) || 0).toLocaleString('en-IN')
const money = (v) => `₹${(Number(v) || 0).toLocaleString('en-IN')}`
const label = (v) => (v === null || v === undefined || v === '' ? 'Not set' : String(v))
const pretty = (v) => {
  const s = label(v).replace(/_/g, ' ').toLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}

const axisOptions = {
  ...baseOptions,
  scales: {
    x: { grid: { display: false }, ticks: { color: '#5c6370' } },
    y: { beginAtZero: true, ticks: { precision: 0, color: '#5c6370' }, grid: { color: '#eceef1' } },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '64%',
  plugins: { legend: { position: 'right', labels: { boxWidth: 10, boxHeight: 10, color: '#3a3f47' } } },
}

/* ---------- small UI pieces ---------- */

const Stat = ({ title, value, tone }) => (
  <div className={`ah-stat ${tone ? `ah-${tone}` : ''}`}>
    <span className="ah-stat-value">{value}</span>
    <span className="ah-stat-title">{title}</span>
  </div>
)

const ChartCard = ({ title, hint, children, empty }) => (
  <div className="ah-card">
    <div className="ah-card-head">
      <h3>{title}</h3>
      {hint && <span>{hint}</span>}
    </div>
    <div className="ah-chart">
      {empty ? <p className="ah-empty">No data yet</p> : children}
    </div>
  </div>
)

/* ---------- page ---------- */

const AdminHomePage = () => {
  const { token } = useSelector((state) => state.token)
  const [agencyData, setAgencyData] = useState(null)
  const [academyData, setAcademyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({ agency: '', academy: '' })

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }

    const load = async () => {
      setLoading(true)
      // allSettled: if one API fails the other half still renders
      const [agencyRes, academyRes] = await Promise.allSettled([
        axios.get(`${base_url}/auth/admin/dashboard`, { headers }),
        axios.get(`${agency_url}/crm/dashboard/get`, { headers }),
      ])

      const next = { agency: '', academy: '' }

      if (agencyRes.status === 'fulfilled' && agencyRes.value.data.success) {
        setAgencyData(agencyRes.value.data.data)
      } else {
        next.agency = 'Could not load agency data.'
      }

      if (academyRes.status === 'fulfilled' && academyRes.value.data.success) {
        setAcademyData(academyRes.value.data.data)
      } else {
        next.academy = 'Could not load academy data.'
      }

      setErrors(next)
      setLoading(false)
    }

    load()
  }, [token])

  return (
    <div className="ah-page">
      <style>{css}</style>
      {loading ? (
        <div className="ah-loading">Loading dashboard…</div>
      ) : (
        <div className="ah-split">
          <AgencyPanel data={agencyData} error={errors.agency} />
          <AcademyPanel data={academyData} error={errors.academy} />
        </div>
      )}
    </div>
  )
}

/* ---------- agency (left half) ---------- */

const AgencyPanel = ({ data, error }) => {
  const view = useMemo(() => {
    if (!data) return null
    const { summary = {}, charts = {} } = data

    const sources = charts.leadsBySource || []
    const leadFor = charts.leadsByLeadFor || []
    const status = charts.leadsByStatus || []
    const monthly = charts.monthlyLeads || []
    const priority = charts.tasksByPriority || []

    return {
      summary,
      sources: {
        labels: sources.map((s) => label(s._id)),
        datasets: [{ data: sources.map((s) => s.count), backgroundColor: AGENCY_COLORS, borderWidth: 0 }],
      },
      leadFor: {
        labels: leadFor.map((s) => label(s._id)),
        datasets: [{ data: leadFor.map((s) => s.count), backgroundColor: '#3b5bdb', borderRadius: 4 }],
      },
      status: {
        labels: status.map((s) => pretty(s._id)),
        datasets: [{ data: status.map((s) => s.count), backgroundColor: AGENCY_COLORS, borderWidth: 0 }],
      },
      monthly: {
        labels: monthly.map((m) => `${MONTHS[m._id.month - 1]} ${m._id.year}`),
        datasets: [
          {
            data: monthly.map((m) => m.count),
            borderColor: '#3b5bdb',
            backgroundColor: 'rgba(59,91,219,0.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      priority: {
        labels: priority.map((p) => pretty(p._id)),
        datasets: [{ data: priority.map((p) => p.count), backgroundColor: '#f59f00', borderRadius: 4 }],
      },
      has: {
        sources: sources.length > 0,
        leadFor: leadFor.length > 0,
        status: status.length > 0,
        monthly: monthly.length > 0,
        priority: priority.length > 0,
      },
    }
  }, [data])

  return (
    <section className="ah-half ah-agency">
      <header className="ah-header">
        <h2>Agency</h2>
        <p>Leads, follow-ups and tasks</p>
      </header>

      {error && <div className="ah-error">{error}</div>}

      {view && (
        <>
          <div className="ah-stats">
            <Stat title="Total leads" value={num(view.summary.totalLeads)} />
            <Stat title="Overdue follow-ups" value={num(view.summary.overdueFollowups)} tone={view.summary.overdueFollowups > 0 ? 'danger' : ''} />
            <Stat title="Today's follow-ups" value={num(view.summary.todayFollowups)} />
            <Stat title="Upcoming follow-ups" value={num(view.summary.upcomingFollowups)} />
            <Stat title="Interested" value={num(view.summary.interestedLeads)} />
            <Stat title="Converted" value={num(view.summary.convertedLeads)} tone="good" />
            <Stat title="Tasks" value={num(view.summary.totalTasks)} />
          </div>

          <ChartCard title="Leads per month" empty={!view.has.monthly}>
            <Line data={view.monthly} options={axisOptions} />
          </ChartCard>

          <div className="ah-row">
            <ChartCard title="Leads by source" empty={!view.has.sources}>
              <Doughnut data={view.sources} options={doughnutOptions} />
            </ChartCard>
            <ChartCard title="Leads by status" empty={!view.has.status}>
              <Doughnut data={view.status} options={doughnutOptions} />
            </ChartCard>
          </div>

          <div className="ah-row">
            <ChartCard title="Lead requirement" hint="“Not set” = field left empty" empty={!view.has.leadFor}>
              <Bar data={view.leadFor} options={{ ...axisOptions, indexAxis: 'y' }} />
            </ChartCard>
            <ChartCard title="Tasks by priority" empty={!view.has.priority}>
              <Bar data={view.priority} options={axisOptions} />
            </ChartCard>
          </div>
        </>
      )}
    </section>
  )
}

/* ---------- academy (right half) ---------- */

const AcademyPanel = ({ data, error }) => {
  const view = useMemo(() => {
    if (!data) return null
    const {
      leads = {},
      students = {},
      revenue = {},
      installments = {},
      monthlyCollections = [],
      profit = null,
    } = data

    const byStatus = Object.entries(leads.byStatus || {})
    const createdToday = leads.createdTodayByStatus || {}
    const updatedToday = leads.updatedTodayByStatus || {}
    const bySource = Object.entries(leads.bySource || {}).filter(([, v]) => v > 0)
    const byPriority = Object.entries(leads.byPriority || {}).filter(([, v]) => v > 0)
    const studentStatus = Object.entries(students.byStatus || {})

    const inst = [
      ['Registration', installments.registration],
      ['1st installment', installments.first_installment],
      ['2nd installment', installments.second_installment],
      ['3rd installment', installments.third_installment],
    ]

    return {
      leads,
      students,
      revenue,
      profit,
      statusRows: byStatus.map(([k, v]) => ({
        name: pretty(k),
        total: v,
        created: createdToday[k] || 0,
        updated: updatedToday[k] || 0,
      })),
      pipeline: {
        labels: byStatus.map(([k]) => pretty(k)),
        datasets: [{ data: byStatus.map(([, v]) => v), backgroundColor: '#0b7285', borderRadius: 4 }],
      },
      sources: {
        labels: bySource.map(([k]) => pretty(k)),
        datasets: [{ data: bySource.map(([, v]) => v), backgroundColor: ACADEMY_COLORS, borderWidth: 0 }],
      },
      priority: {
        labels: byPriority.map(([k]) => pretty(k)),
        datasets: [{ data: byPriority.map(([, v]) => v), backgroundColor: ACADEMY_COLORS, borderWidth: 0 }],
      },
      studentStatus: {
        labels: studentStatus.map(([k]) => pretty(k)),
        datasets: [{ data: studentStatus.map(([, v]) => v), backgroundColor: ['#2f9e44', '#868e96', '#e03131'], borderWidth: 0 }],
      },
      fees: {
        labels: ['Collected', 'Pending'],
        datasets: [
          {
            data: [revenue.totalCollectedFees || 0, revenue.totalPendingFees || 0],
            backgroundColor: ['#2f9e44', '#dee2e6'],
            borderWidth: 0,
          },
        ],
      },
      installments: {
        labels: inst.map(([k]) => k),
        datasets: [{ data: inst.map(([, v]) => v || 0), backgroundColor: '#f08c00', borderRadius: 4 }],
      },
      monthly: {
        labels: monthlyCollections.map((m) => {
          const [y, mo] = m.month.split('-')
          return `${MONTHS[Number(mo) - 1]} ${y}`
        }),
        datasets: [{ data: monthlyCollections.map((m) => m.totalCollected), backgroundColor: '#2f9e44', borderRadius: 4 }],
      },
      has: {
        pipeline: byStatus.some(([, v]) => v > 0),
        sources: bySource.length > 0,
        priority: byPriority.length > 0,
        students: studentStatus.some(([, v]) => v > 0),
        fees: (revenue.totalCourseFees || 0) > 0,
        installments: (installments.total || 0) > 0,
        monthly: monthlyCollections.length > 0,
      },
    }
  }, [data])

  const moneyOptions = {
    ...axisOptions,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => money(ctx.parsed.y) } },
    },
    scales: {
      ...axisOptions.scales,
      y: { ...axisOptions.scales.y, ticks: { callback: (v) => money(v), color: '#5c6370' } },
    },
  }

  const feeOptions = {
    ...doughnutOptions,
    plugins: {
      ...doughnutOptions.plugins,
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${money(ctx.parsed)}` } },
    },
  }

  return (
    <section className="ah-half ah-academy">
      <header className="ah-header">
        <h2>Academy</h2>
        <p>Admissions, students and fee collection</p>
      </header>

      {error && <div className="ah-error">{error}</div>}

      {view && (
        <>
          {/*  */}
          <div className="ah-stats">
            <Stat title="Total leads" value={num(view.leads.total)} />
            <Stat title="New today" value={num(view.leads.createdToday)} />
            <Stat title="Updated today" value={num(view.leads.updatedToday)} />
            <Stat title="Total students" value={num(view.students.total)} />
            {/* 
            
            <Stat title="Active students" value={num(view.students.active)} tone="good" />
            <Stat title="Inactive students" value={num(view.students.inactive)} />
           <Stat title="Blocked students" value={num(view.students.blocked)} tone={view.students.blocked > 0 ? 'danger' : ''} />
           
          */}
          </div>

          {/* Money */}
          <div className="ah-stats">
            <Stat title="Total course fees" value={money(view.revenue.totalCourseFees)} />
            <Stat title="Collected" value={money(view.revenue.totalCollectedFees)} tone="good" />
            <Stat title="Pending fees" value={money(view.revenue.totalPendingFees)} tone={view.revenue.totalPendingFees > 0 ? 'warn' : ''} />
            <Stat title="Collection rate" value={`${view.revenue.collectionRate ?? 0}%`} />
            <Stat title="Collected this month" value={money(view.revenue.currentMonthCollected)} />
            <Stat title="Collected today" value={money(view.revenue.todayCollected)} />
            {/* <Stat
              title="Profit"
              value={view.profit === null || view.profit === undefined ? 'Not available' : money(view.profit)}
              tone={view.profit > 0 ? 'good' : view.profit < 0 ? 'danger' : ''}
            /> */}
          </div>

          <ChartCard title="Fees collected vs pending" hint={`Course fees ${money(view.revenue.totalCourseFees)}`} empty={!view.has.fees}>
            <Doughnut data={view.fees} options={feeOptions} />
          </ChartCard>

          <div className="ah-row">
            <ChartCard title="Collected by installment" empty={!view.has.installments}>
              <Bar data={view.installments} options={moneyOptions} />
            </ChartCard>
            <ChartCard title="Monthly collection" empty={!view.has.monthly}>
              <Bar data={view.monthly} options={moneyOptions} />
            </ChartCard>
          </div>

          <ChartCard title="Lead pipeline" empty={!view.has.pipeline}>
            <Bar data={view.pipeline} options={{ ...axisOptions, indexAxis: 'y' }} />
          </ChartCard>

          {/* Status table: total / created today / updated today */}
          <div className="ah-card">
            <div className="ah-card-head">
              <h3>Lead status breakdown</h3>
            </div>
            <table className="ah-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Created today</th>
                  <th>Updated today</th>
                </tr>
              </thead>
              <tbody>
                {view.statusRows.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td className={r.total ? '' : 'ah-zero'}>{r.total}</td>
                    <td className={r.created ? '' : 'ah-zero'}>{r.created}</td>
                    <td className={r.updated ? '' : 'ah-zero'}>{r.updated}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{view.leads.total ?? 0}</td>
                  <td>{view.leads.createdToday ?? 0}</td>
                  <td>{view.leads.updatedToday ?? 0}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="ah-row">
            <ChartCard title="Lead source" empty={!view.has.sources}>
              <Doughnut data={view.sources} options={doughnutOptions} />
            </ChartCard>
            <ChartCard title="Lead priority" empty={!view.has.priority}>
              <Doughnut data={view.priority} options={doughnutOptions} />
            </ChartCard>
          </div>

          <ChartCard title="Student status" empty={!view.has.students}>
            <Doughnut data={view.studentStatus} options={doughnutOptions} />
          </ChartCard>
        </>
      )}
    </section>
  )
}

/* ---------- styles ---------- */

const css = `
.ah-page { min-height: 100vh; background: #f4f5f7; padding: 16px; box-sizing: border-box; color: #1f2430; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.ah-page *, .ah-page *::before, .ah-page *::after { box-sizing: border-box; }
.ah-loading { padding: 48px; text-align: center; color: #5c6370; }

.ah-split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
@media (max-width: 1100px) { .ah-split { grid-template-columns: 1fr; } }

.ah-half { background: #fff; border-radius: 12px; padding: 20px; border-top: 4px solid var(--accent); min-width: 0; }
.ah-agency { --accent: #3b5bdb; }
.ah-academy { --accent: #0b7285; }

.ah-header { margin-bottom: 16px; }
.ah-header h2 { margin: 0; font-size: 22px; font-weight: 700; color: var(--accent); }
.ah-header p { margin: 2px 0 0; font-size: 13px; color: #5c6370; }

.ah-error { background: #fff5f5; color: #c92a2a; border: 1px solid #ffc9c9; border-radius: 8px; padding: 10px 12px; font-size: 14px; margin-bottom: 12px; }

.ah-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-bottom: 16px; }
.ah-stat { background: #f4f5f7; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ah-stat-value { font-size: 22px; font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }
.ah-stat-title { font-size: 12px; color: #5c6370; }
.ah-danger { background: #fff5f5; } .ah-danger .ah-stat-value { color: #c92a2a; }
.ah-good { background: #ebfbee; } .ah-good .ah-stat-value { color: #2b8a3e; }
.ah-warn { background: #fff9db; } .ah-warn .ah-stat-value { color: #e67700; }

.ah-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 700px) { .ah-row { grid-template-columns: 1fr; } }

.ah-card { border: 1px solid #e3e6ea; border-radius: 10px; padding: 14px; margin-bottom: 12px; min-width: 0; }
.ah-card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 10px; }
.ah-card-head h3 { margin: 0; font-size: 14px; font-weight: 600; }
.ah-card-head span { font-size: 12px; color: #868e96; }
.ah-chart { position: relative; height: 220px; }
.ah-empty { margin: 0; height: 100%; display: flex; align-items: center; justify-content: center; color: #868e96; font-size: 14px; }

.ah-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ah-table th, .ah-table td { padding: 7px 8px; text-align: right; border-bottom: 1px solid #eceef1; }
.ah-table th:first-child, .ah-table td:first-child { text-align: left; }
.ah-table th { font-weight: 600; color: #5c6370; font-size: 12px; }
.ah-table tfoot td { font-weight: 700; border-bottom: 0; border-top: 2px solid #dee2e6; }
.ah-zero { color: #adb5bd; }
`

export default AdminHomePage