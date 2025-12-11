import UserTags from "./UserTags.mjs";

let body = document.body;

const ratings = {
	g: "G - All Ages",
	pg: "PG - Children",
	pg_13: "PG-13 - Teens 13 and Older",
	r: "R - 17+ (violence & profanity)",
	"r+": "R+ - Profanity & Mild Nudity",
	rx: "Rx - Hentai",
};
const media_types = {
	unknown: "Unknown",
	tv: "TV",
	ova: "OVA",
	movie: "Movie",
	special: "Special",
	ona: "ONA",
	music: "Music",
};
const statuses = {
	finished_airing: "Finished Airing",
	currently_airing: "Currently Airing",
	not_yet_aired: "Not Yet Aired",
};

export default class DetailsModal {
	static Modal;

	static Draw(anime) {
		if(!DetailsModal.Modal) {
			DetailsModal.Modal = document.createElement("dialog");
			DetailsModal.Modal.setAttribute("id", "details-dialog");
			DetailsModal.Modal.setAttribute("closedby", "any");
			body.append(DetailsModal.Modal);
		}

		DetailsModal.Modal.innerHTML = `
			<img src="${anime.main_picture.large || anime.main_picture.medium}" alt="Cover Art">
			<button aria-label="Close Detail View" id="details-close">X</button>
			<div id="details-title">
				<p>${anime.title}</p>
				<p>${anime.alternative_titles.en || anime.alternative_titles.synonyms[0] || ""}</p>
				<p><b>Studio</b> ${anime.studios.map(studio => studio.name).join(", ")}</p>
			</div>
			<div id="details-tags">
				<p>Your Tags</p>
				<div>
					<label class="svg-checkbox">
						<input type="checkbox" id="details-star" aria-label="favorite"${UserTags.checkTag("star", anime.id) ? " checked" : ""}>
						<svg stroke="currentColor" fill="transparent" stroke-width="16" height="44" width="44" viewBox="-8 0 350 350" title="Set Favorite">
							<path d="M329.208,126.666c-1.765-5.431-6.459-9.389-12.109-10.209l-95.822-13.922l-42.854-86.837
								c-2.527-5.12-7.742-8.362-13.451-8.362c-5.71,0-10.925,3.242-13.451,8.362l-42.851,86.836l-95.825,13.922
								c-5.65,0.821-10.345,4.779-12.109,10.209c-1.764,5.431-0.293,11.392,3.796,15.377l69.339,67.582L57.496,305.07
								c-0.965,5.628,1.348,11.315,5.967,14.671c2.613,1.899,5.708,2.865,8.818,2.865c2.387,0,4.784-0.569,6.979-1.723l85.711-45.059
								l85.71,45.059c2.208,1.161,4.626,1.714,7.021,1.723c8.275-0.012,14.979-6.723,14.979-15c0-1.152-0.13-2.275-0.376-3.352
								l-16.233-94.629l69.339-67.583C329.501,138.057,330.972,132.096,329.208,126.666z">
						</svg>
						<span>favorite</span>
					</label>
					<label class="svg-checkbox">
						<input type="checkbox" id="details-eye" aria-label="watching"${UserTags.checkTag("watch", anime.id) ? " checked" : ""}>
						<svg stroke="currentColor" fill="transparent" stroke-width="1" height="44" width="44" viewBox="-1 -1 26 26" title="Set Watching">
							<path d="M12 4.5C7.305 4.5 3.35 7.36 1.5 12c1.85 4.64 5.805 7.5 10.5 7.5s8.65-2.86 10.5-7.5C20.65 7.36 16.695 4.5 12 4.5zm0 10.75a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
						</svg>
						<span>watching</span>
					</label>
					<label class="svg-checkbox">
						<input type="checkbox" id="details-not" aria-label="hide"${UserTags.checkTag("hide", anime.id) ? " checked" : ""}>
						<svg fill="transparent" stroke-width="2" stroke="currentColor" height="44" width="44" viewBox="0 0 44 44" fill-rule="evenodd" title="Set Hide">
							<path d="M 22 1 A 21 21 0 1 1 22 43 A 21 21 0 1 1 22 1ZM 9.93998 29.11027 A 14 14 0 0 1 29.11027 9.93998 ZM 34.06002 14.88973 A 14 14 0 0 1 14.88973 34.06002 Z" />
						</svg>
						<span>hide</span>
					</label>
				</div>
			</div>
			<div id="details-info">
				<p><b>Genre</b> ${anime.genres.map(genre => genre.name).join(", ")}</p>
				<p><b>Score</b> ${anime.mean || "Not enough information"}</p>
				<p><b>Rank</b> ${anime.rank || "Not enough information"}</p>
				<p><b>Number of User Lists</b> ${anime.num_list_users}</p>
				<p><b>Media</b> ${media_types[anime.media_type]}</p>
				<p><b>Status</b> ${statuses[anime.status]}</p>
				<p><b>Rating</b> ${ratings[anime.rating] || "None Given"}</p>
			</div>
			<div id="details-synopsis">
				<p><b>Synopsis</b></p>
				<p>${anime.synopsis}</p>
			</div>
		`;
		document.getElementById("details-close").addEventListener("click", DetailsModal.Hide);
		DetailsModal.Modal.querySelector("img").addEventListener("load", e => {
			e.target.width = e.target.naturalWidth;
			e.target.height = e.target.naturalHeight;
		});
		const starInput = document.getElementById("details-star");
		starInput.addEventListener("input", () => {
			UserTags.setTag("star", anime.id, starInput.checked);
			if(document.getElementById("star-select"))
				DetailsModal.updateView();
		});
		const watchInput = document.getElementById("details-eye");
		watchInput.addEventListener("input", () => {
			UserTags.setTag("watch", anime.id, watchInput.checked);
			if(document.getElementById("watch-select"))
				DetailsModal.updateView();
		});
		const hideInput = document.getElementById("details-not");
		hideInput.addEventListener("input", () => {
			UserTags.setTag("hide", anime.id, hideInput.checked);
			if(document.getElementById("hide-select"))
				DetailsModal.updateView();
		});

		DetailsModal.Modal.showModal();
	}

	static Hide() {
		return DetailsModal.Modal.close();
	}
}
