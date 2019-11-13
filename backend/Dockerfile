FROM golang:1.13

WORKDIR /go/src/app

# download packages first for caching reasons
COPY src/go.mod src/go.sum ./
RUN go mod download

COPY src .
RUN go build -o app

CMD ["./app"]