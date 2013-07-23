// (c) 2013 Triskaideka.
// May be re-used and re-distributed under the terms of the MIT License ( http://opensource.org/licenses/MIT ).

// Variables that need to be global:
var num_comics_shown = 0,  // how many comics are being displayed right now?
    at_a_time = 5,         // how many comics to show initially, and each time "show more comics" is clicked
    comic_list = {};       // all of the content information for the comics -- comes from the JSON file


$(document).ready(function () {
  var ajaxobj = new XMLHttpRequest();

  // What to do when we get the result
  ajaxobj.onreadystatechange = function () {
    if (ajaxobj.readyState == 4)  {
      if (ajaxobj.status == 200)  {

        comic_list = JSON.parse(ajaxobj.responseText);
        display_comics(comic_list, at_a_time);

        // Since the comics aren't displayed until after the document is loaded, links from external pages/sources (such 
        // as feed readers) to anchors within the page won't work without the following code.
        if (window.location.hash)  { $.scrollTo( window.location.hash, 500 ); }

      }  else  {
        $("<p>Looks like your ol' webmaster screwed up. There was an error loading the comics.</p>").insertBefore('#more');
      }
    }
  }

  ajaxobj.open('GET', 'comics.json');
  ajaxobj.send(null);
});


function display_comics(comics, how_many)  {
  var i = 0,  // loop watch variable for comics
      j = 0,  // loop watch variable for panels
      target = num_comics_shown + how_many;  // "target" is the number of comics at which we stop showing more

  // If the request was for a comic that's so far down the list that it wouldn't normally be shown by default, 
  // increase the number of comics we're showing so that the requested one will be the last on the list.
  if ( window.location.hash && target < comics.length + 1 - window.location.hash.substr(2) )  {
    target = comics.length + 1 - window.location.hash.substr(2);

    // Enforce that the number of comics being displayed is always a multiple of 'at_a_time'.
    // I'm not completely sold on this rule, but at the moment I like it better than the alternative.
    while (target % at_a_time != 0)  { target++; }
  }

  // each comic:
  for (i = num_comics_shown; i < target && i < comics.length; i++)  {
    var id = 'e' + (comics.length - i),  // this comic's ID
        prev_id = 'e' + (comics.length - i - 1),  // the ID of the previous comic
        next_id = 'e' + (comics.length - i + 1),  // the ID of the next comic
        c = '';  // string containing all of the code for this comic

    // We set the width of each episode div individually, according to how many panels it has.  If these numbers
    // seem mysterious, see .panel in rhwc.css for (at least partial) enlightenment.
    $('<div id="'+id+'" class="episode" style="width: '+(267*comics[i].panels.length)+'px"></div>\n').insertBefore('#more');

    // prev/next links
    c += '<div class="prevnext">';
    if (i > 0)  {
      c += '<a onClick="$.scrollTo(\'#'+next_id+'\', 300)" href="#'+next_id+'" title="next comic up">&#x25b3;</a>';
    }
    c += '<br>';

    // The 'next' link has a little more magic than the 'previous' link in order to ensure that it will still work when 
    // the next comic in line hasn't actually been displayed yet.  Calling scrollTo() twice is not a mistake: the first 
    // call covers us if the target comic is already being displayed, and the second if it isn't.
    if (i < comics.length - 1)  {
      c += '<a onClick="$.scrollTo(\'#'+prev_id+'\', 300); window.location.hash=\''+prev_id+
           '\'; display_comics(comic_list, 0); $.scrollTo(\'#'+prev_id+'\', 300);" href="#'+
           prev_id+'" title="next comic down">&#x25bd;</a>';
    }
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
        c += '<br><canvas width="15" height="15" class="dtag-'+comics[i].panels[j].left.char+
             (comics[i].panels[j].left.thought ? '-thought' : '')+'"></canvas>';
      }
      if (comics[i].panels[j].left.char)  {
        c += '<br><img src="'+comics[i].panels[j].left.char+  // which character?
             (comics[i].panels[j].left.pose ? '-'+comics[i].panels[j].left.pose : '')+  // any special pose?
             '-f'+(comics[i].panels[j].left.facing_out ? 'l' : 'r')+  // is the character facing inwards or outwards?
             '.png">';
      }
      c += '</div>';  // class="p-left"

      // right character & dialogue
      c += '<div class="p-right">';
      if (comics[i].panels[j].right.text)  {
        c += '<div class="dialogue">'+comics[i].panels[j].right.text+'</div>';
        c += '<br><canvas width="15" height="15" class="dtag-'+comics[i].panels[j].right.char+
             (comics[i].panels[j].right.thought ? '-thought' : '')+'"></canvas>';
      }
      if (comics[i].panels[j].right.char)  {
        c += '<br><img src="'+comics[i].panels[j].right.char+  // which character?
             (comics[i].panels[j].right.pose ? '-'+comics[i].panels[j].right.pose : '')+  // any special pose?
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
    num_comics_shown++;

    // if there aren't any more comics, hide the "show more comics" link
    if (num_comics_shown >= comics.length)  { $('#more').hide(); }
  }

  // Add the dialogue tags
  var dtag_color = "#999",
      dtag_thickness = 1;

  // Human, speech, on the left
  $('.p-left .dtag-human').drawQuadratic({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x1: 5, y1: 0, // Start point
    cx1: -1, cy1: 10, // Control point
    x2: 7, y2: 15 // End point
  });

  // Human, speech, on the right
  $('.p-right .dtag-human').drawQuadratic({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x1: 10, y1: 0,
    cx1: 16, cy1: 10,
    x2: 8, y2: 15
  });

  // Human, thought, on the left
  $('.p-left .dtag-human-thought').drawArc({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x: 9, y: 3,
    radius: 5
  }).drawArc({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x: 4, y: 8,
    radius: 3
  }).drawArc({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x: 7, y: 12,
    radius: 2
  });

  // Human, thought, on the right
  $('.p-right .dtag-human-thought').drawArc({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x: 6, y: 3,
    radius: 5
  }).drawArc({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x: 11, y: 8,
    radius: 3
  }).drawArc({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x: 8, y: 12,
    radius: 2
  });

  // Robot, speech, on the left
  $('.p-left .dtag-robot').drawLine({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x1: 10, y1: 0,
    x2: 13, y2: 8,
    x3: 5, y3: 6,
    x4: 7, y4: 15
  });

  // Robot, speech, on the right
  $('.p-right .dtag-robot').drawLine({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x1: 5, y1: 0,
    x2: 2, y2: 8,
    x3: 10, y3: 6,
    x4: 8, y4: 15
  });

  // Robot, thought, on the left
  $('.p-left .dtag-robot-thought').drawRect({
    strokeStyle: dtag_color,
    x: 10, y: 2,
    width: 7, height: 5,
    fromCenter: true
  }).drawRect({
    strokeStyle: dtag_color,
    x: 7, y: 8,
    width: 5, height: 5,
    fromCenter: true
  }).drawRect({
    strokeStyle: dtag_color,
    x: 9, y: 13,
    width: 3, height: 3,
    fromCenter: true
  });

  // Robot, thought, on the right
  $('.p-right .dtag-robot-thought').drawRect({
    strokeStyle: dtag_color,
    x: 5, y: 2,
    width: 7, height: 5,
    fromCenter: true
  }).drawRect({
    strokeStyle: dtag_color,
    x: 8, y: 7,
    width: 5, height: 5,
    fromCenter: true
  }).drawRect({
    strokeStyle: dtag_color,
    x: 6, y: 11,
    width: 3, height: 3,
    fromCenter: true
  });
}
