const { getSystemStatus } = require("../services/health.service");

function getHealth(req, res) {
  res.status(200).json(getSystemStatus());
}

module.exports = {
  getHealth,
};
