const formName = (f) => {
  let num = parseInt(f)
  switch (num) {
    case 1:
      return { slug: 'broker-information', title: 'Broker Information', order: '1' }
    case 1:
      return { slug: 'unlicensed-information', title: 'Information', order: '1' }
    case 2:
      return { slug: 'photos', title: 'Photos', order: '2' }
    case 3:
      return { slug: 'business-card', title: 'Business Card', order: '3' }
    case 4:
      return { slug: 'website-information', title: 'Website Information', order: '4' }
    case 5:
      return { slug: 'mpc-application', title: 'MPC Application', order: '5' }
    case 6:
      return { slug: 'letter-of-direction', title: 'Letter Of Direction', order: '6' }
    case 7:
      return { slug: 'payment-authorization', title: 'Payroll Information', order: '7' }
    case 8:
      return { slug: 'contract', title: 'Contract And Schedule', order: '8' }
    case 9:
      return { slug: 'policies', title: 'Policies And Procedure', order: '9' }
    case 10:
      return { slug: 'unlicensed-policies', title: 'Unlicensed Policies', order: '10' }
    default:
      return { slug: 'broker-information', title: 'Broker Information', order: '1' }
  }
}

export const getNextPrevForm = (itemNum, menuOrderItems) => {
  const order = menuOrderItems
  const numbers = order.map((n) => n.order)

  const diffs = numbers.map((n) => {
    return { item: n, diff: Math.abs(n - itemNum) }
  })

  const next = () => {
    const options = diffs.filter((n) => n.item !== itemNum && parseInt(n.item) > itemNum)
    if (options.length === 1) {
      return options[0]
    }
    if (options.length === 0) {
      return { item: '1', diff: 0 }
    }

    let min
    const optionsDiffs = options.map((o) => o.diff)
    const max = Math.max(...optionsDiffs)

    if (itemNum !== max) {
      const minDiff = Math.min(...optionsDiffs)
      min = options.filter((o) => parseInt(o.diff) === parseInt(minDiff))
      return min[0]
    } else {
      min = { item: '1', diff: 0 }
      return min
    }
  }

  const prev = () => {
    let min
    const options = diffs.filter((n) => n.item !== itemNum && parseInt(n.item) < itemNum)
    if (options.length === 1) {
      return options[0]
    }
    if (options.length === 0) {
      return { item: '1', diff: 0 }
    }

    if (itemNum !== 1) {
      const optionsDiffs = options.map((o) => o.diff)
      const minDiff = Math.min(...optionsDiffs)
      min = options.filter((o) => parseInt(o.diff) === parseInt(minDiff))
      return min[0]
    } else {
      min = { item: '1', diff: 0 }
      return min
    }
  }

  const nextItem = () => formName(next().item).slug
  const prevItem = () => formName(prev().item).slug

  return { next: nextItem(), prev: prevItem() }
}

export const handleNextPrev = (page, menuOrderItems, user) => {
  const npLinks = (l) => getNextPrevForm(l, menuOrderItems)

  switch (page) {
    case 'broker-information':
      return { prev: npLinks(1).prev, next: npLinks(1).next }
    case 'unlicensed-information':
      return { prev: npLinks(1).prev, next: npLinks(1).next }
    case 'photos':
      return { prev: npLinks(2).prev, next: npLinks(2).next }
    case 'business-card':
      return { prev: npLinks(3).prev, next: npLinks(3).next }
    case 'website-information':
      return { prev: npLinks(4).prev, next: npLinks(4).next }
    case 'mpc-application':
      return { prev: npLinks(5).prev, next: npLinks(5).next }
    case 'letter-of-direction':
      return { prev: npLinks(6).prev, next: npLinks(6).next }
    case 'payment-authorization':
      return { prev: npLinks(7).prev, next: npLinks(7).next }
    case 'contract':
      return { prev: npLinks(8).prev, next: npLinks(8).next }
    case 'policies':
      return { prev: npLinks(9).prev, next: npLinks(9).next }
    case 'unlicensedPolicies':
      return { prev: npLinks(10).prev, next: npLinks(10).next }
    default:
      return user && user.licensed && user.licensed === false
        ? { prev: 'unlicensed-information', next: 'unlicensed-information' }
        : { prev: 'broker-information', next: 'broker-information' }
  }
}
