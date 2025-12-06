import AnimeList from "./AnimeList.mjs";
const seasonalURL = '/mal/anime/season';
const rankedURL = '/mal/anime/ranked';

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
const seasonalList = new AnimeList(seasonalURL + "/2026/winter", {
	fields,
	nsfw: "true",
	limit: 100,
});
const rankedList = new AnimeList(rankedURL, {
	fields,
	nsfw: "true",
	limit: 100,
});

const animeList = document.getElementById("anime-list");
const animeTemplate = document.getElementById("anime-template");

function render(data) {
	console.log(data[0].node);
	seasonalList.display(animeList, animeTemplate);

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

seasonalList.fetch(render);
//rankedList.fetch(render);
