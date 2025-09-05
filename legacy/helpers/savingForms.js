import { formatPhone } from './formatPhone'
import axios from 'axios'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

//Check Values does a pre validation and update the formInfo Object
export const checkValues = (currentForm, requiredFields) => {
  const inputs = currentForm.querySelectorAll('input')
  const ipt = Array.from(inputs)
  const selects = Array.from(currentForm.querySelectorAll('select'))
  const textareas = Array.from(currentForm.querySelectorAll('textarea'))
  const allInputs = ipt.concat(selects, textareas)

  const empty = []

  const mappedFormInfo = allInputs.map((i) => {
    if (i.value && i.value !== '' && i.value !== null && i.value !== undefined) {
      if (i.type === 'tel') {
        return { [i.name]: { masked: i.value, raw: i.value.replace(/\D/g, '') } }
      }
      return { [i.name]: i.value }
    }

    requiredFields.forEach((r) => {
      if (i.name === r && i.value === '') {
        empty.push(i.name)
      }
      return { [i.name]: '' }
    })

    if (i.type === 'checkbox') {
      return { [i.name]: i.checked }
    }

    return { [i.name]: i.value }
  })

  let data = {}

  mappedFormInfo.forEach((f) => {
    data = { ...data, ...f }
  })

  if ((data && data !== null) || (data && data !== undefined)) {
    //clear empty items from finalData
    let clearFinalData = {}
    for (let i in data) {
      if (data[i] != '') {
        clearFinalData = { ...clearFinalData, [i]: data[i] }
      }
    }

    let finalData = {}
    for (const d in clearFinalData) {
      if (clearFinalData[d] === 'true' || clearFinalData[d] === true) {
        finalData = { ...finalData, [d]: true }
      } else if (clearFinalData[d] === 'false' || clearFinalData[d] === false) {
        finalData = { ...finalData, [d]: false }
      } else {
        finalData = { ...finalData, [d]: clearFinalData[d] }
      }
    }

    return finalData
  }

  return null
}

export const checkEnabledForm = (allForms) => {
  let enabled = []

  const forms = [
    'brokerInfo',
    'unlicensedInfo',
    'mpcApplication',
    'businessCardInfo',
    'websiteInfo',
    'letterOfDirection',
    'paymentAuthorization',
    'policiesAndProcedure',
    'unlicensedPolicies',
    'contractAndSchedule',
    'photos'
  ]

  for (let item in allForms) {
    forms.forEach((frm) => {
      if (frm === item && allForms[item] !== null) {
        enabled.push(item)
      }
    })
  }

  return enabled
}

export const updatePercentage = (forms) => {
  let percentValues
  const enabled = checkEnabledForm(forms)

  const filterFinishedForms = () => {
    let currentFinished = []
    let totalForms = []

    enabled.forEach((f) => {
      if (
        f === 'brokerInfo' ||
        f === 'unlicensedInfo' ||
        f === 'businessCardInfo' ||
        f === 'contractAndSchedule' ||
        f === 'letterOfDirection' ||
        f === 'mpcApplication' ||
        f === 'paymentAuthorization' ||
        f === 'photos' ||
        f === 'policiesAndProcedure' ||
        f === 'unlicensedPolicies' ||
        f === 'websiteInfo'
      ) {
        totalForms.push(f)
        if (forms[f] && forms[f].isFormComplete) {
          currentFinished.push(f)
        }
      }
    })

    percentValues = { total: totalForms.length, current: currentFinished.length }
    return percentValues
  }

  return Math.floor((filterFinishedForms().current / filterFinishedForms().total) * 100)
}

//Updates the formStatus in userAuth the Context
export const updateFormsInContext = (formName, formObj, allForms, userAuth, fromFinished) => {
  const pct = updatePercentage(allForms)

  let newCtxFormsObj

  if (fromFinished) {
    newCtxFormsObj = {
      ...userAuth,
      forms: allForms
    }
  } else {
    newCtxFormsObj = {
      ...userAuth,
      beforeLeave: { action: 'stay', showAlert: false, route: null, event: null },
      forms: { ...allForms, [formName]: formObj, isFormSaved: true }
    }
  }

  return newCtxFormsObj
}

//Check if there is any previous data for that field and return it
export const checkPreviousData = (formName, fieldName, user, onboarding) => {
  if (user) {
    if (fieldName === 'workPhone') {
      fieldName = 'phone'
    }

    if (fieldName === 'brokerName') {
      const firstname = user && user.firstname && user.firstname.length > 0 ? user.firstname : ''
      const middlename = user && user.middlename && user.middlename.length > 0 ? user.middlename : ''
      const lastname = user && user.lastname && user.lastname.length > 0 ? user.lastname : ''

      return `${firstname}${middlename ? ' ' + middlename : ''} ${lastname}`
    }

    if (formName === 'businessCardInfo' && fieldName === 'address') {
      const addr = user && user.address && user.address.length > 0 ? user.address : ''
      const city = user && user.city && user.city.length > 0 ? user.city : ''
      const province = user && user.province && user.province.length > 0 ? user.province : ''
      const postalCode = user && user.postalCode && user.postalCode.length > 0 ? user.postalCode : ''

      return `${addr}, ${city} ${province}, ${postalCode}`
    }

    if (formName === 'businessCardInfo' && fieldName === 'withPhoto') {
      if (onboarding && onboarding[formName][fieldName] === false) {
        return { withPhotoYes: false, withPhotoNo: true, [fieldName]: onboarding[formName][fieldName] }
      }
      if (onboarding && onboarding[formName][fieldName] === true) {
        return { withPhotoYes: true, withPhotoNo: false, [fieldName]: onboarding[formName][fieldName] }
      }
      return { withPhotoYes: null, withPhotoNo: null, [fieldName]: onboarding[formName][fieldName] }
    }

    if (formName === 'businessCardInfo' && fieldName === 'withQrCode') {
      if (onboarding && onboarding[formName][fieldName] === false) {
        return { withQrCodeYes: false, withQrCodeNo: true, [fieldName]: onboarding[formName][fieldName] }
      }
      if (onboarding && onboarding[formName][fieldName] === true) {
        return { withQrCodeYes: true, withQrCodeNo: false, [fieldName]: onboarding[formName][fieldName] }
      }
      return { withQrCodeYes: null, withQrCodeNo: null, [fieldName]: onboarding[formName][fieldName] }
    }

    if (formName === 'websiteInfo' && fieldName === 'priorWebsitesUse') {
      if (onboarding && onboarding[formName][fieldName]) {
        console.log('Prior Use', onboarding[formName][fieldName])
        return ''
      }

      if (fieldName === 'websiteDomainName' && onboarding && onboarding[formName][fieldName].length > 0) {
        return onboarding[formName][fieldName]
      }

      if (fieldName === 'websiteDomainName' && user && user.website && user.website.lenbth > 0) {
        return user.website
      }

      if (fieldName === 'websiteDomainRegistrar' && onboarding && onboarding[formName][fieldName].length > 0) {
        return onboarding[formName][fieldName]
      }

      if (
        fieldName === 'websiteDomainRegistrar' &&
        user &&
        user.websiteDomainRegistrar &&
        user.websiteDomainRegistrar.lenbth > 0
      ) {
        return user.websiteDomainRegistrar
      }
    }

    if (
      formName === 'mpcApplication' &&
      (fieldName === 'officeProvince' ||
        fieldName === 'officeAddress' ||
        fieldName === 'officeSuiteUnit' ||
        fieldName === 'officePostalCode')
    ) {
      if (onboarding && onboarding.mpcApplication && onboarding.mpcApplication[fieldName]) {
        return onboarding.mpcApplication[fieldName]
      } else {
        switch (fieldName) {
          case 'officeProvince':
            return user && user.province && user.province.length > 0 ? user.province : ''
          case 'officeAddress':
            return user && user.address && user.address.length > 0 ? user.address : ''
          case 'officeCity':
            return user && user.city && user.city.length > 0 ? user.city : ''
          case 'officeSuiteUnit':
            return user && user.suiteUnit && user.suiteUnit.length > 0 ? user.suiteUnit : ''
          case 'officeProvince':
            return user && user.postalCode && user.postalCode.length > 0 ? user.postalCode : ''
        }
      }
    }

    if (
      formName === 'mpcApplication' &&
      (fieldName === 'province' || fieldName === 'address' || fieldName === 'suiteUnit' || fieldName === 'postalCode')
    ) {
      if (onboarding && onboarding.mpcApplication && onboarding.mpcApplication[fieldName]) {
        return onboarding.mpcApplication[fieldName]
      } else {
        switch (fieldName) {
          case 'province':
            return user && user.personalProvince && user.personalProvince.length > 0 ? user.personalProvince : ''
          case 'address':
            return user && user.personalAddress && user.personalAddress.length > 0 ? user.personalAddress : ''
          case 'city':
            return user && user.personalCity && user.personalCity.length > 0 ? user.personalCity : ''
          case 'suiteUnit':
            return user && user.personalSuiteUnit && user.personalSuiteUnit.length > 0 ? user.personalSuiteUnit : ''
          case 'province':
            return user && user.personalPostalCode && user.personalPostalCode.length > 0 ? user.personalPostalCode : ''
        }
      }
    }

    if (fieldName === 'payrollRequired') {
      if (onboarding && onboarding[formName][fieldName]) {
        if (onboarding[formName][fieldName] === true) {
          return { payrollRequiredYes: true, payrollRequiredNo: false, [fieldName]: onboarding[formName][fieldName] }
        }
        return { payrollRequiredYes: false, payrollRequiredNo: true, [fieldName]: onboarding[formName][fieldName] }
      }

      return { payrollRequiredYes: false, payrollRequiredNo: false, [fieldName]: onboarding[formName][fieldName] }
    }

    if (
      user &&
      user[fieldName] &&
      (user[fieldName] !== null || user[fieldName] !== undefined || user[fieldName] !== '')
    ) {
      return user[fieldName]
    } else {
      if (onboarding && onboarding[formName][fieldName]) {
        return onboarding[formName][fieldName]
      } else {
        switch (fieldName) {
          case 'facebook':
            return user[fieldName]
          case 'instagram':
            return user[fieldName]
          case 'linkedin':
            return user[fieldName]
          case 'twitter':
            return user[fieldName]
          case 'youtube':
            return user[fieldName]
          default:
            return ''
        }
      }
    }
  }
}

//Check if there is a Signature
export const checkSignature = (signature, hasSignature) => {
  let status = () => {
    if (signature && signature !== null && signature.url && signature.url.length > 0) {
      return true
    } else {
      return false
    }
  }

  if (status()) {
    return { isSaved: true, data: signature }
  } else {
    return { isSaved: false }
  }
}

//Check if there is a Signature
export const checkInitials = (signature) => {
  let status = () => {
    if (signature && signature !== null && signature.url && signature.url.length > 0) {
      return true
    } else {
      return false
    }
  }

  if (status()) {
    return { isSaved: true, data: signature }
  } else {
    return { isSaved: false }
  }
}

export const isFormSaved = (event, isSaved) => {
  event.preventDefault()
  if (isSaved) {
    return false
  }
  return true
}

export const filterCompletedForms = (forms, curr, incomplete) => {
  const enabled = checkEnabledForm(forms)
  let formsArr = []
  let currFormName

  enabled.forEach((f) => {
    if (
      f === 'brokerInfo' ||
      f === 'unlicensedInfo' ||
      f === 'businessCardInfo' ||
      f === 'contractAndSchedule' ||
      f === 'letterOfDirection' ||
      f === 'mpcApplication' ||
      f === 'paymentAuthorization' ||
      f === 'photos' ||
      f === 'policiesAndProcedure' ||
      f === 'unlicensedPolicies' ||
      f === 'websiteInfo'
    ) {
      if (f === curr) {
        currFormName = f
      }

      formsArr.push({ [f]: forms[f] })
    }
  })

  let filtered = []
  //Get All forms but current
  formsArr.forEach((f) => {
    const key = Object.keys(f)[0]
    console
    if (f[key].isFormComplete && key !== currFormName) {
      filtered.push(f)
    }
  })

  //If the current is complete, sum + 1 to filtered
  let completeNum = filtered.length
  if (incomplete === false) {
    completeNum = completeNum + 1
  }

  const percent = Math.floor((completeNum / formsArr.length) * 100)

  return percent
}

export const setLastFormVisited = async (form, onboardingId, config) => {
  await axios
    .put(`${apiUrl}/onboarding-processes/${onboardingId}`, { lastFormVisited: form }, config)
    .then((res) => {
      return res.data
    })
    .catch((err) => {
      console.log(err)
      throw err
    })
}
