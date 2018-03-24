# Stuff I learned

* How to use async/await
* Setting up authentication and sessions with Passport et al.
* Learned how cookies _really_ work, and how to send and store them with cURL
* There's a `~/.curlrc` and you terminate output with a newline by adding  `-w \n` to it
* `cURL` got it's name from "see URL"

# Mistakes I made down the road

* Spent ages figuring out why `this` was an empty object for the mongoose `pre` hook: turns out I was using `=>` which uses lexical scoping (d'oh!)
* Kept getting an empty object as a response; turns out Express can't send JavaScript errors. Sending `err.message` works though.
* Took a while to figure out why body-parser wasn't working; I did `app.use('/api', routes)` _before_ configuring my app (big no-no)
