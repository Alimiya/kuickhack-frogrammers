function recognizeImage(fileInputId, dateStatus) {
    return new Promise((resolve, reject) => {
        let status = 'error';
        let errorType;

        handleImageUpload(fileInputId).then(img => {
            Tesseract.recognize(
                img,
                'kaz+rus+eng'
            ).then(({ data }) => {
                let datesRes;
                if (data && data.text) {
                    // Extract dates using regex
                    const dateRegex = /\b\d{2}\.\d{2}\.\d{4}\b/g;
                    const dates = data.text.match(dateRegex);

                    // Extract 12-digit code using regex
                    const codeRegex = /\b\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\d{6}\b/g;
                    const codes = data.text.match(codeRegex);

                    let datesString = '';
                    let codesString = '';

                    if (dates && dates.length > 0) {
                        // Convert strings to Date objects
                        const dateObjects = dates.map(dateStr => {
                            const [day, month, year] = dateStr.split('.');
                            return new Date(year, month - 1, day);
                        });

                        // Find the latest date
                        const latestDate = new Date(Math.max.apply(null, dateObjects));

                        // Compare with the current date
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0); // Ignore time for the comparison

                        if (dateStatus) {
                            if (latestDate < currentDate) {
                                errorType = 'expired'
                            } else if (dates && dates.length < 2) {
                                        errorType ='Cannot verify expiration';
                            }               
                        }
                        datesString = dates.join(', ');
                        datesRes = datesString;
                    } else {
                        if (dateStatus) {
                            errorType = 'no-date'
                        }
                    }

            


                    if (codes && codes.length > 0) {
                        codesString = codes.join(', ');
                        data = codesString;
                        status = 'success';
                    } else {
                        errorType = 'no-uin'
                    }
                } else {
                    errorType = 'no-text'
                }

                const result = { status };
                if (errorType !== undefined) {
                    result.errorType = errorType;
                } 
                if (data !== undefined) {
                    result.data = data;
                }
                if (datesRes !== undefined) {
                    result.datesRes = datesRes;
                }
                resolve(result);
            }).catch(error => {
                reject(`Tesseract Error: ${error}`);
            });
        }).catch(error => {
            reject(`Image Upload Error: ${error}`);
        });
    });
}
