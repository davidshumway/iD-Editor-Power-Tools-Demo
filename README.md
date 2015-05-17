# OSM-iD-Browser-Tools
For the iD editor on openstreetmap.org. Adds hotkeys for tagging areas. Adds brightness & contrast tool for satellite imagery. Adds a few other productivity tools.

TODO: Additional image filters.

UPDATE: v 1.30: May 16, 2015: Add ability to hotkey non-CTRL/⌘ keys (key only, no CTRL).

UPDATE: v 1.24: May 16, 2015: Intitial tag fixed to "building=yes" from typo "buildings=yes". 

UPDATE: v 1.23: May 16, 2015: Add "line" to list of allowed entities rather than just "area". Still exclude "point" entity.

UPDATE: v 1.22: May 16, 2015: Example hotkey is now uppercase "M" rather than lowercase "m".

UPDATE: v 1.20: May 16, 2015: Avoid emulating user actions for the most part. Apply tags with e.g. https://gist.github.com/bhousel/0af881a621a2efb83719. Update layout. Allow hotkey modification. Switch from SHIFT to CTRL/META. Override input.preset-search-input event.keypress when necessary.

UPDATE: v 1.11: May 12, 2015: Fixed where hotkey was not working because `A` element was toggled hidden. Fixed .replace of an integer.
