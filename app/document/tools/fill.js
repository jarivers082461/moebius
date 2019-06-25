const doc = require("../doc");
const {tools} = require("../ui/ui");
const {toolbar} = require("../ui/ui");
const mouse = require("../input/mouse");
const palette = require("../palette");
let enabled = false;

tools.on("start", (mode) => {
    enabled = (mode == tools.modes.FILL);
    if (enabled) toolbar.show_sample();
});

function fill(x, y, col) {
    const block = doc.get_half_block(x, y);
    if (block.is_blocky) {
        const target_color = block.is_top ? block.upper_block_color : block.lower_block_color;
        if (target_color == col) return;
        doc.start_undo();
        const queue = [{to: {x, y}, from: {x, y}}];
        while (queue.length) {
            const coord = queue.pop();
            const block = doc.get_half_block(coord.to.x, coord.to.y);
            if (block.is_blocky && ((block.is_top && block.upper_block_color == target_color) || (!block.is_top && block.lower_block_color == target_color))) {
                doc.set_half_block(coord.to.x, coord.to.y, col);
                if (coord.to.x > 0) queue.push({to: {x: coord.to.x - 1, y: coord.to.y}, from: Object.assign(coord.to)});
                if (coord.to.y > 0) queue.push({to: {x: coord.to.x, y: coord.to.y - 1}, from: Object.assign(coord.to)});
                if (coord.to.x < doc.columns - 1) queue.push({to: {x: coord.to.x + 1, y: coord.to.y}, from: Object.assign(coord.to)});
                if (coord.to.y < doc.rows * 2 - 1) queue.push({to: {x: coord.to.x, y: coord.to.y + 1}, from: Object.assign(coord.to)});
            } else if (block.is_vertically_blocky) {
                if (coord.from.y == coord.to.y - 1 && block.left_block_color == target_color) {
                    doc.change_data(coord.to.x, block.text_y, 221, col, block.right_block_color);
                } else if (coord.from.y == coord.to.y - 1 && block.right_block_color == target_color) {
                    doc.change_data(coord.to.x, block.text_y, 222, col, block.left_block_color);
                } else if (coord.from.y == coord.to.y + 1 && block.right_block_color == target_color) {
                    doc.change_data(coord.to.x, block.text_y, 222, col, block.left_block_color);
                } else if (coord.from.y == coord.to.y + 1 && block.left_block_color == target_color) {
                    doc.change_data(coord.to.x, block.text_y, 221, col, block.right_block_color);
                } else if (coord.from.x == coord.to.x - 1 && block.left_block_color == target_color) {
                    doc.change_data(coord.to.x, block.text_y, 221, col, block.right_block_color);
                } else if (coord.from.x == coord.to.x + 1 && block.right_block_color == target_color) {
                    doc.change_data(coord.to.x, block.text_y, 222, col, block.left_block_color);
                }
            }
        }
    }
}

mouse.on("down", (x, y, half_y, button, shift_key) => {
    if (!enabled) return;
    const {fg, bg} = palette;
    const col = (button == mouse.buttons.LEFT) ? fg : bg;
    fill(x, half_y, shift_key ? 0 : col);
});

mouse.on("move", (x, y) => {
    if (!enabled) return;
    toolbar.set_sample(x, y);
});