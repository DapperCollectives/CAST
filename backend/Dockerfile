
# BUILD BIN

FROM golang:1.18.4 as vt-init
# Install go modules

WORKDIR /flow-voting-tool
COPY ./go.mod ./
ADD ./main ./main
RUN go mod tidy
RUN go mod download
COPY flow.json ./

FROM vt-init as vt-build
WORKDIR /flow-voting-tool
RUN CGO_ENABLED=0 go build -o flow-voting-tool-server ./main


#RUN BUN

FROM alpine:latest
ENV CWD "/flow-voting-tool/"
ENV SNAPSHOT_BASE_URL "http://snapshot-flow-balances-svc.cast.svc.cluster.local:8008"
ENV TX_OPTIONS_ADDRS "0xe0de919ed4ebeee4 0x7f81b82fa0e59b17"
RUN apk --no-cache add ca-certificates
COPY --from=vt-build /flow-voting-tool /flow-voting-tool
COPY flow.json /flow-voting-tool/flow.json
ENTRYPOINT /flow-voting-tool/flow-voting-tool-server --port 5001

