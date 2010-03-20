
KP_ATOMIX = (function () {

    var CELL_HEIGHT = 39,
        CELL_WIDTH = 41,
        OFFSET_X = 10,
        OFFSET_Y = 10,

        MOLECULE_CELL_HEIGHT = 24,
        MOLECULE_CELL_WIDTH = 24,
        MOLECULE_OFFSET_X = 10,
        MOLECULE_OFFSET_Y = 10,

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
            'D': 'connector-backslash'
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
            'H': 'bond-left-triple'
        },
        gItems,
        gArrows,
        sArrows = ['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down'],
        gCurrent,
        gA,
        gM,
        gMoveFlag,
        gLevelSelect,
        gUserName = 'anonymous',
        gAjaxRequest,

        iLevel,
        gLevel,
        gLevels,

        gg,
        //
        $ = xGetElementById;

    function foreach(c, f) {
        for (var i = 0; i < c.length; i += 1) {
            f(c[i], i, c);
        }
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
        var items = location.search,
            result = {};
            result.qKeys = [];
        if (!items.length) {
            return result;
        }
        foreach(items.substring(1).split('&'), function(item) {
            var value = item.split('=', 2),
                name = decodeURIComponent(value[0]);
            if (name == 'qKeys') return;
            if (value.length === 2) {
                value = decodeURIComponent(value[1]);
            } else {
                value = true;
            }
            if (!(name in result)) {
                result[name] = [];
                result.qKeys.push(name);
            }
            result[name].push(value);
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

    function create_selectors(lvl) {

        var i, level, name, form, select, selected;

        select = '<select id="level-select">';

        for (level = 0; level < gLevels.length; level += 1) {
            selected = (lvl === level) ? ' selected="selected"' : ''
            select += format(
                '<option\f>Level \f: \f</option>',
                selected,
                level + 1,
                gLevels[level].name
            );
        }
        $('selectors').innerHTML = select + "</select>";
        gLevelSelect = $('level-select');

        xAddEventListener(gLevelSelect, 'change', function () {
            setTimeout(onLevelSelect, 100);
        }, false);
        return;
    }

    function cancel(e) {
        xStopPropagation(e);
        xPreventDefault(e);
    }

    function decode_move(m) {
        m = m.split('-');
        m[0] = parseInt(m[0], 10);
        m[1] = parseInt(m[1], 10);
        m[2] = parseInt(m[2], 10);
        m[3] = parseInt(m[3], 10);
        return m;
    }

    function onLevelSelect() {
        start_level(gLevelSelect.selectedIndex);
    }

    function save_successful_move(save) {
        // a successfull move will be saved via ajax
        if (save) {
            var sData = [], response;
            foreach([
                    ['user', $('success-dialog-user').value],
                    ['levelSet', gLevelSet],
                    ['level', gLevel.id],
                    ['solution', gg.history]
                ],
                function (entry) {
                    sData.push(entry[0] + '=' + encodeURIComponent(entry[1]));
                }
            );
            sData = sData.join('&');

            response = gAjaxRequest.send(
                'POST',
                '/cgi-bin/atomix-save-move.py',
                sData,
                60000, // uTimeout milliseconds
                'sRndVar', // sData +  '&' + sRndVar + '=' + a_random_number.
                false, // bXml
                null, // a user data object
                function (req, status, data) {
                    var text = req.responseText;
                    alert(text);
                }
            );
        }
    }

    function onCompleteLevel() {
        show_success_dialog(
            format(
                "You completed this level <br /> in <b>\f</b> moves.",
                gg.history.length
            ),
            save_successful_move
        );
    }

    function setup_controls() {
        var ctrls = "test-dialog next-level prev-level history-reset history-undo history-redo";
        foreach(ctrls.split(' '), addClickLink);
    }

    function onClickLink(cmd) {

        var m, l;

        switch (cmd) {

        case 'test-dialog':
            onCompleteLevel();
            break;

        case 'next-level':
            l = gLevels.length - 1;
            if (iLevel < l) {
                gLevelSelect.selectedIndex = iLevel + 1;
                start_level(iLevel + 1);
            }
            return;

        case 'prev-level':
            if (iLevel > 0) {
                gLevelSelect.selectedIndex = iLevel - 1;
                start_level(iLevel - 1);
            }
            return;

        case 'history-reset':
            start_level(iLevel, true);
            return;

        case 'history-undo' :
            if (!gg.history.length || gMoveFlag) {
                return;
            }
            m = gg.history.pop();
            gg.redo.push(m);
            m = decode_move(m);
            gCurrent = get_item_rowcol(m[2], m[3]);
            move_current_atom(m[0], m[1]);
            return;

        case 'history-redo' :
            if (!gg.redo.length || gMoveFlag) {
                return;
            }
            m = gg.redo.pop();
            gg.history.push(m);
            m = decode_move(m);
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

        var row = gCurrent.row,
            col = gCurrent.col,
            cr = row,
            cc = col,
            grid = gg.grid,
            data = grid[row];

        switch (dir.id) {

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
            gg.history.push(format('\f-\f-\f-\f', cr, cc, row, col));
            gg.redo = [];
            move_current_atom(row, col, true);
        }
    }

    function resizeArena(x, y) {
        foreach(
            xGetElementsByClassName('wall', gArena, img),
            function (wall) {
                xResizeTo(wall, x, y);
            }
        );
    }

    function move_current_atom(row, col, testForSuccess) {

        var grid = gg.grid,
            cc = gCurrent.col,
            cr = gCurrent.row,
            //
            data;

        hide_arrows();
        show_level_data();

        data = grid[cr].charAt(cc);
        grid[cr] = grid[cr].slice(0, cc) + '.' + grid[cr].slice(cc + 1);
        grid[row] = grid[row].slice(0, col) + data + grid[row].slice(col + 1);
        gCurrent.row = row;
        gCurrent.col = col;
        data = 100 * Math.abs(cr - row + cc - col);
        gMoveFlag = true;
        xAniLine(gCurrent.atom, gA.xpos(col), gA.ypos(row), data, 1,
            function () {
                end_animation(testForSuccess);
            }
        );
    }

    function gridSpec(parentName, xOffset, yOffset, cellWidth, cellHeight) {

        var parent = xGetElementById(parentName),
            sGrid = "";

        atomCount = -1;

        function xpos(col) {
            return xOffset + col * cellWidth;
        }

        function ypos(row) {
            return yOffset + row * cellHeight;
        }

        function new_img(cls, image, col, row) {

            if (col < 0) {
                id = row ? format(' id="\f"', row) : '';
                col = 0;
                row = 0;
            } else {
                col = xpos(col || 0);
                row = ypos(row || 0);
            }

            return format(
                '<img\f src="images/\f.png" class="\f" style="left:\fpx;top:\fpx;width:\fpx;height:\fpx;" />',
                id, image, cls, col, row, cellWidth, cellHeight
            );
        }

        function createAtomDiv(col, row) {
            return format(
                '<div id="atom-\f-\f" class="atom" style="left:\fpx;top:\fpx;width:\fpx;height:\fpx;">',
                parentName, atomCount, xpos(col), ypos(row), cellWidth, cellHeight
            );
        }

        function atom_factory(atom_type, col, row) {

            var spec = gLevel.atoms[atom_type],
                atom, sAtom, oAtom, bonds, bond;

            atomCount += 1;
            sAtom = createAtomDiv(col, row);

            bonds = spec[1];
            for (bond = 0; bond < bonds.length; bond += 1) {
                sAtom += new_img('bond', bond_kind[bonds.charAt(bond)], -1);
            }
            sAtom += new_img('atom', item_kind[spec[0]], -1);

            if (parentName === 'arena') {
                oAtom = {'row': row, 'col': col};
                gItems.push(oAtom);
            }

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

        var item, mol,
            row, col,
            sArena,
            sMolecule = '';

        sArena = create_arrows();

        for (row = 0 ; row < gg.grid.length; row += 1) {
            item = gg.grid[row];
            for (col = 0; col < item.length; col += 1) {

                switch (item.charAt(col)) {
                case '#':
                    sArena += gA.new_img('wall', 'wall', col, row);
                    break;
                case '.':
                    break;
                default:
                    sArena += gA.atom_factory(item.charAt(col), col, row);
                }
            }
        }
        gA.parent.innerHTML = sArena;
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

        mol = gLevel.molecule;
        for (row = 0 ; row < mol.length; row += 1) {
            item = mol[row];
            for (col = 0; col < item.length; col += 1) {
                if (item.charAt(col) !== '.') {
                    sMolecule += gM.atom_factory(item.charAt(col), col, row);
                }
            }
        }
        gM.parent.innerHTML = sMolecule;
        gM.set_container_size(col, row);


        xMoveTo(gM.parent, xRight(gA.parent), xTop('main'));
        xHeight('main', xHeight('arena') + xHeight('move-controls'));

        xTop('move-controls', xTop('main') + xHeight('main'));
        xWidth('move-controls', xWidth('arena'));


        set_current(gItems[0]);
        show_arrows();

    }

    function show_level_data() {
        $('move-no').innerHTML = format(
            '<b>(Move: \f )</b>',
            gg.history.length
        );
    }

    function reset_level(lvl) {
        gLevel.gameData = gg = {};
        gg.grid = copy_grid(gLevel.arena);
        gg.history = [];
        gg.redo = [];
    }

    function test_for_success() {
        var grid = gg.grid.join('').replace(/#/g, '.'),
            molecule = gLevel.molecule.join(
                gg.grid[0].replace(/./g, '.').substring(gLevel.molecule[0].length)
            );
        if (grid.indexOf(molecule) !== -1) {
            onCompleteLevel();
        }
        else {
            show_arrows();
        }
    }

    function start_level(lvl, reset) {

        lvl = lvl || 0;
        gItems = [];
        gArrows = [];

        gA = gridSpec('arena',
            OFFSET_X, OFFSET_Y,
            CELL_WIDTH, CELL_HEIGHT
        );
        gA.clear_container();

        gM = gridSpec('molecule',
            MOLECULE_OFFSET_X, MOLECULE_OFFSET_Y,
            MOLECULE_CELL_WIDTH, MOLECULE_CELL_HEIGHT
        );
        gM.clear_container();

        gLevel = gLevels[lvl];
        iLevel = lvl;

        if (!xDef(gLevel.gameData) || reset === true) {
            reset_level();
        }
        else {
            gg = gLevel.gameData;
        }

        gCurrent = null;

        draw_arena();
        show_level_data();

    }

    function dialog(sId) {
        return xModalDialog.instances[sId];
    }

    function show_success_dialog(sMsgHtml, fnCallback)
    {
        var sId = 'success-dialog',
            btnSave = $(sId + '-button-save'),
            btnClose = $(sId + '-button-close');

        if (btnSave && btnClose) {
            $(sId + '-message').innerHTML = sMsgHtml;
            btnSave.onclick = btnClose.onclick = function () {
                fnCallback(this === btnSave);
                dialog(sId).hide();
            };
            dialog(sId).show();
        }
    }

    function parse_query() {

        var query = parse_location_search(),
            level,
            s;

        if (1 && query.qKeys.length) {
            s = [];
            foreach(query.qKeys, function(key) {
                s.push(format('\f: \f', key, query[key]));
            });
            alert('' + s.join('\n'));
        }
        if ('level' in query && /^\d+/.test(query.level)) {
            query.level = parseInt(query.level, 10);
        }
        else {
            query.level = 0;
        }
        return query;
    }

    function init(lvl) {

        var query = parse_query();

        gLevelSet = 'katomic';
        gLevels = KP_ATOMIX.levels[gLevelSet];

        lvl = query.level ? query.level - 1 : (lvl || 0)
        lvl = (lvl < gLevels.length) ? lvl : gLevels.length - 1

        setup_controls();
        create_selectors(lvl);

        xEnableDrag('molecule');
        xEnableDrag('arena', cancel, cancel, cancel);

        start_level(lvl);

        (new xModalDialog('success-dialog'));
        gAjaxRequest = new xHttpRequest();
        $('success-dialog-user').value = gUserName;
    }

    return {
        init: init,
        levels: {}
    };
}());
