$(document).ready(function () {
  var ajaxobj = new XMLHttpRequest();

  // What to do when we get the result
  ajaxobj.onreadystatechange = function () {
    if (ajaxobj.readyState == 4)  {
      if (ajaxobj.status == 200)  {
        var c = ajaxobj.responseText;
        display_comics(c);
      }  else  {
        $('<p>Looks like your ol\' webmaster screwed up.  There was an error loading the comics.').insertAfter('#title');
      }
    }
  }

  // Construct the URL and then call it
  ajaxobj.open("GET", "xcomics.json");
  ajaxobj.send(null);
});

function display_comics(comics)  {

}
