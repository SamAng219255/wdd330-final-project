import AnimeList from "./AnimeList.mjs";
import Filter from "./Filter.mjs";
import SortTiles from "./SortTiles.mjs";
const seasonalURL = "/mal/anime/season";
const rankedURL = "/mal/anime/ranking";

const fields = [
	"id",
	"main_picture",
	"alternative_titles",
	"synopsis",
	"mean",
	"rank",
	"popularity",
	"num_list_users",
	"genres",
	"media_type",
	"status",
	"rating",
	"studios",
];
/*
	According to official MAL communications, the reccomended method to filter nsfw content
	is to filter based on rating.

	Valid ratings and their meanings are as follows:
	g		G - All Ages
	pg		PG - Children
	pg_13	pg_13 - Teens 13 and Older
	r		R - 17+ (violence & profanity)
	r+		R+ - Profanity & Mild Nudity
	rx		Rx - Hentai

	Rating may also be absent. 

	Unfortunaetly, rating is also not fool-proof, but the remainder usually have the "Erotica" genre listed.

	I have to chosen to remove all hentai before applying user filters.
*/
const nsfw_filter = new Filter({
	type: "not",
	pattern: {
		type: "any",
		patterns: [
			{
				type: "is",
				key: "node.rating",
				value: "rx",
			},
			{
				type: "any_element",
				key: "node.genres",
				pattern: {
					type: "is",
					key: "name",
					value: "Erotica"
				}
			}
		]
	},
});
const seasonalList = new AnimeList(seasonalURL + "/2026/winter", {
	fields,
	nsfw: "true", // Built-in nsfw filtering is currently inaccurate according to official MAL communications
	limit: 100,
});
const rankedList = new AnimeList(rankedURL, {
	fields,
	nsfw: "true", // Built-in nsfw filtering is currently inaccurate according to official MAL communications
	limit: 100,
});

const animeList = document.getElementById("anime-list");
const animeTemplate = document.getElementById("anime-template");

function render(list) {
	console.log(list.data[0]?.node);
	list.display(animeList, animeTemplate);

	animeList.querySelectorAll(".card").forEach(card => {
		const descDiv = card.querySelector("div");
		if(descDiv.scrollHeight > descDiv.clientHeight) {
			card.classList.add("collapse");
			const showMore = card.querySelector(".anime-show-more");
			showMore.addEventListener("click", () => {
				if(card.classList.contains("show")) {
					card.classList.remove("show");
					showMore.innerText = "Show More";
				}
				else {
					card.classList.add("show");
					showMore.innerText = "Hide";
				}
			});
		}
	});
}

seasonalList.fetch(render, nsfw_filter);
//rankedList.fetch(render, nsfw_filter);

const filtersElem = document.getElementById("filters");
const showFiltersBtn = document.getElementById("show-filters");
showFiltersBtn.addEventListener("click", () => {
	if(filtersElem.classList.contains("show")) {
		filtersElem.classList.remove("show");
		showFiltersBtn.innerHTML = "&blacktriangleright; Show";
	}
	else {
		filtersElem.classList.add("show");
		showFiltersBtn.innerHTML = "&blacktriangledown; Hide";
	}
});

const seasonOptions = document.getElementById("season-options");
const viewSelect = document.getElementById("view-select");
viewSelect.addEventListener("change", () => {
	if(viewSelect.value == "seasonal") {
		seasonOptions.classList.add("show");
	}
	else {
		seasonOptions.classList.remove("show");
	}
});

const sortTiles = new SortTiles(document.getElementById("sort-container"), { onUpdate: console.log });
sortTiles.addTiles([
	{
		column: "node.title",
		name: "Title",
		dir: "desc",
	},
	{
		column: "node.num_list_users",
		name: "Number of Lists",
		dir: "desc",
	},
]);

const sortCols = [
	{
		name: "Title",
		column: "node.title",
	},
	{
		name: "Score",
		column: "node.mean",
	},
	{
		name: "Rank",
		column: "node.rank",
	},
	{
		name: "Popularity Score",
		column: "node.popularity",
	},
	{
		name: "Number of Lists",
		column: "node.num_list_users",
	},
	{
		name: "Media Type",
		column: "node.media_type",
	},
	{
		name: "Status",
		column: "node.status",
	},
];
const sortDirs = [ "asc", "desc" ];
const addSortMenu = document.getElementById("add-sort-menu").children[0];

function addSortOption({ target }) {
	const { column, name, dir } = target.dataset;
	sortTiles.addTile(column, name, dir);
	addSortMenu.classList.remove("show");
}
function clearSortOptions(e) {
	e.preventDefault();
	addSortMenu.classList.remove("show");
}

document.getElementById("add-sort").addEventListener("click", () => {
	addSortMenu.innerHTML = "";

	const curSortCols = sortTiles.value;
	sortCols.filter(col => !curSortCols.some(curCol => col.column == curCol.column)).forEach(col => sortDirs.forEach(dir => {
		const newSortOption = document.createElement("div");
		newSortOption.dataset.column = col.column;
		newSortOption.dataset.name = col.name;
		newSortOption.dataset.dir = dir;
		newSortOption.innerText = `${col.name} | ${dir}`;

		newSortOption.addEventListener("click", addSortOption);

		addSortMenu.append(newSortOption);
	}));

	addSortMenu.classList.add("show");

	document.removeEventListener("click", clearSortOptions);
	setTimeout(() => document.addEventListener("click", clearSortOptions, { once: true }), 1);
});
