import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";

function extractToken(value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) return "";

  try {
    const parsed = JSON.parse(trimmedValue);
    return parsed.token || trimmedValue;
  } catch {
    return trimmedValue;
  }
}

function Alert({ alert, onClose }) {
  if (!alert.message) return null;

  const isError = alert.type === "error";

  return (
    <div
      className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-bold ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      <span>{alert.message}</span>
      <button type="button" onClick={onClose}>
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

function ResultPanel({ result }) {
  if (!result) return null;

  const reservation = result.reservation;
  const session = result.session;

  return (
    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-white">
          <span className="material-symbols-outlined text-[24px]">
            door_open
          </span>
        </div>
        <div>
          <p className="font-['Geist'] text-lg font-black text-emerald-950">
            Barrier opened
          </p>
          <p className="font-semibold text-emerald-700">
            Reservation moved to CHECKED_IN.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Info label="Customer" value={reservation?.user?.fullName || "N/A"} />
        <Info label="Slot" value={reservation?.parkingSlot?.slotName || "N/A"} />
        <Info label="Zone" value={reservation?.parkingSlot?.zone?.zoneName || "N/A"} />
        <Info label="Ticket" value={session?.ticket_code || session?.ticketCode || "N/A"} />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white/80 p-3 ring-1 ring-emerald-100">
      <p className="text-xs font-black uppercase tracking-wider text-emerald-500">
        {label}
      </p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}

function getCameraErrorMessage(error) {
  if (error?.name === "NotAllowedError") {
    return "Camera permission was blocked. Please allow camera access in the browser.";
  }

  if (error?.name === "NotFoundError") {
    return "No camera was found on this device.";
  }

  if (error?.name === "NotReadableError") {
    return "Camera is already being used by another app.";
  }

  if (!window.isSecureContext) {
    return "Camera requires localhost, 127.0.0.1, or HTTPS.";
  }

  return error?.message || "Cannot start camera";
}

function getCodeBounds(code) {
  if (code?.boundingBox) {
    return code.boundingBox;
  }

  if (Array.isArray(code?.cornerPoints) && code.cornerPoints.length > 0) {
    const xValues = code.cornerPoints.map((point) => point.x);
    const yValues = code.cornerPoints.map((point) => point.y);
    const x = Math.min(...xValues);
    const y = Math.min(...yValues);
    const right = Math.max(...xValues);
    const bottom = Math.max(...yValues);

    return {
      x,
      y,
      width: right - x,
      height: bottom - y,
    };
  }

  return null;
}

function getJsQrBounds(code) {
  if (!code?.location) return null;

  const points = [
    code.location.topLeftCorner,
    code.location.topRightCorner,
    code.location.bottomRightCorner,
    code.location.bottomLeftCorner,
  ].filter(Boolean);

  if (points.length === 0) return null;

  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);
  const x = Math.min(...xValues);
  const y = Math.min(...yValues);
  const right = Math.max(...xValues);
  const bottom = Math.max(...yValues);

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  };
}

function mapVideoBoundsToElement(bounds, video) {
  if (!bounds || !video?.videoWidth || !video?.videoHeight) return null;

  const elementWidth = video.clientWidth;
  const elementHeight = video.clientHeight;
  const scale = Math.max(
    elementWidth / video.videoWidth,
    elementHeight / video.videoHeight,
  );
  const renderedWidth = video.videoWidth * scale;
  const renderedHeight = video.videoHeight * scale;
  const offsetX = (elementWidth - renderedWidth) / 2;
  const offsetY = (elementHeight - renderedHeight) / 2;

  return {
    left: bounds.x * scale + offsetX,
    top: bounds.y * scale + offsetY,
    width: bounds.width * scale,
    height: bounds.height * scale,
  };
}

export default function QrCheckInPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);
  const lastScanAtRef = useRef(0);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [detectionBox, setDetectionBox] = useState(null);
  const [scannedText, setScannedText] = useState("");
  const [manualText, setManualText] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const stopCamera = () => {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setDetectionBox(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const submitCheckIn = async (qrText) => {
    const token = extractToken(qrText);

    if (!token) {
      setAlert({ type: "error", message: "Please scan or paste a QR token." });
      return false;
    }

    try {
      setProcessing(true);
      setAlert({ type: "", message: "" });
      setResult(null);

      const response = await apiRequest("/api/reservations/qr-check-in", {
        method: "POST",
        body: JSON.stringify({
          token,
          qrText,
          licensePlate: licensePlate.trim(),
        }),
      });

      setResult(response.data);
      setAlert({
        type: "success",
        message: response.message || "QR check-in successful.",
      });
      setManualText("");
      setScannedText("");
      setLicensePlate("");
      return true;
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Cannot check in reservation",
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const startCamera = async () => {
    setAlert({ type: "", message: "" });
    setResult(null);
    setDetectionBox(null);
    stopCamera();

    try {
      setCameraStatus("starting");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      let detector = null;
      if (
        "BarcodeDetector" in window &&
        typeof window.BarcodeDetector.getSupportedFormats === "function"
      ) {
        const formats = await window.BarcodeDetector.getSupportedFormats();

        if (formats.includes("qr_code")) {
          detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        }
      } else if ("BarcodeDetector" in window) {
        detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      }

      scanningRef.current = true;
      setCameraStatus("scanning");

      const scanFrame = async () => {
        if (!scanningRef.current || !videoRef.current) return;

        try {
          const now = performance.now();

          if (now - lastScanAtRef.current < 180) {
            window.requestAnimationFrame(scanFrame);
            return;
          }

          lastScanAtRef.current = now;

          if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            window.requestAnimationFrame(scanFrame);
            return;
          }

          let rawValue = "";
          let bounds = null;

          if (detector) {
            try {
              const codes = await detector.detect(videoRef.current);
              const detectedCode = codes[0];
              rawValue = detectedCode?.rawValue || "";
              bounds = getCodeBounds(detectedCode);
            } catch {
              detector = null;
            }
          }

          if (!rawValue) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas?.getContext("2d", {
              willReadFrequently: true,
            });

            if (canvas && context && video.videoWidth && video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);

              const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );
              const qrCode = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
                {
                  inversionAttempts: "attemptBoth",
                },
              );

              rawValue = qrCode?.data || "";
              bounds = getJsQrBounds(qrCode);
            }
          }

          if (bounds) {
            setDetectionBox(
              mapVideoBoundsToElement(bounds, videoRef.current),
            );
          } else {
            setDetectionBox(null);
          }

          if (rawValue) {
            setScannedText(rawValue);
            setManualText(rawValue);
            scanningRef.current = false;
            await new Promise((resolve) => window.setTimeout(resolve, 350));
            await submitCheckIn(rawValue);
            stopCamera();
            setCameraStatus("scanned");
            return;
          }
        } catch {
          setAlert({
            type: "error",
            message:
              "Cannot scan this frame. Keep the QR steady and try again.",
          });
        }

        window.requestAnimationFrame(scanFrame);
      };

      window.requestAnimationFrame(scanFrame);
    } catch (error) {
      setCameraStatus("error");
      setAlert({
        type: "error",
        message: getCameraErrorMessage(error),
      });
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleCheckIn = async () => {
    const qrText = manualText || scannedText;
    await submitCheckIn(qrText);
  };

  const hasQrText = Boolean((manualText || scannedText).trim());

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            QR Check-in
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Scan reservation QR codes at the entrance and update confirmed
            bookings to checked-in parking sessions.
          </p>
        </div>
      </div>

      <Alert
        alert={alert}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950">
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            {!["scanning", "preview"].includes(cameraStatus) && (
              <div className="absolute inset-0 grid place-items-center bg-slate-950 p-6 text-center text-white">
                <div>
                  <span className="material-symbols-outlined text-[52px]">
                    qr_code_scanner
                  </span>
                  <p className="mt-3 font-['Geist'] text-xl font-black">
                    {cameraStatus === "scanned"
                        ? "QR captured"
                        : cameraStatus === "error"
                          ? "Camera unavailable"
                        : "Camera ready"}
                  </p>
                </div>
              </div>
            )}
            {cameraStatus === "scanning" && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center p-8">
                <div className="h-52 w-52 rounded-3xl border-4 border-white/80 shadow-[0_0_0_999px_rgba(15,23,42,0.35)]" />
              </div>
            )}
            {detectionBox && (
              <div
                className="pointer-events-none absolute rounded-2xl border-4 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.95)] transition-all duration-150"
                style={{
                  left: `${detectionBox.left}px`,
                  top: `${detectionBox.top}px`,
                  width: `${detectionBox.width}px`,
                  height: `${detectionBox.height}px`,
                }}
              >
                <span className="absolute -left-1 -top-9 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-950/20">
                  QR found
                </span>
              </div>
            )}
            {cameraStatus === "preview" && (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl bg-slate-950/75 px-4 py-3 text-sm font-bold text-white backdrop-blur">
                Camera preview is active. Auto-scan is unavailable in this
                browser.
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCamera}
              disabled={processing || cameraStatus === "starting"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">
                photo_camera
              </span>
              {cameraStatus === "starting" ? "Starting..." : "Start camera"}
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setCameraStatus("idle");
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                videocam_off
              </span>
              Stop
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              License plate
            </span>
            <input
              value={licensePlate}
              onChange={(event) => setLicensePlate(event.target.value)}
              placeholder="Example: 51A12345"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              QR payload
            </span>
            <textarea
              value={manualText}
              onChange={(event) => setManualText(event.target.value)}
              placeholder="Scanned QR data appears here"
              className="mt-2 min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          <button
            type="button"
            onClick={handleCheckIn}
            disabled={processing || !hasQrText}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                door_open
              </span>
            )}
            {processing ? "Checking in..." : "Check in and open barrier"}
          </button>

          <ResultPanel result={result} />
        </section>
      </div>
    </AdminLayout>
  );
}
