import { SecurityAlert } from '../types';

export async function sendTelegramNotification(
  alert: SecurityAlert,
  botToken?: string,
  chatId?: string
): Promise<boolean> {
  const token = botToken || localStorage.getItem('telegram_bot_token');
  const chat = chatId || localStorage.getItem('telegram_chat_id');

  if (!token || !chat) {
    return false;
  }

  const emoji =
    alert.alertType === 'EMERGENCY_EXIT'
      ? '🚨'
      : alert.alertType === 'BUY_OPPORTUNITY'
      ? '🚀'
      : alert.alertType === 'TAKE_PROFIT'
      ? '🎯'
      : alert.alertType === 'TRAILING_STOP'
      ? '🛑'
      : '⚠️';

  const text = `${emoji} <b>[AI MEME COIN RADAR] ${alert.alertType}</b>
━━━━━━━━━━━━━━━━━━━━
<b>Token:</b> ${alert.tokenSymbol} (${alert.chain})
<b>Lý do:</b> ${alert.reason}
<b>Điểm Cơ hội:</b> ${alert.opportunityScore}/100 | <b>Rủi ro:</b> ${alert.riskScore}/100
<b>Mức độ:</b> ${alert.severity}
<b>Contract:</b> <code>${alert.contractAddress}</code>
<b>Thời gian:</b> ${new Date(alert.timestamp).toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━
<i>⚠️ Đây là công cụ phân tích & cảnh báo. Tuyệt đối không tự động giao dịch.</i>`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch (err: any) {
    console.warn('Failed to send Telegram alert:', err.message);
    return false;
  }
}
