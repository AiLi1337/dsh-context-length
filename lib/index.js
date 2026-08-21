// @ts-check
/**
 * dsh-context-length — host half.
 *
 * 浏览器端在 lib/client.js；浏览器端的加载完全走官方机制：
 * package.json 声明了 `dsh.client`（platform: web），client-modules 插件
 * 会在本条目挂载后自动把它纳入 `window.__DSH_BOOT__` 引导图，并在
 * `/plugins/dsh-context-length/client.js` 托管其 bundle，无需本半端自行
 * 托管或注入。本文件因此保持为最小宿主条目（loader 需要它存在）。
 *
 * 业务读写也不经过这里：浏览器半端直接走官方 `connection.api` 的
 * `llm.providers` / `settings.mutate` / `settingsScope.describe()`。
 */

/** 稳定 Cordis 插件名。 */
export const name = "dsh-context-length";

/**
 * 宿主半端无需任何服务或动作；apply 保持为空以实现最小装载。
 * @param {import("cordis").Context} _ctx
 */
export function apply(_ctx) {
	// 浏览器端由 client-modules 按 `dsh.client` 声明自动装载。
}
