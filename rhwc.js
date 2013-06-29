$(document).ready(function () {
  var ajaxobj = new XMLHttpRequest();

  // What to do when we get the result
  ajaxobj.onreadystatechange = function () {
    if (ajaxobj.readyState == 4)  {
      if (ajaxobj.status == 200)  {
        display_comics( JSON.parse(ajaxobj.responseText) );
      }  else  {  // This code never runs; figure out why
        $("<p>Looks like your ol' webmaster screwed up.  There was an error loading the comics.</p>").insertAfter('#ctitle');
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
      // the panel tag and its classes
      c += '<div class="panel '+(comics[i].panels[j].extra_classes ? comics[i].panels[j].extra_classes : '')+'">';

      // left character & dialogue
      if (comics[i].panels[j].left.text)  {
        c += '<div class="dialogue d-left">'+comics[i].panels[j].left.text+'</div>';
      }
      if (comics[i].panels[j].left.char)  {
        c += '<img class="i-left" src="graphics/'+comics[i].panels[j].left.char+'.png">';
        //c += '<img class="i-left" src="graphics/'+comics[i].panels[j].left.char+'.png" onLoad="$(this).qtip({\'content\': {\'text\': \'moo\'}, \'show\': {\'ready\': \'true\'}})">';
      }

      // right character & dialogue
      if (comics[i].panels[j].right.text)  {
        c += '<div class="dialogue d-right">'+comics[i].panels[j].right.text+'</div>';
      }
      if (comics[i].panels[j].right.char)  {
        c += '<img class="i-right" src="graphics/'+comics[i].panels[j].right.char+'.png">';
      }

      c += '</div>\n';
    }

    // "show JSON" feature
    c += '<div class="show_json"><a href="javascript:void(0)" onClick="$(this.parentNode).next().toggle()">&#x2b10; show/hide JSON</a></div>';
    c += '<div class="json">'+JSON.stringify(comics[i], null, "  ")+'</div>';

    // news
    if (comics[i].news)  {
      c += '<div class="news">'+comics[i].news+'</div>';
    }

    c += '</div>';  // class="episode"
    $('<p>'+c+'</p>').insertBefore('#place');
  }

}
