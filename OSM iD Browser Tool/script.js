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
	var sb, d1, d2, ls_vars; // localStorage vars
	var interval_images; // Interval for CSS images
	var o = {
		sb: [ // Sidebar search field. It is necessary to move this when "opening" tools menu.
			
		],
		iml_types: {
			brightness: 1, // 1 is ignore
			contrast: 1 //
		},
		hotkeys: {
			'a':{id:'hotkey-a', title:'SHIFT+"a": buildings', enabled: true},
			'z':{id:'hotkey-z', title:'SHIFT+"z": brownfield / severe dmg.', enabled: true},
			'x':{id:'hotkey-x', title:'SHIFT+"x": IDP / camps', enabled: true}
		},
		hk_notes: 'NOTE: For hotkeys hold SHIFT plus hotkey to activate. Ensure that CAPS LOCK is turned off. An area must be selected for the hotkey to correctly work. To change an existing area using the hotkeys, the area must first be selected before running the hotkey.',
		exec_choices: [ //0...4
			'Add New Point',
			'Add New Line',
			'Add New Area',
			'Do Nothing',
		]
	}
	
	// Init
	tools_menu_init();
	
	// init_ls_vars
	function init_ls_vars() {
		if (!localStorage[ 'extension_osm_vars' ] || localStorage[ 'extension_osm_vars' ] == 'false') {
			var x = {
				'hotkey-a': true,
				'hotkey-z': true,
				'hotkey-x': true,
				'delay': 80,
				'exec_choice': 2
			};
			localStorage[ 'extension_osm_vars' ] = JSON.stringify(x);
		} else {
		}
		ls_vars = JSON.parse( localStorage[ 'extension_osm_vars' ] );
		// Error check 
		if (!ls_vars.hasOwnProperty('hotkey-a')) {
			ls_vars['hotkey-a'] = true;
		}
		if (!ls_vars.hasOwnProperty('hotkey-z')) {
			ls_vars['hotkey-z'] = true;
		}
		if (!ls_vars.hasOwnProperty('hotkey-x')) {
			ls_vars['hotkey-x'] = true;
		}
		if (!ls_vars.hasOwnProperty('delay')) {
			ls_vars.delay = 80;
		}
		if (!ls_vars.hasOwnProperty('exec_choice')) {
			ls_vars.exec_choice = 2; // Area
		}
		// Update
		localStorage[ 'extension_osm_vars' ] = JSON.stringify(ls_vars);
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
		init_keypress();
		
		var sb = document.getElementById('sidebar'); // Sidebar
		// Div container
		var d1 = document.createElement('div');
		d1.setAttribute('style','border-bottom:1px solid #a2a2a2;');
		sb.insertBefore(d1, sb.firstChild); // Append
		// Open / close button
		var d2 = document.createElement('div'); // "button" causes bad CSS.
		d2.setAttribute('style','width:100%;height:20px;text-align:center;cursor:pointer;font-family:courier;border:1px solid #a2a2a2;background-color:white;');
		d2.innerText = 'TOOLS (A=Building;Z=Brownfield;X=IDP;)';
		d2.is_open = false;
		d1.appendChild(d2);
		d2.addEventListener('click', function(e) {
			console.log(this.is_open);
			if (!this.is_open) {
				this.style.backgroundColor = 'LightGreen !important !important';
				d1b.style.display = 'block';
				this.is_open = true;
				o.sb[1].style.top = '480px';
				o.sb[0].style.top = '460px';
				document.getElementsByClassName('inspector-body')[0].style.top = '520px';
			} else {
				this.style.backgroundColor = 'white !important !important';
				d1b.style.display = 'none';
				this.is_open = false;
				o.sb[1].style.top = '80px';
				o.sb[0].style.top = '60px';
				document.getElementsByClassName('inspector-body')[0].style.top = '120px';
			}
		}, false);
		// Vars container
		var d1b = document.createElement('div');
		d1b.setAttribute('style','border-bottom:1px solid #a2a2a2;display:none;padding:4px 8px;');
		d1.appendChild(d1b);
		
		// Add note
		d1b.appendChild(document.createTextNode(o.hk_notes));
		d1b.appendChild(document.createElement('br'));
		
		// Add hotkeys
		add_hotkeys(d1b);
		
		// Execute after hotkey:
		//
		var a = document.createElement('label');
		a.htmlFor = 'after-hotkey';
		a.innerText = 'Run after hotkey:';
		var inp = document.createElement('select');
		inp.setAttribute('style','float:right;'); //
		inp.id = 'after-hotkey';
		for (var i in o.exec_choices) { // 0,1,2,[3=Do Nothing]
			var op = document.createElement('option');
			op.value = i;
			op.innerText = o.exec_choices[i];
			if (i == ls_vars.exec_choice) {
				op.selected = true;
			}
			inp.appendChild(op);
		}
		inp.addEventListener('change', function(e) {
			init_ls_vars(); // Get fresh
			ls_vars.exec_choice = this.value;
			localStorage[ 'extension_osm_vars' ] = JSON.stringify(ls_vars);
		}, false);
		d1b.appendChild(a);
		d1b.appendChild(inp);
		// br
		var br = document.createElement('br');
		br.setAttribute('style', 'clear:both;');
		d1b.appendChild(br);
		
		// Image levels
		for (var type in o.iml_types) {
			var value = o.iml_types[ type ];
			var a = document.createElement('label');
			a.htmlFor = 'slider-'+type;
			a.innerText = type+'('+value+'):';
			d1b.appendChild(a);
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
				//~ init_ls_vars(); // Write change
				o.iml_types[ this.iml_type ] = this.value;
				//~ localStorage[ 'extension_osm_vars' ] = JSON.stringify(ls_vars);
				init_sliders(); // Re-init
			}, false);
			d1b.appendChild(x);
			x.setAttribute('value', value); // Set value
			// br
			var br = document.createElement('br');
			br.setAttribute('style', 'clear:both;');
			d1b.appendChild(br);
		}
		init_sliders(); // Initial
		
		// Delay
		var a = document.createElement('label');
		a.htmlFor = 'delay-hotkeys';
		a.innerText = 'Hotkey execution delay (milliseconds):';
		//~ a.style['vertical-align'] = '-webkit-baseline-middle';
		var inp = document.createElement('input');
		inp.type = 'number';
		inp.setAttribute('style','padding:0;position:;float:right;width:60px;height:22px;text-align:center;'); //
		inp.value = ls_vars.delay;
		inp.id = 'delay-hotkeys';
		inp.min = 0;
		inp.max = 4000;
		inp.step = 10;
		inp.size = 5; //?
		inp.addEventListener('change', function(e) {
			init_ls_vars(); // Get fresh
			ls_vars.delay = this.value;
			localStorage[ 'extension_osm_vars' ] = JSON.stringify(ls_vars);
		}, false);
		d1b.appendChild(a);
		d1b.appendChild(inp);
		// br
		var br = document.createElement('br');
		br.setAttribute('style', 'clear:both;');
		d1b.appendChild(br);
	}
	// add_hotkeys
	function add_hotkeys(parent) {
		// Loop
		for (var char in o.hotkeys) {
			var obj = o.hotkeys[ char ];
			// Checkbox
			var d = document.createElement('input');
			d.type = 'checkbox';
			d.id = obj.id;
			d.checked = (ls_vars.hasOwnProperty(obj.id) && ls_vars[obj.id]) ? true : false;
			parent.appendChild(d);
			d.addEventListener('click', function(e) {
				init_ls_vars(); // Re-init vars
				if (this.checked) {
					ls_vars[ this.id ] = true;
					localStorage[ 'extension_osm_vars' ] = JSON.stringify(ls_vars);
				} else {
					ls_vars[ this.id ] = false;
					localStorage[ 'extension_osm_vars' ] = JSON.stringify(ls_vars);
				}
			}, false);
			// Label
			var d = document.createElement('label');
			d.innerText = obj.title;
			d.setAttribute('style','cursor:pointer');
			d.htmlFor = obj.id;
			parent.appendChild(d);
			// br
			parent.appendChild(document.createElement('br'));
		}
	}
	// init_slider
	function init_sliders() {
		clearInterval(interval_images); // Clear by default.
		apply_img_filters(); // Call once to update or begin
		for (var type in o.iml_types) {
			if (o.iml_types[ type ] != 1) {
				interval_images = setInterval(apply_img_filters, 1000);
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
	/**
	 * function init_keypress
	 */
	function init_keypress() {
		window.addEventListener('keypress', function(e) {
			var char = e.keyCode;
			//~ console.log(char);
			// Ensure that 
			if (char == 65 && ls_vars[ 'hotkey-a' ]) { // SHIFT + "a"
				if (building_and_next_building()) {
					e.stopPropagation();
					e.preventDefault();
				}
			}
			if (char == 90 && ls_vars[ 'hotkey-z' ]) { // SHIFT + "z"
				if (brownfield(e)) {
					e.stopPropagation();
					e.preventDefault();
				}
			}
			if (char == 88 && ls_vars[ 'hotkey-x' ]) { // SHIFT + "x"
				if (idp(e)) {
					e.stopPropagation();
					e.preventDefault();
				}
			}
		}, false);
	}
	/**
	 * function wait
	 */
	function wait(commands) {
		var timeout = ls_vars.delay.replace(/[^\d]/g,''); // Only digits
		if (!commands.length) return; // Done here.
		console.log(commands[0]);
		if (commands[0] == 'remove-minors') { // Remove any tags that are here, one tag at a time.
			console.log('REMOVE MINORS');
			var x = document.getElementsByClassName('remove minor');
			if (x.length && x.length > 1) { // Remove only up to the ~last tag. If all tags are removed then the area becomes a "line"!
				x[x.length - 1].click();
				setTimeout(function() {
					wait(commands);
				}, timeout);
				return; // Stop here
			} else { // No more tags!
				commands.shift(); // Remove from array
				// Continue execution here.
			}
		}
		if (commands[0] == 'add-btn') {
			var addbtn = document.getElementsByClassName('add-tag')[0];
			addbtn.click();
			commands.shift();//return; // Remove from array
			setTimeout(function() { // Go to next command
				wait(commands);
			}, timeout);
			return;
		}
		var command = commands.shift(); // Get the top command
		//~ if (command.toString().indexOf('spontaneous_camp') != -1) return;
		command(); // Execute
		setTimeout(function() { // Go to next command
			wait(commands);
		}, timeout);
	}
	/**
	 * function go_to_feature()
	 * 
	 * @return True=We are at the feature page. False=Could not get there.
	 */
	function go_to_feature() {
		// Is change feature present?
		//
		//
		//~ var rsbtn = document.getElementsByClassName('preset-list-button preset-reset'); // "Land Use"
		//~ if (!rsbtn || !rsbtn.length) {
			//~ 
		//~ }
		// Click land use then res. area.
			//
			//
			var x = document.getElementsByClassName('preset-list-button'); // "Land Use"
			var lubtn;
			for (var i in x) {
				if (i == 'length') break;
				if (!x[i] || !x[i].getElementsByTagName) continue;
				if (x[i].innerHTML.indexOf('>Land Use<') != -1) {
					lubtn = x[i];
					lubtn.click();
					break;
				}
			}
			var x = document.getElementsByClassName('preset-list-button'); // "Residential Area"
			var rabtn;
			for (var i in x) {
				if (i == 'length') break;
				if (!x[i] || !x[i].getElementsByTagName) continue;
				if (x[i].innerHTML.indexOf('>Residential Area<') != -1) {
					rabtn = x[i];
					rabtn.click();
					break;
				}
			}
			//~ if (!rabtn) return false; // Could not find it.
		return true; // Return true
	}
	/**
	 * function idp
	 * 
	 */
	function idp(event) {
		// Get to feature page
		if (!go_to_feature()) {
			return false; // Exit here.
		}
		
		// INJECT SCRIPT TO ORTHOGONALIZE
		js_append(orth);
		
		// Wait for the elements to appear before continuing.
		// Start @ 1
		var commands = [
			function(){},
			'remove-minors',
			'add-btn',
			// GEN. TO KEEP AS AREA NOT LINE.
			function(){
				// key tag
				var n = 0;
				var a = document.getElementsByClassName('key combobox-input');
				a[n].value = 'landuse';
				a[n].click();a[n].focus();a[n].blur();console.log(a);
			},
			function(){
				// value tag
				var n = 1;
				var b = document.getElementsByClassName('value combobox-input');
				b[n].value = '';
				b[n].click();b[n].focus();b[n].blur();
			},
			'add-btn',
			// idp:camp_site=spontaneous_camp
			function(){
				// key tag
				var n = 1;
				var a = document.getElementsByClassName('key combobox-input');
				a[n].value = 'idp:camp_site';
				a[n].click();a[n].focus();a[n].blur();console.log(a);
			},
			function(){
				// value tag
				var n = 2;
				var b = document.getElementsByClassName('value combobox-input');
				b[n].value = 'spontaneous_camp';
				b[n].click();b[n].focus();b[n].blur();
			},
			'add-btn',
			//damage:event=nepal_earthquake_2015
			function() {
				// key tag
				var n = 2;
				var a = document.getElementsByClassName('key combobox-input');
				a[n].value = 'damage:event';
				a[n].click();a[n].focus();a[n].blur();
			},
			function() {
				// value tag
				var n = 3;
				var b = document.getElementsByClassName('value combobox-input');
				b[n].value = 'nepal_earthquake_2015';
				b[n].click();b[n].focus();b[n].blur();
			},
			'add-btn',
			function() {
				// key tag
				var n = 3;
				var a = document.getElementsByClassName('key combobox-input');
				a[n].value = 'idp:status_20150503';
				a[n].click();a[n].focus();a[n].blur();
			},
			function() {
				// value tag
				var n = 4;
				var b = document.getElementsByClassName('value combobox-input');
				b[n].value = 'new';
				b[n].style.border='6px dashed blue';
				b[n].style.cursor='pointer';
				b[n].click();b[n].focus();b[n].blur();
				
				// ... OLD 1 ...
				// 
				//~ // Add...
				//~ var parent = b[n].parentNode.parentNode; // This is an LI
				//~ // Add a select field, multiple
				//~ var select = document.createElement('select');
				//~ parent.appendChild(select);
				//~ select.setAttribute('style','');
				//~ select.multiple = true;
				//~ select.size = 4;
				//~ select.el_value_tag = b[n];
				//~ var choices = ['','new','increased','decreased','empty'];
				//~ for (var i in choices) {
					//~ var op = document.createElement('option');
					//~ select.appendChild(op)
					//~ op.value = choices[i];
					//~ op.innerText = choices[i];
				//~ }
				//~ select.onchange = function(e) {
					//~ //el_value_tag
					//~ var el = this.el_value_tag;
					//~ el.value = this.value;
					//~ el.focus();el.blur();
				//~ }
				//~ // Add an "okay" button.
				//~ var btn = document.createElement('input');
				//~ parent.appendChild(btn);
				//~ btn.setAttribute('style','display:block;');
				//~ btn.value = 'Okay!';
				//~ btn.onclick = function() {
					//~ // NEW AREA BTN
					//~ document.getElementsByClassName('add-area add-button col4')[0].click();
				//~ }
				
				// ... OLD 2 ...
				// THIS ITERATES THROUGH CHOICES ONCLICK.
				//~ b[n].onclick = function(e) {
					//~ this.style.border='';//console.log('x');
					//~ var choices = ['new','increased','decreased','empty'];
					//~ if (this.value == 'new or increased or decreased or emtpy' || this.value == 'empty') { // first & last
						//~ this.value = 'new';
						//~ this.focus();this.blur();this.focus();
						//~ return;
					//~ }
					//~ else 
					//~ {
						//~ for (var i=0; i<choices.length; i++) {
							//~ if (this.value == choices[i]) {
								//~ this.value = choices[i + 1];
								//~ this.focus();this.blur();this.focus();
								//~ break;
							//~ }
						//~ }
					//~ }
				//~ }
			},
			'add-btn',
			function() {
				// key tag
				var n = 4;
				var a = document.getElementsByClassName('key combobox-input');
				a[n].value = 'idp:source_20150503';
				a[n].click();a[n].focus();a[n].blur();
			},
			function() {
				// value tag
				var n = 5;
				var b = document.getElementsByClassName('value combobox-input');
				b[n].value = 'DigitalGlobe';//brownfield:source_20150503=DigitalGlobe
				b[n].click();b[n].focus();b[n].blur();
			},
			function() {
				// NEW AREA BTN
				var ch;
				switch(ls_vars.exec_choice) {
					case '0':
						ch = 'point';
						break;
					case '1':
						ch = 'line';
						break;
					case '2':
						ch = 'area';
						break;
					case '3':
						return; // Quit here
				}
				var n = document.getElementsByClassName('add-'+ch+' add-button col4');
				if (n && n[0])
					n[0].click();
			}
		];
		
		wait(commands);
		return false;
	};
	/**
	 * function brownfield
	 */
	function brownfield(event) {
		// Get to feature page
		if (!go_to_feature()) {
			return false; // Exit here.
		}
		
		// INJECT SCRIPT TO ORTHOGONALIZE
		js_append(orth);
				
		// Wait for the elements to appear before continuing.
		var commands = [
			function(){},
			'remove-minors',
			'add-btn',
			function() {
				// key tag
				var a = document.getElementsByClassName('key combobox-input');
				a[0].value = 'landuse';//landuse=brownfield
				a[0].click();a[0].focus();a[0].blur();
			},
			function(){
				// value tag
				var b = document.getElementsByClassName('value combobox-input');
				b[1].value = 'brownfield';
				b[1].click();b[1].focus();b[1].blur();
			},
			'add-btn',
			function() {
				// key tag
				var a = document.getElementsByClassName('key combobox-input');
				a[1].value = 'damage:event';//damage:event=nepal_earthquake_2015
				a[1].click();a[1].focus();a[1].blur();
			},
			function() {
				// value tag
				var b = document.getElementsByClassName('value combobox-input');
				b[2].value = 'nepal_earthquake_2015';
				b[2].click();b[2].focus();b[2].blur();
			},
			'add-btn',
			function() {
				// key tag
				var a = document.getElementsByClassName('key combobox-input');
				a[2].value = 'brownfield:source_20150503';
				a[2].click();a[2].focus();a[2].blur();
			},
			function() {
				// value tag
				var b = document.getElementsByClassName('value combobox-input');
				b[3].value = 'DigitalGlobe';//brownfield:source_20150503=DigitalGlobe
				b[3].click();b[3].blur();
				b[3].click();b[3].focus();b[3].blur();
			},
			function() {
				// NEW AREA BTN
				document.getElementsByClassName('add-area add-button col4')[0].click();
			}
		];
		
		wait(commands);
	};
	/**
	 * NOTE: Iterate through page javascript objects:
	 * var arr = window;for (var i in arr) {   var a = JSON.prune(arr[i]); try{var a = a.indexOf('Square the corners');if (a !=-1){ console.log(i);console.log(arr[i]);console.log(a);}}catch(e) {}; }
	 */
	//~ 
	//~ https://github.com/Canop/JSON.prune/blob/master/JSON.prune.js
	function building_and_next_building() {
		// Get to feature page
		if (!go_to_feature()) {
			return false; // Exit here.
		}
		
		// INJECT SCRIPT TO ORTHOGONALIZE
		js_append(orth);
		
		// Wait for the elements to appear before continuing.
		var commands = [
			function(){},
			'remove-minors',
			'add-btn',
			function() {
				// key tag
				var a = document.getElementsByClassName('key combobox-input');
				a[0].value = 'building';
				a[0].click();a[0].focus();a[0].blur();
			},
			function(){
				// value tag
				var b = document.getElementsByClassName('value combobox-input');
				b[1].value = 'yes';
				b[1].click();b[1].focus();b[1].blur();
			},
			function() {
				// NEW AREA BTN
				document.getElementsByClassName('add-area add-button col4')[0].click();
			}
		];
		wait(commands);
	}
	function orth() {
		// GET SELECTED IDS
		var sel = id.selectedIDs(); // Array, e.g. ["w-1"] or ["w-6"]
		// ORTHO
		var a = new iD.operations.Orthogonalize(sel, id); // e.g. Orthogonalize(['w-1'],id);
		a(); // Execute this function.
	}
	function js_append(func) {
		//~ var actualCode = '(' + func + ')();'
		//~ ...
		var code = '(' + func + ')();'
		var script = document.createElement('script');
		script.textContent = code;
		(document.head||document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);
	}
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
