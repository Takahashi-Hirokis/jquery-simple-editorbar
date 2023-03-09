/**
 * jQuery simple-EditorBar plugin
 *
 * This is a Simple Multi Tool Bar for ContentEditable-HTML in jQuery
 *
 * @author Hiroki Takahashi
 * @requires jQuery version 1.7.1 or later
 *
 */

$.fn.toolbar = function (options) {
	// Default options
	options = $.extend(
		{
			fontSize       : this.attr("fontSize")        || false,
			fontColor      : this.attr("fontColor")       || false,
			backgroundColor: this.attr("backgroundColor") || false,
			fontWeight     : this.attr("fontWeight")      || false,
			strikeThrough  : this.attr("strikeThrough")   || false,
			alignLeft      : this.attr("alignLeft")       || false,
			alignCenter    : this.attr("alignCenter")     || false,
			hyperLink      : this.attr("hyperLink")       || false,
			update         : this.attr("update")          || null,
		},
		options || {}
	);

	// Custom options for the tool buttons
	const docCommand = {
		fontSize: {
			display: options.fontSize       && true,
			type   : "select",
			field  : options.fontSize.field || "font-size-select",
			def    : options.fontSize.def   || "13,16,18,20,24",
			input  : null,
			html   : "span",
			node   : "surround",
			attr   : options.fontSize.attr  || null,
			style  : options.fontSize.style ||
			function () {
				return `font-size: ${this.input}`;
			},
		},

		fontColor: {
			display: options.fontColor       && true,
			type   : "value",
			field  : options.fontColor.field || "font-color-input",
			def    : options.fontColor.def   || "#4A4A4A",
			input  : null,
			html   : "span",
			node   : "surround",
			attr   : options.fontColor.attr  || null,
			style  : options.fontColor.style ||
			function () {
				return `color: ${this.input}`;
			},
		},

		backgroundColor: {
			display: options.backgroundColor       && true,
			type   : "value",
			field  : options.backgroundColor.field || "bg-color-input",
			def    : options.backgroundColor.def   || "#FFFFFF",
			input  : null,
			html   : "span",
			node   : "surround",
			attr   : options.backgroundColor.attr  || null,
			style  : options.backgroundColor.style ||
			function () {
				return `background-color: ${this.input}; padding: 0.1rem 0.8rem`;
			},
		},

		fontWeight: {
			display: options.fontWeight      && true,
			type   : false,
			field  : null,
			def    : null,
			input  : null,
			html   : "span",
			node   : "surround",
			attr   : options.fontWeight.attr  || null,
			style  : options.fontWeight.style || "font-weight: bold",
		},

		strikeThrough: {
			display: options.strikeThrough       && true,
			type   : false,
			field  : null,
			def    : null,
			input  : null,
			html   : "span",
			node   : "surround",
			attr   : options.strikeThrough.attr  || null,
			style  : options.strikeThrough.style || "text-decoration: line-through",
		},

		alignLeft: {
			display: options.alignLeft       && true,
			type   : false,
			field  : null,
			def    : null,
			input  : null,
			html   : "div",
			node   : "surround",
			attr   : options.alignLeft.attr  || null,
			style  : options.alignLeft.style || "text-align: left",
		},

		alignCenter: {
			display: options.alignCenter       && true,
			type   : false,
			field  : null,
			def    : null,
			input  : null,
			html   : "div",
			node   : "surround",
			attr   : options.alignCenter.attr  || null,
			style  : options.alignCenter.style || "text-align: center",
		},

		hyperLink: {
			display: options.hyperLink       && true,
			type   : "drop",
			field  : options.hyperLink.field || "link-input",
			def    : options.hyperLink.def   || null,
			input  : null,
			html   : "a",
			node   : "surround",
			attr   : options.hyperLink.attr  ||
			function () {
				return {href: this.input}
			},
			style  : options.hyperLink.style || null,
		},
	};

	const toolbarContainer = $("<div class='tool-bar' />");

	const buttonFlame = "<div class='tool-bar-btn' />";

	const dropDownFlame = "<input type='checkbox' id='dd-link' class='drop-down'><label for='dd-link' class='dd-label'></label>";

	const buttonTemplates = {
		fontSize       : $("<button type='button' class='font-size' data-alias='fontSize'><i></i></button>"),
		fontColor      : $("<button type='button' class='font-color' data-alias='fontColor'><i></i></button>"),
		backgroundColor: $("<button type='button' class='background-color' data-alias='backgroundColor'><i></i></button>"),
		fontWeight     : $("<button type='button' class='font-weight' data-alias='fontWeight'><i></i></button>"),
		strikeThrough  : $("<button type='button' class='strike-through' data-alias='strikeThrough'><i></i></button>"),
		alignLeft      : $("<button type='button' class='align-left' data-alias='alignLeft'><i></i></button>"),
		alignCenter    : $("<button type='button' class='align-center' data-alias='alignCenter'><i></i></button>"),
		hyperLink      : $("<button type='button' class='hyper-link' data-alias='hyperLink'><i></i></button>"),
	};

	const inputTemplates = {
		fontSize       : $(`<select class='${docCommand.fontSize.field}'>`),
		fontColor      : $(`<input type='color' class='${docCommand.fontColor.field}'>`),
		backgroundColor: $(`<input type='color' class='${docCommand.backgroundColor.field}'>`),
		fontWeight     : null,
		strikeThrough  : null,
		alignLeft      : null,
		alignCenter    : null,
		hyperLink      : $(`${dropDownFlame}<div class='dd-bar'>URL<input type='url' class='${docCommand.hyperLink.field}'></div>`),
	};

	/**
	 * Surrounds the selected content with HTML tags
	 *
	 * @param {object} nodeObj - The options of surrounding HTML.
	 *
	 */
	const _surroundNode = function(nodeObj) {
		const select = window.getSelection();

		// Guard the following flow if there is no selection
		if (!select || String(select).length === 0) return;

		const range = select.getRangeAt(0);
		const html = $(range.startContainer.parentElement);

		if (html[0].contentEditable) {
			const node = document.createElement(nodeObj.html);

			// Set property to element
			const attr = typeof nodeObj.attr === 'function' ? nodeObj.attr() : nodeObj.attr;
			if (attr && Object.keys(attr).length) {
				for (let key in attr) {
					node.setAttribute(key, attr[key]);
				}
			}

			// set css to element
			const style = typeof nodeObj.style === 'function' ? nodeObj.style() : nodeObj.style;
			if (style && style.length) {
				node.setAttribute("style", style);
			}

			// Delete elements in a selected range before insert HTML
			node.appendChild(range.extractContents());

			range.insertNode(node);
		}
	}

	/**
	 * Inserts the HTML element at selected position.
	 *
	 * @param {object} nodeObj - The options of inserting HTML.
	 *
	 */
	const _insertNode = function(nodeObj) {
		const select = window.getSelection();

		const range = select.getRangeAt(0);
		const html = $(range.startContainer.parentElement);

		if (html[0].contentEditable) {
			const node = document.createElement(nodeObj.html);

			// Set property to element
			const attr = typeof nodeObj.attr === 'function' ? nodeObj.attr() : nodeObj.attr;
			if (attr && Object.keys(attr).length) {
				for (let key in attr) {
					node.setAttribute(key, attr[key]);
				}
			}

			// set css to element
			const style = typeof nodeObj.style === 'function' ? nodeObj.style() : nodeObj.style;
			if (style && style.length) {
				node.setAttribute("style", style);
			}

			// Delete elements in a selected range before insert HTML
			range.deleteContents();

			range.insertNode(node);

			// Move cursors position to the end of inserted HTML element
			select.collapseToEnd();
		}
	}

	/**
	 * Callback for after updates.
	 *
	 * @callback options.update
	 */

	/**
	 * Triggers the event if it is valid.
	 *
	 * @param {options.update} callback - A callback to run.
	 *
	 */
	const _trigger = function(callback) {
		if (callback !== null) {
			callback();
		}
	}

	// Build tool buttons
	for (let key in docCommand) {
		if (!docCommand[key].display) continue;

		const $template = $(buttonFlame);
		$template.append($(buttonTemplates[key]));

		// Set the property value
		if (docCommand[key].type) {
			const def = docCommand[key].def;

			if (docCommand[key].type === "value") {
				$(inputTemplates[key]).val(def);
			} else if (docCommand[key].type === "select") {

				// Remove all spaces in a string
				def.replaceAll(" ", "");

				// Convert to an array
				const optionValue = def.split(",");

				// Append options to select box
				for (let value of optionValue) {
					$(inputTemplates[key]).append($(`<option value='${value}'>${value}</option>`));
				}
			}

			$template.append($(inputTemplates[key]));
		}

		toolbarContainer.append($template);
	}
	// Append buttons to given area
	$(this).append(toolbarContainer);

	// Execute function edit buttons
	$(".tool-bar-btn > button").on("click", function () {
		const data = $(this).data('alias');
		const input = $(`.${docCommand[data]['field']}`).val();

		docCommand[data]['input'] = input;

		if (docCommand[data]['node'] === "surround") {
			_surroundNode(docCommand[data]);
		}

		if (docCommand[data]['node'] === "insert") {
			_insertNode(docCommand[data]);
		}

		// Update events is triggered
		_trigger(options.update);
	});
};
