import DragTiles from "./DragTiles.mjs";

export default class SortTiles extends DragTiles {
	constructor(container, events) {
		super(container, events);
	}

	addTile(column, name, dir) {
		const newTile = document.createElement("span");
		newTile.dataset.column = column;
		newTile.dataset.dir = dir;
		newTile.innerText = `${name} | ${dir} `;
		//newTile.setAttribute("draggable", true)

		const removeBtn = document.createElement("button");
		removeBtn.addEventListener("click", () => this.removeTile.call(this, newTile));
		newTile.append(removeBtn);

		this.container.append(newTile);
	}

	removeTile(oldTile) {
		oldTile.remove();
	}

	addTiles(newTiles) {
		newTiles.forEach(({ column, name, dir }) => this.addTile(column, name, dir));
	}

	get sorOrder() {
		return this.value.map(({ column, dir }) => [ column, dir ]);
	}
}
