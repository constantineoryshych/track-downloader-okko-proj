import {
    createWriteStream,
    readFileSync,
    readFile,
    stat,
    readdirSync,
    statSync,
    watchFile,
    unlink
} from "fs";
import {
    Readable
} from "stream";
import {
    IFS
} from "./localeStorage";
import {
    loger
} from '../../ts/services/logerModule';

let FILE_SIZE_LOAD: number;
let FILE_SIZE_LOAD_CHANGE: number;
let COUNT_ERROR_LOADS: number;
let len = 0;
let lenStore = 0;

export class FSService implements IFS {
    private _rootDirectory: string;

    constructor(rootDirectory: string) {
        this._rootDirectory = rootDirectory;
    }

    public save(path: string, source: Readable, size: number): any {
        let LoadProgressChack;
        let _this = this;


        return new Promise((resolve, reject): any => {
            setTimeout(async () => {

                const destination = createWriteStream(this._rootDirectory + path, {
                    flags: 'w'
                });
                
                source.pipe(destination);

                source.on('data', async function(chunk) {
                    len += chunk.length
                    if (len === size) {
                        len = 0
                    } else {
                        setTimeout(async () => {
                            if (len === size) {
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        }, 20000)
                    }
                })

                source.on("end", () => {
                    stat(this._rootDirectory + path, (err, stats) => {
                        try {
                        if (stats["size"] === size) {
                            resolve(true)
                            loger(path, "loading_successful");
                        } else {
                            resolve(false)
                        }
                     }
                        catch (e) {
                            resolve(false)
                        }

                    })

                })
            }, 8000);
        })

    }

    public saveRemmotLog(path: string, source: Readable): Promise < boolean > {
        return new Promise((resolve, reject): any => {
            const destination = createWriteStream(this._rootDirectory + path, {
                flags: 'w'
            });
            source.pipe(destination);
            source.on("end", () => {
                const d = this._rootDirectory + path
                readFile(d, function(err, data: Buffer) {
                    if (err) {
                        loger(`Error getting the file: ${err}. errr fsService component erro 31 str codeError: D1893NT , saveRemmotLog()`, "elseError");
                    } else {
                        resolve(true)
                    }
                });
            })
        })
    }

    public read(path: string): void {
        readFileSync((this._rootDirectory + path), "utf8");
    }

    public readPlaylist(path: string): Promise < any > {
        return new Promise((resolve): any => {
            readFile(path, function(err, data: Buffer) {
                if (err) {
                    loger(`Error getting the file: ${err}. errr fsService component erro 31 str codeError: DNE1113NT , readPlaylist()`, "elseError");
                } else {
                    resolve(data)
                }
            });
        })
    }

    public delete(path: string): void {
        loger(path, "file_deleted");
        if (!path) return
        unlink(path, function(err) {
            if (err) return
        });
    }

    public async readRoot(): Promise < Array < string >> {
        let rootePath = this._rootDirectory;
        return new Promise((resolve) => {
            function walker(dir, files_) {
                files_ = files_ || [];
                var files = readdirSync(dir);
                for (var i in files) {
                    var name = dir + '/' + files[i];
                    if (statSync(name).isDirectory()) {
                        walker(name, files_);
                    } else {
                        files_.push(name);
                    }
                }
                resolve(files_);
            }
            walker(rootePath, null)
        })
    }

    public getFileInformation(path: any): void {
        stat(path, function(err, stats) {})
    }


}