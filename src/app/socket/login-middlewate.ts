import { verifyToken } from "@/core/auth"
import type { Socket } from "socket.io"
import { getOneUserById, saveUserSocketId } from "../service/user"

export default async (socket: Socket, next: Function) => {
  try {
    const { id } = verifyToken(socket.handshake.headers.authorization!) as any
    const uid = parseInt(id)
    if (!Number.isFinite(uid)) throw Error("invalid token!")
    const user = await getOneUserById(uid)
    if (!user) throw Error("invalid user!")
    socket.data.uid = uid
    await saveUserSocketId(uid, socket.id)
    next()
  } catch(e: any) {
    next(e)
  }
}