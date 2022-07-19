# BUILD CLIENT
FROM node:16.3.0-alpine as build-stage

WORKDIR /app
COPY ./package*.json ./
COPY ./yarn.lock ./
WORKDIR /app/packages/client
COPY ./packages/client/ ./
WORKDIR /app
RUN yarn install

ENV REACT_APP_FRONTEND_URL=cast.fyi
ENV NODE_ENV=production
ENV APP_ENV=production
RUN yarn build

# DEPLOY CLIENT
FROM nginx:latest as production-stage
WORKDIR /app
COPY --from=build-stage /app/packages/client/build /app
COPY ./deploy/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
RUN ls -la /app