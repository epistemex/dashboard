/*!
	Dashboard version 0.4.0 alpha
	(c) 2016 Epistemex
	www.epistemex.com
	MIT License
*/

/*
	TODOs:
	- Groups
 */

/**
 * Dashboard instance holding the controls.
 *
 * @param {*} [options] - optional literal object holding options
 * @param {function} [options.callback] - a global callback used when a local callback for the control isn't defined
 * @param {string} [options.id] - optional id for the div container
 * @param {string} [options.idPrefix] - optional id-prefix for added controls.
 * @param {string} [options.css="dashboard"] - name of css master class used for the div container
 * @param {number} [options.tabIndexStart=1] - tab-indexes are automatically numbered from 1. If a different start-offset is desired, this property can be used.
 * @constructor
 */
function Dashboard(options) {

	"use strict";

	options = options || {};

	var me       = this,
		preId    = options.idPrefix ? options.idPrefix + "_" : "",
		count    = 0,
		tabIndex = options.tabIndexStart || 1,
		isShown  = false,
		callback = options.callback,
		doc      = document,
		createEl = doc.createElement.bind(doc),
		getEl 	 = doc.getElementById.bind(doc),
		db       = createDiv(),
		timer;

	db.className = options.css || "dashboard";
	if (options.id) db.id = options.id;

	function append(parent) {
		for(var i = 1, a = arguments; i < a.length; i++) parent.appendChild(a[i])
	}

	function setCB(el, args, ctx) {
		if (args.cb) el.__cb = args.cb.bind(ctx)
	}

	function isBool(v) {return typeof v === "boolean"}
	function isStr(v) {return typeof v === "string"}

	function createSlider(args, min, max, value, step, live, trans) {

		var line   = createLine(args),
			lbl    = createLabel(args),
			slider = createInput(args, "range"),
			span   = createSpan(args.id + "v", trans ? trans(value) : value);

		slider.min = min;
		slider.max = max;
		slider.value = Math.max(min, Math.min(max, value));
		slider.step = step;
		slider.tabIndex = tabIndex++;
		slider.disabled = args.dis;
		slider.__v = span;												// yes, these are on purpose! :-]
		slider.__type = "slider";
		slider.__tr = trans;
		setCB(slider, args, line);
		if (live) slider.oninput = cbHandler;
		else {
			slider.onchange = cbHandler;
			slider.oninput = infoHandler
		}

		append(line, lbl, slider, span);
		append(db, line)
	}

	function createCheckbox(args, isChecked) {

		var line = createLine(args),
			lbl  = createLabel(args),
			chk  = createInput(args, "checkbox");

		chk.checked = isChecked;
		chk.tabIndex = tabIndex++;
		chk.disabled = args.dis;
		chk.onchange = cbHandler;
		chk.__type = "checkbox";
		setCB(chk, args, line);

		append(line, lbl, chk);
		append(db, line)
	}

	function createTextbox(args, txt, live) {

		var line   = createLine(args),
			lbl    = createLabel(args),
			txtBox = createInput(args, "textbox");

		txtBox.value = txt;
		txtBox.tabIndex = tabIndex++;
		txtBox.disabled = args.dis;
		txtBox.onchange = cbHandler;
		txtBox.__type = "textbox";
		setCB(txtBox, args, line);
		if (args.cb) txtBox.__cb = args.cb.bind(line);
		if (live) txtBox.onkeyup = cbHandler;

		append(line, lbl, txtBox);
		append(db, line)
	}

	function createDropdown(args, lst) {

		var line   = createLine(args),
			lbl    = createLabel(args),
			select = createEl("select");

		select.id = args.id;
		select.tabIndex = tabIndex++;
		select.disabled = args.dis;
		select.onchange = cbHandler;
		select.__type = "dropdown";
		setCB(select, args, line);

		lst.forEach(function(e) {
			var entry = createEl("option");
			entry.innerHTML = e;
			append(select, entry)
		});

		append(line, lbl, select);
		append(db, line)
	}

	function createButton(args, btnTxt) {

		var line = createLine(args),
			lbl  = createLabel(args),
			btn  = createEl("button");

		btn.id = args.id;
		btn.innerHTML = btnTxt;
		btn.tabIndex = tabIndex++;
		btn.disabled = args.dis;
		btn.onclick = cbHandler;
		btn.__type = "button";
		setCB(btn, args, line);

		append(line, lbl, btn);
		append(db, line)
	}

	function createDiv() {
		return createEl("div")
	}

	function createLine(args) {
		var line = createDiv();
		line.className = args.css || "line";
		line.style.display = args.show ? "block" : "none";
		return line
	}

	function createSpan(id, value) {
		var span = createEl("span");
		span.id = id;
		span.innerHTML = value;
		return span
	}

	function createInput(args, type) {
		var input = createEl("input");
		input.id = args.id;
		input.type = type;
		return input
	}

	function createLabel(args) {
		var lbl = createEl("label");
		lbl.setAttribute("for", args.id);
		lbl.innerHTML = args.lbl;
		return lbl
	}

	function cbHandler() {

		if (this.__v) {
			this.__v.innerHTML = this.__tr ? this.__tr(this.value) : this.value;
		}

		if (this.__cb) {
			var v = me.value(this);
			if (this.__old !== v || this.__type === "button") {
				clearTimeout(timer);
				timer = setTimeout(
					this.__cb({
						id       : this.id.substr(preId.length),
						target   : this,
						type     : this.__type,
						value    : v,
						timestamp: Date.now()
					}), 7);
				this.__old = v;
			}
		}
	}

	function infoHandler() {
		this.__v.innerHTML = this.__tr ? this.__tr(this.value) : this.value
	}

	/**
	 * Add a new control to the dashboard panel. The control is defined
	 * by a literal object and the attributes depends on type.
	 *
	 * - `type` can be "slider", "checkbox", "dropdown", "button", "textbox", "text" and "hr"
	 * - Common attributes are `id`, `label`, `callback`, `css`, `enabled` and `show`.
	 * - Additional attributes for slider: `min`, `max`, `step`, `value`, `transformer`, `live`.
	 * - Additional attributes for checkbox: `checked`
	 * - Additional attributes for button: `text`
	 * - Additional attributes for textbox: `text`, `live`
	 * - Additional attributes for text: `text`, `raw`
	 *
	 * Type "hr" is simply a static horizontal ruler with no additional
	 * attributes to be set (style it using css).
	 *
	 * Note that for non-raw text type an id must be explicitly set if
	 * needed (ie. to remove later). An id is never set when in raw mode.
	 *
	 * The callback function will receive an event bound to the *parent*
	 * element of the control (a div sub-container which contains label,
	 * the control and optionally value span depending on control).
	 *
	 * The event is an object containing the properties `id`, a string
	 * containing the original un-prefixed id given. `target` referencing
	 * the main control element itself (slider, checkbox etc.). A string
	 * `type` defining what type of control this is ("slider", "checkbox" etc.)
	 * and a `value` holding a number, boolean etc. depending on control type.
	 * And finally a `timestamp`.
	 *
	 * You can use the value() method to set a new value of a control,
	 * but feel free to do so directly on the target object if you so
	 * desire. There is no internal bookkeeping of values to interfere.
	 *
	 * If type is unknown the method will throw an exception.
	 *
	 * This call is chainable.
	 *
	 * @param {*} o - literal object defining the control type
	 * @param {string} o.type - string defining type of control to add.
	 * @param {string} [o.id] - string assigning the id of the main control. If not defined an internal id is assigned.
	 * @param {string} [o.label] - string setting the label text. If not given an internal string is generated.
	 * @param {string} [o.css] - override line container css with a custom class name (see example.css and .line class to see what it replaces)
	 * @param {boolean} [o.show=true] - set initial visibility state of control. Can be changed later.
	 * @param {boolean} [o.enabled=true] - set initial state to be enabled or disabled
	 * @param {function} [o.callback] - callback function for this control. Is triggered when a change is made to the control. Can be shared.
	 * @param {number} [o.min=0] - "slider": minimum value
	 * @param {number} [o.max=100] - "slider": maximum value
	 * @param {number} [o.value=50] - "slider": initial value
	 * @param {number} [o.step=1] - "slider": step value
	 * @param {function} [o.transformer] - "slider": callback function to transform a numerical value into something else (for display only).
	 * @param {boolean} [o.live=false] - "slider" / "textbox": throw event for each character change or per increment (if false only when textbox is blurred/changed)
	 * @param {boolean} [o.checked=false] - "checkbox": initial state
	 * @param {Array} [o.list] - "dropdown" / "slider": array holding strings for each dropdown item. Defaults to the first item in the list.
	 * For slider type this will automatically setup a basic transformation slider.
	 * @param {Array} [o.text] - "textbox" / "text" / "button": a string to show - initial text when used with textbox - button text when used with a button
	 * @param {boolean} [o.raw=false] - "text": if true the text will be inserted as-is without a paragraph wrapper
	 * @returns {Dashboard}
	 */
	this.add = function(o) {

		count++;

		var args = {
				id   : preId + (o.id || o.type + count),
				dis  : !(isBool(o.enabled) ? o.enabled : true),
				css  : o.css,
				show : isBool(o.show) ? o.show : true,
				lbl  : o.label || (o.type + count),
				cb   : o.callback || callback
			}, lst, txtCont, paraEl;

		switch(o.type) {

			case "slider":
				if (Array.isArray(lst = o.list)) {
					createSlider(args, 0, lst.length - 1, 0, 1, o.live, function(v) {return lst[v]})
				}
				else {
					createSlider(
						args,
						o.min || 0,
						typeof o.max !== "undefined" ? o.max : 100,
						typeof o.value !== "undefined" ? o.value : 50,
						o.step || 1,
						o.live,
						o.transformer
					);
				}
				break;

			case "checkbox":
				createCheckbox(args, !!o.checked);
				break;

			case "textbox":
				createTextbox(args, o.text || "", o.live);
				break;

			case "dropdown":
				createDropdown(args, o.list);
				break;

			case "button":
				createButton(args, o.text || o.type + count);
				break;

			case "hr":
				append(db, createEl("hr"));
				break;

			case "text":
				txtCont = createLine(args);
				if (o.raw) txtCont.innerHTML = o.text || "";
				else {
					paraEl = createEl("p");
					paraEl.innerHTML = o.text || "";
					if (o.id) paraEl.id = args.id;
					append(txtCont, paraEl)
				}
				append(db, txtCont);
				break;

			default:
				throw "Unknown type"
		}

		return this
	};

	/**
	 * Removes an existing control from the dashboard panel.
	 *
	 * This call is chainable.
	 *
	 * @param {*} id - id string of the control itself (given as id to add()), or provide the element itself
	 * @returns {Dashboard}
	 */
	this.rem = function(id) {

		var o = isStr(id) ? getEl(preId + id) : id,
			parent;

		if (!o || !o.__type) throw "Unknown control";

		parent = o.parentNode;					// line
		parent.parentNode.removeChild(parent);	// container, removes line and children

		return this
	};

	/**
	 * Set or get value of a control in the dashboard panel.
	 *
	 * - For a slider you would set a value using a numerical value within the min-max range.
	 * - For checkbox simply use a boolean value.
	 * - For a text box you would use a string. This also applies to a button if you want to change its text.
	 * - For a dropdown you can use index or option text to set a new value.
	 *
	 * If a value is not given the method will return current value in
	 * the same form as given depending on the control type.
	 *
	 * @param {*} id - id string of the control itself (given as id to add()), or provide the element itself
	 * @param {*} [value] - define to set value. The value type depends on the control type.
	 * @returns {*} - if setting it can be chained, otherwise returns current value
	 */
	this.value = function(id, value) {

		var o = isStr(id) ? getEl(preId + id) : id;

		if (o && o.__type) {
			if (arguments.length === 2) {
				switch(o.__type) {
					case "slider":
						o.value = o.__v.innerHTML = value;
						break;
					case "checkbox":
						o.checked = value;
						break;
					case "textbox":
						o.value = value;
						break;
					case "button":
						o.innerHTML = value;
						break;
					case "dropdown":
						if (typeof value === "number") {
							if (value >= 0 && value < o.options.length)
								o.selectedIndex = value
						}
						else if (typeof value === "string") {
							for(var i = 0, options = o.options, l = options.length; i < l; i++) {
								if (options[i].innerHTML === value) {
									o.selectedIndex = i;
									break;
								}
							}
						}
						break;
				}
				return this
			}
			else {
				switch(o.__type) {
					case "slider":
						return +o.value;
					case "checkbox":
						return !!o.checked;
					case "textbox":
						return o.value;
					case "button":
						return o.innerHTML;
					case "dropdown":
						return o.value;
				}
			}
		}
	};

	/**
	 * Enable or disable a control.
	 *
	 * This method is chainable.
	 *
	 * @param {*} id - id as string or the element itself
	 * @param {boolean} state - set the new state for this element, true = enabled, false = disabled
	 */
	this.enable = function(id, state) {
		var o = isStr(id) ? getEl(preId + id) : id;
		if (o && o.__type) o.disabled = !state;
		return this
	};

	/**
	 * Hide or show a control.
	 *
	 * @param {*} id - id as string or the element itself
	 * @param {boolean} state - change the visibility of a control
	 * @returns {Dashboard}
	 */
	this.show = function(id, state) {
		var o = isStr(id) ? getEl(preId + id) : id;
		if (o && o.__type) o.parentNode.style.display = state ? "block" : "none";
		return this
	};

	/**
	 * Init will initialize and attach the dashboard panel to parent, or
	 * if parent isn't defined, to the body. We recommend calling this
	 * after all controls are added.
	 *
	 * Note: can only be called once.
	 *
	 * @param {HTMLElement} [parent] - parent to add to. If not defined parent will be `document.body`
	 * @returns {Dashboard}
	 */
	this.init = function(parent) {
		if (!isShown) {
			(parent || doc.body).appendChild(db);
			isShown = true
		}
		return this
	};

}