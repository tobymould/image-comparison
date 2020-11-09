// -------------------------------------------------------------------------------
// 0) Lookup Table 
// -------------------------------------------------------------------------------
const lookUpTable = [
  {
    generalCategory: ['Fruit', 'Vegetable', "Flowering plant", 'Tree', 'Cut flowers']
  }, 
  {
    colourCategory: ['Yellow', 'Green algae', 'Green', 'Banana', 'Purple','Red', 'Pink', 'White', 'Rose']
  }
];

// -------------------------------------------------------------------------------
// 1) RAW FUNCTIONS
// -------------------------------------------------------------------------------

// a) Fetches json files 
const getJsonData = async (url) => {
  const response = await fetch(`./${url}`);
  errorHandler(response, url);
  const data = await response.json();

  return data;
}

// b) Deletes labels with accuracy score less than a set threshold
const removeLowAccuracyLabels = (imageObject) => {

  imageObject.labelsArray.map(labelObject => {
    // console.log('test: ', Object.keys(labelObject));
    Object.keys(labelObject)
    .filter(key => labelObject.score < 0.6)
    .forEach(key => delete labelObject[key])
    // .filter(key => key.length == 0)
    // .forEach(key => delete labelObject)
    // // console.log('test3: ', );

  });
  return imageObject;
}

// c) Filters each label of each image to show only 'description' and 'score' values
const filterLabelsArray = (imageObject) => {
  const filteredLabelsArray = imageObject.labelsArray.map((labelObject => {
    labelObject.score = labelObject.score.toFixed(2);
    return {'description': labelObject.description, 'score': labelObject.score}
  }))

  const imageObjectFiltered = {imageName: imageObject.imageName, labelsArray: filteredLabelsArray}

  return imageObjectFiltered;
}


const cleanDBData = (data) => {
  const arrayOfImageDataObjects = Object.entries(data).map((subArray) => {
    return {imageName: subArray[0], labelsArray: subArray[1]}
  }) 
  
  // C) Iterate the 'labelsArray' nested-array, and delete all properties which are not 'description' or 'score' (because useless).
  arrayOfImageDataObjects.forEach(((imageObject, index) => {
    const imageObjectFiltered = filterLabelsArray(imageObject);
    
    return arrayOfImageDataObjects[index] = imageObjectFiltered
  }))

  // D) Iterate the 'labelsArray' nested-array again, and delete all objects with an accuracy score < 84% (because low accuracy match).
  arrayOfImageDataObjects.forEach((imageObject => {
    // console.log(imageObject.labelsArray)
    removeLowAccuracyLabels(imageObject)
  }))

  // E) Return the cleaned data
  return arrayOfImageDataObjects;
}

const cleanImgData = (data) => {
  const isolatedLabelObject = Object.entries(data).find((subArrays) => subArrays.includes("labelAnnotations"));
  // console.log(isolatedLabelObject);
  const imageObject = {imageName: `submittedImage`, labelsArray: isolatedLabelObject[1]} 

  // C) Iterate the 'labelsArray' nested-array, and delete all properties which are not 'description' or 'score' (because useless).
  const imageObjectFiltered = filterLabelsArray(imageObject);

  removeLowAccuracyLabels(imageObjectFiltered);

  return imageObjectFiltered;
}

const errorHandler = (response, msg) => {
  if (response.status !== 200) {
    throw new Error(`cannot fetch the ${msg}`);
  } 
}

const typeCategoryCheckAlgorithm = (dataFromSubmitted) => {
  let categoryMatched;

  dataFromSubmitted.labelsArray.forEach(labelObject => {
    return lookUpTable[0].generalCategory.forEach(category => 
      labelObject.description === category ? categoryMatched = category : null
    )
  })
  
  return categoryMatched;
}

const colourCategoryCheckAlgorithm = (dataFromSubmitted) => {
  let categoryMatched;
  
  dataFromSubmitted.labelsArray.forEach(labelObject => {
    return lookUpTable[1].colourCategory.forEach(category => 
      labelObject.description === category ? categoryMatched = category : null
    )
  })
  return categoryMatched;
}

const typeMatchToDBImagesAlgorithm = (dataFromDB, categoryOfSubmittedImage) => {
  const matchingImages = [];

  dataFromDB.forEach(imageObject => {
    imageObject.labelsArray.forEach(labelObject => 
      labelObject.description === categoryOfSubmittedImage ? matchingImages.push(imageObject) : null
      );
  })

  return matchingImages;
}

// -------------------------------------------------------------------------------
// 2) EXECUTION FUNCTIONS - FUNCTIONS THAT CALLOUT OTHER SIMPLER FUNCTIONS TO RUN.
// -------------------------------------------------------------------------------


const ProcessDataFromImg = async () => {

  return cleanedDataImg
}

const ProcessDataFromDB = async (dataFromSubmitted) => {

  return cleanedDataDB
}

const test = () => {
  arrayOfImageDataObjects.filter(((imageObject, index) => {
    const submitted1Description = dataFromSubmitted.labelsArray[0].description;
    const submitted1Score = dataFromSubmitted.labelsArray[0].score;
    const DB1Description = imageObject.labelsArray[0].description;
    const DB1Score = imageObject.labelsArray[0].score;
  
    if (submitted1Description === DB1Description && submitted1Score === DB1Score){
      return imageObject;
    }
    // if (labelObject.description === dataFromSubmitted  && labelObject.description === dataFromSubmitted)
    // imageObject.labelsArray[0]
    console.log('test5: ', dataFromSubmitted.labelsArray[0].description);
    console.log('test6: ', dataFromSubmitted.labelsArray[0].score);
    console.log('test7: ', imageObject.labelsArray[0].description);
    console.log('test8: ', imageObject.labelsArray[0].score);
    
    
    // .forEach(labelObject => {
  
  
    // })
  
  }))

}


const runTheComparision = async () => {
    try {
      // 1) Retrieve Data
      const dataFromSubmittedImage = await getJsonData('./data/submittedimage/image10.json')
      const cleanedDataImg = cleanImgData(dataFromSubmittedImage);

      const dataFromDB = await getJsonData('./data/dataUpdated.json')
      const cleanedDataDB = cleanDBData(dataFromDB);

      // const dataFromSubmitted = await ProcessDataFromImg();
      // const dataFromDB = await ProcessDataFromDB(dataFromSubmitted);

      // const ignoreImageRepeat = test();

      // 2) Match submitted image with lookup category, then to DB
      const typeCategoryMatch = typeCategoryCheckAlgorithm(cleanedDataImg);
      const imageMatch = typeMatchToDBImagesAlgorithm(cleanedDataDB, typeCategoryMatch);
      
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


    } catch(err){
      console.log('rejectedDB: ', err.message)
    };


}

// 3) STARTS THE SCRIPT
runTheComparision();


  // let randomNumber;

  // if (randomNumber !== 19){
  //   randomNumber += 1;
  // } else {
  //   randomNumber = 0;
  // }

  // test = 'img1.jpg'
  // const randomImageChooser = data[0].

  // console.log('data: ', randomImageChooser)


// 
// const allowed = ['description', 'score'];

    // const result = imageObject.labelsArray.forEach(labelObject => {
    //   // console.log('labelObject.score-BEFORE', labelObject.score);
    //   labelObject.score = labelObject.score.toFixed(2);
    //   // console.log('labelObject.score-AFTER', labelObject.score);

    //   Object.keys(labelObject)
    //   .filter(key => !allowed.includes(key))
    //   .forEach(key => delete labelObject[key])        
    //   // return {'description': labelObject.description, 'score': labelObject.score}
    // })
    // console.log('imageObject-before', imageObject);
    // console.log('LabelsArray-before', imageObject.labelsArray);




    // const filteredLabelsArray = imageObject.labelsArray.map((labelObject => {
    //   labelObject.score = labelObject.score.toFixed(2);
    //   return {'description': labelObject.description, 'score': labelObject.score}
    // }))

    // // console.log('filteredLabelsArray-after', filteredLabelsArray);
    // imageObject = {imageName: 'submittedImage', labelsArray: filteredLabelsArray} 
    // console.log('imageObject-after', imageObject)
    // imageObject = imageObjectFiltered;
    // return {imageName: imageObject[0], labelsArray: result}
    // return imageObject;
    // return arrayOfImageDataObjects[index] = {imageName: 'submittedImage', labelsArray: imageObjectFiltered}




      // if (arrayOfImageDataObjects === undefined) {
  //   throw new Error(`not working`);
  // } 

  // arrayOfImageDataObjects.forEach((imageObject => {
  //   const result = imageObject.labelsArray.map(labelObject => {
  //     const test = Object.keys(labelObject)
  //     .filter(key => Object.keys(labelObject).length !== 0)
  //     .forEach(key => delete labelObject[key])
  //   })
  // }))

      // imageObject.labelsArray.forEach(labelObject => {
    //   Object.keys(labelObject)
    //   .filter(key => labelObject.score < 0.8)
    //   .forEach(key => delete labelObject[key])
      
    // });
    // return



    // const broadCategoryCheckAlgorithm = (dataFromSubmitted) => {
    //   let categoryMatched = [{"broad": []}, {'colour': []}]
    
    //   dataFromSubmitted.labelsArray.forEach(labelObject => {
    //     console.log(categoryMatched.broad)
    
    //     return lookUpTable[0].generalCategory.forEach(category => 
    //       labelObject.description === category ? categoryMatched[0].broad.push(category) : null
    //     )
    //   })
      
    //   dataFromSubmitted.labelsArray.forEach(labelObject => {
    //     return lookUpTable[1].colourCategory.forEach(category => 
    //       labelObject.description === category ? categoryMatched[1].colour.push(category) : null
    //     )
    //   })
    
    //   console.log(categoryMatched);
    //   return categoryMatched;
    // }
    
    // const BroadMatchToDBImagesAlgorithm = (dataFromDB, categoryOfSubmittedImage) => {
    //   const matchingImages = [];
    
    //   dataFromDB.forEach(imageObject => {
    //     console.log('imageObject: ', imageObject)
    
    //     imageObject.labelsArray.forEach(labelObject => {
    //       console.log('labelObject: ', labelObject)
          
    //       categoryOfSubmittedImage[0].broad.forEach(category => {
    //         console.log('category: ', category)
    //         console.log('labelObject.description: ', labelObject.description)
    //         console.log('imageObject2: ', imageObject)
    //         labelObject.description === category ? matchingImages.push(imageObject) : null
    //       })
    //     }
    //     );
    
    //   })
    
    //   console.log('matchingImages: ', matchingImages)
    //   return matchingImages;
    // }