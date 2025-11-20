let current_events = [];
let current_planning;

// Fetch API and returns useable data
async function get_events() {
	const response = await fetch("https://demo.theeventscalendar.com/wp-json/tribe/events/v1/events");
	const data = await response.json();

	return clean_data(data["events"]);
}

// Clean received data
function clean_data(data) {
	const cleaned = [];

	// Handles undefined addresses
	const get_adress = (e) => {
		return e["venue"]["address"] == undefined
			? "At home"
			: `${e["venue"]["address"]}, ${e["venue"]["city"]}`.replace("Aveune", "Avenue");
	};

	// Handles useless <p> tags around description
	const get_desc = (e) => {
		return e["description"].slice(3, -4);
	};

	// Extract date and change format
	const get_date = (e) => {
		let [year, month, day] = e["start_date"].split(" ")[0].split("-");
		return [day, month, year].join("-");
	};

	// Extract hour
	const get_hour = (e) => {
		return e["start_date"].split(" ")[1];
	};

	for (const event of data) {
		const new_event = {
			id: event["id"],
			name: event["title"],
			desc: get_desc(event),
			date: get_date(event),
			hour: get_hour(event),
			adress: get_adress(event),
			url: event["url"],
		};

		cleaned.push(new_event);
	}

	return cleaned;
}

function event_in_planning(event) {
	return current_planning.some((e) => e["id"] == event["id"]);
}

function remove_from_planning(event) {
	current_planning = current_planning.filter((e) => e["id"] != event["id"]);
}

function create_event_element(event, in_planning) {
	const new_event = document.createElement("div");
	new_event.classList.add("event");
	if (in_planning) new_event.classList.add("in_planning");

	const name = document.createElement("h3");
	name.textContent = event["name"];

	const date = document.createElement("div");
	date.textContent = `${event["date"]} at ${event["hour"]}`;

	const adress = document.createElement("div");
	adress.textContent = event["adress"];

	const buttons = document.createElement("div");

	const detail_button = document.createElement("button");
	detail_button.textContent = "View details";
	detail_button.classList.add("detail_btn");

	const action_button = document.createElement("button");
	action_button.classList.add("action_btn");
	if (in_planning) {
		action_button.textContent = "Remove";
		action_button.addEventListener("click", (e) => {
			const planning_list = document.getElementById("planning_list");
			remove_from_planning(event);
			save_planning();
			populate_events("event_list", current_events);
			populate_events("planning_list", current_planning);
		});
	} else {
		action_button.textContent = "Add";
		action_button.addEventListener("click", (e) => {
			current_planning.push(event);
			save_planning();
			populate_events("event_list", current_events);
			populate_events("planning_list", current_planning);
		});
	}

	buttons.append(detail_button, action_button);
	new_event.append(name, date, adress, buttons);
	return new_event;
}

function populate_events(container_id, array) {
	const container = document.getElementById(container_id);
	container.innerHTML = "";

	for (const event of array) {
		const new_event = create_event_element(event, event_in_planning(event));
		container.appendChild(new_event);
	}
}

function save_planning() {
	globalThis.localStorage.setItem("planning", JSON.stringify(current_planning));
}

function get_planning() {
	return JSON.parse(globalThis.localStorage.getItem("planning"));
}

function init_app() {
	current_planning = get_planning();
	if (current_planning == undefined) current_planning = [];

	get_events().then((events) => {
		current_events = events;

		populate_events("event_list", current_events);
		populate_events("planning_list", current_planning);
	});
}

init_app();
