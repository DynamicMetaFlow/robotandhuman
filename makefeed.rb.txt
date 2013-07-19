require 'tinyatom'    # gem install tinyatom
require 'json/pure'   # gem install json_pure

base_url = 'http://robotandhuman.neocities.org/'
max_entries = 10   # only include this many entries in the feed

# Read in the JSON file
cfile = File.open('comics.json', 'r')
comics = JSON.parse( cfile.readlines.join() )
cfile.close


# Create the feed object
feed = TinyAtom::Feed.new(
  base_url,
  'Robot & Human',
  "#{base_url}atom.txt",
  :author_name => 'Triskaideka'
)


# Add each comic as a feed entry
id = 1
alltimes = Array.new

comics.reverse.each do |c|

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

  # Increment ID and check if we've reached max_entries
  id = id + 1
  if id + 1 > max_entries then break end

end


# Output the feed
#puts feed.make(:indent => 2)  # for debugging
ffile = File.new('atom.txt', 'w')

# Start with a newline to get around NeoCities' dislike for Atom files.  Unfortunately this isn't legal in XML.  Some
# feed readers might not care, but just in case, I usually fix this by using NeoCities' visual editor to remove the
# newline after uploading the file.
ffile.write( "\n" + feed.make(:indent => 2) )

ffile.close
