// ../../lovelace-isoplan-card/node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: ee, getPrototypeOf: te } = Object, p = globalThis, ne = p.trustedTypes, re = ne ? ne.emptyScript : "", ie = p.reactiveElementPolyfillSupport, m = (e, t) => e, h = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? re : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, ae = (e, t) => !l(e, t), oe = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: ae
};
Symbol.metadata ??= Symbol("metadata"), p.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var g = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? oe;
	}
	static _$Ei() {
		if (this.hasOwnProperty(m("elementProperties"))) return;
		let e = te(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(m("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(m("properties"))) {
			let e = this.properties, t = [...f(e), ...ee(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? h : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? h : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ae)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[m("elementProperties")] = /* @__PURE__ */ new Map(), g[m("finalized")] = /* @__PURE__ */ new Map(), ie?.({ ReactiveElement: g }), (p.reactiveElementVersions ??= []).push("2.1.2");
// ../../lovelace-isoplan-card/node_modules/lit-html/lit-html.js
var _ = globalThis, se = (e) => e, v = _.trustedTypes, ce = v ? v.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, le = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ue = "?" + y, de = `<${ue}>`, b = document, x = () => b.createComment(""), S = (e) => e === null || typeof e != "object" && typeof e != "function", C = Array.isArray, fe = (e) => C(e) || typeof e?.[Symbol.iterator] == "function", w = "[ 	\n\f\r]", T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pe = /-->/g, me = />/g, E = RegExp(`>|${w}(?:([^\\s"'>=/]+)(${w}*=${w}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), he = /'/g, ge = /"/g, _e = /^(?:script|style|textarea|title)$/i, ve = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), D = ve(1), O = ve(2), k = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), ye = /* @__PURE__ */ new WeakMap(), j = b.createTreeWalker(b, 129);
function be(e, t) {
	if (!C(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ce === void 0 ? t : ce.createHTML(t);
}
var xe = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = T;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === T ? c[1] === "!--" ? o = pe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = E) : (_e.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = E) : o = me : o === E ? c[0] === ">" ? (o = i ?? T, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? E : c[3] === "\"" ? ge : he) : o === ge || o === he ? o = E : o === pe || o === me ? o = T : (o = E, i = void 0);
		let d = o === E && e[t + 1].startsWith("/>") ? " " : "";
		a += o === T ? n + de : l >= 0 ? (r.push(s), n.slice(0, l) + le + n.slice(l) + y + d) : n + y + (l === -2 ? t : d);
	}
	return [be(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, M = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = xe(t, n);
		if (this.el = e.createElement(l, r), j.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = j.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(le)) {
					let t = u[o++], n = i.getAttribute(e).split(y), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ce : r[1] === "?" ? we : r[1] === "@" ? Te : F
					}), i.removeAttribute(e);
				} else e.startsWith(y) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (_e.test(i.tagName)) {
					let e = i.textContent.split(y), t = e.length - 1;
					if (t > 0) {
						i.textContent = v ? v.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], x()), j.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], x());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ue) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(y, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += y.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = b.createElement("template");
		return n.innerHTML = e, n;
	}
};
function N(e, t, n = e, r) {
	if (t === k) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = S(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = N(e, i._$AS(e, t.values), i, r)), t;
}
var Se = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? b).importNode(t, !0);
		j.currentNode = r;
		let i = j.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new P(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ee(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = j.nextNode(), a++);
		}
		return j.currentNode = b, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, P = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = N(this, e, t), S(e) ? e === A || e == null || e === "" ? (this._$AH !== A && this._$AR(), this._$AH = A) : e !== this._$AH && e !== k && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? fe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== A && S(this._$AH) ? this._$AA.nextSibling.data = e : this.T(b.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = M.createElement(be(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Se(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ye.get(e.strings);
		return t === void 0 && ye.set(e.strings, t = new M(e)), t;
	}
	k(t) {
		C(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(x()), this.O(x()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = se(e).nextSibling;
			se(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, F = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = A, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = A;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = N(this, e, t, 0), a = !S(e) || e !== this._$AH && e !== k, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = N(this, r[n + o], t, o), s === k && (s = this._$AH[o]), a ||= !S(s) || s !== this._$AH[o], s === A ? e = A : e !== A && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ce = class extends F {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === A ? void 0 : e;
	}
}, we = class extends F {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== A);
	}
}, Te = class extends F {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = N(this, e, t, 0) ?? A) === k) return;
		let n = this._$AH, r = e === A && n !== A || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== A && (n === A || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ee = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		N(this, e);
	}
}, De = _.litHtmlPolyfillSupport;
De?.(M, P), (_.litHtmlVersions ??= []).push("3.3.3");
var Oe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new P(t.insertBefore(x(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, I = globalThis, L = class extends g {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Oe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return k;
	}
};
L._$litElement$ = !0, L.finalized = !0, I.litElementHydrateSupport?.({ LitElement: L });
var ke = I.litElementPolyfillSupport;
ke?.({ LitElement: L }), (I.litElementVersions ??= []).push("4.2.2");
// src/config.ts
var R = [
	"spot",
	"strip",
	"play",
	"tube",
	"candle",
	"bulb"
], Ae = 3, je = /^[\w-]+$/;
function z(e, t) {
	if (!(Array.isArray(e) && e.length === 2 && e.every((e) => Number.isFinite(e)))) throw Error(`${t} muss ein Punkt [x, y] sein.`);
}
function B(e, t) {
	if (typeof e != "string" || !e.includes(".")) throw Error(`${t}: entity fehlt oder ist ungültig.`);
}
function Me(e, t) {
	let n = `Raum „${t}“, Lampe ${e?.entity ?? "ohne entity"}`;
	if (!e?.entity) throw Error(`${n}: entity fehlt.`);
	if (!R.includes(e.type)) throw Error(`${n}: type muss einer von ${R.join(", ")} sein.`);
	z([e.x, e.y], `${n}: x/y`);
}
function Ne(e, t) {
	let n = `Raum „${t}“, devices`;
	if (B(e?.entity, n), e.x === void 0 != (e.y === void 0)) throw Error(`${n}: x und y gehören zusammen.`);
	e.x !== void 0 && z([e.x, e.y], `${n}: x/y`);
}
function Pe(e, t) {
	if (!e?.id) throw Error("Jeder Raum braucht eine id.");
	if (!je.test(e.id)) throw Error(`Raum-id „${e.id}“: nur Buchstaben, Ziffern, _ und - sind erlaubt.`);
	if (t.has(e.id)) throw Error(`Raum-id „${e.id}“ kommt doppelt vor.`);
	if (t.add(e.id), !e.name) throw Error(`Raum „${e.id}“ braucht einen name.`);
	if (!Array.isArray(e.area) || e.area.length < Ae) throw Error(`Raum „${e.id}“: area braucht mindestens ${Ae} Punkte.`);
	e.area.forEach((t) => z(t, `Raum „${e.id}“, area`)), z(e.label, `Raum „${e.id}“, label`), e.fixtures?.forEach((t) => Me(t, e.id)), e.lights?.forEach((t) => B(t?.entity, `Raum „${e.id}“, lights`)), e.devices?.forEach((t) => Ne(t, e.id));
}
function Fe(e) {
	if (!e?.image) throw Error("image fehlt: Pfad zum Grundriss angeben, z. B. /local/isoplan/wohnung.webp.");
	if (!Array.isArray(e.rooms) || e.rooms.length === 0) throw Error("rooms fehlt: mindestens einen Raum angeben.");
	let t = /* @__PURE__ */ new Set();
	e.rooms.forEach((e) => Pe(e, t));
	let n = e.temperature_range ?? [16, 24];
	z(n, "temperature_range");
	let r = e.coordinates ?? [1536, 1024];
	if (z(r, "coordinates"), r[0] <= 0 || r[1] <= 0) throw Error("coordinates: Breite und Höhe müssen größer als 0 sein.");
	if (e.all_lights !== void 0 && B(e.all_lights, "all_lights"), e.extras?.forEach((e) => B(e?.entity, "extras")), n[0] >= n[1]) throw Error("temperature_range: der erste Wert muss kleiner als der zweite sein.");
	return {
		...e,
		coordinates: r,
		night: e.night ?? "auto",
		sun_entity: e.sun_entity ?? "sun.sun",
		default_mode: e.default_mode ?? "licht",
		temperature_range: n
	};
}
function Ie(e) {
	let t = [
		e.sun_entity,
		e.all_lights,
		...(e.extras ?? []).map((e) => e.entity),
		...e.rooms.flatMap((e) => [
			e.temperature,
			e.climate,
			...(e.lights ?? []).map((e) => e.entity),
			...(e.fixtures ?? []).map((e) => e.entity),
			...(e.devices ?? []).flatMap((e) => [e.entity, e.power])
		])
	];
	return new Set(t.filter((e) => !!e));
}
// src/daylight.ts
var Le = 6;
function Re(e, t) {
	if (e === "on") return 1;
	if (e === "off" || !t) return 0;
	let n = t.attributes.elevation;
	if (typeof n != "number") return +(t.state === "below_horizon");
	let r = (Le - n) / 12, i = Math.min(1, Math.max(0, r));
	return i * i * (3 - 2 * i);
}
// src/fixtures.ts
var ze = {
	spot: O`<ellipse cx="12" cy="12" rx="9" ry="6"/><ellipse class="core" cx="12" cy="12" rx="4.5" ry="2.8"/>`,
	strip: O`<rect x="2" y="10" width="20" height="4" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>`,
	play: O`<rect class="core" x="5" y="4" width="14" height="13" rx="1.5"/><path d="M9 21h6M12 17v4"/>`,
	tube: O`<rect class="core" x="1.5" y="9.5" width="21" height="5" rx="2.5"/>`,
	candle: O`<path class="core" d="M12 3c3 4 4.5 6.5 4.5 9a4.5 4.5 0 0 1-9 0c0-2.500 1.500-5 4.500-9Z"/><path d="M10 19.500h4M10.500 22h3"/>`,
	bulb: O`<circle class="core" cx="12" cy="10" r="6.500"/><path d="M9.500 19.500h5M10.500 22h3"/>`
};
function Be(e) {
	return e.image ? D`<img src=${e.image} alt="" draggable="false" />` : D`<svg viewBox="0 0 24 24" aria-hidden="true">${ze[e.type]}</svg>`;
}
var Ve = {
	spot: "Spot (Hue color spot)",
	strip: "Lichtleiste (Hue Lightstrip)",
	play: "Play-Leuchte (Hue Play)",
	tube: "Lichtröhre (Play gradient tube)",
	candle: "Kerze (Hue color candle)",
	bulb: "Lampe (Hue color lamp)"
}, He = {
	scale: 1,
	x: 0,
	y: 0
}, Ue = 1.18, We = 2.8, Ge = 6, Ke = 24;
function qe(e) {
	let t = e.map(([e]) => e), n = e.map(([, e]) => e), r = Math.min(...t), i = Math.min(...n);
	return {
		x: r,
		y: i,
		width: Math.max(...t) - r,
		height: Math.max(...n) - i
	};
}
function Je(e, [t, n]) {
	let r = !1;
	for (let i = 0, a = e.length - 1; i < e.length; a = i++) {
		let [o, s] = e[i], [c, l] = e[a];
		s > n != l > n && t < (c - o) * (n - s) / (l - s) + o && (r = !r);
	}
	return r;
}
function Ye(e, t) {
	let n = Math.min(We, t.width / (e.width * Ue), t.height / (e.height * Ue)), r = Math.max(1, n);
	return {
		scale: r,
		x: t.x + t.width / 2 - (e.x + e.width / 2) * r,
		y: t.y + t.height / 2 - (e.y + e.height / 2) * r
	};
}
var Xe = (e, t) => ({
	x: (e.width + t.width) / 2 + Ge - Math.abs(e.x - t.x),
	y: (e.height + t.height) / 2 + Ge - Math.abs(e.y - t.y)
});
function V(e, t) {
	let n = e.width / 2, r = e.height / 2;
	return {
		...e,
		x: Math.min(t.width - n, Math.max(n, e.x)),
		y: Math.min(t.height - r, Math.max(r, e.y))
	};
}
function Ze(e, t, n) {
	return t.reduce((e, t) => {
		let r = Xe(e, t);
		if (r.x <= 0 || r.y <= 0) return e;
		let i = r.x < r.y, a = (i ? e.x - t.x : e.y - t.y) >= 0 ? 1 : -1;
		return V({
			...e,
			x: e.x + (i ? r.x * a : 0),
			y: e.y + (i ? 0 : r.y * a)
		}, n);
	}, e);
}
function Qe(e, t, n = []) {
	let r = e.map((e) => V(e, t));
	for (let e = 0; e < Ke; e++) {
		let e = !1;
		for (let n = 0; n < r.length; n++) for (let i = n + 1; i < r.length; i++) {
			let a = Xe(r[n], r[i]);
			if (a.x <= 0 || a.y <= 0) continue;
			e = !0;
			let o = a.x < a.y, s = (o ? a.x : a.y) / 2, c = (o ? r[n].x - r[i].x : r[n].y - r[i].y) >= 0 ? 1 : -1, l = (e, n) => V({
				...e,
				x: e.x + (o ? s * n : 0),
				y: e.y + (o ? 0 : s * n)
			}, t);
			r = r.map((e, t) => t === n ? l(e, c) : t === i ? l(e, -c) : e);
		}
		let i = r.map((e) => Ze(e, n, t));
		if (e ||= i.some((e, t) => e !== r[t]), r = i, !e) break;
	}
	return r;
}
// src/hass.ts
function $e(e) {
	return e.split(".")[0];
}
function H(e) {
	return !e || e.state === "unavailable" || e.state === "unknown";
}
// src/light.ts
var U = [
	255,
	196,
	137
], et = .6, tt = 255, nt = .12, rt = {
	spot: 190,
	strip: 170,
	play: 140,
	tube: 170,
	candle: 130,
	bulb: 170
};
function it(e) {
	let t = e / 100, n = t <= 66 ? 255 : 329.7 * (t - 60) ** -.1332, r = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * (t - 60) ** -.0755, i = t >= 66 ? 255 : t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04, a = (e) => Math.round(Math.min(255, Math.max(0, e)));
	return [
		a(n),
		a(r),
		a(i)
	];
}
function at(e) {
	let { rgb_color: t, color_temp_kelvin: n } = e.attributes;
	return Array.isArray(t) && t.length === 3 ? t : typeof n == "number" && n > 0 ? it(n) : U;
}
function ot(e) {
	let t = e.attributes.brightness;
	return typeof t == "number" ? Math.max(nt, (t / tt) ** et) : 1;
}
function st(e) {
	if (H(e)) return {
		on: !1,
		unreachable: !0,
		intensity: 0,
		color: U
	};
	let t = e.state === "on";
	return {
		on: t,
		unreachable: !1,
		intensity: t ? ot(e) : 0,
		color: t ? at(e) : U
	};
}
function W(e, t) {
	let n = t.states[e], r = n?.attributes.entity_id;
	return st(Array.isArray(r) && r.length > 0 && r.every((e) => H(t.states[e])) ? void 0 : n);
}
function ct(e) {
	let t = e.reduce((e, t) => e + t.intensity, 0), n = (n) => Math.round(e.reduce((e, t) => e + t.color[n] * t.intensity, 0) / t);
	return [
		n(0),
		n(1),
		n(2)
	];
}
function lt(e, t) {
	let n = (e.fixtures ?? []).map((e) => ({
		...st(t.states[e.entity]),
		fixture: e,
		reach: e.reach ?? rt[e.type]
	})), r = n.length > 0 ? n : (e.lights ?? []).map((e) => W(e.entity, t)), i = r.filter((e) => e.on);
	return {
		on: i.length > 0,
		level: i.reduce((e, t) => Math.max(e, t.intensity), 0),
		color: i.length > 0 ? ct(i) : U,
		fixtures: n,
		unreachableCount: r.filter((e) => e.unreachable).length
	};
}
var G = ([e, t, n]) => `rgb(${e} ${t} ${n})`, ut = [
	92,
	148,
	222
], dt = [
	246,
	240,
	228
], ft = [
	232,
	112,
	58
];
function K(e) {
	if (H(e)) return;
	let t = Number.parseFloat(e.state);
	return Number.isFinite(t) ? t : void 0;
}
var pt = (e, t, n) => [
	0,
	1,
	2
].map((r) => Math.round(e[r] + (t[r] - e[r]) * n));
function mt(e, [t, n]) {
	let r = Math.min(1, Math.max(0, (e - t) / (n - t)));
	return r < .5 ? pt(ut, dt, r * 2) : pt(dt, ft, (r - .5) * 2);
}
function q(e, t = "de") {
	return e === void 0 ? "–" : `${new Intl.NumberFormat(t, {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	}).format(e)}°`;
}
// src/panel.ts
var ht = .5, gt = 10, J = (e, t, n) => n ?? e.states[t]?.attributes.friendly_name ?? t;
function _t(e, t, n, r) {
	return D`<label class="switch">
    <input type="checkbox" role="switch" .checked=${e} ?disabled=${t} aria-label=${n} @change=${(t) => {
		t.target.checked = e, r();
	}} />
    <span aria-hidden="true"></span>
  </label>`;
}
function vt(e, t, n, r) {
	let i = e.states[t], a = W(t, e), o = Math.round((i?.attributes.brightness ?? 0) / 255 * 100), s = a.on && typeof i?.attributes.brightness == "number";
	return D`<div class="row ${a.on ? "on" : ""}" style="--c:${G(a.color)}">
    <button class="row-name" @click=${() => r.moreInfo(t)}>
      <i class="dot" aria-hidden="true"></i><span>${n}</span>
      <small>${a.unreachable ? "Nicht erreichbar" : a.on ? `${o} %` : "Aus"}</small>
    </button>
    ${_t(a.on, a.unreachable, `${n} schalten`, () => r.toggle(t))}
    ${s ? D`<input class="dim" type="range" min="1" max="100" .value=${String(o)} aria-label="Helligkeit ${n}"
          @change=${(e) => r.setBrightness(t, Number(e.target.value))} />` : A}
  </div>`;
}
function yt(e, t, n, r, i) {
	let a = t.climate ? e.states[t.climate] : void 0, o = t.temperature ? K(e.states[t.temperature]) : void 0;
	if (!a && o === void 0) return A;
	let s = i ?? a?.attributes.temperature, c = a?.attributes.target_temp_step ?? ht, l = a && !H(a) && typeof s == "number";
	return D`<section class="climate">
    <div>
      <strong>${q(o, n)}</strong>
      <small>${a?.attributes.hvac_action === "heating" ? "Heizt gerade" : "Raumtemperatur"}</small>
    </div>
    ${l ? D`<div class="stepper" role="group" aria-label="Zieltemperatur">
          <button aria-label="Kälter" @click=${() => r.stepTarget(t.climate, -c)}><ha-icon icon="mdi:minus"></ha-icon></button>
          <output>${q(s, n)}</output>
          <button aria-label="Wärmer" @click=${() => r.stepTarget(t.climate, c)}><ha-icon icon="mdi:plus"></ha-icon></button>
        </div>` : A}
  </section>`;
}
function bt(e, t, n) {
	let r = t.power ? e.states[t.power] : void 0, i = Number.parseFloat(r?.state ?? "");
	if (!Number.isFinite(i)) return;
	let a = +(i < gt);
	return `${new Intl.NumberFormat(n, { maximumFractionDigits: a }).format(i)} ${r?.attributes.unit_of_measurement ?? "W"}`;
}
function xt(e, t, n, r, i) {
	let a = e.states[t.entity], o = H(a), s = a?.state === "on", c = J(e, t.entity, t.name).trim(), l = r ? "Nochmal tippen" : o ? "Nicht erreichbar" : s ? bt(e, t, n) ?? "An" : "Aus";
	return D`<div class="row device-row ${s ? "on" : ""} ${r ? "armed" : ""}">
    <button class="row-name" @click=${() => i.moreInfo(t.entity)}>
      <ha-icon icon=${t.icon ?? "mdi:power-plug-outline"}></ha-icon><span>${c}</span>
      <small>${l}</small>
    </button>
    ${_t(s, o, `${c} schalten`, () => i.tapDevice(t))}
  </div>`;
}
function St(e, t, n, r, i, a, o) {
	let s = t.lights ?? [], c = t.fixtures ?? [], l = t.devices ?? [];
	return D`<aside class="panel" aria-label="${t.name}, Details">
    <header>
      <h2>${t.name}</h2>
      <button class="icon" aria-label="Details schließen" @click=${i.close}><ha-icon icon="mdi:close"></ha-icon></button>
    </header>
    ${yt(e, t, r, i, a)}
    ${s.length > 0 ? D`<section class="rows">${s.map((t) => vt(e, t.entity, J(e, t.entity, t.name), i))}</section>` : A}
    ${l.length > 0 ? D`<section class="rows" aria-label="Geräte">${l.map((t) => xt(e, t, r, o === t.entity, i))}</section>` : A}
    ${c.length > 0 ? D`<details>
          <summary>Einzelne Lampen (${c.length})</summary>
          <section class="rows">${c.map((t) => vt(e, t.entity, J(e, t.entity, t.name), i))}</section>
        </details>` : A}
    ${n.unreachableCount > 0 ? D`<p class="note">${n.unreachableCount === 1 ? "1 Lampe ist" : `${n.unreachableCount} Lampen sind`} nicht erreichbar, vermutlich am Wandschalter ausgeschaltet.</p>` : A}
  </aside>`;
}
// src/scene.ts
var Ct = "#2b3046", wt = 4e3, Tt = .34, Et = .26, Dt = .62, Y = (e) => e.area.map(([e, t]) => `${e},${t}`).join(" ");
function Ot(e, t, n) {
	return O`<ellipse class="pool" cx=${e.fixture.x} cy=${e.fixture.y} rx=${e.reach}
    ry=${e.reach * Dt} fill=${t} style="opacity:${n.toFixed(3)}"/>`;
}
function kt(e, t, n) {
	let { uid: r, config: i } = e, [a, o] = i.coordinates, s = Math.round(255 * n.level * Tt);
	return O`
    <clipPath id="${r}-clip-${t.id}"><polygon points=${Y(t)}/></clipPath>
    <mask id="${r}-mask-${t.id}" maskUnits="userSpaceOnUse" x="0" y="0" width=${a} height=${o}>
      <rect width=${a} height=${o} fill="rgb(${s} ${s} ${s})"/>
      ${n.fixtures.filter((e) => e.on).map((e) => Ot(e, `url(#${r}-white)`, e.intensity))}
    </mask>
    ${n.fixtures.filter((e) => e.on).map((e, n) => O`
      <radialGradient id="${r}-c-${t.id}-${n}">
        <stop offset="0" style="stop-color:${G(e.color)};stop-opacity:1"/>
        <stop offset="1" style="stop-color:${G(e.color)};stop-opacity:0"/>
      </radialGradient>`)}`;
}
function At(e, t, n) {
	let { uid: r, config: i, night: a } = e, [o, s] = i.coordinates, c = n.on ? a : 0, l = Et + .15999999999999998 * a, u = n.fixtures.filter((e) => e.on), d = u.length === 0 && n.on;
	return O`
    <g clip-path="url(#${r}-clip-${t.id})">
      <g class="reveal" mask="url(#${r}-mask-${t.id})" style="opacity:${c.toFixed(3)}">
        <image href=${i.image} width=${o} height=${s}/>
      </g>
      ${u.map((e, n) => Ot(e, `url(#${r}-c-${t.id}-${n})`, e.intensity * l))}
      ${d ? O`<polygon class="pool" points=${Y(t)} style="fill:${G(n.color)};opacity:${(n.level * l * .6).toFixed(3)}"/>` : A}
    </g>`;
}
function jt(e, t) {
	let { config: n, hass: r, mode: i } = e, a = t.temperature ? K(r.states[t.temperature]) : void 0, o = i === "klima" && a !== void 0, s = a === void 0 ? "transparent" : G(mt(a, n.temperature_range));
	return O`<polygon class="tint" points=${Y(t)} style="fill:${s};opacity:${o ? .72 : 0}"/>`;
}
function Mt(e) {
	let { config: t, selected: n } = e, [r, i] = t.coordinates, a = t.rooms.find((e) => e.id === n), o = a ? `M${a.area.map(([e, t]) => `${e} ${t}`).join("L")}Z` : "";
	return O`
    <path class="focus" fill-rule="evenodd" d="M${-4e3} ${-4e3}H${r + wt}V${i + wt}H${-4e3}Z ${o}" style="opacity:${a ? .46 : 0}"/>
    ${a ? O`<polygon class="outline" points=${Y(a)}/>` : A}`;
}
function Nt(e, t) {
	let { uid: n, config: r, rooms: i, night: a, mode: o } = e, [s, c] = r.coordinates, l = r.rooms.map((e) => [e, i.get(e.id)]);
	return O`
    <svg class="scene ${o}" viewBox="0 0 ${s} ${c}" role="presentation">
      <defs>
        <radialGradient id="${n}-white">
          <stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        ${l.map(([t, n]) => kt(e, t, n))}
      </defs>
      <image class="plan" href=${r.image} width=${s} height=${c}/>
      ${r.image_night ? O`<image class="night-plan" href=${r.image_night} width=${s} height=${c} style="opacity:${a.toFixed(3)}"/>` : O`<rect class="dusk" width=${s} height=${c} fill=${Ct} style="opacity:${a.toFixed(3)}"/>`}
      ${l.map(([t, n]) => At(e, t, n))}
      ${r.rooms.map((t) => jt(e, t))}
      ${Mt(e)}
      ${r.rooms.map((e) => O`
        <polygon class="hit" points=${Y(e)} tabindex="-1" @click=${() => t(e.id)}/>`)}
    </svg>`;
}
// src/styles.ts
var Pt = o`
  :host {
    --paper: #e5e1da;
    --plaque: #fbfaf7;
    --plaque-ink: #23262b;
    --plaque-muted: #5d6066;
    --line: rgb(35 38 43 / 14%);
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
    display: block;
  }
  ha-card {
    --accent: var(--plaque-ink);
    display: block;
    position: relative;
    overflow: hidden;
    background: var(--paper);
    color: var(--plaque-ink);
    transition: background 1.2s var(--ease);
    container-type: inline-size;
  }
  ha-card.night {
    --paper: #262a3b;
    --plaque: #1f2438;
    --plaque-ink: #f1efe9;
    --plaque-muted: #b4b7c4;
    --line: rgb(241 239 233 / 16%);
  }
  .viewport { position: relative; overflow: hidden; touch-action: manipulation; }
  .stage { position: absolute; inset: 0; transform-origin: 0 0; transition: transform 0.7s var(--ease); }
  .scene { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
  .scene .plan { transition: filter 0.7s var(--ease); }
  .scene.klima .plan { filter: saturate(0.2); }
  .dusk { mix-blend-mode: multiply; transition: opacity 1.2s var(--ease); }
  .night-plan, .reveal { transition: opacity 1.2s var(--ease); }
  .pool { mix-blend-mode: screen; transition: opacity 0.6s var(--ease); pointer-events: none; }
  mask .pool { mix-blend-mode: normal; }
  .tint { mix-blend-mode: multiply; transition: opacity 0.7s var(--ease); pointer-events: none; }
  .focus { fill: #10131f; transition: opacity 0.5s var(--ease); pointer-events: none; }
  .outline { fill: none; stroke: #fff; stroke-opacity: 0.8; stroke-width: calc(3px * var(--unzoom, 1)); stroke-linejoin: round; pointer-events: none; }
  .hit { fill: transparent; cursor: pointer; outline: none; }

  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .plaque {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    padding: 0 10px;
    border-radius: 9px;
    background: var(--plaque);
    color: var(--plaque-ink);
    font-size: 13px;
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgb(20 22 30 / 26%);
    transform: translate(-50%, -50%) translate(var(--dx, 0), var(--dy, 0)) scale(var(--unzoom, 1));
    transition: transform 0.7s var(--ease), opacity 0.3s var(--ease), background 1.2s var(--ease), color 1.2s var(--ease);
  }
  .plaque::after { content: ""; position: absolute; inset: -8px; }
  .plaque b { font-weight: 600; font-variant-numeric: tabular-nums; }
  .plaque.big { font-size: 15px; min-height: 36px; }
  .plaque.hidden { opacity: 0; pointer-events: none; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); flex: none; transition: background 0.6s var(--ease); }
  .on > .dot, .on .dot, .temp > .dot { background: var(--c); box-shadow: 0 0 0 1px rgb(20 22 30 / 18%); }

  .fixture {
    position: absolute;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%) scale(var(--unzoom, 1));
    transition: transform 0.7s var(--ease), opacity 0.5s var(--ease);
    pointer-events: none;
    opacity: 0.75;
  }
  .zoomed .fixture { pointer-events: auto; opacity: 1; }
  .viewport:not(.zoomed) .fixture.unreachable { opacity: 0; }
  .fixture svg, .fixture img {
    width: var(--glyph, 18px);
    height: var(--glyph, 18px);
    transform: rotate(var(--angle, 0deg));
    overflow: visible;
    transition: filter 0.6s var(--ease);
  }
  .zoomed .fixture { --glyph: 26px; }
  .fixture img { object-fit: contain; }
  .fixture svg { fill: none; stroke: #4b4e55; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .fixture .core { fill: rgb(255 255 255 / 80%); }
  .fixture.on { opacity: 1; }
  .fixture.on svg { stroke: var(--c); filter: drop-shadow(0 0 2px var(--c)); }
  .zoomed .fixture.on svg { filter: drop-shadow(0 0 6px var(--c)); }
  .fixture.on .core { fill: var(--c); }
  .fixture.unreachable svg { stroke-dasharray: 2 3; opacity: 0.6; }

  .device {
    position: absolute;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%) scale(var(--unzoom, 1));
    transition: transform 0.7s var(--ease);
    pointer-events: none;
  }
  .zoomed .device { pointer-events: auto; }
  .device span {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--plaque);
    color: var(--plaque-muted);
    box-shadow: 0 2px 6px rgb(20 22 30 / 30%);
    transition: background 0.3s var(--ease), color 0.3s var(--ease), width 0.5s var(--ease), height 0.5s var(--ease);
    --mdc-icon-size: 14px;
  }
  .zoomed .device span { width: 34px; height: 34px; --mdc-icon-size: 20px; }
  .device.on span { background: var(--plaque-ink); color: var(--plaque); }
  .device.armed span { outline: 2px solid var(--plaque-ink); outline-offset: 2px; }
  .device:disabled span { opacity: 0.55; }

  .modes {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    padding: 3px;
    border-radius: 11px;
    background: var(--plaque);
    box-shadow: 0 3px 10px rgb(20 22 30 / 20%);
  }
  .modes button { min-width: 62px; min-height: 38px; padding: 0 12px; border-radius: 8px; font-size: 13px; color: var(--plaque-muted); }
  .modes button[aria-pressed="true"] { background: var(--plaque-ink); color: var(--plaque); font-weight: 600; }

  .dock { position: absolute; right: 12px; bottom: 12px; display: flex; gap: 8px; align-items: center; transition: opacity 0.3s var(--ease); }
  .dock button {
    display: inline-flex; align-items: center; gap: 7px;
    min-height: 44px; padding: 0 13px;
    border-radius: 11px;
    background: var(--plaque);
    font-size: 13px;
    box-shadow: 0 3px 10px rgb(20 22 30 / 20%);
  }
  .dock button:disabled { color: var(--plaque-muted); cursor: default; }
  .dock ha-icon { --mdc-icon-size: 20px; color: var(--plaque-muted); }
  .dock .on ha-icon { color: var(--accent); }

  .scale {
    position: absolute; left: 12px; bottom: 12px; display: flex; align-items: center; gap: 7px;
    padding: 6px 10px; border-radius: 9px; background: var(--plaque); font-size: 12px; font-variant-numeric: tabular-nums;
    box-shadow: 0 3px 10px rgb(20 22 30 / 20%);
  }
  .scale i { width: 84px; height: 7px; border-radius: 4px; background: linear-gradient(90deg, rgb(92 148 222), rgb(246 240 228), rgb(232 112 58)); }

  .panel {
    position: absolute; top: 12px; right: 12px; bottom: 12px; width: 300px;
    display: flex; flex-direction: column; gap: 14px;
    padding: 16px; overflow-y: auto; overscroll-behavior: contain;
    border-radius: 14px;
    background: var(--plaque);
    color: var(--plaque-ink);
    box-shadow: 0 10px 30px rgb(20 22 30 / 34%);
    animation: slide 0.5s var(--ease);
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }
  @keyframes slide { from { transform: translateX(24px); opacity: 0; } }
  .panel header { display: flex; align-items: center; justify-content: space-between; }
  .panel h2 { margin: 0; font-size: 19px; font-weight: 600; }
  .panel .icon { width: 44px; height: 44px; margin: -8px -10px -8px 0; display: grid; place-items: center; color: var(--plaque-muted); }
  .climate { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .climate strong { display: block; font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .climate small, .row small { color: var(--plaque-muted); font-size: 12px; }
  .stepper { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 10px; }
  .stepper button { width: 44px; height: 44px; display: grid; place-items: center; }
  .stepper output { min-width: 46px; text-align: center; font-variant-numeric: tabular-nums; font-size: 14px; }
  .rows { display: flex; flex-direction: column; gap: 2px; }
  .row { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 8px; }
  .row-name { display: flex; align-items: center; gap: 8px; min-height: 44px; min-width: 0; text-align: left; font-size: 14px; }
  .row-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .row-name small { margin-left: auto; flex: none; font-variant-numeric: tabular-nums; }
  .row-name ha-icon { --mdc-icon-size: 20px; flex: none; color: var(--plaque-muted); }
  .device-row.on .row-name ha-icon { color: var(--plaque-ink); }
  .device-row.armed small { color: var(--plaque-ink); font-weight: 600; }
  .dim { grid-column: 1 / -1; width: 100%; height: 28px; margin: 0; accent-color: var(--accent); }
  .switch { position: relative; display: inline-flex; width: 44px; height: 44px; align-items: center; cursor: pointer; }
  .switch input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: inherit; }
  .switch span { width: 40px; height: 24px; border-radius: 12px; background: var(--line); position: relative; transition: background 0.25s var(--ease); }
  .switch span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--plaque); box-shadow: 0 1px 2px rgb(0 0 0 / 30%); transition: transform 0.25s var(--ease); }
  .switch input:checked + span { background: var(--accent); }
  .switch input:checked + span::after { transform: translateX(16px); }
  .switch input:disabled + span { opacity: 0.45; }
  .switch input:focus-visible + span { outline: 2px solid var(--accent); outline-offset: 2px; }
  summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; font-size: 13px; color: var(--plaque-muted); }
  .note { margin: 0; font-size: 12px; line-height: 1.4; color: var(--plaque-muted); }
  .error {
    position: absolute; left: 50%; top: 12px; transform: translateX(-50%); max-width: 80%;
    padding: 9px 12px; border-radius: 9px; background: #8e2b1e; color: #fff; font-size: 13px;
    box-shadow: 0 3px 10px rgb(20 22 30 / 30%);
  }

  @container (max-width: 639px) {
    .panel { position: static; width: auto; border-radius: 0; box-shadow: none; animation: none; }
  }
  @container (max-width: 460px) {
    .plaque { padding: 0 8px; gap: 5px; font-size: 12px; min-height: 28px; }
    .plaque.valued .name { display: none; }
    .modes button { min-width: 52px; padding: 0 8px; }
    .dock button span { display: none; }
    .dock button { padding: 0 12px; }
    .scale { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .stage, .plaque, .fixture, .device, .device span, .pool, .tint, .focus, .dusk, .reveal, .night-plan, .plan, .panel, ha-card { transition: none; animation: none; }
  }
`;
// src/placement.ts
function X(e, t) {
	return e.rooms.find((e) => Je(e.area, t));
}
var Z = (e, t) => e?.[t] ?? [], Q = (e, t, n, r) => ({
	...e,
	rooms: e.rooms.map((e) => e.id === t ? {
		...e,
		[n]: r(Z(e, n))
	} : e)
}), Ft = (e, t, n, r = "fixtures") => Q(e, t, r, (e) => [...e, n]), $ = (e, t, n, r, i = "fixtures") => Q(e, t, i, (e) => e.map((e, t) => t === n ? {
	...e,
	...r
} : e)), It = (e, t, n, r = "fixtures") => Q(e, t, r, (e) => e.filter((e, t) => t !== n));
function Lt(e, t, n, r, i = "fixtures") {
	let [a, o] = r.map(Math.round), s = Z(e.rooms.find((e) => e.id === t), i)[n];
	if (!s) return e;
	let c = X(e, r);
	return !c || c.id === t ? $(e, t, n, {
		x: a,
		y: o
	}, i) : Ft(It(e, t, n, i), c.id, {
		...s,
		x: a,
		y: o
	}, i);
}
function Rt(e) {
	return new Set(e.rooms.flatMap((e) => [...e.fixtures ?? [], ...e.devices ?? []].map((e) => e.entity)));
}
// src/isoplan-card-editor.ts
var zt = [1536, 1024], Bt = 4, Vt = {
	ArrowLeft: [-4, 0],
	ArrowRight: [Bt, 0],
	ArrowUp: [0, -4],
	ArrowDown: [0, Bt]
}, Ht = class extends L {
	constructor(...e) {
		super(...e), this._entity = "", this._type = "spot", this._armed = !1;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 },
			_selection: { state: !0 },
			_entity: { state: !0 },
			_type: { state: !0 },
			_armed: { state: !0 },
			_drag: { state: !0 },
			_message: { state: !0 }
		};
	}
	static {
		this.styles = o`
    :host { display: block; }
    .field { display: grid; gap: 4px; margin-bottom: 12px; font-size: 13px; }
    input, select { min-height: 40px; padding: 0 10px; font: inherit; border: 1px solid var(--divider-color, #bbb); border-radius: 8px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #222); }
    .plan { position: relative; border-radius: 10px; overflow: hidden; cursor: default; touch-action: none; user-select: none; background: #e4e2dd; }
    .plan.armed { cursor: crosshair; outline: 2px solid var(--primary-text-color, #33363c); }
    .plan img.base, .plan svg.rooms { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .rooms polygon { fill: rgb(255 255 255 / 8%); stroke: #fff; stroke-width: 2; stroke-dasharray: 8 6; vector-effect: non-scaling-stroke; }
    .pin { position: absolute; width: 28px; height: 28px; padding: 0; display: grid; place-items: center; transform: translate(-50%, -50%) rotate(var(--angle, 0deg)); border: 0; border-radius: 50%; background: #fbfaf7; box-shadow: 0 2px 6px rgb(0 0 0 / 35%); cursor: grab; touch-action: none; }
    .pin.selected { outline: 2px solid var(--primary-text-color, #33363c); outline-offset: 1px; }
    .pin svg, .pin img { width: 19px; height: 19px; fill: none; stroke: #33363c; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; object-fit: contain; pointer-events: none; }
    .tools { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 8px; margin-top: 12px; }
    .tools select { min-width: 0; }
    button.action { min-height: 40px; padding: 0 12px; white-space: nowrap; font: inherit; border: 0; border-radius: 8px; background: var(--primary-text-color, #33363c); color: var(--card-background-color, #fff); cursor: pointer; }
    button.action:disabled { opacity: 0.45; cursor: default; }
    button.quiet { background: none; color: var(--error-color, #8e2b1e); padding: 0; min-height: 40px; }
    .selected-fixture { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 10px; margin-top: 14px; }
    .selected-fixture h4 { grid-column: 1 / -1; margin: 0; font-size: 14px; }
    .selected-fixture .wide { grid-column: 1 / -1; }
    .check { min-height: 0; margin-right: 6px; }
    .hint { margin: 10px 0 0; font-size: 13px; color: var(--secondary-text-color, #555); }
    .hint[role="alert"] { color: var(--error-color, #8e2b1e); }
    @media (max-width: 480px) { .tools { grid-template-columns: minmax(0, 1fr); } }
  `;
	}
	setConfig(e) {
		this._config = e;
	}
	_commit(e) {
		this._config = e, this.dispatchEvent(new CustomEvent("config-changed", {
			bubbles: !0,
			composed: !0,
			detail: { config: e }
		}));
	}
	get _coordinates() {
		return this._config?.coordinates ?? zt;
	}
	_toImage(e) {
		let t = this.shadowRoot.querySelector(".plan").getBoundingClientRect(), [n, r] = this._coordinates;
		return [(e.clientX - t.left) / t.width * n, (e.clientY - t.top) / t.height * r];
	}
	_selected() {
		if (!this._selection) return;
		let { roomId: e, index: t, kind: n } = this._selection;
		return this._config?.rooms.find((t) => t.id === e)?.[n]?.[t];
	}
	_place(e) {
		if (!this._armed || !this._config) return;
		let t = this._toImage(e), n = X(this._config, t);
		if (!n) {
			this._message = "Diese Stelle liegt außerhalb aller Räume. Klicke in einen Raum.";
			return;
		}
		let [r, i] = t.map(Math.round), a = this._type === "device" ? "devices" : "fixtures", o = this._type === "device" ? {
			entity: this._entity,
			x: r,
			y: i
		} : {
			entity: this._entity,
			type: this._type,
			x: r,
			y: i
		};
		this._commit(Ft(this._config, n.id, o, a)), this._selection = {
			roomId: n.id,
			index: n[a]?.length ?? 0,
			kind: a
		}, this._armed = !1, this._entity = "", this._message = `In „${n.name}“ gesetzt. Ziehe es an die genaue Stelle.`;
	}
	_grab(e, t) {
		this._armed || (e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId), this._selection = t, this._drag = this._toImage(e));
	}
	_dragTo(e) {
		this._drag &&= this._toImage(e);
	}
	_drop(e) {
		if (!this._drag || !this._selection || !this._config) return;
		let t = this._toImage(e);
		this._drag = void 0;
		let { roomId: n, index: r, kind: i } = this._selection, a = Lt(this._config, n, r, t, i), o = X(a, t);
		o && o.id !== n && (this._selection = {
			roomId: o.id,
			index: o[i]?.length ?? 0,
			kind: i
		}), this._commit(a);
	}
	_nudge(e, t, n) {
		let r = Vt[e.key];
		r && this._config && (e.preventDefault(), this._commit($(this._config, t.roomId, t.index, {
			x: (n.x ?? 0) + r[0],
			y: (n.y ?? 0) + r[1]
		}, t.kind)));
	}
	_patch(e) {
		this._selection && this._config && this._commit($(this._config, this._selection.roomId, this._selection.index, e, this._selection.kind));
	}
	_remove() {
		this._selection && this._config && (this._commit(It(this._config, this._selection.roomId, this._selection.index, this._selection.kind)), this._selection = void 0);
	}
	_candidates() {
		if (!this.hass || !this._config) return [];
		let e = Rt(this._config), t = this._type === "device" ? "switch." : "light.";
		return Object.keys(this.hass.states).filter((n) => n.startsWith(t) && !e.has(n)).sort();
	}
	_renderPins() {
		let [e, t] = this._coordinates, n = (n, r, i, a, o) => {
			let s = r, c = {
				roomId: n.id,
				index: i,
				kind: a
			}, l = this._selection?.roomId === n.id && this._selection.index === i && this._selection.kind === a, [u, d] = l && this._drag ? this._drag : [r.x ?? 0, r.y ?? 0], f = this.hass?.states[r.entity]?.attributes.friendly_name ?? r.entity;
			return D`<button class="pin ${l ? "selected" : ""}" title=${f} aria-label="${f} verschieben"
        style="left:${u / e * 100}%;top:${d / t * 100}%;--angle:${s.angle ?? 0}deg"
        @pointerdown=${(e) => this._grab(e, c)}
        @pointermove=${this._dragTo}
        @pointerup=${this._drop}
        @pointercancel=${() => {
				this._drag = void 0;
			}}
        @keydown=${(e) => this._nudge(e, c, r)}
        @focus=${() => {
				this._selection = c;
			}}
      >${o}</button>`;
		};
		return this._config.rooms.flatMap((e) => [...(e.fixtures ?? []).map((t, r) => n(e, t, r, "fixtures", Be(t))), ...(e.devices ?? []).flatMap((t, r) => t.x === void 0 ? [] : [n(e, t, r, "devices", D`<ha-icon icon=${t.icon ?? "mdi:power-plug-outline"}></ha-icon>`)])]);
	}
	_renderSelected() {
		let e = this._selected();
		if (!e) return A;
		if (this._selection?.kind === "devices") return this._renderSelectedDevice(e);
		let t = e, n = (e) => e === "" ? void 0 : Number(e);
		return D`<section class="selected-fixture">
      <h4>${this.hass?.states[t.entity]?.attributes.friendly_name ?? t.entity}</h4>
      <label class="field">Leuchtentyp
        <select @change=${(e) => this._patch({ type: e.target.value })}>
          ${R.map((e) => D`<option value=${e} ?selected=${e === t.type}>${Ve[e]}</option>`)}
        </select>
      </label>
      <label class="field">Lichtradius
        <input type="number" min="20" max="600" placeholder="Standard" .value=${String(t.reach ?? "")}
          @change=${(e) => this._patch({ reach: n(e.target.value) })} />
      </label>
      <label class="field">Drehung in Grad
        <input type="number" min="-180" max="180" placeholder="0" .value=${String(t.angle ?? "")}
          @change=${(e) => this._patch({ angle: n(e.target.value) })} />
      </label>
      <label class="field">Produktbild (Pfad)
        <input type="text" placeholder="/local/isoplan/hue-play.png" .value=${t.image ?? ""}
          @change=${(e) => this._patch({ image: e.target.value || void 0 })} />
      </label>
      <button class="quiet wide" type="button" @click=${this._remove}>Lampe vom Plan entfernen</button>
    </section>`;
	}
	_renderSelectedDevice(e) {
		let t = (e) => e.target.value || void 0;
		return D`<section class="selected-fixture">
      <h4>${e.name ?? this.hass?.states[e.entity]?.attributes.friendly_name ?? e.entity}</h4>
      <label class="field">Name
        <input type="text" .value=${e.name ?? ""} @change=${(e) => this._patch({ name: t(e) })} />
      </label>
      <label class="field">Symbol
        <input type="text" placeholder="mdi:power-plug-outline" .value=${e.icon ?? ""} @change=${(e) => this._patch({ icon: t(e) })} />
      </label>
      <label class="field wide">Verbrauchssensor
        <input type="text" placeholder="sensor.tv_leistung" .value=${e.power ?? ""} @change=${(e) => this._patch({ power: t(e) })} />
      </label>
      <label class="wide"><input class="check" type="checkbox" .checked=${!!e.confirm}
        @change=${(e) => this._patch({ confirm: e.target.checked || void 0 })} /> Ausschalten erst nach zweitem Tipp</label>
      <button class="quiet wide" type="button" @click=${this._remove}>Gerät vom Plan entfernen</button>
    </section>`;
	}
	render() {
		if (!this._config) return A;
		let e = this._config, [t, n] = this._coordinates;
		return D`
      <label class="field">Grundriss (Pfad)
        <input type="text" .value=${e.image}
          @change=${(t) => this._commit({
			...e,
			image: t.target.value
		})} />
      </label>
      <div class="plan ${this._armed ? "armed" : ""}" style="aspect-ratio:${t}/${n}" @click=${this._place}>
        <img class="base" src=${e.image} alt="Grundriss" draggable="false" />
        ${O`<svg class="rooms" viewBox="0 0 ${t} ${n}" aria-hidden="true">
          ${e.rooms.map((e) => O`<polygon points=${e.area.map((e) => e.join(",")).join(" ")}/>`)}
        </svg>`}
        ${this._renderPins()}
      </div>
      <div class="tools">
        <select aria-label="Lampe wählen" @change=${(e) => {
			this._entity = e.target.value;
		}}>
          <option value="" ?selected=${!this._entity}>Lampe wählen …</option>
          ${this._candidates().map((e) => D`<option value=${e} ?selected=${e === this._entity}>${this.hass?.states[e]?.attributes.friendly_name ?? e} (${e})</option>`)}
        </select>
        <select aria-label="Leuchtentyp" @change=${(e) => {
			this._type = e.target.value, this._entity = "";
		}}>
          ${R.map((e) => D`<option value=${e} ?selected=${e === this._type}>${Ve[e]}</option>`)}
          <option value="device" ?selected=${this._type === "device"}>Gerät an Steckdose</option>
        </select>
        <button class="action" type="button" ?disabled=${!this._entity} @click=${() => {
			this._armed = !0, this._message = "Klicke jetzt auf die Stelle im Plan, an der die Lampe hängt.";
		}}>Auf Plan setzen</button>
      </div>
      ${this._message ? D`<p class="hint" role="status">${this._message}</p>` : D`<p class="hint">Ziehe Lampen mit der Maus oder dem Finger. Mit den Pfeiltasten verschiebst du die gewählte Lampe genau. Räume und Sensoren stellst du im YAML-Editor ein.</p>`}
      ${this._renderSelected()}`;
	}
};
customElements.get("isoplan-card-editor") || customElements.define("isoplan-card-editor", Ht);
// src/isoplan-card.ts
var Ut = 500, Wt = 640, Gt = 324, Kt = .5, qt = 6e3, Jt = 4e3, Yt = 4e3, Xt = 24, Zt = 0, Qt = class extends L {
	constructor(...e) {
		super(...e), this._mode = "licht", this._width = 0, this._offsets = /* @__PURE__ */ new Map(), this._watched = /* @__PURE__ */ new Set(), this._uid = `iso${++Zt}`, this._held = !1, this._actions = {
			close: () => {
				this._selected = void 0;
			},
			toggle: (e) => this._toggle(e),
			setBrightness: (e, t) => void this._call($e(e), "turn_on", {
				entity_id: e,
				brightness_pct: t
			}),
			stepTarget: (e, t) => this._stepTarget(e, t),
			tapDevice: (e) => this._tapDevice(e),
			moreInfo: (e) => this._moreInfo(e)
		};
	}
	static {
		this.styles = Pt;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 },
			_mode: { state: !0 },
			_selected: { state: !0 },
			_width: { state: !0 },
			_offsets: { state: !0 },
			_error: { state: !0 },
			_pendingTarget: { state: !0 },
			_armedDevice: { state: !0 }
		};
	}
	static getConfigElement() {
		return document.createElement("isoplan-card-editor");
	}
	static getStubConfig() {
		return {
			type: "custom:isoplan-card",
			image: "/local/isoplan/wohnung.webp",
			rooms: [{
				id: "raum",
				name: "Raum",
				area: [
					[100, 100],
					[900, 100],
					[900, 700],
					[100, 700]
				],
				label: [500, 400]
			}]
		};
	}
	setConfig(e) {
		let t = Fe(e);
		this._config || (this._mode = t.default_mode), t.rooms.some((e) => e.id === this._selected) || (this._selected = void 0), this._config = t, this._watched = Ie(t);
	}
	getCardSize() {
		return 8;
	}
	getGridOptions() {
		return {
			columns: "full",
			rows: "auto",
			min_columns: 6
		};
	}
	connectedCallback() {
		super.connectedCallback(), this._observer = new ResizeObserver(([e]) => {
			this._width = e.contentRect.width;
		}), this._observer.observe(this);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._observer?.disconnect(), [
			this._holdTimer,
			this._errorTimer,
			this._pendingTimer,
			this._armTimer
		].forEach((e) => window.clearTimeout(e));
	}
	shouldUpdate(e) {
		if (!this._config) return !1;
		let t = e.get("hass");
		return e.size > 1 || !e.has("hass") || !t || !this.hass || [...this._watched].some((e) => t.states[e] !== this.hass.states[e]);
	}
	updated() {
		this._placeLabels();
	}
	get _locale() {
		return this.hass?.locale?.language ?? this.hass?.language ?? "de";
	}
	get _stageSize() {
		let [e, t] = this._config.coordinates;
		return {
			width: this._width,
			height: this._width * t / e
		};
	}
	get _wide() {
		return this._width >= Wt;
	}
	_zoom() {
		let e = this._config?.rooms.find((e) => e.id === this._selected);
		if (!e || !this._width) return He;
		let [t] = this._config.coordinates, { width: n, height: r } = this._stageSize, i = n / t, a = qe(e.area), o = Ye({
			x: a.x * i,
			y: a.y * i,
			width: a.width * i,
			height: a.height * i
		}, {
			x: 0,
			y: 0,
			width: this._wide ? n - Gt : n,
			height: r
		});
		return {
			...o,
			x: Math.round(o.x),
			y: Math.round(o.y)
		};
	}
	_placeLabels() {
		if (!this._width || !this.shadowRoot || !this._config) return;
		let [e, t] = this._config.coordinates, { width: n, height: r } = this._stageSize, i = this._config.rooms.flatMap((i) => {
			let a = this.shadowRoot.querySelector(`[data-room="${i.id}"]`);
			return a ? [{
				id: i.id,
				x: i.label[0] / e * n,
				y: i.label[1] / t * r,
				width: a.offsetWidth,
				height: a.offsetHeight
			}] : [];
		}), a = this._config.rooms.flatMap((e) => e.devices ?? []).flatMap((i) => i.x === void 0 || i.y === void 0 ? [] : [{
			id: i.entity,
			x: i.x / e * n,
			y: i.y / t * r,
			width: Xt,
			height: Xt
		}]), o = Qe(i, {
			width: n,
			height: r
		}, a), s = new Map(o.map((e, t) => [e.id, [Math.round(e.x - i[t].x), Math.round(e.y - i[t].y)]]));
		[...s].some(([e, [t, n]]) => this._offsets.get(e)?.[0] !== t || this._offsets.get(e)?.[1] !== n) && (this._offsets = s);
	}
	async _call(e, t, n) {
		try {
			await this.hass.callService(e, t, n);
		} catch (n) {
			console.error("isoplan-card:", e, t, n), this._error = "Das hat nicht geklappt. Bitte prüfe die Verbindung zu Home Assistant und versuche es erneut.", window.clearTimeout(this._errorTimer), this._errorTimer = window.setTimeout(() => {
				this._error = void 0;
			}, qt);
		}
	}
	_moreInfo(e) {
		this.dispatchEvent(new CustomEvent("hass-more-info", {
			bubbles: !0,
			composed: !0,
			detail: { entityId: e }
		}));
	}
	_toggle(e) {
		this._call("homeassistant", "toggle", { entity_id: e });
	}
	_stepTarget(e, t) {
		let n = this.hass.states[e]?.attributes ?? {}, r = this._pendingTarget?.entity === e ? this._pendingTarget.value : n.temperature, i = Math.min(n.max_temp ?? Infinity, Math.max(n.min_temp ?? -Infinity, r + t));
		this._pendingTarget = {
			entity: e,
			value: i
		}, window.clearTimeout(this._pendingTimer), this._pendingTimer = window.setTimeout(() => {
			this._pendingTarget = void 0;
		}, Jt), this._call("climate", "set_temperature", {
			entity_id: e,
			temperature: i
		});
	}
	_tapDevice(e) {
		let t = this.hass.states[e.entity];
		H(t) || (window.clearTimeout(this._armTimer), e.confirm && t.state === "on" && this._armedDevice !== e.entity ? (this._armedDevice = e.entity, this._armTimer = window.setTimeout(() => {
			this._armedDevice = void 0;
		}, Yt)) : (this._armedDevice = void 0, this._toggle(e.entity)));
	}
	_onKey(e) {
		e.key === "Escape" && (this._selected = void 0);
	}
	_selectRoom(e) {
		this._selected = this._selected === e ? void 0 : e;
	}
	_startHold(e) {
		this._held = !1, this._holdTimer = window.setTimeout(() => {
			this._held = !0, this._moreInfo(e);
		}, Ut);
	}
	_endHold() {
		window.clearTimeout(this._holdTimer);
	}
	_cancelHold() {
		window.clearTimeout(this._holdTimer), this._held = !1;
	}
	_tapFixture(e) {
		this._held || this._toggle(e), this._held = !1;
	}
	_renderPlaque(e, t, n) {
		let [r, i] = this._config.coordinates, a = e.temperature ? K(this.hass.states[e.temperature]) : void 0, o = this._mode === "klima", s = o && a !== void 0 ? mt(a, this._config.temperature_range) : t.color, [c, l] = this._offsets.get(e.id) ?? [0, 0];
		return D`<button
      class="plaque ${(o ? a !== void 0 : t.on) ? "on" : ""} ${o ? "big" : ""} ${a === void 0 ? "" : "valued"} ${this._selected ? "hidden" : ""}"
      data-room=${e.id}
      style="left:${e.label[0] / r * 100}%;top:${e.label[1] / i * 100}%;--dx:${c}px;--dy:${l}px;--unzoom:${n};--c:${G(s)}"
      aria-label="${e.name}${a === void 0 ? "" : `, ${q(a, this._locale)}`}, ${t.on ? "Licht an" : "Licht aus"}. Details öffnen"
      @click=${() => this._selectRoom(e.id)}
    >
      <i class="dot" aria-hidden="true"></i>
      <span class="name">${e.name}</span>
      ${a === void 0 ? A : D`<b>${q(a, this._locale)}</b>`}
    </button>`;
	}
	_renderFixture(e, t) {
		let [n, r] = this._config.coordinates, { fixture: i } = e, a = i.name ?? this.hass.states[i.entity]?.attributes.friendly_name ?? i.entity, o = e.unreachable ? "nicht erreichbar" : e.on ? "an" : "aus";
		return D`<button
      class="fixture ${e.on ? "on" : ""} ${e.unreachable ? "unreachable" : ""}"
      style="left:${i.x / n * 100}%;top:${i.y / r * 100}%;--c:${G(e.color)};--unzoom:${t};--angle:${i.angle ?? 0}deg"
      title="${a}: ${o}"
      aria-label="${a}, ${o}. Tippen schaltet, halten öffnet Details"
      ?disabled=${e.unreachable}
      tabindex=${this._selected ? 0 : -1}
      @pointerdown=${() => this._startHold(i.entity)}
      @pointerup=${this._endHold}
      @pointerleave=${this._cancelHold}
      @pointercancel=${this._cancelHold}
      @contextmenu=${(e) => e.preventDefault()}
      @click=${() => this._tapFixture(i.entity)}
    >${Be(i)}</button>`;
	}
	_renderDevice(e, t) {
		if (e.x === void 0 || e.y === void 0) return A;
		let [n, r] = this._config.coordinates, i = this.hass.states[e.entity], a = H(i), o = i?.state === "on", s = this._armedDevice === e.entity, c = (e.name ?? i?.attributes.friendly_name ?? e.entity).trim(), l = s ? "nochmal tippen zum Ausschalten" : a ? "nicht erreichbar" : o ? "an" : "aus";
		return D`<button
      class="device ${o ? "on" : ""} ${s ? "armed" : ""}"
      style="left:${e.x / n * 100}%;top:${e.y / r * 100}%;--unzoom:${t}"
      title="${c}: ${l}"
      aria-label="${c}, ${l}. Tippen schaltet, halten öffnet Details"
      ?disabled=${a}
      tabindex=${this._selected ? 0 : -1}
      @pointerdown=${() => this._startHold(e.entity)}
      @pointerup=${this._endHold}
      @pointerleave=${this._cancelHold}
      @pointercancel=${this._cancelHold}
      @contextmenu=${(e) => e.preventDefault()}
      @click=${() => {
			this._held || this._tapDevice(e), this._held = !1;
		}}
    ><span><ha-icon icon=${e.icon ?? "mdi:power-plug-outline"}></ha-icon></span></button>`;
	}
	_renderDock() {
		let { all_lights: e, extras: t = [] } = this._config;
		if (!e && t.length === 0) return A;
		let n = e ? W(e, this.hass).on : !1;
		return D`<div class="dock">
      ${t.map((e) => {
			let { on: t, unreachable: n } = W(e.entity, this.hass);
			return D`<button class=${t ? "on" : ""} aria-pressed=${t} ?disabled=${n}
          title=${n ? `${e.name} ist nicht erreichbar` : e.name} @click=${() => this._toggle(e.entity)}>
          <ha-icon icon=${e.icon ?? "mdi:lightbulb-outline"}></ha-icon><span>${e.name}</span>
        </button>`;
		})}
      ${e ? D`<button class=${n ? "on" : ""} @click=${() => void this._call($e(e), n ? "turn_off" : "turn_on", { entity_id: e })}>
            <ha-icon icon="mdi:lightbulb-group-outline"></ha-icon><span>${n ? "Alle aus" : "Alle an"}</span>
          </button>` : A}
    </div>`;
	}
	_renderModes() {
		return D`<div class="modes" role="group" aria-label="Ansicht">
      ${[["licht", "Licht"], ["klima", "Klima"]].map(([e, t]) => D`<button aria-pressed=${this._mode === e} @click=${() => {
			this._mode = e;
		}}>${t}</button>`)}
    </div>`;
	}
	_renderScale() {
		if (this._mode !== "klima" || this._selected) return A;
		let [e, t] = this._config.temperature_range;
		return D`<div class="scale">${e}°<i aria-hidden="true"></i>${t}°</div>`;
	}
	render() {
		if (!this._config || !this.hass) return A;
		let e = this._config, t = this.hass, [n, r] = e.coordinates, i = new Map(e.rooms.map((e) => [e.id, lt(e, t)])), a = Re(e.night, t.states[e.sun_entity]), o = this._zoom(), s = 1 / o.scale, c = e.rooms.find((e) => e.id === this._selected), l = [...i.values()].flatMap((e) => e.fixtures), u = this._selected ? i.get(this._selected).fixtures : l, d = (c ? [c] : e.rooms).flatMap((e) => e.devices ?? []);
		return D`<ha-card class=${a >= Kt ? "night" : ""} @keydown=${this._onKey}>
      <div class="viewport ${c ? "zoomed" : ""}" style="aspect-ratio:${n}/${r}">
        <div class="stage" style="transform:translate(${o.x}px,${o.y}px) scale(${o.scale});--unzoom:${s}">
          ${Nt({
			uid: this._uid,
			config: e,
			hass: t,
			rooms: i,
			night: a,
			mode: this._mode,
			selected: this._selected
		}, (e) => this._selectRoom(e))}
          ${this._mode === "licht" ? u.map((e) => this._renderFixture(e, s)) : A}
          ${this._mode === "licht" ? d.map((e) => this._renderDevice(e, s)) : A}
          ${e.rooms.map((e) => this._renderPlaque(e, i.get(e.id), s))}
        </div>
        ${this._renderModes()}
        ${c ? A : this._renderDock()}
        ${this._renderScale()}
        ${this._error ? D`<div class="error" role="alert">${this._error}</div>` : A}
      </div>
      ${c ? St(t, c, i.get(c.id), this._locale, this._actions, this._pendingTarget?.entity === c.climate ? this._pendingTarget?.value : void 0, this._armedDevice) : A}
    </ha-card>`;
	}
};
customElements.get("isoplan-card") || customElements.define("isoplan-card", Qt), (window.customCards ??= []).push({
	type: "isoplan-card",
	name: "Isoplan Card",
	description: "Isometrischer Grundriss mit echtem Lichtverlauf, Tag/Nacht und Raumdetails.",
	preview: !1
});
export { Qt as IsoplanCard };
