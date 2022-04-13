
# BUILD BIN

FROM golang:1.17.7 as vt-init
# Install go modules
WORKDIR /flow-voting-tool
COPY ./go.mod ./
ADD ./main ./main
RUN go mod tidy
RUN go mod download

FROM vt-init as vt-build
WORKDIR /flow-voting-tool
RUN CGO_ENABLED=0 go build -o flow-voting-tool-server ./main


#RUN BUN

FROM alpine:latest
ENV CWD "/flow-voting-tool/"
ENV SNAPSHOT_BASE_URL "https://snapshot.brud.dev"
RUN apk --no-cache add ca-certificates
COPY --from=vt-build /flow-voting-tool /flow-voting-tool
ENTRYPOINT /flow-voting-tool/flow-voting-tool-server --port 5001

