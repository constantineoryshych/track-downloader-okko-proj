import { Readable } from "stream";
import { IRemote } from "./../controller/dispatcher";

export interface IConnector {
	get(options: string): Promise<Readable>;
}

export class CMC implements IRemote {
	private _connector: IConnector; 
	constructor(connector: IConnector) {
        this._connector = connector;
	}

	public async getAudio(name:string): Promise<Readable> {
		return await this._connector.get(name);
	}
}
