FROM golang:1.13

WORKDIR /go/src/app

# download packages first for caching reasons
COPY src/projectparty/go.mod src/projectparty/go.sum ./
RUN go mod download

COPY src/projectparty .
RUN go build -o app

CMD ["./app"]