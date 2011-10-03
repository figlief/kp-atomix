
if (typeof(KP_ATOMIX) === 'undefined') {
    var KP_ATOMIX = {
        init: null,
        levelSets: {}
    };
}

KP_ATOMIX.render_solution_table = function (){

  var levels = KP_ATOMIX.solutions
    , lastUpdated = levels[0].lastModified.split(' ')
    , levelSetName = levels[0].levelSet
    , aTable = []
    , row
    , i
  ;

  html('solutions-title', "best solutions for<br />" + levelSetName + " levels");
  html('lastupdated', "Last updated on " + lastUpdated[0] + ' at ' + lastUpdated[1] + ' GMT');

  aTable.push('<table class="solutions-table">');
  aTable.push("<tr><th>Level</th><th>Solution</th><th>User</th><th>Date</th></tr>");
  for (i=1; i < levels.length; i++) {
    row = levels[i]
    table_row();
  }
  aTable.push("</table>");

  html('solutions-div', aTable.join('\n'));


  function pre_link() {
    return [
        '<td><a href="../index.html?levelSet='
      , levelSetName
      , '&level='
      , row.level
    ].join('')
  }

  function col_level() {
    return [
        pre_link()
      , '">'
      , row.level
      , '</a></td>'
    ].join('');

  }
  function col_solution() {
    return [
        pre_link()
      , '&history='
      , row.history
      , '">'
      , row.history.length / 4 + ' moves'
      , '</a></td>'
    ].join('')

   }
  function col_user() {
    if (row.user) {
      return '<td>' + row.user + '</td>'
    }
    return '<td>&nbsp;</td>';
  }
  function col_date() {
    var date = row.date.split(' ');
    return '<td>' + date[0] + '</td>';
  }

  function table_row() {
    aTable.push([
        "<tr>"
      , col_level()
      , col_solution()
      , col_user()
      , col_date()
      , "</tr>"
    ].join('\n'));
  }


  function html(e, text) {
    e = xGetElementById(e);
    if (e) {
      e.innerHTML = text;
    }
  }

  // xGetElementById r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
  // Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
  function xGetElementById(e)
  {
    if (typeof(e) == 'string') {
      if (document.getElementById) e = document.getElementById(e);
      else if (document.all) e = document.all[e];
      else e = null;
    }
    return e;
  }

};
