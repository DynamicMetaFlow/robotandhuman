// (c) 2013-2017 Triskaideka.
// May be re-used and re-distributed under the terms of the MIT License ( http://opensource.org/licenses/MIT ).

// Variables that need to be global:
var num_comics_shown = 0,  // how many comics are being displayed right now?
    at_a_time = 5,         // how many comics to show initially, and each time "show more comics" is clicked
    comic_list = {},       // all of the content information for the comics -- comes from the JSON file
    scrollto_settings = { "axis": "y" };  // the settings object for any calls to scrollTo

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
        if (window.location.hash)  { $.scrollTo( window.location.hash, 'normal', scrollto_settings ); }

      }  else  {
        $("<p>Looks like your ol' webmaster screwed up. There was an error loading the comics.</p>").insertBefore('#more');
      }
    }
  }

  ajaxobj.open('GET', 'comics.min.json');
  ajaxobj.send(null);
});


function scroll_to_comic(to, from)  {
  var selector = '#' + to;

  // If the item we're trying to scroll to doesn't exist on the page, that's probably because it belongs to an earlier
  // comic that hasn't been displayed yet, so start by loading all comics up to that one.
  if ( ! $(selector).length ) {
    window.location.hash = selector;
    display_comics(comic_list, 0);
  }
  $.scrollTo(selector, 'fast', scrollto_settings);

  // Move focus to the corresponding link for the comic that we've moved to.
  // This is important so that the keyboard can be used to navigate between comics.
  if ( from < to )  {
    // I don't understand why I need to setTimeout() for this, but I do.
    setTimeout(function(){ $(selector).find('.prevnext a:first').focus(); }, 0);
  }  else  {
    setTimeout(function(){ $(selector).find('.prevnext a:last').focus(); }, 0);
  }
}


function display_comics(comics, how_many, slide)  {
  var i = 0,  // loop watch variable for comics
      j = 0,  // loop watch variable for panels
      target = num_comics_shown + how_many;  // "target" is the number of comics at which we stop showing more

  // show the loading image
  $("#more").data( "oldhtml", $("#more").html() );
  $("#more").html("Loading some comics... <img src=\"loading.gif\" alt=\"\" style=\"width:43px; height:11px;\">");

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

    // We set the width of each episode div individually, according to how many panels it has.
    // 250 panel width + two 1px borders + 10px margin = 262, minus 10 because the margins are only between panels.
    // See .panel in robotandhuman.css.
    $('<div id="'+id+'" class="episode" style="display:none; width: '+(262*comics[i].panels.length-10)+'px"></div>')
      .insertBefore('#more');

    // prev/next links
    // on-click functionality is added after the comic loop, in the "Create click events" section
    c += '<div class="prevnext">';
    if (i > 0)  {
      c += '<a data-scroll-id="'+next_id+'" href="#'+next_id+'" title="next comic up">&#x25b3;</a>';
    }
    c += '<br>';

    if (i < comics.length - 1)  {
      c += '<a data-scroll-id="'+prev_id+'" href="#'+prev_id+'" title="next comic down">&#x25bd;</a>';
    }
    c += '</div>';

    // title & date
    // the right margin on the date div seems to scale well enough, but it's pretty magical...
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
           (comics[i].panels[j].closeup ? ' closeup' : '')+
           '">';

      // if we're writing code for the panel in the JSON file
      if (comics[i].panels[j].code)  {
        c += '<div class="p-coded">' + comics[i].panels[j].code + '</div>';

      // if the panel is a special close-up shot
      }  else if (comics[i].panels[j].closeup)  {
        c += '<div class="p-closeup">';
        if (comics[i].panels[j].closeup.text)  {
          c += '<div class="dialogue hyphenate">'+comics[i].panels[j].closeup.text+'</div>';
          c += '<br><canvas width="15" height="15" class="dtag-'+comics[i].panels[j].closeup.char+
               (comics[i].panels[j].closeup.thought ? '-thought' : '')+'"></canvas>';
        }
        if (comics[i].panels[j].closeup.char)  {
          c += '<br><img src="characters/'+comics[i].panels[j].closeup.char+  // which character?
               '-closeup'+
               (comics[i].panels[j].closeup.pose ? '-'+comics[i].panels[j].closeup.pose : '')+  // any special pose?
               '.png">';
        }
        c += '</div>';  // class="p-closeup"

      }  else  {
        // left character & dialogue
        c += '<div class="p-left">';
        if (comics[i].panels[j].left.text)  {
          c += '<div class="dialogue hyphenate'+
               (comics[i].panels[j].left.extra_classes ? ' '+comics[i].panels[j].left.extra_classes : '')+
               '">'+comics[i].panels[j].left.text+'</div>'+
               '<br><canvas width="15" height="15" class="dtag-'+comics[i].panels[j].left.char+
               (comics[i].panels[j].left.thought ? '-thought' : '')+'"></canvas>';
        }
        if (comics[i].panels[j].left.char)  {
          c += '<br><img src="characters/'+comics[i].panels[j].left.char+  // which character?
               (comics[i].panels[j].left.pose ? '-'+comics[i].panels[j].left.pose : '')+  // any special pose?
               '-f'+(comics[i].panels[j].left.facing_out ? 'l' : 'r')+  // is the character facing inwards or outwards?
               '.png">';
        }
        c += '</div>';  // class="p-left"

        // right character & dialogue
        c += '<div class="p-right">';
        if (comics[i].panels[j].right.text)  {
          c += '<div class="dialogue hyphenate'+
               (comics[i].panels[j].right.extra_classes ? ' '+comics[i].panels[j].right.extra_classes : '')+
               '">'+comics[i].panels[j].right.text+'</div>'+
               '<br><canvas width="15" height="15" class="dtag-'+comics[i].panels[j].right.char+
               (comics[i].panels[j].right.thought ? '-thought' : '')+'"></canvas>';
        }
        if (comics[i].panels[j].right.char)  {
          c += '<br><img src="characters/'+comics[i].panels[j].right.char+  // which character?
               (comics[i].panels[j].right.pose ? '-'+comics[i].panels[j].right.pose : '')+  // any special pose?
               '-f'+(comics[i].panels[j].right.facing_out ? 'r' : 'l')+  // is the character facing inwards or outwards?
               '.png">';
        }
        c += '</div>';  // class="p-right"
      }

      c += '</div>';  // class="panel"
    }

    // "show JSON" feature
    // on-click functionality is added after the comic loop, in the "Create click events" section
    c += '<div class="show_json"><a href="javascript:void(0)">&#x2b10; show/hide JSON</a></div><div class="json">'+
         JSON.stringify(comics[i], null, "  ").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')+'</div>';

    // news
    if (comics[i].news)  {
      c += '<div class="news">'+comics[i].news+'</div>';
    }

    // Add all of that code inside the newly created episode div.
    // "slide", indicating whether to animate the addition of the new comics, should be set only when display_comics() is
    // called from the "show more comics" link.  Otherwise it will conflict with scrollTo.
    $('#'+id).html(c).slideDown( slide ? 'normal' : 0 );
    num_comics_shown++;

    // if there aren't any more comics, hide the "show more comics" link
    if (num_comics_shown >= comics.length)  { $('#more').hide(); }
  }


  // Create click events
  // previous and next links, as well as the "Start with the first comic" link:
  $('a[data-scroll-id]').click(function(){
    scroll_to_comic(
      $(this).attr('data-scroll-id'),
      $(this).parents('.episode').attr('id')
    );
  });

  // "show JSON" links:
  $('.show_json a').click(function(){ $(this.parentNode).next().slideToggle() });


  // Hyphenate the dialogue
  Hyphenator.run();


  // Add the dialogue tags
  var dtag_color = "#999",
      dtag_thickness = 1;

  // Human, speech, on the left
  $('.p-left .dtag-human, .p-left .dtag-apple').not('.has-dtag').drawQuadratic({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x1: 5, y1: 0, // Start point
    cx1: -1, cy1: 10, // Control point
    x2: 7, y2: 15 // End point
  }).addClass('has-dtag');  // apply the 'has-dtag' class to avoid drawing dialogue tags on any canvas that already has one

  // Human, speech, on the right (or close-up)
  $('.p-right .dtag-human, .p-closeup .dtag-human, .p-right .dtag-apple, .p-closeup .dtag-apple').not('.has-dtag').drawQuadratic({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x1: 10, y1: 0,
    cx1: 16, cy1: 10,
    x2: 8, y2: 15
  }).addClass('has-dtag');

  // Human, thought, on the left
  $('.p-left .dtag-human-thought, .p-left .dtag-apple-thought').not('.has-dtag').drawArc({
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
  }).addClass('has-dtag');

  // Human, thought, on the right (or close-up)
  $('.p-right .dtag-human-thought, .p-closeup .dtag-human-thought, .p-right .dtag-apple-thought, .p-closeup .dtag-apple-thought').not('.has-dtag').drawArc({
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
  }).addClass('has-dtag');

  // Robot, speech, on the left
  $('.p-left .dtag-robot, .p-left .dtag-android').not('.has-dtag').drawLine({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x1: 10, y1: 0,
    x2: 13, y2: 8,
    x3: 5, y3: 6,
    x4: 7, y4: 15
  }).addClass('has-dtag');

  // Robot, speech, on the right (or close-up)
  $('.p-right .dtag-robot, .p-closeup .dtag-robot, .p-right .dtag-android, .p-closeup .dtag-android').not('.has-dtag').drawLine({
    strokeStyle: dtag_color,
    strokeWidth: dtag_thickness,
    x1: 5, y1: 0,
    x2: 2, y2: 8,
    x3: 10, y3: 6,
    x4: 8, y4: 15
  }).addClass('has-dtag');

  // Robot, thought, on the left
  $('.p-left .dtag-robot-thought, .p-left .dtag-android-thought').not('.has-dtag').drawRect({
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
  }).addClass('has-dtag');

  // Robot, thought, on the right (or close-up)
  $('.p-right .dtag-robot-thought, .p-closeup .dtag-robot-thought, .p-right .dtag-android-thought, .p-closeup .dtag-android-thought').not('.has-dtag').drawRect({
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
  }).addClass('has-dtag');


  // replace the loading image with the "show more" link
  $("#more").html( $("#more").data("oldhtml") );


  // make the "show more" link work
  $('#more a').click(function () {
    display_comics(comic_list, at_a_time, true);
  });

}  // end function display_comics()
