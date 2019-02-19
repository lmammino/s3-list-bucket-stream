const { Readable } = require('readable-stream')

class S3ListBucketStream extends Readable {
  constructor (s3, bucket, bucketPrefix, options = { objectMode: true }) {
    super(options)
    this._s3 = s3
    this._bucket = bucket
    this._bucketPrefix = bucketPrefix
    this._lastResponse = undefined
    this._currentIndex = undefined
    this._stopped = true
  }

  _loadNextPage () {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: this._bucket,
        Prefix: this._bucketPrefix,
        ContinuationToken: this._lastResponse ? this._lastResponse.NextContinuationToken : undefined,
        MaxKeys: 1000
      }

      this._s3.listObjectsV2(params, (err, data) => {
        if (err) {
          return reject(err)
        }

        this._lastResponse = data
        this._currentIndex = 0

        this.emit('page', { params, data })
        return resolve()
      })
    })
  }

  async _startRead () {
    try {
      this._stopped = false
      this.emit('restarted', true)
      while (true) {
        if (typeof this._lastResponse === 'undefined' || this._currentIndex >= this._lastResponse.Contents.length) {
          if (this._lastResponse && !this._lastResponse.IsTruncated) {
            return this.push(null) // stream is over
          }
          await this._loadNextPage()
        }

        if (!this.push(this._lastResponse.Contents[this._currentIndex++])) {
          this._stopped = true
          this.emit('stopped', true)
          break // buffer full, stop until next _read call
        }
      }
    } catch (err) {
      return this.emit('error', err)
    }
  }

  _read (size) {
    if (this._stopped) {
      this._startRead()
    }
  }
}

module.exports = S3ListBucketStream
