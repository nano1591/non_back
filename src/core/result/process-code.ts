/**
 * 处理结果code和message
 */
const CODE = new Map([
  [0, '成功。'],

  [10000, '服务器未知错误。'],
  [10400, '请求格式不正确。'],
  [10401, 'token已过期或无效。'],
  [10403, '没有权限访问。'],
  [10404, '资源不存在或已删除。'],
  [10409, '用户名或账号已存在。'],
  [10410, '用户不存在。'],
  [10411, '当前用户已登陆。'],
  [10412, '当前用户未登录。'],
  [10413, '好友关系已存在。'],
  [10414, '不能给自己发送、同意或拒绝好友请求。'],
  [10415, '好友请求不存在。'],
  [10416, '好友请求已被拒绝。'],
  [10417, '好友关系不存在'],

  [20000, 'User Module Generic Error.'],
  [20001, 'The user does not exist or password is incorrect.'],
  [20002, 'No suitable login method found.'],
])

export default CODE