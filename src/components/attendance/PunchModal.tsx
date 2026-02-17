"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Upload } from "lucide-react";

interface PunchModalProps {
  isPunchedIn: boolean;
  onPunchSubmit: (data: {
    employeeId: number;
    date: string;
    status: string;
    overtimeHours: number;
    punchIn: string;
    punchOut: string;
  }) => Promise<void>;
  user: { id: number } | null;
  isOpen?: boolean;
  onOpen?: () => void;
  trigger?: React.ReactNode;
}

export function PunchModal({ isPunchedIn, onPunchSubmit, user, isOpen, onOpen, trigger }: PunchModalProps) {
  const [showPunchModal, setShowPunchModal] = useState(isOpen || false);
  const [punchLocation, setPunchLocation] = useState<'office' | 'outside'>('office');
  const [remarks, setRemarks] = useState('');
  const [facialCaptured, setFacialCaptured] = useState(false);
  const [locationData, setLocationData] = useState<{lat?: number, lng?: number, geofenceOk?: boolean}>({});
  const [gpsError, setGpsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync with external isOpen prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setShowPunchModal(isOpen);
    }
  }, [isOpen]);

  // Handle location-based checks
  useEffect(() => {
    setGpsError(false); // Clear previous errors
    if (punchLocation === 'office') {
      // Mock geofencing check - assume user is within office bounds
      setLocationData({ geofenceOk: true });
    } else if (punchLocation === 'outside') {
      // Mock GPS capture for development - replace with real GPS in production
      setLocationData({ lat: 28.6139, lng: 77.2090 }); // Mock coordinates (Delhi, India)
    }
  }, [punchLocation]);

  const handlePunch = () => {
    if (!isPunchedIn) {
      if (onOpen) {
        onOpen();
      } else {
        setShowPunchModal(true);
      }
    }
  };

  const handleCloseModal = () => {
    setShowPunchModal(false);
    if (isOpen !== undefined) {
      // If externally controlled, let parent handle closing
      // This is handled by the parent component updating isOpen
    }
  };

  const handlePunchSubmit = async () => {
    if (punchLocation === 'outside' && !remarks.trim()) {
      alert('Remarks are required for outside location');
      return;
    }

    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      setLoading(true);

      // Get current date and time
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0];

      const attendanceData = {
        employeeId: user.id,
        date: currentDate,
        status: "present", // Default status for punch in
        overtimeHours: 0.1, // Default overtime hours
        punchIn: currentTime,
        punchOut: "" // Empty for punch in
      };

      await onPunchSubmit(attendanceData);

      // Success handling
      handleCloseModal();

      // Reset modal state
      setPunchLocation('office');
      setRemarks('');
      setFacialCaptured(false);

      alert('Successfully punched in!');
    } catch (error: any) {
      console.error('Failed to punch in:', error);
      alert(`Failed to punch in: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Punch Modal - Only render modal, no button */}
      <AnimatePresence>
        {showPunchModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl z-[10000]"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Punch In</h3>
                  <div className="text-3xl font-mono font-bold text-violet-600">
                    {new Date().toLocaleTimeString()}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Current time</p>
                </div>

                <div className="space-y-4">
                  {/* Facial Capture */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${facialCaptured ? 'bg-green-100' : 'bg-slate-200'}`}>
                        <Upload className={`h-5 w-5 ${facialCaptured ? 'text-green-600' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Facial Recognition</p>
                        <p className="text-sm text-slate-500">Capture face for verification</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={() => setFacialCaptured(true)}
                      className="hidden"
                      id="facial-capture"
                    />
                    <label
                      htmlFor="facial-capture"
                      className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${facialCaptured ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                      {facialCaptured ? 'Captured' : 'Capture'}
                    </label>
                  </div>

                  {/* Biometric Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <select
                      value={punchLocation}
                      onChange={(e) => setPunchLocation(e.target.value as 'office' | 'outside')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="office">Office (Inside)</option>
                      <option value="outside">Outside Office</option>
                    </select>
                    {punchLocation === 'office' && locationData.geofenceOk && <p className="text-sm text-green-600 mt-2">Geofencing verified</p>}
                    {punchLocation === 'outside' && locationData.lat && <p className="text-sm text-blue-600 mt-2">GPS: {locationData.lat.toFixed(4)}, {locationData.lng?.toFixed(4)}</p>}
                    {punchLocation === 'outside' && gpsError && <p className="text-sm text-red-600 mt-2">GPS not available, please check permissions</p>}
                  </div>

                  {/* Remarks for Outside */}
                  {punchLocation === 'outside' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Remarks <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Please provide reason for outside punch-in..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                        rows={3}
                        required
                      />
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handlePunchSubmit}
                    disabled={loading}
                    className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-5 w-5" />
                    {loading ? 'Processing...' : 'Punch In'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
