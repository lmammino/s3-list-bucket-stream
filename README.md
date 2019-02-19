# s3-list-bucket-stream
Node.js stream library that allows you to stream a list of objects from an S3 bucket

## Example

```javascript
const S3ListBucketStream = require('s3-list-bucket-stream')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const listBucketStream = new S3ListBucketStream(s3, 'some-bucket', 'path/to/files')

listBucketStream
  .pipe(process.stdout)
```
