/**
 * 处理结果
 * 子类包括Exception和Success
 */
export class ProcessState { }

/**
 * 处理结果：成功
 */
export class Success extends ProcessState {
  data: any | undefined
  constructor(data: any | undefined) {
    super()
    this.data = data
  }
}

/**
 * Exception基类 
 */
export class Exception extends ProcessState {
  code: number | string
  status: number
  constructor(code: number | string, status: number) {
    super()
    this.code = code
    this.status = status
  }
}

/**
 * 参数校检错误
 */
export class ParameterException extends Exception {
  constructor(code: number | string) {
    super(code, 400)
  }
}

/**
 * token过期或无效
 */
export class UnAuthenticatedException extends Exception {
  constructor(code: number) {
    super(code, 401)
  }
}

/**
 * 请求被拒绝
 */
export class ForbiddenException extends Exception {
  constructor(code: number) {
    super(code, 403)
  }
}

/**
 * 资源不存在
 */
export class NotFoundException extends Exception {
  constructor(code: number) {
    super(code, 404)
  }
}

/**
 * 服务器异常
 */
export class ServerErrorException extends Exception {
  constructor(code: number | string) {
    super(code, 500)
  }
}
