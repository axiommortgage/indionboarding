const matchUserData = (fieldName, userData, formData) => {


  if(formData[fieldName]){
    if(formData[fieldName] && formData[fieldName].length > 0 ||
      formData[fieldName] !== undefined ||
      formData[fieldName] !== null){
        return formData[fieldName]
    }
  }else{

    if(userData[fieldName]){
      if(userData[fieldName].length > 0 && formData[fieldName] === undefined || 
        userData[fieldName].length > 0 && (formData[fieldName] && formData[fieldName].length === 0) ||
        userData[fieldName].length > 0 && formData[fieldName] === null){        
          return userData[fieldName]
      }      
  
      if(formData[fieldName] && formData[fieldName].length > 0 ||
        formData[fieldName] !== undefined ||
        formData[fieldName] !== null){
          return formData[fieldName]
      }  
    }
    
    if(
      (userData[fieldName] === undefined ||
      userData[fieldName] === null || 
      userData[fieldName].length === 0 ) &&
  
      (formData[fieldName] && formData[fieldName].length > 0)
      
      ){
        return formData[fieldName]
    }

  }  

  return ''
}

export default matchUserData