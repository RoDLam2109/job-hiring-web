# Persistent uploads on Render

Company logos now use Cloudinary; follow [CLOUDINARY-SETUP.md](CLOUDINARY-SETUP.md)
for the selected free-storage setup. The disk configuration below is optional
for other files such as resumes; company logo uploads no longer use this disk.

Render requires a paid web service to attach a persistent disk:
https://render.com/docs/disks

## Dashboard configuration

1. Open the backend web service `job-hiring-web` in Render.
2. On its **Disks** page, add a disk named `uploads`, mount path `/var/data`,
   and choose a capacity appropriate for your files (for example 1 GB).
3. Under **Environment**, add `UPLOAD_DIRECTORY=/var/data/images`.
4. Deploy the backend containing these code changes and the environment variable.

The disk and environment variable must both be configured. Setting a directory
alone does not make storage persistent. Disk attachment and paid-plan selection
must be performed by the account owner; these changes are not made by this repo.

## Paths and compatibility

- Legacy company files, if restored manually: `/var/data/images/company/<filename>`.
- Resumes: `/var/data/images/resume/<filename>`.
- Public URLs stay `/images/company/<filename>` and `/images/resume/<filename>`.
- MongoDB continues storing the filename. No frontend changes are required.
- Files bundled in `src/public/images` remain available as a fallback.
- Without `UPLOAD_DIRECTORY`, local development uses `src/public/images`.
- `UPLOAD_DIRECTORY` must be an absolute path, and is the images directory,
  not the company directory. The application creates subfolders on upload.

Do not add a build-time copy to the disk: Render mounts it only at runtime.
Files already lost from the old ephemeral filesystem must be uploaded again
through the company editor, then saved with **Update**. If old files still
exist, back them up before the redeploy and restore them under the matching
company/resume folder on the disk, keeping their filenames.

## Verification after deployment

1. Upload a resume using the application form.
2. Open `https://job-hiring-web.onrender.com/images/resume/<returned-filename>`.
3. Confirm the file exists in `/var/data/images/resume` using Render Shell.
4. Restart the Render service, then open the same URL again; it must return 200.

Automated local tests exercise an external upload directory and reopening the
application against the same directory. Only this live restart check verifies
that the actual Render disk is mounted correctly.
