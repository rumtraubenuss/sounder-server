const aws = require('aws-sdk')
const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
const Slack = require('slack-node');
const bodyParser = require('body-parser');

const db = require('./database');

const {
  SLACK_API_TOKEN,
  S3_SECRET_ACCESS_KEY,
  S3_ACCESS_KEY_ID,
} = process.env;

const slack = new Slack(SLACK_API_TOKEN);

const s3 = new aws.S3({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: 'eu-central-1',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'sounder-assets/sounds',
    acl: 'public-read',
    contentType: (req, file, cb) => {
      cb(null, req.body.fileType);
    },
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      db.add(req.body).then(res => {
        const key = String(res.insertedIds[0]);
        cb(null, key)
      });
    }
  })
})

const port = process.env.PORT || 4000;
const app = express();

app.use(bodyParser.raw({ type: 'text/plain' }));

app.post('/upload', upload.single('file'), function(req, res, next) {
  res.send('Successfully uploaded file!')
  slack.api('chat.postMessage', {
    text:'Uploaded file.',
    channel:'#sounder'
  }, function(err, response){
    console.log(response);
  });
})

app.listen(port)

console.log(`Listening on port ${port}`);
