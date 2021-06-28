import fs 				from "fs";
import config 			from '../../../data/config';
import { loger } 		from '../services/logerModule';
import { crypto } 		from 'crypto';

export async function cheackDiferent(item: string): Promise<boolean> {
	return await checkDiferentSize(item)
}

const targetRootDirectory = config["directoryCheackedDir"];
let CHEAC : any;
let notChanges: Array<string>;
notChanges = [];

async function checkDiferentSize(item): Promise<boolean> {
	let itemName = Object.keys(item)[0]
	function cheackHash(remooteHash){
		return new Promise(function(resolve) {
			var fd = fs.createReadStream((targetRootDirectory + itemName));
			var hash = crypto.createHash('sha1');
			hash.setEncoding('hex');
			fd.on('end', function() {
			hash.end();						 
				resolve( hash.read())
			});
			fd.pipe(hash);
		})
	}

	return new Promise(function(resolve) {
	    if (fs.existsSync(targetRootDirectory + itemName)) {
	        fs.stat(targetRootDirectory  + itemName, async (err) => {
	            if (err) {
					loger(`Error itemName checkDiferentSize: ${err}. str 24 bootCapabilityCheck.ts`, "elseError");
	                return;
				}

				let remooteHash = item[itemName]["hash"];
				CHEAC = await cheackHash(remooteHash);

				if(remooteHash != CHEAC){
					 resolve(true);
				}
				else {
					 resolve(false);
				}

	        })
	    }else{
			resolve(true);
		}
	})
}