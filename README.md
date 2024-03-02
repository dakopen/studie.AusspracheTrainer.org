# AusspracheTrainer.org

## Activate the venv and go to the right directory
`venv\Scripts\activate.ps1`
`cd aussprachetrainer`

## run tests:
`python manage.py test``

## Installing on a new machine
1. add .env with the following contents:
`AZURE_CLIENT_ID=...`, `AZURE_CLIENT_SECRET=...`, `AZURE_TENANT_ID=...`, `AZURE_KEYVAULT_URL=...`.

You get these secrets from Azure.



## Renewing the GitHub Token
https://github.com/Azure/actions-workflow-samples/blob/master/assets/create-secrets-for-GitHub-workflows.md#set-secret-with-azure-credentials

**Set the --years flag to 1 or higher in order to now have to renew them every 30 days.**

## Codespaces:
`python -m venv venv` (creates virtual environment "venv")
`source venv/bin/activate` (activates the env)
`pip install -r aussprachetrainer/requirements.txt`
create `.env` file and fill with secrets
`cd aussprachetrainer`
`python manage.py test` (should work)

`sudo apt-get update`
`sudo apt install redis-server`
`sudo apt install ffmpeg`

`python manage.py makemigrations`
`cd ..`
`./start_project.sh` (should work now)