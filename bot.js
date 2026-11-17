// Бот, который открывает игру как Telegram Mini App. Без зависимостей, Node.js 18+.
// Запуск (PowerShell):
//   $env:BOT_TOKEN="123:ABC"; $env:WEBAPP_URL="https://<ваш-адрес>/"; node bot.js
const TOKEN = process.env.BOT_TOKEN;
const URL_ = process.env.WEBAPP_URL;
if (!TOKEN) { console.error('Укажи токен бота в BOT_TOKEN'); process.exit(1); }
if (!URL_ || !URL_.startsWith('https://')) {
  console.error('Укажи адрес игры в WEBAPP_URL (обязательно https://)'); process.exit(1);
}
const API = `https://api.telegram.org/bot${TOKEN}/`;

async function api(method, params = {}) {
  const res = await fetch(API + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`${method}: ${json.error_code} ${json.description}`);
  return json.result;
}

const playButton = { inline_keyboard: [[{ text: '▶️ Играть', web_app: { url: URL_ } }]] };

async function onMessage(m) {
  if (m.chat.type !== 'private') return; // кнопки web_app работают только в личке
  await api('sendMessage', {
    chat_id: m.chat.id,
    text: '❌⭕ Крестики-нолики против бота.\nТри уровня сложности, счёт сохраняется в твоём Telegram.',
    reply_markup: playButton,
  });
}

async function main() {
  const me = await api('getMe');
  // Кнопка «Играть» слева от поля ввода во всех личных чатах с ботом
  await api('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Играть', web_app: { url: URL_ } } });
  await api('setMyCommands', { commands: [{ command: 'play', description: 'Открыть игру' }] });
  console.log(`Бот @${me.username} запущен, игра: ${URL_}`);
  let offset = 0;
  for (;;) {
    let updates = [];
    try {
      updates = await api('getUpdates', { offset, timeout: 30, allowed_updates: ['message'] });
    } catch (e) {
      console.error(e.message);
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    for (const u of updates) {
      offset = u.update_id + 1;
      if (u.message) await onMessage(u.message).catch((e) => console.error(e.message));
    }
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
