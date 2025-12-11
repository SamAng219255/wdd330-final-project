const getDragHandler = (dragged, fakeElem, clsInst) => e => {
	e.preventDefault();

	fakeElem.style.top = `${e.pageY}px`;
	fakeElem.style.left = `${e.pageX}px`;

	const { clientX, clientY } = e;
	const tiles = [ ...clsInst.container.children ];
	const firstRect = tiles[0].getBoundingClientRect();
	const lastRect = tiles[tiles.length - 1].getBoundingClientRect();
	const newMoveDir = Math.sign(e.movementX);
	if(newMoveDir != 0 && newMoveDir != dragDir) {
		dragDir = newMoveDir;
		passedElements = [];
	}
	// Above first tile
	if(e.clientY < firstRect.top) {
		if(clsInst.container.children[0] !== dragged) {
			const before = clsInst.json;
			clsInst.container.insertAdjacentElement("afterbegin", dragged);
			if(clsInst.json != before)
				clsInst.onDrag(clsInst.value);
		}
	}
	// Below last tile
	else if(e.clientY > lastRect.bottom) {
		if(clsInst.container.children[clsInst.container.children.length - 1] !== dragged) {
			const before = clsInst.json;
			clsInst.container.insertAdjacentElement("beforeend", dragged);
			if(clsInst.json != before)
				clsInst.onDrag(clsInst.value);
		}
	}
	// Within the height of the container.
	else {
		const draggedRect = dragged.getBoundingClientRect();
		// Before the dragged tile
		if(clientY < draggedRect.top || (clientX < draggedRect.left && clientY < draggedRect.bottom)) {
			const target = tiles.find(tile => {
				const { right, top, bottom } = tile.getBoundingClientRect();
				return clientY < top || (clientX < right && clientY < bottom);
			});
			if(target !== dragged && passedElements.indexOf(target) < 0) {
				passedElements.push(target);
				const before = clsInst.json;
				target.insertAdjacentElement("beforebegin", dragged);
				if(clsInst.json != before)
					clsInst.onDrag(clsInst.value);
			}
		}
		// After the dragged tile
		else if(clientY > draggedRect.bottom || clientX > draggedRect.right) {
			const target = tiles.findLast(tile => {
				const { left, top, bottom } = tile.getBoundingClientRect();
				return clientY > bottom || (clientX > left && clientY > top);
			});
			if(target.nextSibling !== dragged && passedElements.indexOf(target) < 0) {
				passedElements.push(target);
				const before = clsInst.json;
				target.insertAdjacentElement("afterend", dragged);
				if(clsInst.json != before)
					clsInst.onDrag(clsInst.value);
			}
		}
	}
};

let dragDir = 0;
let passedElements = [];

export default class DragTiles {
	constructor(container, {
		onUpdate = () => {
		}, onDrag = () => {
		},
	}) {
		this.container = container;
		this.onDrag = onDrag?.bind(this);
		this.onUpdate = onUpdate?.bind(this);
		container.addEventListener("mousedown", e => {
			let dragged = e.target;
			if(dragged === this.container)
				return;
			const containerChildren = [ ...container.children ];
			/*while(containerChildren.indexOf(dragged) < 0) {
				dragged = dragged.parentElement;
			}*/
			if(containerChildren.indexOf(dragged) < 0)
				return;
			dragDir = 0;
			passedElements = [];

			const fakeElem = dragged.cloneNode(true);
			document.body.append(fakeElem);
			fakeElem.style.position = "absolute";
			fakeElem.style.transform = "translate(-50%, -50%)"
			fakeElem.style.zIndex = "1000";
			fakeElem.style.cursor = "grabbing";
			fakeElem.style.top = `${e.pageY}px`;
			fakeElem.style.left = `${e.pageX}px`;

			dragged.classList.add("hide");
			const dragHandler = getDragHandler(e.target, fakeElem, this);
			const initVal = this.json;
			document.addEventListener("mousemove", dragHandler);
			document.addEventListener("mouseup", () => {
				document.removeEventListener("mousemove", dragHandler);
				dragged.classList.remove("hide");
				fakeElem.remove();
				if(this.json != initVal)
					this.onUpdate(this.value);
			}, { once: true });
		});
	}

	get value() {
		return [ ...this.container.children ].map(elem => Object.assign({}, elem.dataset));
	}

	get json() {
		return JSON.stringify(this.value);
	}
}
