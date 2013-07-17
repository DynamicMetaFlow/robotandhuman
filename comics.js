// (c) 2013 Triskaideka.
// May be re-used and re-distributed under the terms of the MIT License ( http://opensource.org/licenses/MIT ).

$(document).ready(function () {
  var ajaxobj = new XMLHttpRequest();

  // What to do when we get the result
  ajaxobj.onreadystatechange = function () {
    if (ajaxobj.readyState == 4)  {
      if (ajaxobj.status == 200)  {

        display_comics( JSON.parse(ajaxobj.responseText) );

        // Since the comics aren't displayed until after the document is loaded, links from external pages/sources (such 
        // as feed readers) to anchors within the page won't work without the following code.  We include the jQuery 
        // plugin "scrollTo" just for this.
        if (window.location.hash)  {
          $.scrollTo(window.location.hash);
        }

      }  else  {
        $("<p>Looks like your ol' webmaster screwed up. There was an error loading the comics.</p>").insertBefore('#place');
      }
    }
  }

  ajaxobj.open('GET', 'comics.json');
  ajaxobj.send(null);
});


function display_comics(comics)  {
  var i = 0,  // loop watch variable for comics
      j = 0;  // loop watch variable for panels

  // each comic:
  for (i = 0; i < comics.length; i++)  {
    var id = 'e' + (comics.length - i),  // this comic's ID
        prev_id = 'e' + (comics.length - i - 1),  // the ID of the previous comic
        next_id = 'e' + (comics.length - i + 1),  // the ID of the next comic
        c = '';  // string containing all of the code for this comic

    // We set the width of each episode div individually, according to how many panels it has.  If these numbers
    // seem mysterious, see .panel in rhwc.css for (at least partial) enlightenment.
    $('<div id="'+id+'" class="episode" style="width: '+(267*comics[i].panels.length)+'px"></div>\n').insertBefore('#place');

    // prev/next links
    c += '<div class="prevnext">';
    if (i > 0)  { c += '<a href="#'+next_id+'" title="next comic up">&#x25b3;</a>'; }
    c += '<br>';
    if (i < comics.length - 1)  { c += '<a href="#'+prev_id+'" title="next comic down">&#x25bd;</a>'; }
    c += '</div>';

    // title & date
    c += '<div class="title">'+comics[i].title+'</div><div class="date">'+comics[i].date+'</div><br>';

    // comic panels
    for (j = 0; j < comics[i].panels.length; j++)  {
      // The panel tag and its classes.
      // In the JSON file, set an "extra_classes" property on the whole comic to add that string to each panel's "class"
      // attribute, or set it on an individual panel to add it to that panel only.  Of course, whatever extra classes you 
      // add here must be defined in your CSS file.
      c += '<div class="panel'+
           (comics[i].extra_classes ? ' '+comics[i].extra_classes : '')+
           (comics[i].panels[j].extra_classes ? ' '+comics[i].panels[j].extra_classes : '')+
           '">';

      // left character & dialogue
      c += '<div class="p-left">';
      if (comics[i].panels[j].left.text)  {
        c += '<div class="dialogue">'+comics[i].panels[j].left.text+'</div>';
        c += '<br><canvas width="15" height="15" class="dtag-'+comics[i].panels[j].left.char+'"></canvas>';
      }
      if (comics[i].panels[j].left.char)  {
        c += '<br><img src="'+comics[i].panels[j].left.char+  // which character?
             '-f'+(comics[i].panels[j].left.facing_out ? 'l' : 'r')+  // is the character facing inwards or outwards?
             '.png">';
      }
      c += '</div>';  // class="p-left"

      // right character & dialogue
      c += '<div class="p-right">';
      if (comics[i].panels[j].right.text)  {
        c += '<div class="dialogue">'+comics[i].panels[j].right.text+'</div>';
        c += '<br><canvas width="15" height="15" class="dtag-'+comics[i].panels[j].right.char+'"></canvas>';
      }
      if (comics[i].panels[j].right.char)  {
        c += '<br><img src="'+comics[i].panels[j].right.char+  // which character?
             '-f'+(comics[i].panels[j].right.facing_out ? 'r' : 'l')+  // is the character facing inwards or outwards?
             '.png">';
      }
      c += '</div>';  // class="p-right"

      c += '</div>\n';  // class="panel"
    }

    // "show JSON" feature
    c += '<div class="show_json"><a href="javascript:void(0)" onClick="$(this.parentNode).next().toggle()">&#x2b10; show/hide JSON</a></div>';
    c += '<div class="json">'+JSON.stringify(comics[i], null, "  ").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')+'</div>';

    // news
    if (comics[i].news)  {
      c += '<div class="news">'+comics[i].news+'</div>';
    }

    // add all of that code inside the newly created episode div
    $('#'+id).html(c);
  }

  // Add the dialogue tags

  // Human
  // on the left
  $('.p-left .dtag-human').drawQuadratic({
    strokeStyle: "#999",
    strokeWidth: 1,
    x1: 5, y1: 0, // Start point
    cx1: -1, cy1: 10, // Control point
    x2: 7, y2: 15 // End point
  });

  // on the right
  $('.p-right .dtag-human').drawQuadratic({
    strokeStyle: "#999",
    strokeWidth: 1,
    x1: 10, y1: 0,
    cx1: 16, cy1: 10,
    x2: 8, y2: 15
  });

  // Robot
  // on the left
  $('.p-left .dtag-robot').drawLine({
    strokeStyle: "#999",
    strokeWidth: 1,
    x1: 10, y1: 0,
    x2: 13, y2: 8,
    x3: 5, y3: 6,
    x4: 7, y4: 15
  });

  // on the right
  $('.p-right .dtag-robot').drawLine({
    strokeStyle: "#999",
    strokeWidth: 1,
    x1: 5, y1: 0,
    x2: 2, y2: 8,
    x3: 10, y3: 6,
    x4: 8, y4: 15
  });
}
