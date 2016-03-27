/*!
	Dashboard version 0.8.1 alpha
	(c) 2016 Epistemex
	www.epistemex.com
	MIT License
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
 * @param {HTMLElement|string} [options.parent] - HTML element or ID of element to append to. Default is document.body.
 * @constructor
 */
function Dashboard(options) {

	"use strict";

	options = options || {};

	var me        = this,
		preId     = isStr(options.idPrefix) ? options.idPrefix + "_" : "",
		count     = 0,
		tabIndex  = options.tabIndexStart || 1,
		callback  = options.callback,
		doc       = document,
		createEl  = doc.createElement.bind(doc),
		getEl 	  = doc.getElementById.bind(doc),
		db        = createDiv(),
		oParent   = options.parent,
		parent    = oParent ? (isStr(oParent) ? getEl(oParent) : oParent) : doc.body,
		ignorePtr = "pointer-events: none !important",
		timer;

	db.className = options.css || "dashboard";
	if (options.id) db.id = options.id;

	// add straight to DOM
	append(parent, db);

	/*
		System helpers
	 */

	// Can append multiple elements to parent: append(parent, child1, child2, ...);
	function append(parent) {
		for(var i = 1, a = arguments; i < a.length; i++) parent.appendChild(a[i])
	}

	// Setup callback, if any, with proper context binding
	function setCallback(el, args, ctx) {
		if (args.cb) el.__cb = args.cb.bind(ctx)
	}

	// Sets up some common features of an element incl. tab-index
	function prepEl(el, type, args, noTab) {
		el.dataset.type = type;
		if (!noTab) el.tabIndex = tabIndex++;
		if (args.bind) el.dataset.bind = args.bind;
	}

	// Get list of radio buttons in a control
	function radioList(el) {
		return el.parentNode.querySelectorAll("input")
	}

	// Sets slider value based on formatter if any. If onlyInfo only
	// the span element is updated with the formatted value
	function setSlider(o, value, onlyInfo) {
		if (!onlyInfo) o.value = value;
		o.__v.innerHTML = o.__tr ? o.__tr(o.value) : o.value;
	}

	function isBool(v) {return typeof v === "boolean"}
	function isStr(v) {return typeof v === "string"}
	function isDef(v) {return typeof v !== "undefined"}

	/*
		Controls
	 */
	function createSlider(args, min, max, value, step, live, trans) {

		var line   = createLine(args),
			lbl    = createLabel(args),
			slider = createInput(args, "range"),
			span   = createSpan(args, 0);

		slider.min = min;
		slider.max = max;
		slider.step = step;
		slider.value = Math.max(min, Math.min(max, value));
		slider.disabled = args.dis;
		slider.__v = span;
		slider.__tr = trans;

		prepEl(slider, "slider", args);
		setCallback(slider, args, line);
		setSlider(slider, value, true);

		if (live) slider.oninput = cbHandler;
		else {
			slider.onchange = cbHandler;
			slider.oninput = infoHandler
		}

		append(line, lbl, slider, span);

		return line
	}

	function createCheckbox(args, isChecked) {

		var line = createLine(args),
			lbl  = createLabel(args),
			chk  = createInput(args, "checkbox");

		chk.checked = isChecked;
		chk.disabled = args.dis;
		chk.onchange = cbHandler;

		prepEl(chk, "checkbox", args);
		setCallback(chk, args, line);

		append(line, lbl, chk);

		return line
	}

	function createTextbox(args, txt, live, pTxt) {

		var line   = createLine(args),
			lbl    = createLabel(args),
			txtBox = createInput(args, "text");

		txtBox.value = txt;
		txtBox.disabled = args.dis;
		txtBox.onchange = cbHandler;

		prepEl(txtBox, "textbox", args);
		setCallback(txtBox, args, line);

		if (pTxt) txtBox.placeholder = pTxt;
		if (live) txtBox.onkeyup = cbHandler;
		if (args.cb) txtBox.__cb = args.cb.bind(line);

		append(line, lbl, txtBox);

		return line
	}

	function createInfo(args, txt) {

		var line   = createLine(args),
			lbl    = createLabel(args),
			info = createEl("i");

		info.id = args.id;
		info.innerHTML = txt;
		info.disabled = args.dis;
		prepEl(info, "info", args, true);

		append(line, lbl, info);

		return line
	}

	function createText(args, txt, isRaw) {

		var txtCont = createLine(args),
			paraEl;

		if (isRaw) txtCont.innerHTML = txt || "";
		else {
			paraEl = createEl("p");
			paraEl.innerHTML = txt || "";
			paraEl.id = args.id;
			append(txtCont, paraEl)
		}

		return txtCont
	}

	function createColor(args, color) {

		var line = createLine(args),
			lbl  = createLabel(args),
			col  = createInput(args, "color");

		lbl.style.cssText = ignorePtr;

		col.value = color;
		col.disabled = args.dis;
		col.onchange = cbHandler;
		prepEl(col, "color", args);
		setCallback(col, args, line);

		append(line, lbl, col);

		return line
	}

	function createDropdown(args, lst, selected) {

		var line   = createLine(args),
			lbl    = createLabel(args),
			select = createEl("select"),
			i = 0;

		select.id = args.id;
		select.disabled = args.dis;
		select.onchange = cbHandler;
		prepEl(select, "dropdown", args);
		setCallback(select, args, line);

		lst.forEach(function(e) {
			var entry = createEl("option");
			entry.innerHTML = e;
			if (i++ === selected) entry.selected = "selected";
			append(select, entry)
		});

		append(line, lbl, select);

		return line
	}

	function createRadio(args, grp, lst, selected) {

		var line   = createLine(args),
			lbl    = createDiv(),
			i = 0;

		lbl.id = args.id;
		lbl.innerHTML = "<p>" + args.lbl + "</p>";
		lbl.className ="radio";
		prepEl(lbl, "radio", args, true);

		append(line, lbl);

		lst.forEach(function(e) {

			var _args = {lbl: e, id: args.id + "_" + i, cb: args.cb},
				div = createDiv(),
				radio = createInput(_args, "radio"),
				lbl = createLabel(_args);

			div.className = "radio";

			radio.name = grp;
			radio.id = _args.id;
			radio.value = e;
			radio.onclick = cbHandler;
			radio.disabled = args.dis;
			prepEl(radio, "radio", args);
			setCallback(radio, _args, radio);

			if (i++ === selected) radio.checked = "checked";

			append(div, radio, lbl);
			append(line, div)
		});

		return line
	}

	function createButton(args, btnTxt) {

		var line = createLine(args),
			lbl  = createLabel(args),
			btn  = createEl("button");

		lbl.style.cssText = ignorePtr;

		btn.id = args.id;
		btn.innerHTML = btnTxt;
		btn.disabled = args.dis;
		btn.onclick = cbHandler;
		prepEl(btn, "button", args);
		setCallback(btn, args, line);

		append(line, lbl, btn);

		return line
	}

	function createImage(args, url) {

		var line = createLine(args),
			img  = new Image;

		img.id = args.id;
		img.src = url;
		img.disabled = args.dis;
		prepEl(img, "image", args, true);

		append(line, img);

		return line
	}

	function createGroup(args, lst, collapsed) {

		var line = createLine(args),
			hdr = createDiv(),
			cb = cbHandler.bind(hdr);

		line.className = collapsed ? "hidden" : args.css || "group";
		line.disabled = args.dis;

		hdr.id = args.id;
		hdr.innerHTML = args.lbl;

		hdr.onclick = function() {

			if (this.disabled)
				return;

			line.className = this.__state ? args.css || "group" : "hidden";
			this.__state = !this.__state;
			cb()
		};

		// allow using space or enter key to toggle group collapse
		hdr.onkeydown = function(e) {

			var key = e.keyCode;

			if (key === 37 || key === 39)
				this.__state = key === 39;

			if ([13, 32, 37, 39].indexOf(key) > -1) {
				e.preventDefault();
				this.dispatchEvent(new MouseEvent("click"))
			}
		};

		hdr.__state = collapsed;

		prepEl(hdr, "group", args);
		setCallback(hdr, args, line);

		// add header to group container
		append(line, hdr);

		// add child controls to group container
		lst.forEach(function(i) {
			me.add(i, line)
		});

		return line
	}

	/*
		Helpers
	 */
	function createDiv() {
		return createEl("div")
	}

	function createLine(args) {
		var line = createDiv();
		line.className = args.css || "line";
		if (!args.show) line.style.display = "none";
		return line
	}

	function createSpan(args, value) {
		var span = createEl("span");
		span.id = args.id + "v";
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

	/*
		Callbacks
	 */
	function cbHandler() {

		var ctrl = this, cb = ctrl.__cb;

		// Update span value based on just value or formatter if any
		if (ctrl.__v)
			setSlider(ctrl, ctrl.value, true);

		// Has a callback?
		if (cb) {

			var v = me.value(ctrl),
				type = ctrl.dataset.type,
				isRadio = type === "radio";

			if (ctrl.__old !== v || type === "button") {

				// throttle callbacks
				clearTimeout(timer);

				// Remove prefix as we want a pure id for other
				// use in enable(), show(), value()...
				var id = ctrl.id.substr(preId.length);

				// Radios get special treatment as each element has an in -
				// we just want the parent control id as that is what we
				// use in enable(), show(), value()...
				if (isRadio)
					id = id.substr(0, id.lastIndexOf("_"));

				// call asynchronously
				timer = setTimeout(
					cb({
						id       : id,
						target   : ctrl,
						type     : ctrl.dataset.type,
						value    : v,
						timestamp: Date.now()
					}), 7);

				// prevent storage of old value with radio as this will
				// block selecting a radio element more than once.
				if (!isRadio)
					ctrl.__old = v;
			}
		}
	}

	function infoHandler() {
		setSlider(this, this.value, true)
	}

	/**
	 * Add a new control to the dashboard panel. The control is defined
	 * by a literal object and the attributes depends on type.
	 *
	 * - `type` can be "slider", "checkbox", "dropdown", "radio", "button", "color", "textbox", "text", "info", "image", "group" and "separator"
	 * - Common attributes are `id`, `label`, `callback`, `css`, `enabled`, `show` and `bind` (the latter may not have effect on some controls).
	 * - Additional attributes for slider: `min`, `max`, `step`, `value`, `formatter`, `live`.
	 * - Additional attributes for checkbox: `checked`
	 * - Additional attributes for dropdown: `items`
	 * - Additional attributes for radio: `group`, `items`
	 * - Additional attributes for button: `text`
	 * - Additional attributes for color: `color`
	 * - Additional attributes for textbox: `text`, `live`, `placeholder`
	 * - Additional attributes for text: `text`, `raw`
	 * - Additional attributes for info: `text`
	 * - Additional attributes for image: `url`
	 * - Additional attributes for group: `items`
	 *
	 * Type separator" is simply a static horizontal ruler with no additional
	 * attributes to be set (style it using css).
	 *
	 * Note that for non-raw text type an id must be explicitly set if
	 * needed (ie. to remove later). An id is never set when in raw mode.
	 *
	 * Binding the control to an JSON object can be done by defining the
	 * `bind` property set to the property name you wish to use. When
	 * an JSON is fed to the bindTo() method the value for it is used
	 * to set the current value of the control.
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
	 * @param {number} [o.value=0] - "slider" / "dropdown" / "radio": initial value
	 * @param {number} [o.step=1] - "slider": step value
	 * @param {function} [o.formatter] - "slider": callback function to format a numerical value into something else (for display only).
	 * @param {boolean} [o.live=false] - "slider" / "textbox": throw event for each character change or per increment (if false only when textbox is blurred/changed)
	 * @param {boolean} [o.checked=false] - "checkbox": initial state
	 * @param {Array} [o.items] - "dropdown" / "slider" / "group" / "radio": array holding strings for each dropdown item. Defaults to the first item in the list.
	 * For "group": define entries in an array as you would for a normal dashboard. These items are appended to the group instead.
	 * For "slider" type this will automatically setup a basic transformation slider.
	 * For "radio" type each item will be the label for each radio button.
	 * @param {string} [o.color] - "color": a valid CSS color value (#rrggbb) or CSS name.
	 * @param {string} [o.text] - "textbox" / "text" / "info" / "button": a string to show - initial text when used with textbox or info - button text when used with a button
	 * @param {string} [o.placeholder] - "textbox": placeholder text for empty text boxes
	 * @param {string} [o.url] - "image": a string containing an URL to the image to be shown
	 * @param {string} [o.bind] - a property name to bind for this control when used with [`bindTo()`]{@link Dashboard#bindTo} and [`getBound()`]{@link Dashboard#getBound}.
	 * @param {string} [o.group] - "radio": a group name for this radio button collection. If none is given an arbitrary name is assigned. Using a custom group name
	 * enables you to spread connected radio buttons across sections (f.ex. using a "separator" between some choices).
	 * @param {boolean} [o.raw=false] - "text": if true the text will be inserted as-is without a paragraph wrapper. HTML allowed.
	 * @param {HTMLElement} [parent] - parent for this entry. Typically used for internal grouping.
	 * @returns {Dashboard}
	 */
	this.add = function(o, parent) {

		function _getParent(p) {
			if (isStr(p)) {
				p = getEl(preId + p) || getEl(p);
				if (p.dataset.type && p.dataset.type === "group")
					p = p.parentNode
			}
			return p
		}

		if (Array.isArray(o)) {
			var me = this;
			o.forEach(function(e) {me.add(e, parent)});
		}
		else {

			count++;

			append(_getParent(parent || db), _getEl({
				id  : preId + (o.id || o.type + count),
				dis : !(isBool(o.enabled) ? o.enabled : true),
				css : o.css,
				show: isBool(o.show) ? o.show : true,
				lbl : o.label || (o.type + count),
				cb  : o.callback || callback,
				bind: o.bind
			}));
		}

		function _getEl(args) {

			var lst,
				v = isDef(o.value) ? o.value : 0,
				txt = o.text || "";

			switch(o.type) {

				case "group":
					return createGroup(args, o.items || [], o.collapsed);

				case "slider":
					if (Array.isArray(lst = o.items)) {
						return createSlider(args, 0, lst.length - 1, 0, 1, o.live, function(v) {return lst[v]})
					}
					else {
						return createSlider(
							args,
							o.min || 0,
							isDef(o.max) ? o.max : 100,
							v,
							o.step || 1,
							o.live,
							o.formatter
						);
					}

				case "checkbox":
					return createCheckbox(args, o.checked);

				case "textbox":
					return createTextbox(args, txt, o.live, o.placeholder);

				case "color":
					return createColor(args, o.color || "#ff0000");

				case "dropdown":
					return createDropdown(args, o.items, v);

				case "radio":
					return createRadio(args, o.group || "radiogrp_" + count, o.items, v);

				case "button":
					return createButton(args, o.text || o.type + count);

				case "separator":
					return createEl("hr");

				case "info":
					return createInfo(args, txt);

				case "text":
					return createText(args, txt, o.raw);

				case "image":
					return createImage(args, o.url);

				default:
					throw "Unknown type"
			}
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

		if (!o || !o.dataset.type) throw "Unknown control";

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
	 * - Groups can be toggled (collapse) using a boolean for value, true is open, false is collapsed
	 * - Radio buttons will return an index, but can be set both with an index and a string value
	 *
	 * If a value is not given the method will return current value in
	 * the same type as given depending on the control type.
	 *
	 * @param {*} id - id string of the control itself (given as id to add()), or provide the element itself
	 * @param {*} [value] - define to set value. The value type depends on the control type.
	 * @returns {*} - if setting it can be chained, otherwise returns current value
	 */
	this.value = function(id, value) {

		var o = isStr(id) ? getEl(preId + id) : id,
			radios, options, i, l;

		if (o && o.dataset.type) {
			if (arguments.length === 2) {
				switch(o.dataset.type) {
					case "slider":
						setSlider(o, value);
						break;
					case "checkbox":
						o.checked = value;
						break;
					case "image":
						o.src = value;
						break;
					case "group":
						o.__state = value;
						o.dispatchEvent(new MouseEvent("click"));
						break;
					case "color":
					case "textbox":
					case "radio":
						radios = radioList(o);
						if (isStr(value)) {
							for(i = 0; i < radios.length; i++) {
								if (radios[i].value === value) {
									radios[i].checked = "checked";
									break
								}
							}
						}
						else
							radios[value].checked = "checked";
						break;
					case "info":
					case "button":
						o.innerHTML = value;
						break;
					case "dropdown":
						if (typeof value === "number") {
							if (value >= 0 && value < o.options.length)
								o.selectedIndex = value
						}
						else if (typeof value === "string") {
							for(i = 0, options = o.options, l = options.length; i < l; i++) {
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
				switch(o.dataset.type) {
					case "slider":
						return +o.value;
					case "checkbox":
						return !!o.checked;
					case "image":
						return o.src;
					case "group":
						return !o.__state;
					case "color":
					case "textbox":
						return o.value;
					case "radio":
						radios = radioList(o.type ? o.parentNode : o);
						for(i = 0; i < radios.length; i++) if (radios[i].checked) return i;
						return -1;
					case "info":
					case "button":
						return o.innerHTML;
					case "dropdown":
						return o.selectedIndex;
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
		var o = isStr(id) ? getEl(preId + id) : id, radios, i;
		if (o && o.dataset.type) {
			if (!state && o.dataset.type === "group") this.value(id, false);

			if (o.dataset.type === "radio") {
				radios = radioList(o);
				for(i = 0; i < radios.length; i++) radios[i].disabled = !state;
			}
			else
				o.disabled = !state;
		}
		return this
	};

	/**
	 * Hide or show a control, or if only state is given the panel itself.
	 *
	 * @param {*} [id] - id as string or the element itself
	 * @param {boolean} state - change the visibility of a control
	 * @returns {Dashboard}
	 */
	this.show = function(id, state) {
		if (arguments.length === 1)
			db.style.display = id ? null : "none";
		else {
			var o = isStr(id) ? getEl(preId + id) : id;
			if (o && o.dataset.type) o.parentNode.style.display = state ? null : "none"
		}
		return this
	};

	/**
	 * Takes a JSON string or a parsed JSON object and tries to bind its
	 * values to the controls who has its bind property set to the same
	 * property name as in the given object.
	 *
	 * @param {*} json - JSON string or object
	 */
	this.bindTo = function(json) {

		if (isStr(json)) json = JSON.parse(json);

		var elements = db.querySelectorAll("*"),
			el, i = 0, t;

		while(el = elements[i++]) {
			if (el.dataset.bind && isDef(json[el.dataset.bind])) {
				if (el.dataset.type === "radio") {
					var radios = radioList(el),
						v = json[el.dataset.bind];
					for(t = 0; t < radios.length; t++) if (radios[t].value === v) {
						radios[t].checked = "checked";
						break;
					}
				}
				else
					this.value(el, json[el.dataset.bind]);
			}
		}
	};

	/**
	 * Returns a JSON object holding the current values of bound controls.
	 * The property names will be that of the bind definition for the
	 * control. If no controls are bound the JSON object will be empty.
	 *
	 * @returns {*} JSON object
	 */
	this.getBound = function() {

		var json = {}, el, i = 0,
			elements = db.querySelectorAll("*");

		while(el = elements[i++]) {
			if (isStr(el.dataset.bind)) {
				if (el.dataset.type === "radio") {
					var radios = radioList(el);
					for(var t = 0; t < radios.length; t++) if (radios[t].checked) {
						json[el.dataset.bind] = radios[t].value;
						break
					}
				}
				else
					json[el.dataset.bind] = this.value(el);
			}
		}

		return json
	};
}