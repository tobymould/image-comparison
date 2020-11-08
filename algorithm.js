
// 0) REFERENCE DATA
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
const getJsonData = async (url) => {
  const response = await fetch(`./${url}`);
  errorHandler(response, url);
  const data = await response.json();

  return data;
}

const removeLowAccuracyLabels = (imageObject) => {

  imageObject.labelsArray.map(labelObject => {
    Object.keys(labelObject)
    .filter(key => labelObject.score < 0.6)
    .forEach(key => delete labelObject[key])
    
  });

  return imageObject;
}

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
    removeLowAccuracyLabels(imageObject)
  }))

  // E) Return the cleaned data
  return arrayOfImageDataObjects;
}

const cleanImgData = (data) => {
  const isolatedLabelObject = Object.entries(data).find((subArrays) => subArrays.includes("labelAnnotations"));
  const imageObject = {imageName: 'submittedImage', labelsArray: isolatedLabelObject[1]} 

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

const ProcessDataFromDB = async () => {
  const dataFromDB = await getJsonData('./data/data.json')
  const cleanedDataDB = cleanDBData(dataFromDB);
  return cleanedDataDB
}

const ProcessDataFromImg = async () => {
  const dataFromSubmittedImage = await getJsonData('./data/image5.json')
  const cleanedDataImg = cleanImgData(dataFromSubmittedImage);
  return cleanedDataImg
}

const runTheComparision = async () => {
    try {
      const dataFromDB = await ProcessDataFromDB();
      const dataFromSubmitted = await ProcessDataFromImg();

      const typeCategoryMatch = typeCategoryCheckAlgorithm(dataFromSubmitted);
      
      if (typeCategoryMatch.length !== 0){
        const imageMatch = typeMatchToDBImagesAlgorithm(dataFromDB, typeCategoryMatch);
      } else {
        const colourCategoryMatch = colourCategoryCheckAlgorithm(dataFromSubmitted);
      }
      

      // imageMatch.length > 3 ? specificCategoryCheckerAlgorithm() : null;
      
      console.log('dataFromDB: ', dataFromDB);
      console.log('dataFromSubmitted: ', dataFromSubmitted);
      console.log('TypeCategoryMatch: ', typeCategoryMatch);
      console.log('imageMatch: ', imageMatch);


    } catch(err){
      console.log('rejectedDB: ', err.message)
    };


}

// 3) STARTS THE SCRIPT
runTheComparision();



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