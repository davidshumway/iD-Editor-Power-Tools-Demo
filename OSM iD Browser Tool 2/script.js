function load() {
	var wa = new AllPages();
	switch (wa.helper__location()) {
		case 'openstreetmap':
			wa.openstreetmap(); //start
			break;
		default:
			return;
	}
}
function AllPages(obj_vars) {
}
AllPages.prototype.helper__location = function() {
	var h = document.location.href;
	if (h.indexOf('www.openstreetmap.org/id') != -1) {
		// openstreetmap
		return 'openstreetmap';
	}
}

/**
 * TASKS GO HERE 
 * 
 * - openstreetmap
 * -
 * -
 * -
 */
AllPages.prototype.openstreetmap = function() {
	
	// global scope vars
	var sb // localStorage vars
	var interval_images; // Interval for CSS images
	var o = {
		sb: [ // Sidebar search field. It is necessary to move this when "opening" tools menu.
		],
		iml_types: {
			brightness: 1, // 1 is ignore
			contrast: 1 //
		},
		hotkeys: {
		},
		hk_notes:
			'NOTE 1: For hotkeys hold CTRL plus hotkey to activate (⌘ plus hotkey on Mac). An area must be selected for the hotkey to work correctly. To change an existing area using the hotkeys, the area must be selected first before running the hotkey.'+
			'<br>NOTE 2: For the tags field, enter as many tags as desired. Separate each tag by a new line.'+
			'<br>Area=After hotkey is finished create a new Area.'+
			'<br>Enable=Whether hotkey is enabled or disabled.'+
			'<br>Square=After hotkey is finished square the corners of the area.',
		dv: {
			d1: null,
			d2: null,
			d1b: null
		},
		sidebar: document.getElementById('sidebar'),
		intervals: {
			interval_images: null, // Lighten images ~1 second interval
			interval_images_ms: 500 // Milliseconds
		}
	}
	// init_ls_vars
	function init_ls_vars() {
		if (!localStorage[ 'extension_osm_vars2' ] || localStorage[ 'extension_osm_vars2' ] == 'false' || localStorage[ 'extension_osm_vars2' ] == 'undefined') {
			var x = {
				'M':{ char: 'M', enabled: true, tags: 'buildings=yes', exec_next: true, square: true }
			};
			localStorage[ 'extension_osm_vars2' ] = JSON.stringify(x);
		} else {
		}
		this.valid = function(e) { // return '' on success
			for (var i in e) {
				if 	(
					i.length != 1 || // char length
					!e[i].hasOwnProperty('char') ||
					!e[i].hasOwnProperty('enabled') ||
					!e[i].hasOwnProperty('tags') ||
					!e[i].hasOwnProperty('exec_next') ||
					typeof e[i].char != 'string' ||
					typeof e[i].tags != 'string' ||
					typeof e[i].enabled != 'boolean' ||
					typeof e[i].exec_next != 'boolean' ||
					typeof e[i].square != 'boolean' ||
					e[i].char.length != 1 ||
					e[i].tags.length == 0
					)
				{
					delete e[i];
					continue;
				}
				// Check tags
				var v = e[i].tags;
				v = v.split('\n');
				for (var i in v) {
					var eq = v[i].match(/=/g);
					if (eq == null || eq.length != 1) { // not 1
						delete e[i];
						break;
					}
					var j = v[i].split('=');
					if (j[0].indexOf(' ') != -1) { // key contains ' '
						delete e[i];
						break;
					}
					if (j[0].length > 255) { // key > 255
						delete e[i];
						break;
					}
					if (j[1].length > 255) { // value > 255
						delete e[i];
						break;
					}
					if (j[0].trim().length == 0) {
						delete e[i];
						break;
					}
					if (j[1].trim().length == 0) {
						delete e[i];
						break;
					}
				}
			}
			return e;
		}
		o.hotkeys = this.valid(JSON.parse( localStorage[ 'extension_osm_vars2' ] ));
		// Update
		localStorage[ 'extension_osm_vars2' ] = JSON.stringify(o.hotkeys);
	}
	/**
	 * function tools_menu_init
	 * 
	 * Add a Tools section
	 */
	function tools_menu_init() {
		
		// Sidebar display elements.
		var x = document.getElementById('sidebar');
		x = x.getElementsByClassName('search-header')[0];
		x = x.getElementsByTagName('input')[0];
		o.sb.push(x);
		var x = document.getElementById('sidebar');
		x = x.getElementsByClassName('search-header')[0];
		x = x.getElementsByClassName('icon')[0];
		o.sb.push(x);
		
		// Init localStorage vars
		init_ls_vars();
		
		// Div container
		o.dv.d1 = document.createElement('div');
		o.dv.d1.setAttribute('style','border-bottom:1px solid #a2a2a2;');
		sidebar.insertBefore(o.dv.d1, sidebar.firstChild);
		
		// Open / close button
		o.dv.d2 = document.createElement('div');
		o.dv.d2.setAttribute('style','width:100%;height:20px;text-align:center;cursor:pointer;font-family:courier;border:3px solid #a2a2a2;background-color:white;');
		o.dv.d2.innerText = 'TOOLS (show)';
		o.dv.d2.id = 'id_browser_tools_div';
		o.dv.d2.is_open = false;
		o.dv.d1.appendChild(o.dv.d2);
		o.dv.d2.addEventListener('click', function(e) {
			if (!this.is_open) {
				o.dv.d2.innerText = 'TOOLS (hide)';
				o.dv.d1b.style.display = 'block';
				this.is_open = true;
				o.sb[1].style.top = '580px';
				o.sb[0].style.top = '560px';
				document.getElementsByClassName('inspector-body')[0].style.top = '620px';
			} else {
				o.dv.d2.innerText = 'TOOLS (show)';
				o.dv.d1b.style.display = 'none';
				this.is_open = false;
				o.sb[1].style.top = '80px';
				o.sb[0].style.top = '60px';
				document.getElementsByClassName('inspector-body')[0].style.top = '120px';
			}
		}, false);
		
		// Vars container
		o.dv.d1b = document.createElement('div');
		o.dv.d1b.setAttribute('style','border-bottom:1px solid #a2a2a2;display:none;padding:4px 8px;');
		o.dv.d1.appendChild(o.dv.d1b);
		
		// Add note
		var x = document.createElement('div');
		x.setAttribute('style','border-bottom:1px solid #a2a2a2;background-color:#ace3ef;');
		o.dv.d1b.appendChild(x);
		x.innerHTML = o.hk_notes;
		
		// Add hotkeys
		add_hotkeys(o.dv.d1b);
		
		// Image levels
		for (var type in o.iml_types) {
			var value = o.iml_types[ type ];
			var a = document.createElement('label');
			a.htmlFor = 'slider-'+type;
			a.innerText = type+'('+value+'):';
			o.dv.d1b.appendChild(a);
			var x = document.createElement('input');
			x.label = a; // Set a.input
			x.id = 'slider-'+type;
			x.iml_type = type;
			x.setAttribute('style', 'float:right;');
			x.setAttribute('type', 'range');
			x.setAttribute('defaultValue', 1);
			x.setAttribute('max', 3);
			x.setAttribute('min', 0);
			x.setAttribute('step', 0.2);
			x.addEventListener('change', function(e) {
				this.label.innerText = this.iml_type + '('+this.value+')'; // Update label
				o.iml_types[ this.iml_type ] = this.value;
				init_sliders(); // Re-init
				// If constant
				//~ init_ls_vars(); // Write change
				//~ o.iml_types[ this.iml_type ] = this.value;
				//~ localStorage[ 'extension_osm_vars2' ] = JSON.stringify(ls_vars); // Update
				//~ init_sliders(); // Re-init
			}, false);
			o.dv.d1b.appendChild(x);
			x.setAttribute('value', value); // Set value
			// br
			var br = document.createElement('br');
			br.setAttribute('style', 'clear:both;');
			o.dv.d1b.appendChild(br);
		}
		init_sliders(); // Init
	}
	/**
	 * hk_li
	 * 
	 * e.g. 'm':{ char: 'm', enabled: true, tags: 'buildings=yes', exec_next: true, square: true }
	 */
	var hk_li = function(hotkey, parent_ul) {
		
		hotkey = (hotkey) ? hotkey : {
			char: '',
			enabled: true,
			tags: '',
			exec_next: true,
			square: true
		};
		var rand = Math.random();
		
		function deleteRow() {
			delete o.hotkeys[ this.char ];
			this.parent_ul.render();
		}
		function inpblur() {
			var li = this.li,
				k = li.input_key,
				v = li.input_value,
				p = li.parent_ul;

			k.value = k.value.trim();
			v.value = v.value.trim();
			v.style.height = '31px';
			v.style.position = 'inherit';
			v.style.width = '100%';
			
			k.value = k.value.charAt(0);
			var vl = p.validate(li);
			if (vl == '') {
				o.hotkeys[ k.value ] = li.obj();
				p.render(); // Render
			} else {console.log(vl);
				li.div_notice.style.maxHeight = '100px';
				li.div_notice.style.opacity = '1';
				li.div_notice.innerText = vl;
			}
		}
		function keyfocus() {
			this.style.position = 'absolute';
			this.style.height = '160px';
			this.style.width = '30%';
		}
		function hk_keyup(e) {
			this.value = this.value.toUpperCase();
		}
		
		var l = document.createElement('li'); // LI
		l.className = 'tag-row cf';
		l.hotkey = hotkey;
		l.char = hotkey.char;
		l.parent_ul = parent_ul;
		
		var d = document.createElement('div'); // DIV
		d.className = 'key-wrap';
		d.setAttribute('style','width: 8%;');
		l.appendChild(d);
		var i = document.createElement('input'); // INPUT
		i.setAttribute('style','padding-left: 10px; border: 1px solid #CCC; width:100%;');
		i.className = 'key combobox-input';
		i.maxLength = 1;
		i.value = hotkey.char;
		i.onblur = inpblur;
		i.onkeyup = hk_keyup;
		i.placeholder = 'key';
		i.li = l;
		l.input_key = i;
		d.appendChild(i);
		
		var d = document.createElement('div'); // DIV
		d.className = 'input-wrap-position';
		d.setAttribute('style','width: 30%;');
		l.appendChild(d);
		var i = document.createElement('textarea'); // INPUT
		i.className = 'value combobox-input';
		i.setAttribute('style',
			'border-radius: 0;border: 1px solid #CCC; padding:5px 10px;'+
			'border-width:1px; height:31px; resize:none; overflow:hidden; position:inherit; width:100%; z-index:100;'
		);
		i.value = hotkey.tags;
		i.onblur = inpblur;
		i.onfocus = keyfocus;
		i.placeholder = 'tags';
		i.li = l;
		l.input_value = i;
		d.appendChild(i);
		
		var d = document.createElement('div'); // DIV
		d.className = 'input-wrap-position';
		d.setAttribute('style','width:14%; height:31px; border:1px solid #CCC; padding:0; line-height:1.2em; text-align:center; background-color:#fff;');
		l.appendChild(d);
		var v = document.createElement('label'); // LABEL
		v.setAttribute('style','cursor:pointer;');
		v.htmlFor = 'extcb1'+rand;
		v.innerText = 'Area';
		d.appendChild(v);
		d.appendChild(document.createElement('br')); // BR
		var b = document.createElement('input'); // CHECKBOX
		b.setAttribute('style','height:initial; margin:0; margin-left:35%;');
		b.type = 'checkbox';
		b.checked = hotkey.exec_next;
		b.onclick = inpblur;
		b.id = 'extcb1'+rand;
		l.exec_next = b;
		b.li = l;
		d.appendChild(b);
		
		var d = document.createElement('div'); // DIV
		d.className = 'input-wrap-position';
		d.setAttribute('style','width:14%; height:31px; border:1px solid #CCC; padding:0; line-height:1.2em; text-align:center; background-color:#fff;');
		l.appendChild(d);
		var v = document.createElement('label'); // LABEL
		v.setAttribute('style','cursor:pointer;');
		v.htmlFor = 'extcb2'+rand;
		v.innerText = 'Enable';
		d.appendChild(v);
		d.appendChild(document.createElement('br')); // BR
		var b = document.createElement('input'); // CHECKBOX
		b.setAttribute('style','height:initial; margin:0; margin-left:35%;');
		b.type = 'checkbox';
		b.checked = hotkey.enabled;
		b.onclick = inpblur;
		b.id = 'extcb2'+rand;
		l.isEnabled = b;
		b.li = l;
		d.appendChild(b);
		
		var d = document.createElement('div'); // DIV
		d.className = 'input-wrap-position';
		d.setAttribute('style','width:14%; height:31px; border:1px solid #CCC; padding:0; line-height:1.2em; text-align:center; background-color:#fff;');
		l.appendChild(d);
		var v = document.createElement('label'); // LABEL
		v.setAttribute('style','cursor:pointer;');
		v.htmlFor = 'extcb3'+rand;
		v.innerText = 'Square';
		d.appendChild(v);
		d.appendChild(document.createElement('br')); // BR
		var b = document.createElement('input'); // CHECKBOX
		b.setAttribute('style','height:initial; margin:0; margin-left:35%;');
		b.type = 'checkbox';
		b.checked = hotkey.square;
		b.onclick = inpblur;
		b.id = 'extcb3'+rand;
		l.isSquare = b;
		b.li = l;
		d.appendChild(b);
		
		var b = document.createElement('button'); // BTN
		b.className = 'remove minor';
		b.setAttribute('style','border-top-width:1px;');
		var s = document.createElement('span'); // SPAN
		s.className = 'icon delete';
		b.appendChild(s);
		b.char = hotkey.char;
		b.parent_ul = parent_ul;
		b.onclick = deleteRow;
		l.appendChild(b);
		
		var d = document.createElement('div'); // DIV // NOTICE
		d.className = 'tag-reference-body cf';
		d.setAttribute('style', 'max-height: 0px; opacity: 0; background-color: #cedfdf; border: 1px solid #dc0cca; width: 90%;');
		l.div_notice = d;
		l.appendChild(d);
		
		// function to return object
		l.obj = function() {
			var k = this.input_key,
				v = this.input_value;
			return {
				char: k.value,
				enabled: this.isEnabled.checked,
				tags: v.value,
				exec_next: this.exec_next.checked,
				square: this.isSquare.checked
			};
		}
		
		return l;
	}
	/**
	 * function add_hotkeys
	 */
	function add_hotkeys(parent) {
		var c = document.createElement('ul');
		c.className = 'tag-list';
		parent.appendChild(c);
		
		// Sort keys
		c.sortKeys = function() {
			var keys = Object.keys(o.hotkeys),
				sorted = {};
			keys.sort();
			for (var i=0; i<keys.length; i++)
			{
				var k = keys[i];
				sorted[ k ] = o.hotkeys[ k ];
			}
			o.hotkeys = sorted;
		}
		c.render = function() {
			this.sortKeys(); // Sort
			// Clear
			this.innerHTML = ''; // `this` is UL
			var li;
			// Loop add LIs
			for (var char in o.hotkeys) {
				var obj = o.hotkeys[ char ];
				li = new hk_li(obj, this);
				this.appendChild(li);
			}
			if (li)
				li.focus();
			this.save();
		}
		c.save = function() {
			// Remove
			var x = this.getElementsByTagName('li');
			for (var i = x.length-1; i>=0 ; i--) {
				var li = x[i];
				if (this.validate(li) != '') {
					this.removeChild(x[i]);
				}
			}
			o.hotkeys = {};
			// Save
			var x = this.getElementsByTagName('li');
			for (var i = x.length-1; i>=0 ; i--) {
				var li = x[i];
				var hk = li.obj();
				o.hotkeys[ hk.char ] = hk;
			}
			this.ls(); // localStorage
			this.add_to_page() // add to page JS
		}
		c.add_to_page = function() {
			// Always add keypress to page here.
			// It will only add to `document` in the case that search
			// input is missing.
			// NOTE: `preset-search-input` appears to always be on page after first initialization. HOWEVER, after
			// testing it appears to leave the page and come back!
			p_init_hotkeys();
			
			// TARGET IS target: input.preset-search-input
			
			return;
			// DEBUG
			// This fires each time a new area is created and the search input is autofocused. However, the parentNode is also removed.
			// So this is temporary. However, `parentNode.parentNode` is constant. `parentNode.parentNode` fires three times `DOMNodeRemoved`
			// events when search input is autofocused!
			// A = `parentNode.parentNode` is document.getElementsByClassName('preset-list-pane pane')[0].
			// `A` does not exist on page init. `A`.parentNode=`B`=document.getElementsByClassName('panewrap')[0];
			// `B` does not exist on page init. `B`.parentNode=`C`=document.getElementsByClassName('inspector-wrap')[0];
			// `C` does exist on page init (document.getElementsByClassName('inspector-wrap')[0]).
			//
			// document.getElementsByClassName('preset-search-input')[0].parentNode.addEventListener('DOMNodeRemoved',function() {alert('x');}, false);
			//
			//
			//~ 
			//~ var last = 0;
			//~ setInterval(function() {
				//~ var x = document.getElementsByClassName('preset-search-input');
				//~ if (x && x[0] && last == 0) {
					//~ last = 1;
					//~ console.log('`preset-search-input` exists!');
					//~ p_init_hotkeys();// Add keypress to page
				//~ } else if ((!x || !x[0]) && last == 1) {
					//~ last = 0;
					//~ console.log('`preset-search-input` is gone!');
				//~ }
			//~ }, o.intervals.add_to_page_interval_ms);
			//return;
			//~ 
			//~ // And for search input...
			//~ //
			//~ //
			//~ console.log('o.intervals.add_to_page_interval is:'); // Debug
			//~ console.log(o.intervals.add_to_page_interval);
			//~ var x = document.getElementsByClassName('preset-search-input');
			//~ if (x && x[0]) {
				//~ console.log('`preset-search-input` exists!');
				//~ if (o.intervals.add_to_page_interval)
					//~ clearInterval(o.intervals.add_to_page_interval);// Clear
				//~ // Old
				//p_init_preset();// Add preset list to page
			//~ } else {
				//~ // There is only one interval waiting to add to page. If
				//~ // the add_to_page function is called again by a user then
				//~ // it will overwrite this interval.
				//~ o.intervals.add_to_page_interval = setInterval(function() {
					//~ var x = document.getElementsByClassName('preset-search-input');
					//~ if (x && x[0]) {
						//~ console.log('`preset-search-input` exists!');
						//~ clearInterval(o.intervals.add_to_page_interval);
						//~ p_init_hotkeys();// Add keypress to page
					//~ }
				//~ }, o.intervals.add_to_page_interval_ms);
				//~ 
				//~ console.log('o.intervals.add_to_page_interval is (now):'); // Debug
				//~ console.log(o.intervals.add_to_page_interval);
			//~ }
		}
		c.ls = function() {
			// Update
			localStorage[ 'extension_osm_vars2' ] = JSON.stringify(o.hotkeys);
		}
		c.validate = function(li) {
			var v = li.input_value,
				k = li.input_key,
				p = li.parent_ul;
			if (k.value == '') {
				if (li.char != '' && o.hotkeys.hasOwnProperty(li.char))
					delete o.hotkeys[ li.char ];
				p.render();
				return;
			}
			if (v.value == '') return ''; //'Tag is empty!';
			v = v.value.trim().split('\n');
			for (var i in v) {
				var eq = v[i].match(/=/g);
				if (eq == null) {
					return 'One or more tags entered do not contain the "=" symbol!';
				}
				if (eq.length != 1) {
					return 'One or more tags entered contain more than one "=" symbol!';
				}
				var j = v[i].split('=');
				if (j[0].indexOf(' ') != -1) {
					return 'One or more tag keys entered contain a space character!'
				}
				if (j[0].length > 255) {
					return 'One or more tag keys entered have a length greater than 255 characters!'
				}
				if (j[1].length > 255) {
					return 'One or more tags entered have a length greater than 255 characters!'
				}
				if (j[0].trim().length == 0) {
					return 'One or more tag keys entered have a length equal to 0 characters!'
				}
				if (j[1].trim().length == 0) {
					return 'One or more tags entered have a length equal to 0 characters!'
				}
			}
			return '';
		}
		c.emptyRows = function() {
			var rows = this.getElementsByTagName('li');
			for (var i = rows.length-1; i>0; i--) {
				var row = rows[i];
				if (row.input_key.value.trim() == '' && row.input_value.value.trim() == '') {
					this.deleteRow(row);
				}
			}
		}
		c.deleteRow = function(row) {
			delete o.hotkeys[ row.char ];
			parent_ul.render();
		}
		c.addRow = function() {
			var p = this.parent_ul;
			p.emptyRows();
			var li = new hk_li(false, p);
			p.appendChild(li);
			li.input_key.focus();
		}
		// Render
		c.render();
		
		// Add btn
		var b = document.createElement('button'); // BTN
		b.className = 'add-tag';
		b.setAttribute('style','width:40%; height:30px; background-color:rgba(0,0,0,0.5); margin-top:-8px;');
		var s = document.createElement('span'); // SPAN
		s.className = 'icon plus light';
		b.appendChild(s);
		b.parent_ul = c;
		b.onclick = c.addRow;
		parent.appendChild(b);
		var b = document.createElement('div'); // DIV CLEAR
		b.className = 'tag-reference-body cf';
		b.setAttribute('style','max-height:0; opacity:0;');
		parent.appendChild(b);
	}
	// init_slider
	function init_sliders() {
		if (o.intervals.interval_images) // Not null
			clearInterval(o.intervals.interval_images); // Always clear
		apply_img_filters(); // Call once to update or begin
		for (var type in o.iml_types) {
			if (o.iml_types[ type ] != 1) {
				o.intervals.interval_images = setInterval(apply_img_filters, o.intervals.interval_images_ms);
				break;
			}
		}
	}
	// apply_img_filters
	function apply_img_filters() {
		var filter = '';
		for (var type in o.iml_types) {
			var value = o.iml_types[ type ];
			filter += type+'('+value+') '; // e.g. "brightness(2) contrast(1)"
		}
		filter = filter.trim();
		var images = document.getElementsByClassName('tile tile-loaded');
		for (var i in images) {
			if (i == 'length') break;
			images[ i ].style["-webkit-filter"] = filter;
		}
	}
	function js_append(func, values) {
		// ...
		var code = '(' + func + ')('+values+');'
		var script = document.createElement('script');
		script.textContent = code;
		(document.head||document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);
	}
	// Add functions
	function p_init() {
		js_append(page__add_functions);
	}
	// Add functions
	function p_init_si_hotkeys() {
		js_append(page__si_hotkeys);
	}
	// Add hotkeys
	// 
	function p_init_hotkeys() {
		js_append(page__hotkeys, JSON.stringify(o.hotkeys));
	}
	
	// Add hotkeys to search input. Does not remove hotkeys.
	function page__si_hotkeys() {
		//~ console.log('Run page__si_hotkeys()');
		if (!id.hasOwnProperty('id_browser_tool_hotkeys')) return;// Stop
		if (!id.hasOwnProperty('id_browser_tool_hotkeys_f')) return;// Stop
		if (!id.id_browser_tool_hotkeys_f.hasOwnProperty('bToolChangeTags')) return;// Stop
		var startTime = new Date().getTime(); // Millisec.
		var intv = setInterval(// Pauses to let element appear.
			function() {
				var si = document.getElementsByClassName('preset-search-input');
				if (!si || !si[0]) {
					if (new Date().getTime() - startTime >= 1000) { // Has too much time elapsed? Say, 1.0 seconds. This ought to never occur.
						clearInterval(intv);
						console.log('page__si_hotkeys(): Giving up!');
					}
					return; // Stop
				}
				clearInterval(intv); // Clear
				si = si[0];
				
				var c = 0;
				for (var hk in id.id_browser_tool_hotkeys) {
					var kb =
						d3.
						keybinding('osm_browser_tool_tags' + c). // keybinding( INDEX )
						on(
							iD.ui.cmd('⌘' + hk),
							id.id_browser_tool_hotkeys_f.bToolChangeTags
						)
						d3.select(si).call(kb);
					c++;
				}
			},
			60
		);
	}
	// e.g. new iD.actions.ChangeTags('w-1', {'building':'yes'})(id.graph()) ;
	function page__hotkeys(hotkeys_obj) {
		
		var context = id;
		var si = document.getElementsByClassName('preset-search-input')[0];
		
		// Check obj. Set hotkeys_obj.
		hotkeys_obj = id.id_browser_tool_hotkeys_f.bToolChangeTags_valid(hotkeys_obj);
		
		// Set id_browser_tool_hotkeys.hotkeys_obj
		// object. Latest set of hotkeys.
		context.id_browser_tool_hotkeys = hotkeys_obj;
		
		// Reset any indices, up to 200.
		// Assuming users will not have more than 200 unique keys bound.
		for (var i=0; i<200; i++) {
			var kb =
				d3.
				keybinding('osm_browser_tool_tags' + i); // keybinding( INDEX )
			d3.select(document).call(kb);
			if (si)
				d3.select(si).call(kb);
		}
		// Loop current hotkeys
		// TODO: SHIFT = expect(iD.ui.cmd('⇧a')).to.eql('Shift+a');
		var c = 0;
		for (var hk in hotkeys_obj) {
			var kb =
				d3.
				keybinding('osm_browser_tool_tags' + c). // keybinding( INDEX )
				on(
					iD.ui.cmd('⌘' + hk),
					id.id_browser_tool_hotkeys_f.bToolChangeTags
					//~ bToolChangeTags // old
				)
			d3.select(document).call(kb);
			if (si)
				d3.select(si).call(kb);
			c++;
		}
	}
	function page__add_functions() {
		id.id_browser_tool_hotkeys_f = {
			bToolChangeTags_valid: function() {},
			bToolChangeTags: function() {}
		};
		/**
		 * bToolChangeTags_valid
		 * e.g. 'm':{ char: 'm', enabled: true, tags: 'buildings=yes', exec_next: true, square: true }
		 */
		id.id_browser_tool_hotkeys_f.bToolChangeTags = function(e) {
			
			if (!this.event.ctrlKey && !this.event.metaKey) return; // Must be CTRL.
			
			var context = id;
			var char = String.fromCharCode(this.event.keyCode); //console.log(char);
			var hk_obj = id.id_browser_tool_hotkeys;
			if (!hk_obj.hasOwnProperty( char )) {
				return;
			}
			hk_obj = hk_obj[ char ];
			
			// Enabled?
			if (!hk_obj.enabled) return;
			
			var actions = [];
			var addTags = {}; // e.g. { building: 'yes' };
			var tmptags = hk_obj.tags.split('\n');
			
			// Set addTags
			for (var i in tmptags) {
				var tag = tmptags[i].split('=');
				addTags[ tag[0] ] = tag[1];
			}
			
			var entities =
				_.filter(
					_.map(
						context.selectedIDs(),
						context.entity
					),
					function(entity) { // Point or line or area. Select line & area.
						//~ console.log(entity.geometry(context.graph()));
						//~ console.log(entity.geometry(context.graph()) === 'area');
						var t = entity.geometry(context.graph());
						return  (t === 'area' || t === 'line');
					}
				);
			_.each(
				entities,
				function(entity) {
					var newTags = addTags;
					actions.push(
						iD.actions.ChangeTags(
							entity.id,
							newTags
						)
					);
					if (hk_obj.square) {
						actions.push(
							iD.actions.Orthogonalize(entity.id, context.projection)
						);
						//~ new iD.operations.Orthogonalize([entity.id], id); // This works.
						//~ actions.push( //new iD.operations.Orthogonalize(sel, id); // This breaks.
							//~ iD.operations.Orthogonalize(
								//~ [entity.id],
								//~ id
							//~ )
						//~ );
					}
				}
			);
			if (actions.length) {
				actions.push(
					t('operations.change_tags.annotation')
				);
				context.perform.apply(
					context,
					actions
				);
				if (hk_obj.exec_next) { // Next?
					if (document.getElementsByClassName('add-area add-button col4').length)
						document.getElementsByClassName('add-area add-button col4')[0].click();
				}
			}
		}
		/**
		 * bToolChangeTags_valid
		 */
		id.id_browser_tool_hotkeys_f.bToolChangeTags_valid = function(e) {
		//~ function bToolChangeTags_valid(e) {
		
			for (var i in e) {
				if 	(
					i.length != 1 || // char length
					!e[i].hasOwnProperty('char') ||
					!e[i].hasOwnProperty('enabled') ||
					!e[i].hasOwnProperty('tags') ||
					!e[i].hasOwnProperty('exec_next') ||
					typeof e[i].char != 'string' ||
					typeof e[i].tags != 'string' ||
					typeof e[i].enabled != 'boolean' ||
					typeof e[i].exec_next != 'boolean' ||
					typeof e[i].square != 'boolean' ||
					e[i].char.length != 1 ||
					e[i].tags.length == 0
					)
				{
					delete e[i];
					continue;
				}
				// Check tags
				var v = e[i].tags;
				v = v.split('\n');
				for (var i in v) {
					var eq = v[i].match(/=/g);
					if (eq == null || eq.length != 1) { // not 1
						delete e[i];
						break;
					}
					var j = v[i].split('=');
					if (j[0].indexOf(' ') != -1) { // key contains ' '
						delete e[i];
						break;
					}
					if (j[0].length > 255) { // key > 255
						delete e[i];
						break;
					}
					if (j[1].length > 255) { // value > 255
						delete e[i];
						break;
					}
					if (j[0].trim().length == 0) {
						delete e[i];
						break;
					}
					if (j[1].trim().length == 0) {
						delete e[i];
						break;
					}
				}
			}
			return e;
		}
	}
	/**
	 * page_init
	 */
	function page_init() {
		p_init(); // Adds functions
		document.getElementsByClassName('inspector-wrap')[0].addEventListener(
			'DOMNodeInserted',
			function(e) {
				if (e.target.toString() == '[object HTMLInputElement]' && e.target.parentNode.className == 'search-header') {
					// Call once again d3.keybinding
					p_init_si_hotkeys();
				}
			}, false
		);
	}
	
	// Adds initial to page.
	page_init();
	
	// Initialize tools.
	tools_menu_init();
}

/**
 * RUN DOCUMENT
 *
 * 
 * 
 * 
 * 
 * 
 *  
**/
var ih;
if (document.readyState == "complete" || document.readyState == "interactive") {
	ih = document.body.innerHTML;
	load();
}
else {
	document.onreadystatechange = function () {
		if (document.readyState == "complete" || document.readyState == "interactive") {
			ih = document.body.innerHTML;
			load();
		}
	}
}
