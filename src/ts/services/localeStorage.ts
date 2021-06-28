import { Readable } from "stream";
import { ILocale } from "./../controller/dispatcher";

export interface IFS {
	saveRemmotLog(fileName: string, stream: Readable);
	readPlaylist(name: any): void | PromiseLike<void>;
	save(path: string, source: Readable, size: number): void;
	read(path: string): void;
}

export class LocaleStorage implements ILocale {
	private _fs: IFS;
	constructor(fs: IFS) {
		 this._fs = fs;
	}

	public async saveAudio(stream: Readable, name: string, size: number): Promise<any> {
		let fileName = name;
		return await this._fs.save(fileName, stream, size)
	}

    public async saveRemmotLog(stream: Readable, name: string):  Promise<any> { 
		let fileName = name;
		await this._fs.saveRemmotLog
		return new Promise((resolve): any => { 
		this._fs.saveRemmotLog(fileName, stream).then(
			(data) => resolve(data)
		)
		})
	}

	public remmotFileInfo(stream: Readable, name: string): any {
		let fileName = name;
		this._fs.save(fileName, stream, 2323234234)
   	}

	public async getPlaylist(name): Promise<any> {
		return await this._fs.readPlaylist(name);
	}
	
}