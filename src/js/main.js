import AnimeList from "./AnimeList.mjs";
import Filter from "./Filter.mjs";
import SortTiles from "./SortTiles.mjs";
import StringFilter from "./StringFilter.mjs";
const baseURL = "/mal/anime/";

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

	Rating may also be absent. Unfortunately, this means rating is also not a gurantee, but
	the remainder usually have the "Erotica" genre listed.

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
					key: "id",
					value: 49, // Erotica
				},
			},
		],
	},
});

function getList(url) {
	return new AnimeList(url, {
		fields,
		nsfw: "true", // Built-in nsfw filtering is currently inaccurate according to official MAL communications
		limit: 100,
	}, nsfw_filter);
}

const animeList = document.getElementById("anime-list");
const animeTemplate = document.getElementById("anime-template");

function render(list) {
	animeList.innerHTML = "";
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
	let url = baseURL + viewSelect.value;

	if(viewSelect.value == "season") {
		seasonOptions.classList.add("show");
		url += seasonOptions.value;
	}
	else
		seasonOptions.classList.remove("show");

	current_list = getList(url);
});

let current_list = getList(baseURL + viewSelect.value + seasonOptions.value);

const sortTiles = new SortTiles(document.getElementById("sort-container"), { onUpdate: updateView });
sortTiles.addTiles([
	{
		column: "node.num_list_users",
		name: "Number of Lists",
		dir: "desc",
	},
	{
		column: "node.title",
		name: "Title",
		dir: "asc",
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

function assembleFilterFromUI() {
	let filterSettings = {
		type: "all",
		patterns: [],
	};

	// Title filter
	const filterTitleStr = document.getElementById("filter-title").value;
	if(filterTitleStr)
		filterSettings.patterns.push(StringFilter.settingsFromString(filterTitleStr, "node.title"));

	// Synopsis filter
	const filterSynopsisStr = document.getElementById("filter-synopsis").value;
	if(filterSynopsisStr)
		filterSettings.patterns.push(StringFilter.settingsFromString(filterSynopsisStr, "node.synopsis"));

	// Range filter
	const filterScoreMinStr = document.getElementById("filter-score-min").value;
	const filterScoreMaxStr = document.getElementById("filter-score-max").value;
	if(filterScoreMinStr || filterScoreMaxStr)
		filterSettings.patterns.push({
			type: "range",
			key: "node.mean",
			min: filterScoreMinStr ? parseFloat(filterScoreMinStr) : undefined,
			max: filterScoreMaxStr ? parseFloat(filterScoreMaxStr) : undefined,
		});

	// Genre filter
	const filterGenreStr = document.getElementById("filter-genre").value;
	if(filterGenreStr)
		filterSettings.patterns.push(StringFilter.settingsFromStringForList(filterGenreStr, "node.genres", "name"));

	// Studio filter
	const filterStudioStr = document.getElementById("filter-studio").value;
	if(filterStudioStr)
		filterSettings.patterns.push(StringFilter.settingsFromStringForList(filterStudioStr, "node.studios", "name"));

	// Rating Filter
	const ratingFilterElem = [ ...document.querySelectorAll(".filter-rating:checked") ];
	if(ratingFilterElem.length)
		filterSettings.patterns.push({
			type: "list",
			key: "node.rating",
			values: ratingFilterElem.map(elem => elem.dataset.value).map(value => value == "null" ? undefined : value),
		});

	return filterSettings;
}

function updateView() {
	if(!current_list)
		return;
	current_list.filters = [new Filter({
		sortOrder: sortTiles.value.map(({column, dir}) => [column, dir]),
		rule: assembleFilterFromUI()
	})];

	if(current_list.dataSet)
		render(current_list);
	else
		current_list.fetch(render);
}
updateView();

document.querySelectorAll(".update-trigger").forEach(elem => elem.addEventListener("change", updateView));
