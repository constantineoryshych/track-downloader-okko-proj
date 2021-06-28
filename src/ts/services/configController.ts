import { loger } from '../../ts/services/logerModule';
import { fs } from 'fs';

export default async  function externalConfigController():  Promise <object> {
    let dataReturnet : object;
    dataReturnet = {};
    return new Promise(( resolve ): void => {  

    fs.readFile("./configServices.json", "utf8", function( error,data ){
            dataReturnet = JSON.parse(data);
            resolve(dataReturnet)
            if(error) {
                loger(`Error : ${error}. Config controller: ERRCODE DMN3453PJ , externalConfigController() str 12` , "elseError");
                const data = {
                    directoriesWhichDownloadDisabled : [

                    ],
                }
                fs.writeFile("./configServices.json", JSON.stringify(data), function(error){
                        loger(`Error : ${error}. Config not detected, config file was created with default settings` , "elseError");
                        dataReturnet = data;  
                        resolve(dataReturnet)            
                });
            }
        })
    });
    
}

