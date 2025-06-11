module.exports = {
    apps: [{
        name: 'glitchweb-family-bot',
        script: 'bot.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            TZ: 'Europe/Moscow'
        },
        env_production: {
            NODE_ENV: 'production',
            TZ: 'Europe/Moscow'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000,
        restart_delay: 4000,
        max_restarts: 10,
        min_uptime: '10s'
    }]
}