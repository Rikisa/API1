const fs = require('fs');

//Function for upload

exports.handleFileUpload = (file, foldername, uploadfolder) => {
    return new Promise((resolve, reject) => {
        var folderName = foldername + '/';
        var filename = file.hapi.filename;
        var data = file._data;
        var uploadFolder = uploadfolder;

            //Chechk if uplad folder exists
            if(!fs.existsSync(uploadFolder)){
                //Create upload folder if not exists
                fs.mkdirSync(uploadFolder);
                    //Check if folder named by issue exists
                    if (!fs.existsSync(folderName)) {
                        //Create folder named by issue if not exists
                        fs.mkdirSync(uploadFolder + folderName);

                        fs.writeFile(uploadFolder + folderName + filename, data, err => {
                            if (err) {
                            reject(err)
                            }
                            resolve({ message: 'Upload successfully!' });
                        });
                    }
                    else{
                        //Write file in folder named by issue
                        fs.writeFile(uploadFolder + folderName + filename, data, err => {
                            if (err) {
                            reject(err)
                            }
                            resolve({ message: 'Upload successfully!' });
                        });
                    }
            }
            //If upload folder exists then check again if folder named by issue exists
            else{
                if(!fs.existsSync(uploadFolder + folderName)){
                   //Create folder named by issue if not exists
                    fs.mkdirSync(uploadFolder + folderName);

                    fs.writeFile(uploadFolder + folderName + filename, data, err => {
                        if (err) {
                        reject(err)
                        }
                        resolve({ message: 'Upload successfully!' });
                        });
                    }
                    else{
                            fs.writeFile(uploadFolder + folderName + filename, data, err => {
                                if (err) {
                                reject(err)
                                }
                                resolve({ message: 'Upload successfully!' });
                                });
                        }  
                }
        })
}

