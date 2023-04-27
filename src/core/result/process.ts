import {
  ForbiddenException,
  Success,
  NotFoundException,
  ParameterException,
  ServerErrorException,
  UnAuthenticatedException
} from './process-state'

/**
 * 使用这个类来发送处理结果
 */
export class Process {
  /**
   * success
   * @param code errorCode
   * @param message errorCode message
   */
  success(data: any | undefined = undefined): unknown {
    throw new Success(data)
  }

  /**
   * 参数校检错误
   * @param codeOrMessage errorCode | error message
   */
  parameterException(codeOrMessage: number | string) {
    throw new ParameterException(codeOrMessage)
  }

  /**
   * token过期或无效
   * @param code errorCode
   */
  unAuthenticatedException(code: number) {
    throw new UnAuthenticatedException(code)
  }

  /**
   * 请求被拒绝
   * @param code errorCode
   */
  forbiddenException(code: number) {
    throw new ForbiddenException(code)
  }

  /**
   * 资源不存在
   * @param code errorCode
   */
  notFoundException(code: number) {
    throw new NotFoundException(code)
  }

  /**
   * 服务器异常
   * @param codeOrMessage errorCode | error message
   */
  serverErrorException(codeOrMessage: number | string) {
    throw new ServerErrorException(codeOrMessage)
  }
}
