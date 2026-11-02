import { AlertType, SecurityAlert } from '../types';

export class AlertManager {
  private alerts: SecurityAlert[] = [];
  private lastAlertTimestamp = new Map<string, number>();
  private readonly DEFAULT_COOLDOWN_MS = 5 * 60 * 1000; // 5 phút

  constructor(initialAlerts: SecurityAlert[] = []) {
    this.alerts = [...initialAlerts];
  }

  getAllAlerts(): SecurityAlert[] {
    return [...this.alerts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getAlertsByType(type: AlertType | 'ALL'): SecurityAlert[] {
    if (type === 'ALL') return this.getAllAlerts();
    return this.alerts.filter((a) => a.alertType === type);
  }

  addAlert(newAlert: SecurityAlert): boolean {
    const key = `${newAlert.contractAddress}_${newAlert.alertType}`;
    const now = Date.now();
    const lastTime = this.lastAlertTimestamp.get(key) || 0;

    // QUY TẮC: EMERGENCY_EXIT không bao giờ bị chặn bởi cooldown
    const isEmergency = newAlert.alertType === 'EMERGENCY_EXIT';

    if (!isEmergency && now - lastTime < this.DEFAULT_COOLDOWN_MS) {
      // Cooldown còn hiệu lực -> Bỏ qua chống spam
      return false;
    }

    // Ghi nhận cảnh báo
    this.lastAlertTimestamp.set(key, now);
    this.alerts.unshift(newAlert);

    // Giữ tối đa 100 cảnh báo gần nhất trong bộ nhớ
    if (this.alerts.length > 100) {
      this.alerts.pop();
    }

    return true;
  }

  clear(): void {
    this.alerts = [];
    this.lastAlertTimestamp.clear();
  }
}
