"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { 
  Loader2, ArrowLeft, Save, User, Mail, Lock, Briefcase, 
  Phone, Calendar, Hash, Shield, Sparkles, Building2, BadgeCheck, UserPlus
} from "lucide-react";


// Zod validation schemas
const accountInfoSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be no more than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  designation: z.string().optional(),
  role: z.string().min(1, "Please select a user role"),
});

const personalInfoSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be no more than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  lastName: z.string()
    .max(50, "Last name must be no more than 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces")
    .optional()
    .or(z.literal("")),
  employeeCode: z.string()
    .min(1, "Employee code is required")
    .regex(/^[A-Z]{3}\d{3,}$/, "Employee code must start with 3 uppercase letters followed by 3 or more digits (e.g., EMP001)"),
  joiningDate: z.string().optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number (e.g., +1234567890)")
    .optional()
    .or(z.literal("")),
  department: z.string().optional(),
});

// Combined schema for full form validation
const completeFormSchema = accountInfoSchema.merge(personalInfoSchema);

type AccountInfoData = z.infer<typeof accountInfoSchema>;
type PersonalInfoData = z.infer<typeof personalInfoSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  
  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      try {
        accountInfoSchema.parse({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          designation: formData.designation,
          role: formData.role,
        });
        setErrors({});
        setCurrentStep(2);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: Partial<Record<keyof typeof formData, string>> = {};
          error.issues.forEach((err: z.ZodIssue) => {
            if (err.path[0]) {
              newErrors[err.path[0] as keyof typeof formData] = err.message;
            }
          });
          setErrors(newErrors);
        }
      }
    }
  };
  
  const prevStep = () => {
    setErrors({});
    setCurrentStep(1);
  };
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: "",
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
    designation: "",
    joiningDate: "",
    employeeCode: ""
  });

  useEffect(() => {
    setMounted(true);
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.post("/user/all-role");
      const d = res.data;
      let list: { id: number; name: string }[] = [];
      if (Array.isArray(d)) list = d;
      else if (d && Array.isArray(d.data)) list = d.data;
      setRoles(list);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entire form before submission
    try {
      completeFormSchema.parse(formData);
      setErrors({});
      setLoading(true);

      const payload = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        roles: formData.role ? [formData.role] : ["USER"],
        employee: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
          joiningDate: formData.joiningDate,
          employeeCode: formData.employeeCode
        }
      };

      await api.post("/user/create", payload);
      toast.success("User created successfully!");
      router.push("/users");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof typeof formData, string>> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof formData] = err.message;
          }
        });
        setErrors(newErrors);
        // Go back to step with errors
        const hasAccountErrors = ['email', 'username', 'password', 'designation', 'role'].some(field => newErrors[field as keyof typeof formData]);
        const hasPersonalErrors = ['firstName', 'lastName', 'employeeCode', 'joiningDate', 'phone', 'department'].some(field => newErrors[field as keyof typeof formData]);
        
        if (hasAccountErrors && !hasPersonalErrors) {
          setCurrentStep(1);
        } else if (hasPersonalErrors) {
          setCurrentStep(2);
        }
      } else {
        console.error("Failed to create user", error);
        toast.error("Failed to create user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Employee</h1>
              <p className="text-gray-600 mt-1">Add a new team member to your organization</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300'
                  }`}
                />
                {step < 2 && (
                  <div className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <p className="text-sm text-gray-600">
              {currentStep === 1 ? 'Account Information' : 'Personal Information'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="divide-y divide-gray-100"
            >
              {/* Account Information Section */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                    <p className="text-sm text-gray-600">Login credentials and access details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="john.doe@company.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="johndoe"
                    />
                    {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="Enter secure password"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="Software Developer"
                    />
                    {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      User Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 appearance-none transition-colors"
                        required
                      >
                        <option value="">Select a role</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.name}>{role.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                </div>
              </div>
              </div>

              {/* Navigation Footer */}
              <div className="px-8 py-6 bg-gray-50/50">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center gap-2"
                  >
                    Next Step
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit}
              className="divide-y divide-gray-100"
            >
              {/* Personal Information Section */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-600">Basic details about the employee</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Employee Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="EMP001"
                    />
                    {errors.employeeCode && <p className="mt-1 text-sm text-red-600">{errors.employeeCode}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="px-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 flex items-center">
                        <span className="text-sm font-medium">+91</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                        placeholder="9876543210"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="Engineering"
                    />
                    {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-8 py-6 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 1L9 9l4 4" />
                        </svg>
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
