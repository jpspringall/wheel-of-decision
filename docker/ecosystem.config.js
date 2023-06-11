module.exports = {
  apps: [
    {
      name: "ssh",
      cwd: "/",
      script: "/usr/sbin/sshd",
    },
    {
      name: "app",
      cwd: "/",
      script: "/dist/server/main.js",
    },
  ],
};
