module.exports = {
  apps: [{
    name: 'lg-webapp',
    script: 'npm',
    args: 'run dev',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: false,
    autorestart: true
  }]
}
