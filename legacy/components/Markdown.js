import { useRef, useState, useEffect } from 'react'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt('commonmark')

const Markdown = (props) => {
  const { children, brokerName } = props
  const [bodyText, setBodyText] = useState('')
  const fullText = useRef()
  const mdToHtml = md.render(children)

  const replaceVars = () => {
    // const bodyParagraphs = fullText.current.querySelectorAll('p')
    // const bodyStrongs = fullText.current.querySelectorAll('strong')
    // const bodyH1 = fullText.current.querySelectorAll('h1')
    // const bodyH2 = fullText.current.querySelectorAll('h2')
    // const bodyH3 = fullText.current.querySelectorAll('h3')
    // const bodyH4 = fullText.current.querySelectorAll('h4')
    // const bodyH5 = fullText.current.querySelectorAll('h5')
    // const bodyLi = fullText.current.querySelectorAll('Li')
    // const bodyParagraphsArr = Array.from(bodyParagraphs)
    // const bodyStrongsArr = Array.from(bodyStrongs)
    // const bodyH1Arr = Array.from(bodyH1)
    // const bodyH2Arr = Array.from(bodyH2)
    // const bodyH3Arr = Array.from(bodyH3)
    // const bodyH4Arr = Array.from(bodyH4)
    // const bodyH5Arr = Array.from(bodyH5)
    // const bodyLiArr = Array.from(bodyLi)

    // const textBodyArr = [...bodyParagraphsArr, ...bodyStrongsArr, ...bodyH1Arr, ...bodyH2Arr, ...bodyH3Arr, ...bodyH4Arr, ...bodyH5Arr, ...bodyLiArr]

    // textBodyArr.forEach(t => {
    //    t.innerText = t.innerText.replace('${brokerName}', brokerName)
    // })

    const fullText = mdToHtml.replace('${brokerName}', brokerName)
    return fullText
  }

  useEffect(() => {
    const finalText = replaceVars()
    setBodyText(finalText)
  }, [])

  // eslint-disable-next-line react/no-danger
  return <div ref={fullText} dangerouslySetInnerHTML={{ __html: bodyText }} />
}

export default Markdown
