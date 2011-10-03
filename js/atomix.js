
if (typeof(KP_ATOMIX) === 'undefined') {
    var KP_ATOMIX = {
        init: null,
        levelSets: {}
    };
}

(function () {

    var CELL_HEIGHT = 39,
        CELL_WIDTH = 41,

        gCellHeight = CELL_HEIGHT,
        gCellWidth = CELL_WIDTH,

        MOLECULE_CELL_HEIGHT = 39,
        MOLECULE_CELL_WIDTH = 41,

        gMoleculeCellHeight = MOLECULE_CELL_HEIGHT,
        gMoleculeCellWidth = MOLECULE_CELL_WIDTH,

        // time for atom to move one square (in milliseconds)
        ANIMATION_TIME = 100,
        gAnimationTime = ANIMATION_TIME,

        RIGHT = 0,
        LEFT = 1,
        UP = 2,
        DOWN = 3,

        arena_margin = 20,

        item_kind = {
            '1': 'atom-h', // hydrogen
            '2': 'atom-c', // carbon
            '3': 'atom-o', // oxygen
            '4': 'atom-n', // nitrogen
            '5': 'atom-s', // sulphur
            '6': 'atom-f', // fluorine
            '7': 'atom-cl', // chlorine
            '8': 'atom-br', // bromine
            '9': 'atom-p', // phosphorus
            'o': 'atom-crystal',
            'A': 'connector-horizontal',
            'B': 'connector-slash',
            'C': 'connector-vertical',
            'D': 'connector-backslash',

            'E': 'crystal-E',
            'F': 'crystal-F',
            'G': 'crystal-G',
            'H': 'crystal-H',
            'I': 'crystal-I',
            'J': 'crystal-J',
            'K': 'crystal-K',
            'L': 'crystal-L',
            'M': 'crystal-M'
        },
        bond_kind = {
            'a': 'bond-top',
            'b': 'bond-top-right',
            'c': 'bond-right',
            'd': 'bond-bottom-right',
            'e': 'bond-bottom',
            'f': 'bond-bottom-left',
            'g': 'bond-left',
            'h': 'bond-top-left',
            'A': 'bond-top-double',
            'B': 'bond-right-double',
            'C': 'bond-bottom-double',
            'D': 'bond-left-double',
            'E': 'bond-top-triple',
            'F': 'bond-right-triple',
            'G': 'bond-bottom-triple',
            'H': 'bond-left-triple',
            '1': 'bond-top-left-double',
            '2': 'bond-top-right-double',
            '3': 'bond-bottom-right-double',
            '4': 'bond-bottom-left-double'
        },
        browserTitle = 'kp-atomix',
        moveEncoder = 'abcdefghijklmnopqrstuvwxyz'.split(''),
        moveDecoder = {},
        gItems,
        gArrows,
        sArrows = ['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down'],
        gCurrent, // {row:  , col:  }
        gA,
        gM,
        gMoveFlag,
        gUserName = 'anonymous',
        gAjaxRequest,

        gLevelSets = {}, // list of LevelSet objects derived from KP_ATOMIX.levelSets
        gLevelSetNames = [],
        gLevelSet = null,  // currently active LevelSet object

        dlgSuccess,
        dlgBookmark,
        dlgAjax,

        gg, // gLevel.gameData

        //
        $;

    function foreach(c, f) {
        for (var i = 0; i < c.length; i += 1) {
            f(c[i], i, c);
        }
    }
    function forkey(c, f) {
        for (var k in c) {
            if (c.hasOwnProperty(k)) {
                f(c[k], k, c);
            }
        }
    }
    function keys(c) {
        var k, a = [];
        for (k in c) {
            if (c.hasOwnProperty(k)) {
                a.push(k);
            }
        }
        return a;
    }
    function format(s) {
        var count = 0, args = arguments;
        return s.replace(/\f/g, function () {
            count += 1;
            return (count < args.length) ? args[count] : '';
        });
    }
    function xBottom(e) {
        return xTop(e) + xHeight(e);
    }
    function xRight(e) {
        return xLeft(e) + xWidth(e);
    }

    function parse_location_search() {

        var items = location.search
            , result = {}
        ;

        if (!(items.length)) {
            return result;
        }
        foreach(items.substring(1).split('&'), function (item) {
            var value = item.split('=', 2)
                , name = decodeURIComponent(value[0])
            ;
            if (value.length === 2) {
                value = decodeURIComponent(value[1]);
            } else {
                value = '';
            }
            result[name] = value;
        });
        return result;
    }

    function copy_grid(grid) {
        return grid.join('\n').split('\n');
    }

    function addClickLink(cmd) {
        xAddEventListener($(cmd), 'click', function (e) {
            cancel(e);
            onClickLink(cmd);
        }, false);
        xAddEventListener($(cmd), 'dblclick', function (e) {
            cancel(e);
            onClickLink(cmd);
        }, false);
    }

    function end_animation(testForSuccess) {

        gMoveFlag = false;
        if (testForSuccess) {
            test_for_success();
        } else {
            show_arrows();
        }
    }

    function show_arrow(arrow, row, col) {
        if (gg.grid[row].charAt(col) === '.') {
            xMoveTo(arrow, gA.xpos(col), gA.ypos(row));
        } else {
            xLeft(arrow, -1000);
        }
    }

    function show_arrows() {

        var row = gCurrent.row, col = gCurrent.col;

        show_arrow(gArrows[0], row, col - 1);
        show_arrow(gArrows[1], row, col + 1);
        show_arrow(gArrows[2], row - 1, col);
        show_arrow(gArrows[3], row + 1, col);
    }

    function hide_arrows() {
        foreach(gArrows, function (a) {
            xLeft(a, -1000);
        });
    }

    function create_arrows() {
        var arrows = '';
        foreach(sArrows, function (dir) {
            arrows += gA.new_img('arrow',  dir, -1, dir);
        });
        return arrows;
    }

    function onNextAtom(dir) {

        switch (dir) {

        case 'down':
            break;
        case 'up':
            break;
        case 'left':
            break;
        case 'right':
            break;

        }

    }

    function onKeydown(evt)
    {
        var e = new xEvent(evt),
            doneKey = true;

        if (kp_Shield.isUp()) {
            console.log('shield is up')
            return;
        }

        function dok(a, b){
            console.log('dok:', a, b)
            if (e.shiftKey && b) {
                onClickLink(b);
            }
            else {
                onClickLink(a);
            }
        }

        function doa(d) {
            if (e.shiftKey) {
                //onNextAtom(d);
            } else {
                onClickArrow('arrow-' + d);
            }
        }
        console.log(e.keyCode + ', ' + (e.shiftKey ? 'shifted': 'normal'));
        switch(e.keyCode) {

            case 85: //u
                dok('history-undo', 'history-redo')
                break;
            case 82: //r
                dok('history-redo', '')
                break;
            case 78: //n
                dok('next-level', '')
                break;
            case 80: //p
                dok('prev-level', '')
                break;
            case 66: //b
                dok('bigger-link', '')
                break;
            case 83: //s
                dok('smaller-link', 'bookmark-link')
                break;

            case 74: //j
                doa('left');
                break;
            case 75: //k
                doa('down');
                break;
            case 76:  //l
                doa('right');
                break;
            case 73:  //i
                doa('up');
                break;

            default:
               doneKey = false;
        }
        if (doneKey) {
            xPreventDefault(evt);
        }
    }

    function get_item_rowcol(row, col) {
        var i, item;
        for (i = 0; i < gItems.length; i += 1) {
            item = gItems[i];
            if (item.row === row && item.col === col) {
                return item;
            }
        }
        return null;
    }

    function set_current(oAtom) {
        gCurrent = oAtom;
        show_arrows(oAtom);
    }

    function cancel(e) {
        xStopPropagation(e);
        xPreventDefault(e);
    }

    function create_levelset_selectors() {

        $('levelset-selector-span').innerHTML  =
              '<select id="levelset-select"><option>'
            + gLevelSetNames.join('</option><option>')
            + '</option></select>';

        xAddEventListener($('levelset-select'), 'change', function () {
           setTimeout(onLevelSetSelect, 100);
        }, false);
        return;
    }
    function onLevelSetSelect() {

        var sel = $('levelset-select')
          , name = sel.options[sel.selectedIndex].text
        ;
        select_levelSet(name);
        start_level(gLevelSet.iLevel);
    }

    function encode_history(history) {
        var i, m, e, s = '';
        e = moveEncoder;
        for (i = 0; i < history.length; i += 1) {
            m = history[i];
            s = s + e[m[0]] + e[m[1]] + e[m[2]] + e[m[3]];
        }
        return s;
    }
    function decode_history(s) {
        var i, d, history = [];
        d = moveDecoder;
        for (i = 0; i < s.length;) {
            history.push([d[s[i++]], d[s[i++]], d[s[i++]], d[s[i++]]]);
        }
        return history;
    }

    function create_query_string() {
        var sData = []
            , enc = encodeURIComponent
            , user
        ;
        function add(key, data) {
            if (data.length) {
                sData.push(enc(key) + '=' + enc(data));
            }
        }
        user = dlgSuccess.get('user').value;
        user = (user.toLowerCase().indexOf('anon') === 0) ? '' : user;

        add('user', user);
        add('levelSet', gLevelSet.name);
        add('level', '' + gLevelSet.level.id);
        add('history', encode_history(gg.history));
        //add('undo', encode_history(gg.redo));

        return sData.join('&');
    }

    function update_bookmark_link() {

        var bm = $('bookmark-link')
            , href
        ;
        href = location.protocol + '//' + location.host + location.pathname;
        href += '?' + create_query_string();
        document.title = format('\f \f: \f', gLevelSet.name, gLevelSet.iLevel + 1, browserTitle);
        bm.href = href;
    }

    function create_move_decoder(i) {
        foreach(moveEncoder, function (s) {
            moveDecoder[s] = i++;
        });
    }
    create_move_decoder(0);


    // Modify a grid to reflect a sequence of moves.
    // Throws an Error if the move sequence is invalid.
    // Returns the modified grid otherwise.

    var InvalidMoveError = function (msg) {
        this.prototype = Error.prototype;
        this.name = "InvalidMoveError";
        this.message = "Invalid Move: " + msg + '.';
    };

    function _assert(p, msg) {
        if (p) return;
        throw new InvalidMoveError(msg);
    }
    function replay_moves(moveList, grid) {

        var endCol
          , endRow
          , startCol
          , startRow
          , row
          , col
          , data
          , atom
          , move
          , moveIdx
        ;

        for (moveIdx = 0; moveIdx < moveList.length; moveIdx += 1) {

            move = moveList[moveIdx];
            startRow = row = move[0];
            startCol = col = move[1];
            endRow = move[2];
            endCol = move[3];

            atom = grid[startRow][startCol];
            _assert(atom !==  '.' && atom !== '#', 'no atom here');

            data = grid[row];

            if (startRow === endRow) {
                _assert(startCol !== endCol, 'no movement')
                if (endCol < startCol) {
                    while (data[col - 1] === '.') col -= 1;
                } else {
                    while (data[col + 1] === '.') col += 1;
                }
            } else {
                _assert(startCol === endCol, 'diagonal move')
                if (endRow < startRow) {
                    while (grid[row - 1][col] === '.') row -= 1;
                } else {
                    while (grid[row + 1][col] === '.') row += 1;
                }
            }
            _assert(row === endRow && col === endCol, 'path blocked');
            move_in_grid(grid, startRow, startCol, endRow, endCol);
        }
        return grid;
    }

    function isSolution(testGrid) {
        var grid = testGrid.join('').replace(/#/g, '.');
        return (grid.indexOf(gg.molecule) !== -1);
    }

    function save_successful_move(fnResponse) {
        // a successful move will be saved via ajax

        var sData, response;
        sData = create_query_string();

        response = gAjaxRequest.send(
            'GET',
            '/atomix/submit-solution',
            sData,
            60000, // uTimeout milliseconds
            '', // sData +  '&' + sRndVar + '=' + a_random_number.
            false, // bXml
            null, // a user data object
            function (req, status, data) {
                var text = req.responseText;
                //alert(text);
                fnResponse(text, status);
            }
        );
    }

    function onCompleteLevel() {
        show_success_dialog(
            format(
                "You completed this level <br /> in <b>\f</b> moves.",
                gg.history.length
            )
        );
    }

    function setup_controls() {
        var ctrls = [
            'next-level'
          , 'prev-level'
          , 'history-reset'
          , 'history-undo'
          , 'history-redo'
          , 'bookmark-link'

          , 'bigger-link'
          , 'smaller-link'
        ];
        foreach(ctrls, addClickLink);
    }

    function onClickLink(cmd) {

        var m, l;

        switch (cmd) {

        case 'bigger-link':
            gCellHeight += 2;
            gCellWidth += 2;
            gMoleculeCellHeight += 2;
            gMoleculeCellWidth += 2;
            start_level(gLevelSet.iLevel);
            return;

        case 'smaller-link':
            gCellHeight -= 2;
            gCellWidth -= 2;
            gMoleculeCellHeight -= 2;
            gMoleculeCellWidth -= 2;
            start_level(gLevelSet.iLevel);
            return;

        case 'bookmark-link':
            show_bookmark_dialog();
            return;

        case 'next-level':
            l = gLevelSet.levels.length - 1;
            if (gLevelSet.iLevel < l) {
                $('level-select-' + gLevelSet.name).selectedIndex = gLevelSet.iLevel + 1;
                start_level(gLevelSet.iLevel + 1);
            }
            return;

        case 'prev-level':
            if (gLevelSet.iLevel > 0) {
                $('level-select-' + gLevelSet.name).selectedIndex = gLevelSet.iLevel - 1;
                start_level(gLevelSet.iLevel - 1);
            }
            return;

        case 'history-reset':
            start_level(gLevelSet.iLevel, true);
            return;

        case 'history-undo' :
            if (!gg.history.length || gMoveFlag) {
                return;
            }
            m = gg.history.pop();
            gg.redo.push(m);
            //m = decode_move(m);
            gCurrent = get_item_rowcol(m[2], m[3]);
            move_current_atom(m[0], m[1]);
            return;

        case 'history-redo' :
            if (!gg.redo.length || gMoveFlag) {
                return;
            }
            m = gg.redo.pop();
            gg.history.push(m);
            //m = decode_move(m);
            gCurrent = get_item_rowcol(m[0], m[1]);
            move_current_atom(m[2], m[3]);
            return;

        default:
            return;
        }
        return;
    }

    function onClickAtom(oAtom) {
        set_current(oAtom);
    }

    function onClickArrow(dir) {

        if (gMoveFlag) {
            return;
        }

        var row = gCurrent.row
          , col = gCurrent.col
          , cr = row
          , cc = col
          , grid = gg.grid
          , data = grid[row]
        ;

        switch ($(dir).id) {

        case 'arrow-left':
            while (data.charAt(col - 1) === '.') {
                col -= 1;
            }
            break;
        case 'arrow-right':
            while (data.charAt(col + 1) === '.') {
                col += 1;
            }
            break;
        case 'arrow-up':
            while (grid[row - 1].charAt(col) === '.') {
                row -= 1;
            }
            break;
        case 'arrow-down':
            while (grid[row + 1].charAt(col) === '.') {
                row += 1;
            }
            break;

        default:
            break;
        }

        if (row !== gCurrent.row || col !== gCurrent.col) {
            gg.history.push([cr, cc, row, col]);
            gg.redo = [];
            move_current_atom(row, col, true);
        }
    }

    function move_in_grid(grid, sr, sc, er, ec) {
        var atom = grid[sr].charAt(sc);
        grid[sr] = grid[sr].slice(0, sc) + '.' + grid[sr].slice(sc + 1);
        grid[er] = grid[er].slice(0, ec) + atom + grid[er].slice(ec + 1);
    }

    function move_current_atom(row, col, testForSuccess) {

        var grid = gg.grid
          , startCol = gCurrent.col
          , startRow = gCurrent.row
          , animationTime
        ;

        gMoveFlag = true;

        hide_arrows();
        show_level_data();

        move_in_grid(grid, startRow, startCol, row, col);
        gCurrent.row = row;
        gCurrent.col = col;
        update_bookmark_link();

        animationTime = gAnimationTime * Math.abs(startRow - row + startCol - col);

        xAniLine(gCurrent.atom,
            gA.xpos(col),
            gA.ypos(row),
            animationTime, 1,
            function () {
                end_animation(testForSuccess);
            }
        );
    }

    function gridSpec(parentName, cellWidth, cellHeight) {

        var parent = $(parentName)
            , atomCount = -1
            , wh = 'width:' + cellWidth + 'px;height:' + cellHeight + 'px;'
        ;

        function xpos(col) {
            return col * cellWidth;
        }

        function ypos(row) {
            return row * cellHeight;
        }

        function new_img(cls, image, col, row) {

            var id;

            if (col < 0) {
                id = row ? ' id="' + row + '"' : '';
                col = 0;
                row = 0;
            } else {
                id = '';
                col = xpos(col || 0);
                row = ypos(row || 0);
            }

            return '<img'
                + id +  ' src="images/'
                + image  + '.png" class="'
                + cls + '" style="left:'
                + col + 'px;top:'
                + row  + 'px;'
                + wh  + '" />'
            ;
        }

        function atom_factory(atom_type, col, row) {

            var spec = gLevelSet.level.atoms[atom_type]
              , sAtom
              , bonds
              , bond
            ;

            atomCount += 1;
            sAtom = '<div id="atom-'
                + parentName + '-' + atomCount
                + '" class="atom" style="left:'
                + xpos(col) + 'px;top:'
                + ypos(row) + 'px;'
                + wh + '">';

            bonds = spec[1];
            for (bond = 0; bond < bonds.length; bond += 1) {
                sAtom += new_img('bond', bond_kind[bonds.charAt(bond)], -1);
            }
            sAtom += new_img('atom', item_kind[spec[0]], -1);

            return sAtom + '</div>';
        }

        function set_container_size(col, row) {
            xResizeTo(parent,
                col * cellWidth,
                row * cellHeight
            );
        }

        function clear_container() {
            parent.innerHTML = '&nbsp;';
        }

        return {
            parent: parent,
            xpos: xpos,
            ypos: ypos,
            cellWidth: cellWidth,
            cellHeight: cellHeight,
            atom_factory: atom_factory,
            new_img: new_img,
            set_container_size: set_container_size,
            clear_container: clear_container
        };
    }

    function addClickAtom(e, target, data) {
        xAddEventListener(e, 'mouseover', function (evt) {
            if (!gMoveFlag) {
                target(data);
            }
        }, false);
    }
    function addClickArrow(e, target, data) {
        xAddEventListener(e, 'mousedown', function (evt) {
            target(data);
        }, false);
    }

    function draw_arena() {

        var item
          , mol
          , row
          , col
          , sArena = []
          , sMolecule = []
        ;

        sArena.push(create_arrows());

        for (row = 0 ; row < gg.grid.length; row += 1) {
            item = gg.grid[row];
            for (col = 0; col < item.length; col += 1) {

                switch (item.charAt(col)) {
                case '#':
                    sArena.push(gA.new_img('wall', 'wall', col, row));
                    break;
                case '.':
                    break;
                default:
                    sArena.push(gA.atom_factory(item.charAt(col), col, row));
                    gItems.push({'row': row, 'col': col});
                }
            }
        }
        gA.parent.innerHTML = sArena.join('');
        gA.set_container_size(col, row);

        foreach(gItems, function (oAtom, i) {
            oAtom.atom = $('atom-arena-' + i);
            addClickAtom(oAtom.atom, onClickAtom, oAtom);
        });

        gArrows = [];
        foreach(sArrows, function (arrow) {
            arrow = $(arrow);
            gArrows.push(arrow);
            addClickArrow(arrow, onClickArrow, arrow);
        });

        mol = gLevelSet.level.molecule;
        for (row = 0 ; row < mol.length; row += 1) {
            item = mol[row];
            for (col = 0; col < item.length; col += 1) {
                if (item.charAt(col) !== '.') {
                    sMolecule.push(gM.atom_factory(item.charAt(col), col, row));
                }
            }
        }
        gM.parent.innerHTML = sMolecule.join('');
        gM.set_container_size(col, row);

        xWidth('arena-container', xWidth('arena') + arena_margin * 2);

        set_current(gItems[0]);
        show_arrows();

    }

    function show_level_data() {
        $('move-no').innerHTML = format(
            '<b>(Move: \f )</b>',
            gg.history.length
        );
    }

    function reset_level(level) {
        level.gameData = gg = {};
        gg.grid = copy_grid(level.arena);
        gg.molecule = level.molecule.join(
            gg.grid[0].replace(/./g, '.').substring(level.molecule[0].length)
        );
        gg.history = [];
        gg.redo = [];
        xMoveTo('molecule', 0, 0)
    }

    function test_for_success() {
        if (isSolution(gg.grid)) {
            onCompleteLevel();
        }
        else {
            show_arrows();
        }
    }

    function select_levelSet(name, setControl) {

        var i, select, options;

        if (setControl === true) {
            select = $('levelset-select');
            options = select.options;
            for (i = 0; i < options.length; i++) {
                if (options[i].text === name) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }

        if (!(name in gLevelSets)) {
            name = gLevelSetNames[0];
            $('levelset-select').selectedIndex = 0;
        }
        gLevelSet = gLevelSets[name];

        $('levelset-credits-credit').innerHTML = gLevelSet.credits;
        $('levelset-credits-license').innerHTML = gLevelSet.license;
        $('levelset-credits-name').innerHTML = format(
            '<a href="/atomix/levels/\f.json">\f</a>',
            gLevelSet.name,
            gLevelSet.name
        );

        forkey(gLevelSets, function (levelSet) {
            levelSet.show_selector(name);
        });
    }

    function start_level(lvl, reset) {

        lvl = lvl || 0;
        gItems = [];
        gArrows = [];

        gA = gridSpec('arena',
            gCellWidth, gCellHeight
        );
        gA.clear_container();

        gM = gridSpec('molecule',
            gMoleculeCellWidth, gMoleculeCellHeight
        );
        gM.clear_container();

        gLevelSet.select_level(lvl, reset);

        gCurrent = null;

        draw_arena();
        show_level_data();
        update_bookmark_link();

    }


    function show_bookmark_dialog(fnCallback) {

        var dlg = dlgBookmark
          , get = function (s) {return dlg.get(s);}
          , link = get('link')
          , blink = $('bookmark-link')
          , btnClose = get('button-close')
        ;

        if (btnClose) {
            btnClose.onclick = function () {
                dlg.hide();
            };
            link.href = blink.href;
            link.innerHTML = gLevelSet.name + ' ' + (gLevelSet.iLevel + 1);
            dlg.show();
        }
    }

    function show_success_dialog(sMsgHtml) {

        var dlg = dlgSuccess
          , get = function (s) {return dlg.get(s);}
          , btnSave = get('button-save')
          , btnClose = get('button-close')
        ;

        if (btnSave && btnClose) {
            get('message').innerHTML = sMsgHtml;
            btnSave.onclick = function () {
                dlg.hide();
                show_ajax_dialog();
            };
            btnClose.onclick = function () {
                dlg.hide();
            };
            dlg.show();
        }
    }

    function show_ajax_dialog() {

        var dlg = dlgAjax
          , get = function (s) {return dlg.get(s);}
          , btnClose = get('button-close')
          , oTitle = get('title')
          , oMsg = get('message')
        ;

        btnClose.onclick = function () {
            dlg.hide();
        };

        oMsg.innerHTML = 'Contacting server ...';
        oTitle.innerHTML = 'Submitting Solution';

        dlg.show();

        save_successful_move(function (text, status) {
            if (status) {
                text = '<p><b>Sorry</b>. Failed to contact server</p>';
            }
            oTitle.innerHTML = 'Submitted Solution';
            oMsg.innerHTML =  text;
            dlg.center();
        });

    }

    function parse_query() {

        var query = parse_location_search()
            , level
        ;

        if (!('levelSet' in query && query.levelSet in gLevelSets)) {
            query.levelSet = 'katomic';
        }
        level = query.level;

        query.level = 0;
        if (level && /^\d+$/.test(level)) {
            query.level = parseInt(level, 10) - 1;
        }
        return query;
    }

    // LevelSetClass

    function LevelSet(levelSet) {

        var self = Object.create(LevelSetClass);

        self.name = levelSet.name;
        self.credits = levelSet.credits;
        self.license = levelSet.license;
        self.levels = levelSet.levels;
        self.iLevel = 0;

        self.create_selector();

        gLevelSetNames.push(self.name);
        gLevelSets[self.name] = self;

        return self;
    }
    var LevelSetClass = {

        keys: [],
        selector: null,
        myid: '',

        getName: function () {
            return this.name;
        },

        create_selector: function () {

            if (this.selector) {
                return;
            }

            var level
              , select
            ;
            select = ['<select class="hide-selector" id="level-select-' + this.name + '">'];

            for (level = 0; level < this.levels.length;) {
                level += 1;
                select.push(
                    '<option value="' + level
                    + '">Level ' + level
                    + ': '
                    + this.levels[level - 1].name
                );
            }
            this.selector = 'level-select-' + this.name;
            $('level-selector-span').innerHTML += select.join('') + "</select>";

            return;
        },

        bind_selector: function (self) {

            xAddEventListener($(self.selector), 'change', function () {
                setTimeout(function () {
                    self.onLevelSelect();
                }, 100);
            }, false);
        },

        onLevelSelect: function () {
            start_level($(this.selector).selectedIndex);
        },

        show_selector: function (name) {

            var selector = $(this.selector);
            if (selector) {
                if (name && (this.name === name || this === name)) {
                    xRemoveClass(selector, 'hide-selector');
                    xAddClass(selector, 'show-selector');
                }
                else {
                    xRemoveClass(selector, 'show-selector');
                    xAddClass(selector, 'hide-selector');
                }
            }
        },

        select_level: function (lvl, reset) {

            lvl = lvl || 0;
            if (lvl >= this.levels.length) {
                lvl = 0;
            }
            this.iLevel = lvl;
            this.level = this.levels[lvl];

            if (!xDef(this.level.gameData) || reset === true) {
                reset_level(this.level);
            }
            else {
                gg = this.level.gameData;
                $(this.selector).selectedIndex = lvl;
                xMoveTo('molecule', 0, 0);
            }
        }
    };

    function init() {

        $ = xGetElementById;

        forkey(KP_ATOMIX.levelSets, function (levelSet) {
            LevelSet(levelSet);
        });

        forkey(gLevelSets, function (levelSet) {
            levelSet.bind_selector(levelSet);
        });

        var query = parse_query();

        setup_controls();
        create_levelset_selectors();

        select_levelSet(query.levelSet, true);
        gLevelSet.select_level(query.level, true);


        xEnableDrag('molecule');
        xEnableDrag('arena', cancel, cancel, cancel);

        if (query.history) {
            query.history = decode_history(query.history);
            try {
                replay_moves(query.history, gg.grid);
                gg.history = query.history;
            }
            catch (e) {
                alert(e.message);
            }
        }

        dlgSuccess = kp_ModalDialog('success-dialog');
        dlgBookmark = kp_ModalDialog('bookmark-dialog');
        dlgAjax = kp_ModalDialog('ajax-dialog');

        gAjaxRequest = new xHttpRequest();
        dlgSuccess.get('user').value = gUserName;

        xAddEventListener(document, 'keydown', onKeydown, false);

        start_level(query.level);

        xHeight('loading', 0);
    }

    /* My extensions to xlib */

    var kp_Shield = (function(zMin, zIncr)  {

      zMin = zMin || 10000
      zIncr = zIncr || 100

      var zList = [0]
        , _shield = null
      ;

      function isUp() {
        return zList.length  > 1;
      }

      function shield() {
        return _shield || create();
      };

      function create() {
        if (_shield) return _shield;
        _shield = document.createElement('div');
        _shield.className = 'xShieldElement';
        document.body.appendChild(_shield);
        zIndex(zMin);
        return _shield;
      }

      function show(z) {
        var e = shield()
          , ds = xDocSize()
        ;
        zIndex(z);
        xMoveTo(e, 0, 0);
        xResizeTo(e,
          Math.max(ds.w, xClientWidth()),
          Math.max(ds.h, xClientHeight())
        )
      }

      function hide() {
        var e = shield();
        xResizeTo(e, 10, 10);
        xMoveTo(e, -10, -10);
      }

      function zNext(z) {
        return Math.max(zMin, z || 0, zList[0]) + zIncr;
      }

      function zIndex(z) {
        return kp_zIndex(shield(), z);
      }

      function grab(z) {
        z = zNext(z);
        zList.unshift(z);
        show(z);
        return z;
      }

      function release() {
        switch (zList.length) {
          case 0:
            zList = [0]
          case 1:
            break;
          default:
            (zList.shift());
            show(zList[0]);
        }
        if (zList.length < 2) {
          hide();
        }
        return zList.length - 1;
      }

      return {
        grab: grab,
        release: release,
        isUp: isUp
      };

    }());

    function kp_ModalDialog(sId) {

      addClass('xxModalDialog');

      function get(s) {
        return xGetElementById(sId + (s ? '-' + s : ''));
      };

      function addClass(c, s) {
        xAddClass(get(s), c);
      }

      function show() {
        zIndex(kp_Shield.grab() + 1);
        return center();
      }

      function hide() {
        var dialog = get();
        if (dialog) {
          xMoveTo(dialog, -xWidth(dialog), 0);
        }
        kp_Shield.release();
      }

      function center () {
        var dialog = get();
        dialog.style.height = 'auto';
        xCenter(dialog);
        return this;
      }

      function zIndex(z) {
        kp_zIndex(get(), z);
      }

      return {
        show: show,
        hide: hide,
        get: get,
        center: center
      };

    };

    function kp_zIndex(e, z) {
      if (!(
        (e = xGetElementById(e)) &&
        xDef(e.style, e.style.zIndex)
      )) {
        return 0;
      }
      if (xDef(z) && xNum(z)) {
          e.style.zIndex = z;
      }
      z = xGetComputedStyle(e, 'zIndex', 1);
      return isNaN(z) ? 0 : z;
    }

    (function() {
      if ((typeof Object.create) !== 'undefined') return;
      Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
      }
    }());

    // Code in this section is automatically generated
    // Any changes will be lost on the next build
    //INCLUDE_XLIB

// xAddClass r3, Copyright 2005-2007 Daniel Frechette - modified by Mike Foster
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xAddClass(e, c)
{
  if ((e=xGetElementById(e))!=null) {
    var s = '';
    if (e.className.length && e.className.charAt(e.className.length - 1) != ' ') {
      s = ' ';
    }
    if (!xHasClass(e, c)) {
      e.className += s + c;
      return true;
    }
  }
  return false;
}

// xAddEventListener r8, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xAddEventListener(e,eT,eL,cap)
{
  if(!(e=xGetElementById(e)))return;
  eT=eT.toLowerCase();
  if(e.addEventListener)e.addEventListener(eT,eL,cap||false);
  else if(e.attachEvent)e.attachEvent('on'+eT,eL);
  else {
    var o=e['on'+eT];
    e['on'+eT]=typeof o=='function' ? function(v){o(v);eL(v);} : eL;
  }
}

// xAniLine r1, Copyright 2006-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xAniLine(e, x, y, t, a, oe)
{
  if (!(e=xGetElementById(e))) return;
  var x0 = xLeft(e), y0 = xTop(e); // start positions
  x = Math.round(x); y = Math.round(y);
  var dx = x - x0, dy = y - y0; // displacements
  var fq = 1 / t; // frequency
  if (a) fq *= (Math.PI / 2);
  var t0 = new Date().getTime(); // start time
  var tmr = setInterval(
    function() {
      var et = new Date().getTime() - t0; // elapsed time
      if (et < t) {
        var f = et * fq; // constant velocity
        if (a == 1) f = Math.sin(f); // sine acceleration
        else if (a == 2) f = 1 - Math.cos(f); // cosine acceleration
        f = Math.abs(f);
        e.style.left = Math.round(f * dx + x0) + 'px'; // instantaneous positions
        e.style.top = Math.round(f * dy + y0) + 'px';
      }
      else {
        clearInterval(tmr);
        e.style.left = x + 'px'; // target positions
        e.style.top = y + 'px';
        if (typeof oe == 'function') oe(); // 'onEnd' handler
        else if (typeof oe == 'string') eval(oe);
      }
    }, 10 // timer resolution
  );
}

// xCamelize r1, Copyright 2007-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xCamelize(cssPropStr)
{
  var i, c, a, s;
  a = cssPropStr.split('-');
  s = a[0];
  for (i=1; i<a.length; ++i) {
    c = a[i].charAt(0);
    s += a[i].replace(c, c.toUpperCase());
  }
  return s;
}

// xCenter r1, Copyright 2009 Arthur Blake (http://arthur.blake.name)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
/**
 * Center a positioned element within the current client window space.
 *
 * If w,h not specified, then the existing width and height of e are used.
 *
 * @param e an existing absolutely positioned dom element (or an id to such an element)
 * @param w (optional) width to resize element to
 * @param h (optional) height  to resize element to
 */
function xCenter(e, w, h)
{
  var ww=xClientWidth(),wh=xClientHeight(),x=0,y=0;
  e = xGetElementById(e);
  if (e)
  {
    w = w || xWidth(e);
    h = h || xHeight(e);

    if (ww < w)
    {
      w = ww;
    }
    else
    {
      x = (ww - w) / 2;
    }
    if (wh < h)
    {
      h = wh;
    }
    else
    {
      y = (wh - h) / 2;
    }

    // adjust for any scrolling
    x += xScrollLeft();
    y += xScrollTop();

    xResizeTo(e, w, h);
    xMoveTo(e, x, y);
  }
}

// xClientHeight r6, Copyright 2001-2008 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xClientHeight()
{
  var v=0,d=document,w=window;
  if((!d.compatMode || d.compatMode == 'CSS1Compat') /* && !w.opera */ && d.documentElement && d.documentElement.clientHeight)
    {v=d.documentElement.clientHeight;}
  else if(d.body && d.body.clientHeight)
    {v=d.body.clientHeight;}
  else if(xDef(w.innerWidth,w.innerHeight,d.width)) {
    v=w.innerHeight;
    if(d.width>w.innerWidth) v-=16;
  }
  return v;
}

// xClientWidth r5, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xClientWidth()
{
  var v=0,d=document,w=window;
  if((!d.compatMode || d.compatMode == 'CSS1Compat') && !w.opera && d.documentElement && d.documentElement.clientWidth)
    {v=d.documentElement.clientWidth;}
  else if(d.body && d.body.clientWidth)
    {v=d.body.clientWidth;}
  else if(xDef(w.innerWidth,w.innerHeight,d.height)) {
    v=w.innerWidth;
    if(d.height>w.innerHeight) v-=16;
  }
  return v;
}

// xDef r2, Copyright 2001-2011 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xDef()
{
  for (var i=0, l=arguments.length; i<l; ++i) {
    if (typeof(arguments[i]) === 'undefined')
      return false;
  }
  return true;
}

// xDocSize r1, Copyright 2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xDocSize()
{
  var b=document.body, e=document.documentElement;
  var esw=0, eow=0, bsw=0, bow=0, esh=0, eoh=0, bsh=0, boh=0;
  if (e) {
    esw = e.scrollWidth;
    eow = e.offsetWidth;
    esh = e.scrollHeight;
    eoh = e.offsetHeight;
  }
  if (b) {
    bsw = b.scrollWidth;
    bow = b.offsetWidth;
    bsh = b.scrollHeight;
    boh = b.offsetHeight;
  }
//  alert('compatMode: ' + document.compatMode + '\n\ndocumentElement.scrollHeight: ' + esh + '\ndocumentElement.offsetHeight: ' + eoh + '\nbody.scrollHeight: ' + bsh + '\nbody.offsetHeight: ' + boh + '\n\ndocumentElement.scrollWidth: ' + esw + '\ndocumentElement.offsetWidth: ' + eow + '\nbody.scrollWidth: ' + bsw + '\nbody.offsetWidth: ' + bow);
  return {w:Math.max(esw,eow,bsw,bow),h:Math.max(esh,eoh,bsh,boh)};
}

// xEnableDrag r8, Copyright 2002-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xEnableDrag(id,fS,fD,fE)
{
  var mx = 0, my = 0, el = xGetElementById(id);
  if (el) {
    el.xDragEnabled = true;
    xAddEventListener(el, 'mousedown', dragStart, false);
  }
  // Private Functions
  function dragStart(e)
  {
    if (el.xDragEnabled) {
      var ev = new xEvent(e);
      xPreventDefault(e);
      mx = ev.pageX;
      my = ev.pageY;
      xAddEventListener(document, 'mousemove', drag, false);
      xAddEventListener(document, 'mouseup', dragEnd, false);
      if (fS) {
        fS(el, ev.pageX, ev.pageY, ev);
      }
    }
  }
  function drag(e)
  {
    var ev, dx, dy;
    xPreventDefault(e);
    ev = new xEvent(e);
    dx = ev.pageX - mx;
    dy = ev.pageY - my;
    mx = ev.pageX;
    my = ev.pageY;
    if (fD) {
      fD(el, dx, dy, ev);
    }
    else {
      xMoveTo(el, xLeft(el) + dx, xTop(el) + dy);
    }
  }
  function dragEnd(e)
  {
    var ev = new xEvent(e);
    xPreventDefault(e);
    xRemoveEventListener(document, 'mouseup', dragEnd, false);
    xRemoveEventListener(document, 'mousemove', drag, false);
    if (fE) {
      fE(el, ev.pageX, ev.pageY, ev);
    }
    if (xEnableDrag.drop) {
      xEnableDrag.drop(el, ev);
    }
  }
}

xEnableDrag.drops = []; // static property

// xEvent r11-a, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
// Modified by kp
function xEvent(evt) // object prototype
{
  var e = evt || window.event;
  if (!e) return;
  this.type = e.type;
  this.target = e.target || e.srcElement;

  if (xDef(e.pageX)) {
    this.pageX = e.pageX;
    this.pageY = e.pageY;
  }
  else if (xDef(e.clientX)) {
    this.pageX = e.clientX + xScrollLeft();
    this.pageY = e.clientY + xScrollTop();
  }
  if (xDef(e.offsetX)) {
    this.offsetX = e.offsetX;
    this.offsetY = e.offsetY;
  }
  else {
    this.offsetX = this.pageX - xPageX(this.target);
    this.offsetY = this.pageY - xPageY(this.target);
  }

  this.keyCode = e.keyCode || e.which || 0;
  this.shiftKey = e.shiftKey;
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;

  if (typeof e.type == 'string') {

    switch (e.type.toLowerCase()) {
      case 'mouseover':
      case 'onmouseover':
        this.relatedTarget = e.relatedTarget || e.fromElement
      case 'mouseout':
      case 'onmouseout':
        this.relatedTarget = e.relatedTarget || e.toElement;
      case 'default':
        this.realatedTarget = null;
      }

    if (e.type.indexOf('click') != -1) {
      this.button = 0;
    }
    else if (e.type.indexOf('mouse') != -1) {

      if (e.which) {
        this.button = e.which;
      } else {
        switch (e.button) {
          case 2:
            this.button = 3;
            break;
          case 4:
            this.button = 2;
            break;
          default:
            this.button = 1;
        }
      }
    }
  }
}

// xGetComputedStyle r7, Copyright 2002-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xGetComputedStyle(e, p, i)
{
  if(!(e=xGetElementById(e))) return null;
  var s, v = 'undefined', dv = document.defaultView;
  if(dv && dv.getComputedStyle){
    s = dv.getComputedStyle(e,'');
    if (s) v = s.getPropertyValue(p);
  }
  else if(e.currentStyle) {
    v = e.currentStyle[xCamelize(p)];
  }
  else return null;
  return i ? (parseInt(v) || 0) : v;
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

// xHasClass r3, Copyright 2005-2007 Daniel Frechette - modified by Mike Foster
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xHasClass(e, c)
{
  e = xGetElementById(e);
  if (!e || e.className=='') return false;
  var re = new RegExp("(^|\\s)"+c+"(\\s|$)");
  return re.test(e.className);
}

// xHeight r8, Copyright 2001-2010 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xHeight(e,h)
{
  var css, pt=0, pb=0, bt=0, bb=0;
  if(!(e=xGetElementById(e))) return 0;
  if (xNum(h)) {
    if (h<0) h = 0;
    else h=Math.round(h);
  }
  else h=-1;
  css=xDef(e.style);
  if (e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    h = xClientHeight();
  }
  else if(css && xDef(e.offsetHeight) && xStr(e.style.height)) {
    if(h>=0) {
      if (document.compatMode=='CSS1Compat') {
        pt=xGetComputedStyle(e,'padding-top',1);
        if (pt !== null) {
          pb=xGetComputedStyle(e,'padding-bottom',1);
          bt=xGetComputedStyle(e,'border-top-width',1);
          bb=xGetComputedStyle(e,'border-bottom-width',1);
        }
        // Should we try this as a last resort?
        // At this point getComputedStyle and currentStyle do not exist.
        else if(xDef(e.offsetHeight,e.style.height)){
          e.style.height=h+'px';
          pt=e.offsetHeight-h;
        }
      }
      h-=(pt+pb+bt+bb);
      if(isNaN(h)||h<0) return;
      else e.style.height=h+'px';
    }
    h=e.offsetHeight;
  }
  else if(css && xDef(e.style.pixelHeight)) {
    if(h>=0) e.style.pixelHeight=h;
    h=e.style.pixelHeight;
  }
  return h;
}

// xHttpRequest r11, Copyright 2006-2011 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xHttpRequest() // object prototype
{
  // Private Properties
  var
    _i = this, // instance object
    _r = null, // XMLHttpRequest object
    _t = null, // timer
    _f = null, // callback function
    _x = false, // XML response pending
    _o = null, // user data object passed to _f
    _c = false; // self-clean after send() completed?
  // Public Properties
  _i.OK = 0;
  _i.NOXMLOBJ = 1;
  _i.REQERR = 2;
  _i.TIMEOUT = 4;
  _i.RSPERR = 8;
  _i.NOXMLCT = 16;
  _i.ABORTED = 32;
  _i.status = _i.OK;
  _i.error = null;
  _i.busy = false;
  // Private Methods
  function _clean()
  {
    _i = null;
    _r = null;
    _t = null;
    _f = null;
    _x = false;
    _o = null;
    _c = false;
  }
  function _clrTimer()
  {
    if (_t) {
      clearTimeout(_t);
    }
    _t = null;
  }
  function _endCall()
  {
    if (_f) {
      _f(_r, _i.status, _o);
    }
    _f = null; _x = false; _o = null;
    _i.busy = false;
    if (_c) {
      _clean();
    }
  }
  function _abort(s)
  {
    _clrTimer();
    try {
      _r.onreadystatechange = function(){};
      _r.abort();
    }
    catch (e) {
      _i.status |= _i.RSPERR;
      _i.error = e;
    }
    _i.status |= s;
    _endCall();
  }
  function _newXHR()
  {
    try { _r = new XMLHttpRequest(); }
    catch (e) { try { _r = new ActiveXObject('Msxml2.XMLHTTP'); }
    catch (e) { try { _r = new ActiveXObject('Microsoft.XMLHTTP'); }
    catch (e) { _r = null; _i.error = e; }}}
    if (!_r) { _i.status |= _i.NOXMLOBJ; }
  }
  // Private Event Listeners
  function _oc() // onReadyStateChange
  {
    var ct;
    if (_r.readyState == 4) {
      _clrTimer();
      try {
        if (_r.status != 200) _i.status |= _i.RSPERR;
        if (_x) {
          ct = _r.getResponseHeader('Content-Type');
          if (ct && ct.indexOf('xml') == -1) { _i.status |= _i.NOXMLCT; }
        }
        delete _r['onreadystatechange']; // _r.onreadystatechange = null;
      }
      catch (e) {
        _i.status |= _i.RSPERR;
        _i.error = e;
      }
      _endCall();
    }
  }
  function _ot() // onTimeout
  {
    _t = null;
    _abort(_i.TIMEOUT);
  }
  // Public Methods
  this.send = function(m, u, d, t, r, x, o, f, c)
  {
    var q, ct;
    if (!_r || _i.busy) { return false; }
    _c = (c ? true : false);
    m = m.toUpperCase();
    q = (u.indexOf('?') >= 0);
    if (m != 'POST') {
      if (d) {
        u += (q ? '&' : '?') + d;
        q = true;
      }
      d = null;
    }
    if (r) {
      u += (q ? '&' : '?') + r + '=' + Math.random();
    }
    _x = (x ? true : false);
    _o = o;
    _f = f;
    _i.busy = true;
    _i.status = _i.OK;
    _i.error = null;
    if (t) { _t = setTimeout(_ot, t); }
    try {
      _r.open(m, u, true);
      if (m == 'GET') {
        _r.setRequestHeader('Cache-Control', 'no-cache');
        ct = 'text/' + (_x ? 'xml':'plain');
        if (_r.overrideMimeType) {_r.overrideMimeType(ct);}
        _r.setRequestHeader('Content-Type', ct);
      }
      else if (m == 'POST') {
        _r.setRequestHeader('Method', 'POST ' + u + ' HTTP/1.1');
        _r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      _r.onreadystatechange = _oc;
      _r.send(d);
    }
    catch(e) {
      _clrTimer();
      _f = null; _x = false; _o = null;
      _i.busy = false;
      _i.status |= _i.REQERR;
      _i.error = e;
      if (_c) {
        _clean();
      }
      return false;
    }
    return true;
  };
  this.abort = function()
  {
    if (!_r || !_i.busy) { return false; }
    _abort(_i.ABORTED);
    return true;
  };
  this.reinit = function()
  {
    // Halt any HTTP request that may be in progress.
    this.abort();
    // Set all private vars to initial state.
    _clean();
    _i = this;
    // Set all (non-constant) public properties to initial state.
    _i.status = _i.OK;
    _i.error = null;
    _i.busy = false;
    // Create the private XMLHttpRequest object.
    _newXHR();
    return true;
  };
  // Constructor Code
  _newXHR();
}

// xLeft r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xLeft(e, iX)
{
  if(!(e=xGetElementById(e))) return 0;
  var css=xDef(e.style);
  if (css && xStr(e.style.left)) {
    if(xNum(iX)) e.style.left=iX+'px';
    else {
      iX=parseInt(e.style.left);
      if(isNaN(iX)) iX=xGetComputedStyle(e,'left',1);
      if(isNaN(iX)) iX=0;
    }
  }
  else if(css && xDef(e.style.pixelLeft)) {
    if(xNum(iX)) e.style.pixelLeft=iX;
    else iX=e.style.pixelLeft;
  }
  return iX;
}

// xMoveTo r1, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xMoveTo(e,x,y)
{
  xLeft(e,x);
  xTop(e,y);
}

// xNum r3, Copyright 2001-2011 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xNum()
{
  for (var i=0, l=arguments.length; i<l; ++i) {
    if (isNaN(arguments[i]) || typeof(arguments[i]) !== 'number')
      return false;
  }
  return true;
}

// xPageX r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xPageX(e)
{
  var x = 0;
  e = xGetElementById(e);
  while (e) {
    if (xDef(e.offsetLeft)) x += e.offsetLeft;
    e = xDef(e.offsetParent) ? e.offsetParent : null;
  }
  return x;
}

// xPageY r4, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xPageY(e)
{
  var y = 0;
  e = xGetElementById(e);
  while (e) {
    if (xDef(e.offsetTop)) y += e.offsetTop;
    e = xDef(e.offsetParent) ? e.offsetParent : null;
  }
  return y;
}

// xPreventDefault r1, Copyright 2004-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xPreventDefault(e)
{
  if (e && e.preventDefault) e.preventDefault();
  else if (window.event) window.event.returnValue = false;
}

// xRemoveClass r3, Copyright 2005-2007 Daniel Frechette - modified by Mike Foster
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xRemoveClass(e, c)
{
  if(!(e=xGetElementById(e))) return false;
  e.className = e.className.replace(new RegExp("(^|\\s)"+c+"(\\s|$)",'g'),
    function(str, p1, p2) { return (p1 == ' ' && p2 == ' ') ? ' ' : ''; }
  );
  return true;
}

// xRemoveEventListener r6, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xRemoveEventListener(e,eT,eL,cap)
{
  if(!(e=xGetElementById(e)))return;
  eT=eT.toLowerCase();
  if(e.removeEventListener)e.removeEventListener(eT,eL,cap||false);
  else if(e.detachEvent)e.detachEvent('on'+eT,eL);
  else e['on'+eT]=null;
}

// xResizeTo r2, Copyright 2001-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xResizeTo(e, w, h)
{
  return {
    w: xWidth(e, w),
    h: xHeight(e, h)
  };
}

// xScrollLeft r4, Copyright 2001-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xScrollLeft(e, bWin)
{
  var w, offset=0;
  if (!xDef(e) || bWin || e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    w = window;
    if (bWin && e) w = e;
    if(w.document.documentElement && w.document.documentElement.scrollLeft) offset=w.document.documentElement.scrollLeft;
    else if(w.document.body && xDef(w.document.body.scrollLeft)) offset=w.document.body.scrollLeft;
  }
  else {
    e = xGetElementById(e);
    if (e && xNum(e.scrollLeft)) offset = e.scrollLeft;
  }
  return offset;
}

// xScrollTop r4, Copyright 2001-2009 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xScrollTop(e, bWin)
{
  var w, offset=0;
  if (!xDef(e) || bWin || e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    w = window;
    if (bWin && e) w = e;
    if(w.document.documentElement && w.document.documentElement.scrollTop) offset=w.document.documentElement.scrollTop;
    else if(w.document.body && xDef(w.document.body.scrollTop)) offset=w.document.body.scrollTop;
  }
  else {
    e = xGetElementById(e);
    if (e && xNum(e.scrollTop)) offset = e.scrollTop;
  }
  return offset;
}

// xStopPropagation r1, Copyright 2004-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xStopPropagation(evt)
{
  if (evt && evt.stopPropagation) evt.stopPropagation();
  else if (window.event) window.event.cancelBubble = true;
}

// xStr r2, Copyright 2001-2011 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xStr(s)
{
  for (var i=0, l=arguments.length; i<l; ++i) {
    if (typeof(arguments[i]) !== 'string')
      return false;
  }
  return true;
}

// xTop r2, Copyright 2001-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xTop(e, iY)
{
  if(!(e=xGetElementById(e))) return 0;
  var css=xDef(e.style);
  if(css && xStr(e.style.top)) {
    if(xNum(iY)) e.style.top=iY+'px';
    else {
      iY=parseInt(e.style.top);
      if(isNaN(iY)) iY=xGetComputedStyle(e,'top',1);
      if(isNaN(iY)) iY=0;
    }
  }
  else if(css && xDef(e.style.pixelTop)) {
    if(xNum(iY)) e.style.pixelTop=iY;
    else iY=e.style.pixelTop;
  }
  return iY;
}

// xWidth r8, Copyright 2001-2010 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xWidth(e,w)
{
  var css, pl=0, pr=0, bl=0, br=0;
  if(!(e=xGetElementById(e))) return 0;
  if (xNum(w)) {
    if (w<0) w = 0;
    else w=Math.round(w);
  }
  else w=-1;
  css=xDef(e.style);
  if (e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    w = xClientWidth();
  }
  else if(css && xDef(e.offsetWidth) && xStr(e.style.width)) {
    if(w>=0) {
      if (document.compatMode=='CSS1Compat') {
        pl=xGetComputedStyle(e,'padding-left',1);
        if (pl !== null) {
          pr=xGetComputedStyle(e,'padding-right',1);
          bl=xGetComputedStyle(e,'border-left-width',1);
          br=xGetComputedStyle(e,'border-right-width',1);
        }
        // Should we try this as a last resort?
        // At this point getComputedStyle and currentStyle do not exist.
        else if(xDef(e.offsetWidth,e.style.width)){
          e.style.width=w+'px';
          pl=e.offsetWidth-w;
        }
      }
      w-=(pl+pr+bl+br);
      if(isNaN(w)||w<0) return;
      else e.style.width=w+'px';
    }
    w=e.offsetWidth;
  }
  else if(css && xDef(e.style.pixelWidth)) {
    if(w>=0) e.style.pixelWidth=w;
    w=e.style.pixelWidth;
  }
  return w;
}


    //INCLUDE_XLIB_END

    KP_ATOMIX.init = init;

}());
