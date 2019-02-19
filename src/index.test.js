const S3ListBucketStream = require(process.env.BUILD
  ? '../pkg/dist-node/'
  : './')

class MockS3 {
  constructor (mockedPages, shouldFail = false) {
    this._mockedPages = mockedPages
    this._currentPage = 0
    this._shouldFail = shouldFail
    this._receivedParams = []
  }

  listObjectsV2 (params, cb) {
    this._receivedParams.push(params)
    process.nextTick(() => {
      const error = this._shouldFail ? new Error('some error') : null
      const response = this._shouldFail
        ? null
        : this._mockedPages[this._currentPage++]
      cb(error, response)
    })
  }
}

const createPage = (numItems, startCount = 0, last = false) => {
  const items = []
  for (let i = 0; i < numItems; i++) {
    items.push({
      ETag: `etag-${i + startCount}`,
      Key: `${i + startCount}.jpg`,
      LastModified: '2019-02-19T19:35:20.892Z',
      Size: (i + startCount) * 100,
      StorageClass: 'STANDARD'
    })
  }

  return {
    Contents: items,
    IsTruncated: !last,
    KeyCount: numItems,
    MaxKeys: numItems,
    Name: 'examplebucket',
    NextContinuationToken: last ? undefined : `token-${numItems + startCount}`,
    Prefix: ''
  }
}

test('It should emit all the files from different pages', done => {
  const s3 = new MockS3([
    createPage(2),
    createPage(2, 2),
    createPage(2, 4, true)
  ])

  const records = []
  let numPages = 0
  const stream = new S3ListBucketStream(s3, 'some-bucket', '/some/prefix')
  stream.on('data', item => records.push(item))
  stream.on('error', done.fail)
  stream.on('page', () => numPages++)
  stream.on('end', () => {
    const continuationTokens = s3._receivedParams.map(
      item => item.ContinuationToken
    )

    expect(records).toMatchSnapshot()
    expect(numPages).toBe(3)
    expect(continuationTokens).toMatchSnapshot()
    done()
  })
})

test('It should emit an error if it fails to make the API call to AWS', done => {
  const s3 = new MockS3([], true)
  const records = []
  const stream = new S3ListBucketStream(s3, 'some-bucket', '/some/prefix')
  stream.on('data', item => records.push(item))
  stream.on('error', err => {
    expect(records).toEqual([])
    expect(err.message).toEqual('some error')
    done()
  })
})

test('The stream should pause if reader buffer is full', done => {
  const s3 = new MockS3([
    createPage(2),
    createPage(2, 2),
    createPage(2, 4, true)
  ])
  const stream = new S3ListBucketStream(s3, 'some-bucket', '/some/prefix', {
    maxKeys: 2
  })

  let pushes = 0
  const originalPushFn = stream.push.bind(stream)
  stream.push = function push (data) {
    originalPushFn(data)
    pushes++
    return pushes > 1 // pauses (return false) only the first time
  }

  const records = []
  let emittedStopped = false
  let emittedRestarted = false
  stream.on('data', item => records.push(item))
  stream.on('stopped', () => (emittedStopped = true))
  stream.on('restarted', () => (emittedRestarted = true))
  stream.on('error', done.fail)
  stream.on('end', () => {
    expect(records).toMatchSnapshot()
    expect(emittedStopped).toBe(true)
    expect(emittedRestarted).toBe(true)
    done()
  })
})
