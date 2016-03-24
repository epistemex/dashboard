﻿Dashboard
=========

A tiny solution to quickly build simple control surfaces for demos and 
similar purposes using HTML5.

This was developed for internal needs but is made available as-is for
others who would run into similar needs.

**[Example demo](http://epistemex.github.io/dashboard/)**

![Example](http://i.imgur.com/vgn7Bv8.png)


Features
--------

- Build sliders, drop-downs, checkboxes, text-boxes, custom text, images and buttons (no radios for now)
- Interconnects events and handles all controls for you - just read the value in your callback
- Values can be set manually, and controls can be enabled or disabled.
- Slider supports value transformation (f.ex. converting its value into text etc.)
- Binding capability - can be bound to JSON objects to set values of controls at once
- Produces standard HTML
- Can be dressed with CSS as you want


Install
-------

**dashboard** can be installed in various ways:

- Git using HTTPS: `git clone https://github.com/epistemex/dashboard.git`
- Git using SSH: `git clone git@github.com:epistemex/dashboard.git`
- Download [zip archive](https://github.com/epistemex/dashboard/archive/master.zip) and extract.
- [dashboard.min.js](https://raw.githubusercontent.com/epistemex/dashboard/master/dashboard.min.js)

	
Usage
-----

Create an instance:

	var db = new Dashboard({callback: commonHandler});
	
Add some controls:

	db.add({type: "slider", label: "My Slider", min: 1, max: 256}); 
	db.add({type: "checkbox", label: "My Checkbox", checked: true}); 
	...
	
Add to page:

	db.show();

Receive changes:

    function commonHandler(e) {
		// e.id
		// e.type
		// e.value
		// e.target
    }

The rest is taken care of automatically including updating the control's
value box etc.

A specific handler can be defined per control which overrides the global 
handler if any:

	db.add({..., callback: myHandler}); 

Binding
-------

To bind controls to a JSON object:

	db.add({..., bind: "position"}); 
	db.add({..., bind: "height"}); 

Now the control is bound to the property `position` in any JSON object given.
To update:

	db.bindTo({"position": 45, "height": 12});
	
The sliders will now move to their corresponding values (if within min-max range).

See included docs for more details.


Issues and enhancements
-----------------------

See the [issue tracker](https://github.com/epistemex/dashboard/issues) for details.


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; Epistemex 2016*
 
![Epistemex](http://i.imgur.com/wZSsyt8.png)
