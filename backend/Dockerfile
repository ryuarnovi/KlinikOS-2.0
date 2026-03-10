# Build stage -- gunakan golang:1.24-alpine yang sudah tersedia di cache
FROM golang:1.24-alpine AS builder

# Izinkan download toolchain 1.25 jika dibutuhkan go.mod
ENV GOTOOLCHAIN=auto

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

# Final stage -- reuse image yang sama, tidak perlu pull ulang
FROM golang:1.24-alpine

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 9090

CMD ["./main"]
