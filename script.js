/* -------------------- GLOBAL VARIABLES -------------------- */

let current_events = [];
let current_planning = [];
let my_modal;

/* -------------------- API HANDLING -------------------- */

// Fetch API and returns useable data
async function get_events() {
	const api_url = "https://demo.theeventscalendar.com/wp-json/tribe/events/v1/events";
	const response = await fetch(api_url);
	const data = await response.json();

	// Handling fetch fail
	if (data["events"] == undefined) {
		console.error(`Error - Cannot fetch data at ${api_url}`);
		return [];
	}

	return clean_data(data["events"]);
}

// Clean and returns received data
function clean_data(data) {
	// Handles undefined addresses
	const get_address = (e) => {
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
		return [day, month, year].join("/");
	};

	// Extract hour
	const get_hour = (e) => {
		return e["start_date"].split(" ")[1];
	};

	// Creates list of cleaned events
	const cleaned = [];
	console.log(data);
	for (const event of data) {
		const new_event = {
			id: event["id"],
			name: event["title"],
			desc: get_desc(event),
			date: get_date(event),
			hour: get_hour(event),
			address: get_address(event),
			url: event["url"],
		};

		cleaned.push(new_event);
	}

	return cleaned;
}

/* -------------------- PLANNING HANDLING -------------------- */

// Check if an event is on planning
function event_in_planning(event) {
	return current_planning.some((e) => e["id"] == event["id"]);
}

// Remove an event from planning
function remove_from_planning(event) {
	current_planning = current_planning.filter((e) => e["id"] != event["id"]);
}

/* -------------------- HTML CREATION -------------------- */

// Create a new event element, handles when it's already in the planning
function create_event_element(event) {
	const in_planning = event_in_planning(event);
	const new_event = document.createElement("div");
	new_event.classList.add("event");
	if (in_planning) new_event.classList.add("in_planning");

	const name = document.createElement("h3");
	name.textContent = event["name"];

	const date = document.createElement("div");
	date.textContent = `${event["date"]} at ${event["hour"]}`;

	const address = document.createElement("div");
	address.textContent = event["address"];

	const buttons = document.createElement("div");

	// Button that show modal
	const detail_button = document.createElement("button");
	detail_button.textContent = "View details";
	detail_button.classList.add("detail_btn");
	detail_button.addEventListener("click", (e) => {
		fill_modal(event);
		my_modal.showModal();
	});

	// Button that adds/removes an event to/from planning
	const action_button = document.createElement("button");
	action_button.classList.add("action_btn");
	if (in_planning) {
		action_button.textContent = "Remove";
		action_button.addEventListener("click", (e) => {
			remove_from_planning(event);
			save_planning();
			populate_interface();
		});
	} else {
		action_button.textContent = "Add";
		action_button.addEventListener("click", (e) => {
			current_planning.push(event);
			save_planning();
			populate_interface();
		});
	}

	buttons.append(detail_button, action_button);
	new_event.append(name, date, address, buttons);
	return new_event;
}

function create_modal() {
	const modal = document.createElement("dialog");
	modal.addEventListener("click", (e) => {
		// If ::backdrop clicked close modal
		const click_outside = my_modal === e.target;
		if (click_outside) my_modal.close();
	});

	const modal_content = document.createElement("div");
	modal_content.id = "modal_content";

	const modal_name = document.createElement("h3");
	modal_name.id = "modal_name";

	const modal_desc = document.createElement("div");
	modal_desc.id = "modal_desc";

	const modal_date = document.createElement("div");
	modal_date.id = "modal_date";

	const modal_address = document.createElement("div");
	modal_address.id = "modal_address";

	const modal_url = document.createElement("a");
	modal_url.id = "modal_url";

	const modal_close = document.createElement("button");
	modal_close.textContent = "X";
	modal_close.addEventListener("click", (e) => modal.close());

	modal_content.append(modal_name, modal_desc, modal_date, modal_address, modal_url, modal_close);
	modal.appendChild(modal_content);
	document.body.appendChild(modal);
	return modal;
}

/* -------------------- DISPLAY -------------------- */

//Populate event list and planning
function populate_interface() {
	populate_events("event_list", current_events);
	populate_events("planning_list", current_planning);
}

// Populate a container with events in array
function populate_events(container_id, array) {
	const container = document.getElementById(container_id);
	container.innerHTML = "";

	for (const event of array) {
		const new_event = create_event_element(event);
		container.appendChild(new_event);
	}
}

// Fills the modal with event data
function fill_modal(event) {
	const modal_name = document.getElementById("modal_name");
	modal_name.textContent = event["name"];

	const modal_desc = document.getElementById("modal_desc");
	modal_desc.textContent = event["desc"];

	const modal_date = document.getElementById("modal_date");
	modal_date.textContent = `When : ${event["date"]} at ${event["hour"]}`;

	const modal_address = document.getElementById("modal_address");
	modal_address.textContent = `Where : ${event["address"]}`;

	const modal_url = document.getElementById("modal_url");
	modal_url.textContent = "Link to website";
	modal_url.href = event["url"];
}

// Toggle between dark and light mode
function toggle_theme() {
	if (document.body.classList.contains("light")) {
		document.body.classList = "dark";
		document.getElementsByTagName("img")[0].src = "./imgs/dark.png";
		create_cookie("theme", "dark", 365);
	} else {
		document.body.classList = "light";
		create_cookie("theme", "light", 365);
		document.getElementsByTagName("img")[0].src = "./imgs/light.png";
	}
}

/* -------------------- LOCALSTORAGE -------------------- */

// Save planning data to local storage
function save_planning() {
	globalThis.localStorage.setItem("planning", JSON.stringify(current_planning));
}

// Get planning data from local storage
function get_planning() {
	return JSON.parse(globalThis.localStorage.getItem("planning"));
}

/* -------------------- COOKIES -------------------- */

// Delete cookie by name
function delete_cookie(name) {
	const new_cookie = `${name}=0; max-age=0`;
	document.cookie = new_cookie;
}

// Create cookie with value and lifespan in days
function create_cookie(name, value, days) {
	const new_cookie = `${name}=${value}; max-age=${days * 24 * 60 * 60}`;
	document.cookie = new_cookie;
}

// Get all cookies as objects in an array
function get_cookies() {
	const cookies = [];
	if (document.cookie == "") return cookies;

	for (const cookie of document.cookie.split(";")) {
		const splitted = cookie.trim().split("=");
		cookies.push({ name: splitted[0], value: splitted[1] });
	}

	return cookies;
}

// Recover theme stored in cookies if it exists, else apply default
function recover_theme() {
	const cookies = get_cookies();
	const theme_cookie = cookies.find((c) => c["name"] == "theme");
	if (theme_cookie) {
		document.body.classList = theme_cookie["value"];
		document.getElementsByTagName("img")[0].src = `./imgs/${theme_cookie["value"]}.png`;
	} else {
		document.body.classList = "dark";
		document.getElementsByTagName("img")[0].src = `./imgs/dark.png`;
	}
}
/* -------------------- MAIN EXECUTION -------------------- */

// Initialize application
function init_app() {
	// Recover planning from local storage
	current_planning = get_planning();
	if (current_planning == undefined) current_planning = [];

	// Recover theme from cookies
	recover_theme();

	// Add listener to the toggle theme button
	const toggle = document.querySelector("button:has(> img)");
	toggle.addEventListener("click", toggle_theme);

	// Instanciate modal
	my_modal = create_modal();

	// Fetch API then display results
	get_events().then((events) => {
		current_events = events;
		populate_interface();
	});
}

init_app();
