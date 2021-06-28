import https, { RequestOptions } from "https";
import { Readable } from "stream";
import { IConnector } from "./../../services/cmc";
import { loger } from '../../services/logerModule';
export class Connector implements IConnector {
	private _options: any;

	constructor(options: any) {
		this._options = options;
	}

	public get(url: string): Promise<Readable> {
		const _options = this._getOptions(url);
		function forceTimeoutError(response){
			if(response["statusCode"] === 200) return 200
			return new Promise((resolve, reject): void => {
				setTimeout(function() {
					if(response["statusCode"] !== 200){
							resolve(417)
					}
				}, 3000);
			})
		}
		return new Promise(( resolve ): void => {
			https
				.get(_options, async (response: any): Promise<void> => {
					let responseTimeouteCheck  =  forceTimeoutError(response);
					if(responseTimeouteCheck === 200){
						resolve(response);
					}else{
						let test = await forceTimeoutError(response);
						if(test !== 200){
							resolve(undefined)
						}
					}
				})
				.on("error", ()=>{
					setTimeout(function() {
						resolve(undefined)
						loger(`Conector.ts method get errCode : "LO456pl" ${url}`, "loading_error");
					},10000)
				});
		});
	}

	private _getOptions(url: string): RequestOptions {
		return Object.assign({}, this._options, {
			path: `${this._options.path}/${url}`
		});
	}
}