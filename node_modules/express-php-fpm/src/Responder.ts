import debug0 from "debug"
import { NextFunction, Request, Response } from "express"
import * as FCGI from "./FCGI"
import { Record } from "./FCGI"
import { FCGIClient } from "./FCGIClient"
import { Handler, KeyValue } from "./index"

const debug = debug0("express-php-fpm:responder")

export class Responder extends FCGIClient {
  gotHead = false

  constructor(
    public handler: Handler,
    file: string,
    public req: Request,
    public res: Response,
    public next: NextFunction,
  ) {
    // init sockets
    super(handler.opt.socketOptions)

    // locals
    this.reqId = handler.getFreeReqId()

    // debug
    debug("new Responder %d for %s", this.reqId, file)

    // send req
    const env = createEnvironment(handler.opt.documentRoot, file, req, handler.opt.env)
    this.send(
      FCGI.MSG.BEGIN_REQUEST,
      FCGI.createBeginRequestBody(FCGI.ROLE.RESPONDER, FCGI.DONT_KEEP_CONN),
    )
    this.send(FCGI.MSG.PARAMS, FCGI.createKeyValueBufferFromObject(env))
    this.send(FCGI.MSG.PARAMS, Buffer.alloc(0))

    // express request
    req.on("data", this.onReqData.bind(this))
    req.on("end", this.onReqEnd.bind(this))
  }

  onReqData(chunk: Buffer) {
    this.send(FCGI.MSG.STDIN, chunk)
  }

  onReqEnd() {
    this.send(FCGI.MSG.STDIN, Buffer.alloc(0))
  }

  onError(e: Error) {
    this.next(e)
  }

  onClose(hadError: boolean) {
    this.handler.freeUpReqId(this.reqId)
  }

  send(msgType: number, content: Buffer) {
    debug("send %s", FCGI.GetMsgType(msgType))
    super.send(msgType, content)
  }

  onRecord(record: Record) {
    debug("got %s", FCGI.GetMsgType(record.type))

    switch (record.type) {
      case FCGI.MSG.STDERR:
        break
      case FCGI.MSG.STDOUT:
        this.stdout(record.content)
        break
      case FCGI.MSG.END_REQUEST:
        this.res.end()
        break
      case FCGI.MSG.GET_VALUES_RESULT:
        break
    }
  }

  stdout(content: Buffer) {
    if (this.gotHead) {
      this.res.write(content)
      return
    }
    this.gotHead = true

    const sep = content.indexOf("\r\n\r\n")
    const head = content.slice(0, sep)
    const body = content.slice(sep + 4)

    for (const h of head.toString().split("\r\n")) {
      const hsep = h.indexOf(":")
      const hkey = h.substr(0, hsep)
      const hval = h.substr(hsep + 2)

      if (hkey === "Status") {
        this.res.status(parseInt(hval.substr(0, 3)))
        continue
      }
      this.res.append(hkey, hval)
    }

    this.res.write(body)
  }
}

function createEnvironment(documentRoot: string, file: string, req: Request, extraEnv: KeyValue) {
  const sep = req.url.indexOf("?")
  const qs = sep === -1 ? "" : req.url.substr(sep + 1)

  const env: KeyValue = {
    GATEWAY_INTERFACE: "CGI/1.1",
    PATH: "",

    REQUEST_METHOD: req.method,
    REDIRECT_STATUS: 200, // https://stackoverflow.com/questions/24378472/what-is-php-serverredirect-status

    REMOTE_ADDR: req.connection.remoteAddress || "",
    REMOTE_PORT: req.connection.remotePort || "",

    SERVER_PROTOCOL: req.protocol.toUpperCase() + "/" + req.httpVersion,
    SERVER_ADDR: req.connection.localAddress,
    SERVER_PORT: req.connection.localPort,

    SERVER_SOFTWARE: "express-php-fpm",
    SERVER_NAME: "",
    SERVER_ADMIN: "",
    SERVER_SIGNATURE: "",

    DOCUMENT_ROOT: documentRoot,
    SCRIPT_FILENAME: documentRoot + file,
    SCRIPT_NAME: file,

    REQUEST_URI: req.url,
    QUERY_STRING: qs,

    CONTENT_TYPE: req.headers["content-type"] || "",
    CONTENT_LENGTH: req.headers["content-length"] || "",

    // AUTH_TYPE
    // PATH_INFO
    // PATH_TRANSLATED
    // REMOTE_HOST
    // REMOTE_IDENT
    // REMOTE_USER
    // UNIQUE_ID
  }

  const headers = Object.entries(req.headers).reduce(
    (acc, [key, value]) => {
      return { ...acc, ["HTTP_" + key.toUpperCase().replace(/-/g, "_")]: String(value) }
    },
    {} as KeyValue,
  )

  return { ...env, ...headers, ...extraEnv }
}
