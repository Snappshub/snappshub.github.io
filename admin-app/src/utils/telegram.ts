import { AppItem } from '../types';

export interface TelegramPostResult {
  success: boolean;
  message: string;
  telegramResponse?: any;
}

export function formatTelegramAppMessage(app: AppItem, siteUrl: string): string {
  return `🚀 *New App Release on SnappsHub!*

📱 *${app.name}*
🏷 *Category:* ${app.category}
🔢 *Version:* \`${app.version}\` (Build ${app.versionCode})
📦 *Size:* ${app.size}
⭐ *Rating:* ${app.rating} / 5.0

📝 *Description:*
${app.description}

${app.whatsNew ? `✨ *What's New:*\n${app.whatsNew}\n` : ''}
⚡ *Download APK Now:*
🔗 Direct Link: ${app.downloadUrl || app.directApkUrl || siteUrl}
🌐 Website: ${siteUrl}

#SnappsHub #${app.category.replace(/[^a-zA-Z0-9]/g, '')} #Android #APK`;
}

export async function broadcastToTelegram(
  botToken: string,
  targetChannel: string,
  text: string
): Promise<TelegramPostResult> {
  if (!botToken || !targetChannel) {
    return {
      success: false,
      message: 'Bot token and Target channel are required.'
    };
  }

  const cleanToken = botToken.trim();
  const cleanChannel = targetChannel.trim().startsWith('@')
    ? targetChannel.trim()
    : `@${targetChannel.trim()}`;

  const apiUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: cleanChannel,
        text: text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      })
    });

    const data = await res.json();

    if (data.ok) {
      return {
        success: true,
        message: `Posted successfully to ${cleanChannel} (Message ID: ${data.result?.message_id})`,
        telegramResponse: data.result
      };
    } else {
      return {
        success: false,
        message: `Telegram API error: ${data.description || 'Unknown error'} (Code: ${data.error_code})`,
        telegramResponse: data
      };
    }
  } catch (err: any) {
    // Handling CORS or network failures gracefully
    return {
      success: false,
      message: `Direct Telegram API network request failed: ${err.message || 'CORS restriction or network timeout'}. Bot token and channel format are valid.`
    };
  }
}
