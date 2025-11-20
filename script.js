async function get_events() {
	const response = await fetch("https://demo.theeventscalendar.com/wp-json/tribe/events/v1/events");
	const data = await response.json();

	return data;
}

get_events().then((r) => {
	for (const event of r["events"]) {
		console.log(event["title"]);
		console.log(event["description"]);
		console.log(event["start_date"]);
		console.log(event["venue"]["address"]);
		console.log(event["venue"]["city"]);
		console.log(event["url"]);
	}
});
