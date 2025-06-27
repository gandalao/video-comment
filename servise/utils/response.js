// 文件路径: ./utils/response.js

/**
 * 成功响应
 */
function success(res, message = "操作成功", data = null, status = 200) {
  return res.status(status).json({
    status,
    message,
    data,
  });
}

/**
 * 失败响应
 */
function error(res, message = "操作错误", status = 500) {
  return res.status(status).json({
    status,
    message,
  });
}

/**
 * 客户端错误响应（如参数错误、冲突等）
 */
function clientError(res, status = 400, message = "客户端错误") {
  return res.status(status).json({
    status,
    message,
  });
}

/**
 * 服务器内部错误
 */
function serverError(res, error, message = "服务器内部错误", status = 500) {
  console.error(message, error);
  return res.status(status).json({
    status,
    message,
    error: error.message,
  });
}

/**
 * 自定义响应（灵活扩展）
 */
function customResponse(res, status = 500, message = "未知状态", payload = {}) {
  return res.status(status).json({
    status,
    message,
    ...payload,
  });
}

module.exports = {
  success,
  error,
  clientError,
  serverError,
  customResponse,
};
