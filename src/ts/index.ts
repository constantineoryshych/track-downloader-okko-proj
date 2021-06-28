import { Dispather } from "./controller/dispatcher";
import { CMC } from "./services/cmc";
import { LocaleStorage } from "./services/localeStorage";
import { Connector } from "./server/components/conector";
import { FSService } from "./services/fsService";
import server  from "../ts/server/server";
import config from '../../data/config';
import { loger } from '../ts/services/logerModule';

try {
	server()
 }
 catch (e) {
	loger(`Error starting static server: ${e}. index ts  str 14`, "elseError");
 }

const connector = new Connector({
	hostname: 				config["remmoteSourseServer"]["host"],
	port: 					config["remmoteSourseServer"]["port"],
	path: 					"",
	rejectUnauthorized: 	false,
	requestCert: 			false,
	agent: 					false
});

const fs = new FSService(config["downloadDirectory"]);

     function shaduler() {
         function getCarentTimeForSchedule() {
                     let d = new Date();
                     let s = d.getSeconds();
                     let m = d.getMinutes();
                     let h = d.getHours();
                     let time = (h + ":" + m + ":" + s)
                     action(time)
           }
          
           function action(time){
            if(time === "23:0:0"){
				const dispather = new Dispather({
					remote: new CMC(connector),
					locale: new LocaleStorage(fs)
				});
			 }
           }

           getCarentTimeForSchedule(); 

	 }

	 shaduler();

	const dispather = new Dispather({
		remote: new CMC(connector),
		locale: new LocaleStorage(fs)
	});