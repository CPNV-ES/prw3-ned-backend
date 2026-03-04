function getSystemStatus() {
  return {
    status: "ok",
    uptime: process.uptime(),
  };
}

module.exports = {
  getSystemStatus,
};
