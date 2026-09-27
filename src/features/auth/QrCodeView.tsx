import { useCallback, useEffect, useRef, useState } from "react"
import type { Credentials } from "@/shared/lib/types"
import { getQrCode, getStateInstance } from "@/api/greenApi"
import styles from "@/shared/components/messenger.module.css"

interface QrCodeViewProps {
  credentials: Credentials
  onAuthorized: () => void
  onBack: () => void
}

export function QrCodeView({ credentials, onAuthorized, onBack }: QrCodeViewProps) {
  const [qrBase64, setQrBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isTelegram = credentials.instanceType === "tgInstance"
  const isRefreshingRef = useRef(false)

  // Function to load QR code and verify status
  const loadQr = useCallback(async () => {
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true
    setIsRefreshing(true)

    try {
      // First check if already authorized
      const stateRes = await getStateInstance(credentials)
      if (stateRes?.stateInstance === "authorized") {
        onAuthorized()
        return
      }

      const qrRes = await getQrCode(credentials)

      if (qrRes.type === "already_registered") {
        onAuthorized()
        return
      }

      if (qrRes.type === "error") {
        setError(qrRes.message || "Не удалось получить QR-код")
        return
      }

      if (qrRes.type === "qrCode" && qrRes.message) {
        const src = qrRes.message.startsWith("data:image")
          ? qrRes.message
          : `data:image/png;base64,${qrRes.message}`
        setQrBase64(src)
        setError(null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка при получении QR-кода"
      setError(msg)
    } finally {
      isRefreshingRef.current = false
      setLoading(false)
      setIsRefreshing(false)
      setCountdown(5)
    }
  }, [credentials, onAuthorized])

  // 5-second polling interval conforming to documentation recommendations
  useEffect(() => {
    let cancelled = false

    // Initial async trigger
    const initialTimer = setTimeout(() => {
      if (!cancelled) {
        loadQr()
      }
    }, 0)

    // Countdown and poll every 5 seconds
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (!cancelled) {
            loadQr()
          }
          return 5
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      cancelled = true
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [loadQr])

  return (
    <div className={styles.authCard}>
      <h1 className={styles.authTitle}>Авторизация инстанса</h1>
      <p className={styles.authSubtitle}>
        Отсканируйте QR-код в приложении {isTelegram ? "Telegram" : "WhatsApp"} для привязки инстанса
      </p>

      {error && (
        <div className={styles.authErrorBanner} role="alert">
          {error}
        </div>
      )}

      {/* QR Code Container */}
      <div className={styles.qrContainer}>
        {loading && !qrBase64 ? (
          <div className={styles.centerState}>
            <span className={styles.spinner} />
            <p className={styles.stateText} style={{ marginTop: "10px" }}>
              Генерация QR-кода…
            </p>
          </div>
        ) : qrBase64 ? (
          <img
            src={qrBase64}
            alt={`QR-код для авторизации ${isTelegram ? "Telegram" : "WhatsApp"}`}
            className={styles.qrImage}
          />
        ) : (
          <div className={styles.centerState}>
            <p className={styles.stateText}>QR-код недоступен</p>
          </div>
        )}
      </div>

      <div className={styles.qrTimerBadge}>
        <span
          className={`${styles.statusDot} ${isRefreshing ? styles.statusDotConnecting : styles.statusDotOnline}`}
        />
        <span>
          {isRefreshing
            ? "Обновление QR-кода…"
            : `Обновление через ${countdown} сек.`}
        </span>
      </div>

      {/* Step by step instructions in Russian */}
      <div className={styles.qrSteps}>
        {isTelegram ? (
          <>
            <div className={styles.qrStepItem}>
              <span className={styles.qrStepNumber}>1</span>
              <span>Откройте приложение <strong>Telegram</strong> на телефоне</span>
            </div>
            <div className={styles.qrStepItem}>
              <span className={styles.qrStepNumber}>2</span>
              <span>Перейдите в <strong>Настройки → Устройства → Подключить устройство</strong></span>
            </div>
            <div className={styles.qrStepItem}>
              <span className={styles.qrStepNumber}>3</span>
              <span>Наведите камеру на QR-код для подтверждения входа</span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.qrStepItem}>
              <span className={styles.qrStepNumber}>1</span>
              <span>Откройте приложение <strong>WhatsApp</strong> на телефоне</span>
            </div>
            <div className={styles.qrStepItem}>
              <span className={styles.qrStepNumber}>2</span>
              <span>Перейдите в <strong>Связанные устройства → Привязка устройства</strong></span>
            </div>
            <div className={styles.qrStepItem}>
              <span className={styles.qrStepNumber}>3</span>
              <span>Наведите камеру на QR-код для подтверждения входа</span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
        <button
          type="button"
          className={styles.button}
          onClick={loadQr}
          disabled={isRefreshing}
          style={{ height: "42px", fontSize: "14px" }}
        >
          {isRefreshing && <span className={`${styles.spinner} ${styles.spinnerSmall}`} />}
          {isRefreshing ? "Проверка статуса…" : "Обновить QR-код"}
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "1px solid #e6e7eb",
            borderRadius: "10px",
            color: "#4a4f57",
            height: "40px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.15s ease",
          }}
        >
          ← Изменить данные / сменить инстанс
        </button>
      </div>

      <p className={styles.authHint} style={{ marginTop: "14px" }}>
        idInstance: <strong>{credentials.idInstance}</strong> ({isTelegram ? "Telegram" : "WhatsApp"})
      </p>
    </div>
  )
}
