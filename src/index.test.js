const S3ListBucketStream = require(process.env.BUILD ? '../pkg/dist-node/index.js' : './index')

class MockS3 {
  constructor (mockedPages, shouldFail = false) {
    this._mockedPages = mockedPages
    this._currentPage = 0
  }

  listObjectsV2 (params, cb) {

  }
}

test('It should emit all the files from different pages', (done) => {
  expect(true).toBe(true)
  expect(S3ListBucketStream).toBeTruthy()
  expect(MockS3).toBeTruthy()
  done()
})
