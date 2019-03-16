import debug0 from "debug"
import express, { NextFunction, Request, Response } from "express"
import { NetConnectOpts } from "net"
import { Responder } from "./Responder"

const debug = debug0("express-php-fpm")

export type KeyValue = { [i: string]: string | number }
export type Options = { documentRoot: string; env: KeyValue; socketOptions: NetConnectOpts }

export default function init(opt: Options) {
  return new Handler(opt).router
}

export class Handler {
  connections = new Array(100)
  router = express.Router()

  constructor(public opt: Options) {
    debug("new Router")

    this.router.use(this.handle.bind(this))
    this.router.use(express.static(opt.documentRoot))
  }

  handle(req: Request, res: Response, next: NextFunction) {
    let file = withoutQueryString(req.url)
    if (file.endsWith("/")) {
      file += "index.php"
    }
    if (!file.endsWith(".php")) {
      next()
      return
    }

    new Responder(this, file, req, res, next)
  }

  getFreeReqId() {
    let i = 0
    while (this.connections[++i]) {}
    this.connections[i] = true
    return i
  }

  freeUpReqId(reqId: number) {
    this.connections[reqId] = false
  }
}

function withoutQueryString(url: string) {
  const sep = url.indexOf("?")
  return sep === -1 ? url : url.substr(0, sep)
}
