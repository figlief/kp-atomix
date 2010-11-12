
if (typeof(KP_ATOMIX) === 'undefined') {
    KP_ATOMIX = {
        init: null,
        levelSets: {}
    };
}

(function () {

    var CELL_HEIGHT = 39,
        CELL_WIDTH = 41,
        OFFSET_X = 10,
        OFFSET_Y = 10,

        gCellHeight = CELL_HEIGHT,
        gCellWidth = CELL_WIDTH,

        MOLECULE_CELL_HEIGHT = 39,
        MOLECULE_CELL_WIDTH = 41,
        MOLECULE_OFFSET_X = 10,
        MOLECULE_OFFSET_Y = 10,

        gMoleculeCellHeight = MOLECULE_CELL_HEIGHT,
        gMoleculeCellWidth = MOLECULE_CELL_WIDTH,

        // time for atom to move one square (in milliseconds)
        ANIMATION_TIME = 100,
        gAnimationTime = ANIMATION_TIME,

        RIGHT = 0,
        LEFT = 1,
        UP = 2,
        DOWN = 3,

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
            '2': 'bond-top-right-double',
            '4': 'bond-bottom-left-double',
            '3': 'bond-bottom-right-double',
            '1': 'bond-top-left-double'
        },
        browserTitle = 'Atomix Online at SDF',
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

    function onKeydown(evt)
    {
        var e = new xEvent(evt),
            doneKey = true;

        switch (e.keyCode) {

        case 37:    // IE and Moz
        case 57387: // Opera 7
            onClickArrow('arrow-left');
            break;
        case 38:
        case 57385:
            onClickArrow('arrow-up');
            break;
        case 39:
        case 57388:
            onClickArrow('arrow-right');
            break;
        case 40:
        case 57386:
            onClickArrow('arrow-down');
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

        var select = ['<select id="levelset-select">'];

        foreach(gLevelSetNames, function (name) {
            select.push('<option>' + name + '</option>');
        });

        $('levelset-selector-span').innerHTML = select.join('') + "</select>";

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
        foreach('abcdefghijklmnopqrstuvwxyz'.split(''), function (s) {
            moveDecoder[s] = i;
            i += 1;
        });
    }
    create_move_decoder(0);

    // Modify a grid to reflect a sequence of moves.
    // Throws an Error if the move sequence is invalid.
    // Returns the modified grid otherwise.
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
            , dir
        ;

        for (moveIdx = 0; moveIdx < moveList.length; moveIdx += 1) {

            move = moveList[moveIdx];
            startRow = row = move[0];
            startCol = col = move[1];
            endRow = move[2];
            endCol = move[3];

            atom = grid[startRow][startCol];
            if (atom ===  '.' || atom === '#') {
                throw new Error('not an atom');
            }

            data = grid[row];

            if (startRow === endRow) {
                if (startCol === endCol) {
                    throw new Error('not moved!');
                }
                dir = RIGHT;
                if (startCol > endCol) {
                    dir = LEFT;
                }
            } else {
                if (startCol !== endCol) {
                    throw new Error('diagonal moves illegal!');
                }
                dir = DOWN;
                if (startRow > endRow) {
                    dir = UP;
                }
            }

            switch (dir) {

            case LEFT:
                while (data[col - 1] === '.') {
                    col -= 1;
                }
                break;
            case RIGHT:
                while (data[col + 1] === '.') {
                    col += 1;
                }
                break;
            case UP:
                while (grid[row - 1][col] === '.') {
                    row -= 1;
                }
                break;
            case DOWN:
                while (grid[row + 1][col] === '.') {
                    row += 1;
                }
                break;

            default:
                break;
            }

            if (row !== endRow || col !== endCol) {
                throw new Error('end points don\'t match');
            }
            move_in_grid(grid, startRow, startCol, row, col);
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

    function gridSpec(parentName, xOffset, yOffset, cellWidth, cellHeight) {

        var parent = $(parentName)
            , atomCount = -1
            , wh = 'width:' + cellWidth + 'px;height:' + cellHeight + 'px;'
        ;

        function xpos(col) {
            return xOffset + col * cellWidth;
        }

        function ypos(row) {
            return yOffset + row * cellHeight;
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
                xpos(col) + 2 * xOffset,
                ypos(row) + 2 * yOffset
            );
        }

        function clear_container() {
            parent.innerHTML = '&nbsp;';
        }

        return {
            parent: parent,
            xpos: xpos,
            ypos: ypos,
            xOffset: xOffset,
            yOffset: yOffset,
            cellWidth: cellWidth,
            cellHeight: cellHeight,
            atom_factory: atom_factory,
            new_img: new_img,
            set_container_size: set_container_size,
            clear_container: clear_container
        };
    }

    function addClick(e, target, data) {
        xAddEventListener(e, 'click', function (evt) {
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
            addClick(oAtom.atom, onClickAtom, oAtom);
        });

        gArrows = [];
        foreach(sArrows, function (arrow) {
            arrow = $(arrow);
            gArrows.push(arrow);
            addClick(arrow, onClickArrow, arrow);
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

        // xTop('main', xHeight('controls'));

        xMoveTo(gM.parent, xRight(gA.parent) + 25, xTop('arena'));
        //#xHeight('main', xHeight('arena') + xHeight('move-controls'));

        xTop('move-controls', xBottom('arena') + 20);
        xWidth('move-controls', xWidth('arena'));

        xTop('after-main', xBottom('move-controls') + 20);

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

        var i, select;

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
            OFFSET_X, OFFSET_Y,
            gCellWidth, gCellHeight
        );
        gA.clear_container();

        gM = gridSpec('molecule',
            MOLECULE_OFFSET_X, MOLECULE_OFFSET_Y,
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


        var self = xObject(LevelSetClass);

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
    LevelSetClass = {

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
                select.push(format(
                    '<option value="\f">Level \f: \f</option>',
                    level,
                    level,
                    this.levels[level - 1].name
                ));
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
                alert('Invalid History: ' + e);
            }
        }

        dlgSuccess = xxModalDialog('success-dialog');
        dlgBookmark = xxModalDialog('bookmark-dialog');
        dlgAjax = xxModalDialog('ajax-dialog');

        gAjaxRequest = new xHttpRequest();
        dlgSuccess.get('user').value = gUserName;

        xAddEventListener(document, 'keydown', onKeydown, false);

        start_level(query.level);

        xHeight('loading', 0);
    }

    KP_ATOMIX.init = init;

}());
