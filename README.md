# dsh-context-length

DSH（DeepSeek Harness）插件：在 **设置 → 模型** 下方新增「**上下文长度**」页面，为指定渠道（提供方）的指定模型自定义上下文窗口长度。

- 页面位置：设置面板左侧导航「模型」之下（`settings.section`，order 11）。
- 渠道列表只列出**已配置**的提供方（设置文档中存在其 profile，如 `newapi`、`火山`），未配置的内置路由不会出现。
- **现代化布局**：渠道与模型联动两列网格展示，直观紧凑。
- **容量预设与实时换算**：支持 `32K`、`64K`、`128K`、`256K`、`1M` 等一键快捷填入，并在输入时实时展示换算 token 数预览。
- **全景自定义模型列表**：底部聚合展示所有渠道已自定义上下文的模型清单，支持一键载入编辑或快速恢复默认。
- 只有点击「保存」才会通过 `settings.mutate` 写入设置文档并生效；不点保存不产生任何修改。
- 支持「恢复默认」：清除某个模型的 `contextWindow` 覆盖，回到提供方默认值。

## 架构

- `lib/index.js` —— 宿主（node）半端：最小条目，仅保证 loader 挂载。
- `lib/client.js` —— 浏览器半端：设置页 UI。浏览器端的加载走官方机制：`package.json` 声明 `dsh.client`（platform: web），`client-modules` 插件自动把它纳入 `window.__DSH_BOOT__` 引导图，并在 `/plugins/dsh-context-length/client.js` 托管其 bundle。读写全部走官方 wire 接口（`connection.api.llm.providers` / `settings.mutate` / `settingsScope.describe()`），宿主始终是唯一事实源。
- `test/smoke.mjs` —— 冒烟测试：在 Node 中模拟 DSH 模块加载器环境，验证 client 半端能正确加载、注册 `settings.section`（id=`context-length`，order=11，标签「上下文长度」）。

## 安装

```sh
cd "$DSH_HOME/profiles/web"
pnpm add file:/path/to/dsh-context-length
```

然后在 profile 的 `cordis.patch.yml` 追加：

```yaml
- insert:
    - id: dsh-context-length
      name: 'dsh-context-length'
```

安装后刷新浏览器即可在 设置 → 上下文长度 看到页面（配置热重载会即时生效；若未生效则重启 `dsh web`）。
