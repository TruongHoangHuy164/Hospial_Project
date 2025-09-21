# Hospital Backend (Node.js, no MVC)

Simple Express server with minimal structure.

## Scripts

- `npm run dev` – start with nodemon on `http://localhost:5000`
- `npm start` – start with Node

## Setup

1. Copy `.env.example` to `.env` and adjust as needed
2. Install dependencies

```
npm install
```

3. Run

```
npm run dev
```

## MongoDB

Set `MONGODB_URI` in `.env`, e.g.:

```
MONGODB_URI=mongodb://127.0.0.1:27017/hospital_demo
```

Start local MongoDB (example, if you have MongoDB installed):

```
mongod --dbpath "C:\\data\\db"
```

Health check will include DB status at `GET /health`:

```
{
	"status": "up",
	"db": "connected"
}
```

## Endpoints

- `GET /` – base info
- `GET /health` – health check