// --------STEP-1: FUNCTIONS RELATED TO GETTING THE DATA --------//
const cleanDBData = (data) => {
    // A) Convert the fetched 'object with properties' ('data' variable) into an 'array of nested-arrays'.  
    const arrayOfArrays = Object.entries(data);

    // B) Convert each nested-array into an object that contains an 'imageName' and 'labelsArray' property.
    const arrayOfObjects = arrayOfArrays.map((subArray) => {
      // console.log(subArray);
      return {imageName: subArray[0], labelsArray: subArray[1]}
    })
  
    // C) Iterate the 'labelsArray' nested-array, and delete all properties which are not 'description' or 'score' (because useless).
    const allowed = ['description', 'score'];
    arrayOfObjects.forEach((subObject => {
  
      return subObject.labelsArray.map(label => {
        // label.score.toFixed(5);
  
        Object.keys(label)
        .filter(key => !allowed.includes(key))
        .forEach(key => delete label[key])
   
        // console.log(label);
        // console.log('description: ', label.description, 'score: ', label.score)
      })
  
    }))

    // D) Iterate the 'labelsArray' nested-array again, and delete all objects with an accuracy score < 84% (because low accuracy match).
    arrayOfObjects.forEach((subObject => {
      const result = subObject.labelsArray.map(label => {
        Object.keys(label)
        .filter(key => label.score < 0.84)
        .forEach(key => delete label[key])
        // console.log('description: ', label.description, 'score: ', label.score)
      })
      // const result2 = result.labelsArray.filter(label => Object.keys(label) !== null)
      return result
      // return {"labelsArray": fixed};
    }))
  
    // E) Return the cleaned data
    return arrayOfObjects;
}

const cleanImgData = (data) => {
  // A) Convert the fetched 'object with properties' ('data' variable) into an 'array of nested-arrays'.  
  const arrayOfArrays = Object.entries(data);

  // B) Convert each nested-array into an object that contains an 'imageName' and 'labelsArray' property.
  const arrayOfObjects = arrayOfArrays.find((subArrays) => {
    // console.log(subArrays);
    return subArrays.includes("labelAnnotations");
    // const result = subArrays.find(array => {
    //   return array[3]
    //   // return array.includes("labelAnnotations");
    // })
    // // console.log(subArray);
    // return {imageName: result[0], labelsArray: result[1]}
  })

  // E) Return the cleaned data
  return {imageName: 'submittedImage', labelsArray: arrayOfObjects[1]} ;
}

const errorHandler = (response, msg) => {
  if (response.status !== 200) {
    throw new Error(`cannot fetch the ${msg}`);
  } 
}



// 1) Submit a Request to retrieve the database of data.
const getJsonData = async (url) => {
  const response = await fetch(`./${url}`);
  errorHandler(response, url);
  const data = await response.json();

  return data;
}

const ProcessDataFromDB = async () => {
  const dataFromDB = await getJsonData('data.json')
  const cleanedDataDB = cleanDBData(dataFromDB);
  return cleanedDataDB
}

const ProcessDataFromImg = async () => {
  const dataFromSubmittedImage = await getJsonData('testData.json')
  const cleanedDataImg = cleanImgData(dataFromSubmittedImage);
  return cleanedDataImg
}

const runTheComparision = async () => {
    try {
      const data1 = await ProcessDataFromDB();
      const data2 = await ProcessDataFromImg();

      console.log('data1: ', data1);
      console.log('data2: ', data2);


    } catch(err){
      console.log('rejectedDB: ', err.message)
    };

}


runTheComparision();

// --------STEP-2: FUNCTIONS RELATED TO COMPARING THE DATA --------//


// CALLOUT FOR SUBMIT OF DATA [OLD]
// 0) Call the 'getJsonData' function to retrieve the data.
// const result = getJsonData()
// .then(data => {
//   console.log(data) 
// })
// .catch(err => console.log('rejected: ', err.message));


// SUBMIT REQUEST FOR DATA SECTION [OLD]
  // .then(data =>{
  //   console.log('AcceptedImage: ', data);
  //   return data;
  // } )
  // .then(data => console.log('AcceptedImage2222: ', data))
  // // .catch(err => console.log('rejectedDB: ', err.message));
  // // const cleanedDataDB = cleanDBData(dataDB); // II) CLEAN - parse the dataDB response into the 'cleanData' function for cleaning.

  // console.log('Did this work?: ', dataFromDB);


  // const dataFromSubmittedImage = await getJsonData('testData.json')
  // .then(data => console.log('AcceptedImage: ', data))
  // .catch(err => console.log('rejectedImage: ', err.message));
  // const cleanedDataImg = cleanImgData(dataImg);




  // // 1) Submit a Request to retrieve the database of data.
// const getJsonData = async () => {
//   // A) LABELS DATA FROM DATABASE IMAGES
//   // I) FETCH
//   const responseDB = await fetch('./data.json');
//   errorHandler(responseDB, 'Database Data');
//   const dataDB = await responseDB.json();

//   // II) CLEAN - parse the dataDB response into the 'cleanData' function for cleaning.
//   const cleanedDataDB = cleanDBData(dataDB);

//   // B) LABELS DATA FROM SUBMITTED IMAGE
//   const responseImg = await fetch('./testData.json');
//   errorHandler(responseDB, 'Test Data');
//   const dataImg = await responseImg.json();

//   const cleanedDataImg = cleanImgData(dataImg);
  
//   // return cleanedDataDB;
//   return cleanedDataImg;
// }