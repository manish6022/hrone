"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Calendar, Briefcase, CheckCircle, XCircle, AlertCircle, 
  FileText, Plus, Save, X, Search, Filter, Download, Upload,
  ChevronLeft, ChevronRight, MoreVertical, Edit3, Trash2,
  BarChart3, Timer, UserCheck, Send, History, Settings,
  ChevronDown, ChevronUp, Eye, CheckSquare, XSquare, Users
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface TimesheetEntry {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  breakTime: number;
  description: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  billable: boolean;
  overtime: boolean;
  managerComments?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  active: boolean;
}

interface Task {
  id: string;
  projectId: string;
  name: string;
  category: string;
}

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  billableHours: number;
  overtimeHours: number;
  entries: number;
  status: string;
}

interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
}

// ============================================
// MOCK DATA
// ============================================

const mockProjects: Project[] = [
  { id: 'PRJ-001', name: 'Website Redesign', client: 'ABC Corp', budget: 500, spent: 320, active: true },
  { id: 'PRJ-002', name: 'API Integration', client: 'XYZ Ltd', budget: 800, spent: 450, active: true },
  { id: 'PRJ-003', name: 'Mobile App Development', client: 'Tech Startup', budget: 1200, spent: 680, active: true },
  { id: 'PRJ-004', name: 'Database Migration', client: 'Internal', budget: 300, spent: 150, active: false },
];

const mockTasks: Task[] = [
  { id: 'TSK-001', projectId: 'PRJ-001', name: 'Frontend Development', category: 'Development' },
  { id: 'TSK-002', projectId: 'PRJ-001', name: 'UI/UX Design', category: 'Design' },
  { id: 'TSK-003', projectId: 'PRJ-001', name: 'Testing', category: 'QA' },
  { id: 'TSK-004', projectId: 'PRJ-002', name: 'Backend API', category: 'Development' },
  { id: 'TSK-005', projectId: 'PRJ-002', name: 'Documentation', category: 'Documentation' },
  { id: 'TSK-006', projectId: 'PRJ-003', name: 'iOS Development', category: 'Development' },
  { id: 'TSK-007', projectId: 'PRJ-003', name: 'Android Development', category: 'Development' },
];

const mockEmployees: Employee[] = [
  { id: 1, name: "John Doe", department: "Engineering", role: "Senior Developer" },
  { id: 2, name: "Sarah Connor", department: "Design", role: "UI/UX Designer" },
  { id: 3, name: "Mike Ross", department: "Engineering", role: "Backend Developer" },
  { id: 4, name: "Emily Chen", department: "QA", role: "QA Engineer" },
  { id: 5, name: "David Kumar", department: "Management", role: "Project Manager" },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateHours(startTime: string, endTime: string, breakTime: number): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.max(0, diffHours - breakTime);
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-slate-100 border-slate-300 text-slate-700';
    case 'submitted': return 'bg-blue-100 border-blue-300 text-blue-700';
    case 'under_review': return 'bg-amber-100 border-amber-300 text-amber-700';
    case 'approved': return 'bg-emerald-100 border-emerald-300 text-emerald-700';
    case 'rejected': return 'bg-red-100 border-red-300 text-red-700';
    default: return 'bg-gray-100 border-gray-300 text-gray-700';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'draft': return <FileText className="h-4 w-4" />;
    case 'submitted': return <Send className="h-4 w-4" />;
    case 'under_review': return <Eye className="h-4 w-4" />;
    case 'approved': return <CheckCircle className="h-4 w-4" />;
    case 'rejected': return <XCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TimesheetPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'my_timesheets' | 'team_timesheets' | 'approvals' | 'reports'>('my_timesheets');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('week');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Timesheet entries state
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimesheetEntry[]>([]);
  
  // Form state
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Projects and tasks
  const [projects] = useState<Project[]>(mockProjects);
  const [tasks] = useState<Task[]>(mockTasks);
  
  // Summary stats
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);

  // Initialize mock data
  useEffect(() => {
    const mockEntries: TimesheetEntry[] = [
      {
        id: 1,
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        projectId: "PRJ-001",
        projectName: "Website Redesign",
        taskId: "TSK-001",
        taskName: "Frontend Development",
        date: "2024-01-15",
        startTime: "09:00",
        endTime: "17:00",
        hours: 7.5,
        breakTime: 0.5,
        description: "Implemented responsive navbar and hero section",
        status: "approved",
        billable: true,
        overtime: false,
        approvedBy: "David Kumar",
        approvedAt: "2024-01-16T10:00:00Z"
      },
      {
        id: 2,
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        projectId: "PRJ-002",
        projectName: "API Integration",
        taskId: "TSK-004",
        taskName: "Backend API",
        date: "2024-01-16",
        startTime: "09:00",
        endTime: "19:00",
        hours: 9.5,
        breakTime: 0.5,
        description: "Developed authentication endpoints and JWT implementation",
        status: "submitted",
        billable: true,
        overtime: true,
        submittedAt: "2024-01-16T20:00:00Z"
      },
      {
        id: 3,
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        projectId: "PRJ-001",
        projectName: "Website Redesign",
        taskId: "TSK-002",
        taskName: "UI/UX Design",
        date: "2024-01-17",
        startTime: "09:00",
        endTime: "18:00",
        hours: 8,
        breakTime: 1,
        description: "Created design mockups for contact page",
        status: "draft",
        billable: true,
        overtime: false
      },
      {
        id: 4,
        employeeId: 2,
        employeeName: "Sarah Connor",
        department: "Design",
        projectId: "PRJ-001",
        projectName: "Website Redesign",
        taskId: "TSK-002",
        taskName: "UI/UX Design",
        date: "2024-01-15",
        startTime: "10:00",
        endTime: "18:00",
        hours: 7,
        breakTime: 1,
        description: "Designed landing page layout and color scheme",
        status: "under_review",
        billable: true,
        overtime: false,
        submittedAt: "2024-01-15T19:00:00Z"
      }
    ];
    
    setEntries(mockEntries);
    calculateWeeklySummary(mockEntries, currentWeek);
  }, []);

  // Filter entries based on search, status, and date
  useEffect(() => {
    let filtered = entries;
    
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    if (projectFilter !== 'all') {
      filtered = filtered.filter(e => e.projectId === projectFilter);
    }
    
    setFilteredEntries(filtered);
  }, [entries, searchQuery, statusFilter, projectFilter]);

  // Calculate weekly summary
  const calculateWeeklySummary = (entriesList: TimesheetEntry[], weekDate: Date) => {
    const startOfWeek = new Date(weekDate);
    startOfWeek.setDate(weekDate.getDate() - weekDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekEntries = entriesList.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });
    
    const summary: WeeklySummary = {
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
      totalHours: weekEntries.reduce((sum, e) => sum + e.hours, 0),
      billableHours: weekEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0),
      overtimeHours: weekEntries.filter(e => e.overtime).reduce((sum, e) => sum + e.hours, 0),
      entries: weekEntries.length,
      status: weekEntries.every(e => e.status === 'approved') ? 'approved' : 
              weekEntries.some(e => e.status === 'rejected') ? 'rejected' : 
              weekEntries.some(e => e.status === 'under_review') ? 'under_review' : 'draft'
    };
    
    setWeeklySummary(summary);
  };

  // Navigation functions
  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newDate);
    calculateWeeklySummary(entries, newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newDate);
    calculateWeeklySummary(entries, newDate);
  };

  // Entry management
  const handleSaveEntry = (entryData: Partial<TimesheetEntry>) => {
    if (editingEntry) {
      // Update existing entry
      setEntries(prev => prev.map(e => 
        e.id === editingEntry.id ? { ...e, ...entryData } as TimesheetEntry : e
      ));
    } else {
      // Create new entry
      const newEntry: TimesheetEntry = {
        id: Date.now(),
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        projectId: entryData.projectId || '',
        projectName: projects.find(p => p.id === entryData.projectId)?.name || '',
        taskId: entryData.taskId,
        taskName: tasks.find(t => t.id === entryData.taskId)?.name,
        date: entryData.date || new Date().toISOString().split('T')[0],
        startTime: entryData.startTime || '09:00',
        endTime: entryData.endTime || '17:00',
        hours: calculateHours(entryData.startTime || '09:00', entryData.endTime || '17:00', entryData.breakTime || 0),
        breakTime: entryData.breakTime || 0,
        description: entryData.description || '',
        status: 'draft',
        billable: entryData.billable || false,
        overtime: entryData.overtime || false
      };
      setEntries(prev => [...prev, newEntry]);
    }
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const handleSubmitEntry = (entryId: number) => {
    setEntries(prev => prev.map(e => 
      e.id === entryId ? { ...e, status: 'submitted', submittedAt: new Date().toISOString() } : e
    ));
  };

  const handleDeleteEntry = (entryId: number) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const handleApproveEntry = (entryId: number, comments?: string) => {
    setEntries(prev => prev.map(e => 
      e.id === entryId ? { 
        ...e, 
        status: 'approved', 
        approvedAt: new Date().toISOString(),
        approvedBy: "Manager",
        managerComments: comments
      } : e
    ));
  };

  const handleRejectEntry = (entryId: number, comments: string) => {
    setEntries(prev => prev.map(e => 
      e.id === entryId ? { 
        ...e, 
        status: 'rejected',
        managerComments: comments
      } : e
    ));
  };

  if (!hasPermission("view_attendance")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100">
        <div className="bg-white/80 backdrop-blur-md border border-violet-200 rounded-2xl p-8 text-center shadow-xl">
          <XCircle className="h-16 w-16 text-violet-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-violet-900">Access Denied</h3>
          <p className="text-violet-700 mt-2">You don't have permission to view timesheet management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-100">
      <div className="px-4 py-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Timesheet Management</h1>
              <p className="text-slate-600 mt-1">Track work hours, manage projects, and streamline approvals</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowEntryForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-md"
              >
                <Plus className="h-5 w-5" />
                Log Time
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all">
                <Download className="h-5 w-5" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 border border-white/50 shadow-md mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'my_timesheets', label: 'My Timesheets', icon: Clock },
              { id: 'team_timesheets', label: 'Team Timesheets', icon: Users },
              { id: 'approvals', label: 'Pending Approvals', icon: CheckSquare },
              { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-violet-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* MY TIMESHEETS TAB */}
        {activeTab === 'my_timesheets' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Weekly Summary Cards */}
            {weeklySummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                  <div className="text-sm text-slate-600 mb-1">Total Hours</div>
                  <div className="text-3xl font-bold text-violet-700">{formatHours(weeklySummary.totalHours)}</div>
                  <div className="text-xs text-slate-500 mt-1">This week</div>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                  <div className="text-sm text-slate-600 mb-1">Billable Hours</div>
                  <div className="text-3xl font-bold text-emerald-600">{formatHours(weeklySummary.billableHours)}</div>
                  <div className="text-xs text-emerald-600 mt-1">{Math.round((weeklySummary.billableHours / weeklySummary.totalHours) * 100)}% of total</div>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                  <div className="text-sm text-slate-600 mb-1">Overtime</div>
                  <div className="text-3xl font-bold text-amber-600">{formatHours(weeklySummary.overtimeHours)}</div>
                  <div className="text-xs text-amber-600 mt-1">Extra hours</div>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                  <div className="text-sm text-slate-600 mb-1">Entries</div>
                  <div className="text-3xl font-bold text-blue-600">{weeklySummary.entries}</div>
                  <div className="text-xs text-slate-500 mt-1">Time logs</div>
                </div>
              </div>
            )}

            {/* Week Navigator */}
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-md">
              <div className="flex items-center justify-between">
                <button 
                  onClick={previousWeek}
                  className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div className="text-center">
                  <div className="font-semibold text-slate-800">
                    Week of {currentWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-sm text-slate-500">
                    {weeklySummary?.weekStart} - {weeklySummary?.weekEnd}
                  </div>
                </div>
                <button 
                  onClick={nextWeek}
                  className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-md">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search projects or descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select 
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500"
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timesheet Entries */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Time Entries</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {filteredEntries.filter(e => e.employeeId === 1).map((entry) => (
                    <div key={entry.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-800">{entry.projectName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                              {getStatusIcon(entry.status)}
                              <span className="ml-1">{entry.status.replace('_', ' ').toUpperCase()}</span>
                            </span>
                            {entry.billable && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                Billable
                              </span>
                            )}
                            {entry.overtime && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                Overtime
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-1">{entry.taskName}</p>
                          <p className="text-sm text-slate-500">{entry.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-slate-500">
                            <span>{entry.date}</span>
                            <span>{entry.startTime} - {entry.endTime}</span>
                            <span className="font-medium text-slate-700">{formatHours(entry.hours)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {entry.status === 'draft' && (
                            <>
                              <button 
                                onClick={() => handleSubmitEntry(entry.id)}
                                className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700"
                              >
                                Submit
                              </button>
                              <button 
                                onClick={() => { setEditingEntry(entry); setShowEntryForm(true); }}
                                className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {entry.status === 'submitted' && (
                            <button className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm">
                              Pending Review
                            </button>
                          )}
                          {entry.status === 'approved' && (
                            <div className="text-sm text-emerald-600">
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Approved by {entry.approvedBy}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TEAM TIMESHEETS TAB */}
        {activeTab === 'team_timesheets' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Team Time Entries</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-semibold">
                            {entry.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{entry.employeeName}</h4>
                            <p className="text-sm text-slate-500">{entry.department}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                          {entry.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 ml-13">
                        <p className="font-medium text-slate-700">{entry.projectName} - {entry.taskName}</p>
                        <p className="text-sm text-slate-600">{entry.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-slate-500">{entry.date}</span>
                          <span className="font-medium text-slate-700">{formatHours(entry.hours)}</span>
                          {entry.billable && <span className="text-emerald-600">Billable</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Pending Approvals</h3>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  {entries.filter(e => e.status === 'submitted' || e.status === 'under_review').length} pending
                </span>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {entries.filter(e => e.status === 'submitted' || e.status === 'under_review').map((entry) => (
                    <div key={entry.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-semibold">
                            {entry.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{entry.employeeName}</h4>
                            <p className="text-sm text-slate-500">{entry.department} • Submitted {new Date(entry.submittedAt || '').toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-violet-700">{formatHours(entry.hours)}</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 mb-3">
                        <p className="font-medium text-slate-700">{entry.projectName}</p>
                        <p className="text-sm text-slate-600">{entry.taskName}</p>
                        <p className="text-sm text-slate-500 mt-1">{entry.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{entry.date}</span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{entry.startTime} - {entry.endTime}</span>
                          {entry.billable && <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded">Billable</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveEntry(entry.id, 'Approved - looks good')}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                        >
                          <CheckSquare className="h-4 w-4" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectEntry(entry.id, 'Needs more detail on tasks completed')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                          <XSquare className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Summary */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-violet-600" />
                  Project Hours Summary
                </h3>
                <div className="space-y-3">
                  {projects.filter(p => p.active).map((project) => {
                    const projectHours = entries
                      .filter(e => e.projectId === project.id && e.status === 'approved')
                      .reduce((sum, e) => sum + e.hours, 0);
                    const percentage = (projectHours / project.budget) * 100;
                    
                    return (
                      <div key={project.id} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-800">{project.name}</h4>
                            <p className="text-sm text-slate-500">{project.client}</p>
                          </div>
                          <span className="text-lg font-bold text-violet-700">{formatHours(projectHours)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-violet-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>Budget: {formatHours(project.budget)}</span>
                          <span>{Math.round(percentage)}% used</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Trend */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-violet-600" />
                  Weekly Hours Trend
                </h3>
                <div className="space-y-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => {
                    const dayHours = [7.5, 9.5, 8, 6, 7.5][idx];
                    const maxHours = 10;
                    
                    return (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-10 text-sm font-medium text-slate-600">{day}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className={`h-full rounded-full flex items-center justify-end px-2 ${
                              dayHours > 8 ? 'bg-amber-500' : 'bg-violet-500'
                            }`}
                            style={{ width: `${(dayHours / maxHours) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">{dayHours}h</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Export Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left">
                  <FileText className="h-8 w-8 text-violet-600 mb-2" />
                  <h4 className="font-semibold text-slate-800">Weekly Report</h4>
                  <p className="text-sm text-slate-500">PDF format</p>
                </button>
                <button className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left">
                  <FileText className="h-8 w-8 text-violet-600 mb-2" />
                  <h4 className="font-semibold text-slate-800">Monthly Summary</h4>
                  <p className="text-sm text-slate-500">Excel format</p>
                </button>
                <button className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left">
                  <FileText className="h-8 w-8 text-violet-600 mb-2" />
                  <h4 className="font-semibold text-slate-800">Project Analysis</h4>
                  <p className="text-sm text-slate-500">CSV format</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Entry Form Modal */}
        <AnimatePresence>
          {showEntryForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingEntry ? 'Edit Time Entry' : 'Log Time'}
                  </h3>
                  <button 
                    onClick={() => { setShowEntryForm(false); setEditingEntry(null); }}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <TimesheetEntryForm 
                    entry={editingEntry}
                    projects={projects}
                    tasks={tasks}
                    onSave={handleSaveEntry}
                    onCancel={() => { setShowEntryForm(false); setEditingEntry(null); }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// TIMESHEET ENTRY FORM COMPONENT
// ============================================

interface TimesheetEntryFormProps {
  entry: TimesheetEntry | null;
  projects: Project[];
  tasks: Task[];
  onSave: (data: Partial<TimesheetEntry>) => void;
  onCancel: () => void;
}

function TimesheetEntryForm({ entry, projects, tasks, onSave, onCancel }: TimesheetEntryFormProps) {
  const [formData, setFormData] = useState<Partial<TimesheetEntry>>({
    projectId: entry?.projectId || '',
    taskId: entry?.taskId || '',
    date: entry?.date || new Date().toISOString().split('T')[0],
    startTime: entry?.startTime || '09:00',
    endTime: entry?.endTime || '17:00',
    breakTime: entry?.breakTime || 0.5,
    description: entry?.description || '',
    billable: entry?.billable || true,
    overtime: entry?.overtime || false,
  });

  const [calculatedHours, setCalculatedHours] = useState(0);

  useEffect(() => {
    const hours = calculateHours(formData.startTime || '09:00', formData.endTime || '17:00', formData.breakTime || 0);
    setCalculatedHours(hours);
  }, [formData.startTime, formData.endTime, formData.breakTime]);

  const filteredTasks = tasks.filter(t => t.projectId === formData.projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
          <select 
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value, taskId: '' })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            required
          >
            <option value="">Select Project</option>
            {projects.filter(p => p.active).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Task</label>
          <select 
            value={formData.taskId}
            onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            required
            disabled={!formData.projectId}
          >
            <option value="">Select Task</option>
            {filteredTasks.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
        <input 
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
          <input 
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
          <input 
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Break (hours)</label>
          <input 
            type="number"
            step="0.25"
            min="0"
            max="2"
            value={formData.breakTime}
            onChange={(e) => setFormData({ ...formData, breakTime: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </div>

      <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-violet-700">Calculated Hours:</span>
          <span className="text-xl font-bold text-violet-800">{formatHours(calculatedHours)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What did you work on?"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 h-24 resize-none"
          required
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox"
            checked={formData.billable}
            onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
          />
          <span className="text-sm text-slate-700">Billable</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox"
            checked={formData.overtime}
            onChange={(e) => setFormData({ ...formData, overtime: e.target.checked })}
            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
          />
          <span className="text-sm text-slate-700">Overtime</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          type="submit"
          className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium"
        >
          {entry ? 'Update Entry' : 'Save Entry'}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
