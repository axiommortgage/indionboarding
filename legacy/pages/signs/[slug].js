import { useEffect, useState, useRef, useContext } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { serializeJson } from '../../helpers/serializeData'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Processing from '../../components/Processing'
import AuthContext from '../../context/authContext'
import style from '../../styles/Printables.module.scss'

const Sign = (props) => {
  const { user, form } = props
  const router = useRouter()
  const [embedUrl, setEmbedUrl] = useState(null)

  const connectToAdobeSign = async () => {
    //Refresh Access Token
    const params = new URLSearchParams()
    params.append('grant_type', 'refresh_token')
    params.append('client_id', process.env.ADOBE_SIGN_CLIENT_ID)
    params.append('client_secret', process.env.ADOBE_SIGN_CLIENT_SECRET)
    params.append('refresh_token', '3AAABLblqZhBZ5LKzcpuDDor9dZ8D0seo4woTKOGievjLpHg81VWWQHUQ6KEynfQajuGDsFDxuik*')
    const accessToken = await axios
      .post('https://api.na4.adobesign.com/oauth/v2/refresh', params, {
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      })
      .then((res) => {
        console.log('NEW ACCESS TOKEN: ', res.data.access_token)
        return res.data.access_token
      })
      .catch((err) => {
        console.log(err)
      })

    //Getting the correct pdf form filled from User

    const matchFile = () => {
      const forms = user.onboarding
      return forms.filter((f) => {
        const nameSlug = f.formFile.name.replace(/\s+/g, '-')
        const removeExtension = nameSlug.replace(/\.[^/.]+$/, '')
        return removeExtension === router.query.slug
      })
    }

    console.log(matchFile())

    //Upload PDF File to Adobe Sign
    const formfile = await matchFile()
    const formData = await new FormData()
    const pdfFileUrl = formfile[0].formFile.url
    const pdfFileName = formfile[0].formFile.name
    const pdfBytes = await fetch(pdfFileUrl).then((res) => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const bytes = new Uint8Array(pdfBytes)
    const pdfFile = new Blob([bytes], { type: 'application/pdf' })
    console.log('FILE', pdfFile)
    formData.append('File-Name', formfile[0].name)
    formData.append('File', pdfFile)

    const transientDocumentId = await axios
      .post('https://api.na4.adobesign.com/api/rest/v6/transientDocuments', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then((res) => {
        console.log('TRANSIENT: ', res.data.transientDocumentId)
        return res.data.transientDocumentId
      })
      .catch((err) => {
        console.log(err)
      })

    //Check if Current User and Form has a Agreement already
    let agreementId
    // if(user.onboarding && user.onboarding.length > 0){
    //   console.log('IT HAS Agreements')
    //   const currentAgreement = user.onboarding.filter( agr => agr.formFile.name === formfile[0].formFile.name)
    //   console.log('CURR Agreement ', currentAgreement)

    //   if(currentAgreement && currentAgreement !== null && currentAgreement !== undefined && currentAgreement.length > 0){
    //     agreementId = currentAgreement.agreementId
    //     console.log('PULLING Agreement By ID: ', agreementId)
    //   }else{
    //     //Creating the Agreement
    //   agreementId  = await axios.post('https://api.na4.adobesign.com/api/rest/v6/agreements', {
    //   "fileInfos": [
    //     {
    //       "transientDocumentId": transientDocumentId
    //     }
    //   ],
    //   "name": formfile[0].name,
    //   "participantSetsInfo": [
    //     {
    //       "memberInfos": [
    //         {
    //           "email": user.email
    //         }
    //       ],
    //       "order": 1,
    //       "role": "SIGNER"
    //     }
    //   ],
    //   "signatureType": "ESIGN",
    //   "state": "IN_PROCESS"
    // }, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${accessToken}`
    //   }
    // }).then(async (res) => {
    //   console.log('AGREEMENT_ID', res.data.id)
    //   const apiUrl = process.env.NEXT_PUBLIC_API_URL
    //   const token = Cookies.get('jwt')

    //   const updatedAgreementsList = () =>{
    //     const currentForms = user.onboarding
    //     const updatedForms = currentForms.map(frm => {
    //       if( frm.formfile[0].name === pdfFileName){
    //         return {...frm, agreementId: res.data.id, formName: pdfFileName, formFile: pdfFileName }
    //       } else {
    //         return frm
    //       }
    //     })
    //   }

    //   await axios.put(`${apiUrl}/users/${user.id}`,{
    //     onboarding: updatedAgreementsList()
    //   }, {headers: {
    //     "Authorization": `Bearer ${token}`
    //   }})
    //   return res.data.id
    // }).catch(err => {
    //   console.log(err)
    // })
    //   }
    // }else{
    //Creating the Agreement
    console.log('NO Agreements, creating the first one')

    agreementId = await axios
      .post(
        'https://api.na4.adobesign.com/api/rest/v6/agreements',
        {
          fileInfos: [
            {
              transientDocumentId: transientDocumentId
            }
          ],
          name: formfile[0].name,
          participantSetsInfo: [
            {
              memberInfos: [
                {
                  email: user.email
                }
              ],
              order: 1,
              role: 'SIGNER'
            }
          ],
          signatureType: 'ESIGN',
          state: 'IN_PROCESS'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
      .then(async (res) => {
        console.log('AGREEMENT_ID', res.data.id)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const token = Cookies.get('jwt')
        const updatedAgreementsList = [
          ...user.onboarding,
          { agreementId: res.data.id, formName: formfile[0].formFile.name }
        ]
        await axios.put(
          `${apiUrl}/users/${user.id}`,
          {
            onboardingAgreements: updatedAgreementsList
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        return res.data.id
      })
      .catch((err) => {
        console.log(err)
      })
    // }

    //Getting Signing URL to Embed on Iframe
    const signingUrl = await axios
      .get(`https://api.na4.adobesign.com/api/rest/v6/agreements/${agreementId}/signingUrls`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then((res) => {
        console.log('SIGNING_URL', res.data)
        setEmbedUrl(res.data.signingUrlSetInfos[0].signingUrls[0].esignUrl)
        return res.data
      })
      .catch((err) => {
        console.log(err)
      })

    //Getting Widget to Embed on Iframe
    // const signWidget = await axios.post(`https://api.na4.adobesign.com/api/rest/v6/widgets/`, {
    //     "name": "Adobe Sign Widget",
    //     "fileInfos": [
    //       {
    //         "transientDocumentId": transientDocumentId
    //       }
    //     ],
    //     "widgetParticipantSetInfo": {
    //         "memberInfos": [{
    //             "name": "Bruno"
    //         }],
    //     "role": "SIGNER"
    //     },
    //     "state": "ACTIVE"
    //   }, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${accessToken}`
    //   }
    // }).then(res => {
    //   console.log('SIGN_WIDGET_ID', res.data)
    // }).catch(err => {
    //   console.log(err)
    // })
  }

  useEffect(() => {
    connectToAdobeSign()
    // matchFile()
  }, [])

  return (
    <Layout containered toast={{ showToast: false, message: '' }}>
      <h1 className={style.ax_page_title}>Sign Form</h1>
      <div className={style.formInstructions}>
        <h2>Instructions</h2>
        <p>
          1 - <strong>Download</strong> the prefilled PDF, open it in your computer and complete any missing
          information.
        </p>
        <p>
          2 - <strong>Upload</strong> the fullfilled PDF, and after the uploading completion click on the{' '}
          <strong>Save and Continue</strong> button.
        </p>
        <article>Warning: DO NOT change the file name.</article>
        {embedUrl !== null ? (
          <iframe width="1000" height="2800" title="printable" src={embedUrl} type="application/pdf" />
        ) : (
          ''
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps = async (ctx) => {
  const apiURL = process.env.NEXT_PUBLIC_API_URL

  const tokens = nookies.get(ctx)
  const token = tokens.jwt
  const { userId } = tokens

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  if (ctx.req.headers.cookie && token) {
    const user = await axios
      .get(`${apiURL}/users?id=${userId}`, config)
      .then((res) => {
        const me = res.data[0]
        return me
      })
      .catch((err) => {
        throw err
      })

    return {
      props: { user }
    }
  }
  return {
    redirect: {
      destination: '/',
      permanent: false
    }
  }
}

export default Sign
