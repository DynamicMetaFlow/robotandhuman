#!/usr/bin/env ruby

### Minify the CSS file
require 'cssminify'   # gem install cssminify

src_css_filename = 'robotandhuman.css'
min_css_filename = 'robotandhuman.min.css'

if (File.open(src_css_filename).mtime <=> File.open(min_css_filename).mtime) == 1 then
  File.open(min_css_filename, 'w').write(
    CSSminify.compress(
      File.open(src_css_filename)
    )
  )
  action_taken = "Finished writing"
else
  action_taken = "No need to update"
end

puts "#{action_taken} #{min_css_filename}."


# The rest of what this script does depends on whether or not there are any new comics
src_json_filename = 'comics.json'
min_json_filename = 'comics.min.json'
feed_filename = 'atom.txt'

if (File.open(src_json_filename).mtime <=> File.open(min_json_filename).mtime) == 1 then

  ### Minify the JSON file
  require 'json/minify'   # gem install json-minify

  File.open(min_json_filename, 'w').write(
    JSON.minify(
      File.open(src_json_filename).read
    )
  )


  ### Create the Atom feed
  require 'tinyatom'    # gem install tinyatom
  require 'json/pure'   # gem install json_pure

  base_url = 'https://robotandhuman.neocities.org/'
  max_entries = 20   # only include this many entries in the feed

  # Read in the JSON file
  cfile = File.open('comics.json', 'r')
  comics = JSON.parse( cfile.readlines.join() )
  cfile.close


  # Create the feed object
  feed = TinyAtom::Feed.new(
    base_url,
    'Robot & Human',
    base_url + feed_filename,
    :author_name => 'Triskaideka'
  )


  # Check for duplicate titles and other errors
  (0...comics.length).each do |n|
    if comics[n]['title'].empty? || comics[n]['title'].match(/\S/).nil? then
      puts "  !! There's a comic dated #{ comics[n]['date'] } that's missing a title."
    end
  
    if comics[n]['date'].empty? || comics[n]['date'].match(/\S/).nil? then
      puts "  !! There's a comic titled \"#{ comics[n]['title'] }\" that's not dated."
    end

    (0...n).each do |m|
      if comics[n]['title'].downcase == comics[m]['title'].downcase then
        puts "  !! There appear to be two comics with the title \"#{comics[m]['title']}\"."
      end
    end
  end


  # Add each comic as a feed entry
  id = 1 + (comics.length - max_entries)  # offset the ID appropriately
  alltimes = Array.new

  comics[0...max_entries].reverse.each do |c|

    # This relies on some assumptions about the way I usually write times in the JSON file -- maybe
    # I should be adhering to a strict, reliably parsable format, but I wanted more freedom than that.
    begin
      # dd Month yyyy
      t = Time.parse( c['date'].split(' ').reverse.join(' ') )
    rescue ArgumentError
      # or, just yyyy
      t = Time.parse( c['date'] + '-07-01' )  # roughly the middle of the year
    end

    # Make sure this time is unique within the feed.  This is why we loop over the comics in the reverse of their order in
    # the JSON file (which we assume is reverse-chronological): so that if two (or more) comics have the same date and one
    # needs to have its time incremented, we do it to the one(s) that come later in chronological order.
    while alltimes.include?(t) do
      t = t + 1
    end
    alltimes.push(t)

    #    add_entry(id, title,      updated, link,                 options = {})
    feed.add_entry(id, c['title'], t,       "#{base_url}#e#{id}")

    # Increment ID
    id = id + 1

  end


  # Output the feed
  #puts feed.make(:indent => 2)  # for debugging
  File.new(feed_filename, 'w').write(
    feed.make(:indent => 2)
  )

  action_taken = "Finished writing"
else
  action_taken = "No need to update"
end

puts "#{action_taken} #{min_json_filename}."
puts "#{action_taken} #{feed_filename}."
