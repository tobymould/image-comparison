// --------STEP-1: FUNCTIONS RELATED TO GETTING THE DATA --------//
// A) Convert the fetched 'object with properties' ('data' variable) into an 'array of nested-arrays'.
// B) Convert each nested-array into an object that contains an 'imageName' and 'labelsArray' property.
const cleanDBData = (data) => {
    const arrayOfImageDataObjects = Object.entries(data)   
    .map((subArray) => {
      return {imageName: subArray[0], labelsArray: subArray[1]}
    }) 
  
    // console.log('arrayOfImageDataObjectsA', arrayOfImageDataObjects)

    // C) Iterate the 'labelsArray' nested-array, and delete all properties which are not 'description' or 'score' (because useless).
    
    arrayOfImageDataObjects.forEach((imageObject => {
      const allowed = ['description', 'score'];

      const result = imageObject.labelsArray.forEach(labelObject => {
        Object.keys(labelObject)
        .filter(key => !allowed.includes(key))
        .forEach(key => delete labelObject[key])        
        // return {'description': labelObject.description, 'score': labelObject.score}
      })

      // return {imageName: imageObject[0], labelsArray: result}
      return result;
  
    }))

    // console.log('Filtered Object: ', arrayOfImageDataObjects)

    // D) Iterate the 'labelsArray' nested-array again, and delete all objects with an accuracy score < 84% (because low accuracy match).
    arrayOfImageDataObjects.forEach((imageObject => {
      const result = imageObject.labelsArray.map(labelObject => {
        const test = Object.keys(labelObject)
        .filter(key => labelObject.score < 0.84)
        .forEach(key => delete labelObject[key])
      })
      
      return result
    }))

    // arrayOfImageDataObjects.forEach((imageObject => {
    //   const result = imageObject.labelsArray.map(labelObject => {
    //     const test = Object.keys(labelObject)
    //     .filter(key => Object.keys(labelObject).length !== 0)
    //     .forEach(key => delete labelObject[key])
    //   })
    // }))
  
    // E) Return the cleaned data
    return arrayOfImageDataObjects;
}

const cleanImgData = (data) => {
  const isolatedLabelObject = Object.entries(data).find((subArrays) => subArrays.includes("labelAnnotations"));
  const destructuredObject1 = {imageName: 'submittedImage', labelsArray: isolatedLabelObject[1]} 

  // C) Iterate the 'labelsArray' nested-array, and delete all properties which are not 'description' or 'score' (because useless).
  const filteredLabelsArray = destructuredObject1.labelsArray.map((labelObject => {return {'description': labelObject.description, 'score': labelObject.score}}))
  const destructuredObject2 = {imageName: 'submittedImage', labelsArray: filteredLabelsArray} 

  // console.log('destructuredObject2: ', destructuredObject2);
  return destructuredObject2;
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

const broadCategoryCheckAlgorithm = (dataFromSubmitted) => {
  const lookUpTable = [{
        generalCategory: ['Fruit', 'Vegetable', "Flowering plant", 'Tree', 'Cut flowers']
      },];

  const comparisonResult = dataFromSubmitted.labelsArray.forEach(labelObject => {
    return lookUpTable[0].generalCategory.forEach(category => 
      labelObject.description === category ? categoryMatched = category : null
    )
  })

  return categoryMatched;
}

const BroadMatchToDBImagesAlgorithm = (dataFromDB, categoryOfSubmittedImage) => {
  
}

const runTheComparision = async () => {
    try {
      const dataFromDB = await ProcessDataFromDB();
      const dataFromSubmitted = await ProcessDataFromImg();

      const submittedImageBroadCategoryMatch = broadCategoryCheckAlgorithm(dataFromSubmitted);
      const imageMatch = BroadMatchToDBImagesAlgorithm(dataFromDB,submittedImageBroadCategoryMatch);


      console.log('imageMatch: ', imageMatch);
      console.log('submittedImageBroadCategoryMatch: ', submittedImageBroadCategoryMatch);
      console.log('dataFromDB: ', dataFromDB);
      console.log('dataFromSubmitted: ', dataFromSubmitted);


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