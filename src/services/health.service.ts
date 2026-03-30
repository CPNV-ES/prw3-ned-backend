export interface SystemStatus {
  status: "ok";
  uptime: number;
}

export function getSystemStatus(): SystemStatus {
  return {
    status: "ok",
    uptime: process.uptime(),
  };
}
