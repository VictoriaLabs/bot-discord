FROM oven/bun:1.0.23

WORKDIR /usr/src/app

COPY ../src ./

RUN bun install

ENTRYPOINT [ "bun", "run", "src/app.ts"]