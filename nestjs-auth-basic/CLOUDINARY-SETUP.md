# Company logos on Cloudinary

Company logos are uploaded from backend memory to Cloudinary. MongoDB stores the
HTTPS URL in the existing `logo` field. All company-logo views support both this
URL and old filenames. No persistent disk is required for company logos.

## Account and environment

1. Create a Cloudinary Free account: https://cloudinary.com/users/register_free
2. In Cloudinary Console, open Settings > API Keys and obtain the cloud name,
   API key and API secret. See https://cloudinary.com/documentation/node_integration.
3. In Render, open the backend `job-hiring-web` > Environment and add:

   ```dotenv
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Save the variables and deploy the updated backend. Deploy the updated frontend
   on Vercel too: it must recognize complete Cloudinary URLs before new logos are saved.
5. If following the earlier disk instructions, remove `UPLOAD_DIRECTORY` unless
   you actually use a persistent disk for other uploads. Cloudinary company uploads
   do not require this variable. Do not create a paid disk for this setup.

For local development, add the same three variables to `nestjs-auth-basic/.env`.
Never commit real credentials or put the API secret in a `VITE_*` variable.
No unsigned upload preset is needed; uploads are signed by the backend SDK.

## Verify

1. Log in as admin, edit a company, upload a JPG/PNG under 2 MB, and click Update.
2. Confirm the asset appears in Cloudinary under `workly/company` and the API returns
   a `fileName` containing an HTTPS `res.cloudinary.com` URL.
3. Reload both admin and public company/job views to check the saved logo.
4. Restart Render and check the same image still loads.

Missing credentials return 503 with a configuration message. Cloudinary/network
failures return 502. No fallback writes the company logo to Render's temporary disk.
Local tests mock Cloudinary; an actual upload requires your account configuration.

## Existing data and scope

- Old source-bundled logos keep working through `/images/company/<filename>`.
- Logos previously lost on Render must be uploaded again and saved in the editor.
- Upload requires a logged-in account. Both the admin editor and resume form
  already send the access token via the shared Axios client.
- Resume/CV files still use the existing disk storage. This change only migrates
  company logos; CV uploads on Render Free are still subject to ephemeral storage.
- Replacing a logo does not delete the previous Cloudinary asset automatically.
  Unused assets can be removed manually in Cloudinary after checking they are no
  longer referenced. Cancelled company edits can also leave an unused upload.
