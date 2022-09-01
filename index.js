const NeDB = require('nedb');
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports.templateTags = [
  {
    name: 'getdevicesecret',
    displayName: 'Get Device Secret',
    description: 'reference device secret from current request',
    args: [],

    async run(context, attribute, name, folderIndex) {
      const { meta } = context;

      if (!meta.requestId || !meta.workspaceId) {
        return null;
      }

      const request = await context.util.models.request.getById(meta.requestId);

      if (!request) {
        throw new Error(`Request not found for ${meta.requestId}`);
      }

      const oauth2Token = await context.util.models.oAuth2Token.getByRequestId(request._id);
      if (!oauth2Token) {
        throw new Error('No OAuth 2.0 tokens found for request');
      }

      // xResponseId is the response id for the OAUTH request, not the current insomnia request
      const responseId = oauth2Token.xResponseId;
      if (!responseId) {
        throw new Error('No response id for OAuth 2.0 token!');
      }

      /**
       * HACK!
       *
       * it would be great if we could just use context.util.models.response.getById,
       * but it's not exposed by Insomnia's base extension.
       *
       * we also can't build electron apps on athena's hardware 😤, so we can't modify Insomnia itself.
       *
       * instead, just load up the nedb Response db, find the record we're interested in, and open the
       * corresponding response file (which has the device_secret)
       */
      const db = new NeDB({
        autoload: true,
        filename: path.join(getAppDataDir('Insomnia'), 'insomnia.Response.db'),
      });

      const response = await new Promise((resolve, reject) => {
        db
          .find({
            _id: responseId
          })
          .exec((err, rawDocs) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(rawDocs[0]);
          });
      });

      // bodyPath is the filename of the response file, which has the
      // JSON response of the OAUTH request
      const body = JSON.parse(fs.readFileSync(response.bodyPath));

      return body['device_secret'];
    },
  },
];

function getAppDataDir(app) {
  switch (process.platform) {
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', app);

    case 'win32':
      return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), app);

    case 'linux':
      return path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.config'), app);

    default:
      return '';
  }
}
