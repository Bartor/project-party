FROM golang:1.13

WORKDIR /go/src/app

# download packages first for caching reasons
COPY src/main/go.mod src/main/go.sum ./
RUN go mod download

COPY src/main .
RUN go build -o app

CMD ["./app"]