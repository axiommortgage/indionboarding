export const Validation = (fields, requiredFields, isSigned, hasInitials, attachments) => {
  const invalidFields = () => {
    let passedFieldsArr = []
    let invalid = []

    for (const f in fields) {
      //pushing to invalid
      requiredFields.forEach((vf) => {
        if (
          (vf === f && fields[f] === null) ||
          (vf === f && fields[f] === '') ||
          (vf === f && fields[f] === undefined)
        ) {
          invalid.push(f)
        }
      })

      //transforming object in Array
      if (
        f !== '_id' &&
        f !== 'id' &&
        f !== '_v' &&
        f !== '__v' &&
        f !== 'createdAt' &&
        f !== 'updatedAt' &&
        f !== 'created_by' &&
        f !== 'updated_by' &&
        f !== 'published_at' &&
        f !== 'slug' &&
        f !== 'user'
      ) {
        passedFieldsArr = [...passedFieldsArr, f]
      }

      const regexp = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i

      if ((f === 'additionalDomainNames' || f === 'priorWebsiteDomainNames') && fields[f].length <= 4) {
        invalid.push(f)
      }

      //checking if birthdate has a valid format
      if (f === 'birthdate' || f === 'sin') {
        if (fields[f] === '' || fields[f] === null || fields[f] === undefined) {
          invalid.push(f)
        }
      }
    }

    // Regex for validating the domain part (allows hyphens, subdomains, TLD 2-6 letters)
    const domainRegex = /^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/

    // Define a URL regex (simple version allowing http/https)
    const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/i

    // --- Validate websiteDomainName using domainRegex ---
    if (fields.websiteDomainName) {
      const domainToTest = fields.websiteDomainName.replace(/^https?:\/\/(?:www\.)?/, '') // Strip protocol/www
      if (!domainRegex.test(domainToTest)) {
        if (!invalid.includes('websiteDomainName')) {
          invalid.push('websiteDomainName')
        }
      }
    }
    // --- End websiteDomainName validation ---

    // --- Validate Social Media URLs using urlRegex ---
    const socialUrlFields = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube']
    socialUrlFields.forEach((field) => {
      if (fields[field] && !urlRegex.test(fields[field])) {
        if (!invalid.includes(field)) {
          invalid.push(field)
        }
      }
    })
    // --- End Social Media URL validation ---

    // Validate domains within priorWebsitesUse array
    if (fields.priorWebsitesUse && Array.isArray(fields.priorWebsitesUse)) {
      fields.priorWebsitesUse.forEach((site, index) => {
        // Use a domain-specific regex (less strict than full URL)
        const domainRegex = /^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/
        // Remove protocol and www. before testing
        const domainToTest = site.domain ? site.domain.replace(/^https?:\/\/(?:www\.)?/, '') : ''
        if (site.domain && !domainRegex.test(domainToTest)) {
          // Push specific invalid field identifier
          const invalidFieldId = `priorWebsitesUse_${index}`
          if (!invalid.includes(invalidFieldId)) {
            invalid.push(invalidFieldId)
          }
        }
      })
    }

    //Checking if there is signature
    if (!isSigned && isSigned !== null) {
      invalid.push('signature')
    }

    //Checking if there is initials
    if (!hasInitials && hasInitials !== null) {
      invalid.push('initials')
    }

    //Checking if there is initials
    if (attachments !== null && attachments !== undefined && !attachments.articleOfIncorporation) {
      invalid.push('articleOfIncorporation')
    }

    let cleanPassedFields = [...new Set(passedFieldsArr)]

    //checking if required field wasn't passed
    const nonPassed = requiredFields.filter((rq) => {
      return cleanPassedFields.indexOf(rq) == -1
    })

    //Adding nonPassed fields to invalid
    const allInvalid = invalid.concat(nonPassed)

    return allInvalid
  }

  let invalidItems
  if (invalidFields().length > 0) {
    const validatedFields = invalidFields()
    invalidItems = validatedFields.map((f) => {
      switch (f) {
        case 'photo':
          return { id: 'photo', label: 'Digital Photo' }
        case 'signature':
          return { id: 'signature', label: 'Signature' }
        case 'initials':
          return { id: 'initials', label: 'Initials' }
        case 'witnessName':
          return { id: 'witnessName', label: 'Witness Name' }
        case 'firstname':
          return { id: 'firstname', label: 'First Name' }
        case 'lastname':
          return { id: 'lastname', label: 'Last Name' }
        case 'workEmail':
          return { id: 'workEmail', label: 'Preferred Email Address' }
        case 'workPhone':
          return { id: 'workPhone', label: 'Preferred Phone Number' }
        case 'position':
          return { id: 'position', label: 'Position' }
        case 'address':
          return { id: 'address', label: 'Office Address' }
        case 'city':
          return { id: 'city', label: 'Office City' }
        case 'province':
          return { id: 'province', label: 'Office Province' }
        case 'postalCode':
          return { id: 'postalCode', label: 'Office Postal Code' }
        case 'bio':
          return { id: 'bio', label: 'More About Me (Bio)' }
        case 'personalAddress':
          return { id: 'personalAddress', label: 'Personal Address' }
        case 'personalCity':
          return { id: 'personalCity', label: 'Personal City' }
        case 'personalProvince':
          return { id: 'personalProvince', label: 'Personal Province' }
        case 'personalPostalCode':
          return { id: 'personalPostalCode', label: 'Personal Postal Code' }
        case 'phone':
          return { id: 'phone', label: 'Preferred Phone Number' }
        case 'cellPhone':
          return { id: 'cellPhone', label: 'Cell Phone' }
        case 'emergencyContact':
          return { id: 'emergencyContact', label: 'Emergency Contact' }
        case 'emergencyPhone':
          return { id: 'emergencyPhone', label: 'Emergency Phone' }
        case 'birthdate':
          return { id: 'birthdate', label: 'Birth Date' }
        case 'sin':
          return { id: 'sin', label: 'SIN' }
        case 'websiteOptIn':
          return { id: 'websiteOptIn', label: 'Indi Website Opt In' }
        case 'startDate':
          return { id: 'startDate', label: 'Start Date' }
        case 'brokerOfRecord':
          return { id: 'brokerOfRecord', label: 'Broker you are leaving' }
        case 'brokerName':
          return { id: 'brokerName', label: 'Broker Name' }
        case 'nameAndTitle':
          return { id: 'nameAndTitle', label: 'Name And Title' }
        case 'loginId':
          return { id: 'loginId', label: 'Login ID' }
        case 'firmCode':
          return { id: 'firmCode', label: 'Firm Code' }
        case 'firmName':
          return { id: 'firmName', label: 'Firm Name' }
        case 'per':
          return { id: 'per', label: 'Per' }
        case 'brokerName':
          return { id: 'brokerName', label: 'Broker  Name' }
        case 'bankName':
          return { id: 'bankName', label: 'Bank Name' }
        case 'accountType':
          return { id: 'accountType', label: 'Account Type' }
        case 'bankAddress':
          return { id: 'bankAddress', label: 'Bank Address' }
        case 'institutionNumber':
          return { id: 'institutionNumber', label: 'Institution Number' }
        case 'transitNumber':
          return { id: 'transitNumber', label: 'Transit Number' }
        case 'accountNumber':
          return { id: 'accountNumber', label: 'Account Number' }
        case 'nameOnAccount':
          return { id: 'nameOnAccount', label: 'Name On Account' }
        case 'officeAddress':
          return { id: 'officeAddress', label: 'Office Address' }
        case 'officeCity':
          return { id: 'officeCity', label: 'Office City' }
        case 'officePostalCode':
          return { id: 'officePostalCode', label: 'Office Postal Code' }
        case 'officeProvince':
          return { id: 'officeProvince', label: 'Office Province' }
        case 'acknowledgement':
          return { id: 'acknowledgement', label: 'Read and Download Acknowledgement' }
        case 'articlesOfIncorporation':
          return { id: 'articlesOfIncorporation', label: 'Articles of Incorporation File' }
        case 'businessNumber':
          return { id: 'businessNumber', label: 'Business Number' }
        case 'declarationDetails':
          return { id: 'declarationDetails', label: 'Declaration Details' }
        case 'declarationBankruptcy':
          return { id: 'declarationBankruptcy', label: 'Declaration of Bankruptcy' }
        case 'declarationCriminalOffense':
          return { id: 'declarationCriminalOffense', label: 'Declaration of Criminal Offense' }
        case 'declarationFraud':
          return { id: 'declarationFraud', label: 'Declaration Of Fraud' }
        case 'declarationLicenseDenied':
          return { id: 'declarationLicenseDenied', label: 'Declaration of License Denied' }
        case 'declarationSuspended':
          return { id: 'declarationSuspended', label: 'Declaration of Suspension' }
        case 'completingCompliance':
          return { id: 'completingCompliance', label: 'Completing Compliance' }
        case 'assistantTo':
          return { id: 'assistantTo', label: 'Assistant To' }
        case 'additionalDomains':
          return { id: 'additionalDomains', label: 'Additional Domains Yes/No' }
        case 'additionalDomainNames':
          return { id: 'additionalDomainNames', label: 'Additional Domain Names' }
        case 'priorWebsite':
          return { id: 'priorWebsite', label: 'Existing Mortgage Related Websites' }
        case 'priorWebsiteDomainNames':
          return { id: 'priorWebsiteDomainNames', label: 'Existing Mortgage Website Domain Names' }
        // Add cases for URL fields
        case 'websiteDomainName':
          return { id: 'websiteDomainName', label: 'Website Domain Name (Invalid Format)' }
        case 'facebook':
          return { id: 'facebook', label: 'Facebook URL (Invalid Format)' }
        case 'instagram':
          return { id: 'instagram', label: 'Instagram URL (Invalid Format)' }
        case 'linkedin':
          return { id: 'linkedin', label: 'LinkedIn URL (Invalid Format)' }
        case 'twitter':
          return { id: 'twitter', label: 'Twitter URL (Invalid Format)' }
        case 'youtube':
          return { id: 'youtube', label: 'YouTube URL (Invalid Format)' }
        case 'priorWebsitesUse':
          return { id: 'priorWebsitesUse', label: 'One or more Prior Website Domains has an invalid format' }
        case String(f.match(/^priorWebsitesUse_\d+$/)):
          const index = f.split('_')[1]
          return { id: f, label: `Prior Website Domain #${parseInt(index) + 1} (Invalid Format)` }
        case 'brokerageLicense':
          return { id: 'brokerageLicense', label: 'Brokerage License' }
        case 'businessCardOptOut':
          return { id: 'businessCardOptOut', label: 'Business Card Opt In/Out' }
        // Labels for Declaration Yes/No fields
        case 'declarationRegulatoryReview':
          return {
            id: 'declarationRegulatoryReview',
            label: 'Declaration: Subject to Reviews/Complaints/Investigations'
          }
        case 'declarationClientComplaints':
          return { id: 'declarationClientComplaints', label: 'Declaration: Unresolved Client Complaints' }
        // Labels for Declaration Details fields
        case 'declarationRegulatoryReviewDetails':
          return {
            id: 'declarationRegulatoryReviewDetails',
            label: 'Declaration Details: Subject to Reviews/Complaints/Investigations'
          }
        case 'declarationClientComplaintsDetails':
          return {
            id: 'declarationClientComplaintsDetails',
            label: 'Declaration Details: Unresolved Client Complaints'
          }
        default:
          return f
      }
    })
  } else {
    invalidItems = []
  }

  return invalidItems
}
