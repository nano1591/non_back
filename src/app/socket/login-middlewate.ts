import { verifyToken } from "@/core/auth"
import type { Socket } from "socket.io"
import { saveUserSocketId } from "../service/user"

export default async (socket: Socket, next: Function) => {
  try {
    const { id } = verifyToken(socket.handshake.headers.authorization!) as any
    const uid = parseInt(id)
    if (!Number.isFinite(uid)) throw Error("invalid token!")
    socket.data.uid = uid
    await saveUserSocketId(uid, socket.id)
    next()
  } catch(e: any) {
    next(e)
  }
}