# BUILD CLIENT
FROM node:14-alpine as build-stage

WORKDIR /app/packages/client
COPY ./packages/client/package*.json ./
RUN npm install
COPY ./packages/client/ ./

ENV NODE_ENV "production"
ENV REACT_APP_BACK_END_SERVER_API "https://api.cast.fyi"
ENV REACT_APP_IPFS_GATEWAY "https://gateway.pinata.cloud/ipfs/"
ENV REACT_APP_FLOW_ENV "mainnet"
ENV REACT_APP_TX_OPTIONS_ADDRS "0xe0de919ed4ebeee4,0x7f81b82fa0e59b17"

RUN npm run build

# DEPLOY CLIENT
FROM nginx:latest as production-stage
WORKDIR /app
COPY --from=build-stage /app/packages/client/build /app
COPY ./deploy/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
RUN ls -la /app
