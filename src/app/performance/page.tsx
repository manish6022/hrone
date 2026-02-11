"use client";

import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, Star, Calendar, Award, Plus, Eye, Edit, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  reviewPeriod: string;
  reviewDate: string;
  reviewer: string;
  overallRating: number;
  goals: Goal[];
  status: 'draft' | 'submitted' | 'approved';
}

interface Goal {
  id: number;
  title: string;
  description: string;
  category: 'productivity' | 'quality' | 'teamwork' | 'initiative';
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
}

export default function PerformancePage() {
  const { hasPermission } = useAuth();
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Q1 2024');

  useEffect(() => {
    // Mock data for demonstration
    const mockReviews: PerformanceReview[] = [
      {
        id: 1,
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        reviewPeriod: "Q4 2023",
        reviewDate: "2024-01-15",
        reviewer: "Sarah Manager",
        overallRating: 4.2,
        status: "approved",
        goals: []
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: "Sarah Connor",
        department: "Marketing",
        reviewPeriod: "Q4 2023",
        reviewDate: "2024-01-12",
        reviewer: "Mike Manager",
        overallRating: 3.8,
        status: "approved",
        goals: []
      }
    ];

    const mockGoals: Goal[] = [
      {
        id: 1,
        title: "Complete Project Alpha",
        description: "Deliver the new client management system",
        category: "productivity",
        targetValue: 100,
        currentValue: 85,
        unit: "%",
        dueDate: "2024-03-31",
        status: "in_progress"
      },
      {
        id: 2,
        title: "Code Quality Improvement",
        description: "Maintain code quality score above 90%",
        category: "quality",
        targetValue: 90,
        currentValue: 92,
        unit: "%",
        dueDate: "2024-03-31",
        status: "completed"
      },
      {
        id: 3,
        title: "Team Collaboration",
        description: "Participate in cross-functional team meetings",
        category: "teamwork",
        targetValue: 8,
        currentValue: 6,
        unit: "meetings",
        dueDate: "2024-03-31",
        status: "in_progress"
      }
    ];

    setPerformanceReviews(mockReviews);
    setGoals(mockGoals);
    setLoading(false);
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (rating >= 3.5) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (rating >= 2.5) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'not_started': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      case 'overdue': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Target className="h-4 w-4" />;
      case 'quality': return <Star className="h-4 w-4" />;
      case 'teamwork': return <Users className="h-4 w-4" />;
      case 'initiative': return <Award className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (!hasPermission("view_performance")) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view performance management.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight gradient-text">Performance Management</h2>
          <p className="text-sm text-gray-500 leading-relaxed">Track goals, reviews, and employee development</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            className="btn-ghost"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </motion.button>
          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Set Goals
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg. Rating"
          value="4.1"
          change="+0.3 from last quarter"
          icon={Star}
        />
        <StatCard
          title="Goals Set"
          value={goals.length.toString()}
          change="+5 new this month"
          icon={Target}
        />
        <StatCard
          title="Completed Goals"
          value={goals.filter(g => g.status === 'completed').length.toString()}
          change="+12% completion rate"
          icon={TrendingUp}
        />
        <StatCard
          title="Reviews Pending"
          value="2"
          change="Due this week"
          icon={Calendar}
        />
      </div>

      {/* Performance Reviews */}
      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="floating-card p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Recent Reviews</h3>
          <div className="space-y-4">
            {performanceReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{review.employeeName}</p>
                    <p className="text-xs text-gray-500">{review.department}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    getRatingColor(review.overallRating)
                  )}>
                    {review.overallRating.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Period:</span>
                    <span className="text-gray-300 ml-2">{review.reviewPeriod}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reviewer:</span>
                    <span className="text-gray-300 ml-2">{review.reviewer}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-300 ml-2">{review.reviewDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="text-gray-300 ml-2">{review.status}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <motion.button
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>
                  {review.status === 'draft' && (
                    <motion.button
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="floating-card p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Goals & KPIs</h3>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{goal.title}</p>
                      <p className="text-xs text-gray-500">{goal.description}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    getGoalStatusColor(goal.status)
                  )}>
                    {goal.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-medium text-gray-300">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <motion.div 
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">Due Date</span>
                    <span className="text-xs text-gray-300">{goal.dueDate}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Analytics */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="floating-card p-8"
      >
        <h3 className="text-xl font-bold text-white mb-6">Performance Analytics</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-400">Rating Distribution</h4>
            {[
              { range: '4.5-5.0', count: 8, color: 'emerald-500' },
              { range: '3.5-4.4', count: 12, color: 'blue-500' },
              { range: '2.5-3.4', count: 6, color: 'amber-500' },
              { range: '0.0-2.4', count: 2, color: 'red-500' },
            ].map((dist, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-gray-300">{dist.range}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${dist.color}`}
                      style={{ width: `${(dist.count / 28) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{dist.count} employees</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-400">Goal Completion</h4>
            {[
              { category: 'Productivity', completed: 85, total: 100 },
              { category: 'Quality', completed: 92, total: 95 },
              { category: 'Teamwork', completed: 78, total: 85 },
              { category: 'Initiative', completed: 70, total: 80 },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{stat.category}</span>
                  <span className="text-sm font-medium text-gray-300">{stat.completed}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div 
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.completed / stat.total) * 100}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
