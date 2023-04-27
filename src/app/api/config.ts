import CONFIG from "@/config"
import type { Context } from "koa"
import Router from "koa-router"

const router = new Router({
  prefix: "/config"
})

/** 获取好友请求信息 */
router.get("/client/version", async (ctx: Context) => {
  global.PROCESS.success({ version:  CONFIG.CLIENT.VERSION })
})
