export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Только POST запросы' });
  }
  
  try {
    const { text, id } = req.body;
    
    // Проверка
    if (!text || !id) {
      return res.status(400).json({ error: 'Нужны text и id' });
    }
    
    // Токен из Vercel
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TOKEN) {
      console.error('❌ Токен не найден');
      return res.status(500).json({ error: 'Токен не настроен' });
    }
    
    // Отправка в Telegram
    const telegramUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: id,
        text: text,
        parse_mode: 'HTML'
      })
    });
    
    const data = await response.json();
    
    // Ответ
    if (data.ok) {
      console.log(`✅ Отправлено в чат ${id}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Сообщение отправлено' 
      });
    } else {
      console.error('❌ Telegram ошибка:', data);
      return res.status(400).json({ 
        success: false, 
        error: data.description || 'Ошибка Telegram' 
      });
    }
    
  } catch (error) {
    console.error('💥 Ошибка сервера:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера' 
    });
  }
  }
