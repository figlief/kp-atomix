
KP_ATOMIX = (function () {

    var CELL_HEIGHT = 39,
        CELL_WIDTH = 41,
        OFFSET_X = 20,
        OFFSET_Y = 0,
        item_kind = {
            '1': 'hydrogen',
            '2': 'carbon',
            '3': 'oxygen',
            '4': 'nitrogen',
            '5': 'sulphur',
            '6': 'fluorine',
            '7': 'chlorine',
            '8': 'bromine',
            '9': 'phosphorus',
            'o': 'crystal',
            'A': 'connector-horizontal',
            'B': 'connector-slash',
            'C': 'connector-vertical',
            'D': 'connector-backslash'
        },
        bond_kind = {
            'a': 'top-single',
            'b': 'top-right',
            'c': 'right-single',
            'd': 'bottom-right',
            'e': 'bottom-single',
            'f': 'bottom-left',
            'g': 'left-single',
            'h': 'top-left',
            'A': 'top-double',
            'B': 'right-double',
            'C': 'bottom-double',
            'D': 'left-double',
            'E': 'top-triple',
            'F': 'right-triple',
            'G': 'bottom-triple',
            'H': 'left-triple'
        },
        gItems,
        gArrows,
        gCurrent,
        gArena,
        gMolecule,
        gMoveFlag,

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
    function xpos(col) {
        return OFFSET_X + col * CELL_WIDTH;
    }
    function ypos(row) {
        return OFFSET_Y + row * CELL_HEIGHT;
    }
    function copy_grid(grid) {
        return grid.join('\n').split('\n');
    }

    function cbHistory(cmd) {
        return function (e) {
            onHistory(cmd);
            cancel();
        };
    }

    function setup_controls(self) {
        xAddEventListener($('next-level'), 'click', onNextLevel, false);
        xAddEventListener($('prev-level'), 'click', onPrevLevel, false);
        xAddEventListener($('history-reset'), 'click', cbHistory('reset'), false);
        xAddEventListener($('history-undo'), 'click', cbHistory('undo'), false);
        xAddEventListener($('history-redo'), 'click', cbHistory('redo'), false);

    }

    function end_animation() {
        show_arrows();
        gMoveFlag = false;
    }

    function show_arrow(arrow, row, col) {
        if (gg.grid[row].charAt(col) === '.') {
            xTop(arrow, ypos(row));
            xLeft(arrow, xpos(col));
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
        foreach('left right up down'.split(' '), function (dir) {
            var cell = new_cell(gArena, 'atom arrow-' + dir, 0, -1000);
            gArrows.push(cell);
            xAddEventListener(cell, 'click', function (evt) {
                onArrowClick(dir);
            }, false);
        });
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

    function new_cell(parent, cls, top, left) {
        var element = document.createElement('div');
        if (parent) {
            parent.appendChild(element);
        }
        xAddClass(element, cls);
        xTop(element, top);
        xLeft(element, left);
        return element;
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

    function onHistory(cmd) {

        var m;

        switch (cmd) {

        case 'reset':
            start_level(iLevel, true);
            return;

        case 'undo' :
            if (!gg.history.length || gMoveFlag) {
                return;
            }
            m = gg.history.pop();
            gg.redo.push(m);
            m = decode_move(m);
            gCurrent = get_item_rowcol(m[2], m[3]);
            move_current_atom(m[0], m[1]);
            return;

        case 'redo' :
            if (!gg.redo.length | gMoveFlag) {
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

    function onPrevLevel(e) {
        if (iLevel > 0) {
            start_level(iLevel - 1);
        }
        cancel();
    }

    function onNextLevel(e) {
        var l = gLevels.length - 1;
        if (iLevel < l) {
            start_level(iLevel + 1);
        }
        cancel();
    }

    function onClick(oAtom) {
        set_current(oAtom);
    }

    function onArrowClick(dir) {
        var row = gCurrent.row,
            col = gCurrent.col,
            cr = row,
            cc = col,
            grid = gg.grid,
            data = grid[row];

        switch (dir) {

        case 'left':
            while (data.charAt(col - 1) === '.') {
                col -= 1;
            }
            break;
        case 'right':
            while (data.charAt(col + 1) === '.') {
                col += 1;
            }
            break;
        case 'up':
            while (grid[row - 1].charAt(col) === '.') {
                row -= 1;
            }
            break;
        case 'down':
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
            move_current_atom(row, col);
        }
    }

    function move_current_atom(row, col) {

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
        xAniLine(gCurrent.atom, xpos(col), ypos(row), data, 1, end_animation);
    }

    function atom_factory(parent, a, row, col) {

        var spec = gLevel.atoms[a],
            atom, oAtom, bonds, bond;

        atom = new_cell(parent, 'atom', ypos(row), xpos(col));
        oAtom = {'row': row, 'col': col, 'atom': atom};
        if (parent === gArena) {
            gItems.push(oAtom);
            xAddEventListener(atom, 'click', function (e) {
                onClick(oAtom);
            }, false);
        }

        new_cell(atom, item_kind[spec[0]] + " atom");
        bonds = spec[1];
        for (bond = 0; bond < bonds.length; bond += 1) {
            new_cell(atom, 'bond ' + bond_kind[bonds.charAt(bond)], 0, 0);
        }
        return atom;
    }

    function draw_arena() {

        var item, mol,
            row, col;

        for (row = 0 ; row < gg.grid.length; row += 1) {
            item = gg.grid[row];
            for (col = 0; col < item.length; col += 1) {
                switch (item.charAt(col)) {

                case '#':
                    new_cell(gArena, 'arena-wall', ypos(row), xpos(col));
                    break;
                case '.':
                    break;
                default:
                    atom_factory(gArena, item.charAt(col), row, col);
                }
            }
        }

        xHeight(gArena, ypos(row));
        xWidth(gArena, xpos(col) + OFFSET_X);
        xWidth($('controls'),  xpos(col) + OFFSET_X);

        mol = gLevel.molecule;

        for (row = 0 ; row < mol.length; row += 1) {
            item = mol[row];
            for (col = 0; col < item.length; col += 1) {
                if (item.charAt(col) !== '.') {
                    atom_factory(gMolecule, item.charAt(col), row, col);
                }
            }
        }

        xMoveTo(gMolecule, xLeft(gArena) + xWidth(gArena) + 40, xTop(gArena) + 40);

        set_current(gItems[0]);
        create_arrows();
        show_arrows();

    }

    function show_level_data() {
        $('leveldata').innerHTML = format(
            '<h4>Level \f: \f (\f moves)</h4>',
            iLevel + 1,
            gLevel.name,
            gg.history.length
        );
    }

    function reset_level(lvl) {
        gLevel.gameData = gg = {};
        gg.grid = copy_grid(gLevel.arena);
        gg.history = [];
        gg.redo = [];
    }

    function start_level(lvl, reset) {

        lvl = lvl || 0;
        gItems = [];
        gArrows = [];

        gArena = $('arena');
        gArena.innerHTML = '&nbsp;';

        gMolecule = $('molecule');
        gMolecule.innerHTML =  '&nbsp;';

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

    function init(lvl) {
        gLevels = KP_ATOMIX.levels['katomic'];
        setup_controls();
        start_level(lvl);
    }

    return {
        init: init,
        levels: {}
    };
}());
