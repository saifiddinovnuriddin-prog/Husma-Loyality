"use client";

import { useEffect, useRef, useState } from "react";

const REGION_ID = "husma-qr-scanner-region";

export default function QrScanner({
  onResult,
  onError,
  active = true,
}) {
  const scannerRef = useRef(null);
  const mountedRef = useRef(false);
  const startedRef = useRef(false);
  const startingRef = useRef(false);
  const processingRef = useRef(false);
  const runIdRef = useRef(0);

  const [starting, setStarting] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    mountedRef.current = true;

    const runId = ++runIdRef.current;

    let scanner = null;
    let cameraStream = null;

    startingRef.current = false;
    startedRef.current = false;
    processingRef.current = false;

    setStarting(false);
    setCameraError(null);
    setProcessing(false);

    const isCurrent = () => {
      return (
        mountedRef.current &&
        runId === runIdRef.current
      );
    };

    // =========================================================
    // CAMERA STREAMNI TO'XTATISH
    // =========================================================

    const stopCameraStream = () => {
      if (!cameraStream) {
        return;
      }

      try {
        cameraStream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      } catch (error) {
        console.warn(
          "Camera stream stop warning:",
          error
        );
      }

      cameraStream = null;
    };

    // =========================================================
    // QR SCANNERNI TO'XTATISH
    // =========================================================

    const stopScanner = async () => {
      const currentScanner =
        scanner || scannerRef.current;

      if (!currentScanner) {
        return;
      }

      try {
        if (startedRef.current) {
          startedRef.current = false;

          await currentScanner.stop();

          console.log(
            "QR scanner to'xtatildi"
          );
        }
      } catch (error) {
        console.warn(
          "QR scanner stop warning:",
          error
        );
      }

      try {
        currentScanner.clear();
      } catch (error) {
        // ignore
      }

      if (
        scannerRef.current ===
        currentScanner
      ) {
        scannerRef.current = null;
      }
    };

    // =========================================================
    // CAMERA PERMISSION TEKSHIRISH
    // =========================================================

    const checkCameraPermission = async () => {
      console.log(
        "Kamera permission tekshirilmoqda..."
      );

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "getUserMedia mavjud emas"
        );
      }

      try {
        // Kameraga oddiy murojaat
        cameraStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: false,
            }
          );

        console.log(
          "Kamera permission: OK"
        );

        // Test streamni darhol yopamiz
        stopCameraStream();

        return true;
      } catch (error) {
        console.error(
          "Camera permission test xatosi:",
          error
        );

        throw error;
      }
    };

    // =========================================================
    // SCANNERNI ISHGA TUSHIRISH
    // =========================================================

    const startScanner = async () => {
      if (!isCurrent()) {
        return;
      }

      if (
        startingRef.current ||
        startedRef.current
      ) {
        return;
      }

      startingRef.current = true;

      setStarting(true);
      setCameraError(null);

      try {
        // =====================================================
        // 1. CAMERA PERMISSION
        // =====================================================

        await checkCameraPermission();

        if (!isCurrent()) {
          return;
        }

        // =====================================================
        // 2. HTML5 QR CODE
        // =====================================================

        const { Html5Qrcode } =
          await import("html5-qrcode");

        if (!isCurrent()) {
          return;
        }

        // =====================================================
        // 3. ESKI SCANNER
        // =====================================================

        if (scannerRef.current) {
          await stopScanner();
        }

        if (!isCurrent()) {
          return;
        }

        // =====================================================
        // 4. YANGI SCANNER
        // =====================================================

        scanner =
          new Html5Qrcode(REGION_ID);

        scannerRef.current = scanner;

        console.log(
          "QR scanner ishga tushmoqda..."
        );

        // =====================================================
        // 5. CAMERA START
        // =====================================================

        await scanner.start(
          {
            facingMode: "environment",
          },

          {
            fps: 10,

            qrbox: {
              width: 240,
              height: 240,
            },

            aspectRatio: 1.0,

            disableFlip: false,
          },

          // ===================================================
          // QR TOPILDI
          // ===================================================

          async (decodedText) => {
            if (!isCurrent()) {
              return;
            }

            if (processingRef.current) {
              return;
            }

            processingRef.current = true;

            setProcessing(true);

            console.log(
              "================================"
            );

            console.log(
              "QR TOPILDI:",
              decodedText
            );

            console.log(
              "================================"
            );

            // =================================================
            // CAMERA STOP
            // =================================================

            try {
              if (
                scanner &&
                startedRef.current
              ) {
                startedRef.current = false;

                await scanner.stop();

                console.log(
                  "QR topildi. Kamera to'xtatildi."
                );
              }
            } catch (error) {
              console.warn(
                "QR stop warning:",
                error
              );
            }

            // =================================================
            // RESULT CALLBACK
            // =================================================

            if (!isCurrent()) {
              return;
            }

            try {
              await onResult?.(
                decodedText
              );
            } catch (error) {
              console.error(
                "onResult xatosi:",
                error
              );
            }
          },

          // ===================================================
          // QR TOPILMAGAN FRAME
          // ===================================================

          () => {
            // jim
          }
        );

        // =====================================================
        // COMPONENT YOPILGAN BO'LSA
        // =====================================================

        if (!isCurrent()) {
          try {
            await scanner.stop();
          } catch (error) {
            // ignore
          }

          try {
            scanner.clear();
          } catch (error) {
            // ignore
          }

          return;
        }

        // =====================================================
        // SUCCESS
        // =====================================================

        startedRef.current = true;
        startingRef.current = false;

        setStarting(false);

        console.log(
          "================================"
        );

        console.log(
          "QR SCANNER MUVAFFAQIYATLI ISHLADI"
        );

        console.log(
          "================================"
        );
      } catch (error) {
        console.error(
          "QR skaner xatosi:",
          error
        );

        startedRef.current = false;
        startingRef.current = false;

        stopCameraStream();

        if (!isCurrent()) {
          return;
        }

        setStarting(false);

        let message =
          "Kamerani ishga tushirib bo'lmadi.";

        // =====================================================
        // PERMISSION DENIED
        // =====================================================

        if (
          error?.name ===
            "NotAllowedError" ||
          String(
            error?.message || ""
          ).includes(
            "Permission denied"
          )
        ) {
          message =
            "❌ Kamera ruxsati berilmagan. Chrome'da manzil satridagi 🔒 belgisini bosing → Site settings → Camera → Allow qiling. Keyin sahifani qayta yuklang.";
        }

        // =====================================================
        // CAMERA NOT FOUND
        // =====================================================

        else if (
          error?.name ===
          "NotFoundError"
        ) {
          message =
            "❌ Kamera topilmadi. Kompyuteringizda kamera mavjudligini tekshiring.";
        }

        // =====================================================
        // CAMERA BUSY
        // =====================================================

        else if (
          error?.name ===
          "NotReadableError"
        ) {
          message =
            "❌ Kamera boshqa dastur tomonidan ishlatilmoqda. Telegram, Zoom, Teams, OBS yoki boshqa kamera dasturlarini yoping.";
        }

        // =====================================================
        // SECURITY
        // =====================================================

        else if (
          error?.name ===
          "SecurityError"
        ) {
          message =
            "❌ Brauzer kamera ishlatishni blokladi. localhost yoki HTTPS orqali oching.";
        }

        // =====================================================
        // CAMERA CONSTRAINT
        // =====================================================

        else if (
          error?.name ===
          "OverconstrainedError"
        ) {
          message =
            "❌ Kamera konfiguratsiyasi qurilmaga mos emas.";
        }

        // =====================================================
        // GENERIC
        // =====================================================

        else if (
          String(
            error?.message || ""
          ).includes(
            "getUserMedia"
          )
        ) {
          message =
            "❌ Brauzer kamerani ocholmadi. Kamera ruxsatlarini tekshiring.";
        }

        setCameraError(message);

        try {
          onError?.(error);
        } catch (callbackError) {
          console.error(
            "onError callback xatosi:",
            callbackError
          );
        }
      } finally {
        startingRef.current = false;

        if (isCurrent()) {
          setStarting(false);
        }
      }
    };

    // =========================================================
    // START
    // =========================================================

    startScanner();

    // =========================================================
    // CLEANUP
    // =========================================================

    return () => {
      mountedRef.current = false;

      runIdRef.current++;

      processingRef.current = true;

      stopCameraStream();

      const cleanupScanner =
        scanner ||
        scannerRef.current;

      scanner = null;

      scannerRef.current = null;

      if (!cleanupScanner) {
        return;
      }

      const cleanup = async () => {
        try {
          if (startedRef.current) {
            startedRef.current = false;

            await cleanupScanner.stop();
          }
        } catch (error) {
          console.warn(
            "QR scanner cleanup warning:",
            error
          );
        }

        try {
          cleanupScanner.clear();
        } catch (error) {
          // ignore
        }
      };

      cleanup();
    };
  }, [active, onResult, onError]);

  // ===========================================================
  // UI
  // ===========================================================

  return (
    <div className="relative">
      {/* =====================================================
          CAMERA
      ====================================================== */}

      <div
        id={REGION_ID}
        className="
          w-full
          min-h-[240px]
          rounded-xl
          overflow-hidden
          bg-black
          flex
          items-center
          justify-center
          [&_video]:w-full
          [&_video]:h-full
          [&_video]:object-cover
          [&_video]:rounded-xl
        "
      />

      {/* =====================================================
          LOADING
      ====================================================== */}

      {starting &&
        !cameraError && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              rounded-xl
              bg-neutral-950/80
              text-neutral-400
            "
          >
            <div className="text-center">
              <div className="text-4xl mb-3">
                📷
              </div>

              <p className="text-sm">
                Kamera ishga tushmoqda...
              </p>

              <p className="text-xs text-neutral-500 mt-2">
                Kameraga ruxsat tekshirilmoqda
              </p>
            </div>
          </div>
        )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {cameraError && (
        <div
          className="
            mt-3
            rounded-xl
            border
            border-red-500/30
            bg-red-500/10
            px-4
            py-4
            text-red-300
          "
        >
          <div className="flex gap-3">
            <div className="text-xl">
              📷
            </div>

            <div className="flex-1">
              <p className="font-semibold text-sm">
                Kamera ishlamadi
              </p>

              <p className="text-xs text-red-400/80 mt-1 leading-5">
                {cameraError}
              </p>

              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                className="
                  mt-3
                  rounded-lg
                  bg-red-500
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  hover:bg-red-400
                  transition
                "
              >
                🔄 Qayta urinish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PROCESSING
      ====================================================== */}

      {processing &&
        !cameraError && (
          <div className="mt-3 text-center text-xs text-emerald-400">
            ✅ QR kod qabul qilindi...
          </div>
        )}

      {/* =====================================================
          INFO
      ====================================================== */}

      {!starting &&
        !cameraError &&
        !processing && (
          <div className="mt-3 text-center text-xs text-neutral-500">
            📱 QR kodni kamera oldiga tuting
          </div>
        )}
    </div>
  );
}