- `cd aussprachetrainer`
- `docker system prune --volumes` (and manually remove all volumes: `docker volume rm <volume_name>` (first `docker volume ls`)) in order to have changes to the static files and images take effect
- add `fontawesomefree` folder to `static` folder (maybe not)
- add images 
- `python manage.py migrate`  (maybe not)
- `python manage.py collectstatic` (maybe not)
- `python manage.py compilemessages` (maybe not)
- `docker-compose up --build` (maybe install docker first)