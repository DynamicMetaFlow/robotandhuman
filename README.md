# Robot & Human: A Webcomic

[Robot & Human](https://robotandhuman.neocities.org/) is a JavaScript-powered webcomic.  The strips are stored in a JSON file, and jQuery and CSS are used to display the strips on the page.  (A few PNGs are used for the characters.)

The point of this exercise was to make a webcomic that could work on [NeoCities](https://neocities.org/), a web host with a ~~10~~ ~~20~~ 50 MB storage limit and no support for server-side scripts.

If you like webcomic tools and/or comics about robots and humans, then you should also check out another project of mine, the [Poor Man's Comic Publisher](https://github.com/Triskaideka/comicpub).


## Dependencies

The comics are displayed using [jQuery](http://jquery.com/) and two jQuery plugins, [jCanvas](http://plugins.jquery.com/jcanvas/) (to draw the dialogue tags) and [ScrollTo](http://flesler.blogspot.com/2007/10/jqueryscrollto.html) (for animated scrolling).  These files are all included in this repository.  You could probably use different versions of them if you wanted to.

[Hyphenator.js](https://code.google.com/p/hyphenator/) is optional; you could use a different build, or not use it at all.  But if the characters use long words, you'll probably at least want to hyphenate them manually.

A [Ruby](http://www.ruby-lang.org/) script is run to generate the Atom feed and minify the CSS file.  It requires the [gems](http://rubygems.org/) [CSSminify](https://rubygems.org/gems/cssminify/),  [json-minify](https://rubygems.org/gems/json-minify/), [json_pure](https://rubygems.org/gems/json_pure/), and [tinyatom](https://rubygems.org/gems/tinyatom/).  The gems are of course not included in this repository.
