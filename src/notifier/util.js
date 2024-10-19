import timeoutSignal from 'timeout-signal'

function doGet(url, data) {
  const params = new URLSearchParams(data)

  return fetch(`${url}?${params.toString()}`, {
    signal: timeoutSignal(10000)
  }).then((res) => res.json())
}

function doPost(url, data, type = 'json') {
  let cType, body

  if (type == 'json') {
    cType = 'application/json'
    body = JSON.stringify(data)
  } else {
    const params = new URLSearchParams(data)

    cType = 'application/x-www-form-urlencoded'
    body = params.toString()
  }

  return fetch(url, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': cType
    },
    signal: timeoutSignal(10000)
  }).then((res) => res.json())
}

export { doGet, doPost }
