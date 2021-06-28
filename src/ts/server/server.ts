import * as http from "http";
import config from "../../../data/config";
import fs from "fs";

function getCarentPlayList(): string {
	let today = new Date();
	let dd = String(today.getDate()).padStart(2, "0");
	let mm = String(today.getMonth() + 1).padStart(2, "0");
	let yyyy = today.getFullYear();
	let playListName = yyyy + mm + dd;
	return playListName;
}

let requestCount = 0;

export default function server() {
	http
		.createServer(function(req: http.IncomingMessage, res: http.ServerResponse) {
			let pathname = `${config["serverSharingDir"]}${req.url}`;

			if (req.url === "/playlist.txt") {
				pathname = `${config["pathCarentPlayList"]}${getCarentPlayList()}.txt`;
			}

			fs.exists(pathname, function(exist) {
				if (!exist) {
					res.statusCode = 404;
					res.end(`File ${pathname} not found!`);
					return;
				}

				fs.readFile(pathname, function(err, data) {
					if (err) {
						res.statusCode = 500;
						res.end(`Error getting the file: ${err}.`);
						return;
					}

					if (pathname.endsWith("mp3")){
						res.setHeader("content-type", "audio/mp3");
					}

					res.setHeader("Access-Control-Allow-Origin", "*");

					res.statusCode = 200;
					res.end(data);
				});
			});
		})
		.listen(3123);
		console.log("Start on port 3123");
}


