"use client";

import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { checkInTicketAction, getCheckInMetricsAction } from "@/app/actions/admin";

interface RecentCheckIn {
  ref: string;
  name: string;
  workshopTitle: string;
  timeSlot: string;
  checkedInAt: string | null;
}

interface Metrics {
  total: number;
  checkedIn: number;
  percent: number;
  recent: RecentCheckIn[];
}

interface Props {
  initialMetrics: Metrics;
}

type ScanStatus = "IDLE" | "SCANNING" | "PROCESSING" | "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID" | "ERROR";

interface ScanResult {
  message: string;
  attendee?: {
    name?: string;
    email?: string;
    ref: string;
    workshopTitle?: string;
    date?: string;
    timeSlot?: string;
    venueName?: string;
    checkedInAt?: string | null;
  };
}

export default function CheckInClient({ initialMetrics }: Props) {
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("IDLE");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "scanner-reader";

  // Fetch updated metrics after a successful check-in
  const refreshMetrics = async () => {
    const res = await getCheckInMetricsAction();
    if (res.success && res.metrics) {
      setMetrics(res.metrics);
    }
  };

  const startScanner = async () => {
    if (isCameraActive) return;
    setScanStatus("IDLE");
    
    try {
      const html5QrCode = new Html5Qrcode(scannerId);
      qrScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            const minSize = Math.min(width, height);
            const boxSize = Math.floor(minSize * 0.7);
            return { width: boxSize, height: boxSize };
          },
        },
        async (decodedText) => {
          // Extracted registration code: ticket URLs are https://workshopdate.com/ticket/SLV-WK-XXXXXX
          // We can parse out the code (the last segment after slash)
          let regCode = decodedText.trim();
          if (regCode.includes("/ticket/")) {
            const parts = regCode.split("/ticket/");
            regCode = parts[parts.length - 1];
          }
          
          await processCheckIn(regCode);
        },
        () => {
          // Verbose qr parse failure, ignore to avoid spamming
        }
      );

      setIsCameraActive(true);
      setScanStatus("SCANNING");
    } catch (err) {
      console.error("Failed to start scanner:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopScanner = async () => {
    if (!isCameraActive || !qrScannerRef.current) return;
    
    try {
      await qrScannerRef.current.stop();
      qrScannerRef.current = null;
      setIsCameraActive(false);
      setScanStatus("IDLE");
    } catch (err) {
      console.error("Failed to stop scanner:", err);
    }
  };

  const processCheckIn = async (code: string) => {
    // Temporarily pause camera scans by stopping or setting status
    setScanStatus("PROCESSING");
    
    // Play subtle audio confirmation
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}

    const res = await checkInTicketAction(code);

    if (res.success && res.attendee) {
      setScanStatus("SUCCESS");
      setScanResult({
        message: res.message,
        attendee: res.attendee,
      });
      refreshMetrics();
    } else if (res.errorType === "ALREADY_CHECKED_IN" && res.attendee) {
      setScanStatus("ALREADY_CHECKED_IN");
      setScanResult({
        message: res.message,
        attendee: res.attendee,
      });
    } else {
      setScanStatus(res.errorType === "INVALID" ? "INVALID" : "ERROR");
      setScanResult({
        message: res.message || "An error occurred",
        attendee: { ref: code },
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCheckIn(manualCode.trim().toUpperCase());
    setManualCode("");
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-8 text-[#4A4035]">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-3xl text-dark-mocha font-light">Atelier Check-In Studio</h1>
        <p className="text-xs font-light text-soft-brown mt-1">
          Scan tickets, validate codes, and monitor event attendance statistics.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-soft-brown font-medium">Total Registrations</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-serif text-dark-mocha font-light">{metrics.total}</span>
            <span className="text-xs text-soft-brown">guests booked</span>
          </div>
        </div>

        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-soft-brown font-medium">Total Checked In</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-serif text-dark-mocha font-light">{metrics.checkedIn}</span>
            <span className="text-xs text-soft-brown">at entrance</span>
          </div>
        </div>

        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-soft-brown font-medium">Attendance Rate</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-serif text-dark-mocha font-light">{metrics.percent}%</span>
            <div className="w-full bg-[#EFE2CC] h-2 rounded-full overflow-hidden mt-2 relative top-[-6px]">
              <div 
                className="bg-[#B69AC7] h-full rounded-full transition-all duration-500" 
                style={{ width: `${metrics.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: SCANNER / CONTROLS (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scanner Card */}
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md overflow-hidden flex flex-col items-center justify-center">
            <h3 className="font-serif text-lg text-dark-mocha mb-4 self-start">Camera Scanner</h3>
            
            {/* Camera Frame */}
            <div className="w-full max-w-sm aspect-square bg-[#FAF6EE] border border-mocha/15 rounded-2xl overflow-hidden relative flex items-center justify-center">
              <div 
                id={scannerId} 
                className={`w-full h-full object-cover ${isCameraActive ? "" : "hidden"}`} 
              />
              
              {!isCameraActive && (
                <div className="text-center p-6 space-y-3 z-10">
                  <div className="w-16 h-16 bg-[#F7F1E7] border border-[#E8DFC8] rounded-full flex items-center justify-center mx-auto text-[#A1917C]">
                    📷
                  </div>
                  <p className="text-xs text-soft-brown max-w-[200px] mx-auto font-light">
                    Activate the camera stream to scan ticket QR codes.
                  </p>
                </div>
              )}

              {/* Scanning indicator */}
              {isCameraActive && scanStatus === "SCANNING" && (
                <div className="absolute inset-0 border-2 border-[#B69AC7] animate-pulse pointer-events-none rounded-2xl">
                  <div className="w-full h-0.5 bg-[#B69AC7] absolute top-1/2 left-0 animate-bounce" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex space-x-4 mt-6 w-full max-w-sm">
              {!isCameraActive ? (
                <button
                  onClick={startScanner}
                  className="flex-1 bg-gradient-to-r from-warm-brown to-nude text-cream font-bold py-3.5 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 hover:scale-102 cursor-pointer"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="flex-1 border border-red-400 text-red-500 hover:bg-red-50 py-3.5 px-6 rounded-xl uppercase text-xs tracking-wider font-bold transition-all duration-300 cursor-pointer"
                >
                  Stop Camera
                </button>
              )}
            </div>

            {/* Manual entry fallback */}
            <form onSubmit={handleManualSubmit} className="mt-6 pt-6 border-t border-mocha/10 w-full max-w-sm flex items-center space-x-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Or enter registration ID..."
                className="form-input text-xs py-2.5 flex-1"
              />
              <button
                type="submit"
                className="bg-[#4A4035] text-cream px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Check In
              </button>
            </form>
          </div>

          {/* Scan Result Feedback Screen */}
          {scanResult && (
            <div className="transition-all duration-300">
              
              {/* SUCCESS STATE (Green card) */}
              {scanStatus === "SUCCESS" && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-green-200 text-6xl pointer-events-none select-none">
                    ✓
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                      ✓
                    </span>
                    <h4 className="font-serif text-lg text-green-800 font-medium">{scanResult.message}</h4>
                  </div>
                  
                  {scanResult.attendee && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-green-700 bg-white/50 p-4 rounded-xl border border-green-100">
                      <div>
                        <span className="font-semibold block uppercase tracking-wider text-[9px] text-green-600">Guest Name</span>
                        <span className="font-serif text-sm block mt-0.5 text-green-900">{scanResult.attendee.name}</span>
                        <span className="block mt-0.5 opacity-80">{scanResult.attendee.email}</span>
                      </div>
                      <div>
                        <span className="font-semibold block uppercase tracking-wider text-[9px] text-green-600">Workshop & Session</span>
                        <span className="font-medium block text-green-900">{scanResult.attendee.workshopTitle}</span>
                        <span className="block mt-0.5 opacity-80">{scanResult.attendee.timeSlot}</span>
                      </div>
                      <div className="md:col-span-2 pt-2 border-t border-green-100 mt-2 flex justify-between items-center">
                        <div>
                          <span className="font-semibold uppercase tracking-wider text-[9px] text-green-600 block">Registration Code</span>
                          <span className="font-mono text-green-900">{scanResult.attendee.ref}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold uppercase tracking-wider text-[9px] text-green-600 block">Check-In Time</span>
                          <span>{scanResult.attendee.checkedInAt ? new Date(scanResult.attendee.checkedInAt).toLocaleTimeString() : ""}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ALREADY CHECKED IN STATE (Yellow card) */}
              {scanStatus === "ALREADY_CHECKED_IN" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-yellow-200 text-6xl pointer-events-none select-none">
                    ⚠️
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                      !
                    </span>
                    <h4 className="font-serif text-lg text-yellow-800 font-medium">{scanResult.message}</h4>
                  </div>
                  
                  {scanResult.attendee && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-yellow-700 bg-white/50 p-4 rounded-xl border border-yellow-100">
                      <div>
                        <span className="font-semibold block uppercase tracking-wider text-[9px] text-yellow-600">Guest Name</span>
                        <span className="font-serif text-sm block mt-0.5 text-yellow-900">{scanResult.attendee.name}</span>
                        <span className="block mt-0.5 opacity-80">{scanResult.attendee.email}</span>
                      </div>
                      <div>
                        <span className="font-semibold block uppercase tracking-wider text-[9px] text-yellow-600">Registration Code</span>
                        <span className="font-mono text-yellow-900 block mt-1">{scanResult.attendee.ref}</span>
                      </div>
                      <div className="md:col-span-2 pt-2 border-t border-yellow-100 mt-2">
                        <span className="font-semibold uppercase tracking-wider text-[9px] text-yellow-600 block">Original Check-In Time</span>
                        <span className="font-medium text-yellow-900">
                          {scanResult.attendee.checkedInAt 
                            ? new Date(scanResult.attendee.checkedInAt).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }) 
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INVALID STATE (Red card) */}
              {(scanStatus === "INVALID" || scanStatus === "ERROR") && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-red-200 text-6xl pointer-events-none select-none">
                    ✗
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                      ✕
                    </span>
                    <h4 className="font-serif text-lg text-red-800 font-medium">{scanResult.message}</h4>
                  </div>
                  
                  <div className="text-xs text-red-700 bg-white/50 p-4 rounded-xl border border-red-100">
                    <span className="font-semibold uppercase tracking-wider text-[9px] text-red-600 block">Attempted Code</span>
                    <span className="font-mono text-red-900 mt-0.5 block">{scanResult.attendee?.ref}</span>
                    <p className="mt-2 text-red-600">
                      The code entered or scanned does not match any confirmed booking in our database. Please verify the code or scan the correct ticket.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: RECENT CHECK-INS (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md h-full flex flex-col">
            <h3 className="font-serif text-lg text-dark-mocha mb-6">Recent Check-ins</h3>
            
            {metrics.recent.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-xs text-soft-brown font-light">
                <span className="text-lg mb-2 block">🌸</span>
                No guests checked in yet. Start scanning.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto flex-1 max-h-[450px] pr-2">
                {metrics.recent.map((item, idx) => {
                  const checkinTime = item.checkedInAt 
                    ? new Date(item.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : "";
                  return (
                    <div 
                      key={item.ref + idx} 
                      className="p-3 bg-[#FAF6EE] border border-mocha/5 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-sand/10"
                    >
                      <div className="space-y-0.5">
                        <span className="font-serif font-medium text-dark-mocha block">{item.name}</span>
                        <span className="text-[10px] text-soft-brown block leading-snug">
                          {item.workshopTitle} ({item.timeSlot})
                        </span>
                        <span className="font-mono text-[9px] text-[#A1917C] uppercase">{item.ref}</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-green-500/10 text-green-600 font-semibold px-2 py-0.5 rounded text-[9px] uppercase">
                          {checkinTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
