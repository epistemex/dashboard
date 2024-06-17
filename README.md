Dashboard
=========

A tiny solution to quickly build simple control surfaces for demos and similar purposes in a HTML5 browser.

Dashboard was developed for internal needs but is made available as-is for others who would run into similar needs.

![Example](https://i.imgur.com/8Ou8VK1.png)


Features
--------

- Supports **sliders**, **drop-downs**, **checkboxes**, **text boxes**, **custom text**, **color pickers**, **images**, **links**, **buttons** and **radio** buttons.
- Create collapsible **groups** which can be nested.
- Add integrated **custom controls**.
- Automatically handles events, types and values internally - just read the value in the callback.
- Global and local callbacks.
- Values can be read and set programatically.
- Controls can be enabled or disabled.
- Controls can be hidden or shown.
- List and formatting support for slider values (f.ex. converting its numerical value into text etc.)
- JSON binding capability - read and write (or import/export) several values at once.
- Custom IDs with optional global prefix
- Can be designed using CSS as you want, globally or per control
- TAB index support for key navigation (groups can be toggled using space or enter key, or arrow keys)
- Attach controls to a single panel or split between multiple panels
- Small and efficient
- No dependencies


Install
-------

**dashboard** can be installed in various ways:

- Git using HTTPS: `git clone https://github.com/epistemex/dashboard.git`
- Git using SSH: `git clone git@github.com:epistemex/dashboard.git`
- Download [zip archive](https://github.com/epistemex/dashboard/archive/master.zip) and extract.
- [dashboard.min.js](https://raw.githubusercontent.com/epistemex/dashboard/master/dashboard.min.js).


Usage
-----

Create an instance:

	var db = new Dashboard({ callback: commonHandler });
	
Add some controls:

	db.add({type: "slider"  , label: "My Slider", min: 1, max: 256}); 
	db.add({type: "checkbox", label: "My Checkbox", checked: true}); 
	...

Or use an array with definitions:

    db.add([
        {type: "slider"  , label: "My Slider"},
        {type: "checkbox", label: "My Checkbox"}
    ]);

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

You can define custom parent element to attach the controls to. A document
fragment can be used as well for storage and later attached to the DOM.

	var db = new Dashboard({ parent: myParentElement });
    ...

or add individual controls to different panels:

	db.add( {...}, panel1 ); 
	db.add( {...}, panel2 ); 


Groups
------

Groups are straight forward to set up - just make a group type and add
controls to it:

    db.add({type: "group", label: "My group", collapsed: true, items: [
             {type: "slider"  , label: "My Slider", ...},
             {type: "checkbox", label: "My Checkbox", ...}
           ]});

Groups can be enabled and hidden like any other control and allow for
separate CSS styling. Dashboard handles collapse state automatically.


Binding
-------

To bind controls to a JSON object:

	db.add({ ..., bind: "position" }); 
	db.add({ ..., bind: "height" }); 

Now the control is bound to the property `position` in any JSON object given.
To update:

	db.bindTo({ "position": 45, "height": 12 });
	
The sliders will now move to their corresponding values (if within min-max range).

Using:

    var state = db.getBound();

will retrieve current bound values as a JSON object.

See included docs for more details.


Issues and enhancements
-----------------------

See the [issue tracker](https://github.com/epistemex/dashboard/issues) for details.


License
-------

[MIT license](http://choosealicense.com/licenses/mit/).


*&copy; Epistemex 2016-2018, 2024*
 
![Epistemex](https://i.imgur.com/wZSsyt8.png)
