module.exports = {
  apps: [
    {
      name: 'smap-v2',
      cwd: __dirname,
      script: './node_modules/next/dist/bin/next',
      args: 'start --hostname 127.0.0.1 --port 3000',
      interpreter: process.execPath,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'smap-reverb',
      cwd: process.env.LARAVEL_PATH || '/var/www/smap',
      script: 'artisan',
      args: 'reverb:start --host=127.0.0.1 --port=8080',
      interpreter: 'php',
      autorestart: true,
      max_restarts: 10,
      env: {
        APP_ENV: 'production',
      },
    },
  ],
};
