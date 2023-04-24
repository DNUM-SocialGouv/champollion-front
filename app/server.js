import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const directory = "/" + (process.env.STATIC_DIR || "dist")

// Serve static assets
app.use(express.static(path.join(__dirname, directory)))

// Serve the React app's index.html file for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, directory, "index.html"))
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
