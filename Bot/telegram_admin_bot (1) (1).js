const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(TOKEN, { polling: true });

const DATA_FILE = './admins.json';
let admins = {};

function loadAdmins() {
  if (fs.existsSync(DATA_FILE)) {
    admins = JSON.parse(fs.readFileSync(DATA_FILE));
  } else {
    admins = { admins: {} };
  }
}

function saveAdmins() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(admins, null, 2));
}

loadAdmins();

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `👋 خوش آمدید! اگر ادمین هستید، با دستور /admin رمز را وارد کنید.`);
});

bot.onText(/\/admin (.+)/, (msg, match) => {
  const userId = msg.chat.id.toString();
  const name = msg.from.first_name || 'بدون‌نام';
  const code = match[1].trim();

  if (code === '12345') {
    if (!admins.admins[userId]) {
      admins.admins[userId] = { name, categories: [] };
      saveAdmins();
      bot.sendMessage(msg.chat.id, '✅ شما به عنوان ادمین ثبت شدید.');
    } else {
      bot.sendMessage(msg.chat.id, 'ℹ️ شما قبلاً ثبت شده‌اید.');
    }
  } else {
    bot.sendMessage(msg.chat.id, '❌ رمز نادرست است.');
  }
});

bot.onText(/\/admins/, (msg) => {
  const list = Object.entries(admins.admins)
    .map(([id, info]) => `👤 ${info.name} (${id})
📦 ${info.categories.join(', ') || 'ندارد'}`)
    .join('\n\n') || 'ادمینی ثبت نشده است.';
  bot.sendMessage(msg.chat.id, '📋 لیست ادمین‌ها:\n\n' + list);
});

bot.onText(/\/setcategory (.+)/, (msg, match) => {
  const userId = msg.chat.id.toString();
  const cat = match[1].trim().toLowerCase();

  if (admins.admins[userId]) {
    if (!admins.admins[userId].categories.includes(cat)) {
      admins.admins[userId].categories.push(cat);
      saveAdmins();
      bot.sendMessage(msg.chat.id, `✅ کتگوری "${cat}" برای شما ثبت شد.`);
    } else {
      bot.sendMessage(msg.chat.id, `ℹ️ شما قبلاً "${cat}" را انتخاب کرده‌اید.`);
    }
  } else {
    bot.sendMessage(msg.chat.id, '❌ شما هنوز ادمین نیستید. با دستور /admin ثبت شوید.');
  }
});