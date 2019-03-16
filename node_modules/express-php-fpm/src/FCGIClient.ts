import net, { NetConnectOpts, Socket } from "net"
import * as FCGI from "./FCGI"
import { Record } from "./FCGI"

export class FCGIClient {
  buffer = Buffer.alloc(0)
  reqId = 0
  socket: Socket

  constructor(socketOptions: NetConnectOpts) {
    this.onData = this.onData.bind(this)
    this.onError = this.onError.bind(this)
    this.onClose = this.onClose.bind(this)

    this.socket = net.connect(socketOptions)
    this.socket.on("data", this.onData)
    this.socket.on("error", this.onError)
    this.socket.on("close", this.onClose)
  }

  send(msgType: number, content: Buffer) {
    for (let offset = 0; offset < content.length || offset === 0; offset += 0xffff) {
      const chunk = content.slice(offset, offset + 0xffff)
      const header = FCGI.createHeader(FCGI.VERSION_1, msgType, this.reqId, chunk.length, 0)
      this.socket.write(header)
      this.socket.write(chunk)
    }
  }

  onData(data: Buffer) {
    this.buffer = Buffer.concat([this.buffer, data])

    while (this.buffer.length) {
      const record = FCGI.parseHeader(this.buffer)
      if (!record) {
        break
      }

      this.buffer = this.buffer.slice(record.recordLength)
      this.onRecord(record)
    }
  }

  onError(e: Error) {}

  onClose(hadError: boolean) {}

  onRecord(record: Record) {}
}
