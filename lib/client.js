// dsh-context-length — browser half.
//
// Hand-authored client bundle in the DSH module-loader factory format:
// `window.__ModuleLoader__.load({ id, factory })`. The factory receives the
// module-table `require`, so only shell-externalized modules may be imported
// (react / react/jsx-runtime are in the static table).
//
// It registers a 「上下文长度」page into the settings panel
// (`settings.section`), placed directly below the built-in 「模型」(Models)
// section (order 11 > 10). The page lists every configurable provider
// (渠道), lets the user pick one model, fill in a context-window length
// (e.g. 131072, 256K, 1M), and only writes it to the settings document when
// 保存 is clicked. Reads/writes go through the official wire faces
// (`connection.api.llm.providers`, `settings.mutate`,
// `settingsScope.describe()`), so the host stays the single fact source and
// the change takes effect once the settings provider commits it.
window.__ModuleLoader__.load({
	id: "dsh-context-length",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");

		// ── styles (injected once, same pattern as built-in client plugins) ──
		const CSS_ID = "dsh-context-length/library.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"" + CSS_ID + "\"]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-context-length";
			tag.dataset.pluginCss = CSS_ID;
			tag.textContent = [
				".dcl-section{box-sizing:border-box;width:100%;max-width:760px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:18px}",
				".dcl-header{display:flex;flex-direction:column;gap:4px}",
				".dcl-title{color:var(--dsw-alias-label-primary);margin:0;font-size:18px;font-weight:600;line-height:26px;letter-spacing:-0.01em}",
				".dcl-intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px;line-height:20px}",
				".dcl-card{background:var(--dsw-alias-bg-module-platform);background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 85%,transparent);backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);border:1px solid var(--dsw-alias-border-l1);border-radius:16px;padding:20px 22px;display:flex;flex-direction:column;gap:16px;box-shadow:0 4px 20px -2px rgba(0,0,0,.06),0 2px 6px -1px rgba(0,0,0,.03)}",
				".dcl-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}",
				"@media (max-width:580px){.dcl-grid-2{grid-template-columns:1fr}}",
				".dcl-field{display:flex;flex-direction:column;gap:6px;position:relative}",
				".dcl-field-label{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;display:flex;align-items:center;justify-content:space-between}",
				".dcl-input,.dcl-select-trigger{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;height:38px;font:inherit;background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 85%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:var(--dsw-alias-label-primary);border-radius:10px;padding:0 12px;font-size:13px;line-height:20px;transition:all .18s cubic-bezier(0.16,1,0.3,1)}",
				".dcl-input:focus,.dcl-select-trigger:focus,.dcl-select-trigger.is-open{border-color:var(--dsw-alias-brand-primary);outline:none;box-shadow:0 0 0 3px rgba(59,130,246,.18),0 1px 2px rgba(0,0,0,.05)}",
				".dcl-input::placeholder{color:var(--dsw-alias-label-dimmed)}",
				".dcl-input:disabled,.dcl-select-trigger:disabled{opacity:.5;cursor:not-allowed}",
				".dcl-select-wrapper{position:relative;width:100%}",
				".dcl-select-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;text-align:left;user-select:none}",
				".dcl-select-value-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}",
				".dcl-select-arrow{color:var(--dsw-alias-label-tertiary);font-size:11px;flex-shrink:0;transition:transform .2s ease}",
				".dcl-select-arrow.is-open{transform:rotate(180deg)}",
				".dcl-dropdown-backdrop{position:fixed;inset:0;z-index:25;background:transparent}",
				".dcl-dropdown-pop{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:35;background:var(--dsw-alias-bg-module-platform);background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 82%,transparent);backdrop-filter:blur(18px) saturate(180%);-webkit-backdrop-filter:blur(18px) saturate(180%);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:0 12px 32px -4px rgba(0,0,0,.22),0 4px 12px -2px rgba(0,0,0,.08);padding:6px;display:flex;flex-direction:column;gap:4px;max-height:260px;animation:dcl-dropdown-in .15s cubic-bezier(0.16,1,0.3,1)}",
				"@keyframes dcl-dropdown-in{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}",
				".dcl-dropdown-search-wrap{padding:2px 2px 6px 2px;border-bottom:1px solid var(--dsw-alias-border-l1)}",
				".dcl-dropdown-search{box-sizing:border-box;width:100%;height:30px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 80%,transparent);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:0 8px;outline:none}",
				".dcl-dropdown-search:focus{border-color:var(--dsw-alias-brand-primary)}",
				".dcl-dropdown-options-list{display:flex;flex-direction:column;gap:2px;overflow-y:auto;max-height:200px}",
				".dcl-dropdown-options-list::-webkit-scrollbar,.dcl-effort-pop::-webkit-scrollbar{width:5px}",
				".dcl-dropdown-options-list::-webkit-scrollbar-thumb,.dcl-effort-pop::-webkit-scrollbar-thumb{background:rgba(128,128,128,.3);border-radius:4px}",
				".dcl-dropdown-options-list::-webkit-scrollbar-thumb:hover,.dcl-effort-pop::-webkit-scrollbar-thumb:hover{background:rgba(128,128,128,.5)}",
				".dcl-dropdown-option{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:8px;cursor:pointer;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary);transition:all .12s ease}",
				".dcl-dropdown-option:hover{background:var(--dsw-alias-interactive-bg-hover-solid);background:color-mix(in srgb,var(--dsw-alias-interactive-bg-hover-solid) 80%,transparent)}",
				".dcl-dropdown-option.is-selected{background:rgba(59,130,246,.12);color:var(--dsw-alias-brand-primary);font-weight:500}",
				".dcl-option-content{display:flex;flex-direction:column;min-width:0;gap:1px}",
				".dcl-option-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".dcl-option-sublabel{font-size:11px;color:var(--dsw-alias-label-tertiary)}",
				".dcl-option-check{font-size:12px;color:var(--dsw-alias-brand-primary);font-weight:bold;margin-left:8px}",
				".dcl-dropdown-empty{font-size:12px;color:var(--dsw-alias-label-tertiary);text-align:center;padding:12px 6px}",
				".dcl-status-banner{display:flex;align-items:center;justify-content:space-between;background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 80%,transparent);border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;padding:9px 12px;font-size:12px;line-height:18px}",
				".dcl-status-info{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary)}",
				".dcl-status-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:500;font-family:var(--ds-font-family-code,monospace)}",
				".dcl-status-badge.is-default{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-tertiary)}",
				".dcl-status-badge.is-custom{background:rgba(59,130,246,.12);color:var(--dsw-alias-brand-primary);border:1px solid rgba(59,130,246,.25)}",
				".dcl-presets-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:2px}",
				".dcl-presets-label{font-size:11px;color:var(--dsw-alias-label-tertiary);margin-right:2px}",
				".dcl-preset-tag{font-size:11px;padding:3px 9px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 80%,transparent);color:var(--dsw-alias-label-secondary);cursor:pointer;transition:all .15s ease;user-select:none}",
				".dcl-preset-tag:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover-solid)}",
				".dcl-preset-tag.is-active{background:var(--dsw-alias-brand-primary);color:#fff;border-color:var(--dsw-alias-brand-primary);box-shadow:0 2px 6px rgba(59,130,246,.3)}",
				".dcl-preset-tag:disabled{opacity:.4;cursor:not-allowed}",
				".dcl-effort-current{display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:18px}",
				".dcl-level-tag{font-size:11px;padding:2px 8px;border-radius:8px;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,monospace)}",
				".dcl-effort-picker{position:relative;display:flex;flex-direction:column;gap:6px}",
				".dcl-effort-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;text-align:left}",
				".dcl-effort-caret{color:var(--dsw-alias-label-tertiary);font-size:11px;flex-shrink:0;transition:transform .2s ease}",
				".dcl-effort-caret.is-open{transform:rotate(180deg)}",
				".dcl-effort-pop{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:35;background:var(--dsw-alias-bg-module-platform);background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 82%,transparent);backdrop-filter:blur(18px) saturate(180%);-webkit-backdrop-filter:blur(18px) saturate(180%);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:0 12px 32px -4px rgba(0,0,0,.22),0 4px 12px -2px rgba(0,0,0,.08);padding:6px;display:flex;flex-direction:column;max-height:280px;overflow-y:auto;animation:dcl-dropdown-in .15s cubic-bezier(0.16,1,0.3,1)}",
				".dcl-effort-option{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary);transition:all .12s ease}",
				".dcl-effort-option:hover{background:var(--dsw-alias-interactive-bg-hover-solid);background:color-mix(in srgb,var(--dsw-alias-interactive-bg-hover-solid) 80%,transparent)}",
				".dcl-effort-option input{accent-color:var(--dsw-alias-brand-primary);cursor:pointer;flex-shrink:0}",
				".dcl-effort-option-name{display:flex;align-items:center;gap:8px;min-width:0}",
				".dcl-effort-option-hint{font-size:11px;color:var(--dsw-alias-label-tertiary)}",
				".dcl-effort-pop-hint{font-size:11px;color:var(--dsw-alias-label-tertiary);padding:6px 8px 2px;border-top:1px solid var(--dsw-alias-border-l1);margin-top:4px}",
				".dcl-effort-backdrop{position:fixed;inset:0;z-index:25;background:transparent}",
				".dcl-preview-text{font-size:12px;color:var(--dsw-alias-label-tertiary);display:flex;align-items:center;gap:4px;font-family:var(--ds-font-family-code,monospace);margin-top:2px}",
				".dcl-alert{display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:10px;font-size:12px;line-height:18px}",
				".dcl-alert-success{background:rgba(16,185,129,.1);color:var(--dsw-alias-state-success-primary,#10b981);border:1px solid rgba(16,185,129,.2)}",
				".dcl-alert-error{background:rgba(239,68,68,.1);color:var(--dsw-alias-state-error-primary,#ef4444);border:1px solid rgba(239,68,68,.2)}",
				".dcl-alert-warn{background:rgba(245,158,11,.1);color:var(--dsw-alias-state-warn-label,#f59e0b);border:1px solid rgba(245,158,11,.2)}",
				".dcl-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px}",
				".dcl-btn-group-right{display:flex;align-items:center;gap:8px;margin-left:auto}",
				".dcl-btn{box-sizing:border-box;height:36px;font:inherit;cursor:pointer;border:none;border-radius:10px;justify-content:center;align-items:center;gap:6px;padding:0 16px;font-size:13px;font-weight:500;line-height:20px;display:inline-flex;transition:all .16s ease}",
				".dcl-btnPrimary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground,#fff)}",
				".dcl-btnPrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}",
				".dcl-btnSecondary{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 85%,transparent)}",
				".dcl-btnSecondary:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid);border-color:var(--dsw-alias-border-l3)}",
				".dcl-btnDanger{border:1px solid transparent;color:var(--dsw-alias-state-error-primary,#ef4444);background:rgba(239,68,68,.08)}",
				".dcl-btnDanger:hover:not(:disabled){background:rgba(239,68,68,.15)}",
				".dcl-btn:disabled{opacity:.45;cursor:not-allowed}",
				".dcl-btn:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-brand-primary);outline:none}",
				".dcl-btn-sm{height:28px;padding:0 10px;font-size:12px;border-radius:8px}",
				".dcl-list-section{display:flex;flex-direction:column;gap:10px;margin-top:8px}",
				".dcl-list-header{display:flex;align-items:center;justify-content:space-between}",
				".dcl-list-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px}",
				".dcl-count-pill{font-size:11px;font-weight:500;padding:1px 7px;border-radius:10px;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary)}",
				".dcl-table-wrap{border:1px solid var(--dsw-alias-border-l1);border-radius:14px;overflow:hidden;background:var(--dsw-alias-bg-module-platform);background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 85%,transparent);backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);box-shadow:0 4px 20px -2px rgba(0,0,0,.04)}",
				".dcl-list-items{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}",
				".dcl-list-item{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);gap:12px;transition:background .15s ease}",
				".dcl-list-item:last-child{border-bottom:none}",
				".dcl-list-item:hover{background:var(--dsw-alias-interactive-bg-hover-solid);background:color-mix(in srgb,var(--dsw-alias-interactive-bg-hover-solid) 60%,transparent)}",
				".dcl-item-meta{display:flex;align-items:center;gap:10px;min-width:0;flex:1}",
				".dcl-provider-badge{font-size:11px;padding:2px 7px;border-radius:6px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);flex-shrink:0}",
				".dcl-model-info{display:flex;flex-direction:column;gap:2px;min-width:0}",
				".dcl-model-id{font-family:var(--ds-font-family-code,monospace);font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".dcl-model-name{font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".dcl-item-val{display:flex;align-items:center;gap:10px;flex-shrink:0}",
				".dcl-val-badge{font-family:var(--ds-font-family-code,monospace);font-size:12px;font-weight:600;color:var(--dsw-alias-brand-primary);background:rgba(59,130,246,.08);padding:3px 8px;border-radius:6px}",
				".dcl-item-actions{display:flex;align-items:center;gap:6px}",
				".dcl-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px;border:1px dashed var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-module-platform);background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 85%,transparent);color:var(--dsw-alias-label-tertiary);font-size:13px;text-align:center;gap:4px}"
			].join("");
			document.head.appendChild(tag);
		}

		// ── locale dictionaries ──
		const NS = "dsh-context-length";
		const zh = {
			"nav": "上下文长度",
			"title": "上下文长度设置",
			"intro": "自定义各渠道模型的上下文窗口长度 (Context Window)，修改保存后即刻生效。",
			"provider": "渠道（提供方）",
			"providerPlaceholder": "选择渠道",
			"model": "模型",
			"modelPlaceholder": "选择模型",
			"currentStatus": "当前上下文状态",
			"currentUnset": "使用提供方默认",
			"currentCustom": "已自定义: {val}",
			"newValue": "自定义上下文长度",
			"valuePlaceholder": "输入容量，如 128K、256K、1M 或具体数值",
			"valueInvalid": "格式不正确，请输入正整数，支持带 K/M 后缀（例如 128K、1M）",
			"valueBlank": "请先输入上下文数值",
			"presets": "常用预设",
			"save": "保存修改",
			"saving": "保存中…",
			"saved": "已保存生效",
			"clear": "恢复默认",
			"cleared": "已清除自定义值，恢复渠道默认",
			"noModels": "该渠道暂无可配置的模型列表",
			"modelMissing": "该模型不在当前渠道的模型列表中",
			"conflict": "设置已被其他操作修改，请刷新后重试",
			"loadFailed": "加载配置失败",
			"readOnly": "当前部署环境的设置文档为只读模式",
			"retry": "重试",
			"loading": "正在加载渠道与模型配置…",
			"emptyProviders": "暂无已配置的渠道，请先在「模型」页面添加提供方",
			"overrides": "已自定义模型清单",
			"overridesEmpty": "暂无自定义配置，所有模型均使用渠道默认窗口",
			"edit": "编辑",
			"selectModelHint": "请在上方选择渠道与模型进行配置",
			"effortLabel": "思考强度 (Reasoning Effort)",
			"effortStateUnset": "跟随渠道默认",
			"effortStateDisabled": "不支持思考（non-reasoning）",
			"effortStateImageVideo": "该模型不支持思考强度配置",
			"effortOff": "关闭",
			"effortMinimal": "极低",
			"effortLow": "低",
			"effortMedium": "中",
			"effortHigh": "高",
			"effortXhigh": "极高",
			"effortMax": "最高",
			"effortEmpty": "至少选择一个档位",
			"effortCompatAdded": "已为渠道补全推理开关 (compat)",
			"effortNotSupported": "此模型无法配置思考强度",
			"effortBadge": "思考 {n} 档",
			"effortPick": "选择思考档位",
			"effortPicked": "已选 {n} 档",
			"effortConfigured": "当前 {n} 档 · 点击修改",
			"effortOffHint": "关闭思考",
			"effortHint": "可多选，点击「保存修改」后生效",
			"searchPlaceholder": "搜索选项...",
			"noMatches": "无匹配项"
		};
		const en = {
			"nav": "Context length",
			"title": "Context Window Settings",
			"intro": "Customize context-window limits for specific provider models. Changes take effect upon saving.",
			"provider": "Provider",
			"providerPlaceholder": "Choose a provider",
			"model": "Model",
			"modelPlaceholder": "Choose a model",
			"currentStatus": "Current Configuration",
			"currentUnset": "Provider default",
			"currentCustom": "Customized: {val}",
			"newValue": "Custom Context Window",
			"valuePlaceholder": "e.g. 128K, 256K, 1M or exact token count",
			"valueInvalid": "Invalid format. Enter a positive number with optional K/M suffix (e.g. 128K, 1M).",
			"valueBlank": "Please enter a value first.",
			"presets": "Presets",
			"save": "Save Changes",
			"saving": "Saving…",
			"saved": "Saved successfully.",
			"clear": "Restore Default",
			"cleared": "Custom value cleared; provider default restored.",
			"noModels": "This provider has no configurable models.",
			"modelMissing": "This model is not in the selected provider's model list.",
			"conflict": "Settings were modified elsewhere. Please refresh and try again.",
			"loadFailed": "Failed to load providers",
			"readOnly": "Settings document is in read-only mode.",
			"retry": "Retry",
			"loading": "Loading configuration…",
			"emptyProviders": "No configured providers. Add a provider on the Models page first.",
			"overrides": "Customized Models",
			"overridesEmpty": "No custom context lengths configured. All models use provider defaults.",
			"edit": "Edit",
			"selectModelHint": "Select a provider and model above to configure",
			"effortLabel": "Reasoning Effort",
			"effortStateUnset": "Provider default",
			"effortStateDisabled": "No reasoning (non-reasoning)",
			"effortStateImageVideo": "This model does not support reasoning effort",
			"effortOff": "Off",
			"effortMinimal": "Minimal",
			"effortLow": "Low",
			"effortMedium": "Medium",
			"effortHigh": "High",
			"effortXhigh": "Xhigh",
			"effortMax": "Max",
			"effortEmpty": "Select at least one level",
			"effortCompatAdded": "Provider inference switch (compat) filled in automatically",
			"effortNotSupported": "This model cannot configure reasoning effort",
			"effortBadge": "{n} levels",
			"effortPick": "Select reasoning levels",
			"effortPicked": "{n} levels selected",
			"effortConfigured": "{n} levels · click to change",
			"effortOffHint": "disable reasoning",
			"effortHint": "Multiple levels allowed; applies after Save",
			"searchPlaceholder": "Search options...",
			"noMatches": "No matches"
		};

		// ── helpers ──
		/** Accepted capacity spellings: a decimal count with an optional K/M suffix. */
		const CAPACITY_PATTERN = /^(\d+(?:\.\d+)?)([km])?$/i;
		/** Decimal suffix scales — `1M` is 1000K, matching how model capacities are quoted. */
		const CAPACITY_SCALE = { k: 1e3, m: 1e6 };

		const PRESET_CAPACITIES = ["32K", "64K", "128K", "200K", "256K", "512K", "1M", "2M"];

		/**
		 * Read a typed capacity, so a user can write `256K` or `1M` instead of
		 * counting zeroes. The stored value stays a plain token count.
		 * @param {string} text - raw field text.
		 * @returns {number | undefined | typeof NaN} the count; `undefined` when blank,
		 *   `NaN` when unreadable.
		 */
		function parseCapacity(text) {
			const trimmed = text.trim();
			if (trimmed.length === 0) return void 0;
			const match = CAPACITY_PATTERN.exec(trimmed);
			if (match === null) return NaN;
			const suffix = match[2]?.toLowerCase();
			const scale = suffix === "k" || suffix === "m" ? CAPACITY_SCALE[suffix] : 1;
			const scaled = Number(match[1]) * scale;
			const rounded = Math.round(scaled);
			return Math.abs(scaled - rounded) < 1e-6 ? rounded : scaled;
		}

		/**
		 * Spell a stored count back in the shortest form that survives a round trip
		 * through {@link parseCapacity}.
		 * @param {number} value - stored capacity.
		 * @returns {string} the field text.
		 */
		function formatCapacity(value) {
			if (!Number.isInteger(value) || value <= 0) return String(value);
			if (value % CAPACITY_SCALE.m === 0) return `${String(value / CAPACITY_SCALE.m)}M`;
			if (value % CAPACITY_SCALE.k === 0) return `${String(value / CAPACITY_SCALE.k)}K`;
			return String(value);
		}

		/** Format token count with thousand separators. */
		function formatTokens(count) {
			if (typeof count !== "number" || Number.isNaN(count) || count <= 0) return "";
			return count.toLocaleString("en-US") + " tokens";
		}

		/** Human text for a rejected wire call. */
		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}

		/**
		 * Only providers the user actually configured: the settings document
		 * holds their profile at the provider's settings path. Dormant built-in
		 * routes that are merely available (and routes with no settings address,
		 * like the modlens vision adapters) are omitted, so the list stays short.
		 * @param {object[]} providers - raw configurable-provider directory.
		 * @param {Map<string, object>} namespaces - settings namespace views by ns.
		 * @param {object} schema - settings schema operations (getPath).
		 * @returns the configured providers.
		 */
		function configuredProvidersOf(providers, namespaces, schema) {
			return providers.filter((entry) => {
				const ns = namespaces.get(entry.settingsNs);
				if (ns === void 0) return false;
				if (entry.settingsPath.length === 0) return true;
				return schema.getPath(ns.value, entry.settingsPath) !== void 0;
			});
		}

		/**
		 * Resolve the model selection for a provider's model list: keep the
		 * current id when it is still listed, else pick the first model. This
		 * makes the page immediately editable on open and on provider switch.
		 * @param {object[]} models - the selected provider's model rows.
		 * @param {string} currentId - the current model selection.
		 * @returns the model id to select.
		 */
		function resolveModelId(models, currentId) {
			if (models.length === 0) return "";
			return models.some((model) => model.id === currentId) ? currentId : models[0].id;
		}

		// ── reasoning effort (思考强度) helpers ──
		/** The seven effort levels a model can expose, in UI order. */
		const EFFORT_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];

		/** Ids whose models never take reasoning-effort configuration (mirrors the sync-reasoning rules). */
		const IMAGE_VIDEO_RE = /image|imagine|video/i;
		const NON_REASONING_RE = /non-reasoning/i;

		/**
		 * Whether a model id supports reasoning-effort configuration.
		 * @param {string} id - the model id.
		 * @returns {"ok" | "non-reasoning" | "image-video"} the reason when it does not.
		 */
		function effortSupportedFor(id) {
			if (IMAGE_VIDEO_RE.test(id)) return "image-video";
			if (NON_REASONING_RE.test(id)) return "non-reasoning";
			return "ok";
		}

		/**
		 * The current reasoning-effort configuration of one model row.
		 * @param {object} model - one model row from the settings document.
		 * @returns {{ kind: "disabled" | "unset" | "set", levels?: string[] }} the
		 *   stored state; `disabled` = `reasoningEfforts: false`, `unset` =
		 *   absent (follows the provider default), `set` = explicit level map.
		 */
		function reasoningStateOf(model) {
			const efforts = model && model.reasoningEfforts;
			if (efforts === false) return { kind: "disabled" };
			if (typeof efforts === "object" && efforts !== null && !Array.isArray(efforts)) {
				return { kind: "set", levels: Object.keys(efforts) };
			}
			return { kind: "unset" };
		}

		/**
		 * Build the persisted `reasoningEfforts` value from a level set, with the
		 * same semantics as sync-reasoning.js: every level maps to itself while
		 * `off` maps to `null` (YAML `off:`).
		 * @param {string[]} levels - the levels to keep, in any order.
		 * @returns {Record<string, string | null>} the object to store on the model.
		 */
		function effortsObjectFor(levels) {
			const object = {};
			for (const level of EFFORT_LEVELS) {
				if (!levels.includes(level)) continue;
				object[level] = level === "off" ? null : level;
			}
			return object;
		}

		/**
		 * Reasoning-switch keys an openai-completions provider profile is missing
		 * (mirrors sync-reasoning.js `ensureCompat`): without them the effort list
		 * is only visible in the UI and the request never sends `reasoning_effort`.
		 * @param {object | undefined} profile - the provider profile (effective value).
		 * @returns {string[]} missing keys among `thinkingFormat` / `supportsReasoningEffort`.
		 */
		function missingCompatKeys(profile) {
			if (!profile || typeof profile !== "object" || profile.api !== "openai-completions") return [];
			const compat = profile.compat && typeof profile.compat === "object" && !Array.isArray(profile.compat)
				? profile.compat
				: {};
			const missing = [];
			if (compat.thinkingFormat === void 0) missing.push("thinkingFormat");
			if (compat.supportsReasoningEffort === void 0) missing.push("supportsReasoningEffort");
			return missing;
		}

		/** The provider compat object with the inference switch filled in (existing keys kept). */
		function compatWith(profile) {
			const base = profile && typeof profile.compat === "object" && !Array.isArray(profile.compat)
				? { ...profile.compat }
				: {};
			return { ...base, thinkingFormat: "openai", supportsReasoningEffort: true };
		}

		// ── custom frosted select component ──
		function FrostedSelect(props) {
			const {
				value,
				onChange,
				options,
				placeholder,
				disabled = false,
				ariaLabel,
				searchable = false,
				searchPlaceholder = "搜索...",
				noMatchesText = "无匹配项"
			} = props;
			const [open, setOpen] = react.useState(false);
			const [search, setSearch] = react.useState("");

			const selectedOption = options.find((opt) => opt.value === value);

			const filtered = react.useMemo(() => {
				if (!searchable || !search.trim()) return options;
				const q = search.trim().toLowerCase();
				return options.filter((opt) => (
					opt.label.toLowerCase().includes(q) ||
					(opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
					opt.value.toLowerCase().includes(q)
				));
			}, [options, search, searchable]);

			return react_jsx_runtime.jsxs("div", {
				className: "dcl-select-wrapper",
				children: [
					react_jsx_runtime.jsxs("button", {
						type: "button",
						className: `dcl-select-trigger ${open ? "is-open" : ""}`,
						disabled,
						"aria-label": ariaLabel,
						"aria-expanded": open ? "true" : "false",
						onClick: () => {
							if (!disabled) {
								setOpen((prev) => !prev);
								setSearch("");
							}
						},
						children: [
							react_jsx_runtime.jsx("span", {
								className: "dcl-select-value-text",
								children: selectedOption ? selectedOption.label : (placeholder || "")
							}),
							react_jsx_runtime.jsx("span", {
								className: `dcl-select-arrow ${open ? "is-open" : ""}`,
								children: "▾"
							})
						]
					}),
					open ? react_jsx_runtime.jsx("div", {
						className: "dcl-dropdown-backdrop",
						onClick: () => { setOpen(false); }
					}) : null,
					open ? react_jsx_runtime.jsxs("div", {
						className: "dcl-dropdown-pop",
						role: "listbox",
						"aria-label": ariaLabel,
						children: [
							searchable && options.length > 5 ? react_jsx_runtime.jsx("div", {
								className: "dcl-dropdown-search-wrap",
								children: react_jsx_runtime.jsx("input", {
									type: "text",
									className: "dcl-dropdown-search",
									value: search,
									placeholder: searchPlaceholder,
									autoFocus: true,
									onChange: (event) => { setSearch(event.target.value); },
									onClick: (event) => { event.stopPropagation(); }
								})
							}) : null,
							react_jsx_runtime.jsx("div", {
								className: "dcl-dropdown-options-list",
								children: filtered.length === 0 ? react_jsx_runtime.jsx("div", {
									className: "dcl-dropdown-empty",
									children: noMatchesText
								}) : filtered.map((opt) => {
									const isSelected = opt.value === value;
									return react_jsx_runtime.jsxs("div", {
										className: `dcl-dropdown-option ${isSelected ? "is-selected" : ""}`,
										role: "option",
										"aria-selected": isSelected ? "true" : "false",
										onClick: () => {
											onChange(opt.value);
											setOpen(false);
											setSearch("");
										},
										children: [
											react_jsx_runtime.jsxs("div", {
												className: "dcl-option-content",
												children: [
													react_jsx_runtime.jsx("span", {
														className: "dcl-option-label",
														children: opt.label
													}),
													opt.sublabel ? react_jsx_runtime.jsx("span", {
														className: "dcl-option-sublabel",
														children: opt.sublabel
													}) : null
												]
											}),
											isSelected ? react_jsx_runtime.jsx("span", {
												className: "dcl-option-check",
												children: "✓"
											}) : null
										]
									}, opt.value);
								})
							})
						]
					}) : null
				]
			});
		}

		// ── the section page ──
		/**
		 * 「上下文长度」settings page: pick a provider (渠道), pick one of its
		 * models, type a context-window length, and save. Nothing is written
		 * until Save; after the `settings.mutate` settles the mirror folds the
		 * answer in and the page reloads.
		 * @param {object} props - composed slot props (inject face + owner props).
		 * @returns the section tree.
		 */
		function ContextLengthSection(props) {
			const { api, schema, describe, t } = props;
			const [phase, setPhase] = react.useState("idle");
			const [error, setError] = react.useState("");
			const [providers, setProviders] = react.useState([]);
			const [namespaces, setNamespaces] = react.useState(null);
			const [writable, setWritable] = react.useState(false);
			const [providerId, setProviderId] = react.useState("");
			const [modelId, setModelId] = react.useState("");
			const [text, setText] = react.useState("");
			/** null = 未修改；string[] = 勾选中的档位草稿（保存时才写入）。 */
			const [effortDraft, setEffortDraft] = react.useState(null);
			/** 思考强度选择面板是否展开。 */
			const [effortOpen, setEffortOpen] = react.useState(false);
			const [saving, setSaving] = react.useState(false);
			const [saved, setSaved] = react.useState(false);
			const [savedMessage, setSavedMessage] = react.useState("");
			const [saveError, setSaveError] = react.useState("");

			const load = react.useCallback(async () => {
				setPhase("loading");
				setError("");
				try {
					const [providersResponse] = await Promise.all([
						api.llm.providers({}),
						describe.ensure()
					]);
					if (!providersResponse.result.ok) {
						throw new Error(providersResponse.result.error.message);
					}
					const mirrored = describe.getSnapshot();
					if (mirrored.view === void 0) {
						throw new Error(mirrored.error ?? "settings unavailable");
					}
					const list = providersResponse.result.value.providers
						.filter((entry) => entry.settingsNs !== "");
					setProviders(list);
					setNamespaces(new Map(mirrored.view.namespaces.map((view) => [view.ns, view])));
					setWritable(mirrored.view.writable);
					setPhase("ready");
					return list;
				} catch (err) {
					setError(messageOf(err));
					setPhase("error");
					return [];
				}
			}, [api, describe]);

			react.useEffect(() => {
				void load().catch(() => {});
			}, [load]);

			/**
			 * Only providers the user actually configured (see
			 * {@link configuredProvidersOf}).
			 */
			const configuredProviders = react.useMemo(
				() => configuredProvidersOf(providers, namespaces === null ? new Map() : namespaces, schema),
				[providers, namespaces, schema]
			);

			/** Keep the selection on a still-configured provider, else pick the first one. */
			react.useEffect(() => {
				if (configuredProviders.length === 0) {
					setProviderId("");
					return;
				}
				if (configuredProviders.some((entry) => entry.provider === providerId)) return;
				setProviderId(configuredProviders[0].provider);
			}, [configuredProviders, providerId]);

			const selectedProvider = configuredProviders.find((entry) => entry.provider === providerId) ?? void 0;
			const namespace = selectedProvider === void 0 || namespaces === null
				? void 0
				: namespaces.get(selectedProvider.settingsNs);

			/** Models for the selected provider, read from the settings document. */
			const models = react.useMemo(() => {
				if (selectedProvider === void 0 || namespace === void 0) return [];
				const value = schema.getPath(namespace.value, [...selectedProvider.settingsPath, "models"]);
				if (!Array.isArray(value)) return [];
				return value.filter((model) => typeof model === "object" && model !== null && !Array.isArray(model));
			}, [selectedProvider, namespace, schema]);

			/** Keep the model selection on a still-listed model, else pick the first one. */
			react.useEffect(() => {
				setModelId(resolveModelId(models, modelId));
			}, [models, modelId]);

			const selectedModel = models.find((model) => model.id === modelId) ?? void 0;
			const currentContext = typeof selectedModel?.contextWindow === "number"
				? selectedModel.contextWindow
				: void 0;
			/** 当前模型是否可配置思考强度（non-reasoning / image-video 不可配置）。 */
			const effortSupport = selectedModel === void 0 ? "none" : effortSupportedFor(selectedModel.id);
			const reasoningState = selectedModel === void 0 ? { kind: "unset" } : reasoningStateOf(selectedModel);
			const currentLevels = reasoningState.kind === "set" ? reasoningState.levels : [];

			const trimmed = text.trim();
			const parsed = parseCapacity(text);
			const valueBlank = trimmed.length === 0;
			const valueInvalid = !valueBlank && (Number.isNaN(parsed) || (typeof parsed === "number" && parsed <= 0));
			const contextDraftReady = !valueBlank && !valueInvalid && typeof parsed === "number";
			/** 档位草稿与当前配置是否不同（集合比较，顺序无关）。 */
			const effortDraftChanged = effortDraft !== null && effortDraft.length > 0
				&& !(effortDraft.length === currentLevels.length && effortDraft.every((level) => currentLevels.includes(level)));
			const effortDraftEmpty = effortDraft !== null && effortDraft.length === 0;
			const canSave = phase === "ready" && writable
				&& selectedProvider !== void 0 && selectedModel !== void 0
				&& (contextDraftReady || effortDraftChanged)
				&& !effortDraftEmpty
				&& !saving;

			const pickProvider = (id) => {
				setProviderId(id);
				setModelId("");
				setText("");
				setEffortDraft(null);
				setEffortOpen(false);
				setSaved(false);
				setSavedMessage("");
				setSaveError("");
			};
			const pickModel = (id) => {
				setModelId(id);
				setText("");
				setEffortDraft(null);
				setEffortOpen(false);
				setSaved(false);
				setSavedMessage("");
				setSaveError("");
			};

			/**
			 * All models across all configured providers that carry a custom
			 * contextWindow or reasoningEfforts.
			 */
			const allOverridden = react.useMemo(() => {
				if (configuredProviders.length === 0 || namespaces === null) return [];
				const list = [];
				for (const p of configuredProviders) {
					const ns = namespaces.get(p.settingsNs);
					if (!ns) continue;
					const pModels = schema.getPath(ns.value, [...p.settingsPath, "models"]);
					if (Array.isArray(pModels)) {
						for (const m of pModels) {
							if (typeof m !== "object" || m === null || Array.isArray(m)) continue;
							if (typeof m.contextWindow !== "number" && m.reasoningEfforts === void 0) continue;
							const state = reasoningStateOf(m);
							list.push({
								provider: p.provider,
								providerDisplayName: p.displayName || p.provider,
								modelId: m.id,
								modelName: m.name,
								contextWindow: typeof m.contextWindow === "number" ? m.contextWindow : void 0,
								effortLevels: state.kind === "set" ? state.levels : (state.kind === "disabled" ? false : void 0)
							});
						}
					}
				}
				return list;
			}, [configuredProviders, namespaces, schema]);

			/**
			 * 通用提交：对目标模型应用 {@link transform}，可携带渠道级 ops
			 * （如 compat 补全）。复用原有 settings.mutate + expectedRevision
			 * + 冲突处理链路。
			 */
			const commitModels = async (targetProviderId, targetModelId, transform, extraOps = []) => {
				const prov = configuredProviders.find((p) => p.provider === targetProviderId);
				if (!prov || namespaces === null) return;
				const ns = namespaces.get(prov.settingsNs);
				if (!ns) return;

				const stored = schema.getPath(ns.user, [...prov.settingsPath, "models"]);
				const eff = schema.getPath(ns.value, [...prov.settingsPath, "models"]);
				const base = Array.isArray(stored) ? stored : (Array.isArray(eff) ? eff : []);
				if (!Array.isArray(base) || base.length === 0) throw new Error(t("noModels"));
				if (!base.some((m) => m.id === targetModelId)) throw new Error(t("modelMissing"));

				const next = base.map((m) => (m.id === targetModelId ? transform(m) : m));
				const ops = [{ op: "set", path: [...prov.settingsPath, "models"], value: next }, ...extraOps];

				const response = await api.settings.mutate({
					ns: ns.ns,
					ops,
					expectedRevision: ns.revision
				});
				if (!response.result.ok) {
					throw new Error(response.result.error.code === "settings-conflict"
						? t("conflict")
						: response.result.error.message);
				}
				describe.acceptView(response.result.value);
			};

			/** 移除模型上的 contextWindow 与 reasoningEfforts 两个覆盖（恢复默认）。 */
			const withoutModelCustom = (m) => {
				let out = m;
				if ("contextWindow" in out) {
					const copy = { ...out };
					delete copy.contextWindow;
					out = copy;
				}
				if ("reasoningEfforts" in out) {
					const copy = { ...out };
					delete copy.reasoningEfforts;
					out = copy;
				}
				return out;
			};

			const save = async () => {
				if (!canSave) return;
				setSaving(true);
				setSaveError("");
				setSaved(false);
				setSavedMessage("");
				try {
					const profile = schema.getPath(namespace.value, [...selectedProvider.settingsPath]);
					const missingCompat = missingCompatKeys(profile);
					const extraOps = missingCompat.length > 0
						? [{ op: "set", path: [...selectedProvider.settingsPath, "compat"], value: compatWith(profile) }]
						: [];
					await commitModels(providerId, modelId, (m) => {
						let out = m;
						if (contextDraftReady) out = { ...out, contextWindow: parsed };
						if (effortDraft !== null && effortDraft.length > 0) {
							out = { ...out, reasoningEfforts: effortsObjectFor(effortDraft) };
						}
						return out;
					}, extraOps);
					setSaved(true);
					setSavedMessage(missingCompat.length > 0 ? `${t("saved")}；${t("effortCompatAdded")}` : t("saved"));
					setText("");
					setEffortDraft(null);
					setEffortOpen(false);
					await load();
				} catch (err) {
					setSaveError(messageOf(err));
				} finally {
					setSaving(false);
				}
			};

			const clearCurrent = async () => {
				const hasCustom = currentContext !== void 0 || reasoningState.kind !== "unset";
				if (phase !== "ready" || !writable || selectedModel === void 0 || !hasCustom || saving) return;
				setSaving(true);
				setSaveError("");
				setSaved(false);
				setSavedMessage("");
				try {
					await commitModels(providerId, modelId, withoutModelCustom);
					setSaved(true);
					setSavedMessage(t("cleared"));
					setText("");
					setEffortDraft(null);
					await load();
				} catch (err) {
					setSaveError(messageOf(err));
				} finally {
					setSaving(false);
				}
			};

			const clearSpecific = async (targetProvider, targetModel) => {
				if (phase !== "ready" || !writable || saving) return;
				setSaving(true);
				setSaveError("");
				setSaved(false);
				setSavedMessage("");
				try {
					await commitModels(targetProvider, targetModel, withoutModelCustom);
					setSaved(true);
					setSavedMessage(t("cleared"));
					await load();
				} catch (err) {
					setSaveError(messageOf(err));
				} finally {
					setSaving(false);
				}
			};

			// 渠道选项格式化
			const providerOptions = react.useMemo(() => (
				configuredProviders.map((entry) => ({
					value: entry.provider,
					label: entry.displayName || entry.provider
				}))
			), [configuredProviders]);

			// 模型选项格式化
			const modelOptions = react.useMemo(() => (
				models.map((model) => ({
					value: model.id,
					label: model.name ? `${model.id} (${model.name})` : model.id,
					sublabel: model.name ? model.id : void 0
				}))
			), [models]);

			if (phase === "loading" || phase === "idle") {
				return react_jsx_runtime.jsxs("div", {
					className: "dcl-section",
					"aria-busy": "true",
					children: [
						react_jsx_runtime.jsxs("div", {
							className: "dcl-header",
							children: [
								react_jsx_runtime.jsx("h2", { className: "dcl-title", children: t("title") }),
								react_jsx_runtime.jsx("p", { className: "dcl-intro", children: t("loading") })
							]
						})
					]
				});
			}

			if (phase === "error") {
				return react_jsx_runtime.jsxs("div", {
					className: "dcl-section",
					children: [
						react_jsx_runtime.jsxs("div", {
							className: "dcl-header",
							children: [
								react_jsx_runtime.jsx("h2", { className: "dcl-title", children: t("title") }),
								react_jsx_runtime.jsxs("p", { className: "dcl-intro", children: [t("loadFailed"), ": ", error] })
							]
						}),
						react_jsx_runtime.jsx("div", {
							className: "dcl-actions",
							children: react_jsx_runtime.jsx("button", {
								type: "button",
								className: "dcl-btn dcl-btnSecondary",
								onClick: () => { void load(); },
								children: t("retry")
							})
						})
					]
				});
			}

			return react_jsx_runtime.jsxs("div", {
				className: "dcl-section",
				children: [
					react_jsx_runtime.jsxs("div", {
						className: "dcl-header",
						children: [
							react_jsx_runtime.jsx("h2", { className: "dcl-title", children: t("title") }),
							react_jsx_runtime.jsx("p", { className: "dcl-intro", children: t("intro") })
						]
					}),

					!writable ? react_jsx_runtime.jsx("div", {
						className: "dcl-alert dcl-alert-warn",
						children: t("readOnly")
					}) : null,

					react_jsx_runtime.jsxs("div", {
						className: "dcl-card",
						children: [
							react_jsx_runtime.jsxs("div", {
								className: "dcl-grid-2",
								children: [
									react_jsx_runtime.jsxs("div", {
										className: "dcl-field",
										children: [
											react_jsx_runtime.jsx("label", {
												className: "dcl-field-label",
												children: t("provider")
											}),
											react_jsx_runtime.jsx(FrostedSelect, {
												value: providerId,
												onChange: pickProvider,
												options: providerOptions,
												placeholder: t("providerPlaceholder"),
												disabled: !writable || configuredProviders.length === 0,
												ariaLabel: t("provider"),
												searchable: true,
												searchPlaceholder: t("searchPlaceholder"),
												noMatchesText: t("noMatches")
											})
										]
									}),
									react_jsx_runtime.jsxs("div", {
										className: "dcl-field",
										children: [
											react_jsx_runtime.jsx("label", {
												className: "dcl-field-label",
												children: t("model")
											}),
											react_jsx_runtime.jsx(FrostedSelect, {
												value: modelId,
												onChange: pickModel,
												options: modelOptions,
												placeholder: t("modelPlaceholder"),
												disabled: !writable || selectedProvider === void 0 || models.length === 0,
												ariaLabel: t("model"),
												searchable: true,
												searchPlaceholder: t("searchPlaceholder"),
												noMatchesText: t("noMatches")
											})
										]
									})
								]
							}),

							configuredProviders.length === 0 ? react_jsx_runtime.jsx("div", {
								className: "dcl-alert dcl-alert-warn",
								children: t("emptyProviders")
							}) : null,

							models.length === 0 && selectedProvider !== void 0 ? react_jsx_runtime.jsx("div", {
								className: "dcl-alert dcl-alert-warn",
								children: t("noModels")
							}) : null,

							selectedModel !== void 0 ? react_jsx_runtime.jsxs("div", {
								className: "dcl-status-banner",
								children: [
									react_jsx_runtime.jsxs("div", {
										className: "dcl-status-info",
										children: [
											react_jsx_runtime.jsx("span", { children: t("currentStatus") + ":" }),
											react_jsx_runtime.jsx("span", {
												style: { fontFamily: "var(--ds-font-family-code, monospace)", fontWeight: "500" },
												children: selectedModel.id
											})
										]
									}),
									currentContext !== void 0 ? react_jsx_runtime.jsxs("span", {
										className: "dcl-status-badge is-custom",
										children: [t("currentCustom", { val: formatCapacity(currentContext) }), " (", formatTokens(currentContext), ")"]
									}) : react_jsx_runtime.jsx("span", {
										className: "dcl-status-badge is-default",
										children: t("currentUnset")
									})
								]
							}) : null,

							react_jsx_runtime.jsxs("div", {
								className: "dcl-field",
								children: [
									react_jsx_runtime.jsx("label", {
										className: "dcl-field-label",
										children: t("newValue")
									}),
									react_jsx_runtime.jsx("input", {
										className: "dcl-input",
										type: "text",
										value: text,
										placeholder: t("valuePlaceholder"),
										"aria-label": t("newValue"),
										disabled: !writable || selectedModel === void 0,
										"aria-invalid": valueInvalid ? "true" : void 0,
										onChange: (event) => {
											setText(event.target.value);
											setSaved(false);
											setSavedMessage("");
											setSaveError("");
										},
										onKeyDown: (event) => { if (event.key === "Enter" && canSave) void save(); }
									}),

									!valueBlank && !valueInvalid && typeof parsed === "number" ? react_jsx_runtime.jsxs("div", {
										className: "dcl-preview-text",
										children: [
											"≈ ",
											formatTokens(parsed),
											formatCapacity(parsed) !== text.trim().toUpperCase() ? ` (${formatCapacity(parsed)})` : ""
										]
									}) : null,

									react_jsx_runtime.jsxs("div", {
										className: "dcl-presets-row",
										children: [
											react_jsx_runtime.jsx("span", { className: "dcl-presets-label", children: t("presets") + ":" }),
											PRESET_CAPACITIES.map((cap) => {
												const capVal = parseCapacity(cap);
												const isActive = typeof parsed === "number" && parsed === capVal;
												return react_jsx_runtime.jsx("button", {
													type: "button",
													className: `dcl-preset-tag ${isActive ? "is-active" : ""}`,
													disabled: !writable || selectedModel === void 0,
													onClick: () => {
														setText(cap);
														setSaved(false);
														setSavedMessage("");
														setSaveError("");
													},
													children: cap
												}, cap);
											})
										]
									}),

									valueInvalid ? react_jsx_runtime.jsx("div", { className: "dcl-alert dcl-alert-error", style: { marginTop: "4px" }, children: t("valueInvalid") }) : null
								]
							}),

							selectedModel !== void 0 ? react_jsx_runtime.jsxs("div", {
								className: "dcl-field",
								style: { borderTop: "1px solid var(--dsw-alias-border-l1)", paddingTop: "14px" },
								children: [
									react_jsx_runtime.jsx("label", { className: "dcl-field-label", children: t("effortLabel") }),
									effortSupport === "ok" && reasoningState.kind === "set" ? react_jsx_runtime.jsxs("div", {
										className: "dcl-effort-current",
										children: [
											react_jsx_runtime.jsx("span", { children: t("currentStatus") + ":" }),
											EFFORT_LEVELS.filter((level) => currentLevels.includes(level)).map((level) => react_jsx_runtime.jsx("span", {
												className: "dcl-level-tag",
												children: t("effort" + level[0].toUpperCase() + level.slice(1))
											}, level))
										]
									}) : effortSupport === "ok" && reasoningState.kind === "unset" ? react_jsx_runtime.jsx("div", {
										className: "dcl-effort-current",
										children: [react_jsx_runtime.jsx("span", { children: t("currentStatus") + ": " }), react_jsx_runtime.jsx("span", { children: t("effortStateUnset") })]
									}) : effortSupport === "ok" && reasoningState.kind === "disabled" ? react_jsx_runtime.jsx("div", {
										className: "dcl-alert dcl-alert-warn",
										children: t("effortStateDisabled")
									}) : react_jsx_runtime.jsx("div", {
										className: "dcl-alert dcl-alert-warn",
										children: effortSupport === "non-reasoning" ? t("effortStateDisabled") : t("effortNotSupported")
									}),
									effortSupport === "ok" && reasoningState.kind !== "disabled" ? react_jsx_runtime.jsxs("div", {
										className: "dcl-effort-picker",
										children: [
											react_jsx_runtime.jsxs("button", {
												type: "button",
												className: `dcl-input dcl-effort-trigger ${effortOpen ? "is-open" : ""}`,
												"aria-haspopup": "listbox",
												"aria-expanded": effortOpen ? "true" : "false",
												disabled: !writable || saving,
												onClick: () => { setEffortOpen((prev) => !prev); },
												children: [
													react_jsx_runtime.jsx("span", {
														children: effortDraft !== null
															? t("effortPicked", { n: effortDraft.length })
															: (reasoningState.kind === "set" ? t("effortConfigured", { n: currentLevels.length }) : t("effortPick"))
													}),
													react_jsx_runtime.jsx("span", { className: `dcl-effort-caret ${effortOpen ? "is-open" : ""}`, children: "▾" })
												]
											}),
											effortOpen ? react_jsx_runtime.jsxs("div", {
												className: "dcl-effort-pop",
												role: "listbox",
												"aria-label": t("effortLabel"),
												children: [
													EFFORT_LEVELS.map((level) => {
														const active = effortDraft === null ? currentLevels.includes(level) : effortDraft.includes(level);
														return react_jsx_runtime.jsxs("label", {
															className: "dcl-effort-option",
															children: [
																react_jsx_runtime.jsx("input", {
																	type: "checkbox",
																	checked: active,
																	onChange: () => {
																		setEffortDraft((prev) => {
																			const base = prev === null ? currentLevels.slice() : prev.slice();
																			return base.includes(level)
																				? base.filter((item) => item !== level)
																				: EFFORT_LEVELS.filter((item) => base.includes(item) || item === level);
																		});
																		setSaved(false);
																		setSavedMessage("");
																		setSaveError("");
																	}
																}),
																react_jsx_runtime.jsxs("span", {
																	className: "dcl-effort-option-name",
																	children: [t("effort" + level[0].toUpperCase() + level.slice(1)), level === "off" ? react_jsx_runtime.jsx("span", { className: "dcl-effort-option-hint", children: t("effortOffHint") }) : null]
																})
															]
														}, level);
													}),
													react_jsx_runtime.jsx("div", { className: "dcl-effort-pop-hint", children: t("effortHint") })
												]
											}) : null,
											effortOpen ? react_jsx_runtime.jsx("div", {
												className: "dcl-effort-backdrop",
												onClick: () => { setEffortOpen(false); }
											}) : null
										]
									}) : null,
									effortDraftEmpty ? react_jsx_runtime.jsx("div", { className: "dcl-alert dcl-alert-error", style: { marginTop: "4px" }, children: t("effortEmpty") }) : null
								]
							}) : null,

							saved ? react_jsx_runtime.jsx("div", { className: "dcl-alert dcl-alert-success", children: savedMessage }) : null,
							saveError !== "" ? react_jsx_runtime.jsx("div", { className: "dcl-alert dcl-alert-error", children: saveError }) : null,

							react_jsx_runtime.jsxs("div", {
								className: "dcl-actions",
								children: [
									(currentContext !== void 0 || reasoningState.kind !== "unset") ? react_jsx_runtime.jsx("button", {
										type: "button",
										className: "dcl-btn dcl-btnDanger",
										disabled: !writable || saving,
										onClick: () => { void clearCurrent(); },
										children: t("clear")
									}) : react_jsx_runtime.jsx("div", {}),
									react_jsx_runtime.jsxs("div", {
										className: "dcl-btn-group-right",
										children: [
											react_jsx_runtime.jsx("button", {
												type: "button",
												className: "dcl-btn dcl-btnPrimary",
												disabled: !canSave,
												onClick: () => { void save(); },
												children: saving ? t("saving") : t("save")
											})
										]
									})
								]
							})
						]
					}),

					react_jsx_runtime.jsxs("div", {
						className: "dcl-list-section",
						children: [
							react_jsx_runtime.jsxs("div", {
								className: "dcl-list-header",
								children: [
									react_jsx_runtime.jsxs("div", {
										className: "dcl-list-title",
										children: [
											t("overrides"),
											allOverridden.length > 0 ? react_jsx_runtime.jsx("span", {
												className: "dcl-count-pill",
												children: allOverridden.length
											}) : null
										]
									})
								]
							}),

							allOverridden.length === 0 ? react_jsx_runtime.jsx("div", {
								className: "dcl-empty-state",
								children: t("overridesEmpty")
							}) : react_jsx_runtime.jsx("div", {
								className: "dcl-table-wrap",
								children: react_jsx_runtime.jsx("ul", {
									className: "dcl-list-items",
									children: allOverridden.map((item) => react_jsx_runtime.jsxs("li", {
										className: "dcl-list-item",
										children: [
											react_jsx_runtime.jsxs("div", {
												className: "dcl-item-meta",
												children: [
													react_jsx_runtime.jsx("span", {
														className: "dcl-provider-badge",
														children: item.providerDisplayName
													}),
													react_jsx_runtime.jsxs("div", {
														className: "dcl-model-info",
														children: [
															react_jsx_runtime.jsx("span", {
																className: "dcl-model-id",
																children: item.modelId
															}),
															item.modelName ? react_jsx_runtime.jsx("span", {
																className: "dcl-model-name",
																children: item.modelName
															}) : null
														]
													})
												]
											}),
											react_jsx_runtime.jsxs("div", {
												className: "dcl-item-val",
												children: [
													item.contextWindow !== void 0 ? react_jsx_runtime.jsxs("span", {
														className: "dcl-val-badge",
														children: [formatCapacity(item.contextWindow), " (", formatTokens(item.contextWindow), ")"]
													}) : null,
													item.effortLevels !== void 0 ? react_jsx_runtime.jsx("span", {
														className: "dcl-val-badge",
														style: { background: "rgba(139,92,246,.1)", color: "var(--dsw-alias-brand-primary)" },
														children: item.effortLevels === false ? t("effortStateDisabled") : t("effortBadge", { n: item.effortLevels.length })
													}) : null,
													react_jsx_runtime.jsxs("div", {
														className: "dcl-item-actions",
														children: [
															react_jsx_runtime.jsx("button", {
																type: "button",
																className: "dcl-btn dcl-btnSecondary dcl-btn-sm",
																onClick: () => {
																	pickProvider(item.provider);
																	pickModel(item.modelId);
																},
																children: t("edit")
															}),
															react_jsx_runtime.jsx("button", {
																type: "button",
																className: "dcl-btn dcl-btnDanger dcl-btn-sm",
																disabled: !writable || saving,
																onClick: () => {
																	void clearSpecific(item.provider, item.modelId);
																},
																children: t("clear")
															})
														]
													})
												]
											})
										]
									}, `${item.provider}-${item.modelId}`))
								})
							})
						]
					})
				]
			});
		}

		// ── cordis plugin entry ──
		const inject = ["slots", "locale", "connection", "settingsScope", "settingsSchema"];

		/**
		 * Register the page into the settings panel below 「模型」.
		 * @param {import("@deepseek-ai/cordis").Context} ctx - client root context.
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-context-length: dictionaries");
			const connection = ctx.get("connection");
			const describe = ctx.settingsScope.describe();
			const schema = ctx.settingsSchema;
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "context-length",
				order: 11,
				label: () => t("nav"),
				inject: () => ({
					api: connection.api,
					schema,
					describe,
					t
				})
			}, ContextLengthSection));
		}

		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		exports.configuredProvidersOf = configuredProvidersOf;
		exports.resolveModelId = resolveModelId;
		exports.EFFORT_LEVELS = EFFORT_LEVELS;
		exports.effortSupportedFor = effortSupportedFor;
		exports.reasoningStateOf = reasoningStateOf;
		exports.effortsObjectFor = effortsObjectFor;
		exports.missingCompatKeys = missingCompatKeys;
		exports.compatWith = compatWith;
		return module.exports;
	}
});
