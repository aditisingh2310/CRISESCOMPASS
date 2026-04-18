// Global notification system for CrisisConnect
// Manages alerts for new incidents, SOS events, and connectivity changes
export class NotificationManager {
  private notifications: string[] = []
  private listeners: ((notification: string) => void)[] = []

  // Subscribe to notifications
  subscribe(callback: (notification: string) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  // Add a new notification
  notify(message: string, duration: number = 5000) {
    this.notifications.push(message)
    this.listeners.forEach(listener => listener(message))

    // Auto-remove after duration
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n !== message)
    }, duration)
  }

  // Get current notifications
  getNotifications(): string[] {
    return [...this.notifications]
  }

  // Clear all notifications
  clear() {
    this.notifications = []
  }
}

// Global notification instance
export const notificationManager = new NotificationManager()