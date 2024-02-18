FROM oven/bun as install

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun i --frozen-lockfile

# build the app
FROM node:20-alpine

ENV DATABASE_URL="file:./data.db"
ENV PORT=3000
ENV JWT_SECRET="verylongandsecuresecret"

WORKDIR /app

COPY --from=install /app/node_modules node_modules

RUN apk add --no-cache ca-certificates fuse3 sqlite openssl

COPY . .

RUN npx prisma generate && npx prisma migrate deploy

EXPOSE 3000
CMD [ "npm", "start" ]