# Mistakes I made down the road

* Spent ages figuring out why `this` was an empty object for the mongoose `pre` hook: turns out I was using `=>` which uses lexical scoping (d'oh!)
* Kept getting an empty object as a response; turns out Express can't send JavaScript errors. Sending `err.message` works though.
