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
				".dcl-section{box-sizing:border-box;width:100%;max-width:760px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:16px}",
				".dcl-header{display:flex;flex-direction:column;gap:4px}",
				".dcl-title{color:var(--dsw-alias-label-primary);margin:0;font-size:18px;font-weight:600;line-height:26px}",
				".dcl-intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px;line-height:20px}",
				".dcl-card{background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:16px}",
				".dcl-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}",
				"@media (max-width:580px){.dcl-grid-2{grid-template-columns:1fr}}",
				".dcl-field{display:flex;flex-direction:column;gap:6px}",
				".dcl-field-label{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;display:flex;align-items:center;justify-content:space-between}",
				".dcl-input,select.dcl-input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;height:36px;font:inherit;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:20px;transition:border-color .15s ease,box-shadow .15s ease}",
				".dcl-input:focus,select.dcl-input:focus{border-color:var(--dsw-alias-brand-primary);outline:none;box-shadow:0 0 0 2px rgba(59,130,246,.15)}",
				".dcl-input::placeholder{color:var(--dsw-alias-label-dimmed)}",
				".dcl-input:disabled,select.dcl-input:disabled{opacity:.55;cursor:not-allowed}",
				"select.dcl-input{cursor:pointer;appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");background-position:right 12px center;background-repeat:no-repeat;background-size:12px 12px;padding-right:32px}",
				".dcl-status-banner{display:flex;align-items:center;justify-content:space-between;background:var(--dsw-alias-bg-layer-1);border:1px dashed var(--dsw-alias-border-l2);border-radius:8px;padding:9px 12px;font-size:12px;line-height:18px}",
				".dcl-status-info{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary)}",
				".dcl-status-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:500;font-family:var(--ds-font-family-code,monospace)}",
				".dcl-status-badge.is-default{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-tertiary)}",
				".dcl-status-badge.is-custom{background:rgba(59,130,246,.12);color:var(--dsw-alias-brand-primary);border:1px solid rgba(59,130,246,.25)}",
				".dcl-presets-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:2px}",
				".dcl-presets-label{font-size:11px;color:var(--dsw-alias-label-tertiary);margin-right:2px}",
				".dcl-preset-tag{font-size:11px;padding:2px 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:pointer;transition:all .15s ease;user-select:none}",
				".dcl-preset-tag:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover-solid)}",
				".dcl-preset-tag:disabled{opacity:.4;cursor:not-allowed}",
				".dcl-preview-text{font-size:12px;color:var(--dsw-alias-label-tertiary);display:flex;align-items:center;gap:4px;font-family:var(--ds-font-family-code,monospace);margin-top:2px}",
				".dcl-alert{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;font-size:12px;line-height:18px}",
				".dcl-alert-success{background:rgba(16,185,129,.1);color:var(--dsw-alias-state-success-primary,#10b981);border:1px solid rgba(16,185,129,.2)}",
				".dcl-alert-error{background:rgba(239,68,68,.1);color:var(--dsw-alias-state-error-primary,#ef4444);border:1px solid rgba(239,68,68,.2)}",
				".dcl-alert-warn{background:rgba(245,158,11,.1);color:var(--dsw-alias-state-warn-label,#f59e0b);border:1px solid rgba(245,158,11,.2)}",
				".dcl-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px}",
				".dcl-btn-group-right{display:flex;align-items:center;gap:8px;margin-left:auto}",
				".dcl-btn{box-sizing:border-box;height:34px;font:inherit;cursor:pointer;border:none;border-radius:8px;justify-content:center;align-items:center;gap:6px;padding:0 14px;font-size:13px;font-weight:500;line-height:20px;display:inline-flex;transition:all .15s ease}",
				".dcl-btnPrimary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground,#fff)}",
				".dcl-btnPrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}",
				".dcl-btnSecondary{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}",
				".dcl-btnSecondary:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid);border-color:var(--dsw-alias-border-l3)}",
				".dcl-btnDanger{border:1px solid transparent;color:var(--dsw-alias-state-error-primary,#ef4444);background:rgba(239,68,68,.08)}",
				".dcl-btnDanger:hover:not(:disabled){background:rgba(239,68,68,.15)}",
				".dcl-btn:disabled{opacity:.45;cursor:not-allowed}",
				".dcl-btn:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-brand-primary);outline:none}",
				".dcl-btn-sm{height:26px;padding:0 8px;font-size:12px;border-radius:6px}",
				".dcl-list-section{display:flex;flex-direction:column;gap:10px;margin-top:8px}",
				".dcl-list-header{display:flex;align-items:center;justify-content:space-between}",
				".dcl-list-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px}",
				".dcl-count-pill{font-size:11px;font-weight:500;padding:1px 6px;border-radius:10px;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary)}",
				".dcl-table-wrap{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-module-platform)}",
				".dcl-list-items{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}",
				".dcl-list-item{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);gap:12px;transition:background .15s ease}",
				".dcl-list-item:last-child{border-bottom:none}",
				".dcl-list-item:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}",
				".dcl-item-meta{display:flex;align-items:center;gap:10px;min-width:0;flex:1}",
				".dcl-provider-badge{font-size:11px;padding:2px 6px;border-radius:4px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);flex-shrink:0}",
				".dcl-model-info{display:flex;flex-direction:column;gap:2px;min-width:0}",
				".dcl-model-id{font-family:var(--ds-font-family-code,monospace);font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".dcl-model-name{font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".dcl-item-val{display:flex;align-items:center;gap:10px;flex-shrink:0}",
				".dcl-val-badge{font-family:var(--ds-font-family-code,monospace);font-size:12px;font-weight:600;color:var(--dsw-alias-brand-primary);background:rgba(59,130,246,.08);padding:3px 8px;border-radius:6px}",
				".dcl-item-actions{display:flex;align-items:center;gap:6px}",
				".dcl-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 16px;border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);font-size:13px;text-align:center;gap:4px}"
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
			"selectModelHint": "请在上方选择渠道与模型进行配置"
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
			"selectModelHint": "Select a provider and model above to configure"
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

		/** A copy of `model` without `contextWindow`. */
		function withoutContext(model) {
			if (!("contextWindow" in model)) return model;
			const copy = { ...model };
			delete copy.contextWindow;
			return copy;
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

			const trimmed = text.trim();
			const parsed = parseCapacity(text);
			const valueBlank = trimmed.length === 0;
			const valueInvalid = !valueBlank && (Number.isNaN(parsed) || (typeof parsed === "number" && parsed <= 0));
			const canSave = phase === "ready" && writable
				&& selectedProvider !== void 0 && selectedModel !== void 0
				&& !valueBlank && !valueInvalid && !saving;

			const pickProvider = (id) => {
				setProviderId(id);
				setModelId("");
				setText("");
				setSaved(false);
				setSavedMessage("");
				setSaveError("");
			};
			const pickModel = (id) => {
				setModelId(id);
				setText("");
				setSaved(false);
				setSavedMessage("");
				setSaveError("");
			};

			/**
			 * All models across all configured providers that currently carry a custom contextWindow.
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
							if (typeof m === "object" && m !== null && typeof m.contextWindow === "number") {
								list.push({
									provider: p.provider,
									providerDisplayName: p.displayName || p.provider,
									modelId: m.id,
									modelName: m.name,
									contextWindow: m.contextWindow
								});
							}
						}
					}
				}
				return list;
			}, [configuredProviders, namespaces, schema]);

			const commitTarget = async (targetProviderId, targetModelId, value) => {
				const prov = configuredProviders.find((p) => p.provider === targetProviderId);
				if (!prov || namespaces === null) return;
				const ns = namespaces.get(prov.settingsNs);
				if (!ns) return;

				const stored = schema.getPath(ns.user, [...prov.settingsPath, "models"]);
				const eff = schema.getPath(ns.value, [...prov.settingsPath, "models"]);
				const base = Array.isArray(stored) ? stored : (Array.isArray(eff) ? eff : []);
				if (!Array.isArray(base) || base.length === 0) throw new Error(t("noModels"));
				if (!base.some((m) => m.id === targetModelId)) throw new Error(t("modelMissing"));

				const next = base.map((m) => {
					if (m.id === targetModelId) {
						return value === void 0 ? withoutContext(m) : { ...m, contextWindow: value };
					}
					return m;
				});

				const response = await api.settings.mutate({
					ns: ns.ns,
					ops: [{ op: "set", path: [...prov.settingsPath, "models"], value: next }],
					expectedRevision: ns.revision
				});
				if (!response.result.ok) {
					throw new Error(response.result.error.code === "settings-conflict"
						? t("conflict")
						: response.result.error.message);
				}
				describe.acceptView(response.result.value);
			};

			const save = async () => {
				if (!canSave) return;
				setSaving(true);
				setSaveError("");
				setSaved(false);
				setSavedMessage("");
				try {
					await commitTarget(providerId, modelId, parsed);
					setSaved(true);
					setSavedMessage(t("saved"));
					setText("");
					await load();
				} catch (err) {
					setSaveError(messageOf(err));
				} finally {
					setSaving(false);
				}
			};

			const clearCurrent = async () => {
				if (phase !== "ready" || !writable || selectedModel === void 0 || currentContext === void 0 || saving) return;
				setSaving(true);
				setSaveError("");
				setSaved(false);
				setSavedMessage("");
				try {
					await commitTarget(providerId, modelId, void 0);
					setSaved(true);
					setSavedMessage(t("cleared"));
					setText("");
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
					await commitTarget(targetProvider, targetModel, void 0);
					setSaved(true);
					setSavedMessage(t("cleared"));
					await load();
				} catch (err) {
					setSaveError(messageOf(err));
				} finally {
					setSaving(false);
				}
			};

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
											react_jsx_runtime.jsx("select", {
												className: "dcl-input",
												value: providerId,
												disabled: !writable || configuredProviders.length === 0,
												"aria-label": t("provider"),
												onChange: (event) => { pickProvider(event.target.value); },
												children: [
													configuredProviders.length === 0 ? react_jsx_runtime.jsx("option", { value: "", children: t("providerPlaceholder") }) : null,
													configuredProviders.map((entry) => react_jsx_runtime.jsx("option", {
														value: entry.provider,
														children: entry.displayName
													}, entry.provider))
												]
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
											react_jsx_runtime.jsx("select", {
												className: "dcl-input",
												value: modelId,
												disabled: !writable || selectedProvider === void 0 || models.length === 0,
												"aria-label": t("model"),
												onChange: (event) => { pickModel(event.target.value); },
												children: [
													models.length === 0 ? react_jsx_runtime.jsx("option", { value: "", children: t("modelPlaceholder") }) : null,
													models.map((model) => react_jsx_runtime.jsx("option", {
														value: model.id,
														children: model.name !== void 0 && model.name !== "" ? `${model.id} (${model.name})` : model.id
													}, model.id))
												]
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
											PRESET_CAPACITIES.map((cap) => react_jsx_runtime.jsx("button", {
												type: "button",
												className: "dcl-preset-tag",
												disabled: !writable || selectedModel === void 0,
												onClick: () => {
													setText(cap);
													setSaved(false);
													setSavedMessage("");
													setSaveError("");
												},
												children: cap
											}, cap))
										]
									}),

									valueInvalid ? react_jsx_runtime.jsx("div", { className: "dcl-alert dcl-alert-error", style: { marginTop: "4px" }, children: t("valueInvalid") }) : null
								]
							}),

							saved ? react_jsx_runtime.jsx("div", { className: "dcl-alert dcl-alert-success", children: savedMessage }) : null,
							saveError !== "" ? react_jsx_runtime.jsx("div", { className: "dcl-alert dcl-alert-error", children: saveError }) : null,

							react_jsx_runtime.jsxs("div", {
								className: "dcl-actions",
								children: [
									currentContext !== void 0 ? react_jsx_runtime.jsx("button", {
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
													react_jsx_runtime.jsxs("span", {
														className: "dcl-val-badge",
														children: [formatCapacity(item.contextWindow), " (", formatTokens(item.contextWindow), ")"]
													}),
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
		return module.exports;
	}
});
