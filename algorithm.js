// Comments are included for the sake of the assessment only.
// -------------------------------------------------------------------------------
// 0) LOOKUP TABLE 
// -------------------------------------------------------------------------------
// 
const lookUpTable = [
  {
    generalCategory: ['Fruit', 'Vegetable', "Flowering plant", 'Tree', 'Cut flowers']
  }, 
  {
    colourCategory: ['Yellow', 'Green algae', 'Green', 'Banana', 'Purple','Red', 'Pink', 'White', 'Rose']
  }
];

// -------------------------------------------------------------------------------
// 1) BASIC FUNCTIONS
// -------------------------------------------------------------------------------

// a) Fetches json files.
const getJsonData = async (url) => {
  const response = await fetch(`./${url}`);
  errorHandler(response, url);
  const data = await response.json();

  return data;
}

// b) Gives specific message if the fetched file could not be found.
const errorHandler = (response, msg) => {
  if (response.status !== 200) {
    throw new Error(`cannot fetch the ${msg}`);
  } 
}

// c) Deletes labels with accuracy score less than a set threshold.
const removeLowAccuracyLabels = (imageObject) => {

  imageObject.labelsArray.map(labelObject => {
    Object.keys(labelObject)
    .filter(key => labelObject.score < 0.6)
    .forEach(key => delete labelObject[key])
  });
  
  return imageObject;
}

// d) Filters each label of each image to show only 'description' and 'score' values.
const filterLabelsArray = (imageObject) => {
  const filteredLabelsArray = imageObject.labelsArray.map((labelObject => {
    labelObject.score = labelObject.score.toFixed(2);
    return {'description': labelObject.description, 'score': labelObject.score}
  }))

  const imageObjectFiltered = {imageName: imageObject.imageName, labelsArray: filteredLabelsArray}

  return imageObjectFiltered;
}

// e) To randomly select an images data from the DB to submit for suggestions.
const randomNumberGenerator = () => {
  let randomNumber
  const max = 19;

  randomNumber = Math.floor(Math.random() * max);
  console.log('randomNumber', randomNumber)

  return randomNumber;
}

// -------------------------------------------------------------------------------
// 2) PROCEDURAL FUNCTIONS - that nest the BASIC FUNCTIONS
// -------------------------------------------------------------------------------

// a) Iterates through the DB of labels for the 20 images, converts DB list to an array of image OBJECTS, and runs functions (b) & (c) on each. 
const cleanDBData = (data) => {
  const arrayOfImageDataObjects = Object.entries(data).map((subArray) => {
    return {imageName: subArray[0], labelsArray: subArray[1]}
  }) 
  
  // Iterate the 'labelsArray' nested-array, and delete all properties which are not 'description' or 'score' (because useless).
  arrayOfImageDataObjects.forEach(((imageObject, index) => {
    const imageObjectFiltered = filterLabelsArray(imageObject);
    
    return arrayOfImageDataObjects[index] = imageObjectFiltered
  }))

  // Iterate the 'labelsArray' nested-array again, and delete all objects with an accuracy score < 84% (because low accuracy match).
  arrayOfImageDataObjects.forEach((imageObject => {
    // console.log(imageObject.labelsArray)
    removeLowAccuracyLabels(imageObject)
  }))

  // Return the cleaned data
  return arrayOfImageDataObjects;
}

// b) Iterates through the submitted image object, filters to keep the 'labelAnnotations' array, and runs functions (b) & (c) on each of its labels. 
const cleanImgData = (data) => {
  const number = randomNumberGenerator();
  const isolatedLabelObject = Object.entries(data[number][`img${number+1}.jpg`]).find((subArrays) => subArrays.includes("labelAnnotations"));
  const imageObject = {imageName: `submittedImage`, labelsArray: isolatedLabelObject[1]} 

  // Iterate the 'labelsArray' nested-array, and delete all properties which are not 'description' or 'score' (because useless).
  const imageObjectFiltered = filterLabelsArray(imageObject);

  removeLowAccuracyLabels(imageObjectFiltered);

  return imageObjectFiltered;
}


// c) Compares the submitted image labels for a match with 1 of the 5 'generalCategories' in the lookup table.
const typeCategoryCheckAlgorithm = (dataFromSubmitted) => {
  let categoryMatched;

  dataFromSubmitted.labelsArray.forEach(labelObject => {
    return lookUpTable[0].generalCategory.forEach(category => 
      labelObject.description === category ? categoryMatched = category : null
    )
  })
  
  return categoryMatched;
}

// d) Same as (2c) but compares with the 'colourCategories' in the lookup table.
const colourCategoryCheckAlgorithm = (dataFromSubmitted) => {
  let categoryMatched;
  
  dataFromSubmitted.labelsArray.forEach(labelObject => {
    return lookUpTable[1].colourCategory.forEach(category => 
      labelObject.description === category ? categoryMatched = category : null
    )
  })
  return categoryMatched;
}

// e) Compares the matched term to the 'generalCategory' from lookup table from the submitted image for matches in the DB.
const typeMatchToDBImagesAlgorithm = (dataFromDB, categoryOfSubmittedImage) => {
  const matchingImages = [];

  dataFromDB.forEach(imageObject => {
    imageObject.labelsArray.forEach(labelObject => 
      labelObject.description === categoryOfSubmittedImage ? matchingImages.push(imageObject) : null
      );
  })

  return matchingImages;
}

// f) Method to hide the duplicate image prior to the comparison process
const deleteImageRepeat = () => {
  arrayOfImageDataObjects.filter(((imageObject, index) => {
    const submitted1Description = dataFromSubmitted.labelsArray[0].description;
    const submitted1Score = dataFromSubmitted.labelsArray[0].score;
    const DB1Description = imageObject.labelsArray[0].description;
    const DB1Score = imageObject.labelsArray[0].score;
  
    if (submitted1Description === DB1Description && submitted1Score === DB1Score){
      return imageObject;
    }  
  }))

}

// -------------------------------------------------------------------------------
// 3) EXECUTION FUNCTION
// -------------------------------------------------------------------------------

const runTheComparision = async () => {
    try {
      // STEP-1) Retrieve submitted image data and clean it
      const dataFromSubmittedImage = await getJsonData('./data/testDataArray.json')
      const cleanedDataImg = cleanImgData(dataFromSubmittedImage);
      
      // STEP-2) Retrieve submitted image data and clean it
      const dataFromDB = await getJsonData('./data/dataUpdated.json')
      const cleanedDataDB = cleanDBData(dataFromDB);

      // STEP-3) Match submitted image with lookup category, then to DB
      const typeCategoryMatch = typeCategoryCheckAlgorithm(cleanedDataImg);
      const imageMatch = typeMatchToDBImagesAlgorithm(cleanedDataDB, typeCategoryMatch);
    
      const finalSuggestionList = imageMatch.slice(0, 4);
      
      // 3) If not matches, try to match by plant colour
      // if (typeCategoryMatch.length === 0){
      //   const colourCategoryMatch = colourCategoryCheckAlgorithm(dataFromSubmitted);
      // } 
      
      // 4) If no matches are made, match by 'Plant' (the broadest category) so another product is suggested at least.

      // imageMatch.length >=1 ? plantCategoryCheckerAlgorithm() : null;
      
      console.log('dataFromDB: ', dataFromDB);
      console.log('cleanedDataImg: ', cleanedDataImg);
      console.log('TypeCategoryMatch: ', typeCategoryMatch);
      console.log('imageMatch: ', imageMatch);
      console.log('imageMatch.length: ', imageMatch.length);
      console.log('finalSuggestionList: ', finalSuggestionList);


    } catch(err){
      console.log('rejectedDB: ', err.message)
    };

}

runTheComparision();
