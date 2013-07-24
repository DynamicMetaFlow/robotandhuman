# Robot & Human: A Webcomic

[Robot & Human](http://robotandhuman.neocities.org/) is a JavaScript-powered webcomic.  Each strip is stored in a JSON file, and jQuery and CSS are used to display the strips on the page.  (A few PNGs are used for the characters.)

The point of this exercise was to make a webcomic that could work on [NeoCities](http://neocities.org/), a web host with a 20 MB storage limit and no support for server-side scripts.  The reason everything is in one directory is because NeoCities doesn't (at this time) allow you to create subdirectories.

If you like webcomic tools and/or comics about robots and humans, then you should also check out another project of mine, the [Poor Man's Comic Publisher](https://github.com/Triskaideka/comicpub).


## Dependencies

The comics are displayed using [jQuery](http://jquery.com/) and two jQuery plugins, [jCanvas](http://plugins.jquery.com/jcanvas/) (to draw the dialogue tags) and [ScrollTo](http://flesler.blogspot.com/2007/10/jqueryscrollto.html) (for animated scrolling).  These files are all included in this repository.  You could probably use different versions of them if you wanted to.

The Atom feed is generated using a [Ruby](http://www.ruby-lang.org/) script, which requires the [gems](http://rubygems.org/) [tinyatom](http://rubygems.org/gems/tinyatom) and [json_pure](http://rubygems.org/gems/json_pure).  Those are not included in this repository.