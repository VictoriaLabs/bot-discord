run:
	docker-compose up -d

stop:
	docker stop bot-discord-app-1

build:
	docker-compose down
	cd src && npx tsc
	docker-compose up -d