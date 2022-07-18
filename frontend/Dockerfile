# BUILD CLIENT
FROM node:14-alpine as build-stage

WORKDIR /app/packages/client
COPY ./packages/client/package*.json ./
RUN npm install
COPY ./packages/client/ ./

ENV NODE_ENV=production

ENV REACT_APP_FRONTEND_URL=cast.fyi

RUN npm run build

# DEPLOY CLIENT
FROM nginx:latest as production-stage
WORKDIR /app
COPY --from=build-stage /app/packages/client/build /app
COPY ./deploy/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
RUN ls -la /app