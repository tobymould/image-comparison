
// 0) REFERENCE DATA
const lookUpTable = [
  {
    generalCategory: ['Fruit', 'Vegetable', "Flowering plant", 'Tree', 'Cut flowers']
  }, 
  {
    specificCategory: ['Yellow', 'Green algae', 'Green', 'Banana', 'Purple','Red', 'Pink', 'White', 'Rose']
  }
];

// 1) RAW FUNCTIONS
const getJsonData = async (url) => {
  const response = await fetch(`./${url}`);
  errorHandler(response, url);
  const data = await response.json();

  return data;
}

const cleanDBData = (data) => {
  const arrayOfImageDataObjects = Object.entries(data).map((subArray) => {
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

const broadCategoryCheckAlgorithm = (dataFromSubmitted) => {

  const comparisonResult = dataFromSubmitted.labelsArray.forEach(labelObject => {
    return lookUpTable[0].generalCategory.forEach(category => 
      labelObject.description === category ? categoryMatched = category : null
    )
  })

  return categoryMatched;
}

const BroadMatchToDBImagesAlgorithm = (dataFromDB, categoryOfSubmittedImage) => {
  const matchingImages = [];

  dataFromDB.forEach(imageObject => {
    imageObject.labelsArray.forEach(labelObject => 
      labelObject.description === categoryOfSubmittedImage ? matchingImages.push(imageObject) : null
      );
  })

  return matchingImages;

}

const specificCategoryCheckerAlgorithm = () => {

}


// 2) EXECUTION FUNCTIONS - FUNCTIONS THAT CALLOUT OTHER SIMPLER FUNCTIONS TO RUN.

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
      const dataFromDB = await ProcessDataFromDB();
      const dataFromSubmitted = await ProcessDataFromImg();

      const submittedImageBroadCategoryMatch = broadCategoryCheckAlgorithm(dataFromSubmitted);
      const imageMatch = BroadMatchToDBImagesAlgorithm(dataFromDB,submittedImageBroadCategoryMatch);

      // imageMatch.length > 3 ? specificCategoryCheckerAlgorithm() : null;
      
      console.log('imageMatch: ', imageMatch);
      console.log('imageMatch: ', imageMatch);
      console.log('submittedImageBroadCategoryMatch: ', submittedImageBroadCategoryMatch);
      console.log('dataFromDB: ', dataFromDB);
      console.log('dataFromSubmitted: ', dataFromSubmitted);


    } catch(err){
      console.log('rejectedDB: ', err.message)
    };

}

// 3) STARTS THE SCRIPT
runTheComparision();
