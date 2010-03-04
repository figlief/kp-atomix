
KP_ATOMIX = (function () {

    var CELL_HEIGHT = 39,
        CELL_WIDTH = 41,
        OFFSET_X = 20,
        OFFSET_Y = 0,
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
        gCurrent,
        gArena,
        gMolecule,
        gMoveFlag,
        gLevelSelect,

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

    function addClickLink(cmd) {
        xAddEventListener($(cmd), 'click', function (e) {
            cancel(e);
            onClickLink(cmd);
        }, false);
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
            var arrow

            arrow = new_img(gArena, 'arrow', 'arrow-' + dir, -1);
            gArrows.push(arrow);
            xAddEventListener(arrow, 'click', function (evt) {
                onClickArrow(dir);
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


    function create_selectors(parent) {

        var i, name, form, select, option;

        gLevelSelect = select = document.createElement('select');
        parent.appendChild(select);

        for ( level = 0; level < gLevels.length; level += 1) {
            name = format('Level \f: \f', level + 1, gLevels[level].name);
            option = document.createElement('option');
            option.text = name;
            select.appendChild(option);
        }
        xAddEventListener(select, 'change', function (e) {
            setTimeout(function () {onLevelSelect(select, gLevel)}, 100);
        }, false);
        return ;

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

    function onCompleteLevel() {
        $('success-message').innerHTML = format(
            "You completed this level <br /> in <b>\f</b> moves.",
            gg.history.length
        );

        xModalDialog.instances['success-dialog'].show();
    }

    function setup_controls() {
        var ctrls = "test-dialog next-level prev-level history-reset history-undo history-redo";
        foreach(ctrls.split(' '), addClickLink )
    }

    function onClickLink(cmd) {

        var m, l;

        switch (cmd) {

        case 'test-dialog':
            onCompleteLevel();

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
            test_for_success();
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



    function new_img(parent, cls, image, top, left) {
        var element = document.createElement('img');
        parent.appendChild(element);
        xAddClass(element, cls);
        element.src = 'images/' + image + '.png';
        xTop(element, top);
        xLeft(element, left);
        return element;
    }

    function atom_factory(parent, atom_type, row, col) {

        var spec = gLevel.atoms[atom_type],
            atom, oAtom, bonds, bond;

        atom = document.createElement('div');
        parent.appendChild(atom);
        xAddClass(atom, 'atom');
        xTop(atom, ypos(row));
        xLeft(atom, xpos(col));

        oAtom = {'row': row, 'col': col, 'atom': atom};
        if (parent === gArena) {
            gItems.push(oAtom);
            xAddEventListener(atom, 'click', function (e) {
                onClickAtom(oAtom);
            }, false);
        }

        bonds = spec[1];
        for (bond = 0; bond < bonds.length; bond += 1) {
            new_img(atom, 'bond', bond_kind[bonds.charAt(bond)], 0, 0);
        }
        new_img(atom, 'atom', item_kind[spec[0]], 0, 0);

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
                    new_img(gArena, 'wall', 'wall', ypos(row), xpos(col));
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

        mol = gLevel.molecule;

        for (row = 0 ; row < mol.length; row += 1) {
            item = mol[row];
            for (col = 0; col < item.length; col += 1) {
                if (item.charAt(col) !== '.') {
                    atom_factory(gMolecule, item.charAt(col), row, col);
                }
            }
        }

        xMoveTo(gMolecule,
            xLeft(gArena) + xWidth(gArena) + 40,
            xTop('controls') + xHeight('controls') + 40
        );

        xWidth('move-controls', xWidth('arena'))

        set_current(gItems[0]);
        create_arrows();
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
        create_selectors($('selectors'));
        start_level(lvl);
        var dialog = new xModalDialog('success-dialog');
        xAddEventListener('success-form', 'submit', function(e){
            cancel(e);
            dialog.hide();
        });
    }

    return {
        init: init,
        levels: {}
    };
}());
