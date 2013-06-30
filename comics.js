// (c) 2013 Triskaideka.
// May be re-used and re-distributed under the terms of the MIT License ( http://opensource.org/licenses/MIT ).

$(document).ready(function () {
  var ajaxobj = new XMLHttpRequest();

  // What to do when we get the result
  ajaxobj.onreadystatechange = function () {
    if (ajaxobj.readyState == 4)  {
      if (ajaxobj.status == 200)  {
        display_comics( JSON.parse(ajaxobj.responseText) );
      }  else  {  // This code never runs; figure out why
        $("<p>Looks like your ol' webmaster screwed up.  There was an error loading the comics.</p>").insertBefore('#place');
      }
    }
  }

  ajaxobj.open('GET', 'comics.json');
  ajaxobj.send(null);
});


function display_comics(comics)  {
  var i = 0,   // loop watch variable for comics
      j = 0,   // loop watch variable for panels
      c = '';  // string containing all of the code for this comic

  for (i = 0; i < comics.length; i++)  {
    // We set the width of each episode div individually, according to how many panels it has.  If these numbers
    // seem mysterious, see .panel in rhwc.css for (at least partial) enlightenment.
    c = '<div class="episode" style="width: '+(266*comics[i].panels.length)+'px">';

    // title & date
    c += '<div class="title">'+comics[i].title+'</div><div class="date">'+comics[i].date+'</div><br>';

    // comic panels
    for (j = 0; j < comics[i].panels.length; j++)  {
      // The panel tag and its classes.
      // In the JSON file, set an "extra_classes" property on the whole comic to add that string to each panel's "class"
      // attribute, or set it on an individual panel to add it to that panel only.  You'll need to add whatever extra 
      // classes you want to use to your CSS file.
      c += '<div class="panel'+
           (comics[i].extra_classes ? ' '+comics[i].extra_classes : '')+
           (comics[i].panels[j].extra_classes ? ' '+comics[i].panels[j].extra_classes : '')+
           '">';

      // left character & dialogue
      c += '<div class="p-left">';
      if (comics[i].panels[j].left.text)  {
        c += '<div class="dialogue d-left">'+comics[i].panels[j].left.text+'</div>';
      }
      if (comics[i].panels[j].left.char)  {
        c += '<br><img class="i-left" src="graphics/'+comics[i].panels[j].left.char+'.png">';
        //c += '<img class="i-left" src="graphics/'+comics[i].panels[j].left.char+'.png" onLoad="speech_bubble(this, \'left\', \''+
        //      comics[i].panels[j].left.text.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"')+'\')">';
      }
      c += '</div>';  // class="p-left"

      // right character & dialogue
      c += '<div class="p-right">';
      if (comics[i].panels[j].right.text)  {
        c += '<div class="dialogue d-right">'+comics[i].panels[j].right.text+'</div>';
      }
      if (comics[i].panels[j].right.char)  {
        c += '<img class="i-right" src="graphics/'+comics[i].panels[j].right.char+'.png">';
        //c += '<img class="i-right" src="graphics/'+comics[i].panels[j].right.char+'.png" onLoad="speech_bubble(this, \'right\', \''+
        //      comics[i].panels[j].right.text.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"')+'\')">';
      }
      c += '</div>';  // class="p-right"

      c += '</div>\n';  // class="panel"
    }

    // "show JSON" feature
    c += '<div class="show_json"><a href="javascript:void(0)" onClick="$(this.parentNode).next().toggle()">&#x2b10; show/hide JSON</a></div>';
    c += '<div class="json">'+JSON.stringify(comics[i], null, "  ")+'</div>';

    // news
    if (comics[i].news)  {
      c += '<div class="news">'+comics[i].news+'</div>';
    }

    c += '</div>\n';  // class="episode"
    $(c).insertBefore('#place');
  }

}


//function speech_bubble(el, side, words)  {
//  $(el).qtip({
//    'content': {
//      'text': words
//    },
//    'position': {
//      'my': 'bottom '+side,
//      'at': 'top '+side
//    },
//    'show': {
//      'ready': true
//    },
//    'hide': {
//      'event': false
//    },
//    'style': {
//      'classes': 'qtip-light qtip-rounded',
//      'tip': {
//        'corner': 'bottom center'
//      }
//    }
//  });
//}
