// Конфигурация PM2 для запуска сайта на VPS.
// Запуск:   pm2 start ecosystem.config.cjs
// Перезапуск после обновления:  pm2 reload electroepil
// Автозапуск после ребута:      pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: "electroepil",
      // Запускаем тот же скрипт, что и `npm run start` (tsx server.ts)
      script: "server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx",
      cwd: __dirname,
      // Один инстанс: приложение хранит загрузки на диске и не рассчитано на кластер
      instances: 1,
      exec_mode: "fork",
      // Перезапускать при падении, но не зацикливаться при битой конфигурации
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      // Перезапуск, если процесс превысит лимит памяти
      max_memory_restart: "400M",
      // Переменные читаются из .env через dotenv внутри server.ts.
      // Здесь дублируем только режим работы.
      env: {
        NODE_ENV: "production",
      },
      // Логи
      time: true,
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
    },
  ],
};
